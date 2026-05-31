"use client";

import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  sparklineData?: number[];
  glowColor?: "emerald" | "blue" | "purple" | "cyan";
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  sparklineData = [30, 40, 35, 50, 49, 60, 70, 91],
  glowColor = "emerald",
}: MetricCardProps) {
  // Map glowColor to tailwind classes
  const glowStyles = {
    emerald: {
      text: "text-emerald-400",
      stroke: "#10b981",
    },
    blue: {
      text: "text-blue-400",
      stroke: "#3b82f6",
    },
    purple: {
      text: "text-purple-400",
      stroke: "#a855f7",
    },
    cyan: {
      text: "text-cyan-400",
      stroke: "#06b6d4",
    },
  }[glowColor];

  // Render small SVG Sparkline path
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const height = 40;
  const width = 120;
  const padding = 5;
  const points = sparklineData
    .map((val, index) => {
      const x = (index / (sparklineData.length - 1)) * (width - padding * 2) + padding;
      const y =
        height -
        ((val - min) / (max - min || 1)) * (height - padding * 2) -
        padding;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className="bg-[#121212] border border-[#262626] p-6 rounded relative overflow-hidden group transition-all duration-200 hover:border-white/20"
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-zinc-500 tracking-wider uppercase mb-1 font-mono">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white tracking-tight mb-2 font-display">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded bg-[#141313] border border-[#262626] text-zinc-300 group-hover:scale-105 transition-transform duration-200 ${glowStyles.text}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 relative z-10">
        {/* Trend Indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {trend === "up" && (
              <span className="text-[#10B981] text-xs font-semibold flex items-center">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </span>
            )}
            {trend === "down" && (
              <span className="text-rose-500 text-xs font-semibold flex items-center">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            )}
            {trend === "neutral" && (
              <span className="text-zinc-500 text-xs font-semibold flex items-center">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
              </span>
            )}
            <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-zinc-500"}`}>
              {change}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Live synchronized</span>
        </div>

        {/* Small premium sparkline graph */}
        <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-200 pl-4">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={glowStyles.stroke}
              strokeWidth="2"
              points={points}
              className="transition-all duration-300"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
