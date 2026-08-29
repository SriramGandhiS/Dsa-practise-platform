export interface DetectedMistake {
  category: string;
  title: string;
  snippet?: string;
  problem: string;
  recommendedFix: string;
}

export function analyzeMistakes(
  code: string,
  compileError?: string,
  runtimeError?: string,
  failedTestInfo?: { expected: string; actual: string }
): DetectedMistake[] {
  const mistakes: DetectedMistake[] = [];

  // 1. Array index out of bounds pattern: `i <= arr.length` or `i <= a.length`
  const arrayBoundRegex = /(for\s*\([^;]*;\s*[a-zA-Z0-9_]+\s*<=\s*([a-zA-Z0-9_]+)\.length\s*;)/g;
  const matchArrBound = arrayBoundRegex.exec(code);
  if (matchArrBound || runtimeError?.includes("ArrayIndexOutOfBoundsException")) {
    mistakes.push({
      category: "ARRAY_BOUNDS",
      title: "Array Indexing / Boundary Mistake",
      snippet: matchArrBound ? matchArrBound[1] : undefined,
      problem: "In Java, arrays are 0-indexed. The valid index range is 0 to (length - 1). Using '<=' causes an ArrayIndexOutOfBoundsException on the last iteration.",
      recommendedFix: "Change '<=' to '<' (e.g. for (int i = 0; i < arr.length; i++))",
    });
  }

  // 2. String char vs String confusion: `charAt(i) == "a"`
  const charQuoteRegex = /\.charAt\s*\([^)]+\)\s*==\s*"([^"]*)"/g;
  const matchCharQuote = charQuoteRegex.exec(code);
  if (
    matchCharQuote ||
    compileError?.includes("incomparable types: char and java.lang.String") ||
    compileError?.includes("bad operand types for binary operator '=='")
  ) {
    mistakes.push({
      category: "STRING_CHAR_CONFUSION",
      title: "char vs String Confusion",
      snippet: matchCharQuote ? matchCharQuote[0] : undefined,
      problem: "charAt() returns a primitive 'char'. In Java, single characters use single quotes ('a'), while String objects use double quotes (\"a\").",
      recommendedFix: "Use single quotes for characters: s.charAt(i) == 'a' instead of \"a\".",
    });
  }

  // 3. String length method without parentheses: `s.length`
  const strLengthRegex = /([a-zA-Z0-9_]+)\.length\b(?!\s*\(|\s*\[)/g;
  // If it's a string variable followed by .length without ()
  if (compileError?.includes("cannot find symbol") && compileError?.includes("variable length")) {
    mistakes.push({
      category: "SYNTAX",
      title: "String .length() vs Array .length",
      problem: "In Java, String length is a method call .length(), whereas array length is a property .length without parentheses.",
      recommendedFix: "Use str.length() with parentheses for Strings.",
    });
  }

  // 4. String equality using == instead of .equals()
  const stringEqualsRegex = /([a-zA-Z0-9_]+)\s*==\s*"([^"]*)"/g;
  const matchStrEquals = stringEqualsRegex.exec(code);
  if (matchStrEquals) {
    mistakes.push({
      category: "STRING_EQUALITY",
      title: "String Reference Comparison (== vs .equals)",
      snippet: matchStrEquals[0],
      problem: "In Java, '==' compares object memory addresses (references), not the character contents. Two identical strings may evaluate to false when compared with '=='.",
      recommendedFix: `Use .equals(): ${matchStrEquals[1]}.equals("${matchStrEquals[2]}")`,
    });
  }

  // 5. Digit extraction vs reduction confusion:
  // e.g. using n / 10 to extract digit, or n % 10 without dividing
  if (code.includes("n = n % 10") && code.includes("while")) {
    mistakes.push({
      category: "DIGIT_EXTRACTION",
      title: "Digit Reduction Mistake",
      problem: "Using 'n = n % 10' sets n to just the last digit instead of dropping the last digit.",
      recommendedFix: "To drop the last digit, use 'n = n / 10'. To extract the last digit, use 'int digit = n % 10'.",
    });
  }

  // 6. Number reversal arithmetic mistake: `rev = rev + digit` instead of `rev = rev * 10 + digit`
  const revMistakeRegex = /rev\s*=\s*rev\s*\+\s*([a-zA-Z0-9_]+)/g;
  const matchRev = revMistakeRegex.exec(code);
  if (matchRev && !code.includes("rev * 10") && !code.includes("rev*10")) {
    mistakes.push({
      category: "LOGIC",
      title: "Number Reversal Math Error",
      snippet: matchRev[0],
      problem: "Adding the digit directly only sums the digits. To shift existing digits left to make room for the new digit in base-10, you must multiply by 10.",
      recommendedFix: "Use 'rev = rev * 10 + digit;'",
    });
  }

  // 7. Loop increment missing (potential infinite loop / TLE)
  if (code.includes("while") && !code.includes("++") && !code.includes("+=") && !code.includes("/=") && !code.includes("-=") && !code.includes("--")) {
    mistakes.push({
      category: "LOOP_INCREMENT",
      title: "Loop Step / Increment Missing",
      problem: "The loop variable is never updated inside the while loop body, causing an infinite loop / Time Limit Exceeded.",
      recommendedFix: "Ensure the loop variable is modified toward termination (e.g. i++, n /= 10, left++).",
    });
  }

  // 8. Max initialized to 0
  const maxZeroRegex = /int\s+(max|largest)\s*=\s*0\s*;/g;
  if (maxZeroRegex.test(code) && failedTestInfo) {
    mistakes.push({
      category: "LOGIC",
      title: "Max Initialized to 0",
      problem: "Initializing max to 0 fails when all numbers in the input array are negative (e.g. [-10, -5, -20]).",
      recommendedFix: "Initialize max with 'arr[0]' or 'Integer.MIN_VALUE'.",
    });
  }

  // 9. Binary search midpoint overflow
  if (code.includes("(left + right) / 2") || code.includes("(low + high) / 2")) {
    mistakes.push({
      category: "COMPLEXITY",
      title: "Integer Midpoint Overflow in Binary Search",
      problem: "'(left + right) / 2' can overflow integer limits when left + right > 2,147,483,647.",
      recommendedFix: "Use 'left + (right - left) / 2' which is mathematically identical but immune to integer overflow.",
    });
  }

  // Default fallback if compilation error occurred but no specific rule matched
  if (compileError && mistakes.length === 0) {
    mistakes.push({
      category: "SYNTAX",
      title: "Java Compilation Error",
      problem: compileError,
      recommendedFix: "Check variable declarations, semicolons ';', types, and curly braces '{}'.",
    });
  }

  return mistakes;
}
