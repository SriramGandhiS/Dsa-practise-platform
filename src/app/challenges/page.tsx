"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  Code2,
  Brain,
  Lightbulb,
  ArrowRight,
  Trophy,
  Zap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { javaGotchas, JavaGotcha } from "@/lib/java-gotchas";

export default function ChallengesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [challenges, setChallenges] = useState<JavaGotcha[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const categories = [
    "all",
    "integers",
    "strings",
    "arrays",
    "loops",
    "null",
    "operators",
    "collections",
    "core",
  ];

  const resetQuiz = (category: string) => {
    let filtered = javaGotchas;
    if (category !== "all") {
      filtered = javaGotchas.filter((g) => g.category === category);
    }
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setChallenges(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    setIsClient(true);
    resetQuiz("all");
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    resetQuiz(category);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const current = challenges[currentIndex];

    if (index === current.correctIndex) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b"],
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
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
              Challenge Session Complete!
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              You got <strong className="text-slate-900 font-bold">{score}</strong> out of{" "}
              <strong className="text-slate-900 font-bold">{challenges.length}</strong> correct ({percentage}%)
            </p>

            <div className="w-full bg-slate-100 rounded-full h-3.5 mb-8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>

            <button
              onClick={() => resetQuiz(selectedCategory)}
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

  const currentChallenge = challenges[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header & Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  Java Gotcha Challenges
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <p className="text-slate-500 text-xs font-medium">
                  2-minute brain teasers uncovering Java tricks, quirks & interview traps
                </p>
              </div>
            </div>

            {/* Score counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <span className="text-slate-400">Score:</span>
              <span className="text-emerald-600">{score}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">{challenges.length}</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
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
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Quiz Card */}
        {currentChallenge ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChallenge.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Question Title & Tag */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-black text-slate-900">
                    {currentChallenge.title}
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      currentChallenge.difficulty === "easy"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : currentChallenge.difficulty === "medium"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {currentChallenge.difficulty}
                  </span>
                </div>

                {/* Code Snippet Box */}
                <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs overflow-x-auto my-3 border border-slate-800">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      Java Snippet
                    </span>
                  </div>
                  <pre className="text-emerald-300 leading-relaxed overflow-x-auto font-mono">
                    {currentChallenge.code}
                  </pre>
                </div>

                <p className="text-sm text-slate-800 font-bold mt-4">
                  {currentChallenge.question}
                </p>
              </div>

              {/* Options Grid */}
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentChallenge.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentChallenge.correctIndex;
                    const showStatus = selectedAnswer !== null;

                    let btnStyle =
                      "p-4 rounded-2xl border text-left transition-all relative flex items-center justify-between font-mono text-xs font-bold ";

                    if (!showStatus) {
                      btnStyle +=
                        "bg-white border-slate-200 hover:border-slate-900 hover:shadow-xs text-slate-800 cursor-pointer";
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
                        onClick={() => handleAnswer(index)}
                        disabled={showStatus}
                        className={btnStyle}
                      >
                        <span>{option}</span>
                        {showStatus && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {showStatus && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation section */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-slate-200 bg-white p-6"
                  >
                    <div className="flex gap-3 mb-4">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0 h-fit">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider mb-1">
                            Why this happens:
                          </h4>
                          <p className="text-slate-700 text-xs leading-relaxed">
                            {currentChallenge.explanation}
                          </p>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 flex gap-2.5 items-start">
                          <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-amber-900 text-xs font-bold leading-relaxed">
                            {currentChallenge.javaInsight}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        {currentIndex < challenges.length - 1 ? "Next Challenge" : "Finish Quiz"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 text-xs font-semibold">
              No challenges found for this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
