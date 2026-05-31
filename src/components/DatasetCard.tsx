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
      bg: "bg-[#10B981]/10",
      text: "text-[#10B981] border-[#10B981]/25",
      dot: "bg-[#10B981]",
      label: "Active Synced",
    },
    processing: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400 border-cyan-500/25",
      dot: "bg-cyan-500",
      label: "Processing",
    },
    paused: {
      bg: "bg-amber-500/10",
      text: "text-amber-400 border-amber-500/25",
      dot: "bg-amber-500",
      label: "Paused",
    },
  }[status];

  return (
    <div className="bg-[#121212] border border-[#262626] p-6 rounded relative overflow-hidden group flex flex-col justify-between h-full hover:border-white/20 transition-all duration-200">
      {/* Decorative cyber grid overlay on hover */}
      <div className="absolute inset-0 bg-grid-cyber opacity-0 group-hover:opacity-[0.03] transition-opacity duration-200 pointer-events-none" />

      {/* Main card body */}
      <div>
        <div className="flex items-center justify-between mb-3 font-mono">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
            {category}
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-semibold ${statusConfig.text} ${statusConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </div>
        </div>

        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#10B981] transition-colors duration-200 line-clamp-1 font-display">
          {name}
        </h4>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 font-mono">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded bg-[#0e0e0e] border border-[#262626] text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Area: Stats & Progress */}
      <div className="space-y-4 pt-4 border-t border-[#262626]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Total Volume:</span>
          <span className="font-semibold text-zinc-300">{records}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">Annotation completion</span>
            <span className="font-semibold text-[#10B981] font-mono">{completion}%</span>
          </div>
          <div className="w-full h-1.5 rounded bg-[#0e0e0e] overflow-hidden relative border border-[#262626]">
            <div
              className="h-full rounded bg-[#10B981] transition-all duration-1000 ease-out"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Glass Button action */}
        <button
          onClick={onAction}
          className="w-full mt-2 py-2 px-4 rounded bg-[#0e0e0e] border border-[#262626] hover:border-white/20 text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <span>Curate Dataset</span>
          <svg
            className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200 text-zinc-500 group-hover:text-white"
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
