export interface EditorMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: number; // 8 = Error, 4 = Warning, 2 = Info
}

const JAVA_KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
  "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float",
  "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native",
  "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp",
  "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void",
  "volatile", "while", "true", "false", "null", "java", "util", "io", "out", "in", "err"
]);

const STANDARD_CLASSES = new Set([
  "String", "Scanner", "System", "Math", "Integer", "Character", "Boolean", "Double", "Long",
  "Float", "Short", "Byte", "Arrays", "Collections", "ArrayList", "HashMap", "HashSet",
  "LinkedList", "Queue", "Stack", "List", "Map", "Set", "StringBuilder", "StringBuffer",
  "Solution", "Main", "Object", "Exception", "Override"
]);

const STANDARD_METHODS = new Set([
  "println", "print", "printf", "charAt", "length", "nextInt", "next", "nextLine", "nextDouble",
  "nextLong", "nextFloat", "max", "min", "pow", "sqrt", "abs", "floor", "ceil", "round",
  "toLowerCase", "toUpperCase", "trim", "substring", "equals", "equalsIgnoreCase", "contains",
  "startsWith", "endsWith", "indexOf", "lastIndexOf", "split", "replace", "replaceAll",
  "toCharArray", "reverse", "append", "toString", "add", "get", "size", "isEmpty", "sort",
  "binarySearch", "fill", "main", "valueOf", "parseInt", "parseDouble", "parseLong"
]);

const PRIMITIVE_TYPES = new Set([
  "int", "long", "double", "float", "char", "boolean", "byte", "short"
]);

/**
 * Real-time IDE-style Java Syntax, Type & Symbol Analyzer.
 * Detects common syntax, type, structural, and API mistakes while typing.
 * NEVER modifies user code.
 */
