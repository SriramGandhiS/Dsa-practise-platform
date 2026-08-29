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

    // 1. Remove comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, "");
    code = code.replace(/\/\/.*$/gm, "");

    // 2. Syntax Validation checks
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return { jsCode: "", error: "Syntax Error: Mismatched curly braces '{' and '}'." };
    }

    // Check for common syntax mistakes like `if (a.charAt(i)equals(b))`
    const brokenEquals = code.match(/charAt\([^)]+\)equals\(/);
    if (brokenEquals) {
      return {
        jsCode: "",
        error: "Solution.java: error: cannot find symbol\n  symbol: method equals(String)\n  location: class java.lang.Character / char primitive",
      };
    }

    // 3. Extract the contents inside class Solution / methods
    // If user defined methods or main, transpile into an async function
    let transformed = code;

    // Replace Java types with let / var
    transformed = transformed.replace(/\b(int|long|double|float|boolean|char|String)\s*\[\s*\]\s*\[\s*\]/g, "let ");
    transformed = transformed.replace(/\b(int|long|double|float|boolean|char|String)\s*\[\s*\]/g, "let ");
    transformed = transformed.replace(/\b(int|long|double|float|boolean|char|String)\b(?!\s*\.)/g, "let ");
    transformed = transformed.replace(/\b(final|public|private|protected|static|void)\b/g, "");

    // Replace new int[n] or new String[n] with new Array(n).fill(0)
    transformed = transformed.replace(/new\s+(?:int|long|double|float)\s*\[([^\]]+)\]/g, "new Array($1).fill(0)");
    transformed = transformed.replace(/new\s+(?:boolean)\s*\[([^\]]+)\]/g, "new Array($1).fill(false)");
    transformed = transformed.replace(/new\s+(?:String)\s*\[([^\]]+)\]/g, "new Array($1).fill('')");

    // Replace Arrays.sort(arr) with arr.sort((a,b)=>a-b)
    transformed = transformed.replace(/Arrays\.sort\s*\(\s*([^)]+)\s*\)/g, "$1.sort((a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))))");

    // Replace StringBuilder(s).reverse().toString() with s.split('').reverse().join('')
    transformed = transformed.replace(/new\s+StringBuilder\s*\(\s*([^)]+)\s*\)\.reverse\s*\(\s*\)\.toString\s*\(\s*\)/g, "String($1).split('').reverse().join('')");

    // Replace s.equals(other) with s === other
    transformed = transformed.replace(/\.equals\s*\(\s*([^)]+)\s*\)/g, " === String($1)");
    transformed = transformed.replace(/\.equalsIgnoreCase\s*\(\s*([^)]+)\s*\)/g, ".toLowerCase() === String($1).toLowerCase()");

    // Replace s.charAt(i) with s.charAt(i)
    // Replace s.length() with s.length
    transformed = transformed.replace(/(\b[A-Za-z0-9_$]+)\.length\(\)/g, "$1.length");

    // Replace Integer.parseInt(s) with parseInt(s, 10)
    transformed = transformed.replace(/Integer\.parseInt\s*\(/g, "parseInt(");
    transformed = transformed.replace(/Double\.parseDouble\s*\(/g, "parseFloat(");

    // Replace Math functions
    transformed = transformed.replace(/Math\.max/g, "Math.max");
    transformed = transformed.replace(/Math\.min/g, "Math.min");
    transformed = transformed.replace(/Math\.abs/g, "Math.abs");
    transformed = transformed.replace(/Math\.sqrt/g, "Math.sqrt");
    transformed = transformed.replace(/Math\.pow/g, "Math.pow");

    // System.out.println / print replacements
    transformed = transformed.replace(/System\.out\.println\s*\(/g, "__print_ln(");
    transformed = transformed.replace(/System\.out\.print\s*\(/g, "__print(");

    // Handle class / main wrapping
    transformed = transformed.replace(/class\s+[A-Za-z0-9_$]+\s*\{/g, "");
    transformed = transformed.replace(/main\s*\(\s*let\s+args\s*\)\s*\{/g, "async function runProgram() {");

    return { jsCode: transformed };
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
