/**
 * Pure In-Engine Java Runner for Serverless Environments (Netlify / Vercel / Cloud)
 * Executes Java standard algorithms (Loops, Math, Strings, Arrays, Scanner, System.out)
 * when native `javac` is not installed in serverless containers.
 */

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

function normalizeOutput(str: string): string {
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

/**
 * Transpiles common Java beginner DSA code into safe executable JavaScript sandbox
 */
export function transpileJavaToJS(javaCode: string): { jsCode: string; error?: string } {
  try {
    let code = javaCode;

    // 1. Remove comments and imports / packages
    code = code.replace(/\/\*[\s\S]*?\*\//g, "");
    code = code.replace(/\/\/.*$/gm, "");
    code = code.replace(/import\s+[^;]+;/g, "");
    code = code.replace(/package\s+[^;]+;/g, "");

    // 2. Syntax Validation checks
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return { jsCode: "", error: "Syntax Error: Mismatched curly braces '{' and '}'." };
    }

    // Extract main method body
    const mainIdx = code.search(/(?:public\s+)?(?:static\s+)?void\s+main\s*\([^)]*\)\s*\{/);
    if (mainIdx !== -1) {
      const afterMain = code.slice(mainIdx);
      const firstBrace = afterMain.indexOf("{");
      let depth = 0;
      let mainBody = "";
      for (let i = firstBrace; i < afterMain.length; i++) {
        if (afterMain[i] === "{") depth++;
        else if (afterMain[i] === "}") {
          depth--;
          if (depth === 0) {
            mainBody = afterMain.slice(firstBrace + 1, i);
            break;
          }
        }
      }
      if (mainBody) {
        code = mainBody;
      }
    } else {
      // Remove class wrapper if no main method
      code = code.replace(/class\s+[A-Za-z0-9_$]+\s*\{/g, "");
      if (code.endsWith("}")) {
        code = code.slice(0, -1);
      }
    }

    // Type replacements
    code = code.replace(/\b(int|long|double|float|boolean|char|String)\s*\[\s*\]\s*\[\s*\]/g, "let ");
    code = code.replace(/\b(int|long|double|float|boolean|char|String)\s*\[\s*\]/g, "let ");
    code = code.replace(/\b(int|long|double|float|boolean|char|String)\b(?!\s*\.)/g, "let ");
    code = code.replace(/\b(final|public|private|protected|static|void)\b/g, "");

    // Array and String constructors
    code = code.replace(/new\s+(?:int|long|double|float)\s*\[([^\]]+)\]/g, "new Array($1).fill(0)");
    code = code.replace(/new\s+(?:boolean)\s*\[([^\]]+)\]/g, "new Array($1).fill(false)");
    code = code.replace(/new\s+(?:String)\s*\[([^\]]+)\]/g, "new Array($1).fill('')");

    // Arrays & StringBuilder
    code = code.replace(/Arrays\.sort\s*\(\s*([^)]+)\s*\)/g, "$1.sort((a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))))");
    code = code.replace(/new\s+StringBuilder\s*\(\s*([^)]+)\s*\)\.reverse\s*\(\s*\)\.toString\s*\(\s*\)/g, "String($1).split('').reverse().join('')");
    code = code.replace(/\.equals\s*\(\s*([^)]+)\s*\)/g, " === String($1)");
    code = code.replace(/\.equalsIgnoreCase\s*\(\s*([^)]+)\s*\)/g, ".toLowerCase() === String($1).toLowerCase()");
    code = code.replace(/(\b[A-Za-z0-9_$]+)\.length\(\)/g, "$1.length");

    // Number parsing & Math
    code = code.replace(/Integer\.parseInt\s*\(/g, "parseInt(");
    code = code.replace(/Double\.parseDouble\s*\(/g, "parseFloat(");
    code = code.replace(/Math\.max/g, "Math.max");
    code = code.replace(/Math\.min/g, "Math.min");
    code = code.replace(/Math\.abs/g, "Math.abs");
    code = code.replace(/Math\.sqrt/g, "Math.sqrt");
    code = code.replace(/Math\.pow/g, "Math.pow");

    // System.out.println / print replacements
    code = code.replace(/System\.out\.println\s*\(/g, "__print_ln(");
    code = code.replace(/System\.out\.print\s*\(/g, "__print(");

    return { jsCode: code };
  } catch (err: any) {
    return { jsCode: "", error: err.message || "Failed to parse Java code." };
  }
}

/**
 * Runs test cases against user's Java code in pure memory sandbox
 */
export async function executeJavaInMemory(
  userCode: string,
  testCases: TestCase[]
): Promise<RunResult> {
  const { jsCode, error: transpileError } = transpileJavaToJS(userCode);

  if (transpileError) {
    return {
      success: false,
      status: "COMPILE_ERROR",
      compileError: transpileError,
      results: [],
      passedTests: 0,
      totalTests: testCases.length,
      executionTimeMs: 0,
      summaryMessage: transpileError,
    };
  }

  const results: TestResult[] = [];
  let allPassed = true;
  let totalExecTime = 0;
  let status: RunResult["status"] = "ACCEPTED";
  let firstRuntimeError: string | undefined;

  for (const tc of testCases) {
    const startTime = Date.now();
    let stdout = "";
    let runtimeErr: string | undefined;

    try {
      const inputs = tc.input ? tc.input.trim().split(/\s+/) : [];
      let inputIndex = 0;

      // Mock Scanner
      const Scanner = function () {
        return {
          hasNext: () => inputIndex < inputs.length,
          hasNextInt: () => inputIndex < inputs.length && !isNaN(Number(inputs[inputIndex])),
          hasNextLine: () => inputIndex < inputs.length,
          next: () => (inputIndex < inputs.length ? inputs[inputIndex++] : ""),
          nextLine: () => (inputIndex < inputs.length ? inputs[inputIndex++] : ""),
          nextInt: () => (inputIndex < inputs.length ? parseInt(inputs[inputIndex++], 10) : 0),
          nextLong: () => (inputIndex < inputs.length ? parseInt(inputs[inputIndex++], 10) : 0),
          nextDouble: () => (inputIndex < inputs.length ? parseFloat(inputs[inputIndex++]) : 0.0),
          close: () => {},
        };
      };

      const __print = (...args: any[]) => {
        stdout += args.map((a) => (a === null ? "null" : a === undefined ? "undefined" : a.toString())).join(" ");
      };

      const __print_ln = (...args: any[]) => {
        stdout += args.map((a) => (a === null ? "null" : a === undefined ? "undefined" : a.toString())).join(" ") + "\n";
      };

      // Wrap in sandbox function
      const executionFn = new Function(
        "Scanner",
        "__print",
        "__print_ln",
        `
        return (async () => {
          let sc = new Scanner();
          ${jsCode}
          if (typeof runProgram === 'function') {
            await runProgram();
          }
        })();
        `
      );

      // Execute with timeout safeguard
      await Promise.race([
        executionFn(Scanner, __print, __print_ln),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Time Limit Exceeded (> 3.5s)")), 3500)),
      ]);
    } catch (execError: any) {
      runtimeErr = execError.message || "Runtime exception occurred.";
    }

    const execTime = Date.now() - startTime;
    totalExecTime += execTime;

    if (runtimeErr) {
      allPassed = false;
      status = runtimeErr.includes("Time Limit") ? "TIME_LIMIT" : "RUNTIME_ERROR";
      firstRuntimeError = runtimeErr;
      results.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: `(${runtimeErr})`,
        passed: false,
        timeMs: execTime,
        error: runtimeErr,
      });
      break;
    }

    const actualTrimmed = normalizeOutput(stdout);
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
      actual: stdout.trim(),
      passed,
      timeMs: execTime,
    });
  }

  const passedTests = results.filter((r) => r.passed).length;

  return {
    success: status === "ACCEPTED",
    status,
    runtimeError: firstRuntimeError,
    results,
    passedTests,
    totalTests: testCases.length,
    executionTimeMs: Math.round(totalExecTime / Math.max(1, results.length)),
    summaryMessage:
      status === "ACCEPTED"
        ? "All test cases passed! Great job!"
        : status === "WRONG_ANSWER"
        ? `Failed ${testCases.length - passedTests} of ${testCases.length} test cases.`
        : firstRuntimeError || "Execution failed.",
  };
}
