"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

interface TopicDetail {
  id: string;
  name: string;
  slug: string;
  level: number;
  description: string;
  conceptNotes: string;
  questions: Array<{
    id: string;
    slug: string;
    title: string;
    difficulty: string;
  }>;
}

export default function ConceptsPage() {
  const [topics, setTopics] = useState<TopicDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopicId, setActiveTopicId] = useState<string>("java-basics");

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(Array.isArray(data) ? data : []);
        if (data.length > 0) setActiveTopicId(data[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  return (
    <div className="container max-w-6xl py-10 px-4 sm:px-8 space-y-6 font-sans bg-slate-50/40 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Core Java Concepts
        </h1>
        <p className="text-xs text-slate-500">
          Concise, high-yield notes and syntax references designed for fast revision.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Concept List */}
          <div className="space-y-2">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTopicId(t.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all text-xs ${
                  activeTopicId === t.id
                    ? "bg-white border-indigo-500 shadow-2xs font-bold text-slate-900 ring-1 ring-indigo-500/20"
                    : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold block text-sm">{t.name}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{t.description}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      activeTopicId === t.id ? "text-indigo-600" : "text-slate-300"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Right: Selected Concept Note & Practice Links */}
          <div className="md:col-span-2 space-y-6">
            {activeTopic && (
              <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-5 text-xs">
                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Concept Note
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">{activeTopic.name}</h2>
                  <p className="text-slate-500">{activeTopic.description}</p>
                </div>

                {/* Concept Notes Body */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                  {activeTopic.conceptNotes}
                </div>

                {/* Practice Questions in this Concept */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Practice This Concept ({activeTopic.questions?.length || 0})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeTopic.questions?.map((q) => (
                      <Link
                        key={q.id}
                        href={`/practice/${q.slug}`}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 transition-colors flex items-center justify-between font-bold text-slate-900 text-xs"
                      >
                        <span>{q.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
