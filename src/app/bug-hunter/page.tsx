"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import confetti from "canvas-confetti";
import {
  Play,
  Copy,
  Check,
  RotateCcw,
  Bug,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
} from "lucide-react";
import { BUG_CHALLENGES, BugChallenge } from "@/lib/bug-hunter-challenges";
import { analyzeJavaCodeLive } from "@/lib/java-diagnostics";

export default function BugHunterPage() {
  const [challenges, setChallenges] = useState<BugChallenge[]>(BUG_CHALLENGES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [code, setCode] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<
    Array<{ type: "input" | "output" | "error"; text: string }>
  >([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Split view percentage
  const [leftWidth, setLeftWidth] = useState<number>(55);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  const currentChallenge = challenges[currentIndex] || challenges[0];

  // Initialize or switch challenge
  useEffect(() => {
    if (currentChallenge) {
      setCode(currentChallenge.codeSnippet);
      setTerminalHistory([]);
      setIsPassed(false);
      setShowHint(false);
    }
  }, [currentIndex, currentChallenge]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory, isRunning, isPassed]);

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

    editor.focus();

    // Ctrl+Enter / Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
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

  // Normalize outputs for comparison
  const normalizeOutput = (str: string) =>
    (str || "").replace(/\r\n/g, "\n").trim();

  // Run Code against backend runner
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalHistory([
      { type: "output", text: "⚙️ Compiling and executing your fix..." },
    ]);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          isCompilerOnly: true,
          customInput: currentChallenge.testInput || "",
        }),
      });

      const data = await res.json();

      if (data.compileError) {
        setTerminalHistory([
          { type: "error", text: "❌ Compilation Error:\n" + data.compileError },
        ]);
        setIsPassed(false);
      } else if (data.runtimeError) {
        setTerminalHistory([
          { type: "error", text: "❌ Runtime Exception:\n" + data.runtimeError },
        ]);
        setIsPassed(false);
      } else {
        const actualRaw =
          data.results?.[0]?.actual || data.cleanOutput || "";
        const actual = normalizeOutput(actualRaw);
        const expected = normalizeOutput(currentChallenge.expectedOutput);

        const matches = actual === expected;

        setTerminalHistory([
          { type: "output", text: actualRaw || "(No output produced)" },
        ]);

        if (matches) {
          setIsPassed(true);
          confetti({
            particleCount: 80,
            spread: 65,
            origin: { y: 0.6 },
            colors: ["#22c55e", "#3b82f6", "#f59e0b"],
          });
        } else {
          setIsPassed(false);
        }
      }
    } catch (err: any) {
      setTerminalHistory([
        { type: "error", text: err?.message || "Execution failed." },
      ]);
      setIsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  // Reset to initial broken snippet
  const handleResetCode = () => {
    setCode(currentChallenge.codeSnippet);
    setTerminalHistory([]);
    setIsPassed(false);
  };

  // Navigate challenges
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#1e1f26] text-[#e1e4e8] select-none font-sans">
      {/* 1. TOP HEADER: Challenge Title, Goal, Mode Pill, Controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#18191f] border-b border-[#282a36] text-xs gap-3">
        {/* Left: Challenge Title & Category */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#282a36] px-2.5 py-1 rounded-lg">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Previous challenge"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white text-xs px-1">
              {currentIndex + 1} / {challenges.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === challenges.length - 1}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
              title="Next challenge"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                currentChallenge.type === "BUG_FIX"
                  ? "bg-rose-950/80 text-rose-300 border-rose-800"
                  : "bg-blue-950/80 text-blue-300 border-blue-800"
              }`}
            >
              {currentChallenge.type === "BUG_FIX" ? (
                <>
                  <Bug className="w-3 h-3 text-rose-400" /> Find the Bug
                </>
              ) : (
                <>
                  <Puzzle className="w-3 h-3 text-blue-400" /> Fill in the Blank
                </>
              )}
            </span>
            <h1 className="font-extrabold text-sm text-white truncate">
              {currentChallenge.title}
            </h1>
          </div>
        </div>

        {/* Center: Goal & Clue */}
        <div className="hidden md:flex items-center gap-2 max-w-xl truncate">
          <span className="text-slate-400 font-medium truncate">
            <strong className="text-white">Goal:</strong> {currentChallenge.goal}
          </span>
        </div>

        {/* Right: Hint Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              showHint
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-[#282a36] hover:bg-[#343746] text-slate-300"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>{showHint ? "Hide Clue" : "Clue"}</span>
          </button>

          <button
            onClick={handleResetCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#282a36] hover:bg-[#343746] text-slate-300 text-xs font-semibold transition-colors"
            title="Reset code to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 2. OPTIONAL CLUE BANNER */}
      {showHint && (
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-2 flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Clue:</strong>{" "}
              {currentChallenge.bugDescription ||
                currentChallenge.options[currentChallenge.correctOptionIndex]}
            </span>
          </div>
          <button
            onClick={() => setShowHint(false)}
            className="text-amber-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. MAIN SPLIT VIEW (Code Editor vs Interactive Output) */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: Editor */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col h-full bg-[#1e1f26] border-r border-[#282a36] overflow-hidden"
        >
          {/* Editor Header: Main.java Tab + Blue Run Button */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#18191f] border-b border-[#282a36] shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white px-2.5 py-1 bg-[#1e1f26] border-t-2 border-blue-500 rounded-t">
                Main.java
              </span>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? "Running..." : "Run ▶"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <button
                onClick={handleCopy}
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language="java"
              theme="programiz-vibrant"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                fontFamily: "Consolas, 'Courier New', monospace",
                lineNumbers: "on",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                suggestOnTriggerCharacters: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>

        {/* DRAGGABLE SPLITTER HANDLE */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 hover:w-2 bg-[#18191f] hover:bg-blue-600 transition-all cursor-col-resize flex items-center justify-center select-none z-10"
        >
          <div className="h-6 w-0.5 bg-slate-600 rounded-full" />
        </div>

        {/* RIGHT PANE: Output Terminal */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col h-full bg-[#1e1f26] overflow-hidden"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#18191f] border-b border-[#282a36] text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Output</span>
              <span className="text-slate-500 font-mono text-[11px]">
                Target: <span className="text-emerald-400 font-bold">&quot;{currentChallenge.expectedOutput}&quot;</span>
              </span>
            </div>

            {isPassed && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Solved
              </span>
            )}
          </div>

          {/* Terminal Console View */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#18191f]/60 space-y-4">
            {terminalHistory.length === 0 ? (
              <div className="text-slate-500 italic">
                Edit the Java code on the left and click <strong>Run ▶</strong> (or press <strong>Ctrl+Enter</strong>) to test your fix.
              </div>
            ) : (
              terminalHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    item.type === "error"
                      ? "text-rose-400 font-semibold"
                      : "text-slate-200"
                  }`}
                >
                  {item.text}
                </div>
              ))
            )}

            {/* CELEBRATION CARD WHEN FIXED & MATCHES EXPECTED OUTPUT */}
            {isPassed && (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Bug Fixed Successfully!</span>
                  </div>
                  {currentIndex < challenges.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>Next Challenge</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-emerald-200/90 leading-relaxed pt-1 border-t border-emerald-800/60">
                  <strong className="text-white block mb-1">Key Java Insight:</strong>
                  {currentChallenge.explanation}
                </div>
              </div>
            )}

            {/* FAILED / MISMATCH CARD */}
            {!isPassed && terminalHistory.length > 0 && !isRunning && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-xs text-amber-200/90 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
                  <span>Output doesn&apos;t match expected yet</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">Expected: </span>
                    <span className="text-emerald-400">&quot;{currentChallenge.expectedOutput}&quot;</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Your output: </span>
                    <span className="text-rose-400">&quot;{terminalHistory[terminalHistory.length - 1]?.text || ""}&quot;</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertTriangleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
