import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateLevelUpReadiness } from "@/lib/adaptive-engine";
import { CURATED_QUESTIONS, TOPIC_MAP } from "@/lib/curated-questions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let user = await prisma.user.findFirst({
      include: {
        topicProgress: { include: { topic: true } },
        mistakes: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { question: true },
        },
        dailyActivities: {
          take: 7,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "learner@javatrainer.dev",
          name: "Java Placement Aspirant",
        },
        include: {
          topicProgress: { include: { topic: true } },
          mistakes: { include: { question: true } },
          dailyActivities: true,
        },
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayActivity = user.dailyActivities.find((d) => d.date === todayStr);

    // Group mistakes by category
    const mistakeCounts: Record<string, number> = {};
    const allMistakes = await prisma.mistakeRecord.findMany({
      where: { userId: user.id },
    });
    for (const m of allMistakes) {
      mistakeCounts[m.category] = (mistakeCounts[m.category] || 0) + 1;
    }

    const weakAreas = Object.entries(mistakeCounts)
      .map(([category, count]) => ({
        category,
        count,
        label: formatCategoryLabel(category),
      }))
      .sort((a, b) => b.count - a.count);

    // Level-up readiness
    const readiness = await evaluateLevelUpReadiness(user.id);

    // Next recommended questions (adaptive)
    // If weak areas exist, recommend questions testing that topic; otherwise next unsolved
    const solvedSubmissions = await prisma.submission.findMany({
      where: { userId: user.id, status: "ACCEPTED" },
      select: { questionId: true },
    });
    const solvedIds = new Set(solvedSubmissions.map((s) => s.questionId));

    let allQuestions: any[] = [];
    try {
      allQuestions = await prisma.question.findMany({
        orderBy: [{ level: "asc" }, { orderIndex: "asc" }],
        include: { topic: true },
      });
    } catch (dbErr) {
      console.warn("DB query for stats questions failed:", dbErr);
    }

    if (!allQuestions || allQuestions.length === 0) {
      allQuestions = CURATED_QUESTIONS.map((q) => ({
        ...q,
        topic: TOPIC_MAP.get(q.topicId) || { name: "General", slug: "general" },
      }));
    }

    const recommendedQuestions = allQuestions
      .filter((q) => !solvedIds.has(q.id))
      .slice(0, 3);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayAccepted = await prisma.submission.groupBy({
      by: ["questionId"],
      where: {
        userId: user.id,
        status: "ACCEPTED",
        createdAt: { gte: startOfToday },
      },
    });
    const solvedToday = todayAccepted.length;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        currentLevel: user.currentLevel,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalSolved: user.totalSolved,
        totalAttempted: user.totalAttempted,
        accuracy: user.accuracy,
        dailyGoal: user.dailyGoal,
        solvedToday: solvedToday,
        attemptedToday: todayActivity ? todayActivity.questionsAttempted : 0,
      },
      topicProgress: user.topicProgress.map((tp) => ({
        id: tp.id,
        topicId: tp.topicId,
        name: tp.topic.name,
        slug: tp.topic.slug,
        level: tp.topic.level,
        masteryScore: tp.masteryScore,
        questionsSolved: tp.questionsSolved,
        questionsTotal: tp.questionsTotal,
        isUnlocked: tp.isUnlocked,
      })),
      weakAreas,
      readiness,
      recommendedQuestions,
      recentMistakes: user.mistakes,
    });
  } catch (error: any) {
    console.error("User Stats API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user statistics." },
      { status: 500 }
    );
  }
}

function formatCategoryLabel(cat: string): string {
  switch (cat) {
    case "ARRAY_BOUNDS":
      return "Array boundary / Indexing (i <= length)";
    case "STRING_CHAR_CONFUSION":
      return "char vs String confusion ('' vs \"\")";
    case "LOOP_INCREMENT":
      return "Loop increment / Termination condition";
    case "DIGIT_EXTRACTION":
      return "Digit extraction / Reduction (% 10 vs / 10)";
    case "STRING_EQUALITY":
      return "String comparison (.equals vs ==)";
    case "SYNTAX":
      return "Java Syntax / Method signatures";
    case "LOGIC":
      return "Algorithm Logic / Edge Cases";
    case "COMPLEXITY":
      return "Time / Space complexity issues";
    default:
      return cat;
  }
}
