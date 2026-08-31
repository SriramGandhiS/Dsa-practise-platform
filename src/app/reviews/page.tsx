"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Check,
  RotateCcw,
} from "lucide-react";

interface ReviewItem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  topicSlug: string;
  lastSolvedAt: string | null;
  daysAgo: number;
  solveCount: number;
  stage: string;
  targetInterval: number;
  isDue: boolean;
}

export default function ReviewsPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [dueCount, setDueCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    fetch("/api/user/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          setItems(data.items);
          setDueCount(data.dueCount || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const dueItems = items.filter((i) => i.isDue);
  const upcomingItems = items.filter((i) => !i.isDue);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f4f6f8] text-slate-900 font-sans py-8 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1200px] w-full mx-auto space-y-7">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Review Queue
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Spaced Repetition
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Re-solve previously completed questions at optimal memory intervals to ensure long-term retention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchReviews}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Spaced Repetition Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Due for Review</div>
            <div className="text-2xl font-black text-slate-900">{dueCount}</div>
            <p className="text-[11px] text-slate-400">Scheduled for active recall today</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 font-semibold">In Progress Memory Track</div>
            <div className="text-2xl font-black text-blue-600">{items.length}</div>
            <p className="text-[11px] text-slate-400">Total problems being tracked</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Memory Stages</div>
            <div className="text-xs font-medium text-slate-700 pt-1">
              Stage 1 (3d) &rarr; Stage 2 (7d) &rarr; Stage 3 (21d) &rarr; Mastered
            </div>
            <p className="text-[11px] text-slate-400">Scientifically proven Ebbinghaus retention</p>
          </div>
        </div>

        {/* Due Today Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Due for Review Today</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                {dueItems.length}
              </span>
            </h2>
          </div>

          {dueItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">All caught up!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No problems due for review today. Solve new questions from the Roadmap to add them to your spaced repetition queue.
              </p>
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-2"
              >
                Go to Roadmap &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dueItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.stage}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {item.lastSolvedAt
                        ? `Last solved ${item.daysAgo} day${item.daysAgo === 1 ? "" : "s"} ago (${item.solveCount} attempt${item.solveCount === 1 ? "" : "s"})`
                        : "Ready for your first memory check"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Recall from memory
                    </span>
                    <Link
                      href={`/practice/${item.slug}?mode=review`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                    >
                      <span>Start Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reviews */}
        {upcomingItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Upcoming Reviews (Next 7–21 Days)
            </h2>

            <div className="divide-y divide-slate-200/80 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              {upcomingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {item.title}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {item.stage} &bull; Next review in {Math.max(1, item.targetInterval - item.daysAgo)} days
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Retained
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
