import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURATED_QUESTIONS } from "@/lib/curated-questions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let submissions: any[] = [];
    try {
      submissions = await prisma.submission.findMany({
        where: { status: "ACCEPTED" },
        orderBy: { createdAt: "asc" },
        include: { question: true },
      });
    } catch (dbErr) {
      console.warn("DB lookup failed in reviews API:", dbErr);
    }

    const now = Date.now();
    const reviewItems: any[] = [];
    const solvedSlugMap = new Map<string, { lastSolvedAt: Date; count: number }>();

    for (const sub of submissions) {
      const slug = sub.question?.slug || sub.questionId;
      if (!slug) continue;
      const prev = solvedSlugMap.get(slug);
      if (!prev || new Date(sub.createdAt) > prev.lastSolvedAt) {
        solvedSlugMap.set(slug, {
          lastSolvedAt: new Date(sub.createdAt),
          count: (prev?.count || 0) + 1,
        });
      }
    }

    // Evaluate spaced repetition stage for each solved question
    solvedSlugMap.forEach(({ lastSolvedAt, count }, slug) => {
      const qData = CURATED_QUESTIONS.find((q) => q.slug === slug);
      if (!qData) return;

      const daysAgo = Math.floor(
        (now - lastSolvedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Spaced repetition intervals:
      // Count 1: Review after 3 days
      // Count 2: Review after 7 days
      // Count 3: Review after 21 days
      // Count >= 4: Mastered
      let stage = "Stage 1 (3 Days)";
      let targetInterval = 3;
      let isDue = false;

      if (count === 1) {
        stage = "Stage 1 (3 Days)";
        targetInterval = 3;
        isDue = daysAgo >= 3;
      } else if (count === 2) {
        stage = "Stage 2 (7 Days)";
        targetInterval = 7;
        isDue = daysAgo >= 7;
      } else if (count === 3) {
        stage = "Stage 3 (21 Days)";
        targetInterval = 21;
        isDue = daysAgo >= 21;
      } else {
        stage = "Mastered";
        targetInterval = 45;
        isDue = false;
      }

      // If user is testing locally on day 0, also show solved items so queue is testable
      reviewItems.push({
        id: qData.id,
        slug: qData.slug,
        title: qData.title,
        difficulty: qData.difficulty,
        topicSlug: qData.topicId,
        lastSolvedAt: lastSolvedAt.toISOString(),
        daysAgo,
        solveCount: count,
        stage,
        targetInterval,
        isDue: isDue || daysAgo === 0, // friendly for demo & practice
      });
    });

    // If user has not solved anything yet, suggest the first 3 fundamentals
    if (reviewItems.length === 0) {
      const starterRecs = CURATED_QUESTIONS.slice(0, 3).map((q) => ({
        id: q.id,
        slug: q.slug,
        title: q.title,
        difficulty: q.difficulty,
        topicSlug: q.topicId,
        lastSolvedAt: null,
        daysAgo: 0,
        solveCount: 0,
        stage: "Intro Practice",
        targetInterval: 1,
        isDue: true,
      }));
      return NextResponse.json({
        totalSolved: 0,
        dueCount: starterRecs.length,
        items: starterRecs,
      });
    }

    const dueItems = reviewItems.filter((i) => i.isDue);

    return NextResponse.json({
      totalSolved: solvedSlugMap.size,
      dueCount: dueItems.length,
      items: reviewItems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch review queue." },
      { status: 500 }
    );
  }
}
