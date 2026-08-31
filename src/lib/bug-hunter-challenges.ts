export interface BugChallenge {
  id: number;
  title: string;
  type: "BUG_FIX" | "FILL_BLANK";
  category: "Numbers" | "Strings" | "Arrays" | "Algorithms";
  difficulty: "Beginner" | "Easy" | "Medium";
  goal: string;
  codeSnippet: string; // Contains the buggy line or /* ___FILL_BLANK___ */
  buggyLineNumber?: number; // 1-based line number containing the bug
  bugDescription?: string; // What goes wrong (e.g. "Produces infinite loop" or "ArrayIndexOutOfBoundsException")
  options: string[]; // 4 possible code snippets to choose from
  correctOptionIndex: number;
  fixedCode: string;
  explanation: string;
  testInput: string;
  expectedOutput: string;
}

export const BUG_CHALLENGES: BugChallenge[] = [
  // 1. Numbers: While Loop Semicolon Bug
  {
    id: 1,
    title: "The Frozen While Loop",
    type: "BUG_FIX",
    category: "Numbers",
    difficulty: "Beginner",
    goal: "Extract and print each digit of a number.",
    codeSnippet: `int num = 5432;
while (num > 0); {
    int digit = num % 10;
    System.out.print(digit + " ");
    num = num / 10;
}`,
    buggyLineNumber: 2,
    bugDescription: "Program hangs in an infinite loop and never prints anything!",
    options: [
      "while (num > 0) {",
      "while (num >= 0); {",
      "while (num != 0); {",
      "for (num > 0); {"
    ],
    correctOptionIndex: 0,
    fixedCode: `int num = 5432;
while (num > 0) {
    int digit = num % 10;
    System.out.print(digit + " ");
    num = num / 10;
}`,
    explanation: "A semicolon ';' directly after `while(...)` creates an empty statement loop that repeats forever and never enters the `{ ... }` block.",
    testInput: "",
    expectedOutput: "2 3 4 5 "
  },

  // 2. Numbers: Fill the Digit Extraction
  {
    id: 2,
    title: "Extracting the Last Digit",
    type: "FILL_BLANK",
    category: "Numbers",
    difficulty: "Beginner",
    goal: "Fill in the missing line to extract the last digit of num.",
    codeSnippet: `int num = 9876;
int rev = 0;
while (num > 0) {
    /* ___FILL_BLANK___ */
    rev = rev * 10 + digit;
    num = num / 10;
}
System.out.print(rev);`,
    options: [
      "int digit = num % 10;",
      "int digit = num / 10;",
      "int digit = num * 10;",
      "int digit = num - 10;"
    ],
    correctOptionIndex: 0,
    fixedCode: `int num = 9876;
int rev = 0;
while (num > 0) {
    int digit = num % 10;
    rev = rev * 10 + digit;
    num = num / 10;
}
System.out.print(rev);`,
    explanation: "In Java, the modulo operator `% 10` gives the remainder when divided by 10, which is always the last digit (e.g. 9876 % 10 = 6).",
    testInput: "",
    expectedOutput: "6789"
  },

  // 3. Arrays: Off-by-One Loop Bound Bug
  {
    id: 3,
    title: "Array Bounds Disaster",
    type: "BUG_FIX",
    category: "Arrays",
    difficulty: "Beginner",
    goal: "Print all elements in the array.",
    codeSnippet: `int[] arr = {10, 20, 30, 40, 50};
for (int i = 0; i <= arr.length; i++) {
    System.out.print(arr[i] + " ");
}`,
    buggyLineNumber: 2,
    bugDescription: "Throws `ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5`",
    options: [
      "for (int i = 0; i < arr.length; i++) {",
      "for (int i = 1; i <= arr.length; i++) {",
      "for (int i = 0; i <= arr.length - 1; i--) {",
      "for (int i = 0; i < arr.length(); i++) {"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] arr = {10, 20, 30, 40, 50};
for (int i = 0; i < arr.length; i++) {
    System.out.print(arr[i] + " ");
}`,
    explanation: "Java arrays are 0-indexed (indices 0 to length-1). Using `i <= arr.length` attempts to access `arr[length]`, which does not exist.",
    testInput: "",
    expectedOutput: "10 20 30 40 50 "
  },

  // 4. Strings: Object Equality Trap
  {
    id: 4,
    title: "String Comparison Gone Wrong",
    type: "BUG_FIX",
    category: "Strings",
    difficulty: "Beginner",
    goal: "Check if the entered string matches the password 'secret'.",
    codeSnippet: `String input = new String("secret");
String password = "secret";

if (input == password) {
    System.out.print("Access Granted");
} else {
    System.out.print("Access Denied");
}`,
    buggyLineNumber: 4,
    bugDescription: "Prints 'Access Denied' even though both strings contain 'secret'!",
    options: [
      "if (input.equals(password)) {",
      "if (input = password) {",
      "if (input.compareTo(password) > 0) {",
      "if (input.toString() == password) {"
    ],
    correctOptionIndex: 0,
    fixedCode: `String input = new String("secret");
String password = "secret";

if (input.equals(password)) {
    System.out.print("Access Granted");
} else {
    System.out.print("Access Denied");
}`,
    explanation: "In Java, `==` compares memory addresses (object references), not character content. Use `.equals()` to compare string values.",
    testInput: "",
    expectedOutput: "Access Granted"
  },

  // 5. Algorithms: Binary Search Mid Calculation Bug
  {
    id: 5,
    title: "Binary Search Pointer Shift",
    type: "FILL_BLANK",
    category: "Algorithms",
    difficulty: "Easy",
    goal: "Fill in the pointer update when the target is greater than mid.",
    codeSnippet: `int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
int target = 23;
int low = 0, high = arr.length - 1;
int found = -1;

while (low <= high) {
    int mid = low + (high - low) / 2;
    if (arr[mid] == target) {
        found = mid;
        break;
    } else if (arr[mid] < target) {
        /* ___FILL_BLANK___ */
    } else {
        high = mid - 1;
    }
}
System.out.print(found);`,
    options: [
      "low = mid + 1;",
      "low = mid;",
      "low = high - 1;",
      "high = mid + 1;"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
int target = 23;
int low = 0, high = arr.length - 1;
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
System.out.print(found);`,
    explanation: "When `arr[mid] < target`, the target must be in the right half, so we shift `low = mid + 1` to discard the left half and mid element.",
    testInput: "",
    expectedOutput: "5"
  },

  // 6. Arrays: Two Sum Hash Map Fill-up
  {
    id: 6,
    title: "Two Sum Complement Lookup",
    type: "FILL_BLANK",
    category: "Arrays",
    difficulty: "Easy",
    goal: "Find the complement value needed to reach target sum.",
    codeSnippet: `int[] nums = {2, 7, 11, 15};
int target = 9;
HashMap<Integer, Integer> map = new HashMap<>();

for (int i = 0; i < nums.length; i++) {
    /* ___FILL_BLANK___ */
    if (map.containsKey(complement)) {
        System.out.print(map.get(complement) + " " + i);
        break;
    }
    map.put(nums[i], i);
}`,
    options: [
      "int complement = target - nums[i];",
      "int complement = target + nums[i];",
      "int complement = nums[i] - target;",
      "int complement = target / nums[i];"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] nums = {2, 7, 11, 15};
int target = 9;
HashMap<Integer, Integer> map = new HashMap<>();

for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];
    if (map.containsKey(complement)) {
        System.out.print(map.get(complement) + " " + i);
        break;
    }
    map.put(nums[i], i);
}`,
    explanation: "If `a + b = target`, then `complement = target - a`. We check if this complement was already stored in our HashMap.",
    testInput: "",
    expectedOutput: "0 1"
  },

  // 7. Numbers: Prime Check Divisor Bug
  {
    id: 7,
    title: "The Faulty Prime Checker",
    type: "BUG_FIX",
    category: "Numbers",
    difficulty: "Beginner",
    goal: "Check if n is prime by testing potential divisors.",
    codeSnippet: `int n = 17;
