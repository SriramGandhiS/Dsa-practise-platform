"use client";

import { useState, useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  Play,
  RotateCcw,
  Terminal,
  Copy,
  Check,
  X,
  Zap,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { analyzeJavaCodeLive, EditorMarker } from "@/lib/java-diagnostics";

const RAPID_STARTER_CODE = `// ⚡ Rapid Compiler: Write Java statements directly!
// No import statements or class wrappers needed.

int a = 10;
int b = 25;
String name = "Java Learner";

System.out.println("Hello " + name + "!");
System.out.println("Sum = " + (a + b));

for (int i = 1; i <= 5; i++) {
    System.out.println("Step: " + i);
}`;

export default function RapidCompilerPage() {
  const [code, setCode] = useState<string>(RAPID_STARTER_CODE);
  const [input, setInput] = useState<string>("");
  const [showInputDrawer, setShowInputDrawer] = useState<boolean>(false);

  // Output Modal state with frosted backdrop
  const [showOutputModal, setShowOutputModal] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Live diagnostics
  const [liveMarkers, setLiveMarkers] = useState<EditorMarker[]>([]);
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  // Font zoom state
  const [editorFontSize, setEditorFontSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rapid_editor_font_size");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 12 && parsed <= 30) return parsed;
      }
    }
    return 16;
  });

  const handleFontSizeChange = (delta: number) => {
    setEditorFontSize((prev) => {
      const next = Math.min(28, Math.max(12, prev + delta));
      if (typeof window !== "undefined") {
        localStorage.setItem("rapid_editor_font_size", next.toString());
      }
      return next;
    });
  };

  // Register Monaco completion snippets (sysout, sop, fori, scanner, psvm)
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register Eclipse / IntelliJ style snippets
    monaco.languages.registerCompletionItemProvider("java", {
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
            insertText: "System.out.println(${1:value});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "System.out.println(value) statement",
            range,
          },
          {
            label: "sop",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "System.out.print(${1:value});",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "System.out.print(value) statement",
            range,
          },
          {
            label: "fori",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Standard indexed for-loop",
            range,
          },
          {
            label: "scanner",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "Scanner sc = new Scanner(System.in);",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Initialize standard input scanner",
            range,
          },
          {
            label: "psvm",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "public static void main(String[] args) {\n\t${0}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "public static void main method",
            range,
          },
        ];

        return { suggestions };
      },
    });

    // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  // Real-time live diagnostics (red underlines)
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;
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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showOutputModal) {
        setShowOutputModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOutputModal]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setOutput("");
    setShowOutputModal(true);

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
      setError(err?.message || "Execution service error.");
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white text-slate-900 font-sans overflow-hidden">
      {/* TOP HEADER BAR */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-200 bg-white shrink-0 shadow-2xs z-10">
        {/* Left: Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-50 border border-amber-200">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <h1 className="font-extrabold text-sm text-slate-900">Rapid Compiler</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Zero Boilerplate
            </span>
          </div>
        </div>

        {/* Right: Tools & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Custom Input Toggle Button */}
          <button
            onClick={() => setShowInputDrawer((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              showInputDrawer || input.trim().length > 0
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle Custom Standard Input (stdin)"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">Custom Input</span>
            {input.trim().length > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Font Zoom Widget */}
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full border border-slate-200 bg-white shadow-2xs">
            <button
              onClick={() => handleFontSizeChange(-1)}
              className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Zoom Out (Smaller Font)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 w-8 text-center select-none">
              {editorFontSize}px
            </span>
            <button
              onClick={() => handleFontSizeChange(1)}
              className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Zoom In (Larger Font)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reset Code */}
          <button
            onClick={() => setCode(RAPID_STARTER_CODE)}
            className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Reset code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 transition-all"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </header>

      {/* OPTIONAL COLLAPSIBLE CUSTOM STDIN DRAWER */}
      {showInputDrawer && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 transition-all animate-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="uppercase text-[10px] tracking-wider text-slate-500">
                Standard Input (stdin)
              </span>
              <button
                onClick={() => setShowInputDrawer(false)}
                className="text-slate-400 hover:text-slate-700 text-[11px]"
              >
                ✕ Close
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input values here (read via Scanner in Java)..."
              rows={3}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* MAIN CENTERED HERO CODE WORKSPACE */}
      <main className="flex-1 relative bg-white overflow-hidden flex flex-col">
        {/* Editor Sub-Header Info Bar */}
        <div className="px-6 py-1.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              ⚡ Rapid Snippet (No Boilerplate)
            </span>
            {liveMarkers.length > 0 ? (
              <span className="text-red-600 font-sans font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>
                  {liveMarkers.length} Error{liveMarkers.length > 1 ? "s" : ""}
                </span>
              </span>
            ) : (
              <span className="text-emerald-600 font-sans flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                <span>Syntax OK</span>
              </span>
            )}
          </div>

          <span className="hidden md:inline text-slate-400 font-sans text-[11px]">
            Snippets: <code className="text-slate-700 font-bold">sysout</code>,{" "}
            <code className="text-slate-700 font-bold">sop</code>,{" "}
            <code className="text-slate-700 font-bold">fori</code> • Ctrl+Enter to Run
          </span>
        </div>

        {/* Full-Height Monaco Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="light"
            value={code}
            onChange={(v) => setCode(v || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize: editorFontSize,
              lineHeight: Math.round(editorFontSize * 1.55),
              fontFamily: "Consolas, 'Courier New', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              renderLineHighlight: "all",
              glyphMargin: true,
              folding: true,
              matchBrackets: "always",
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        </div>
      </main>

      {/* FROSTED GLASS OUTPUT MODAL (DRAWER WITH BLURRED BACKDROP) */}
      {showOutputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
          {/* Modal Card */}
          <div
            className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">Program Output</span>
                {executionTime !== null && !error && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {executionTime}ms
                  </span>
                )}
                {error && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    Error
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold"
                  title="Copy Output"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowOutputModal(false)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Terminal Body */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-xs select-text">
              {isRunning ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <span className="font-sans text-sm">Compiling & executing Java code...</span>
                </div>
              ) : error ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Execution / Compilation Diagnostic:</span>
                    <pre className="whitespace-pre-wrap font-mono text-red-200 overflow-x-auto">
                      {error}
                    </pre>
                  </div>
                </div>
              ) : output ? (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {output}
                </pre>
              ) : (
                <span className="text-slate-500">No output printed.</span>
              )}
            </div>

            {/* Modal Footer with quick close info */}
            <div className="px-5 py-2.5 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-500 font-sans flex items-center justify-between">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Esc</kbd> or click Close to return to code</span>
              <button
                onClick={() => setShowOutputModal(false)}
                className="font-bold text-slate-300 hover:text-white transition-colors"
              >
                Back to Editor →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
