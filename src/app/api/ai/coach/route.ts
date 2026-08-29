import { NextRequest, NextResponse } from "next/server";
import { askAiCoach, CoachRequest } from "@/lib/ai/coach-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CoachRequest & { questionId?: string };

    const coachRes = await askAiCoach(body);

    // Record AI conversation in database if questionId is provided
    if (body.questionId) {
      let user = await prisma.user.findFirst();
      if (user) {
        if (body.userMessage) {
          await prisma.aIConversation.create({
            data: {
              userId: user.id,
              questionId: body.questionId,
              role: "user",
              message: body.userMessage,
            },
          });
        }
        await prisma.aIConversation.create({
          data: {
            userId: user.id,
            questionId: body.questionId,
            role: "assistant",
            message: coachRes.reply,
          },
        });
      }
    }

    return NextResponse.json(coachRes);
  } catch (error: any) {
    console.error("AI Coach API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to contact AI Coach." },
      { status: 500 }
    );
  }
}
