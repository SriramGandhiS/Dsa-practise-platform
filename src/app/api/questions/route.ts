import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const level = searchParams.get("level");
    const search = searchParams.get("search");

    const where: any = {};
    if (topic && topic !== "all") {
      where.topicId = topic;
    }
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty.toUpperCase();
    }
    if (level && level !== "all") {
      where.level = parseInt(level, 10);
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { conceptTested: { contains: search } },
      ];
    }

    const user = await prisma.user.findFirst();
    const todayDateStr = new Date().toISOString().split("T")[0];

    const acceptedSubmissions = user
      ? await prisma.submission.findMany({
          where: { userId: user.id, status: "ACCEPTED" },
          orderBy: { createdAt: "desc" },
          select: { questionId: true, createdAt: true },
        })
      : [];

    // Map questionId -> latest submission date
    const solvedMap = new Map<string, Date>();
    for (const sub of acceptedSubmissions) {
      if (!solvedMap.has(sub.questionId)) {
        solvedMap.set(sub.questionId, sub.createdAt);
      }
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: [{ level: "asc" }, { orderIndex: "asc" }],
      include: { topic: true },
    });

    const enriched = questions.map((q) => {
      const solvedAt = solvedMap.get(q.id);
      const isSolved = Boolean(solvedAt);
      const solvedDateStr = solvedAt ? solvedAt.toISOString().split("T")[0] : null;
      const isSolvedToday = solvedDateStr === todayDateStr;

      return {
        id: q.id,
        slug: q.slug,
        title: q.title,
        difficulty: q.difficulty,
        level: q.level,
        topicName: q.topic.name,
        topicSlug: q.topic.slug,
        conceptTested: q.conceptTested,
        isSolved,
        isSolvedToday,
        lastSolvedAt: solvedAt ? solvedAt.toISOString() : null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("Fetch Questions Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions", details: error.message },
      { status: 500 }
    );
  }
}
