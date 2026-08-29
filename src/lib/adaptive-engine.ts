import { prisma } from "./prisma";

export interface ReadinessCheck {
  isReady: boolean;
  currentLevel: number;
  nextLevel: number;
  reasons: string[];
  recommendations: string[];
}

export async function updateUserStatsAfterSubmission(params: {
  userId: string;
  questionId: string;
  isAccepted: boolean;
  timeTakenSec: number;
  hintsUsedCount: number;
  solutionViewed: boolean;
  mistakeCategories: string[];
}) {
  const { userId, questionId, isAccepted, timeTakenSec, mistakeCategories } = params;

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Fetch user and question
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { topic: true },
  });

  if (!user || !question) return;

  // 2. Update DailyActivity
  const daily = await prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date: todayStr } },
    update: {
      questionsAttempted: { increment: 1 },
      questionsSolved: isAccepted ? { increment: 1 } : undefined,
      totalTimeSec: { increment: timeTakenSec },
    },
    create: {
      userId,
      date: todayStr,
      questionsAttempted: 1,
      questionsSolved: isAccepted ? 1 : 0,
      totalTimeSec: timeTakenSec,
      accuracy: isAccepted ? 100 : 0,
    },
  });

  // Recalculate daily accuracy
  if (daily.questionsAttempted > 0) {
    await prisma.dailyActivity.update({
      where: { id: daily.id },
      data: {
        accuracy: (daily.questionsSolved / daily.questionsAttempted) * 100,
      },
    });
  }

  // 3. Update Streak
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toISOString().split("T")[0] : null;
  let newStreak = user.currentStreak;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (!lastActive || user.currentStreak === 0) {
    newStreak = 1;
  } else if (lastActive === yesterday) {
    newStreak += 1;
  } else if (lastActive !== todayStr) {
    newStreak = 1;
  }

  // 4. Update overall User metrics
  const totalSubmissions = await prisma.submission.count({ where: { userId } });
  const acceptedSubmissions = await prisma.submission.count({
    where: { userId, status: "ACCEPTED" },
  });

  // Unique questions solved
  const uniqueSolved = await prisma.submission.groupBy({
    by: ["questionId"],
    where: { userId, status: "ACCEPTED" },
  });

  const newAccuracy = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalSolved: uniqueSolved.length,
      totalAttempted: totalSubmissions,
      accuracy: Math.round(newAccuracy * 10) / 10,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveDate: new Date(),
    },
  });

  // 5. Update Topic Mastery
  const topicId = question.topicId;
  const topicQuestions = await prisma.question.count({ where: { topicId } });
  const userSolvedInTopic = await prisma.submission.groupBy({
    by: ["questionId"],
    where: { userId, question: { topicId }, status: "ACCEPTED" },
  });

  const topicSubmissions = await prisma.submission.findMany({
    where: { userId, question: { topicId } },
  });

  const topicAccepted = topicSubmissions.filter((s) => s.status === "ACCEPTED").length;
  const topicAccuracy = topicSubmissions.length > 0 ? (topicAccepted / topicSubmissions.length) * 100 : 0;

  // Mastery score formula: 60% weight on solve count completion, 40% weight on accuracy
  const completionRatio = topicQuestions > 0 ? userSolvedInTopic.length / topicQuestions : 0;
  const masteryScore = Math.min(100, Math.round(completionRatio * 60 + (topicAccuracy / 100) * 40));

  await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: {
      questionsSolved: userSolvedInTopic.length,
      questionsTotal: topicQuestions,
      masteryScore,
    },
    create: {
      userId,
      topicId,
      questionsSolved: userSolvedInTopic.length,
      questionsTotal: topicQuestions,
      masteryScore,
      isUnlocked: true,
    },
  });

  // 6. Record Mistakes
  for (const cat of mistakeCategories) {
    await prisma.mistakeRecord.create({
      data: {
        userId,
        questionId,
        category: cat,
        errorExplanation: `Mistake detected during attempt on ${question.title}`,
      },
    });
  }
}

export async function evaluateLevelUpReadiness(userId: string): Promise<ReadinessCheck> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      topicProgress: { include: { topic: true } },
      mistakes: true,
    },
  });

  if (!user) {
    return {
      isReady: false,
      currentLevel: 0,
      nextLevel: 1,
      reasons: ["User not found"],
      recommendations: ["Start practicing Level 0 questions."],
    };
  }

  const currentLevel = user.currentLevel;
  const nextLevel = currentLevel + 1;

  // Find all topics at the user's current level
  const currentLevelTopics = user.topicProgress.filter((tp) => tp.topic.level === currentLevel);

  const reasons: string[] = [];
  const recommendations: string[] = [];

  if (currentLevelTopics.length === 0) {
    return {
      isReady: false,
      currentLevel,
      nextLevel,
      reasons: ["No completed topics in current level"],
      recommendations: ["Solve questions in current level topics."],
    };
  }

  let allMastered = true;
  for (const tp of currentLevelTopics) {
    if (tp.masteryScore < 65) {
      allMastered = false;
      reasons.push(`${tp.topic.name} mastery is only ${tp.masteryScore}% (requires >= 65%).`);
      recommendations.push(`Solve 2 more questions in ${tp.topic.name} to improve accuracy.`);
    }
  }

  // Check recent unresolved mistakes
  const recentMistakes = user.mistakes.filter((m) => !m.resolved);
  if (recentMistakes.length >= 5) {
    allMastered = false;
    reasons.push(`You have ${recentMistakes.length} recurring mistakes (e.g. array indexing/loop bounds).`);
    recommendations.push("Revise weak areas before advancing to the next level.");
  }

  if (allMastered) {
    return {
      isReady: true,
      currentLevel,
      nextLevel,
      reasons: ["All topics in current level have achieved required mastery score!"],
      recommendations: [`Ready to level up to Level ${nextLevel}! Unlock new DSA topics.`],
    };
  }

  return {
    isReady: false,
    currentLevel,
    nextLevel,
    reasons,
    recommendations,
  };
}
