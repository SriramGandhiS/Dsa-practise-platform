"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Play, Copy, Check, RotateCcw } from "lucide-react";
import { analyzeJavaCodeLive } from "@/lib/java-diagnostics";

export default function RapidCompilerPage() {
  // Clean empty start for zero boilerplate
  const [code, setCode] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<
    Array<{ type: "input" | "output" | "error"; text: string }>
  >([]);
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Split view percentage
  const [leftWidth, setLeftWidth] = useState<number>(50);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory, isWaitingForInput, isRunning]);

  // Focus input when waiting
  useEffect(() => {
    if (isWaitingForInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isWaitingForInput]);

  // Splitter dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPct = ((ev.clientX - rect.left) / rect.width) * 100;
      const clampedPct = Math.min(80, Math.max(20, rawPct));
      setLeftWidth(clampedPct);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  // Monaco autocomplete setup + Vibrant Theme
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("programiz-vibrant", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "c678dd", fontStyle: "bold" },
        { token: "keyword.java", foreground: "c678dd", fontStyle: "bold" },
        { token: "type", foreground: "4fc1ff", fontStyle: "bold" },
        { token: "type.identifier", foreground: "61afef" },
        { token: "class", foreground: "61afef", fontStyle: "bold" },
        { token: "string", foreground: "98c379" },
        { token: "string.escape", foreground: "56b6c2" },
        { token: "number", foreground: "d19a66" },
        { token: "comment", foreground: "7f848e", fontStyle: "italic" },
        { token: "delimiter", foreground: "abb2bf" },
        { token: "delimiter.bracket", foreground: "ffd700" },
        { token: "identifier", foreground: "e5c07b" },
      ],
      colors: {
        "editor.background": "#1e1f26",
        "editor.foreground": "#e1e4e8",
        "editorCursor.foreground": "#528bff",
        "editor.lineHighlightBackground": "#282a3640",
        "editorLineNumber.foreground": "#495162",
        "editorLineNumber.activeForeground": "#61afef",
        "editor.selectionBackground": "#3e4451",
      },
    });

    monaco.editor.setTheme("programiz-vibrant");

    monaco.languages.registerCompletionItemProvider("java", {
      triggerCharacters: ["s", "S", "p", "f", "."],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "sysout",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "System.out.println(${1:});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "System.out.println()",
            detail: "System.out.println(value);",
            range,
            filterText: "sys sysout sout system System.out.println",
            sortText: "0001",
          },
          {
            label: "System.out.println",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "System.out.println(${1:});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "System.out.println() statement",
            range,
            filterText: "sys sysout sout system System.out.println",
            sortText: "0002",
          },
          {
            label: "sop",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "System.out.print(${1:});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "System.out.print()",
            detail: "System.out.print(value);",
            range,
            filterText: "sop print system.out.print",
            sortText: "0003",
          },
          {
            label: "fori",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "for (int i = 0; i < n; i++) loop",
            range,
            filterText: "for fori loop",
            sortText: "0004",
          },
          {
            label: "scanner",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "Scanner sc = new Scanner(System.in);",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Scanner sc = new Scanner(System.in);",
            range,
            filterText: "sc scanner input",
            sortText: "0005",
          },
        ];

        return { suggestions };
      },
    });

    editor.focus();

    // Ctrl+Enter / Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleInitialRun();
    });
  };

  // Live syntax diagnostics
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;
    if (!code.trim()) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, "java-validator", []);
      }
      return;
    }

    const markers = analyzeJavaCodeLive(code);
    const monacoMarkers = markers.map((m) => ({
      startLineNumber: m.startLineNumber,
      startColumn: m.startColumn,
      endLineNumber: m.endLineNumber,
      endColumn: m.endColumn,
      message: m.message,
      severity:
        m.severity === 8
          ? monacoRef.current.MarkerSeverity.Error
          : m.severity === 4
          ? monacoRef.current.MarkerSeverity.Warning
          : monacoRef.current.MarkerSeverity.Info,
    }));

    const model = editorRef.current.getModel();
    if (model) {
      monacoRef.current.editor.setModelMarkers(model, "java-validator", monacoMarkers);
    }
  }, [code]);

  // Execute with specific stdin input
  const executeCodeWithInput = async (inputStr: string) => {
    setIsRunning(true);
    setIsWaitingForInput(false);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          isCompilerOnly: true,
          customInput: inputStr,
        }),
      });

      const data = await res.json();
      if (data.compileError) {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "error", text: data.compileError },
        ]);
      } else if (data.runtimeError) {
        // If NoSuchElementException happens because input was missing, ask for input in terminal
        if (data.runtimeError.includes("NoSuchElementException") && !inputStr.trim()) {
          setIsWaitingForInput(true);
        } else {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "error", text: data.runtimeError },
          ]);
        }
      } else if (data.error) {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "error", text: data.error },
        ]);
      } else if (data.results && data.results.length > 0) {
        const res0 = data.results[0];
        if (res0.error) {
          if (res0.error.includes("NoSuchElementException") && !inputStr.trim()) {
            setIsWaitingForInput(true);
          } else {
            setTerminalHistory((prev) => [
              ...prev,
              { type: "error", text: res0.error },
            ]);
          }
        } else if (res0.actual) {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "output", text: res0.actual },
          ]);
        }
      } else if (data.cleanOutput) {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "output", text: data.cleanOutput },
        ]);
      }
    } catch (err: any) {
      setTerminalHistory((prev) => [
        ...prev,
        { type: "error", text: err?.message || "Execution error." },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  // Initial Run
  const handleInitialRun = async () => {
    if (!code.trim()) {
      setTerminalHistory([
        { type: "error", text: "No code to run. Write some Java statements to execute." },
      ]);
      return;
    }

    setTerminalHistory([]);
    setTerminalInput("");

    // Check if code contains Scanner or reads input
    const usesScanner = /\b(Scanner|System\.in|nextInt|nextLine|next\(\)|nextDouble|nextLong)\b/i.test(
      code
    );

    if (usesScanner) {
      // Prompt for interactive input directly in the terminal
      setIsWaitingForInput(true);
    } else {
      executeCodeWithInput("");
    }
  };

  // Handle Enter key in terminal input prompt
  const handleTerminalInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = terminalInput;
      setTerminalHistory((prev) => [...prev, { type: "input", text: val }]);
      setTerminalInput("");
      executeCodeWithInput(val);
    }
  };

  const handleCopy = () => {
    const fullText = terminalHistory.map((item) => item.text).join("\n");
    navigator.clipboard.writeText(fullText || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTerminalHistory([]);
    setIsWaitingForInput(false);
    setTerminalInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#17181c] text-[#e1e4e8] font-sans overflow-hidden select-none">
      {/* MAIN SPLIT-VIEW (PROGRAMIZ STYLE) */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: CODE EDITOR */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col overflow-hidden shrink-0 relative bg-[#1e1f26] border-r border-[#2a2b36]"
        >
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1b1c23] border-b border-[#2a2b36] shrink-0 h-10">
            {/* Main.java tab & Run Button placed together */}
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1 bg-[#252631] text-[#e1e4e8] rounded font-mono text-xs font-semibold border-b-2 border-[#0d6efd]">
                Main.java
              </div>

              <button
                onClick={handleInitialRun}
                disabled={isRunning}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-sans text-xs font-bold shadow-xs active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className={`h-3 w-3 fill-current ${isRunning ? "animate-spin" : ""}`} />
                <span>{isRunning ? "Running..." : "Run"}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor with Vibrant High-Contrast Syntax Colors */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="programiz-vibrant"
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 18,
                lineHeight: 29,
                fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                lineNumbersMinChars: 3,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                renderLineHighlight: "all",
                glyphMargin: false,
                folding: true,
                matchBrackets: "always",
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                bracketPairColorization: { enabled: true },
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>

        {/* DRAGGABLE DIVIDER (PROGRAMIZ GRIP HANDLE) */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2 relative z-30 cursor-col-resize group flex items-center justify-center bg-[#17181c] hover:bg-[#0d6efd]/30 border-x border-[#2a2b36] shrink-0"
          title="Drag to resize"
        >
          <div className="h-6 w-1 rounded-full bg-[#3d4052] group-hover:bg-[#0d6efd] transition-colors" />
        </div>

        {/* RIGHT COLUMN: SINGLE INTERACTIVE CMD OUTPUT TERMINAL */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col overflow-hidden flex-1 bg-[#17181c]"
          onClick={() => {
            if (isWaitingForInput) inputRef.current?.focus();
          }}
        >
          {/* Output Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#1b1c23] border-b border-[#2a2b36] shrink-0 h-10">
            <span className="font-sans text-xs font-bold text-[#c9d1d9] tracking-wide">
              Output
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#252631] transition-colors text-xs font-sans"
                title="Copy output"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleClear}
                className="p-1 rounded text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#252631] transition-colors"
                title="Clear output"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Interactive Terminal Body */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm select-text text-[#e1e4e8] space-y-1.5">
            {terminalHistory.map((item, idx) => (
              <div key={idx}>
                {item.type === "input" ? (
                  <div className="text-amber-400 font-mono">
                    <span className="text-[#8b949e] select-none">&gt; </span>
                    {item.text}
                  </div>
                ) : item.type === "error" ? (
                  <pre className="text-[#ff7b72] font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {item.text}
                  </pre>
                ) : (
                  <pre className="text-[#e1e4e8] whitespace-pre-wrap leading-relaxed font-mono text-sm">
                    {item.text}
                  </pre>
                )}
              </div>
            ))}

            {/* Interactive Terminal Blinking Cursor Prompt for Scanner */}
            {isWaitingForInput && (
              <div className="flex items-center gap-1 text-[#e1e4e8]">
                <span className="text-amber-400 font-bold select-none">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalInputKeyDown}
                  placeholder="type input and press Enter..."
                  className="bg-transparent border-none outline-none font-mono text-sm text-amber-300 w-full placeholder-[#555869] caret-amber-400"
                  autoFocus
                />
              </div>
            )}

            {/* Running Spinner */}
            {isRunning && (
              <div className="flex items-center gap-2 text-[#8b949e] py-1">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#0d6efd] border-t-transparent" />
                <span className="font-sans text-xs">Executing...</span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
