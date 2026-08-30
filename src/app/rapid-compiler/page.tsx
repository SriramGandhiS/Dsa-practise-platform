"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Terminal,
  Copy,
  Check,
  Zap,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Trash2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { analyzeJavaCodeLive, EditorMarker } from "@/lib/java-diagnostics";

export default function RapidCompilerPage() {
  // Empty start — zero boilerplate, ready to type from line 1
  const [code, setCode] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [activeRightTab, setActiveRightTab] = useState<"output" | "input">("output");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  // Output execution state
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Resizable split view
  const [leftWidth, setLeftWidth] = useState<number>(55);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live diagnostics
  const [liveMarkers, setLiveMarkers] = useState<EditorMarker[]>([]);
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  // Big, comfortable default font size (18px)
  const [editorFontSize, setEditorFontSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rapid_editor_font_size");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 14 && parsed <= 32) return parsed;
      }
    }
    return 18;
  });

  const handleFontSizeChange = (delta: number) => {
    setEditorFontSize((prev) => {
      const next = Math.min(32, Math.max(14, prev + delta));
      if (typeof window !== "undefined") {
        localStorage.setItem("rapid_editor_font_size", next.toString());
      }
      return next;
    });
  };

  // Dragging logic for splitter
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPct = ((ev.clientX - rect.left) / rect.width) * 100;
      const clampedPct = Math.min(80, Math.max(25, rawPct));
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

  // Register Monaco completion snippets (sys, sysout, sout, sop, fori, scanner, psvm)
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register Eclipse / IntelliJ style snippets for sys, sysout, etc.
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
            documentation: "System.out.println() — Print line to standard output",
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
            documentation: "System.out.print() — Print to standard output without newline",
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
            documentation: "Standard indexed for loop",
            detail: "for (int i = 0; i < n; i++)",
            range,
            filterText: "for fori loop",
            sortText: "0004",
          },
          {
            label: "scanner",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "Scanner sc = new Scanner(System.in);",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Initialize standard input scanner",
            detail: "Scanner sc = new Scanner(System.in);",
            range,
            filterText: "sc scanner input",
            sortText: "0005",
          },
          {
            label: "psvm",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "public static void main(String[] args) {\n\t${0}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "public static void main method",
            range,
            filterText: "psvm main",
            sortText: "0006",
          },
        ];

        return { suggestions };
      },
    });

    editor.focus();

    // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  // Real-time live diagnostics
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;
    if (!code.trim()) {
      setLiveMarkers([]);
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, "java-validator", []);
      }
      return;
    }

    const markers = analyzeJavaCodeLive(code);
    setLiveMarkers(markers);

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

  // Lightning-fast execution
  const handleRun = async () => {
    if (!code.trim()) {
      setError("Please write some Java statements first (e.g. System.out.println(\"Hello World\");) before running.");
      setOutput("");
      setActiveRightTab("output");
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput("");
    setActiveRightTab("output");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          isCompilerOnly: true,
          customInput: input,
        }),
      });

      const data = await res.json();
      if (data.compileError) {
        setError(data.compileError);
      } else if (data.runtimeError) {
        setError(data.runtimeError);
      } else if (data.error) {
        setError(data.error);
      } else if (data.results && data.results.length > 0) {
        const res0 = data.results[0];
        if (res0.error) {
          setError(res0.error);
        }
        setOutput(res0.actual || "(Program executed successfully with no output)");
        setExecutionTime(res0.timeMs || 0);
      } else if (data.cleanOutput) {
        setOutput(data.cleanOutput);
      } else {
        setOutput("Program executed successfully with no output.");
      }
    } catch (err: any) {
      setError(err?.message || "Execution error.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || error || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col h-[calc(100vh-3.5rem)] font-sans overflow-hidden transition-colors ${
        theme === "vs-dark" ? "bg-[#181818] text-slate-100" : "bg-white text-slate-900"
      }`}
    >
      {/* TOP COMPILER ACTION BAR */}
      <header
        className={`flex items-center justify-between px-4 sm:px-6 py-2 border-b shrink-0 z-10 ${
          theme === "vs-dark"
            ? "bg-[#1f1f1f] border-[#2d2d2d]"
            : "bg-white border-slate-200 shadow-2xs"
        }`}
      >
        {/* Left: Rapid Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <h1 className="font-extrabold text-sm tracking-tight">Rapid Compiler</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Zero Boilerplate
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Font Zoom Controls */}
          <div
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full border shadow-2xs ${
              theme === "vs-dark"
                ? "bg-[#2d2d2d] border-[#404040]"
                : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => handleFontSizeChange(-1)}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Zoom Out (Smaller Font)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-mono font-bold w-9 text-center select-none">
              {editorFontSize}px
            </span>
            <button
              onClick={() => handleFontSizeChange(1)}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Zoom In (Larger Font)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={() => setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))}
            className={`p-1.5 rounded-full border transition-colors shadow-2xs ${
              theme === "vs-dark"
                ? "bg-[#2d2d2d] border-[#404040] text-amber-400 hover:bg-[#383838]"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Toggle Dark / Light Theme"
          >
            {theme === "vs-dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Clear Code */}
          <button
            onClick={() => setCode("")}
            className={`p-1.5 rounded-full border transition-colors shadow-2xs ${
              theme === "vs-dark"
                ? "bg-[#2d2d2d] border-[#404040] text-slate-400 hover:text-white hover:bg-[#383838]"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Clear all code"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-6 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
        </div>
      </header>

      {/* MAIN SPLIT-VIEW WORKSPACE (PROGRAMIZ STYLE) */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative select-none">
        {/* LEFT COLUMN: MONACO EDITOR */}
        <div
          style={{ width: `${leftWidth}%` }}
          className={`flex flex-col overflow-hidden shrink-0 relative border-r ${
            theme === "vs-dark" ? "border-[#2d2d2d] bg-[#1e1e1e]" : "border-slate-200 bg-white"
          }`}
        >
          {/* Editor Header Tab */}
          <div
            className={`flex items-center justify-between px-4 py-2 border-b text-xs font-mono font-bold ${
              theme === "vs-dark"
                ? "bg-[#252526] border-[#2d2d2d] text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Main.java</span>
              <span className="text-[10px] font-sans font-normal opacity-60">
                (Type <code className="font-bold text-amber-400">sysout</code> for println)
              </span>
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-colors cursor-pointer"
            >
              <Play className="h-3 w-3" />
              <span>Run ▶</span>
            </button>
          </div>

          {/* Full Height Editor with Big Typography */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme={theme}
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: editorFontSize,
                lineHeight: Math.round(editorFontSize * 1.6),
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
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* DRAGGABLE DIVIDER / SPLITTER */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-2.5 relative z-30 cursor-col-resize group flex items-center justify-center transition-colors border-x shrink-0 ${
            theme === "vs-dark"
              ? "bg-[#181818] hover:bg-blue-600/30 border-[#2d2d2d]"
              : "bg-slate-100 hover:bg-blue-100 border-slate-200"
          }`}
          title="Drag to resize panels"
        >
          <div className="h-8 w-1 rounded-full bg-slate-500 group-hover:bg-blue-500 transition-colors" />
        </div>

        {/* RIGHT COLUMN: PERMANENT FAST OUTPUT & INPUT PANEL */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className={`flex flex-col overflow-hidden text-xs flex-1 ${
            theme === "vs-dark" ? "bg-[#141414]" : "bg-slate-900 text-white"
          }`}
        >
          {/* Right Panel Header Tabs */}
          <div
            className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${
              theme === "vs-dark" ? "bg-[#1f1f1f] border-[#2d2d2d]" : "bg-slate-950 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveRightTab("output")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition-colors ${
                  activeRightTab === "output"
                    ? "bg-[#333333] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Output</span>
                {executionTime !== null && !error && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    {executionTime}ms
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveRightTab("input")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition-colors ${
                  activeRightTab === "input"
                    ? "bg-[#333333] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
                <span>Input (stdin)</span>
                {input.trim().length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
              </button>
            </div>

            {/* Right Tools */}
            {activeRightTab === "output" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-slate-400 hover:text-white hover:bg-[#333333] transition-colors text-[11px]"
                  title="Copy Output"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setOutput("");
                    setError(null);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#333333] transition-colors"
                  title="Clear Terminal"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm select-text">
            {activeRightTab === "output" ? (
              isRunning ? (
                <div className="flex items-center gap-2.5 text-slate-400 py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  <span className="font-sans text-xs">Compiling & executing...</span>
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-red-400 font-sans font-bold text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Compilation / Runtime Error:</span>
                  </div>
                  <pre className="text-red-300 font-mono text-xs whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-red-950/40 border border-red-900/50 overflow-x-auto">
                    {error}
                  </pre>
                </div>
              ) : output ? (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto text-sm">
                  {output}
                </pre>
              ) : (
                <div className="text-slate-500 font-sans text-xs py-2">
                  <span>Click <strong className="text-slate-300">Run ▶</strong> to compile and see output here.</span>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col space-y-2">
                <span className="font-sans text-xs text-slate-400">
                  Standard Input (passed to Scanner in Java):
                </span>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter inputs here (e.g. 5, hello, 10 20)..."
                  className={`flex-1 w-full p-3 rounded-lg border font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    theme === "vs-dark"
                      ? "bg-[#1e1e1e] border-[#333333] text-slate-200"
                      : "bg-slate-800 border-slate-700 text-white"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
