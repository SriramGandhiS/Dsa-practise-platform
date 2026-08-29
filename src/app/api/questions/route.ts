import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURATED_QUESTIONS, TOPIC_MAP } from "@/lib/curated-questions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const level = searchParams.get("level");
    const search = searchParams.get("search");

    let questions: any[] = [];
    let solvedMap = new Map<string, Date>();
    const todayDateStr = new Date().toISOString().split("T")[0];

    try {
      const user = await prisma.user.findFirst();
      const acceptedSubmissions = user
        ? await prisma.submission.findMany({
            where: { userId: user.id, status: "ACCEPTED" },
            orderBy: { createdAt: "desc" },
            select: { questionId: true, createdAt: true },
          })
        : [];

      for (const sub of acceptedSubmissions) {
        if (!solvedMap.has(sub.questionId)) {
          solvedMap.set(sub.questionId, sub.createdAt);
        }
      }

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

      questions = await prisma.question.findMany({
        where,
        orderBy: [{ level: "asc" }, { orderIndex: "asc" }],
        include: { topic: true },
      });
    } catch (dbErr) {
      console.warn("Database query failed, falling back to static questions:", dbErr);
    }

    // Fallback if DB was empty (e.g. unseeded Netlify serverless container)
    if (!questions || questions.length === 0) {
      let filtered = [...CURATED_QUESTIONS];
      if (topic && topic !== "all") {
        filtered = filtered.filter((q) => q.topicId === topic);
      }
      if (difficulty && difficulty !== "all") {
        filtered = filtered.filter((q) => q.difficulty.toUpperCase() === difficulty.toUpperCase());
      }
      if (level && level !== "all") {
        filtered = filtered.filter((q) => q.level === parseInt(level, 10));
      }
      if (search && search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (q) => q.title.toLowerCase().includes(s) || q.conceptTested.toLowerCase().includes(s)
        );
      }

      questions = filtered.map((q) => ({
        ...q,
        topic: TOPIC_MAP.get(q.topicId) || { name: "General", slug: "general" },
      }));
    }

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
        topicName: q.topic?.name || "General",
        topicSlug: q.topic?.slug || "general",
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