boolean isPrime = true;

for (int i = 1; i <= Math.sqrt(n); i++) {
    if (n % i == 0) {
        isPrime = false;
        break;
    }
}
System.out.print(isPrime ? "Prime" : "Not Prime");`,
    buggyLineNumber: 4,
    bugDescription: "Always prints 'Not Prime' because i starts at 1, and any number n is divisible by 1!",
    options: [
      "for (int i = 2; i <= Math.sqrt(n); i++) {",
      "for (int i = 0; i <= Math.sqrt(n); i++) {",
      "for (int i = 2; i < n / 2; i--) {",
      "for (int i = 1; i < Math.sqrt(n); i++) {"
    ],
    correctOptionIndex: 0,
    fixedCode: `int n = 17;
boolean isPrime = true;

for (int i = 2; i <= Math.sqrt(n); i++) {
    if (n % i == 0) {
        isPrime = false;
        break;
    }
}
System.out.print(isPrime ? "Prime" : "Not Prime");`,
    explanation: "Every number is divisible by 1 (`n % 1 == 0` is always true). Prime divisor checks must start from `i = 2` up to `sqrt(n)`.",
    testInput: "",
    expectedOutput: "Prime"
  },

  // 8. Strings: Palindrome Pointer Inversion Bug
  {
    id: 8,
    title: "Palindrome Two-Pointer Drift",
    type: "BUG_FIX",
    category: "Strings",
    difficulty: "Beginner",
    goal: "Check if string is a palindrome using two pointers.",
    codeSnippet: `String str = "racecar";
