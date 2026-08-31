"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Eye,
  Zap,
} from "lucide-react";

interface VariableState {
  name: string;
  value: string;
  changed: boolean;
}

interface DryRunStep {
  line: number;
  lineContent: string;
  description: string;
  variables: VariableState[];
  output?: string;
}

/**
 * Parse a simple Java solution into step-by-step dry-run steps.
 * Works for basic programs with variables, loops, conditionals, and System.out.
 * This is a lightweight interpreter that traces through the code visually.
 */
function generateDryRunSteps(code: string, input: string = ""): DryRunStep[] {
  const lines = code.split("\n");
  const steps: DryRunStep[] = [];
  const vars: Map<string, string> = new Map();
  const inputParts = input.trim().split(/\s+/);
  let inputIdx = 0;
  let output = "";

  // Find the main method body lines
  let mainStart = -1;
  let mainEnd = -1;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.includes("static") && trimmed.includes("void") && trimmed.includes("main")) {
      mainStart = i;
      braceDepth = 0;
      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "{") braceDepth++;
          if (ch === "}") {
            braceDepth--;
            if (braceDepth === 0) {
              mainEnd = j;
              break;
            }
          }
        }
        if (mainEnd !== -1) break;
      }
      break;
    }
  }

  if (mainStart === -1) return [];

  // Simple line-by-line trace through the main body
  const bodyLines: { lineNum: number; content: string }[] = [];
  for (let i = mainStart + 1; i < mainEnd; i++) {
    const trimmed = lines[i].trim();
    if (trimmed && trimmed !== "{" && trimmed !== "}") {
      bodyLines.push({ lineNum: i + 1, content: trimmed });
    }
  }

  function getVarSnapshot(): VariableState[] {
    return Array.from(vars.entries()).map(([name, value]) => ({
      name,
      value,
      changed: false,
    }));
  }

  function makeStep(lineNum: number, content: string, desc: string, changedVars: string[] = [], outText?: string): DryRunStep {
    const variables = Array.from(vars.entries()).map(([name, value]) => ({
      name,
      value,
      changed: changedVars.includes(name),
    }));
    return { line: lineNum, lineContent: content, description: desc, variables, output: outText };
  }

  // Very simplified interpreter for common Java patterns
  function evalExpr(expr: string): string {
    // Replace variable references with their values
    let e = expr.trim();

    // Handle Scanner reads
    if (e.includes(".nextInt()") || e.includes(".nextLine()") || e.includes(".next()")) {
      const val = inputIdx < inputParts.length ? inputParts[inputIdx] : "0";
      inputIdx++;
      return val;
    }

    // Replace known variables
    for (const [name, val] of vars) {
      const re = new RegExp(`\\b${name}\\b`, "g");
      e = e.replace(re, val);
    }

    // Try numeric evaluation
    try {
      // Only evaluate if it looks numeric/mathematical
      if (/^[\d\s+\-*/%()]+$/.test(e)) {
        const result = Function(`"use strict"; return (${e})`)();
        if (typeof result === "number") {
          return Math.trunc(result).toString();
        }
      }
    } catch {}

    return e;
  }

  // Execute body lines (simplified — handles variable decls, assignments, prints, simple loops)
  let maxSteps = 60; // Cap steps to prevent infinite traces

  function traceLines(bodyLines: { lineNum: number; content: string }[], depth: number = 0) {
    for (let idx = 0; idx < bodyLines.length && steps.length < maxSteps; idx++) {
      const { lineNum, content } = bodyLines[idx];

      // Skip Scanner creation lines
      if (content.includes("new Scanner")) {
        steps.push(makeStep(lineNum, content, "Create Scanner to read input"));
        continue;
      }

      // Variable declaration with initialization: int x = expr;
      const declMatch = content.match(/^(int|long|double|float|char|boolean|String)\s+(\w+)\s*=\s*(.+);$/);
      if (declMatch) {
        const [, type, name, expr] = declMatch;
        const val = evalExpr(expr);
        vars.set(name, val);
        steps.push(makeStep(lineNum, content, `Declare ${type} ${name} = ${val}`, [name]));
        continue;
      }

      // Variable declaration without init: int x;
      const declNoInit = content.match(/^(int|long|double|float|char|boolean|String)\s+(\w+)\s*;$/);
      if (declNoInit) {
        const [, type, name] = declNoInit;
        vars.set(name, "0");
        steps.push(makeStep(lineNum, content, `Declare ${type} ${name} (default: 0)`, [name]));
        continue;
      }

      // Assignment: x = expr;
      const assignMatch = content.match(/^(\w+)\s*=\s*(.+);$/);
      if (assignMatch) {
        const [, name, expr] = assignMatch;
        if (vars.has(name)) {
          const oldVal = vars.get(name)!;
          const val = evalExpr(expr);
          vars.set(name, val);
          steps.push(makeStep(lineNum, content, `Update ${name}: ${oldVal} → ${val}`, [name]));
          continue;
        }
      }

      // Increment/Decrement: x++ or x-- or ++x or --x
      const incMatch = content.match(/^(\w+)(\+\+|--)\s*;$/);
      if (incMatch) {
        const [, name, op] = incMatch;
        if (vars.has(name)) {
          const old = parseInt(vars.get(name)!) || 0;
          const newVal = op === "++" ? old + 1 : old - 1;
          vars.set(name, newVal.toString());
          steps.push(makeStep(lineNum, content, `${name} ${op}: ${old} → ${newVal}`, [name]));
          continue;
        }
      }

      // Compound assignment: x += expr, x -= expr, x *= expr, x /= expr, x %= expr
      const compoundMatch = content.match(/^(\w+)\s*([+\-*/%])=\s*(.+);$/);
      if (compoundMatch) {
        const [, name, op, expr] = compoundMatch;
        if (vars.has(name)) {
          const oldVal = parseInt(vars.get(name)!) || 0;
          const rhs = parseInt(evalExpr(expr)) || 0;
          let newVal: number;
          switch (op) {
            case "+": newVal = oldVal + rhs; break;
            case "-": newVal = oldVal - rhs; break;
            case "*": newVal = oldVal * rhs; break;
            case "/": newVal = rhs !== 0 ? Math.trunc(oldVal / rhs) : 0; break;
            case "%": newVal = rhs !== 0 ? oldVal % rhs : 0; break;
            default: newVal = oldVal;
          }
          vars.set(name, newVal.toString());
          steps.push(makeStep(lineNum, content, `${name} ${op}= ${rhs}: ${oldVal} → ${newVal}`, [name]));
          continue;
        }
      }

      // System.out.println / print
      if (content.includes("System.out.print")) {
        const printMatch = content.match(/System\.out\.print(?:ln)?\s*\((.+)\)\s*;/);
        if (printMatch) {
          const arg = evalExpr(printMatch[1]);
          const isLn = content.includes("println");
          output += arg + (isLn ? "\n" : "");
          steps.push(makeStep(lineNum, content, `Output: ${arg}`, [], output.trim()));
          continue;
        }
      }

      // While loop header
      if (content.startsWith("while")) {
        steps.push(makeStep(lineNum, content, `Check loop condition`));
        // Collect loop body
        const loopBody: { lineNum: number; content: string }[] = [];
        let d = 0;
        let started = false;
        for (let j = idx; j < bodyLines.length; j++) {
          for (const ch of bodyLines[j].content) {
            if (ch === "{") { d++; started = true; }
            if (ch === "}") d--;
          }
          if (j > idx) {
            const c = bodyLines[j].content.replace(/^\{/, "").replace(/\}$/, "").trim();
            if (c) loopBody.push({ lineNum: bodyLines[j].lineNum, content: c });
          }
          if (started && d === 0) {
            idx = j; // Skip past loop body
            break;
          }
        }
        // Execute loop body up to a few iterations
        for (let iter = 0; iter < 5 && steps.length < maxSteps; iter++) {
          // Check condition roughly
          const condMatch = content.match(/while\s*\((.+)\)/);
          if (condMatch) {
            const cond = evalExpr(condMatch[1]);
            try {
              const result = Function(`"use strict"; return Boolean(${cond})`)();
              if (!result) {
                steps.push(makeStep(lineNum, content, `Loop condition false → exit loop`));
                break;
              }
            } catch { break; }
          }
          steps.push(makeStep(lineNum, content, `Loop iteration ${iter + 1}`));
          traceLines(loopBody, depth + 1);
        }
        continue;
      }

      // For loop header
      if (content.startsWith("for")) {
        const forMatch = content.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\d+)\s*;\s*\w+\s*(<|<=|>|>=)\s*(\w+)\s*;\s*\w+([\+\-]{2})/);
        if (forMatch) {
          const [, varName, initVal, cmp, limitExpr, incOp] = forMatch;
          const limit = parseInt(evalExpr(limitExpr)) || 0;
          let current = parseInt(initVal);
          vars.set(varName, current.toString());
          steps.push(makeStep(lineNum, content, `Start for loop: ${varName} = ${current}`, [varName]));

          // Collect loop body
          const loopBody: { lineNum: number; content: string }[] = [];
          let d = 0;
          let started = false;
          for (let j = idx; j < bodyLines.length; j++) {
            for (const ch of bodyLines[j].content) {
              if (ch === "{") { d++; started = true; }
              if (ch === "}") d--;
            }
            if (j > idx) {
              const c = bodyLines[j].content.replace(/^\{/, "").replace(/\}$/, "").trim();
              if (c) loopBody.push({ lineNum: bodyLines[j].lineNum, content: c });
            }
            if (started && d === 0) {
              idx = j;
              break;
            }
          }

          // Execute iterations
          for (let iter = 0; iter < 8 && steps.length < maxSteps; iter++) {
            let condMet = false;
            switch (cmp) {
              case "<": condMet = current < limit; break;
              case "<=": condMet = current <= limit; break;
              case ">": condMet = current > limit; break;
              case ">=": condMet = current >= limit; break;
            }
            if (!condMet) {
              steps.push(makeStep(lineNum, content, `${varName} = ${current} → condition false, exit loop`));
              break;
            }
            steps.push(makeStep(lineNum, content, `Loop: ${varName} = ${current}`, [varName]));
            traceLines(loopBody, depth + 1);
            current = incOp === "++" ? current + 1 : current - 1;
            vars.set(varName, current.toString());
          }
          continue;
        }

        // Fallback: just show the for header
        steps.push(makeStep(lineNum, content, "Enter for loop"));
        continue;
      }

      // If statement
      if (content.startsWith("if")) {
        steps.push(makeStep(lineNum, content, "Check if condition"));
        continue;
      }

      // Default: just show the line
      steps.push(makeStep(lineNum, content, content));
    }
  }

  traceLines(bodyLines);
  return steps;
}

