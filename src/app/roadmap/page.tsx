"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Type, LayoutList, Search, CheckCircle2, Circle, Lock, ChevronDown, ChevronUp } from "lucide-react";

interface Question {
  id: string;
  title: string;
  topicId: string;
  isSolved: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

interface Stats {
  totalSolved: number;
  currentStreak: number;
  solvedToday: number;
}

const TOPICS = [
  { id: "java-basics", title: "Numbers & Logic", icon: Hash, total: 20, levels: "0-1" },
  { id: "strings", title: "Strings", icon: Type, total: 10, levels: "2" },
  { id: "arrays", title: "Arrays", icon: LayoutList, total: 15, levels: "3-4" },
  { id: "searching-sorting", title: "Searching & Sorting", icon: Search, total: 5, levels: "5-6" },
];

const TOTAL_QUESTIONS = 50;

export default function RoadmapPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats>({ totalSolved: 0, currentStreak: 0, solvedToday: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [questionsRes, statsRes] = await Promise.all([
          fetch("/api/questions").catch(() => null),
          fetch("/api/user/stats").catch(() => null)
        ]);

        if (questionsRes?.ok) {
          const qData = await questionsRes.json();
          setQuestions(qData);
        }
        
        if (statsRes?.ok) {
          const sData = await statsRes.json();
          setStats(sData);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getTopicProgress = (topicId: string) => {
    const topicQuestions = questions.filter(q => q.topicId === topicId);
    if (topicQuestions.length === 0) {
      return { 
        solved: 0, 
        total: TOPICS.find(t => t.id === topicId)?.total || 0, 
        questions: [] 
      };
    }
    const solved = topicQuestions.filter(q => q.isSolved).length;
    return { solved, total: topicQuestions.length, questions: topicQuestions };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Track if previous topic reached >= 50%
  let prevPercentage = 100; // First topic always unlocked

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-12">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Your Learning Path</h1>
              <p className="text-slate-500">Master Java Data Structures & Algorithms</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {stats.totalSolved} <span className="text-lg text-slate-400 font-normal">/ {TOTAL_QUESTIONS}</span>
              </div>
              <p className="text-sm text-slate-500">Problems Solved</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.totalSolved / TOTAL_QUESTIONS) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-blue-600 h-3 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
          </div>
        </div>

        {/* Roadmap */}
        <div className="relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 z-0 rounded-full" />
          
          <div className="space-y-12">
            {TOPICS.map((topic, index) => {
              const { solved, total, questions: topicQs } = getTopicProgress(topic.id);
              const progressPercentage = total > 0 ? (solved / total) * 100 : 0;
              
              const isUnlocked = prevPercentage >= 50;
              const isCompleted = progressPercentage === 100 && total > 0;
              const isInProgress = isUnlocked && !isCompleted;
              
              prevPercentage = progressPercentage;
              
              const isEven = index % 2 === 0;

              return (
                <div key={topic.id} className="relative z-10 flex flex-col md:flex-row items-start md:items-center w-full group">
                  
                  {/* Left Side (Desktop Alternating) */}
                  <div className={`hidden md:block w-1/2 pr-12 text-right ${!isEven ? 'opacity-0 invisible' : ''}`}>
                    {isEven && (
                      <TopicCard
                        topic={topic}
                        solved={solved}
                        total={total}
                        isUnlocked={isUnlocked}
                        isCompleted={isCompleted}
                        isInProgress={isInProgress}
                        topicQs={topicQs}
                        expanded={expandedTopic === topic.id}
                        onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                      />
                    )}
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-[27px] md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-50 relative bg-white shadow-sm transition-colors duration-300 ${
                        isCompleted ? 'bg-green-100 text-green-600 border-green-200' :
                        isInProgress ? 'bg-blue-100 text-blue-600 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
                        'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {isInProgress && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20" />
                      )}
                      {isUnlocked ? <topic.icon size={24} strokeWidth={2.5} /> : <Lock size={20} />}
                    </motion.div>
                  </div>

                  {/* Right Side (Mobile Always, Desktop Alternating) */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-12 ${isEven ? 'md:opacity-0 md:invisible' : ''}`}>
                    <div className={isEven ? 'md:hidden' : ''}>
                      <TopicCard
                        topic={topic}
                        solved={solved}
                        total={total}
                        isUnlocked={isUnlocked}
                        isCompleted={isCompleted}
                        isInProgress={isInProgress}
                        topicQs={topicQs}
                        expanded={expandedTopic === topic.id}
                        onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic, solved, total, isUnlocked, isCompleted, isInProgress, topicQs, expanded, onToggle }: any) {
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border ${
        isCompleted ? 'border-green-200' :
        isInProgress ? 'border-blue-200 ring-1 ring-blue-50' :
        'border-slate-200 opacity-80'
      } overflow-hidden transition-all duration-200 hover:shadow-md text-left`}
    >
      <div 
        className={`p-5 cursor-pointer flex items-center justify-between ${!isUnlocked && 'cursor-not-allowed'}`}
        onClick={() => isUnlocked && onToggle()}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{topic.title}</h3>
            {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>
          <p className="text-sm text-slate-500">Level {topic.levels} • {total} Questions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${percentage}, 100` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={isCompleted ? "text-green-500" : isInProgress ? "text-blue-500" : "text-slate-300"}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-700">{solved}/{total}</span>
          </div>
          {isUnlocked && (
            <div className="text-slate-400">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && isUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50"
          >
            <div className="p-4 space-y-2">
              {topicQs.length > 0 ? (
                topicQs.map((q: any) => (
                  <div key={q.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    {q.isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${q.isSolved ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                      {q.title}
                    </span>
                    <span className={`ml-auto text-[10px] px-2 py-1 rounded-full font-semibold ${
                      q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">
                  Questions for this topic will appear here as you progress.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
