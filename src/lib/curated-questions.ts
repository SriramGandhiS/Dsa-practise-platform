export interface CuratedTopic {
  id: string;
  name: string;
  slug: string;
  level: number;
  orderIndex: number;
  description: string;
  conceptNotes: string;
}

export interface CuratedQuestion {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  level: number;
  topicId: string;
  orderIndex: number;
  conceptTested: string;
  problemStatement: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  examples: string;
  starterCode: string;
  visibleTests: string;
  hiddenTests: string;
  expectedTime: string;
  expectedSpace: string;
  simpleSolution: string;
  simpleExplanation: string;
  optimalSolution: string;
  optimalExplanation: string;
  commonMistakes?: string;
}

export const CURATED_TOPICS: CuratedTopic[] = [
  {
    id: "java-basics",
    name: "Most Interview Questions (Numbers & Logic)",
    slug: "java-basics",
    level: 0,
    orderIndex: 0,
    description: "Top most-asked interview questions: Palindrome, Armstrong, Prime, Fibonacci, Factorial, GCD/LCM, and core logic.",
    conceptNotes: `### Most Interview Questions (Numbers & Logic)
- Extract digit: \`int d = n % 10;\`
- Drop digit: \`n /= 10;\`
- Reverse number: \`rev = rev * 10 + d;\``
  },
  {
    id: "strings",
    name: "Strings",
    slug: "strings",
    level: 1,
    orderIndex: 1,
    description: "String traversal, charAt, frequency count, anagrams, and palindromes.",
    conceptNotes: `### Strings in Java
- Length: \`s.length()\`
- Character at index: \`s.charAt(i)\``
  },
  {
    id: "arrays",
    name: "Arrays",
    slug: "arrays",
    level: 1,
    orderIndex: 2,
    description: "1D arrays, linear search, in-place reversals, duplicates, and merges.",
    conceptNotes: `### Arrays in Java
- Allocate: \`int[] arr = new int[n];\`
- Length: \`arr.length\` (without parentheses)`
  },
  {
    id: "searching-sorting",
    name: "Searching & Sorting Algorithms",
    slug: "searching-sorting",
    level: 2,
    orderIndex: 3,
    description: "Binary search, bubble sort, selection sort, insertion sort, and two sum.",
    conceptNotes: `### Searching & Sorting Algorithms
- Binary Search: O(log N) on sorted arrays
- Two Sum: O(N) using HashMap or O(N log N) using two pointers.`
  }
];

