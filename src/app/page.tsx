"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  CheckCircle2,
  XCircle,
  Terminal,
  History as HistoryIcon,
  BookOpen,
  Map,
  Brain,
  Zap,
  Bug,
} from "lucide-react";

interface QuestionItem {
  id: string;
  slug: string;
  title: string;
  difficulty?: string;
  conceptTested?: string;
  topicName?: string;
  topicSlug?: string;
  isSolved: boolean;
}

interface RecentSubmission {
  id: string;
  questionTitle?: string;
  questionSlug?: string;
  difficulty?: string;
  question?: { title: string; slug: string; difficulty: string };
  status: string;
  createdAt: string;
  timeTakenSec?: number;
  executionTimeMs?: number;
}

export default function HomePage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/questions").then((res) => res.json()),
      fetch("/api/user/history").then((res) => res.json()).catch(() => []),
    ])
      .then(([qData, hData]) => {
        setQuestions(Array.isArray(qData) ? qData : []);
        setRecentHistory(Array.isArray(hData) ? hData.slice(0, 5) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalQuestions = questions.length || 50;
  const solvedCount = questions.filter((q) => q.isSolved).length;
  const progressPercent = Math.round((solvedCount / totalQuestions) * 100);
  const firstUnsolved = questions.find((q) => !q.isSolved) || questions[0];
  const recommendedQuestions = questions.filter((q) => !q.isSolved).slice(0, 3);

  const learningModes = [
    {
      title: "Visual Roadmap",
      href: "/roadmap",
      tag: "Learning Path",
      tagColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Map,
      iconBg: "bg-blue-50 text-blue-600",
      description: "Structured path through Numbers, Strings, Arrays, and Sorting.",
    },
    {
      title: "Bug Hunter",
      href: "/bug-hunter",
      tag: "Debug & Fill",
      tagColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Bug,
      iconBg: "bg-rose-50 text-rose-600",
      description: "Spot 1-line bugs or fill in missing logic in real code.",
    },
    {
      title: "Gotcha Challenges",
      href: "/challenges",
      tag: "Short Quiz",
      tagColor: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Brain,
      iconBg: "bg-amber-50 text-amber-600",
      description: "Quick brain teasers on Java quirks, traps, and concepts.",
    },
    {
      title: "Rapid Compiler",
      href: "/rapid-compiler",
      tag: "Instant Runner",
      tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: Zap,
      iconBg: "bg-emerald-50 text-emerald-600",
      description: "Write raw Java code with interactive terminal input.",
    },
    {
      title: "Problems Catalog",
      href: "/questions",
      tag: "50 Problems",
      tagColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Code2,
      iconBg: "bg-purple-50 text-purple-600",
      description: "Explore all 50 placement questions with test cases and diagrams.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f4f6f8] text-slate-900 font-sans py-8 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1400px] w-full mx-auto space-y-7">
        
        {/* 1. TOP HEADER & MAIN ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Practico
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Java DSA Platform
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Structured learning roadmaps, interactive debugging, code execution, and practice tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/roadmap"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 transition-all shadow-2xs shrink-0"
            >
              <Map className="h-4 w-4 text-blue-600" />
              <span>View Roadmap</span>
            </Link>

            {firstUnsolved && (
              <Link
                href={`/practice/${firstUnsolved.slug}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-2xs shrink-0"
              >
                <span>Continue Practice</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* 2. LEARNING MODES */}
        <div>
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Practice Modes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {learningModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Link
                  key={mode.title}
                  href={mode.href}
                  className="group p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-xl ${mode.iconBg}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mode.tagColor}`}
                      >
                        {mode.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. PRACTICE PROGRESS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall Progress
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {solvedCount}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  / {totalQuestions} Solved
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-900">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {progressPercent}% Complete
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                >
                  <Map className="h-3.5 w-3.5 text-blue-600" />
                  <span>Roadmap</span>
                </Link>
                <Link
                  href="/bug-hunter"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                >
                  <Bug className="h-3.5 w-3.5 text-rose-600" />
                  <span>Bug Hunter</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 4. RECOMMENDED NEXT */}
        {recommendedQuestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recommended Next
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curated for your current Java Fundamentals level.
                </p>
              </div>
              <Link
                href="/questions"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/practice/${q.slug}`}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 transition-all shadow-2xs flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {q.difficulty === "BEGINNER" ? "Beginner" : "Easy"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {q.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">
                    Solve &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 5. LOWER 2-COLUMN SECTION (History & Learning Overview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent History (7 Columns on Desktop) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4 text-slate-700" />
                <h2 className="font-bold text-sm text-slate-900">
                  Recent Submissions
                </h2>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>Full History</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Nothing here yet. Solve a problem to start building your history.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentHistory.map((sub) => {
                  const title = sub.questionTitle || sub.question?.title || "Problem";
                  const slug = sub.questionSlug || sub.question?.slug || "";
                  const timeDisplay = sub.timeTakenSec ? `${sub.timeTakenSec}s` : sub.executionTimeMs ? `${sub.executionTimeMs}ms` : "";

                  return (
                    <div
                      key={sub.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {sub.status === "ACCEPTED" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          {slug ? (
                            <Link
                              href={`/practice/${slug}`}
                              className="font-semibold text-slate-900 hover:text-slate-700 truncate block"
                            >
                              {title}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900 truncate block">
                              {title}
                            </span>
                          )}
                          <span className="text-slate-400 text-[11px]">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            sub.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {sub.status === "ACCEPTED" ? "Solved" : "Needs Retry"}
                        </span>
                        {timeDisplay && (
                          <span className="text-slate-400 text-[11px]">
                            {timeDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current Learning Status & Topic Overview (5 Columns on Desktop) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BookOpen className="h-4 w-4 text-slate-700" />
              <h2 className="font-bold text-sm text-slate-900">
                Learning Overview
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    Current Level: Level 0
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Fundamentals
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Focusing on core Number Problems, Logic, Loops, and Conditions before moving to Arrays & Strings.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Most Interview Questions (1–20)</span>
                  <span className="font-semibold text-slate-900">
                    {questions.filter((q) => q.topicSlug === "java-basics" && q.isSolved).length} / 20
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Strings (21–30)</span>
                  <span className="font-semibold text-slate-900">
                    {questions.filter((q) => q.topicSlug === "strings" && q.isSolved).length} / 10
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Arrays (31–45)</span>
                  <span className="font-semibold text-slate-900">
                    {questions.filter((q) => q.topicSlug === "arrays" && q.isSolved).length} / 15
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Searching & Sorting (46–50)</span>
                  <span className="font-semibold text-slate-900">
                    {questions.filter((q) => q.topicSlug === "searching-sorting" && q.isSolved).length} / 5
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