export function analyzeJavaCodeLive(code: string): EditorMarker[] {
  const rawMarkers: EditorMarker[] = [];
  const lines = code.split("\n");

  // Step 1: Pre-scan symbol table with exact variable types
  const symbolTypeMap = new Map<string, string>();
  symbolTypeMap.set("args", "String[]");
  symbolTypeMap.set("Solution", "class");
  symbolTypeMap.set("Main", "class");

  // Detect variable declarations: Type varName or Type varName = ...
  const declPattern = /\b(int|long|double|float|char|boolean|byte|short|String|Scanner|StringBuilder|int\[\]|long\[\]|String\[\]|char\[\]|double\[\])\s+([a-zA-Z0-9_$]+)\b/g;
  for (const line of lines) {
    if (line.trim().startsWith("import") || line.trim().startsWith("package")) continue;
    let m: RegExpExecArray | null;
    while ((m = declPattern.exec(line)) !== null) {
      const type = m[1];
      const name = m[2];
      symbolTypeMap.set(name, type);
    }
    // Also detect declarations like `for (int i = 0; ...)`
    const forDeclPattern = /for\s*\(\s*([a-zA-Z0-9_$[\]]+)\s+([a-zA-Z0-9_$]+)\s*[:=]/g;
    while ((m = forDeclPattern.exec(line)) !== null) {
      symbolTypeMap.set(m[2], m[1]);
    }
  }

  // Step 2: Line-by-line lexical & semantic token analysis
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // Skip empty lines, comments, imports, packages
    if (
      !trimmed ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("import ") ||
      trimmed.startsWith("package ")
    ) {
      continue;
    }

    // A. Class Casing Errors
    const classCaseErrors = [
      { regex: /\bscanner\b/g, correct: "Scanner", desc: "class in java.util" },
      { regex: /\bstring\b/g, correct: "String", desc: "class in java.lang" },
      { regex: /\bsystem\b/g, correct: "System", desc: "class in java.lang" },
      { regex: /\binteger\b/g, correct: "int' or 'Integer", desc: "primitive or wrapper" },
      { regex: /\bcharacter\b/g, correct: "char' or 'Character", desc: "primitive or wrapper" },
      { regex: /\bbool\b/g, correct: "boolean", desc: "primitive type" },
      { regex: /\bmath\b/g, correct: "Math", desc: "class in java.lang" },
      { regex: /\barrays\b/g, correct: "Arrays", desc: "utility class in java.util" },
      { regex: /\bcollections\b/g, correct: "Collections", desc: "utility class in java.util" },
      { regex: /\barraylist\b/g, correct: "ArrayList", desc: "class in java.util" },
      { regex: /\bhashmap\b/g, correct: "HashMap", desc: "class in java.util" },
      { regex: /\bhashset\b/g, correct: "HashSet", desc: "class in java.util" },
      { regex: /\bstringbuilder\b/g, correct: "StringBuilder", desc: "class in java.lang" },
    ];

    for (const item of classCaseErrors) {
      let m: RegExpExecArray | null;
      while ((m = item.regex.exec(line)) !== null) {
        if (!isInsideQuotes(line, m.index)) {
          rawMarkers.push({
            startLineNumber: lineNum,
            startColumn: m.index + 1,
            endLineNumber: lineNum,
            endColumn: m.index + 1 + m[0].length,
            message: `Cannot resolve symbol '${m[0]}'. In Java, '${item.correct}' must be capitalized (${item.desc}).`,
            severity: 8,
          });
        }
      }
    }

    // B. Primitive Type Dereferencing (Calling .length(), .charAt(), etc. on int, long, double, char, etc.)
    const memberAccessMatch = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*([a-zA-Z0-9_$]+(\s*\(\s*\))?)/g;
    let access: RegExpExecArray | null;
    while ((access = memberAccessMatch.exec(line)) !== null) {
      const varName = access[1];
      const member = access[2];

      if (!isInsideQuotes(line, access.index)) {
        const varType = symbolTypeMap.get(varName);

        // 1. If it's a primitive type (int, long, double, boolean, char, etc.) -> CANNOT DEREFERENCE
        if (varType && PRIMITIVE_TYPES.has(varType)) {
          rawMarkers.push({
            startLineNumber: lineNum,
            startColumn: access.index + 1,
            endLineNumber: lineNum,
            endColumn: access.index + access[0].length + 1,
            message: `Cannot dereference primitive type '${varType}'. '${varType}' is a primitive value and does not have methods or properties like '.${member}'.`,
            severity: 8,
          });
        }

        // 2. If it's an Array type and called .length() with parentheses
        else if (varType && varType.endsWith("[]") && member.startsWith("length(")) {
          rawMarkers.push({
            startLineNumber: lineNum,
            startColumn: access.index + varName.length + 1,
            endLineNumber: lineNum,
            endColumn: access.index + access[0].length + 1,
            message: `Cannot find symbol method 'length()'. For Java arrays, length is a property: use '${varName}.length' without parentheses.`,
            severity: 8,
          });
        }

        // 3. If it's a String type and accessed .length without parentheses
        else if (varType === "String" && member === "length") {
          rawMarkers.push({
            startLineNumber: lineNum,
            startColumn: access.index + varName.length + 1,
            endLineNumber: lineNum,
            endColumn: access.index + access[0].length + 1,
            message: `Cannot find symbol 'length'. On Java Strings, length is a method call: use '${varName}.length()'.`,
            severity: 8,
          });
        }
      }
    }

    // C. Array index subscript on String: `str[i]` instead of `str.charAt(i)`
    const arrayOnStringMatch = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\[\s*[^\]]+\s*\]/g;
    let arrOnStr: RegExpExecArray | null;
    while ((arrOnStr = arrayOnStringMatch.exec(line)) !== null) {
      const varName = arrOnStr[1];
      const varType = symbolTypeMap.get(varName);
      if (varType === "String" && !isInsideQuotes(line, arrOnStr.index)) {
        rawMarkers.push({
          startLineNumber: lineNum,
          startColumn: arrOnStr.index + 1,
          endLineNumber: lineNum,
          endColumn: arrOnStr.index + arrOnStr[0].length + 1,
          message: `Array type expected; found 'java.lang.String'. In Java, access characters using '${varName}.charAt(index)'.`,
          severity: 8,
        });
      }
    }

    // D. Undeclared Symbol Detection (e.g. using `a.length()` when `a` is not in symbolTypeMap)
    const symbolUsageMatch = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(\.|\(|\[|\s*=)/g;
    let sym: RegExpExecArray | null;
    while ((sym = symbolUsageMatch.exec(line)) !== null) {
      const name = sym[1];
      const nextChar = sym[2].trim();

      if (
        JAVA_KEYWORDS.has(name) ||
        STANDARD_CLASSES.has(name) ||
        STANDARD_METHODS.has(name) ||
        symbolTypeMap.has(name)
      ) {
        continue;
      }

      if (!isInsideQuotes(line, sym.index)) {
        if (nextChar === "." || nextChar === "[" || nextChar.startsWith("=")) {
          rawMarkers.push({
            startLineNumber: lineNum,
            startColumn: sym.index + 1,
            endLineNumber: lineNum,
            endColumn: sym.index + 1 + name.length,
            message: `Cannot resolve symbol '${name}'. Variable '${name}' has not been declared.`,
            severity: 8,
          });
        }
      }
    }

    // E. Method Casing Typos
    const methodCaseErrors = [
      { regex: /\.printline\b/g, correct: ".println" },
      { regex: /\.printLn\b/g, correct: ".println" },
      { regex: /\.nextint\b/g, correct: ".nextInt" },
      { regex: /\.nextline\b/g, correct: ".nextLine" },
      { regex: /\.charat\b/g, correct: ".charAt" },
      { regex: /\.tolowercase\b/g, correct: ".toLowerCase" },
      { regex: /\.touppercase\b/g, correct: ".toUpperCase" },
    ];

    for (const item of methodCaseErrors) {
      let m: RegExpExecArray | null;
      while ((m = item.regex.exec(line)) !== null) {
        if (!isInsideQuotes(line, m.index)) {
          rawMarkers.push({
            startLineNumber: lineNum,
            startColumn: m.index + 1,
            endLineNumber: lineNum,
            endColumn: m.index + 1 + m[0].length,
            message: `Cannot find symbol method '${m[0]}()'. Did you mean '${item.correct}()'?`,
            severity: 8,
          });
        }
      }
    }

    // F. Missing Semicolon Check on Statements
    if (
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(":") &&
      !trimmed.startsWith("if") &&
      !trimmed.startsWith("else") &&
      !trimmed.startsWith("for") &&
      !trimmed.startsWith("while") &&
      !trimmed.startsWith("public") &&
      !trimmed.startsWith("class") &&
      !trimmed.startsWith("@") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith("(") &&
      !trimmed.endsWith("+") &&
      (trimmed.startsWith("int ") ||
        trimmed.startsWith("String ") ||
        trimmed.startsWith("boolean ") ||
        trimmed.startsWith("double ") ||
        trimmed.startsWith("long ") ||
        trimmed.startsWith("char ") ||
        trimmed.startsWith("Scanner ") ||
        trimmed.startsWith("System.out.") ||
        trimmed.startsWith("return ") ||
        trimmed.endsWith("++") ||
        trimmed.endsWith("--"))
    ) {
      rawMarkers.push({
        startLineNumber: lineNum,
        startColumn: line.length,
        endLineNumber: lineNum,
        endColumn: line.length + 1,
        message: "';' expected",
        severity: 8,
      });
    }

    // G. Assignment '=' in conditional: `if (a = b)`
    const assignInCond = /\b(if|while)\s*\(\s*([a-zA-Z0-9_$]+)\s*=\s*([a-zA-Z0-9_$]+)\s*\)/g;
    let condMatch: RegExpExecArray | null;
    while ((condMatch = assignInCond.exec(line)) !== null) {
      if (!isInsideQuotes(line, condMatch.index)) {
        rawMarkers.push({
          startLineNumber: lineNum,
          startColumn: condMatch.index + 1,
          endLineNumber: lineNum,
          endColumn: condMatch.index + condMatch[0].length + 1,
          message: "Incompatible types: '=' is an assignment operator. In Java conditions, use '==' for comparison.",
          severity: 8,
        });
      }
    }
  }

  // Step 3: Global Bracket & Parentheses Matching
  let openCurly = 0;
  let openRound = 0;
  const curlyStack: { line: number; col: number }[] = [];
  const roundStack: { line: number; col: number }[] = [];

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const lNum = lIdx + 1;
    const line = lines[lIdx];

    for (let cIdx = 0; cIdx < line.length; cIdx++) {
      if (isInsideQuotes(line, cIdx)) continue;
      if (line.slice(cIdx, cIdx + 2) === "//") break;

      const char = line[cIdx];
      if (char === "{") {
        openCurly++;
        curlyStack.push({ line: lNum, col: cIdx + 1 });
      } else if (char === "}") {
        openCurly--;
        if (curlyStack.length > 0) curlyStack.pop();
        else {
          rawMarkers.push({
            startLineNumber: lNum,
            startColumn: cIdx + 1,
            endLineNumber: lNum,
            endColumn: cIdx + 2,
            message: "Extraneous '}' found without matching opening '{'.",
            severity: 8,
          });
        }
      } else if (char === "(") {
        openRound++;
        roundStack.push({ line: lNum, col: cIdx + 1 });
      } else if (char === ")") {
        openRound--;
        if (roundStack.length > 0) roundStack.pop();
        else {
          rawMarkers.push({
            startLineNumber: lNum,
            startColumn: cIdx + 1,
            endLineNumber: lNum,
            endColumn: cIdx + 2,
            message: "Extraneous ')' found without matching opening '('.",
            severity: 8,
          });
        }
      }
    }
  }

  for (const unclosed of roundStack) {
    rawMarkers.push({
      startLineNumber: unclosed.line,
      startColumn: unclosed.col,
      endLineNumber: unclosed.line,
      endColumn: unclosed.col + 1,
      message: "')' expected to close opening '('",
      severity: 8,
    });
  }

  for (const unclosed of curlyStack) {
    rawMarkers.push({
      startLineNumber: unclosed.line,
      startColumn: unclosed.col,
      endLineNumber: unclosed.line,
      endColumn: unclosed.col + 1,
      message: "'}' expected to close class or method body",
      severity: 8,
    });
  }

  // Deduplicate markers by line and column range
  const seen = new Set<string>();
  const markers: EditorMarker[] = [];
  for (const m of rawMarkers) {
    const key = `${m.startLineNumber}:${m.startColumn}:${m.endColumn}:${m.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      markers.push(m);
    }
  }

  return markers;
}

function isInsideQuotes(line: string, index: number): boolean {
  let insideDouble = false;
  let insideSingle = false;
  for (let i = 0; i < index; i++) {
    const ch = line[i];
    if (ch === '"' && (i === 0 || line[i - 1] !== "\\")) {
      insideDouble = !insideDouble;
    } else if (ch === "'" && (i === 0 || line[i - 1] !== "\\")) {
      insideSingle = !insideSingle;
    }
  }
  return insideDouble || insideSingle;
}
