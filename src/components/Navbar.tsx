"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkItem {
  href: string;
  label: string;
  desc: string;
}

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

  const navLinks: NavLinkItem[] = [
    {
      href: "/",
      label: "Home",
      desc: "Dashboard: Daily progress, next recommended questions, and topic breakdown.",
    },
    {
      href: "/roadmap",
      label: "Roadmap",
      desc: "Visual learning path: Numbers → Strings → Arrays → Sorting. Know exactly what to learn next.",
    },
    {
      href: "/questions",
      label: "Problems",
      desc: "50 curated placement questions with difficulty filters, test cases, and solution diagrams.",
    },
    {
      href: "/challenges",
      label: "Challenges",
      desc: "2-minute Java brain teasers uncovering common tricks, traps, and interview gotchas.",
    },
    {
      href: "/bug-hunter",
      label: "Bug Hunter",
      desc: "Type & fix 1-line bugs or fill in missing DSA logic directly in the code editor.",
    },
    {
      href: "/compiler",
      label: "Compiler",
      desc: "Standard Java compiler with Main class sandbox for testing full programs.",
    },
    {
      href: "/rapid-compiler",
      label: "Rapid Compiler",
      desc: "Zero-boilerplate instant Java runner with interactive terminal input.",
    },
    {
      href: "/history",
      label: "History",
      desc: "Complete log of your previous attempts, runtime metrics, and mistake analysis.",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="w-full flex h-14 items-center justify-between px-6">
        {/* Left: Brand and Nav Links Grouped Together */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-xs group-hover:bg-blue-600 transition-colors">
              P
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Practico
            </span>
          </Link>

          {/* Navigation Links with Hover Tooltip */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <div key={link.href} className="relative group/nav flex items-center">
                  <Link
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>

                  {/* Clean Hover Tooltip Box */}
                  <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 text-center">
                    <div className="text-[11px] font-bold text-blue-300 mb-0.5">
                      {link.label}
                    </div>
                    <div className="text-[10px] text-slate-300 leading-snug">
                      {link.desc}
                    </div>
                    {/* Small triangle arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right: Daily Target Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-slate-400">Today:</span>
            <strong className="text-slate-900">
              {solvedToday} / {dailyGoal}
            </strong>
          </div>
        </div>
      </div>
    </header>
  );
}
