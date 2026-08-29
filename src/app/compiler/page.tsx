"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Terminal, Clock, Copy, Check } from "lucide-react";

const DEFAULT_COMPILER_CODE = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;

export default function OnlineCompilerPage() {
  const [code, setCode] = useState<string>(DEFAULT_COMPILER_CODE);
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setOutput("");

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
      } else if (data.results && data.results.length > 0) {
        const res0 = data.results[0];
        if (res0.error) {
          setError(res0.error);
        }
        setOutput(res0.actual || "(No output)");
        setExecutionTime(res0.timeMs || 0);
      } else {
        setOutput("Program executed successfully with no output.");
      }
    } catch (err: any) {
      setError(err?.message || "Execution error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white text-slate-900 font-sans">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-extrabold text-sm text-slate-900">Online Java Compiler</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Open Sandbox
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCode(DEFAULT_COMPILER_CODE)}
            className="p-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Reset to default skeleton"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 disabled:opacity-50 transition-all"
          >
            <Play className={`h-3 w-3 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Layout: Editor (Left 60%) + Input/Output (Right 40%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor */}
        <div className="w-3/5 border-r border-slate-200 bg-white flex flex-col">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-mono font-bold text-slate-700 flex justify-between items-center">
            <span>Main.java</span>
            <span className="text-[11px] font-sans font-normal text-slate-400">Shift+4 for println() • Shift+3 for print()</span>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme="light"
              value={code}
              onChange={(v) => setCode(v || "")}
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
              }}
            />
          </div>
        </div>

        {/* Input & Output Panels */}
        <div className="w-2/5 flex flex-col bg-slate-50 overflow-hidden divide-y divide-slate-200 text-xs">
          {/* Custom Input */}
          <div className="h-2/5 p-4 flex flex-col bg-white">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1.5 block">
              Standard Input (stdin)
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter custom input here..."
              className="flex-1 w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Standard Output / Errors */}
          <div className="h-3/5 p-4 flex flex-col bg-slate-950 text-white overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-bold">Output</span>
                {executionTime !== null && (
                  <span className="text-slate-500 text-[10px] ml-2 font-sans">
                    ({executionTime}ms)
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors text-[11px] flex items-center gap-1"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 font-mono text-xs">
              {isRunning ? (
                <div className="text-slate-500 flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <span>Compiling and executing...</span>
                </div>
              ) : error ? (
                <pre className="text-red-400 whitespace-pre-wrap font-mono leading-relaxed">
                  {error}
                </pre>
              ) : output ? (
                <pre className="text-emerald-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {output}
                </pre>
              ) : (
                <span className="text-slate-600">Run code to see output here.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
