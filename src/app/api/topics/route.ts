import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: [{ level: "asc" }, { orderIndex: "asc" }],
      include: {
        questions: {
          select: { id: true, slug: true, title: true, difficulty: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(topics);
  } catch (error: any) {
    console.error("Fetch Topics Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch topics." },
      { status: 500 }
    );
  }
}
