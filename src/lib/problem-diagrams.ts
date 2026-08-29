export interface VisualDiagram {
  title: string;
  category: "Array" | "String" | "Pattern" | "Math" | "Recursion";
  diagram: {
    type: "array_boxes" | "pattern_loops" | "digit_flow" | "two_pointer";
    boxes?: { index: number | string; value: string | number; label?: string; highlight?: boolean }[];
    pointers?: { left?: string; right?: string; current?: string };
    patternSteps?: { step: string; row: string; spaces: string; stars: string }[];
    flowSteps?: { action: string; formula: string; result: string }[];
  };
  explanation: string[];
}

export const PROBLEM_DIAGRAMS: Record<string, VisualDiagram> = {
  "palindrome-string": {
    title: "Two-Pointer String Symmetry",
    category: "String",
    diagram: {
      type: "two_pointer",
      boxes: [
        { index: 0, value: "'m'", label: "left (0)", highlight: true },
        { index: 1, value: "'a'", label: "1" },
        { index: 2, value: "'d'", label: "2 (center)" },
        { index: 3, value: "'a'", label: "3" },
        { index: 4, value: "'m'", label: "right (4)", highlight: true },
      ],
      pointers: { left: "left (0)", right: "right (4)" },
    },
    explanation: [
      "Place left pointer at start (0) and right pointer at end (length - 1).",
      "Compare characters: if str.charAt(left) != str.charAt(right) -> not palindrome.",
      "Move inward: left++ and right-- until pointers meet.",
    ],
  },

  "palindrome-number": {
    title: "Digit Extraction & Reversal",
    category: "Math",
    diagram: {
      type: "digit_flow",
      flowSteps: [
        { action: "Extract Last Digit", formula: "d = n % 10", result: "Gets rightmost digit" },
        { action: "Append to Reversed", formula: "rev = (rev * 10) + d", result: "Shifts left & adds digit" },
        { action: "Remove Last Digit", formula: "n = n / 10", result: "Discards processed digit" },
      ],
    },
    explanation: [
      "Use n % 10 in a loop while n > 0 to extract each digit.",
      "Accumulate into rev = rev * 10 + digit.",
      "If original == rev, the number is a Palindrome.",
    ],
  },

  "reverse-an-array": {
    title: "1D Array In-Place Swap",
    category: "Array",
    diagram: {
      type: "array_boxes",
      boxes: [
        { index: 0, value: 10, label: "start", highlight: true },
        { index: 1, value: 20, label: "1" },
        { index: 2, value: 30, label: "2" },
        { index: 3, value: 40, label: "3" },
        { index: 4, value: 50, label: "end", highlight: true },
      ],
      pointers: { left: "start (0)", right: "end (n-1)" },
    },
    explanation: [
      "1D Array has zero-based indexing: index 0 to length - 1.",
      "Swap arr[start] with arr[end] using temporary variable.",
      "Increment start++ and decrement end-- until start >= end.",
    ],
  },

  "star-patterns": {
    title: "Nested Loops (Rows & Columns)",
    category: "Pattern",
    diagram: {
      type: "pattern_loops",
      patternSteps: [
        { step: "Row 1 (i=1)", row: "Line 1", spaces: "4 spaces (n - i)", stars: "1 star (i)" },
        { step: "Row 2 (i=2)", row: "Line 2", spaces: "3 spaces (n - i)", stars: "2 stars (i)" },
        { step: "Row 3 (i=3)", row: "Line 3", spaces: "2 spaces (n - i)", stars: "3 stars (i)" },
        { step: "Row 4 (i=4)", row: "Line 4", spaces: "1 space (n - i)", stars: "4 stars (i)" },
        { step: "Row 5 (i=5)", row: "Line 5", spaces: "0 spaces (n - i)", stars: "5 stars (i)" },
      ],
    },
    explanation: [
      "Outer Loop (i = 1 to n): Controls the row number (vertical lines).",
      "Inner Loop 1 (spaces): Prints leading spaces before stars.",
      "Inner Loop 2 (stars): Prints the '*' characters for the current row.",
      "System.out.println(): Moves cursor to next line after row finishes.",
    ],
  },

  "two-sum": {
    title: "Array Lookup & Complement Match",
    category: "Array",
    diagram: {
      type: "array_boxes",
      boxes: [
        { index: 0, value: 2, label: "target - 7 = 2", highlight: true },
        { index: 1, value: 7, label: "target - 2 = 7", highlight: true },
        { index: 2, value: 11, label: "11" },
        { index: 3, value: 15, label: "15" },
      ],
    },
    explanation: [
      "Calculate needed complement: complement = target - nums[i].",
      "Check if complement already exists in HashMap in O(1) time.",
      "If found, return indices [map.get(complement), i].",
    ],
  },

  "prime-number": {
    title: "Square Root (√N) Factor Check",
    category: "Math",
    diagram: {
      type: "digit_flow",
      flowSteps: [
        { action: "Base Case", formula: "if (n <= 1)", result: "Not Prime (0, 1, negatives)" },
        { action: "Loop Limit", formula: "for (i = 2; i * i <= n; i++)", result: "Tests up to √N only" },
        { action: "Divisibility", formula: "if (n % i == 0)", result: "Found factor -> Not Prime" },
      ],
    },
    explanation: [
      "Any non-prime number N must have at least one factor <= √N.",
      "Looping up to i * i <= n optimizes runtime from O(N) to O(√N).",
    ],
  },
};

export function getDiagramForSlug(slug: string): VisualDiagram | null {
  if (PROBLEM_DIAGRAMS[slug]) {
    return PROBLEM_DIAGRAMS[slug];
  }

  if (slug.includes("star") || slug.includes("pattern") || slug.includes("pyramid")) {
    return PROBLEM_DIAGRAMS["star-patterns"];
  }
  if (slug.includes("reverse") && slug.includes("array")) {
    return PROBLEM_DIAGRAMS["reverse-an-array"];
  }
  if (slug.includes("palindrome") && slug.includes("string")) {
    return PROBLEM_DIAGRAMS["palindrome-string"];
  }
  if (slug.includes("palindrome") || slug.includes("reverse-number") || slug.includes("sum-of-digits")) {
    return PROBLEM_DIAGRAMS["palindrome-number"];
  }
  if (slug.includes("two-sum") || slug.includes("search") || slug.includes("array")) {
    return PROBLEM_DIAGRAMS["two-sum"];
  }
  if (slug.includes("prime")) {
    return PROBLEM_DIAGRAMS["prime-number"];
  }

  return null;
}
