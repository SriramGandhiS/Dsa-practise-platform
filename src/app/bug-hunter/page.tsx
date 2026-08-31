"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Bug,
  Puzzle,
  CheckCircle2,
  XCircle,
  Code2,
  Lightbulb,
  ArrowRight,
  Trophy,
  Zap,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Play,
  Check,
} from "lucide-react";
import { BUG_CHALLENGES, BugChallenge } from "@/lib/bug-hunter-challenges";

export default function BugHunterPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [challenges, setChallenges] = useState<BugChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const categories = ["all", "Numbers", "Strings", "Arrays", "Algorithms"];

  const resetQuiz = (type: string, cat: string) => {
    let filtered = BUG_CHALLENGES;
    if (type !== "all") {
      filtered = filtered.filter((c) => c.type === type);
    }
    if (cat !== "all") {
      filtered = filtered.filter((c) => c.category === cat);
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setChallenges(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsVerified(false);
    setScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    setIsClient(true);
    resetQuiz("all", "all");
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    resetQuiz(type, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    resetQuiz(selectedType, cat);
  };

  const handleSelectOption = (index: number) => {
    if (isVerified) return;
    setSelectedOption(index);
  };

  const handleVerify = () => {
    if (selectedOption === null || isVerified) return;
    setIsVerified(true);
    const current = challenges[currentIndex];

    if (selectedOption === current.correctOptionIndex) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsVerified(false);
    } else {
      setIsFinished(true);
    }
  };

  if (!isClient) return null;

  if (isFinished) {
    const percentage = Math.round((score / challenges.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Bug Hunt Complete!
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              You correctly fixed & filled{" "}
              <strong className="text-slate-900 font-bold">{score}</strong> out of{" "}
              <strong className="text-slate-900 font-bold">{challenges.length}</strong> challenges ({percentage}%)
            </p>

            <div className="w-full bg-slate-100 rounded-full h-3.5 mb-8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>

            <button
              onClick={() => resetQuiz(selectedType, selectedCategory)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Play Again / Shuffle
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const current = challenges[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  Bug Hunter & Code Fill-ups
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <p className="text-slate-500 text-xs font-medium">
                  Spot logic bugs, fix syntax traps, and fill in missing DSA lines
                </p>
              </div>
            </div>

            {/* Score Counter */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto">
              <span className="text-slate-400">Score:</span>
              <span className="text-emerald-600 font-extrabold">{score}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">{challenges.length}</span>
            </div>
          </div>

          {/* Mode & Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl gap-1">
              <button
                onClick={() => handleTypeChange("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedType === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Modes
              </button>
              <button
                onClick={() => handleTypeChange("BUG_FIX")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  selectedType === "BUG_FIX"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bug className="w-3 h-3" />
                Find the Bug
              </button>
              <button
                onClick={() => handleTypeChange("FILL_BLANK")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  selectedType === "FILL_BLANK"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Puzzle className="w-3 h-3" />
                Fill the Blanks
              </button>
            </div>

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {cat === "all" ? "All Topics" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {challenges.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>Challenge {currentIndex + 1} of {challenges.length}</span>
              <span>{Math.round(((currentIndex + 1) / challenges.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Challenge Card */}
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Challenge Title & Badges */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        current.type === "BUG_FIX"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {current.type === "BUG_FIX" ? (
                        <>
                          <Bug className="w-3 h-3" /> Find the Bug
                        </>
                      ) : (
                        <>
                          <Puzzle className="w-3 h-3" /> Fill the Blank
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {current.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      current.difficulty === "Beginner"
                        ? "bg-emerald-100 text-emerald-800"
                        : current.difficulty === "Easy"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {current.difficulty}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-1">
                  {current.title}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  <strong>Goal:</strong> {current.goal}
                </p>

                {/* Bug Alert if applicable */}
                {current.bugDescription && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-rose-950">Current Problem:</span>
                      {current.bugDescription}
                    </div>
                  </div>
                )}

                {/* Code Snippet Box */}
                <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs overflow-x-auto my-4 border border-slate-800">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      Java Snippet
                    </span>
                    <span className="text-slate-400">
                      {current.type === "BUG_FIX" ? "Look for the bug below:" : "Fill the missing line:"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {current.codeSnippet.split("\n").map((line, idx) => {
                      const lineNum = idx + 1;
                      const isBuggy = current.buggyLineNumber === lineNum;
                      const isBlank = line.includes("/* ___FILL_BLANK___ */");

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 px-2 py-1 rounded-lg transition-colors ${
                            isBuggy
                              ? "bg-rose-950/70 border-l-2 border-rose-500 text-rose-300 font-bold"
                              : isBlank
                              ? "bg-blue-950/70 border-l-2 border-blue-400 text-blue-300 font-bold animate-pulse"
                              : "border-l-2 border-transparent text-slate-300"
                          }`}
                        >
                          <span className="w-5 text-right text-slate-600 select-none text-[11px]">
                            {lineNum}
                          </span>
                          <span className="font-mono">
                            {isBlank ? (
                              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-500/50">
                                {selectedOption !== null ? current.options[selectedOption] : "👉 [ Select a line below ]"}
                              </span>
                            ) : isBuggy && isVerified && selectedOption === current.correctOptionIndex ? (
                              <span className="text-emerald-400 line-through">
                                {line} <span className="no-underline text-emerald-300 ml-2">✓ Fixed: {current.options[selectedOption]}</span>
                              </span>
                            ) : (
                              line
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-bold">
                  {current.type === "BUG_FIX"
                    ? "Select the correct replacement line to fix the bug:"
                    : "Select the correct code to insert at the blank:"}
                </p>
              </div>

              {/* 4 Options Grid */}
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {current.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrect = index === current.correctOptionIndex;

                    let btnStyle =
                      "p-4 rounded-2xl border text-left transition-all relative flex items-center justify-between font-mono text-xs font-bold ";

                    if (!isVerified) {
                      btnStyle += isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-2xs text-slate-800 cursor-pointer";
                    } else if (isCorrect) {
                      btnStyle +=
                        "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200";
                    } else if (isSelected && !isCorrect) {
                      btnStyle +=
                        "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-200";
                    } else {
                      btnStyle +=
                        "bg-white border-slate-200 text-slate-400 opacity-50";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectOption(index)}
                        disabled={isVerified}
                        className={btnStyle}
                      >
                        <span>{option}</span>
                        {!isVerified && isSelected && (
                          <Check className="w-4 h-4 text-white flex-shrink-0" />
                        )}
                        {isVerified && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {isVerified && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    {selectedOption === null
                      ? "Select an option above"
                      : !isVerified
                      ? "Ready to check your answer"
                      : isVerified && selectedOption === current.correctOptionIndex
                      ? "🎉 Correct! Output matches expected output."
                      : "❌ Incorrect fix. Check explanation below."}
                  </span>

                  {!isVerified ? (
                    <button
                      onClick={handleVerify}
                      disabled={selectedOption === null}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Verify & Run Code
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                    >
                      {currentIndex < challenges.length - 1 ? "Next Challenge" : "Finish Hunt"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Explanation section after verification */}
              <AnimatePresence>
                {isVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-slate-200 bg-white p-6"
                  >
                    <div className="flex gap-3 mb-2">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0 h-fit">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-1">
                            Why this fix works:
                          </h4>
                          <p className="text-slate-700 text-xs leading-relaxed">
                            {current.explanation}
                          </p>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 flex gap-2.5 items-start">
                          <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-emerald-950 block mb-0.5">
                              Expected Output:
                            </span>
                            <span className="font-mono bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded">
                              {current.expectedOutput}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-xs font-semibold">
              No challenges found for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
