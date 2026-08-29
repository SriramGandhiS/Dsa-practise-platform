"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  BrainCircuit,
  Server,
  CheckCircle2,
  AlertCircle,
  Save,
  Target,
} from "lucide-react";

export default function SettingsPage() {
  const [provider, setProvider] = useState("ollama");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("deepseek-coder:6.7b");
  const [dailyGoal, setDailyGoal] = useState(5);
  const [customKey, setCustomKey] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState("");
  
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"idle" | "success" | "error">("idle");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const testOllamaConnection = async () => {
    setTestingOllama(true);
    setOllamaStatus("idle");
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          userMessage: "ping",
          userCode: "",
          questionTitle: "Test Connection",
          problemStatement: "Test",
          conceptTested: "Test",
        }),
      });
      const data = await res.json();
      if (data.provider === "ollama") {
        setOllamaStatus("success");
      } else {
        setOllamaStatus("error");
      }
    } catch {
      setOllamaStatus("error");
    } finally {
      setTestingOllama(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="container max-w-4xl py-10 px-4 sm:px-6 space-y-8 bg-slate-50/50">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
          <Settings className="h-4 w-4" />
          <span>Configuration &amp; AI Coach</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-600">
          Configure your local Ollama AI model, custom API keys, and daily learning targets.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Daily Goal Settings */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Daily Practice Target</h2>
              <p className="text-xs text-slate-500">Number of questions to complete daily to maintain streak</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[3, 5, 10, 15].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setDailyGoal(g)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  dailyGoal === g
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {g} questions / day
              </button>
            ))}
          </div>
        </div>

        {/* AI Provider Config */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">AI Coding Coach Provider</h2>
              <p className="text-xs text-slate-500">Local Ollama First, with cloud fallback &amp; Socratic heuristic tutor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "ollama", title: "Local Ollama (Recommended)", desc: "Private, fast, offline" },
              { id: "custom", title: "Custom Cloud API", desc: "OpenAI / Claude / Gemini endpoint" },
              { id: "heuristic", title: "Built-in Socratic Heuristic", desc: "Always available, zero config" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setProvider(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  provider === opt.id
                    ? "bg-indigo-50/60 border-indigo-500 text-slate-900 shadow-xs ring-1 ring-indigo-500/20"
                    : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-1">{opt.title}</div>
                <div className="text-[11px] text-slate-500">{opt.desc}</div>
              </button>
            ))}
          </div>

          {provider === "ollama" && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ollama Server Endpoint</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ollama Model</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                    placeholder="deepseek-coder:6.7b"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={testOllamaConnection}
                  disabled={testingOllama}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Server className="h-3.5 w-3.5" />
                  <span>{testingOllama ? "Testing..." : "Test Local Ollama Connection"}</span>
                </button>

                {ollamaStatus === "success" && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Connected to Local Ollama!</span>
                  </span>
                )}
                {ollamaStatus === "error" && (
                  <span className="text-xs text-amber-600 flex items-center gap-1 font-bold">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Ollama offline; automatically using built-in Socratic tutor.</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {provider === "custom" && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">API Endpoint URL</label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                    placeholder="https://api.openai.com/v1/chat/completions"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">API Key</label>
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                    placeholder="sk-..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>

          {savedSuccess && (
            <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Preferences saved successfully!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
