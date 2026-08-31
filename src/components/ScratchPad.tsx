"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Eraser,
  RotateCcw,
  Undo2,
  Trash2,
  Square,
  ArrowRight,
  GitBranch,
  Grid,
  Download,
} from "lucide-react";

interface ScratchPadProps {
  slug: string;
}

const COLORS = [
  { name: "Slate", value: "#1e293b" },
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" },
];

const STROKE_SIZES = [
  { label: "S", size: 2 },
  { label: "M", size: 4 },
  { label: "L", size: 8 },
];

export default function ScratchPad({ slug }: ScratchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#2563eb");
  const [strokeSize, setStrokeSize] = useState(3);
  const [history, setHistory] = useState<ImageData[]>([]);

  const storageKey = `practico_scratchpad_${slug}`;

  // Save state to history for undo
  const pushState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imgData]);

    // Persist to localStorage as dataURL
    try {
      localStorage.setItem(storageKey, canvas.toDataURL());
    } catch {}
  }, [storageKey]);

  // Setup canvas size and load saved image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Preserve existing drawing on resize
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tempCtx = temp.getContext("2d");
      if (tempCtx && canvas.width > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Restore
      if (temp.width > 0) {
        ctx.drawImage(temp, 0, 0, rect.width, rect.height);
      } else {
        // Load from storage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
            pushState();
          };
          img.src = saved;
        } else {
          // Draw subtle grid background
          drawGridBackground(ctx, rect.width, rect.height);
          pushState();
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [storageKey, pushState]);

  const drawGridBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    const step = 24;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };

  // Mouse / Touch drawing handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = strokeSize * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pushState();
    }
  };

  // Undo
  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    if (prev) {
      ctx.putImageData(prev, 0, 0);
      setHistory(newHistory);
      try {
        localStorage.setItem(storageKey, canvas.toDataURL());
      } catch {}
    }
  };

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridBackground(ctx, rect.width, rect.height);
    pushState();
  };

  // DSA Stamp: Array Grid
  const stampArray = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startX = 60;
    const startY = 80;
    const cellW = 50;
    const cellH = 50;
    const count = 5;

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < count; i++) {
      const x = startX + i * cellW;
      ctx.fillRect(x, startY, cellW, cellH);
      ctx.strokeRect(x, startY, cellW, cellH);

      // Index label underneath
      ctx.fillStyle = "#64748b";
      ctx.fillText(`[${i}]`, x + cellW / 2, startY + cellH + 16);
      ctx.fillStyle = "#ffffff";
    }

    pushState();
  };

  // DSA Stamp: Two Pointers
  const stampTwoPointers = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("L →", 75, 50);

    ctx.fillStyle = "#e11d48";
    ctx.fillText("← R", 275, 50);

    pushState();
  };

  // DSA Stamp: Binary Tree Node
  const stampTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rootX = 180;
    const rootY = 60;
    const r = 18;

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#f8fafc";

    // Left child branch & circle
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    ctx.lineTo(rootX - 50, rootY + 70);
    ctx.stroke();

    // Right child branch & circle
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);
    ctx.lineTo(rootX + 50, rootY + 70);
    ctx.stroke();

    // Left circle
    ctx.beginPath();
    ctx.arc(rootX - 50, rootY + 70, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right circle
    ctx.beginPath();
    ctx.arc(rootX + 50, rootY + 70, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Root circle
    ctx.beginPath();
    ctx.arc(rootX, rootY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Root", rootX, rootY);
    ctx.fillText("L", rootX - 50, rootY + 70);
    ctx.fillText("R", rootX + 50, rootY + 70);

    pushState();
  };

  return (
    <div className="flex flex-col h-full bg-white select-none relative overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80 text-xs shrink-0 gap-3">
        {/* Tools: Pen / Eraser / Undo / Clear */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              tool === "pen"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
            title="Pen tool"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="text-[11px]">Pen</span>
          </button>

          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              tool === "eraser"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
            title="Eraser tool"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="text-[11px]">Eraser</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Color palette */}
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setColor(c.value);
                  setTool("pen");
                }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  color === c.value && tool === "pen"
                    ? "scale-125 ring-2 ring-offset-1 ring-slate-400"
                    : "opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Stroke sizes */}
          <div className="flex items-center gap-0.5">
            {STROKE_SIZES.map((s) => (
              <button
                key={s.label}
                onClick={() => setStrokeSize(s.size)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  strokeSize === s.size
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* DSA Quick Stamps + Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={stampArray}
            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Insert Array boxes with indices"
          >
            <Grid className="w-3 h-3 text-blue-600" />
            <span>+ Array</span>
          </button>

          <button
            onClick={stampTwoPointers}
            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Insert L / R Pointers"
          >
            <ArrowRight className="w-3 h-3 text-rose-600" />
            <span>+ Pointers</span>
          </button>

          <button
            onClick={stampTree}
            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Insert Binary Tree Node"
          >
            <GitBranch className="w-3 h-3 text-emerald-600" />
            <span>+ Tree</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            onClick={handleUndo}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Clear whiteboard"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 block touch-none"
        />
      </div>
    </div>
  );
}
