export interface JavaGotcha {
  id: number;
  title: string;
  category: 'integers' | 'strings' | 'arrays' | 'loops' | 'null' | 'operators' | 'collections' | 'core';
  difficulty: 'easy' | 'medium' | 'tricky';
  code: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  javaInsight: string;
}

export const javaGotchas: JavaGotcha[] = [
  {
    id: 1,
    title: "The Integer Cache Trap",
    category: "integers",
    difficulty: "medium",
    code: `Integer a = 128;\nInteger b = 128;\nSystem.out.println(a == b);`,
    question: "What does this code output?",
    options: ["true", "false", "Compilation Error", "Runtime Exception"],
    correctIndex: 1,
    explanation: "In Java, Integer wrapper objects are cached for values between -128 and 127. Since 128 is outside this range, new objects are created for 'a' and 'b', and the == operator compares object references, which are different.",
    javaInsight: "Always use .equals() to compare wrapper classes like Integer and Long, not ==."
  },
  {
    id: 2,
    title: "String Pool Magic",
    category: "strings",
    difficulty: "easy",
    code: `String a = "hello";\nString b = "hello";\nSystem.out.println(a == b);`,
    question: "What does this code output?",
    options: ["true", "false", "Compilation Error", "Runtime Exception"],
    correctIndex: 0,
    explanation: "String literals are placed in a special memory area called the String Pool. If a literal is already in the pool, Java reuses it. Thus, 'a' and 'b' refer to the exact same object in memory.",
    javaInsight: "String literals are internalized automatically by Java to save memory."
  },
  {
    id: 3,
    title: "String new Operator",
    category: "strings",
    difficulty: "medium",
    code: `String a = new String("hello");\nString b = "hello";\nSystem.out.println(a == b);`,
    question: "What does this code output?",
    options: ["true", "false", "Compilation Error", "Runtime Exception"],
    correctIndex: 1,
    explanation: "Using the 'new' keyword forces Java to create a brand new String object on the heap, bypassing the String Pool. Thus, 'a' points to the heap object, while 'b' points to the pool object.",
    javaInsight: "Avoid using new String(\"...\") unless you explicitly need a distinct object."
  },
  {
    id: 4,
    title: "String Immutability",
    category: "strings",
    difficulty: "easy",
    code: `String s = "hello";\ns.toUpperCase();\nSystem.out.println(s);`,
    question: "What is printed?",
    options: ["HELLO", "hello", "Hello", "Compilation Error"],
    correctIndex: 1,
    explanation: "Strings in Java are immutable. The toUpperCase() method returns a new String object, but since we don't assign it back to 's', the original string 's' remains unchanged.",
    javaInsight: "String methods always return new objects rather than modifying the original String."
  },
  {
    id: 5,
    title: "Array Default Values",
    category: "arrays",
    difficulty: "easy",
    code: `int[] arr = new int[3];\nSystem.out.println(arr[0]);`,
    question: "What is printed?",
    options: ["0", "null", "undefined", "ArrayOutOfBoundsException"],
    correctIndex: 0,
    explanation: "When an array of primitives is created, Java automatically initializes elements to their default values. For int, the default is 0.",
    javaInsight: "Object arrays initialize to null, numeric primitive arrays to 0, and boolean arrays to false."
  },
  {
    id: 6,
    title: "Integer Division",
    category: "operators",
    difficulty: "easy",
    code: `System.out.println(5 / 2);`,
    question: "What does this output?",
    options: ["2.5", "2", "3", "Compilation Error"],
    correctIndex: 1,
    explanation: "When dividing two integers, Java performs integer division, which truncates the decimal part towards zero. It does not round up.",
    javaInsight: "To get a floating-point result, at least one operand must be a double or float (e.g., 5.0 / 2)."
  },
  {
    id: 7,
    title: "Char Arithmetic",
    category: "core",
    difficulty: "medium",
    code: `System.out.println('a' + 1);`,
    question: "What does this output?",
    options: ["a1", "b", "98", "Compilation Error"],
    correctIndex: 2,
    explanation: "In Java, the + operator with a char and an int promotes the char to its integer ASCII/Unicode value. 'a' is 97, so 97 + 1 = 98.",
    javaInsight: "To print the next character, you must cast it back: (char)('a' + 1)."
  },
  {
    id: 8,
    title: "The Post-Increment Trap",
    category: "operators",
    difficulty: "tricky",
    code: `int x = 5;\nx = x++;\nSystem.out.println(x);`,
    question: "What does this output?",
    options: ["5", "6", "4", "Compilation Error"],
    correctIndex: 0,
    explanation: "Post-increment (x++) evaluates to the original value (5) before incrementing. The assignment then overwrites the incremented value (6) back with the original value (5).",
    javaInsight: "Never assign a variable to its own post-increment operation."
  },
  {
    id: 9,
    title: "Negative Modulo",
    category: "operators",
    difficulty: "medium",
    code: `System.out.println(-7 % 5);`,
    question: "What does this output?",
    options: ["2", "-2", "3", "-3"],
    correctIndex: 1,
    explanation: "In Java, the modulo operator (%) preserves the sign of the dividend (the left operand). So -7 % 5 yields -2.",
    javaInsight: "To get a positive mathematical modulo, use: ((a % b) + b) % b."
  },
  {
    id: 10,
    title: "Short-Circuit Evaluation",
    category: "operators",
    difficulty: "medium",
    code: `int x = 0;\nif (true || x++ > 0) { }\nSystem.out.println(x);`,
    question: "What does this output?",
    options: ["0", "1", "true", "Compilation Error"],
    correctIndex: 0,
    explanation: "The || operator short-circuits. Since the left side is true, the right side (x++ > 0) is never executed. Thus, x remains 0.",
    javaInsight: "Be careful when placing side-effects (like ++ or method calls) on the right side of && or ||."
  },
  {
    id: 11,
    title: "Array Reference Mutation",
    category: "arrays",
    difficulty: "medium",
    code: `int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);`,
    question: "What does this output?",
    options: ["1", "99", "Compilation Error", "0"],
    correctIndex: 1,
    explanation: "Arrays are objects in Java. Assigning 'a' to 'b' copies the reference, not the array contents. Both variables point to the same array in memory.",
    javaInsight: "Use Arrays.copyOf() or clone() if you need a separate copy of an array."
  },
  {
    id: 12,
    title: "Autoboxing Null Pointer",
    category: "null",
    difficulty: "tricky",
    code: `Integer i = null;\nint j = i;\nSystem.out.println(j);`,
    question: "What happens when this runs?",
    options: ["null", "0", "Compilation Error", "NullPointerException"],
    correctIndex: 3,
    explanation: "Java automatically unboxes the Integer object to an int primitive. Doing this calls i.intValue(), but since 'i' is null, it throws a NullPointerException.",
    javaInsight: "Always check wrapper classes for null before assigning them to primitive types."
  },
  {
    id: 13,
    title: "ArrayList Remove Overload",
    category: "collections",
    difficulty: "tricky",
    code: `List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));\nlist.remove(1);\nSystem.out.println(list);`,
    question: "What is the output?",
    options: ["[1, 2, 3]", "[2, 3]", "[1, 3]", "Compilation Error"],
    correctIndex: 2,
    explanation: "ArrayList has two remove methods: remove(int index) and remove(Object o). Passing primitive 1 calls remove(int index), which removes the element at index 1 (the value 2).",
    javaInsight: "To remove the actual object value 1, use list.remove(Integer.valueOf(1))."
  },
  {
    id: 14,
    title: "The Finally Block Override",
    category: "core",
    difficulty: "medium",
    code: `public int test() {\n    try {\n        return 1;\n    } finally {\n        return 2;\n    }\n}\n// What does test() return?`,
    question: "What does the method return?",
    options: ["1", "2", "Compilation Error", "Runtime Exception"],
    correctIndex: 1,
    explanation: "The finally block always executes after the try block, even if the try block contains a return statement. If finally also has a return, it overrides the try block's return.",
    javaInsight: "Avoid using return statements inside finally blocks to prevent hiding intended return values."
  },
  {
    id: 15,
    title: "Octal Literals",
    category: "integers",
    difficulty: "tricky",
    code: `int x = 010;\nSystem.out.println(x);`,
    question: "What does this output?",
    options: ["10", "8", "0", "Compilation Error"],
    correctIndex: 1,
    explanation: "In Java, an integer literal starting with a leading zero is treated as an octal (base-8) number. Octal 10 equals decimal 8.",
    javaInsight: "Never pad numbers with leading zeros in Java unless you specifically intend to use base-8."
  },
  {
    id: 16,
    title: "String Concatenation Precedence",
    category: "strings",
    difficulty: "medium",
    code: `System.out.println("Sum: " + 5 + 2);`,
    question: "What does this output?",
    options: ["Sum: 7", "Sum: 52", "Compilation Error", "Runtime Exception"],
    correctIndex: 1,
    explanation: "The + operator is evaluated left to right. First, \"Sum: \" + 5 becomes \"Sum: 5\". Then, \"Sum: 5\" + 2 becomes \"Sum: 52\".",
    javaInsight: "Use parentheses if you want arithmetic addition before concatenation: \"Sum: \" + (5 + 2)."
  },
  {
    id: 17,
    title: "Modifying During Iteration",
    category: "collections",
    difficulty: "medium",
    code: `List<String> list = new ArrayList<>(Arrays.asList("a", "b"));\nfor (String s : list) {\n    if (s.equals("a")) list.remove(s);\n}`,
    question: "What happens?",
    options: ["List becomes [\"b\"]", "List becomes []", "Compilation Error", "ConcurrentModificationException"],
    correctIndex: 3,
    explanation: "You cannot modify a collection directly while iterating over it with a for-each loop. The iterator detects the modification and throws a ConcurrentModificationException.",
    javaInsight: "Use Iterator.remove() or Collection.removeIf() to safely remove elements during iteration."
  },
  {
    id: 18,
    title: "Length vs Length()",
    category: "arrays",
    difficulty: "easy",
    code: `int[] arr = {1, 2, 3};\nString str = "123";\n// arr.length or arr.length() ?`,
    question: "Which statement is true?",
    options: [
      "Both use .length",
      "Both use .length()",
      "arr uses .length, str uses .length()",
      "arr uses .length(), str uses .length"
    ],
    correctIndex: 2,
    explanation: "For arrays, length is a final public field. For Strings, length() is a method.",
    javaInsight: "Remember: arrays have fields (length), objects have methods (length())."
  },
  {
    id: 19,
    title: "Switch on Null String",
    category: "null",
    difficulty: "medium",
    code: `String s = null;\nswitch (s) {\n    case "A": System.out.println("A"); break;\n    default: System.out.println("Default");\n}`,
    question: "What does this output?",
    options: ["A", "Default", "Compilation Error", "NullPointerException"],
    correctIndex: 3,
    explanation: "When switching on a String, Java secretly calls the .hashCode() and .equals() methods on it. If the string is null, it immediately throws a NullPointerException.",
    javaInsight: "Always ensure strings are not null before using them in a switch statement."
  },
  {
    id: 20,
    title: "Floating Point Precision",
    category: "core",
    difficulty: "medium",
    code: `System.out.println(0.1 + 0.2 == 0.3);`,
    question: "What does this output?",
    options: ["true", "false", "Compilation Error", "Runtime Exception"],
    correctIndex: 1,
    explanation: "Due to how IEEE 754 floating-point numbers are represented in binary, 0.1 + 0.2 actually equals 0.30000000000000004. So it is not exactly equal to 0.3.",
    javaInsight: "Use BigDecimal or an epsilon tolerance for precise floating-point comparisons."
  },
  {
    id: 21,
    title: "Pass by Value",
    category: "core",
    difficulty: "tricky",
    code: `void change(String s) {\n    s = "world";\n}\n// in main:\nString str = "hello";\nchange(str);\nSystem.out.println(str);`,
    question: "What is printed in main?",
    options: ["hello", "world", "Compilation Error", "null"],
    correctIndex: 0,
    explanation: "Java is strictly pass-by-value. A copy of the reference is passed to the method. Reassigning the parameter 's' to a new string merely redirects the local copy, not the original 'str' reference.",
    javaInsight: "You can mutate an object's state if you pass its reference, but you cannot reassign the original variable to a new object."
  },
  {
    id: 22,
    title: "Math.abs of MIN_VALUE",
    category: "integers",
    difficulty: "tricky",
    code: `int x = Integer.MIN_VALUE; // -2147483648\nSystem.out.println(Math.abs(x) < 0);`,
    question: "What does this output?",
    options: ["true", "false", "Compilation Error", "Runtime Exception"],
    correctIndex: 0,
    explanation: "The positive max value of an int is 2147483647. Because MIN_VALUE is -2147483648, its absolute value overflows and wraps around back to the negative MIN_VALUE.",
    javaInsight: "Math.abs() can return a negative number if you pass it Integer.MIN_VALUE or Long.MIN_VALUE."
  },
  {
    id: 23,
    title: "PriorityQueue Ordering",
    category: "collections",
    difficulty: "tricky",
    code: `PriorityQueue<Integer> pq = new PriorityQueue<>();\npq.add(3); pq.add(1); pq.add(2);\nSystem.out.println(pq);`,
    question: "What is guaranteed about the output of pq.toString()?",
    options: [
      "It will print [1, 2, 3]",
      "It will print [3, 2, 1]",
      "The first element is 1",
      "It prints in insertion order"
    ],
    correctIndex: 2,
    explanation: "A PriorityQueue is implemented as a min-heap array. The toString() method just iterates through the internal array. Only the head (index 0) is guaranteed to be the minimum element.",
    javaInsight: "To get elements in fully sorted order, you must continuously poll() the PriorityQueue."
  },
  {
    id: 24,
    title: "Static Method Shadowing",
    category: "core",
    difficulty: "medium",
    code: `class A { static void print() { System.out.print("A"); } }\nclass B extends A { static void print() { System.out.print("B"); } }\n// in main:\nA obj = new B();\nobj.print();`,
    question: "What does this output?",
    options: ["A", "B", "AB", "Compilation Error"],
    correctIndex: 0,
    explanation: "Static methods are bound at compile time based on the reference type, not the object type. Since 'obj' is of type A, A's static method is called. This is called hiding, not overriding.",
    javaInsight: "Always call static methods on the class name itself (A.print()) rather than on instance variables."
  },
  {
    id: 25,
    title: "Break with Label",
    category: "loops",
    difficulty: "easy",
    code: `outer: for(int i=0; i<3; i++) {\n    for(int j=0; j<3; j++) {\n        if(i==1) break outer;\n        System.out.print(i);\n    }\n}`,
    question: "What is printed?",
    options: ["000", "012", "0001", "Compilation Error"],
    correctIndex: 0,
    explanation: "When i=0, the inner loop runs 3 times, printing '000'. When i=1, the 'break outer' statement terminates the entire outer loop immediately.",
    javaInsight: "Labels can be useful for breaking out of deeply nested loops without complex flag variables."
  }
];
