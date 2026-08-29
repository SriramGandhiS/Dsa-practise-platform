"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ArrowRight } from "lucide-react";
import { getFamilyForSlug } from "@/lib/problem-families";

interface QuestionItem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  level: number;
  topicName: string;
  topicSlug: string;
  conceptTested: string;
  isSolved: boolean;
  isSolvedToday: boolean;
  lastSolvedAt: string | null;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const fetchQuestions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedTopic !== "all") params.append("topic", selectedTopic);
    if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());

    fetch(`/api/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedTopic, selectedDifficulty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const totalSolvedCount = questions.filter((q) => q.isSolved).length;
  const solvedTodayCount = questions.filter((q) => q.isSolvedToday).length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f4f6f8] text-slate-900 font-sans py-8 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1500px] w-full mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Problems Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Java fundamentals and placement practice problems.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs shadow-2xs">
              <span className="text-slate-500 font-medium">Progress:</span>
              <span className="font-bold text-slate-900">
                {totalSolvedCount} / {questions.length}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-semibold">
                {solvedTodayCount} Solved Today
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems by name or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 shadow-2xs"
            />
          </form>

          <div className="sm:w-64">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="all">All Topics</option>
              <option value="java-basics">Most Interview Questions (1–20)</option>
              <option value="strings">Strings (21–30)</option>
              <option value="arrays">Arrays (31–45)</option>
              <option value="searching-sorting">Searching & Sorting (46–50)</option>
            </select>
          </div>

          <div className="sm:w-44">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 shadow-2xs cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="EASY">Easy</option>
            </select>
          </div>
        </div>

        {/* DESKTOP WIDE 2-COLUMN SPLIT GRID */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-lg border border-slate-200">
            No problems found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {questions.map((q, idx) => (
              <Link
                key={q.id}
                href={`/practice/${q.slug}`}
                className={`px-5 py-4 rounded-lg border transition-all flex items-center justify-between group ${
                  q.isSolved
                    ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/70"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Number Index */}
                  <span
                    className={`font-semibold w-7 text-right text-sm shrink-0 ${
                      q.isSolved ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {idx + 1}.
                  </span>

                  {/* Solve Status Icon */}
                  {q.isSolved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0 group-hover:border-slate-500 transition-colors" />
                  )}

                  {/* Title */}
                  <div className="min-w-0 flex items-center">
                    <h3
                      className={`text-[15px] sm:text-base font-semibold truncate transition-colors ${
                        q.isSolved
                          ? "text-slate-700 group-hover:text-slate-900"
                          : "text-slate-900 group-hover:text-slate-700"
                      }`}
                    >
                      {q.title}
                    </h3>
                  </div>
                </div>

                {/* Right Badges & Arrow */}
                <div className="flex items-center gap-2.5 shrink-0 ml-4">
                  {(() => {
                    const family = getFamilyForSlug(q.slug);
                    if (!family) return null;
                    return (
                      <span className="hidden md:inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {family.name}
                      </span>
                    );
                  })()}

                  {q.topicSlug === "java-basics" && (
                    <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                      Most Interviewed
                    </span>
                  )}

                  {q.isSolved ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Solved
                    </span>
                  ) : (
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {q.difficulty === "BEGINNER" ? "Beginner" : "Easy"}
                    </span>
                  )}

                  <ArrowRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                      q.isSolved
                        ? "text-emerald-600"
                        : "text-slate-300 group-hover:text-slate-600"
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

