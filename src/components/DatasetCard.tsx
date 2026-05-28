"use client";

import React from "react";

interface DatasetCardProps {
  name: string;
  category: string;
  records: string | number;
  completion: number;
  status: "active" | "processing" | "paused";
  tags: string[];
  onAction?: () => void;
}

export default function DatasetCard({
  name,
  category,
  records,
  completion,
  status,
  tags,
  onAction,
}: DatasetCardProps) {
  // Status config
  const statusConfig = {
    active: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
      label: "Active Synced",
    },
    processing: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400 border-cyan-500/20",
      dot: "bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse",
      label: "Processing",
    },
    paused: {
      bg: "bg-amber-500/10",
      text: "text-amber-400 border-amber-500/20",
      dot: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
      label: "Paused",
    },
  }[status];

  return (
    <div className="glassmorphism-card glassmorphism-card-hover p-6 rounded-2xl relative overflow-hidden group flex flex-col justify-between h-full border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
      {/* Decorative cyber grid overlay on hover */}
      <div className="absolute inset-0 bg-grid-cyber opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none" />

      {/* Main card body */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
            {category}
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusConfig.text} ${statusConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </div>
        </div>

        <h4 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1">
          {name}
        </h4>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-slate-300 hover:border-slate-700 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Area: Stats & Progress */}
      <div className="space-y-4 pt-4 border-t border-slate-900/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Volume:</span>
          <span className="font-semibold text-slate-200">{records}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Annotation completion</span>
            <span className="font-semibold text-emerald-400">{completion}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden relative border border-white/[0.02]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
              style={{ width: `${completion}%` }}
            />
            {/* Glowing lead edge of progress bar */}
            {completion > 0 && completion < 100 && (
              <div
                className="absolute top-0 bottom-0 w-2 bg-white/40 blur-[1px] transition-all duration-1000 ease-out"
                style={{ left: `calc(${completion}% - 8px)` }}
              />
            )}
          </div>
        </div>

        {/* Glass Button action */}
        <button
          onClick={onAction}
          className="w-full mt-2 py-2 px-4 rounded-xl glassmorphism border border-white/5 group-hover:border-emerald-500/20 text-xs font-semibold text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <span>Curate Dataset</span>
          <svg
            className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200 text-slate-400 group-hover:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
