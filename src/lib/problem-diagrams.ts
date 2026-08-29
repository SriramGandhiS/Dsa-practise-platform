export interface StepTrace {
  step: string;
  vars: Record<string, string | number>;
  explanation: string;
}

export interface VisualDiagram {
  title: string;
  type: "TRACE_TABLE" | "ARRAY_BOXES" | "TWO_POINTER" | "DIGIT_FLOW" | "PATTERN_GRID";
  description: string;
  headers?: string[];
  rows?: string[][];
  arrayElements?: { index: number; value: string | number; highlight?: boolean; label?: string }[];
  leftPointer?: { index: number; label: string };
  rightPointer?: { index: number; label: string };
  steps?: StepTrace[];
  codeMapping?: { line: string; explanation: string }[];
}

export const PROBLEM_DIAGRAMS: Record<string, VisualDiagram> = {
  "palindrome-string": {
    title: "Two-Pointer Symmetry Check",
    type: "TWO_POINTER",
    description: "Compare characters from both ends moving inward until pointers meet in the middle.",
    arrayElements: [
      { index: 0, value: "'m'", label: "left (0)" },
      { index: 1, value: "'a'", label: "1" },
      { index: 2, value: "'d'", label: "2 (center)" },
      { index: 3, value: "'a'", label: "3" },
      { index: 4, value: "'m'", label: "right (4)" },
    ],
    leftPointer: { index: 0, label: "left ->" },
    rightPointer: { index: 4, label: "<- right" },
    headers: ["Step", "Left Char (i)", "Right Char (j)", "Match?", "Action"],
    rows: [
      ["1", "str[0] = 'm'", "str[4] = 'm'", "✅ Match", "Increment i, Decrement j"],
      ["2", "str[1] = 'a'", "str[3] = 'a'", "✅ Match", "Increment i, Decrement j"],
      ["3", "str[2] = 'd'", "str[2] = 'd'", "✅ Pointers Meet", "String is Palindrome! Output: true"],
    ],
    codeMapping: [
      { line: "while (left < right)", explanation: "Keep checking while outer pointers have not crossed." },
      { line: "if (s.charAt(left) != s.charAt(right)) return false;", explanation: "Any mismatch immediately proves it's not a palindrome." },
      { line: "left++; right--;", explanation: "Move pointers one step closer to center." },
    ],
  },

  "palindrome-number": {
    title: "Digit Extraction & Reversal Flow",
    type: "DIGIT_FLOW",
    description: "Extract the last digit using `% 10`, build the reversed integer, and reduce `n` by `/ 10`.",
    headers: ["Iteration", "Remaining n", "Extracted Digit (n % 10)", "Reversed Accumulator (rev * 10 + d)", "Next n (n / 10)"],
    rows: [
      ["Initial", "121", "-", "rev = 0", "121"],
      ["Loop 1", "121", "121 % 10 = 1", "0 * 10 + 1 = 1", "121 / 10 = 12"],
      ["Loop 2", "12", "12 % 10 = 2", "1 * 10 + 2 = 12", "12 / 10 = 1"],
      ["Loop 3", "1", "1 % 10 = 1", "12 * 10 + 1 = 121", "1 / 10 = 0 (Terminates)"],
      ["Final", "0", "-", "rev == original (121 == 121)", "Output: true ✅"],
    ],
    codeMapping: [
      { line: "int d = n % 10;", explanation: "Pulls off the rightmost digit." },
      { line: "rev = rev * 10 + d;", explanation: "Shifts existing digits left by 1 place value and appends new digit." },
      { line: "n = n / 10;", explanation: "Discards the processed rightmost digit." },
    ],
  },

  "reverse-an-array": {
    title: "1D Array In-Place Two-Pointer Swapping",
    type: "ARRAY_BOXES",
    description: "Swap elements at start and end pointers in-place with O(1) auxiliary memory.",
    arrayElements: [
      { index: 0, value: 10, label: "start (0)" },
      { index: 1, value: 20, label: "1" },
      { index: 2, value: 30, label: "2" },
      { index: 3, value: 40, label: "3" },
      { index: 4, value: 50, label: "end (4)" },
    ],
    leftPointer: { index: 0, label: "start ->" },
    rightPointer: { index: 4, label: "<- end" },
    headers: ["Step", "start", "end", "Array State", "Swap Action"],
    rows: [
      ["1", "0", "4", "[10, 20, 30, 40, 50]", "Swap arr[0] and arr[4] -> [50, 20, 30, 40, 10]"],
      ["2", "1", "3", "[50, 20, 30, 40, 10]", "Swap arr[1] and arr[3] -> [50, 40, 30, 20, 10]"],
      ["3", "2", "2", "[50, 40, 30, 20, 10]", "start >= end -> Finished! Final Array Reversed ✅"],
    ],
    codeMapping: [
      { line: "int temp = arr[start];", explanation: "Store start element in temporary variable." },
      { line: "arr[start] = arr[end];", explanation: "Overwrite start element with end element." },
      { line: "arr[end] = temp;", explanation: "Put saved start element into end index." },
    ],
  },

  "two-sum": {
    title: "Two Sum Matching & Array Lookup",
    type: "ARRAY_BOXES",
    description: "For each element `x`, check if complement `(target - x)` exists in memory.",
    arrayElements: [
      { index: 0, value: 2, label: "idx 0", highlight: true },
      { index: 1, value: 7, label: "idx 1", highlight: true },
      { index: 2, value: 11, label: "idx 2" },
      { index: 3, value: 15, label: "idx 3" },
    ],
    headers: ["Index i", "Value arr[i]", "Needed Complement (target - arr[i])", "Seen in Map?", "Action"],
    rows: [
      ["0", "2", "9 - 2 = 7", "No", "Store {2: 0} in Map"],
      ["1", "7", "9 - 7 = 2", "✅ Yes (at index 0)", "Found pair! Return [0, 1]"],
    ],
    codeMapping: [
      { line: "int comp = target - nums[i];", explanation: "Calculate exact difference needed to hit the target." },
      { line: "if (map.containsKey(comp)) return ...;", explanation: "O(1) lookup to find if matching complement was already processed." },
    ],
  },

  "prime-number": {
    title: "Square Root Bound Optimization",
    type: "TRACE_TABLE",
    description: "A number `N` has no divisors greater than `√N` without a smaller counterpart factor.",
    headers: ["Candidate Divisor (i)", "i * i <= N Check", "N % i == 0 Check", "Result"],
    rows: [
      ["i = 2", "2 * 2 = 4 <= 29 (True)", "29 % 2 != 0", "Not divisible"],
      ["i = 3", "3 * 3 = 9 <= 29 (True)", "29 % 3 != 0", "Not divisible"],
      ["i = 4", "4 * 4 = 16 <= 29 (True)", "29 % 4 != 0", "Not divisible"],
      ["i = 5", "5 * 5 = 25 <= 29 (True)", "29 % 5 != 0", "Not divisible"],
      ["i = 6", "6 * 6 = 36 <= 29 (False)", "Loop stops at √29 ≈ 5.38", "No factors found -> 29 is PRIME! ✅"],
    ],
    codeMapping: [
      { line: "if (n <= 1) return false;", explanation: "Numbers 0, 1 and negative integers are not prime." },
      { line: "for (int i = 2; i * i <= n; i++)", explanation: "Only test up to square root of N, reducing time from O(N) to O(√N)." },
      { line: "if (n % i == 0) return false;", explanation: "If evenly divisible by any i, number is composite." },
    ],
  },

  "fibonacci-series": {
    title: "State Transition Iteration (a, b -> next)",
    type: "TRACE_TABLE",
    description: "Each number is the sum of the two preceding numbers: `F(n) = F(n-1) + F(n-2)`.",
    headers: ["Step (i)", "Previous (a)", "Current (b)", "Next Term (c = a + b)", "State Shift"],
    rows: [
      ["i = 0", "-", "-", "0", "Initial base term"],
      ["i = 1", "-", "-", "1", "Initial base term"],
      ["i = 2", "0", "1", "0 + 1 = 1", "a = 1, b = 1"],
      ["i = 3", "1", "1", "1 + 1 = 2", "a = 1, b = 2"],
      ["i = 4", "1", "2", "1 + 2 = 3", "a = 2, b = 3"],
      ["i = 5", "2", "3", "2 + 3 = 5", "a = 3, b = 5"],
    ],
    codeMapping: [
      { line: "int c = a + b;", explanation: "Compute next Fibonacci term." },
      { line: "a = b; b = c;", explanation: "Slide the window forward by 1 step in O(1) memory." },
    ],
  },
};

/**
 * Returns a visual diagram and step trace for a given problem slug
 */
export function getDiagramForSlug(slug: string): VisualDiagram | null {
  if (PROBLEM_DIAGRAMS[slug]) {
    return PROBLEM_DIAGRAMS[slug];
  }

  // Fallback pattern matching for common types
  if (slug.includes("reverse") && slug.includes("array")) {
    return PROBLEM_DIAGRAMS["reverse-an-array"];
  }
  if (slug.includes("palindrome") && slug.includes("string")) {
    return PROBLEM_DIAGRAMS["palindrome-string"];
  }
  if (slug.includes("palindrome") || slug.includes("reverse-number") || slug.includes("sum-of-digits")) {
    return PROBLEM_DIAGRAMS["palindrome-number"];
  }
  if (slug.includes("prime")) {
    return PROBLEM_DIAGRAMS["prime-number"];
  }

  return null;
}