interface StepVisualizerProps {
  code: string;
  input?: string;
}

export default function StepVisualizer({ code, input = "" }: StepVisualizerProps) {
  const [steps, setSteps] = useState<DryRunStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<"slow" | "medium" | "fast">("medium");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (code && isOpen) {
      const generated = generateDryRunSteps(code, input);
      setSteps(generated);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [code, input, isOpen]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const speedMs = speed === "slow" ? 2000 : speed === "medium" ? 1200 : 600;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  const step = steps[currentStep];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 hover:border-violet-300 text-violet-700 font-bold text-xs transition-all hover:shadow-md"
      >
        <Eye className="h-4 w-4" />
        Step-by-Step Code Visualizer
        <Zap className="h-3.5 w-3.5 text-amber-500" />
      </button>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        <Eye className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p>Generating step-by-step trace...</p>
        <button onClick={() => setIsOpen(false)} className="mt-2 text-xs text-slate-400 hover:text-slate-600">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-violet-200">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-violet-600" />
          <span className="font-bold text-xs text-violet-800">Step-by-Step Visualizer</span>
          <span className="text-[10px] font-mono text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
          ✕
        </button>
      </div>

      {/* Code with highlighted line */}
      <div className="bg-slate-950 px-4 py-3 max-h-48 overflow-y-auto font-mono text-xs">
        {code.split("\n").map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = step && lineNum === step.line;
          return (
            <div
              key={idx}
              className={`flex gap-3 px-2 py-0.5 rounded transition-colors ${
                isHighlighted
                  ? "bg-violet-600/30 border-l-2 border-violet-400"
                  : "border-l-2 border-transparent"
              }`}
            >
              <span className={`w-6 text-right select-none ${isHighlighted ? "text-violet-300" : "text-slate-600"}`}>
                {lineNum}
              </span>
              <span className={isHighlighted ? "text-violet-100 font-semibold" : "text-slate-400"}>
                {line || " "}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Step Description */}
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 py-3 bg-violet-50 border-y border-violet-100"
          >
            <p className="text-sm font-semibold text-violet-900">{step.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variable State Table */}
      {step && step.variables.length > 0 && (
        <div className="px-4 py-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Variables
          </div>
          <div className="flex flex-wrap gap-2">
            {step.variables.map((v) => (
              <motion.div
                key={v.name}
                animate={v.changed ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border ${
                  v.changed
                    ? "bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <span className="font-bold">{v.name}</span>
                <span className="text-slate-400">=</span>
                <span className={`font-bold ${v.changed ? "text-amber-700" : "text-slate-900"}`}>
                  {v.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Output so far */}
      {step?.output && (
        <div className="px-4 pb-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Output
          </div>
          <div className="font-mono text-xs bg-slate-900 text-emerald-400 px-3 py-2 rounded-xl">
            {step.output}
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            title="Go to start"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
            title="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
            title="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setCurrentStep(steps.length - 1); setIsPlaying(false); }}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            title="Go to end"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1">
          {(["slow", "medium", "fast"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                speed === s
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s === "slow" ? "0.5x" : s === "medium" ? "1x" : "2x"}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
