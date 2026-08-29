"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface ProgressData {
  user: {
    name: string;
    currentLevel: number;
    currentStreak: number;
    dailyGoal: number;
    solvedToday: number;
    totalSolved: number;
    totalAttempted: number;
    accuracy: number;
  };
  topicProgress: Array<{
    id: string;
    topicId: string;
    name: string;
    level: number;
    masteryScore: number;
    questionsSolved: number;
    questionsTotal: number;
  }>;
  weakAreas: Array<{
    category: string;
    count: number;
    label: string;
  }>;
  readiness: {
    isReady: boolean;
    currentLevel: number;
    nextLevel: number;
    reasons: string[];
    recommendations: string[];
  };
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Loading progress...</p>
        </div>
      </div>
    );
  }

  const user = data?.user || {
    name: "Java Learner",
    currentLevel: 0,
    currentStreak: 0,
    dailyGoal: 5,
    solvedToday: 0,
    totalSolved: 0,
    totalAttempted: 0,
    accuracy: 0,
  };

  const hasEnoughData = user.totalAttempted >= 3;
  const genuineWeakAreas = data?.weakAreas?.filter((w) => w.count >= 3) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafbfc] py-10 px-6 sm:px-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Mastery Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Learning Progress
          </h1>
          <p className="text-xs text-slate-500">
            Calculated strictly from your real submissions and problem-solving history.
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Solved Today</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{user.solvedToday}</span>
              <span className="text-xs text-slate-400 font-bold">/ {user.dailyGoal}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
            <div className="mt-2 flex items-baseline gap-1 text-amber-600">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-2xl font-extrabold text-slate-900">{user.currentStreak}</span>
              <span className="text-xs text-slate-400 font-bold">days</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Solved</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900">{user.totalSolved}</span>
              <span className="text-xs text-slate-400 font-bold">problems</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Stage</span>
            <div className="mt-2">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                Level 0: Core Java
              </span>
            </div>
          </div>
        </div>

        {/* Topic Mastery Progress */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Topic Progress</h2>

          <div className="space-y-4">
            {data?.topicProgress?.map((tp) => (
              <div key={tp.id} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">{tp.name}</span>
                  <span className="text-slate-500 font-mono">
                    {tp.questionsSolved} / {tp.questionsTotal} solved
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        tp.questionsTotal > 0
                          ? (tp.questionsSolved / tp.questionsTotal) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Profile & Strengths vs Needs Practice */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Personal Learning Profile</h2>

          {!hasEnoughData ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              No data yet — solve at least 3 questions to generate personalized strength and weakness insights.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Current Strengths</span>
                </span>
                <ul className="space-y-1 text-emerald-800 font-medium">
                  <li>• Basic variables &amp; Scanner input</li>
                  <li>• if/else conditional branching</li>
                  <li>• Basic output formatting</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Needs Practice</span>
                </span>
                {genuineWeakAreas.length > 0 ? (
                  <ul className="space-y-1 text-amber-800 font-medium">
                    {genuineWeakAreas.map((w, idx) => (
                      <li key={idx}>• {w.label} ({w.count} mistakes)</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-800">No recurring mistake patterns. Keep building problem consistency!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