int left = 0;
int right = str.length() - 1;
boolean isPalin = true;

while (left < right) {
    if (str.charAt(left) != str.charAt(right)) {
        isPalin = false;
        break;
    }
    left++;
    right++;
}
System.out.print(isPalin ? "Yes" : "No");`,
    buggyLineNumber: 13,
    bugDescription: "Throws `StringIndexOutOfBoundsException` because `right` increments instead of moving inward!",
    options: [
      "right--;",
      "right = left;",
      "right = right + 1;",
      "left--;"
    ],
    correctOptionIndex: 0,
    fixedCode: `String str = "racecar";
int left = 0;
int right = str.length() - 1;
boolean isPalin = true;

while (left < right) {
    if (str.charAt(left) != str.charAt(right)) {
        isPalin = false;
        break;
    }
    left++;
    right--;
}
System.out.print(isPalin ? "Yes" : "No");`,
    explanation: "The right pointer must move leftwards (`right--`) while the left pointer moves rightwards (`left++`) to converge towards the center.",
    testInput: "",
    expectedOutput: "Yes"
  },

  // 9. Arrays: Swapping Without Temp Bug
  {
    id: 9,
    title: "The Overwritten Swap",
    type: "BUG_FIX",
    category: "Arrays",
    difficulty: "Beginner",
    goal: "Swap elements at index i and j.",
    codeSnippet: `int[] arr = {10, 99};
int i = 0, j = 1;

arr[i] = arr[j];
arr[j] = arr[i];

