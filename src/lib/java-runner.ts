import { exec, spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { executeJavaInMemory } from "./java-engine";

export interface TestCase {
  id: number | string;
  input: string;
  expected: string;
}

export interface TestResult {
  id: number | string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  timeMs: number;
  error?: string;
  explanation?: string;
}

export interface RunResult {
  success: boolean;
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT";
  compileError?: string;
  runtimeError?: string;
  results: TestResult[];
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  cleanOutput?: string;
  summaryMessage?: string;
}

// Security sanitizer to prevent dangerous system calls
export function sanitizeJavaCode(code: string): { safe: boolean; reason?: string } {
  const dangerousPatterns = [
    { regex: /Runtime\.getRuntime\(\)\.exec/i, reason: "Process execution is restricted for security." },
    { regex: /ProcessBuilder/i, reason: "Process execution is restricted for security." },
    { regex: /System\.exit/i, reason: "System.exit is disabled in test runner." },
    { regex: /java\.net\./i, reason: "Network calls are disabled in sandbox." },
    { regex: /java\.nio\.file\./i, reason: "Direct file system manipulation is restricted." },
    { regex: /java\.io\.File\b/i, reason: "Direct file system manipulation is restricted." }
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.regex.test(code)) {
      return { safe: false, reason: pattern.reason };
    }
  }
  return { safe: true };
}

