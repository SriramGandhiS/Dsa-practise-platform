import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json([]);
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        question: {
          select: {
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });

    const formatted = submissions.map((s) => ({
      id: s.id,
      questionTitle: s.question.title,
      questionSlug: s.question.slug,
      difficulty: s.question.difficulty,
      status: s.status,
      attemptNumber: s.attemptNumber,
      timeTakenSec: s.timeTakenSec,
      hintsUsedCount: s.hintsUsedCount,
      solutionViewed: s.solutionViewed,
      createdAt: s.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
