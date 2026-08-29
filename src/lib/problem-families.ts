export interface ProblemVariation {
  slug: string;
  title: string;
  dataType: "Integer" | "String" | "Array" | "Math" | "Algorithm";
}

export interface ProblemFamily {
  id: string;
  name: string;
  description: string;
  variations: ProblemVariation[];
}

export const PROBLEM_FAMILIES: ProblemFamily[] = [
  {
    id: "palindrome-series",
    name: "Palindrome Series",
    description: "Compare symmetry across numbers and character sequences",
    variations: [
      { slug: "palindrome-number", title: "Palindrome Number", dataType: "Integer" },
      { slug: "palindrome-string", title: "Palindrome String", dataType: "String" },
    ],
  },
  {
    id: "reverse-series",
    name: "Reverse Series",
    description: "Reverse elements across integers, strings, and arrays",
    variations: [
      { slug: "reverse-number", title: "Reverse Number", dataType: "Integer" },
      { slug: "reverse-string", title: "Reverse a String", dataType: "String" },
      { slug: "reverse-an-array", title: "Reverse an Array", dataType: "Array" },
    ],
  },
  {
    id: "prime-series",
    name: "Prime Series",
    description: "Prime detection and range iterations",
    variations: [
      { slug: "prime-number", title: "Prime Number", dataType: "Integer" },
      { slug: "prime-numbers-in-a-range", title: "Prime Numbers in a Range", dataType: "Integer" },
    ],
  },
  {
    id: "sum-series",
    name: "Sum Series",
    description: "Accumulate sums across digits, arithmetic progressions, arrays, and pair matching",
    variations: [
      { slug: "sum-of-digits", title: "Sum of Digits", dataType: "Integer" },
      { slug: "sum-of-first-n-numbers", title: "Sum of First N Numbers", dataType: "Integer" },
      { slug: "sum-of-array-elements", title: "Sum of Array Elements", dataType: "Array" },
      { slug: "two-sum", title: "Two Sum", dataType: "Array" },
    ],
  },
  {
    id: "counting-series",
    name: "Counting Series",
    description: "Count digits, characters, vowels, words, and element parities",
    variations: [
      { slug: "count-digits", title: "Count Digits", dataType: "Integer" },
      { slug: "count-characters", title: "Count Characters", dataType: "String" },
      { slug: "count-vowels", title: "Count Vowels", dataType: "String" },
      { slug: "count-consonants", title: "Count Consonants", dataType: "String" },
      { slug: "count-words", title: "Count Words", dataType: "String" },
      { slug: "count-even-and-odd-elements", title: "Count Even and Odd Elements", dataType: "Array" },
    ],
  },
  {
    id: "search-series",
    name: "Search Series",
    description: "Linear scan vs divide-and-conquer binary search",
    variations: [
      { slug: "linear-search", title: "Linear Search", dataType: "Array" },
      { slug: "binary-search", title: "Binary Search", dataType: "Algorithm" },
    ],
  },
  {
    id: "sorting-series",
    name: "Sorting Series",
    description: "Classic in-place sorting algorithms",
    variations: [
      { slug: "bubble-sort", title: "Bubble Sort", dataType: "Algorithm" },
      { slug: "selection-sort", title: "Selection Sort", dataType: "Algorithm" },
      { slug: "insertion-sort", title: "Insertion Sort", dataType: "Algorithm" },
    ],
  },
  {
    id: "extreme-series",
    name: "Extremes & Duplicates Series",
    description: "Find maximums, minimums, second largest, duplicates, and missing numbers",
    variations: [
      { slug: "maximum-in-array", title: "Maximum in Array", dataType: "Array" },
      { slug: "minimum-in-array", title: "Minimum in Array", dataType: "Array" },
      { slug: "second-largest-element", title: "Second Largest Element", dataType: "Array" },
      { slug: "find-missing-number", title: "Find Missing Number", dataType: "Array" },
      { slug: "find-duplicate-element", title: "Find Duplicate Element", dataType: "Array" },
      { slug: "remove-duplicates", title: "Remove Duplicates", dataType: "Array" },
    ],
  },
];

/**
 * Returns the family that contains this question slug, if any.
 */
export function getFamilyById(id: string): ProblemFamily | null {
  return PROBLEM_FAMILIES.find((f) => f.id === id) || null;
}

export function getFamilyForSlug(slug: string): ProblemFamily | null {
  return PROBLEM_FAMILIES.find((f) => f.variations.some((v) => v.slug === slug)) || null;
}

export function isFamilyLeader(slug: string): ProblemFamily | null {
  return PROBLEM_FAMILIES.find((f) => f.variations[0]?.slug === slug) || null;
}

