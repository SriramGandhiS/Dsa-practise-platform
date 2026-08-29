"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2 } from "lucide-react";
import { getFamilyById, ProblemFamily } from "@/lib/problem-families";

export default function SeriesPage() {
  const params = useParams();
  const seriesId = typeof params.id === "string" ? params.id : "";
  const [family, setFamily] = useState<ProblemFamily | null>(null);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const f = getFamilyById(seriesId);
    setFamily(f);

    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          for (const q of data) {
            map[q.slug] = Boolean(q.isSolved);
          }
          setSolvedMap(map);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [seriesId]);

  if (!family) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#f4f6f8] text-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4 max-w-md w-full shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900">Series Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested concept series could not be found.
          </p>
          <Link
            href="/questions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Problems</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f4f6f8] text-slate-900 font-sans py-10 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1100px] w-full mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Problems</span>
        </Link>

        {/* Series Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Concept Series
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {family.variations.length} Problem Variations
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {family.name}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {family.description}. Choose an implementation variation below to solve the program in Java.
          </p>
        </div>

        {/* Variations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Select Problem Variation ({family.variations.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {family.variations.map((v, index) => {
              const isSolved = solvedMap[v.slug];
              return (
                <Link
                  key={v.slug}
                  href={`/practice/${v.slug}`}
                  className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 rounded-xl p-6 transition-all shadow-2xs flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {v.dataType}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Option {index + 1}
                        </span>
                      </div>

                      {isSolved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Solved</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {v.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      Java Implementation
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      <span>Solve Problem</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
