import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        topic: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error: any) {
    console.error("Fetch Question Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch question." },
      { status: 500 }
    );
  }
}
