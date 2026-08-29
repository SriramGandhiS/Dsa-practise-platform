export interface VisualDiagram {
  title: string;
  category: "Array" | "String" | "Pattern" | "Math" | "LinkedList";
  diagramType: "array_traversal" | "array_two_pointer" | "linked_list" | "star_pattern" | "digit_flow";
  arrayData?: {
    elements: Array<string | number>;
    indices: Array<number>;
    loopCode?: string;
    pointers?: { leftLabel?: string; rightLabel?: string };
  };
  linkedListData?: {
    nodes: Array<string | number>;
  };
  patternData?: {
    steps: Array<{ row: string; spaces: string; stars: string }>;
  };
  digitData?: {
    original: number;
    steps: Array<{ step: string; op: string; result: string }>;
  };
  bullets: string[];
}

export const PROBLEM_DIAGRAMS: Record<string, VisualDiagram> = {
  "palindrome-string": {
    title: "Two-Pointer String Traversal",
    category: "String",
    diagramType: "array_two_pointer",
    arrayData: {
      elements: ["m", "a", "d", "a", "m"],
      indices: [0, 1, 2, 3, 4],
      loopCode: "while (left < right) { ... left++; right--; }",
      pointers: { leftLabel: "left (0) →", rightLabel: "← right (4)" },
    },
    bullets: [
      "Compares characters from both ends moving inward toward center.",
      "If str.charAt(left) != str.charAt(right) → immediately not a palindrome.",
      "Stops when left >= right in O(N/2) = O(N) time.",
    ],
  },

  "reverse-an-array": {
    title: "1D Array In-Place Swapping",
    category: "Array",
    diagramType: "array_two_pointer",
    arrayData: {
      elements: ["A", "B", "C", "D", "E"],
      indices: [0, 1, 2, 3, 4],
      loopCode: "for (int i = 0; i < n / 2; i++) { swap(arr[i], arr[n-1-i]); }",
      pointers: { leftLabel: "start (0) →", rightLabel: "← end (n-1)" },
    },
    bullets: [
      "Contiguous 1D memory indexed from 0 to n - 1.",
      "Swaps elements at start and end without using extra memory (O(1) space).",
      "Terminates when start and end pointers cross.",
    ],
  },

  "palindrome-number": {
    title: "Digit Extraction & Reversal",
    category: "Math",
    diagramType: "digit_flow",
    digitData: {
      original: 121,
      steps: [
        { step: "Step 1", op: "121 % 10 = 1", result: "rev = 0 * 10 + 1 = 1 (n becomes 12)" },
        { step: "Step 2", op: "12 % 10 = 2", result: "rev = 1 * 10 + 2 = 12 (n becomes 1)" },
        { step: "Step 3", op: "1 % 10 = 1", result: "rev = 12 * 10 + 1 = 121 (n becomes 0)" },
      ],
    },
    bullets: [
      "Extract rightmost digit using n % 10.",
      "Shift reversed number left by multiplying by 10 and add digit (rev * 10 + d).",
      "Drop rightmost digit using n / 10 until n == 0.",
    ],
  },

  "two-sum": {
    title: "1D Array Traversal & Lookup",
    category: "Array",
    diagramType: "array_traversal",
    arrayData: {
      elements: [2, 7, 11, 15],
      indices: [0, 1, 2, 3],
      loopCode: "for (int i = 0; i < n; i++) { comp = target - arr[i]; }",
    },
    bullets: [
      "Sequential traversal visits each element from index 0 to n - 1.",
      "For each element, check if target - arr[i] is already saved.",
      "Enables O(N) single-pass lookup with a HashMap.",
    ],
  },

  "star-patterns": {
    title: "Nested Loops (Rows & Columns)",
    category: "Pattern",
    diagramType: "star_pattern",
    patternData: {
      steps: [
        { row: "Row 1 (i=1)", spaces: "4 spaces (n - i)", stars: "* (i stars)" },
        { row: "Row 2 (i=2)", spaces: "3 spaces (n - i)", stars: "* * (i stars)" },
        { row: "Row 3 (i=3)", spaces: "2 spaces (n - i)", stars: "* * * (i stars)" },
        { row: "Row 4 (i=4)", spaces: "1 space (n - i)", stars: "* * * * (i stars)" },
        { row: "Row 5 (i=5)", spaces: "0 spaces (n - i)", stars: "* * * * * (i stars)" },
      ],
    },
    bullets: [
      "Outer loop for (int i = 1; i <= n; i++) controls the current row/line.",
      "Inner loop 1 prints the required leading spaces.",
      "Inner loop 2 prints the stars for that row.",
    ],
  },
};

export function getDiagramForSlug(slug: string): VisualDiagram {
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
  if (slug.includes("two-sum") || slug.includes("search") || slug.includes("array") || slug.includes("element")) {
    return PROBLEM_DIAGRAMS["two-sum"];
  }

  // Default fallback to 1D Array Traversal
  return {
    title: "1D Array Traversal",
    category: "Array",
    diagramType: "array_traversal",
    arrayData: {
      elements: ["A", "B", "C", "D", "E"],
      indices: [0, 1, 2, 3, 4],
      loopCode: "for (int i = 0; i < n; i++)",
    },
    bullets: [
      "Zero-based indexing: access elements from index 0 to length - 1.",
      "Standard for-loop sequentially accesses every element in O(N) time.",
      "Allows searching, modifying, or computing aggregates.",
    ],
  };
}
