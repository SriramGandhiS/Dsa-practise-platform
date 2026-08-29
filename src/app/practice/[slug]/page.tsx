"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Editor, { OnMount } from "@monaco-editor/react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { analyzeJavaCodeLive, EditorMarker } from "@/lib/java-diagnostics";
import { getFamilyForSlug } from "@/lib/problem-families";
import { getDiagramForSlug } from "@/lib/problem-diagrams";

interface QuestionData {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  level: number;
  topic: { name: string; slug: string };
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: string;
  visibleTests: Array<{ id: number; input: string; expected: string }>;
  expectedTime: string;
  expectedSpace: string;
  simpleSolution: string;
  simpleExplanation: string;
  optimalSolution: string;
  optimalExplanation: string;
}

export default function PracticePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [code, setCode] = useState<string>("");
  const [nextQuestionSlug, setNextQuestionSlug] = useState<string | null>(null);

  // Monaco and live markers
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [liveMarkers, setLiveMarkers] = useState<EditorMarker[]>([]);
  const [showProblemsDrawer, setShowProblemsDrawer] = useState<boolean>(false);

  // Splitter resizable width percentage
  const [leftWidth, setLeftWidth] = useState<number>(60);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active right panel tab: "problem" | "console" | "solution"
  const [activeTab, setActiveTab] = useState<"problem" | "console" | "solution">("problem");

  // Execution
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [solvedStats, setSolvedStats] = useState<{ time: string } | null>(null);

  // Timer
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Copy state for solutions
  const [copiedSimple, setCopiedSimple] = useState(false);
  const [copiedOptimal, setCopiedOptimal] = useState(false);

  // Hint State
  const [showHint, setShowHint] = useState(false);

  // Dragging logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeftPercent = ((event.clientX - rect.left) / rect.width) * 100;
      if (newLeftPercent >= 25 && newLeftPercent <= 80) {
        setLeftWidth(newLeftPercent);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleRunRef = useRef<() => void>(() => {});

  // Monaco onMount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const insertSnippet = (text: string, cursorOffset: number) => {
      const selection = editor.getSelection();
      if (!selection) return;
      const startPos = selection.getStartPosition();
      editor.executeEdits("custom-shortcut", [
        {
          range: selection,
          text: text,
          forceMoveMarkers: true,
        },
      ]);
      const cursorCol = startPos.column + cursorOffset;
      editor.setPosition({ lineNumber: startPos.lineNumber, column: cursorCol });
      editor.focus();
    };

    // Use onKeyDown with preventDefault to intercept custom shortcuts
    editor.onKeyDown((e) => {
      const browserKey = e.browserEvent?.key;
      const browserCode = e.browserEvent?.code;

      // Ctrl + S or Cmd + S -> Run Code
      if ((e.ctrlKey || e.metaKey) && (browserKey === "s" || browserKey === "S" || browserCode === "KeyS")) {
        e.preventDefault();
        e.stopPropagation();
        handleRunRef.current();
        return;
      }

      // Shift + 4 -> System.out.println();
      if (e.shiftKey && (browserCode === "Digit4" || browserKey === "$" || browserKey === "4")) {
        e.preventDefault();
        e.stopPropagation();
        insertSnippet("System.out.println();", "System.out.println(".length);
        return;
      }

      // Shift + 3 -> System.out.print();
      if (e.shiftKey && (browserCode === "Digit3" || browserKey === "#" || browserKey === "3")) {
        e.preventDefault();
        e.stopPropagation();
        insertSnippet("System.out.print();", "System.out.print(".length);
        return;
      }
    });

    // Run initial live analysis
    const markers = analyzeJavaCodeLive(code);
    setLiveMarkers(markers);
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, "java-validator", markers);
    }
  };

  // Live real-time IDE diagnostics on code change
  useEffect(() => {
    const timer = setTimeout(() => {
      const markers = analyzeJavaCodeLive(code);
      setLiveMarkers(markers);

      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, "java-validator", markers);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/questions/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const parsed: QuestionData = {
            ...data,
            examples: typeof data.examples === "string" ? JSON.parse(data.examples) : data.examples || [],
            visibleTests: typeof data.visibleTests === "string" ? JSON.parse(data.visibleTests) : data.visibleTests || [],
          };
          setQuestion(parsed);
          setCode(parsed.starterCode);
        }
      })
      .catch((err) => console.error(err));

    fetch("/api/questions")
      .then((res) => res.json())
      .then((list) => {
        if (Array.isArray(list)) {
          const idx = list.findIndex((q) => q.slug === slug);
          if (idx >= 0 && idx < list.length - 1) {
            setNextQuestionSlug(list[idx + 1].slug);
          }
        }
      })
      .catch(() => {});

    setElapsedSec(0);
    timerRef.current = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slug]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRun = async () => {
    if (!question) return;
    setIsRunning(true);
    setActiveTab("console");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          questionId: question.id || question.slug,
          timeTakenSec: elapsedSec,
        }),
      });
      const data = await res.json();
      if (!res.ok && !data.status) {
        data.status = "RUNTIME_ERROR";
        data.runtimeError = data.error || data.details || "Execution request failed.";
      }
      setRunResult(data);
      if (data.status === "ACCEPTED") {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSolvedStats({
          time: `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`,
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("statsUpdated"));
        }
      }
    } catch (err: any) {
      console.error(err);
      setRunResult({
        success: false,
        status: "RUNTIME_ERROR",
        runtimeError: err.message || "Failed to reach execution server.",
        results: [],
        passedTests: 0,
        totalTests: 0,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  handleRunRef.current = handleRun;

  // Global window shortcut listener for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S" || e.code === "KeyS")) {
        e.preventDefault();
        e.stopPropagation();
        handleRunRef.current();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleCopyCode = (text: string, isOptimal = false) => {
    navigator.clipboard.writeText(text);
    if (isOptimal) {
      setCopiedOptimal(true);
      setTimeout(() => setCopiedOptimal(false), 2000);
    } else {
      setCopiedSimple(true);
      setTimeout(() => setCopiedSimple(false), 2000);
    }
  };

  const jumpToLine = (line: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      editorRef.current.focus();
    }
  };

  if (!question) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const hasOptimal = Boolean(question.optimalSolution && question.optimalSolution.trim().length > 0);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white text-slate-900 overflow-hidden font-sans">
      {/* TOP COMPILER ACTION BAR */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200 bg-white shrink-0">
        {/* Left: Breadcrumbs & Title + Single Run Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Link href="/questions" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
              ← Problems
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="font-extrabold text-sm text-slate-900">{question.title}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {question.difficulty}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Single Run Code Button with Ctrl+S shortcut */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 transition-all"
            title="Run Code (Ctrl + S)"
          >
            <Play className={`h-3 w-3 text-emerald-400 fill-emerald-400 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
            <kbd className="hidden sm:inline-block text-[10px] text-slate-300 font-mono font-normal ml-0.5 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              Ctrl+S
            </kbd>
          </button>
        </div>

        {/* Right: Problems indicator, Reset & Timer */}
        <div className="flex items-center gap-3">
          {/* IntelliJ-style Live Problems Pill */}
          <button
            onClick={() => setShowProblemsDrawer((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              liveMarkers.length > 0
                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-2xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title="Toggle Live Problems List"
          >
            {liveMarkers.length > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold">{liveMarkers.length} Problem{liveMarkers.length > 1 ? "s" : ""}</span>
                {showProblemsDrawer ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>No problems</span>
              </>
            )}
          </button>

          {/* Reset Starter Code */}
          <button
            onClick={() => setCode(question.starterCode)}
            className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Reset to clean starter skeleton"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-700 font-mono font-bold text-xs border border-slate-200">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>⏱ {formatTimer(elapsedSec)}</span>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE WITH DRAGGABLE SPLITTER */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative select-none">
        {/* LEFT COLUMN: RESIZABLE MONACO EDITOR */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col border-r border-slate-200 bg-white overflow-hidden shrink-0 relative"
        >
          {/* Full Height Editor */}
          <div className="flex-1 relative bg-white">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="light"
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
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

          {/* Collapsible Problems Drawer */}
          {showProblemsDrawer && liveMarkers.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 max-h-48 bg-white border-t border-slate-200 shadow-lg overflow-y-auto z-20 font-sans p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <span>Problems ({liveMarkers.length})</span>
                </span>
                <button
                  onClick={() => setShowProblemsDrawer(false)}
                  className="text-slate-400 hover:text-slate-700 text-[11px]"
                >
                  ✕ Close
                </button>
              </div>

              <div className="divide-y divide-slate-50">
                {liveMarkers.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToLine(m.startLineNumber)}
                    className="w-full text-left py-1.5 px-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold font-mono text-[11px]">
                        Line {m.startLineNumber}:
                      </span>
                      <span className="text-slate-700 group-hover:text-slate-900">
                        {m.message}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-medium">
                      Jump →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DRAGGABLE DIVIDER / SPLITTER */}
        <div
          onMouseDown={handleMouseDown}
          className="w-2 relative z-30 cursor-col-resize group flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors border-x border-slate-200/80 shrink-0"
          title="Drag to resize editor and panel"
        >
          <div className="h-6 w-1 rounded-full bg-slate-400 group-hover:bg-slate-600 transition-colors" />
        </div>

        {/* RIGHT COLUMN: REFINED DOCUMENT-STYLE QUESTION, SAMPLES, CONSOLE & STRUCTURED SOLUTION */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col bg-white overflow-hidden text-xs flex-1 border-l border-slate-100"
        >
          {/* Right Panel Tabs */}
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                activeTab === "problem"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("console")}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "console"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Terminal className="h-3 w-3" />
              <span>Console</span>
              {runResult && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    runResult.status === "ACCEPTED" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("solution")}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "solution"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>Solution</span>
            </button>
          </div>

          {/* TAB 1: REFINED HIGH-READABILITY DOCUMENT-STYLE QUESTION & SAMPLES */}
          {activeTab === "problem" && (
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 select-text font-sans">
              {/* 1. Problem Description (17-18px readable text) */}
              <div className="space-y-2">
                <p className="text-[17px] sm:text-[18px] text-slate-900 leading-relaxed font-medium">
                  {question.problemStatement}
                </p>
              </div>

              {/* 2. Input Format & Output Format (15-16px strong text) */}
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Input Format
                  </h4>
                  <p className="text-[15px] sm:text-[16px] text-slate-800 font-normal leading-normal font-sans">
                    {question.inputFormat || "None"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Output Format
                  </h4>
                  <p className="text-[15px] sm:text-[16px] text-slate-800 font-normal leading-normal font-sans">
                    {question.outputFormat}
                  </p>
                </div>
              </div>

              {/* 3. Example Input & Output (16px scan-friendly values) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Examples
                </h4>
                {question.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 space-y-3 font-sans"
                  >
                    {/* Input */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Input
                      </span>
                      <pre className="font-mono text-[16px] text-slate-900 font-bold bg-white p-2.5 rounded-lg border border-slate-200/80 whitespace-pre-wrap">
                        {ex.input || "(No input)"}
                      </pre>
                    </div>

                    {/* Output */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Output
                      </span>
                      <pre className="font-mono text-[16px] text-emerald-700 font-bold bg-white p-2.5 rounded-lg border border-slate-200/80 whitespace-pre-wrap">
                        {ex.output}
                      </pre>
                    </div>

                    {/* Explanation */}
                    {ex.explanation && (
                      <div className="text-xs text-slate-600 font-sans pt-1">
                        <strong className="text-slate-800 font-semibold">Explanation: </strong>
                        <span>{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 4. Minimal Hint Drawer */}
              <div className="pt-3 border-t border-slate-100">
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Need a hint?</span>
                    <span className="text-slate-400 font-normal">Click to reveal</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs leading-relaxed">
                    <span className="font-bold block mb-1 text-amber-950">Hint</span>
                    <p>{question.simpleExplanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CONSOLE & FULL TEST CASE INSPECTOR */}
          {activeTab === "console" && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono select-text bg-slate-50/50">
              {!runResult ? (
                <div className="text-slate-400 flex flex-col items-center justify-center h-full text-center space-y-2">
                  <Terminal className="h-6 w-6 text-slate-300" />
                  <p className="font-sans text-xs">
                    Click <strong className="text-slate-800">Run Code</strong> to execute your solution.
                  </p>
                </div>
              ) : runResult.compileError ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 space-y-2 font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-red-900">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>STATUS: COMPILATION ERROR</span>
                  </div>
                  <p className="text-xs text-red-700">
                    Your code could not be compiled. Check the compiler error diagnostic below:
                  </p>
                  <pre className="p-3 rounded-lg bg-white border border-red-200 font-mono text-xs text-red-800 whitespace-pre-wrap overflow-x-auto">
                    {runResult.compileError}
                  </pre>
                </div>
              ) : runResult.runtimeError || runResult.error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 space-y-2 font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-red-900">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>STATUS: {runResult.status || "RUNTIME ERROR"}</span>
                  </div>
                  <p className="text-xs text-red-700">
                    An error occurred during execution:
                  </p>
                  <pre className="p-3 rounded-lg bg-white border border-red-200 font-mono text-xs text-red-800 whitespace-pre-wrap overflow-x-auto">
                    {runResult.runtimeError || runResult.error}
                  </pre>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mode & Summary Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {runResult.passedTests ?? 0} / {runResult.totalTests ?? (runResult.results?.length || 0)} test cases passed
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      {runResult.executionTimeMs || 0}ms avg
                    </span>
                  </div>

                  {/* 1. Program Raw Output Box (Like real online compilers) */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-slate-500" />
                        <span>Your Program Output</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">stdout</span>
                    </div>
                    <pre className="p-3.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto shadow-2xs border border-slate-800">
                      {runResult.cleanOutput || runResult.results?.[0]?.actual || "(No output printed)"}
                    </pre>
                  </div>

                  {/* Solved Accepted Banner */}
                  {runResult.status === "ACCEPTED" && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-sans flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>ALL TEST CASES PASSED • SOLVED!</span>
                        </span>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Solved in {solvedStats?.time}!
                        </p>
                      </div>
                      {nextQuestionSlug && (
                        <Link
                          href={`/practice/${nextQuestionSlug}`}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Test Cases Full Details List */}
                  <div className="space-y-3">
                    {runResult.results?.map((tc: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          tc.passed
                            ? "bg-white border-slate-200 shadow-2xs"
                            : "bg-red-50/40 border-red-200 shadow-2xs"
                        }`}
                      >
                        {/* Test Header */}
                        <div className="flex items-center justify-between mb-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              Test Case {idx + 1}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tc.passed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {tc.passed ? "STATUS: PASSED" : "STATUS: FAILED"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tc.timeMs}ms
                          </span>
                        </div>

                        {/* Input, Expected, Actual Output Details */}
                        <div className="space-y-2.5 text-xs font-mono">
                          {/* Input */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-sans block mb-1">
                              Input:
                            </span>
                            <div className="text-slate-900 font-bold whitespace-pre-wrap">
                              {tc.input !== "" && tc.input !== undefined
                                ? tc.input
                                : "(No input)"}
                            </div>
                          </div>

                          {/* Expected Output */}
                          <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase font-sans block mb-1">
                              Expected Output:
                            </span>
                            <div className="text-emerald-800 font-bold whitespace-pre-wrap">
                              {tc.expected}
                            </div>
                          </div>

                          {/* Actual Output */}
                          <div
                            className={`p-2.5 rounded-xl border ${
                              tc.passed
                                ? "bg-emerald-50/50 border-emerald-100"
                                : "bg-red-50/80 border-red-200"
                            }`}
                          >
                            <span
                              className={`text-[10px] font-bold uppercase font-sans block mb-1 ${
                                tc.passed ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              Your Output:
                            </span>
                            <div
                              className={`font-bold whitespace-pre-wrap ${
                                tc.passed ? "text-emerald-800" : "text-red-700"
                              }`}
                            >
                              {tc.actual !== "" && tc.actual !== undefined
                                ? tc.actual
                                : "(No output)"}
                            </div>
                          </div>
                        </div>

                        {/* Error / Failure Note if any */}
                        {tc.error && (
                          <div className="mt-2.5 p-2 rounded-xl bg-red-100/60 border border-red-200 text-red-800 font-sans text-xs flex items-start gap-1.5">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                            <span>{tc.error}</span>
                          </div>
                        )}
                        {!tc.passed && !tc.error && (
                          <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-sans text-xs">
                            Output difference: Your program output did not match the expected output.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STRUCTURED PREMIUM SOLUTION EXPLANATION */}
          {activeTab === "solution" && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 font-sans select-text">
              {/* Reference Philosophy Notice */}
              <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                <strong className="text-slate-800">Note:</strong> The solution below is an educational reference with visual execution diagrams. Any valid Java approach that produces the correct output is accepted.
              </div>

              {/* VISUAL DIAGRAM & QUICK EXPLANATION */}
              {(() => {
                const diag = question ? getDiagramForSlug(question.slug) : null;
                if (!diag) return null;
                return (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 font-sans">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                          📐 Visual Concept: {diag.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {diag.category}
                        </span>
                      </div>
                    </div>

                    {/* 1. Contiguous 1D Array Graphic (Scaler / TalentBattle style) */}
                    {(diag.diagramType === "array_traversal" || diag.diagramType === "array_two_pointer") && diag.arrayData && (
                      <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100 flex flex-col items-center justify-center space-y-3">
                        {/* Pointers Top (if any) */}
                        {diag.arrayData.pointers && (
                          <div className="flex items-center justify-between w-full max-w-sm px-2 text-xs font-mono font-bold text-blue-600">
                            <span>{diag.arrayData.pointers.leftLabel}</span>
                            <span>{diag.arrayData.pointers.rightLabel}</span>
                          </div>
                        )}

                        {/* Contiguous Array Box */}
                        <div className="flex border-2 border-blue-600 rounded-md bg-blue-50/60 overflow-hidden shadow-xs">
                          {diag.arrayData.elements.map((el, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 flex items-center justify-center font-mono text-base font-bold text-slate-800 border-r-2 border-blue-600 last:border-r-0 bg-blue-50/80"
                            >
                              {el}
                            </div>
                          ))}
                        </div>

                        {/* Indices directly below boxes */}
                        <div className="flex justify-center">
                          {diag.arrayData.indices.map((idx, i) => (
                            <div
                              key={i}
                              className="w-12 text-center font-mono text-xs font-bold text-amber-600"
                            >
                              {idx}
                            </div>
                          ))}
                        </div>

                        {/* Traversal / Loop Definition */}
                        {diag.arrayData.loopCode && (
                          <div className="pt-1 flex flex-col items-center">
                            <span className="text-amber-600 text-lg leading-none select-none">
                              ⤷──────⤷──────⤷──────⤷
                            </span>
                            <code className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mt-1">
                              {diag.arrayData.loopCode}
                            </code>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Star Pattern Outer/Inner Loops Graphic */}
                    {diag.diagramType === "star_pattern" && diag.patternData && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                        <table className="w-full text-left font-mono">
                          <thead className="bg-slate-100/80 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Row (Outer Loop i)</th>
                              <th className="p-2.5">Inner Loop 1 (Spaces)</th>
                              <th className="p-2.5">Inner Loop 2 (Stars)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                            {diag.patternData.steps.map((p, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-900">{p.row}</td>
                                <td className="p-2.5 text-slate-600">{p.spaces}</td>
                                <td className="p-2.5 text-emerald-700 font-bold">{p.stars}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* 3. Number Digit Extraction Flow */}
                    {diag.diagramType === "digit_flow" && diag.digitData && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {diag.digitData.steps.map((s, i) => (
                          <div key={i} className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-blue-700 uppercase block font-sans">
                              {s.step}
                            </span>
                            <code className="text-slate-900 font-mono font-bold text-xs block">
                              {s.op}
                            </code>
                            <span className="text-[11px] text-slate-600 font-sans block">
                              {s.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Short 3-bullet explanation */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700 font-sans">
                      <span className="text-[11px] font-bold text-slate-900 block">
                        Key Concept:
                      </span>
                      {diag.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Simple / Standard Approach */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {hasOptimal ? "Reference Approach 1 (Standard)" : "Reference Solution"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Time: {question.expectedTime || "O(1)"}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Space: {question.expectedSpace || "O(1)"}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 leading-relaxed text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Approach:</span>
                  <p>{question.simpleExplanation}</p>
                </div>

                {/* Syntax-Highlighted Code Container */}
                <div className="rounded-2xl border border-slate-200 bg-slate-950 text-slate-50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>Java</span>
                    <button
                      onClick={() => handleCopyCode(question.simpleSolution, false)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedSimple ? (
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
                  </div>
                  <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
                    {question.simpleSolution}
                  </pre>
                </div>
              </div>

              {/* Optimal Approach (Only when genuinely different) */}
              {hasOptimal && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Reference Approach 2 (Optimal)
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Optimized
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 leading-relaxed text-xs">
                    <span className="font-bold text-slate-900 block mb-1">Why it is better:</span>
                    <p>{question.optimalExplanation}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-950 text-slate-50 overflow-hidden shadow-xs">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <span>Java (Optimal)</span>
                      <button
                        onClick={() => handleCopyCode(question.optimalSolution, true)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedOptimal ? (
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
                    </div>
                    <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
                      {question.optimalSolution}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
