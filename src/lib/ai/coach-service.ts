export interface CoachRequest {
  mode: "hint" | "explain-error" | "simple-solution" | "optimal-solution" | "chat";
  userMessage?: string;
  userCode: string;
  questionTitle: string;
  problemStatement: string;
  conceptTested: string;
  inputSample?: string;
  expectedOutput?: string;
  actualOutput?: string;
  compileError?: string;
  runtimeError?: string;
  simpleSolution?: string;
  optimalSolution?: string;
  hintCount?: number;
}

export interface CoachResponse {
  reply: string;
  provider: "ollama" | "custom_api" | "builtin_mentor";
}

export async function askAiCoach(req: CoachRequest): Promise<CoachResponse> {
  const systemPrompt = `You are "Java Coach", a concise, beginner-friendly Java tutor.
Guidelines:
1. Be direct, encouraging, and brief (2-4 sentences max).
2. Teach by guiding the student's thought process (Socratic).
3. If code failed on a test case, compare Expected vs Actual output and explain the logic gap.
4. Only show Java code if explicitly requested by "simple-solution" or "optimal-solution".`;

  let prompt = `Problem: ${req.questionTitle}\nStatement: ${req.problemStatement}\n`;

  if (req.inputSample) {
    prompt += `Sample Input: ${req.inputSample}\n`;
  }
  if (req.expectedOutput) {
    prompt += `Expected Output: ${req.expectedOutput}\n`;
  }
  if (req.actualOutput) {
    prompt += `Student's Actual Output: ${req.actualOutput}\n`;
  }
  if (req.userCode) {
    prompt += `Student's Java Code:\n\`\`\`java\n${req.userCode}\n\`\`\`\n`;
  }
  if (req.compileError) {
    prompt += `Compilation Error:\n${req.compileError}\n`;
  }
  if (req.runtimeError) {
    prompt += `Runtime Error:\n${req.runtimeError}\n`;
  }

  switch (req.mode) {
    case "hint":
      prompt += `\nProvide a small hint (Hint #${(req.hintCount || 0) + 1}) to help the student solve this without giving away the full answer.`;
      break;
    case "explain-error":
      prompt += `\nExplain simply why the code produced the wrong output or error, and guide how to fix it.`;
      break;
    case "simple-solution":
      prompt += `\nShow and briefly explain the beginner-friendly Java solution.`;
      break;
    case "optimal-solution":
      prompt += `\nShow and explain the optimal solution with time/space complexity.`;
      break;
    case "chat":
      prompt += `\nUser asked: "${req.userMessage || "Help me understand this."}"`;
      break;
  }

  // 1. Try Ollama (Local First)
  const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "deepseek-coder:6.7b";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.response && data.response.trim().length > 0) {
        return {
          reply: data.response.trim(),
          provider: "ollama",
        };
      }
    }
  } catch {
    // Ollama not reachable, fall through
  }

  // 2. High Quality Built-in Socratic Mentor Fallback
  return {
    reply: generateHeuristicResponse(req),
    provider: "builtin_mentor",
  };
}

function generateHeuristicResponse(req: CoachRequest): string {
  switch (req.mode) {
    case "hint": {
      const count = req.hintCount || 0;
      if (count === 0) {
        return `💡 **Hint 1:** Look at how the input is transformed. For **${req.questionTitle}**, what is the first step you need to perform on the input variable?`;
      } else if (count === 1) {
        return `💡 **Hint 2:** Think about the loop condition and how you extract or modify the state at each step (e.g. \`% 10\` vs \`/ 10\` or array index \`i\`).`;
      }
      return `💡 **Hint 3:** Ensure you print the final result using \`System.out.println(...)\` in the required format.`;
    }

    case "explain-error":
      if (req.compileError) {
        return `⚠️ **Compilation Error:**\n\nYour code had a syntax issue on line ${req.compileError.match(/Line\s*(\d+)/)?.[1] || "indicated above"}. Check matching brackets \`{}\`, variable types, and missing semicolons \`;\`.`;
      }
      if (req.runtimeError) {
        return `🚨 **Runtime Issue:**\n\n${req.runtimeError}\n\nMake sure loop bounds don't exceed array length (e.g. use \`i < arr.length\`, not \`i <= arr.length\`).`;
      }
      if (req.actualOutput && req.expectedOutput) {
        return `🔍 **Output Mismatch:**\n\n- **Expected Output:** \`${req.expectedOutput}\`\n- **Your Output:** \`${req.actualOutput}\`\n\nYour program compiled and ran, but the computed value does not match what was expected for input \`${req.inputSample || ""}\`. Trace your variable values through each step.`;
      }
      return "Review the logic inside your main loop to make sure it handles all input cases correctly.";

    case "simple-solution":
      if (req.simpleSolution) {
        return `### 🟢 Simple Solution\n\n\`\`\`java\n${req.simpleSolution}\n\`\`\`\n\n*Try typing it yourself to understand the flow rather than just copy-pasting!*`;
      }
      return "The simple approach directly iterates through the input values step-by-step.";

    case "optimal-solution":
      if (req.optimalSolution) {
        return `### ⚡ Optimal Solution\n\n\`\`\`java\n${req.optimalSolution}\n\`\`\`\n\n*Optimized for minimal operations and clean Java conventions.*`;
      }
      return "For this fundamental question, the simple and optimal approaches are the same.";

    case "chat":
      return `You are practicing **${req.questionTitle}**. Try running your code with a sample input, check the console output below, and adjust your logic.`;
  }
}
