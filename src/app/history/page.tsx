"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArrowRight, BookOpen } from "lucide-react";

interface HistoryItem {
  id: string;
  questionTitle: string;
  questionSlug: string;
  difficulty: string;
  status: string;
  attemptNumber: number;
  timeTakenSec: number;
  hintsUsedCount: number;
  solutionViewed: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container max-w-5xl py-10 px-4 sm:px-6 space-y-6 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Practice Record</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Submission &amp; Attempt History
          </h1>
          <p className="text-xs text-slate-500">Persistent log of all your code executions and submissions.</p>
        </div>
        <Link
          href="/questions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
        >
          <span>Practice More</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center border border-slate-200 rounded-2xl bg-white text-slate-500 text-sm">
          No submissions recorded yet. Start solving questions to build your history!
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Question</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attempt #</th>
                <th className="py-3 px-4">Time Taken</th>
                <th className="py-3 px-4">Hints</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <Link href={`/practice/${item.questionSlug}`} className="hover:text-indigo-600">
                      {item.questionTitle}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === "ACCEPTED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                        <XCircle className="h-3.5 w-3.5" /> {item.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">Attempt {item.attemptNumber}</td>
                  <td className="py-3.5 px-4 font-mono">{formatTimer(item.timeTakenSec)}</td>
                  <td className="py-3.5 px-4">
                    {item.hintsUsedCount > 0 ? `${item.hintsUsedCount} hint(s)` : "None"}
                    {item.solutionViewed && <span className="ml-1 text-amber-600 font-semibold">(Solution viewed)</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/practice/${item.questionSlug}`}
                      className="font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
