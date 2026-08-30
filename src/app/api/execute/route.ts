import { NextRequest, NextResponse } from "next/server";
import { executeJavaCode, TestCase } from "@/lib/java-runner";
import { analyzeMistakes } from "@/lib/mistake-analyzer";
import { updateUserStatsAfterSubmission } from "@/lib/adaptive-engine";
import { prisma } from "@/lib/prisma";
import { CURATED_QUESTIONS } from "@/lib/curated-questions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      questionId,
      timeTakenSec = 0,
      hintsUsedCount = 0,
      solutionViewed = false,
      isCompilerOnly = false,
      customInput = "",
    } = body;

    // Sandbox execution for free online compiler
    if (isCompilerOnly) {
      if (!code) {
        return NextResponse.json({ error: "Code is required." }, { status: 400 });
      }
      const runResult = await executeJavaCode(code, [{ id: 1, input: customInput, expected: "" }], "custom-sandbox");
      if (!runResult.compileError && !runResult.runtimeError) {
        runResult.success = true;
        runResult.status = "ACCEPTED";
      }
      return NextResponse.json(runResult);
    }

    if (!code || !questionId) {
      return NextResponse.json(
        { error: "Code and Question ID are required." },
        { status: 400 }
      );
    }

    let question: any = null;
    try {
      question = await prisma.question.findFirst({
        where: {
          OR: [{ id: questionId }, { slug: questionId }],
        },
      });
    } catch (dbErr) {
      console.warn("DB question lookup failed in execute:", dbErr);
    }

    if (!question) {
      const staticQ = CURATED_QUESTIONS.find(
        (q) => q.id === questionId || q.slug === questionId
      );
      if (staticQ) {
        question = staticQ;
      }
    }

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // Always run full test suite (visible + hidden) for 100% accurate judging
    const visibleTests: TestCase[] =
      typeof question.visibleTests === "string"
        ? JSON.parse(question.visibleTests || "[]")
        : question.visibleTests || [];
    const hiddenTests: TestCase[] =
      typeof question.hiddenTests === "string"
        ? JSON.parse(question.hiddenTests || "[]")
        : question.hiddenTests || [];
    const testSuite = [...visibleTests, ...hiddenTests];

    const runResult = await executeJavaCode(code, testSuite, question.slug);

    // Analyze mistakes if not ACCEPTED
    let failedInfo: { expected: string; actual: string } | undefined;
    const firstFailed = runResult.results?.find((r) => !r.passed);
    if (firstFailed) {
      failedInfo = { expected: firstFailed.expected, actual: firstFailed.actual };
    }

    const detectedMistakes =
      runResult.status === "ACCEPTED"
        ? []
        : analyzeMistakes(
            code,
            runResult.compileError,
            runResult.runtimeError,
            failedInfo
          );

    // Optional background persistence (safe against serverless SQLite failures)
    try {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: { email: "learner@javatrainer.dev", name: "Java Learner" },
        });
      }

      if (question.id) {
        const attemptCount = await prisma.submission.count({
          where: { userId: user.id, questionId: question.id },
        });

        await prisma.submission.create({
          data: {
            userId: user.id,
            questionId: question.id,
            attemptNumber: attemptCount + 1,
            code,
            status: runResult.status,
            timeTakenSec,
            executionTimeMs: runResult.executionTimeMs,
            passedTests: runResult.passedTests,
            totalTests: runResult.totalTests,
            compileErrorMsg: runResult.compileError,
            runtimeErrorMsg: runResult.runtimeError,
            failedTestInfo: firstFailed ? JSON.stringify(firstFailed) : null,
            hintsUsedCount,
            solutionViewed,
            mistakeTags: JSON.stringify(detectedMistakes.map((m) => m.category)),
          },
        });

        await updateUserStatsAfterSubmission({
          userId: user.id,
          questionId: question.id,
          isAccepted: runResult.status === "ACCEPTED",
          timeTakenSec,
          hintsUsedCount,
          solutionViewed,
          mistakeCategories: detectedMistakes.map((m) => m.category),
        });
      }
    } catch (persistErr) {
      console.warn("Could not save submission to DB:", persistErr);
    }

    return NextResponse.json({
      ...runResult,
      isSolved: runResult.status === "ACCEPTED",
      detectedMistakes,
    });
  } catch (error: any) {
    console.error("Execute API Error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "RUNTIME_ERROR",
        runtimeError: error.message || "Execution service failure.",
        results: [],
        passedTests: 0,
        totalTests: 0,
        executionTimeMs: 0,
        error: error.message || "Execution service failure.",
      },
      { status: 500 }
    );
  }
}