System.out.print(arr[0] + " " + arr[1]);`,
    buggyLineNumber: 4,
    bugDescription: "Prints '99 99' — the original value of arr[0] was lost before assigning to arr[1]!",
    options: [
      "int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;",
      "arr[j] = arr[i]; arr[i] = arr[j];",
      "arr[i] = arr[j] + arr[i]; arr[j] = arr[i];",
      "int temp = arr[j]; arr[i] = temp; arr[j] = temp;"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] arr = {10, 99};
int i = 0, j = 1;

int temp = arr[i];
arr[i] = arr[j];
arr[j] = temp;

System.out.print(arr[0] + " " + arr[1]);`,
    explanation: "Assigning `arr[i] = arr[j]` immediately overwrites the old value of `arr[i]`. We must store `arr[i]` in a temporary variable first.",
    testInput: "",
    expectedOutput: "99 10"
  },

  // 10. Numbers: Armstrong Power Accumulator Fill-up
  {
    id: 10,
    title: "Armstrong Cube Accumulation",
    type: "FILL_BLANK",
    category: "Numbers",
    difficulty: "Beginner",
    goal: "Add the cube of the extracted digit to the sum.",
    codeSnippet: `int num = 153;
int temp = num;
int sum = 0;

while (temp > 0) {
    int d = temp % 10;
    /* ___FILL_BLANK___ */
    temp = temp / 10;
}
System.out.print(sum == num ? "Armstrong" : "Not Armstrong");`,
    options: [
      "sum += d * d * d;",
      "sum += d * 3;",
      "sum = sum * 10 + d;",
      "sum += temp * temp * temp;"
    ],
    correctOptionIndex: 0,
    fixedCode: `int num = 153;
int temp = num;
int sum = 0;

while (temp > 0) {
    int d = temp % 10;
    sum += d * d * d;
    temp = temp / 10;
}
System.out.print(sum == num ? "Armstrong" : "Not Armstrong");`,
    explanation: "An Armstrong number of 3 digits equals the sum of the cubes of its digits (e.g. 1³ + 5³ + 3³ = 1 + 125 + 27 = 153).",
    testInput: "",
    expectedOutput: "Armstrong"
  },

  // 11. Algorithms: Bubble Sort Inner Loop Bound
  {
    id: 11,
    title: "Bubble Sort Index Overflow",
    type: "BUG_FIX",
    category: "Algorithms",
    difficulty: "Easy",
    goal: "Sort the array in ascending order.",
    codeSnippet: `int[] arr = {5, 1, 4, 2, 8};
int n = arr.length;

for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n; j++) {
        if (arr[j] > arr[j + 1]) {
            int temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
System.out.print(Arrays.toString(arr));`,
    buggyLineNumber: 5,
    bugDescription: "Throws `ArrayIndexOutOfBoundsException: Index 5 out of bounds` when checking `arr[j + 1]` at j = 4",
    options: [
      "for (int j = 0; j < n - i - 1; j++) {",
      "for (int j = 1; j <= n; j++) {",
      "for (int j = 0; j <= n; j++) {",
      "for (int j = n - 1; j >= 0; j++) {"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] arr = {5, 1, 4, 2, 8};
int n = arr.length;

for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            int temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
System.out.print(Arrays.toString(arr));`,
    explanation: "Because the comparison accesses `arr[j + 1]`, `j` can only go up to `n - i - 2` (so `j < n - i - 1`). Otherwise `arr[j + 1]` overflows the array bound.",
    testInput: "",
    expectedOutput: "[1, 2, 4, 5, 8]"
  },

  // 12. Strings: String Immutability Ignored Bug
  {
    id: 12,
    title: "The Unassigned String Transform",
    type: "BUG_FIX",
    category: "Strings",
    difficulty: "Beginner",
    goal: "Convert user input to lowercase and trim spaces.",
    codeSnippet: `String username = "  AdminUser  ";
username.trim();
username.toLowerCase();

System.out.print(username);`,
    buggyLineNumber: 2,
    bugDescription: "Prints '  AdminUser  ' without trimming or lowercasing!",
    options: [
      "username = username.trim().toLowerCase();",
      "username.setLowerCase();",
      "username.strip().toLower();",
      "username = new String(username.trim());"
    ],
    correctOptionIndex: 0,
    fixedCode: `String username = "  AdminUser  ";
username = username.trim().toLowerCase();

System.out.print(username);`,
    explanation: "Java `String` objects are immutable! Methods like `.trim()` and `.toLowerCase()` do NOT modify the original string; they return a new string that must be assigned back to a variable.",
    testInput: "",
    expectedOutput: "adminuser"
  },

  // 13. Numbers: Fibonacci Next Term Fill-up
  {
    id: 13,
    title: "Fibonacci Sequence Step",
    type: "FILL_BLANK",
    category: "Numbers",
    difficulty: "Beginner",
    goal: "Compute the next Fibonacci term and update variables.",
    codeSnippet: `int a = 0, b = 1;
int n = 5;

for (int i = 0; i < n; i++) {
    System.out.print(a + " ");
    /* ___FILL_BLANK___ */
    a = b;
    b = next;
}`,
    options: [
      "int next = a + b;",
      "int next = a * b;",
      "int next = b - a;",
      "int next = a + 1;"
    ],
    correctOptionIndex: 0,
    fixedCode: `int a = 0, b = 1;
int n = 5;

for (int i = 0; i < n; i++) {
    System.out.print(a + " ");
    int next = a + b;
    a = b;
    b = next;
}`,
    explanation: "Each Fibonacci number is the sum of the two preceding ones (`next = a + b`).",
    testInput: "",
    expectedOutput: "0 1 1 2 3 "
  },

  // 14. Arrays: Find Maximum Initialization Trap
  {
    id: 14,
    title: "The Zero Max Initialization Bug",
    type: "BUG_FIX",
    category: "Arrays",
    difficulty: "Beginner",
    goal: "Find the maximum number in an array of negative numbers.",
    codeSnippet: `int[] arr = {-5, -12, -3, -8, -1};
int max = 0;

for (int i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
        max = arr[i];
    }
}
System.out.print(max);`,
    buggyLineNumber: 2,
    bugDescription: "Prints '0' as the maximum, even though 0 is NOT in the array!",
    options: [
      "int max = arr[0];",
      "int max = 1;",
      "int max = Integer.MAX_VALUE;",
      "int max = -100;"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] arr = {-5, -12, -3, -8, -1};
int max = arr[0];

for (int i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
        max = arr[i];
    }
}
System.out.print(max);`,
    explanation: "Initializing `max = 0` fails when all array numbers are negative. Always initialize `max` with the first element `arr[0]` or `Integer.MIN_VALUE`.",
    testInput: "",
    expectedOutput: "-1"
  },

  // 15. Algorithms: Linear Search Return Condition
  {
    id: 15,
    title: "Premature Loop Exit",
    type: "BUG_FIX",
    category: "Algorithms",
    difficulty: "Beginner",
    goal: "Find the index of target in the array, or -1 if not found.",
    codeSnippet: `int[] arr = {10, 20, 30, 40, 50};
int target = 30;
int result = -1;

for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
        result = i;
        break;
    } else {
        result = -1;
        break;
    }
}
System.out.print(result);`,
    buggyLineNumber: 10,
    bugDescription: "Always breaks after inspecting index 0 and prints -1 for any element beyond index 0!",
    options: [
      "// remove the else block entirely",
      "else { continue; break; }",
      "else { result = i; }",
      "if (arr[i] != target) { break; }"
    ],
    correctOptionIndex: 0,
    fixedCode: `int[] arr = {10, 20, 30, 40, 50};
int target = 30;
int result = -1;

for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) {
        result = i;
        break;
    }
}
System.out.print(result);`,
    explanation: "Putting `break` in the `else` clause terminates the search on the very first mismatch! You must keep iterating through the remaining elements.",
    testInput: "",
    expectedOutput: "2"
  }
];