export const CURATED_QUESTIONS: CuratedQuestion[] = [
  // ==========================================
  // TOP 1–20: NUMBER PROBLEMS & LOGIC
  // ==========================================
  {
    id: "palindrome-number",
    slug: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 1,
    conceptTested: "Reversing digits & equality comparison",
    problemStatement: "Read an integer n from standard input. Print \"true\" if n reads the same forward and backward, otherwise print \"false\".",
    constraints: "0 <= n <= 10^9",
    inputFormat: "A single integer: n",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "121", output: "true", explanation: "121 reversed is 121" },
      { input: "123", output: "false", explanation: "123 reversed is 321" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "121", expected: "true" },
      { id: 2, input: "123", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "0", expected: "true" },
      { id: 102, input: "1221", expected: "true" }
    ]),
    expectedTime: "O(log10 N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int rev = 0;
        while (n > 0) {
            rev = rev * 10 + (n % 10);
            n /= 10;
        }
        System.out.println(original == rev);
    }
}`,
    simpleExplanation: "Store original, reverse digits with while loop, and check if original == rev.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "armstrong-number",
    slug: "armstrong-number",
    title: "Armstrong Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 2,
    conceptTested: "Digit power sum",
    problemStatement: "Read an integer n from standard input. Print \"true\" if n is an Armstrong number (where sum of each digit raised to power of total digits equals n), otherwise print \"false\".",
    constraints: "1 <= n <= 10^7",
    inputFormat: "A single integer: n",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "153", output: "true", explanation: "1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153" },
      { input: "120", output: "false", explanation: "1^3 + 2^3 + 0^3 = 9 != 120" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "153", expected: "true" },
      { id: 2, input: "120", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "370", expected: "true" },
      { id: 102, input: "9474", expected: "true" }
    ]),
    expectedTime: "O(log10 N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int digits = String.valueOf(n).length();
        int sum = 0;
        while (n > 0) {
            int d = n % 10;
            sum += Math.pow(d, digits);
            n /= 10;
        }
        System.out.println(original == sum);
    }
}`,
    simpleExplanation: "Find number of digits, then sum d^digits for each digit d.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "prime-number",
    slug: "prime-number",
    title: "Prime Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 3,
    conceptTested: "Divisibility loop & sqrt(N) bound",
    problemStatement: "Read an integer n from standard input. Print \"true\" if n is a prime number, otherwise print \"false\".",
    constraints: "1 <= n <= 10^7",
    inputFormat: "A single integer: n",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "7", output: "true", explanation: "7 has no divisors other than 1 and 7" },
      { input: "10", output: "false", explanation: "10 is divisible by 2 and 5" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "7", expected: "true" },
      { id: 2, input: "10", expected: "false" },
      { id: 3, input: "1", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2", expected: "true" },
      { id: 102, input: "97", expected: "true" }
    ]),
    expectedTime: "O(sqrt(N))",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n <= 1) {
            System.out.println("false");
            return;
        }
        boolean isPrime = true;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
        System.out.println(isPrime);
    }
}`,
    simpleExplanation: "Check if any integer from 2 up to sqrt(n) divides n evenly.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "fibonacci-series",
    slug: "fibonacci-series",
    title: "Fibonacci Series",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 4,
    conceptTested: "Sequence generation with two variables",
    problemStatement: "Read an integer n from standard input. Print the first n terms of the Fibonacci series (starting from 0, 1) separated by spaces.",
    constraints: "1 <= n <= 30",
    inputFormat: "A single integer: n",
    outputFormat: "Print first n terms separated by spaces",
    examples: JSON.stringify([
      { input: "5", output: "0 1 1 2 3", explanation: "First 5 Fibonacci numbers" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5", expected: "0 1 1 2 3" },
      { id: 2, input: "1", expected: "0" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "7", expected: "0 1 1 2 3 5 8" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long a = 0, b = 1;
        for (int i = 1; i <= n; i++) {
            System.out.print(a + (i == n ? "" : " "));
            long next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Start with a = 0, b = 1, print a and update a = b, b = a + b.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "factorial",
    slug: "factorial",
    title: "Factorial",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 5,
    conceptTested: "Accumulative product loop",
    problemStatement: "Read a non-negative integer n from standard input. Print the factorial of n (n!). (Note: 0! = 1).",
    constraints: "0 <= n <= 20",
    inputFormat: "A single integer: n",
    outputFormat: "Print a single integer: n!",
    examples: JSON.stringify([
      { input: "5", output: "120", explanation: "5! = 120" },
      { input: "0", output: "1", explanation: "0! = 1" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5", expected: "120" },
      { id: 2, input: "0", expected: "1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "6", expected: "720" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        System.out.println(fact);
    }
}`,
    simpleExplanation: "Initialize fact = 1, multiply fact *= i for i from 1 to n.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "reverse-number",
    slug: "reverse-number",
    title: "Reverse Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 6,
    conceptTested: "Digit extraction & place value shifting",
    problemStatement: "Read an integer n from standard input. Print the integer with its digits in reverse order.",
    constraints: "0 <= n <= 10^9",
    inputFormat: "A single integer: n",
    outputFormat: "Print the reversed integer",
    examples: JSON.stringify([
      { input: "12345", output: "54321", explanation: "Digits reversed" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "12345", expected: "54321" },
      { id: 2, input: "508", expected: "805" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "0", expected: "0" }
    ]),
    expectedTime: "O(log10 N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int rev = 0;
        while (n > 0) {
            rev = rev * 10 + (n % 10);
            n /= 10;
        }
        System.out.println(rev);
    }
}`,
    simpleExplanation: "Build reversed number using rev = rev * 10 + (n % 10).",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "sum-of-digits",
    slug: "sum-of-digits",
    title: "Sum of Digits",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 7,
    conceptTested: "Modulo % 10 & accumulator",
    problemStatement: "Read an integer n from standard input. Print the sum of all individual digits in n.",
    constraints: "0 <= n <= 10^9",
    inputFormat: "A single integer: n",
    outputFormat: "Print the sum of digits",
    examples: JSON.stringify([
      { input: "1234", output: "10", explanation: "1 + 2 + 3 + 4 = 10" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "1234", expected: "10" },
      { id: 2, input: "99", expected: "18" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "0", expected: "0" }
    ]),
    expectedTime: "O(log10 N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        while (n > 0) {
            sum += n % 10;
            n /= 10;
        }
        System.out.println(sum);
    }
}`,
    simpleExplanation: "Extract last digit using n % 10 and accumulate into sum.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "count-digits",
    slug: "count-digits",
    title: "Count Digits",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 8,
    conceptTested: "While loop & division by 10",
    problemStatement: "Read an integer n from standard input. Print the total count of digits in n. (If n is 0, print 1).",
    constraints: "0 <= n <= 2 * 10^9",
    inputFormat: "A single integer: n",
    outputFormat: "Print the total digit count",
    examples: JSON.stringify([
      { input: "5832", output: "4", explanation: "Contains 4 digits" },
      { input: "0", output: "1", explanation: "0 has 1 digit" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5832", expected: "4" },
      { id: 2, input: "0", expected: "1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "9", expected: "1" }
    ]),
    expectedTime: "O(log10 N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println(1);
            return;
        }
        int count = 0;
        while (n > 0) {
            n /= 10;
            count++;
        }
        System.out.println(count);
    }
}`,
    simpleExplanation: "Divide n by 10 in a while loop, counting iterations.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "gcd-of-two-numbers",
    slug: "gcd-of-two-numbers",
    title: "GCD of Two Numbers",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 9,
    conceptTested: "Euclidean algorithm",
    problemStatement: "Read two space-separated positive integers a and b from standard input. Print their Greatest Common Divisor (GCD).",
    constraints: "1 <= a, b <= 10^9",
    inputFormat: "Two space-separated integers: a and b",
    outputFormat: "Print a single integer: GCD of a and b",
    examples: JSON.stringify([
      { input: "12 18", output: "6", explanation: "GCD(12, 18) = 6" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "12 18", expected: "6" },
      { id: 2, input: "7 13", expected: "1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "48 180", expected: "12" }
    ]),
    expectedTime: "O(log(min(A, B)))",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        while (b != 0) {
            int temp = b;
            b = a % b;
            a = temp;
        }
        System.out.println(a);
    }
}`,
    simpleExplanation: "Euclidean algorithm: while (b != 0) { temp = b; b = a % b; a = temp; }.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "lcm-of-two-numbers",
    slug: "lcm-of-two-numbers",
    title: "LCM of Two Numbers",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 10,
    conceptTested: "LCM formula: (a * b) / GCD(a, b)",
    problemStatement: "Read two space-separated positive integers a and b from standard input. Print their Least Common Multiple (LCM).",
    constraints: "1 <= a, b <= 10^5",
    inputFormat: "Two space-separated integers: a and b",
    outputFormat: "Print a single integer: LCM of a and b",
    examples: JSON.stringify([
      { input: "4 6", output: "12", explanation: "LCM of 4 and 6 is 12" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4 6", expected: "12" },
      { id: 2, input: "5 7", expected: "35" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "12 15", expected: "60" }
    ]),
    expectedTime: "O(log(min(A, B)))",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong();
        long b = sc.nextLong();
        long gcd = getGcd(a, b);
        long lcm = (a * b) / gcd;
        System.out.println(lcm);
    }

    private static long getGcd(long a, long b) {
        while (b != 0) {
            long t = b;
            b = a % b;
            a = t;
        }
        return a;
    }
}`,
    simpleExplanation: "Compute GCD using Euclidean algorithm, then LCM = (a * b) / GCD.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "even-or-odd",
    slug: "even-or-odd",
    title: "Even or Odd",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 11,
    conceptTested: "Modulo operator % 2 & if/else",
    problemStatement: "Read an integer n from standard input. Print \"Even\" if n is divisible by 2, otherwise print \"Odd\".",
    constraints: "-10^9 <= n <= 10^9",
    inputFormat: "A single integer: n",
    outputFormat: "Print \"Even\" or \"Odd\"",
    examples: JSON.stringify([
      { input: "4", output: "Even", explanation: "4 is divisible by 2" },
      { input: "7", output: "Odd", explanation: "7 is not divisible by 2" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4", expected: "Even" },
      { id: 2, input: "7", expected: "Odd" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "0", expected: "Even" },
      { id: 102, input: "-6", expected: "Even" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
    }
}`,
    simpleExplanation: "Check if n % 2 == 0.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "largest-of-three-numbers",
    slug: "largest-of-three-numbers",
    title: "Largest of Three Numbers",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 12,
    conceptTested: "Logical AND (&&) in conditions",
    problemStatement: "Read three space-separated integers a, b, and c from standard input. Print the largest value among them.",
    constraints: "-10^9 <= a, b, c <= 10^9",
    inputFormat: "Three space-separated integers: a, b, and c",
    outputFormat: "Print a single integer: the largest value",
    examples: JSON.stringify([
      { input: "10 25 15", output: "25", explanation: "25 is greatest" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "10 25 15", expected: "25" },
      { id: 2, input: "-5 -1 -10", expected: "-1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "5 5 5", expected: "5" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        if (a >= b && a >= c) System.out.println(a);
        else if (b >= a && b >= c) System.out.println(b);
        else System.out.println(c);
    }
}`,
    simpleExplanation: "Compare each number against the other two using >= and &&.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "swap-two-numbers",
    slug: "swap-two-numbers",
    title: "Swap Two Numbers",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 13,
    conceptTested: "Variables & swapping technique",
    problemStatement: "Read two space-separated integers a and b from standard input. Swap their values and print them in swapped order (b a) separated by a space.",
    constraints: "-10^9 <= a, b <= 10^9",
    inputFormat: "Two space-separated integers: a and b",
    outputFormat: "Print the swapped integers separated by space: b a",
    examples: JSON.stringify([
      { input: "5 9", output: "9 5", explanation: "Swapped 5 and 9" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5 9", expected: "9 5" },
      { id: 2, input: "100 -20", expected: "-20 100" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "0 42", expected: "42 0" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int temp = a;
        a = b;
        b = temp;
        System.out.println(a + " " + b);
    }
}`,
    simpleExplanation: "Use temporary variable temp to swap values.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "sum-of-first-n-numbers",
    slug: "sum-of-first-n-numbers",
    title: "Sum of First N Numbers",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 14,
    conceptTested: "Accumulator loop & math formula",
    problemStatement: "Read a positive integer N from standard input. Print the sum of all integers from 1 to N.",
    constraints: "1 <= N <= 10^5",
    inputFormat: "A single integer: N",
    outputFormat: "Print the total sum",
    examples: JSON.stringify([
      { input: "5", output: "15", explanation: "1 + 2 + 3 + 4 + 5 = 15" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5", expected: "15" },
      { id: 2, input: "10", expected: "55" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1", expected: "1" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        long sum = n * (n + 1) / 2;
        System.out.println(sum);
    }
}`,
    simpleExplanation: "Use formula n*(n+1)/2.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "multiplication-table",
    slug: "multiplication-table",
    title: "Multiplication Table",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 15,
    conceptTested: "For loop multiples",
    problemStatement: "Read an integer n from standard input. Print the multiplication table of n for multipliers 1 through 10, each result on a new line.",
    constraints: "1 <= n <= 1000",
    inputFormat: "A single integer: n",
    outputFormat: "Print 10 lines: n * 1, n * 2, ..., n * 10",
    examples: JSON.stringify([
      { input: "3", output: "3\n6\n9\n12\n15\n18\n21\n24\n27\n30", explanation: "Multiples of 3" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "3", expected: "3\n6\n9\n12\n15\n18\n21\n24\n27\n30" },
      { id: 2, input: "5", expected: "5\n10\n15\n20\n25\n30\n35\n40\n45\n50" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1", expected: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= 10; i++) {
            System.out.println(n * i);
        }
    }
}`,
    simpleExplanation: "Loop i from 1 to 10, printing n * i.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "perfect-number",
    slug: "perfect-number",
    title: "Perfect Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 16,
    conceptTested: "Proper divisors sum",
    problemStatement: "Read an integer n from standard input. Print \"true\" if n is a perfect number (equal to the sum of its proper positive divisors excluding itself), otherwise print \"false\".",
    constraints: "1 <= n <= 10^6",
    inputFormat: "A single integer: n",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "6", output: "true", explanation: "1 + 2 + 3 = 6" },
      { input: "12", output: "false", explanation: "1 + 2 + 3 + 4 + 6 = 16 != 12" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "6", expected: "true" },
      { id: 2, input: "28", expected: "true" },
      { id: 3, input: "12", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "496", expected: "true" }
    ]),
    expectedTime: "O(sqrt(N))",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n <= 1) {
            System.out.println("false");
            return;
        }
        int sum = 1;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                sum += i;
                if (i * i != n) sum += n / i;
            }
        }
        System.out.println(sum == n);
    }
}`,
    simpleExplanation: "Sum all proper divisors and check if sum == n.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "strong-number",
    slug: "strong-number",
    title: "Strong Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 17,
    conceptTested: "Sum of digit factorials",
    problemStatement: "Read an integer n from standard input. Print \"true\" if n is a Strong Number (where the sum of the factorials of its digits equals n), otherwise print \"false\".",
    constraints: "1 <= n <= 10^6",
    inputFormat: "A single integer: n",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "145", output: "true", explanation: "1! + 4! + 5! = 1 + 24 + 120 = 145" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "145", expected: "true" },
      { id: 2, input: "123", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1", expected: "true" },
      { id: 102, input: "2", expected: "true" }
    ]),
    expectedTime: "O(log10 N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int original = n;
        int sum = 0;
        while (n > 0) {
            int d = n % 10;
            sum += fact(d);
            n /= 10;
        }
        System.out.println(original == sum);
    }

    private static int fact(int d) {
        int r = 1;
        for (int i = 1; i <= d; i++) r *= i;
        return r;
    }
}`,
    simpleExplanation: "Extract digits, compute factorials, check if sum == n.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "power-of-a-number",
    slug: "power-of-a-number",
    title: "Power of a Number",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 18,
    conceptTested: "Exponentiation loop",
    problemStatement: "Read two space-separated non-negative integers base and exp from standard input. Print base^exp. (Note: base^0 = 1).",
    constraints: "0 <= base <= 20, 0 <= exp <= 15",
    inputFormat: "Two space-separated integers: base and exp",
    outputFormat: "Print a single integer: base^exp",
    examples: JSON.stringify([
      { input: "2 5", output: "32", explanation: "2^5 = 32" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "2 5", expected: "32" },
      { id: 2, input: "5 0", expected: "1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "3 4", expected: "81" }
    ]),
    expectedTime: "O(exp)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long base = sc.nextLong();
        int exp = sc.nextInt();
        long res = 1;
        for (int i = 1; i <= exp; i++) res *= base;
        System.out.println(res);
    }
}`,
    simpleExplanation: "Multiply base exp times in loop.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "prime-numbers-in-a-range",
    slug: "prime-numbers-in-a-range",
    title: "Prime Numbers in a Range",
    difficulty: "EASY",
    level: 0,
    topicId: "java-basics",
    orderIndex: 19,
    conceptTested: "Nested loops & prime filtering",
    problemStatement: "Read two space-separated integers start and end from standard input. Print all prime numbers between start and end (inclusive), separated by spaces on a single line.",
    constraints: "1 <= start <= end <= 1000",
    inputFormat: "Two space-separated integers: start and end",
    outputFormat: "Print space-separated prime numbers",
    examples: JSON.stringify([
      { input: "1 10", output: "2 3 5 7", explanation: "Primes between 1 and 10" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "1 10", expected: "2 3 5 7" },
      { id: 2, input: "10 20", expected: "11 13 17 19" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "20 30", expected: "23 29" }
    ]),
    expectedTime: "O(N * sqrt(N))",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int start = sc.nextInt();
        int end = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int num = start; num <= end; num++) {
            if (num > 1) {
                boolean isPrime = true;
                for (int i = 2; i * i <= num; i++) {
                    if (num % i == 0) {
                        isPrime = false;
                        break;
                    }
                }
                if (isPrime) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(num);
                }
            }
        }
        System.out.println(sb.toString());
    }
}`,
    simpleExplanation: "Check prime condition for each number in the range.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "leap-year",
    slug: "leap-year",
    title: "Leap Year",
    difficulty: "BEGINNER",
    level: 0,
    topicId: "java-basics",
    orderIndex: 20,
    conceptTested: "Leap year formula",
    problemStatement: "Read a year (integer) from standard input. Print \"true\" if the year is a leap year, otherwise print \"false\".",
    constraints: "1 <= year <= 10^5",
    inputFormat: "A single integer: year",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "2024", output: "true", explanation: "2024 is divisible by 4 and not by 100" },
      { input: "1900", output: "false", explanation: "1900 is divisible by 100 but not by 400" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "2024", expected: "true" },
      { id: 2, input: "1900", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2000", expected: "true" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int year = sc.nextInt();
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
            System.out.println("true");
        } else {
            System.out.println("false");
        }
    }
}`,
    simpleExplanation: "Check (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0).",
    optimalSolution: "",
    optimalExplanation: ""
  },

  // ==========================================
  // TOP 21–30: BASIC STRINGS
  // ==========================================
  {
    id: "reverse-string",
    slug: "reverse-string",
    title: "Reverse a String",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 21,
    conceptTested: "String charAt & backward loop",
    problemStatement: "Read a single word/string s from standard input. Print the string in reverse order.",
    constraints: "1 <= s.length() <= 10^4",
    inputFormat: "A single string: s",
    outputFormat: "Print the reversed string",
    examples: JSON.stringify([
      { input: "hello", output: "olleh", explanation: "Characters reversed" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "hello", expected: "olleh" },
      { id: 2, input: "Java", expected: "avaJ" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "a", expected: "a" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        for (int i = s.length() - 1; i >= 0; i--) {
            System.out.print(s.charAt(i));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Loop from s.length() - 1 down to 0 printing each character.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "palindrome-string",
    slug: "palindrome-string",
    title: "Palindrome String",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 22,
    conceptTested: "Two pointers / String equality",
    problemStatement: "Read a string s from standard input. Print \"true\" if s reads the same forwards and backwards, otherwise print \"false\".",
    constraints: "1 <= s.length() <= 10^5",
    inputFormat: "A single string: s",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "madam", output: "true", explanation: "madam reversed is madam" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "madam", expected: "true" },
      { id: 2, input: "hello", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "racecar", expected: "true" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int l = 0, r = s.length() - 1;
        boolean pal = true;
        while (l < r) {
            if (s.charAt(l) != s.charAt(r)) {
                pal = false;
                break;
            }
            l++;
            r--;
        }
        System.out.println(pal);
    }
}`,
    simpleExplanation: "Compare opposite characters with two pointers.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "count-vowels",
    slug: "count-vowels",
    title: "Count Vowels",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 23,
    conceptTested: "Character inspection & counting",
    problemStatement: "Read a string s from standard input. Print the total number of vowels ('a', 'e', 'i', 'o', 'u' - case-insensitive) in s.",
    constraints: "1 <= s.length() <= 10^5",
    inputFormat: "A single string: s",
    outputFormat: "Print the integer count of vowels",
    examples: JSON.stringify([
      { input: "HelloWorld", output: "3", explanation: "'e', 'o', 'o' are vowels" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "HelloWorld", expected: "3" },
      { id: 2, input: "Java", expected: "2" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "xyz", expected: "0" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next().toLowerCase();
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') count++;
        }
        System.out.println(count);
    }
}`,
    simpleExplanation: "Iterate characters, increment count on vowel match.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "count-consonants",
    slug: "count-consonants",
    title: "Count Consonants",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 24,
    conceptTested: "Alphabet & vowel filtering",
    problemStatement: "Read a string s from standard input. Print the total count of consonant letters (alphabets that are not vowels - case-insensitive) in s.",
    constraints: "1 <= s.length() <= 10^5",
    inputFormat: "A single string: s",
    outputFormat: "Print the integer count of consonants",
    examples: JSON.stringify([
      { input: "Java", output: "2", explanation: "'J' and 'v' are consonants" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "Java", expected: "2" },
      { id: 2, input: "aeiou", expected: "0" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "Hello", expected: "3" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next().toLowerCase();
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c >= 'a' && c <= 'z' && !(c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')) {
                count++;
            }
        }
        System.out.println(count);
    }
}`,
    simpleExplanation: "Check if char is alphabet and not a vowel.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "count-characters",
    slug: "count-characters",
    title: "Count Characters",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 25,
    conceptTested: "String length",
    problemStatement: "Read a string s from standard input. Print the total number of characters in the string.",
    constraints: "1 <= s.length() <= 10^5",
    inputFormat: "A single string: s",
    outputFormat: "Print a single integer: length of s",
    examples: JSON.stringify([
      { input: "Programming", output: "11", explanation: "11 characters" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "Programming", expected: "11" },
      { id: 2, input: "Java", expected: "4" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "a", expected: "1" }
    ]),
    expectedTime: "O(1)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(s.length());
    }
}`,
    simpleExplanation: "Print s.length().",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "count-words",
    slug: "count-words",
    title: "Count Words",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 26,
    conceptTested: "Whitespace splitting",
    problemStatement: "Read a single line of text containing space-separated words from standard input. Print the total count of words in the line.",
    constraints: "1 <= length of text <= 10^5",
    inputFormat: "A line of text",
    outputFormat: "Print the total number of words",
    examples: JSON.stringify([
      { input: "Java is an object oriented language", output: "6", explanation: "6 words" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "Java is an object oriented language", expected: "6" },
      { id: 2, input: "Hello World", expected: "2" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "One", expected: "1" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        if (line.isEmpty()) {
            System.out.println(0);
            return;
        }
        String[] words = line.split("\\\\s+");
        System.out.println(words.length);
    }
}`,
    simpleExplanation: "Split line by whitespace \\\\s+ and print array length.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "character-frequency",
    slug: "character-frequency",
    title: "Character Frequency",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 27,
    conceptTested: "Frequency array / count table",
    problemStatement: "Read a lowercase string s from standard input. Print each character followed by its frequency (e.g. \"a2 b1\"), sorted alphabetically.",
    constraints: "1 <= s.length() <= 10^5",
    inputFormat: "A single lowercase string: s",
    outputFormat: "Print space-separated pairs of char and count (e.g. \"a3 b1 n2\")",
    examples: JSON.stringify([
      { input: "banana", output: "a3 b1 n2", explanation: "'a' occurs 3 times, 'b' 1 time, 'n' 2 times" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "banana", expected: "a3 b1 n2" },
      { id: 2, input: "tree", expected: "e2 r1 t1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "a", expected: "a1" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int[] freq = new int[26];
        for (int i = 0; i < s.length(); i++) freq[s.charAt(i) - 'a']++;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 26; i++) {
            if (freq[i] > 0) {
                if (sb.length() > 0) sb.append(" ");
                sb.append((char)('a' + i)).append(freq[i]);
            }
        }
        System.out.println(sb.toString());
    }
}`,
    simpleExplanation: "Count frequencies with 26-size array and print non-zero counts.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "remove-spaces",
    slug: "remove-spaces",
    title: "Remove Spaces",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 28,
    conceptTested: "String replaceAll / filtering",
    problemStatement: "Read a line of text containing spaces from standard input. Print the string after removing all whitespace characters.",
    constraints: "1 <= length of line <= 10^5",
    inputFormat: "A single line of text with spaces",
    outputFormat: "Print the string with all spaces removed",
    examples: JSON.stringify([
      { input: "H e l l o World", output: "HelloWorld", explanation: "Spaces removed" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "H e l l o World", expected: "HelloWorld" },
      { id: 2, input: " Java DSA ", expected: "JavaDSA" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "NoSpaces", expected: "NoSpaces" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        System.out.println(line.replaceAll("\\\\s+", ""));
    }
}`,
    simpleExplanation: "Use replaceAll(\"\\\\s+\", \"\").",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "first-non-repeated-character",
    slug: "first-non-repeated-character",
    title: "First Non-Repeated Character",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 29,
    conceptTested: "Two-pass frequency lookup",
    problemStatement: "Read a lowercase string s from standard input. Print the first character that does not repeat anywhere in the string. (If all characters repeat, print \"-1\").",
    constraints: "1 <= s.length() <= 10^5",
    inputFormat: "A single lowercase string: s",
    outputFormat: "Print the first unique character or \"-1\"",
    examples: JSON.stringify([
      { input: "swiss", output: "w", explanation: "'w' is the first unique character" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "swiss", expected: "w" },
      { id: 2, input: "aabb", expected: "-1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "leetcode", expected: "l" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int[] count = new int[256];
        for (int i = 0; i < s.length(); i++) count[s.charAt(i)]++;
        for (int i = 0; i < s.length(); i++) {
            if (count[s.charAt(i)] == 1) {
                System.out.println(s.charAt(i));
                return;
            }
        }
        System.out.println("-1");
    }
}`,
    simpleExplanation: "Count occurrences and find the first char with count == 1.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "anagram",
    slug: "anagram",
    title: "Anagram",
    difficulty: "EASY",
    level: 1,
    topicId: "strings",
    orderIndex: 30,
    conceptTested: "Character counts comparison",
    problemStatement: "Read two space-separated lowercase strings s1 and s2 from standard input. Print \"true\" if s1 and s2 are anagrams (contain identical character counts), otherwise print \"false\".",
    constraints: "1 <= s1.length(), s2.length() <= 10^5",
    inputFormat: "Two space-separated strings: s1 and s2",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "listen silent", output: "true", explanation: "Same character frequencies" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "listen silent", expected: "true" },
      { id: 2, input: "hello world", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "anagram nagaram", expected: "true" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s1 = sc.next();
        String s2 = sc.next();
        if (s1.length() != s2.length()) {
            System.out.println("false");
            return;
        }
        int[] count = new int[26];
        for (int i = 0; i < s1.length(); i++) {
            count[s1.charAt(i) - 'a']++;
            count[s2.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) {
                System.out.println("false");
                return;
            }
        }
        System.out.println("true");
    }
}`,
    simpleExplanation: "Increment for s1, decrement for s2, verify all 0.",
    optimalSolution: "",
    optimalExplanation: ""
  },

  // ==========================================
  // TOP 31–45: BASIC ARRAYS
  // ==========================================
  {
    id: "read-and-print-array",
    slug: "read-and-print-array",
    title: "Read and Print Array",
    difficulty: "BEGINNER",
    level: 1,
    topicId: "arrays",
    orderIndex: 31,
    conceptTested: "Array allocation & input loop",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print all array elements on a single line separated by spaces.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print array elements separated by spaces",
    examples: JSON.stringify([
      { input: "4\n10 20 30 40", output: "10 20 30 40", explanation: "Prints all elements" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4\n10 20 30 40", expected: "10 20 30 40" },
      { id: 2, input: "1\n99", expected: "99" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "3\n1 2 3", expected: "1 2 3" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Allocate array, read elements, print separated by space.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "sum-of-array-elements",
    slug: "sum-of-array-elements",
    title: "Sum of Array Elements",
    difficulty: "BEGINNER",
    level: 1,
    topicId: "arrays",
    orderIndex: 32,
    conceptTested: "Array accumulator",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print the sum of all elements in the array.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print the total sum",
    examples: JSON.stringify([
      { input: "4\n1 2 3 4", output: "10", explanation: "1 + 2 + 3 + 4 = 10" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4\n1 2 3 4", expected: "10" },
      { id: 2, input: "2\n-5 5", expected: "0" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n42", expected: "42" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) sum += sc.nextLong();
        System.out.println(sum);
    }
}`,
    simpleExplanation: "Accumulate elements into sum variable.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "maximum-in-array",
    slug: "maximum-in-array",
    title: "Maximum in Array",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 33,
    conceptTested: "Linear scan for maximum element",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print the maximum value in the array.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print the maximum integer",
    examples: JSON.stringify([
      { input: "5\n3 8 2 15 6", output: "15", explanation: "15 is largest" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n3 8 2 15 6", expected: "15" },
      { id: 2, input: "3\n-10 -3 -50", expected: "-3" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n42", expected: "42" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int max = sc.nextInt();
        for (int i = 1; i < n; i++) {
            int val = sc.nextInt();
            if (val > max) max = val;
        }
        System.out.println(max);
    }
}`,
    simpleExplanation: "Initialize max with first element, update when larger is found.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "minimum-in-array",
    slug: "minimum-in-array",
    title: "Minimum in Array",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 34,
    conceptTested: "Linear scan for minimum element",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print the minimum value in the array.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print the minimum integer",
    examples: JSON.stringify([
      { input: "5\n8 3 12 1 9", output: "1", explanation: "1 is smallest" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n8 3 12 1 9", expected: "1" },
      { id: 2, input: "2\n-10 -5", expected: "-10" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n7", expected: "7" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int min = sc.nextInt();
        for (int i = 1; i < n; i++) {
            int val = sc.nextInt();
            if (val < min) min = val;
        }
        System.out.println(min);
    }
}`,
    simpleExplanation: "Initialize min with first element, update when smaller is found.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "count-even-and-odd-elements",
    slug: "count-even-and-odd-elements",
    title: "Count Even and Odd Elements",
    difficulty: "BEGINNER",
    level: 1,
    topicId: "arrays",
    orderIndex: 35,
    conceptTested: "Array modulo counting",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print the count of even numbers and odd numbers separated by a space (evenCount oddCount).",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print two integers separated by space: evenCount oddCount",
    examples: JSON.stringify([
      { input: "5\n1 2 3 4 5", output: "2 3", explanation: "2 evens, 3 odds" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n1 2 3 4 5", expected: "2 3" },
      { id: 2, input: "2\n2 4", expected: "2 0" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "3\n1 3 5", expected: "0 3" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int evens = 0, odds = 0;
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (val % 2 == 0) evens++;
            else odds++;
        }
        System.out.println(evens + " " + odds);
    }
}`,
    simpleExplanation: "Count even numbers with val % 2 == 0, else odds.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "linear-search",
    slug: "linear-search",
    title: "Linear Search",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 36,
    conceptTested: "Sequential array search",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers, and target integer k from standard input. Print the 0-based index of k in the array, or -1 if not found.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers, and target integer k",
    outputFormat: "Print the 0-based index or -1",
    examples: JSON.stringify([
      { input: "5\n10 20 30 40 50\n30", output: "2", explanation: "30 is at index 2" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n10 20 30 40 50\n30", expected: "2" },
      { id: 2, input: "4\n1 2 3 4\n9", expected: "-1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n5\n5", expected: "0" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int k = sc.nextInt();
        for (int i = 0; i < n; i++) {
            if (arr[i] == k) {
                System.out.println(i);
                return;
            }
        }
        System.out.println(-1);
    }
}`,
    simpleExplanation: "Search from index 0 to n - 1.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "reverse-an-array",
    slug: "reverse-an-array",
    title: "Reverse an Array",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 37,
    conceptTested: "Array reversal traversal",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print the array elements in reverse order separated by spaces.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print elements in reversed order separated by spaces",
    examples: JSON.stringify([
      { input: "4\n1 2 3 4", output: "4 3 2 1", explanation: "Reversed elements" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4\n1 2 3 4", expected: "4 3 2 1" },
      { id: 2, input: "1\n5", expected: "5" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "3\n10 20 30", expected: "30 20 10" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        for (int i = n - 1; i >= 0; i--) {
            System.out.print(arr[i] + (i == 0 ? "" : " "));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Iterate from index n - 1 down to 0.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "check-if-array-is-sorted",
    slug: "check-if-array-is-sorted",
    title: "Check if Array is Sorted",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 38,
    conceptTested: "Adjacent element comparison arr[i] <= arr[i+1]",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print \"true\" if the array is sorted in non-decreasing order, otherwise print \"false\".",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print \"true\" or \"false\"",
    examples: JSON.stringify([
      { input: "5\n1 2 3 4 5", output: "true", explanation: "Sorted" },
      { input: "4\n1 3 2 4", output: "false", explanation: "3 > 2" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n1 2 3 4 5", expected: "true" },
      { id: 2, input: "4\n1 3 2 4", expected: "false" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n10", expected: "true" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        for (int i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                System.out.println("false");
                return;
            }
        }
        System.out.println("true");
    }
}`,
    simpleExplanation: "Check if arr[i] > arr[i + 1] anywhere.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "second-largest-element",
    slug: "second-largest-element",
    title: "Second Largest Element",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 39,
    conceptTested: "Single pass largest & second largest tracking",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Print the second largest distinct element in the array, or -1 if no distinct second largest exists.",
    constraints: "2 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print the second largest distinct integer or -1",
    examples: JSON.stringify([
      { input: "5\n12 35 1 10 34", output: "34", explanation: "34 is second largest" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n12 35 1 10 34", expected: "34" },
      { id: 2, input: "3\n10 10 10", expected: "-1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2\n5 10", expected: "5" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (val > first) {
                second = first;
                first = val;
            } else if (val > second && val != first) {
                second = val;
            }
        }
        System.out.println(second == Integer.MIN_VALUE ? -1 : second);
    }
}`,
    simpleExplanation: "Track first and second largest in a single loop.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "remove-duplicates",
    slug: "remove-duplicates",
    title: "Remove Duplicates",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 40,
    conceptTested: "Sorted array deduplication",
    problemStatement: "Read an integer n (size of sorted array) followed by n space-separated integers in non-decreasing order from standard input. Print unique elements separated by spaces.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated sorted integers",
    outputFormat: "Print unique elements separated by spaces",
    examples: JSON.stringify([
      { input: "6\n1 1 2 2 3 4", output: "1 2 3 4", explanation: "Duplicates removed" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "6\n1 1 2 2 3 4", expected: "1 2 3 4" },
      { id: 2, input: "3\n1 1 1", expected: "1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "4\n1 2 3 4", expected: "1 2 3 4" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n == 0) return;
        int prev = sc.nextInt();
        System.out.print(prev);
        for (int i = 1; i < n; i++) {
            int cur = sc.nextInt();
            if (cur != prev) {
                System.out.print(" " + cur);
                prev = cur;
            }
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Print current element if it differs from previous.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "move-zeros-to-end",
    slug: "move-zeros-to-end",
    title: "Move Zeros to End",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 41,
    conceptTested: "In-place zero shifting",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Move all 0s to the end of the array while maintaining the relative order of non-zero elements, and print the array separated by spaces.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print the array with zeros at the end",
    examples: JSON.stringify([
      { input: "5\n0 1 0 3 12", output: "1 3 12 0 0", explanation: "Zeros moved to end" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n0 1 0 3 12", expected: "1 3 12 0 0" },
      { id: 2, input: "3\n0 0 1", expected: "1 0 0" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "4\n1 2 3 4", expected: "1 2 3 4" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int idx = 0;
        for (int i = 0; i < n; i++) {
            if (arr[i] != 0) arr[idx++] = arr[i];
        }
        while (idx < n) arr[idx++] = 0;
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Copy non-zero elements forward, fill remaining with 0.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "find-missing-number",
    slug: "find-missing-number",
    title: "Find Missing Number",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 42,
    conceptTested: "Expected sum formula n*(n+1)/2 vs actual sum",
    problemStatement: "Read an integer n followed by n - 1 space-separated integers containing distinct numbers from 1 to n with one number missing. Print the missing integer.",
    constraints: "2 <= n <= 10^5",
    inputFormat: "First integer n, followed by n - 1 space-separated integers",
    outputFormat: "Print the single missing integer",
    examples: JSON.stringify([
      { input: "5\n1 2 4 5", output: "3", explanation: "3 is missing from 1 to 5" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n1 2 4 5", expected: "3" },
      { id: 2, input: "3\n1 3", expected: "2" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2\n1", expected: "2" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        long expectedSum = n * (n + 1) / 2;
        long actualSum = 0;
        for (int i = 0; i < n - 1; i++) {
            actualSum += sc.nextLong();
        }
        System.out.println(expectedSum - actualSum);
    }
}`,
    simpleExplanation: "Missing number = expectedSum - actualSum.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "find-duplicate-element",
    slug: "find-duplicate-element",
    title: "Find Duplicate Element",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 43,
    conceptTested: "HashSet / Frequency lookup",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers where exactly one element repeats. Print the duplicate element.",
    constraints: "2 <= n <= 10^5",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print the duplicate integer",
    examples: JSON.stringify([
      { input: "5\n1 3 4 2 2", output: "2", explanation: "2 is duplicate" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n1 3 4 2 2", expected: "2" },
      { id: 2, input: "3\n5 5 9", expected: "5" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "4\n7 8 9 7", expected: "7" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        HashSet<Integer> set = new HashSet<>();
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (!set.add(val)) {
                System.out.println(val);
                return;
            }
        }
    }
}`,
    simpleExplanation: "Use HashSet.add(val) which returns false on duplicate.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "merge-two-arrays",
    slug: "merge-two-arrays",
    title: "Merge Two Arrays",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 44,
    conceptTested: "Array concatenation & traversal",
    problemStatement: "Read integer n1 and n1 space-separated integers, followed by integer n2 and n2 space-separated integers from standard input. Print the merged elements (array 1 followed by array 2) separated by spaces.",
    constraints: "1 <= n1, n2 <= 10^5",
    inputFormat: "First n1 and n1 integers, then n2 and n2 integers",
    outputFormat: "Print all merged elements separated by spaces",
    examples: JSON.stringify([
      { input: "3\n1 2 3\n2\n4 5", output: "1 2 3 4 5", explanation: "Merged arrays" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "3\n1 2 3\n2\n4 5", expected: "1 2 3 4 5" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n10\n1\n20", expected: "10 20" }
    ]),
    expectedTime: "O(N1 + N2)",
    expectedSpace: "O(N1 + N2)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n1 = sc.nextInt();
        int[] arr1 = new int[n1];
        for (int i = 0; i < n1; i++) arr1[i] = sc.nextInt();
        int n2 = sc.nextInt();
        int[] arr2 = new int[n2];
        for (int i = 0; i < n2; i++) arr2[i] = sc.nextInt();

        StringBuilder sb = new StringBuilder();
        for (int x : arr1) sb.append(x).append(" ");
        for (int i = 0; i < n2; i++) {
            sb.append(arr2[i]).append(i == n2 - 1 ? "" : " ");
        }
        System.out.println(sb.toString().trim());
    }
}`,
    simpleExplanation: "Read both arrays and print sequentially.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "common-elements-in-two-arrays",
    slug: "common-elements-in-two-arrays",
    title: "Common Elements in Two Arrays",
    difficulty: "EASY",
    level: 1,
    topicId: "arrays",
    orderIndex: 45,
    conceptTested: "Set intersection",
    problemStatement: "Read integer n1 and n1 space-separated integers, followed by integer n2 and n2 space-separated integers from standard input. Print the common distinct elements present in both arrays, separated by spaces in order of occurrence in array 1. (If none, print \"-1\").",
    constraints: "1 <= n1, n2 <= 10^5",
    inputFormat: "First n1 and n1 integers, then n2 and n2 integers",
    outputFormat: "Print common distinct integers separated by space or -1",
    examples: JSON.stringify([
      { input: "4\n1 2 3 4\n3\n2 4 6", output: "2 4", explanation: "2 and 4 are present in both" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4\n1 2 3 4\n3\n2 4 6", expected: "2 4" },
      { id: 2, input: "2\n1 2\n2\n3 4", expected: "-1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "3\n5 5 10\n2\n5 10", expected: "5 10" }
    ]),
    expectedTime: "O(N1 + N2)",
    expectedSpace: "O(N2)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n1 = sc.nextInt();
        int[] arr1 = new int[n1];
        for (int i = 0; i < n1; i++) arr1[i] = sc.nextInt();
        int n2 = sc.nextInt();
        HashSet<Integer> set2 = new HashSet<>();
        for (int i = 0; i < n2; i++) set2.add(sc.nextInt());

        HashSet<Integer> printed = new HashSet<>();
        StringBuilder sb = new StringBuilder();
        for (int x : arr1) {
            if (set2.contains(x) && printed.add(x)) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(x);
            }
        }
        System.out.println(sb.length() > 0 ? sb.toString() : "-1");
    }
}`,
    simpleExplanation: "Store second array in a HashSet, then filter array 1.",
    optimalSolution: "",
    optimalExplanation: ""
  },

  // ==========================================
  // TOP 46–50: BASIC PLACEMENT DSA
  // ==========================================
  {
    id: "binary-search",
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "EASY",
    level: 2,
    topicId: "searching-sorting",
    orderIndex: 46,
    conceptTested: "Divide & conquer O(log N) search on sorted array",
    problemStatement: "Read an integer n (size of sorted array) followed by n space-separated sorted integers, and a target integer target from standard input. Print the 0-based index of target using Binary Search, or -1 if not found.",
    constraints: "1 <= n <= 10^5",
    inputFormat: "First integer n, then n space-separated sorted integers, and integer target",
    outputFormat: "Print the 0-based index of target or -1",
    examples: JSON.stringify([
      { input: "6\n-1 0 3 5 9 12\n9", output: "4", explanation: "9 is at index 4" },
      { input: "5\n1 3 5 7 9\n2", output: "-1", explanation: "2 is not in the array" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "6\n-1 0 3 5 9 12\n9", expected: "4" },
      { id: 2, input: "5\n1 3 5 7 9\n2", expected: "-1" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n5\n5", expected: "0" }
    ]),
    expectedTime: "O(log N)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int target = sc.nextInt();

        int low = 0, high = n - 1;
        int found = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                found = mid;
                break;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        System.out.println(found);
    }
}`,
    simpleExplanation: "Standard binary search with mid calculation low + (high - low) / 2.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "bubble-sort",
    slug: "bubble-sort",
    title: "Bubble Sort",
    difficulty: "EASY",
    level: 2,
    topicId: "searching-sorting",
    orderIndex: 47,
    conceptTested: "Repeated adjacent swapping sort",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Sort the array in non-decreasing order using Bubble Sort, and print the sorted elements separated by spaces.",
    constraints: "1 <= n <= 10^3",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print sorted elements separated by spaces",
    examples: JSON.stringify([
      { input: "5\n64 25 12 22 11", output: "11 12 22 25 64", explanation: "Sorted in non-decreasing order" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n64 25 12 22 11", expected: "11 12 22 25 64" },
      { id: 2, input: "3\n3 2 1", expected: "1 2 3" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "1\n5", expected: "5" }
    ]),
    expectedTime: "O(N^2)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Compare adjacent elements and swap if arr[j] > arr[j + 1].",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "selection-sort",
    slug: "selection-sort",
    title: "Selection Sort",
    difficulty: "EASY",
    level: 2,
    topicId: "searching-sorting",
    orderIndex: 48,
    conceptTested: "Repeated minimum element selection",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Sort the array in non-decreasing order using Selection Sort, and print the sorted elements separated by spaces.",
    constraints: "1 <= n <= 10^3",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print sorted elements separated by spaces",
    examples: JSON.stringify([
      { input: "5\n29 10 14 37 13", output: "10 13 14 29 37", explanation: "Sorted" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n29 10 14 37 13", expected: "10 13 14 29 37" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2\n2 1", expected: "1 2" }
    ]),
    expectedTime: "O(N^2)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Find index of minimum element in unsorted part and swap with current index i.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "insertion-sort",
    slug: "insertion-sort",
    title: "Insertion Sort",
    difficulty: "EASY",
    level: 2,
    topicId: "searching-sorting",
    orderIndex: 49,
    conceptTested: "In-place shifting insertion sort",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers from standard input. Sort the array in non-decreasing order using Insertion Sort, and print the sorted elements separated by spaces.",
    constraints: "1 <= n <= 10^3",
    inputFormat: "First integer n, followed by n space-separated integers",
    outputFormat: "Print sorted elements separated by spaces",
    examples: JSON.stringify([
      { input: "5\n12 11 13 5 6", output: "5 6 11 12 13", explanation: "Sorted" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "5\n12 11 13 5 6", expected: "5 6 11 12 13" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2\n10 5", expected: "5 10" }
    ]),
    expectedTime: "O(N^2)",
    expectedSpace: "O(1)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + (i == n - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
    simpleExplanation: "Insert each key into its correct sorted position by shifting larger elements.",
    optimalSolution: "",
    optimalExplanation: ""
  },
  {
    id: "two-sum",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "EASY",
    level: 2,
    topicId: "searching-sorting",
    orderIndex: 50,
    conceptTested: "HashMap complement lookup / Pair sum",
    problemStatement: "Read an integer n (size of array) followed by n space-separated integers, and a target sum target from standard input. Print the 0-based indices of the two numbers that add up to target separated by space (idx1 idx2). (Assume exactly one solution exists).",
    constraints: "2 <= n <= 10^5",
    inputFormat: "First integer n, then n space-separated integers, and target integer target",
    outputFormat: "Print two 0-based indices separated by space: idx1 idx2",
    examples: JSON.stringify([
      { input: "4\n2 7 11 15\n9", output: "0 1", explanation: "arr[0] + arr[1] = 2 + 7 = 9" }
    ]),
    starterCode: UNIVERSAL_STARTER_CODE,
    visibleTests: JSON.stringify([
      { id: 1, input: "4\n2 7 11 15\n9", expected: "0 1" },
      { id: 2, input: "3\n3 2 4\n6", expected: "1 2" }
    ]),
    hiddenTests: JSON.stringify([
      { id: 101, input: "2\n3 3\n6", expected: "0 1" }
    ]),
    expectedTime: "O(N)",
    expectedSpace: "O(N)",
    simpleSolution: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int target = sc.nextInt();

        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - arr[i];
            if (map.containsKey(complement)) {
                System.out.println(map.get(complement) + " " + i);
                return;
            }
            map.put(arr[i], i);
        }
    }
}`,
    simpleExplanation: "Use a HashMap to find the complement (target - arr[i]) in O(N) linear time.",
    optimalSolution: "",
    optimalExplanation: ""
  }
];

export const TOPIC_MAP = new Map(CURATED_TOPICS.map(t => [t.id, t]));

export function getCuratedQuestionBySlug(slug: string) {
  const q = CURATED_QUESTIONS.find(item => item.slug === slug);
  if (!q) return null;
  const topic = TOPIC_MAP.get(q.topicId);
  return {
    ...q,
    topic: topic || { name: "General", slug: "general" }
  };
}