function normalizeOutput(str: string): string {
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

/**
 * Finds the declared public class name or defaults to "Solution"
 */
function findClassName(code: string): string {
  const match = code.match(/public\s+class\s+([A-Za-z0-9_$]+)/);
  if (match && match[1]) {
    return match[1];
  }
  const classMatch = code.match(/class\s+([A-Za-z0-9_$]+)/);
  if (classMatch && classMatch[1]) {
    return classMatch[1];
  }
  return "Solution";
}

/**
 * Prepares the executable code:
 * - If code has `main(String[] args)`, keep 100% as written.
 * - If code is method-based with `return` and no `main` method, generate a lightweight runner to test the method.
 */
function buildExecutableCode(userCode: string, className: string): string {
  const hasMain = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]/i.test(userCode) ||
                  /static\s+public\s+void\s+main\s*\(\s*String\s*\[\s*\]/i.test(userCode);

  if (hasMain) {
    return userCode;
  }

  const hasClass = /\b(public\s+)?class\s+[A-Za-z0-9_$]+/i.test(userCode);

  // If no class exists, user is writing rapid naked statements! Auto-wrap in matching runner class
  if (!hasClass) {
    const userHasScannerDecl = /\bScanner\s+([a-zA-Z0-9_$]+)\s*=/i.test(userCode);
    const scannerHeader = userHasScannerDecl ? "" : "Scanner sc = new Scanner(System.in);";

    return `
import java.util.*;
import java.io.*;
import java.math.*;

public class ${className}Runner {
    public static void main(String[] args) throws Exception {
        ${scannerHeader}
        ${userCode}
    }
}
`;
  }

  // Method-only support: wrap the method in a class with a reflection-based dispatcher
  const userClassReplaced = userCode.replace(new RegExp(`public\\s+class\\s+${className}`, "g"), `class ${className}`);

  return `
import java.util.*;
import java.io.*;
import java.lang.reflect.*;

${userClassReplaced}

public class ${className}Runner {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            ${className} instance = new ${className}();
            Method[] methods = ${className}.class.getDeclaredMethods();
            Method target = null;
            for (Method m : methods) {
                if (!m.getName().equals("main") && Modifier.isPublic(m.getModifiers())) {
                    target = m;
                    break;
                }
            }
            if (target == null && methods.length > 0) {
                target = methods[0];
            }

            if (target != null) {
                target.setAccessible(true);
                Class<?>[] paramTypes = target.getParameterTypes();
                Object[] invokeArgs = new Object[paramTypes.length];

                for (int i = 0; i < paramTypes.length; i++) {
                    Class<?> p = paramTypes[i];
                    if (p == int.class || p == Integer.class) {
                        invokeArgs[i] = sc.nextInt();
                    } else if (p == long.class || p == Long.class) {
                        invokeArgs[i] = sc.nextLong();
                    } else if (p == double.class || p == Double.class) {
                        invokeArgs[i] = sc.nextDouble();
                    } else if (p == String.class) {
                        invokeArgs[i] = sc.next();
                    } else if (p == boolean.class || p == Boolean.class) {
                        invokeArgs[i] = sc.nextBoolean();
                    } else if (p == int[].class) {
                        int n = sc.nextInt();
                        int[] arr = new int[n];
                        for (int j = 0; j < n; j++) arr[j] = sc.nextInt();
                        invokeArgs[i] = arr;
                    }
                }

                Object result = target.invoke(Modifier.isStatic(target.getModifiers()) ? null : instance, invokeArgs);
                if (result != null) {
                    if (result.getClass().isArray()) {
                        System.out.println(Arrays.toString((Object[]) result));
                    } else {
                        System.out.print(result);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace(System.err);
        }
    }
}
`;
}

/**
 * Executes the user's code against test cases.
 * Evaluates correctness purely based on behavior/output, not syntax stereotyping.
 */
export async function executeJavaCode(
  userCode: string,
  testCases: TestCase[],
  questionSlug: string = "general",
  timeoutMs: number = 3500
): Promise<RunResult> {
  const sanitize = sanitizeJavaCode(userCode);
  if (!sanitize.safe) {
    return {
      success: false,
      status: "COMPILE_ERROR",
      compileError: `Security Restriction: ${sanitize.reason}`,
      results: [],
      passedTests: 0,
      totalTests: testCases.length,
      executionTimeMs: 0,
      summaryMessage: "Security restriction encountered.",
    };
  }

  // Create isolated temp directory
  const runId = crypto.randomBytes(8).toString("hex");
  const tempDir = path.join(os.tmpdir(), `java_runner_${runId}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const hasMain = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]/i.test(userCode) ||
                  /static\s+public\s+void\s+main\s*\(\s*String\s*\[\s*\]/i.test(userCode);

  const baseClassName = findClassName(userCode);
  const executionClassName = hasMain ? baseClassName : `${baseClassName}Runner`;
  const javaFileName = `${executionClassName}.java`;
  const javaFilePath = path.join(tempDir, javaFileName);

  const finalSourceCode = buildExecutableCode(userCode, baseClassName);
  fs.writeFileSync(javaFilePath, finalSourceCode, "utf8");

  try {
    // 1. Compilation Phase
    const compileResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      exec(`javac "${javaFilePath}"`, { cwd: tempDir, timeout: 6000 }, (error, stdout, stderr) => {
        if (error || (stderr && stderr.includes("error:"))) {
          const rawErr = (stderr || error?.message || "").toString();
          // Remove absolute temp directory paths but keep Solution.java:line: error: syntax and caret
          const cleanErr = rawErr
            .split(tempDir + path.sep).join("")
            .split(tempDir + "/").join("")
            .split(tempDir + "\\").join("")
            .split(tempDir).join("")
            .trim();
          resolve({ ok: false, error: cleanErr || "Compilation failed." });
        } else {
          resolve({ ok: true });
        }
      });
    });

    if (!compileResult.ok) {
      // If javac is not installed (e.g. Netlify serverless Lambda / Linux container without JDK),
      // seamlessly fall back to pure in-engine Java runner!
      const errStr = (compileResult.error || "").toLowerCase();
      if (
        errStr.includes("command not found") ||
        errStr.includes("not recognized") ||
        errStr.includes("enoent") ||
        errStr.includes("cannot find")
      ) {
        return executeJavaInMemory(userCode, testCases);
      }

      return {
        success: false,
        status: "COMPILE_ERROR",
        compileError: compileResult.error,
        results: [],
        passedTests: 0,
        totalTests: testCases.length,
        executionTimeMs: 0,
        summaryMessage: "Compilation Error: Check syntax, variable types, or method signatures.",
      };
    }

    // 2. Deterministic Output Evaluation Phase
    const results: TestResult[] = [];
    let allPassed = true;
    let totalExecTime = 0;
    let status: RunResult["status"] = "ACCEPTED";
    let firstRuntimeError: string | undefined;

    for (const tc of testCases) {
      const startTime = Date.now();
      const testExec = await new Promise<{
        stdout: string;
        stderr: string;
        timedOut: boolean;
        exitCode: number | null;
      }>((resolve) => {
        const child = spawn("java", ["-Xmx128m", executionClassName], {
          cwd: tempDir,
        });

        let stdout = "";
        let stderr = "";
        let timedOut = false;

        const timer = setTimeout(() => {
          timedOut = true;
          child.kill("SIGKILL");
        }, timeoutMs);

        if (tc.input) {
          child.stdin.write(tc.input + "\n");
        }
        child.stdin.end();

        child.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        child.on("close", (exitCode) => {
          clearTimeout(timer);
          resolve({ stdout, stderr, timedOut, exitCode });
        });

        child.on("error", (err) => {
          clearTimeout(timer);
          resolve({ stdout, stderr: err.message, timedOut: false, exitCode: 1 });
        });
      });

      const execTime = Date.now() - startTime;
      totalExecTime += execTime;

      if (testExec.timedOut) {
        allPassed = false;
        status = "TIME_LIMIT";
        results.push({
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          actual: "(Time Limit Exceeded - Check infinite loop conditions)",
          passed: false,
          timeMs: execTime,
          error: "Time Limit Exceeded (> 3.5s). Ensure loop conditions terminate.",
        });
        break;
      }

      if (testExec.exitCode !== 0 && testExec.stderr) {
        allPassed = false;
        status = "RUNTIME_ERROR";
        const cleanRuntimeErr = testExec.stderr
          .split(tempDir + path.sep).join("")
          .split(tempDir + "/").join("")
          .split(tempDir + "\\").join("")
          .split(tempDir).join("")
          .trim();
        firstRuntimeError = cleanRuntimeErr;
        results.push({
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          actual: "(Runtime Exception)",
          passed: false,
          timeMs: execTime,
          error: cleanRuntimeErr,
        });
        break;
      }

      const actualTrimmed = normalizeOutput(testExec.stdout);
      const expectedTrimmed = normalizeOutput(tc.expected);
      const passed = actualTrimmed === expectedTrimmed;

      if (!passed) {
        allPassed = false;
        if (status === "ACCEPTED") status = "WRONG_ANSWER";
      }

      results.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: testExec.stdout.trim(),
        passed,
        timeMs: execTime,
        explanation: !passed
          ? "The program ran successfully, but the output differed from the expected result."
          : undefined,
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const avgTime = results.length > 0 ? Math.round(totalExecTime / results.length) : 0;

    let summaryMessage = "";
    if (status === "ACCEPTED") {
      summaryMessage = `All ${passedCount}/${testCases.length} test cases passed successfully!`;
    } else if (status === "WRONG_ANSWER") {
      summaryMessage = `Passed ${passedCount} of ${testCases.length} tests. Expected output differs from actual output.`;
    } else if (status === "RUNTIME_ERROR") {
      summaryMessage = "Runtime Exception occurred during execution.";
    } else if (status === "TIME_LIMIT") {
      summaryMessage = "Time limit exceeded. Possible infinite loop.";
    }

    return {
      success: allPassed,
      status,
      results,
      passedTests: passedCount,
      totalTests: testCases.length,
      executionTimeMs: avgTime,
      cleanOutput: results.length > 0 ? results[0].actual : "",
      runtimeError: firstRuntimeError,
      summaryMessage,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}
