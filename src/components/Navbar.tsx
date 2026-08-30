"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [solvedToday, setSolvedToday] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(5);

  const fetchStats = () => {
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSolvedToday(data.solvedToday ?? 0);
          setDailyGoal(data.dailyGoal ?? 5);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const handleUpdate = () => fetchStats();
    window.addEventListener("statsUpdated", handleUpdate);
    return () => window.removeEventListener("statsUpdated", handleUpdate);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/questions", label: "Problems" },
    { href: "/compiler", label: "Compiler" },
    { href: "/rapid-compiler", label: "Rapid Compiler" },
    { href: "/history", label: "History" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="w-full flex h-14 items-center justify-between px-6">
        {/* Left: Brand and Nav Links Grouped Together */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs">
              J
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              Java DSA Practice
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Daily Target Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-slate-400">Today:</span>
            <strong className="text-slate-900">{solvedToday} / {dailyGoal}</strong>
          </div>
        </div>
      </div>
    </header>
  );
}
