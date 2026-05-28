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
      glow: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.1)] border-emerald-500/10 group-hover:border-emerald-500/30",
      accent: "bg-emerald-500",
      bgGlow: "from-emerald-500/5 to-transparent",
      text: "text-emerald-400",
      stroke: "#10b981",
    },
    blue: {
      glow: "group-hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] border-blue-500/10 group-hover:border-blue-500/30",
      accent: "bg-blue-500",
      bgGlow: "from-blue-500/5 to-transparent",
      text: "text-blue-400",
      stroke: "#3b82f6",
    },
    purple: {
      glow: "group-hover:shadow-[0_0_25px_rgba(168,85,247,0.1)] border-purple-500/10 group-hover:border-purple-500/30",
      accent: "bg-purple-500",
      bgGlow: "from-purple-500/5 to-transparent",
      text: "text-purple-400",
      stroke: "#a855f7",
    },
    cyan: {
      glow: "group-hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] border-cyan-500/10 group-hover:border-cyan-500/30",
      accent: "bg-cyan-500",
      bgGlow: "from-cyan-500/5 to-transparent",
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
      className={`glassmorphism-card glassmorphism-card-hover p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 ${glowStyles.glow}`}
    >
      {/* Ambient glowing background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowStyles.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Decorative Neon top corner tag */}
      <div className={`absolute top-0 right-0 h-[2px] w-12 ${glowStyles.accent} rounded-bl-full`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 group-hover:scale-110 transition-transform duration-300 ${glowStyles.text}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 relative z-10">
        {/* Trend Indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {trend === "up" && (
              <span className="text-emerald-500 text-xs font-semibold flex items-center">
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
              <span className="text-slate-400 text-xs font-semibold flex items-center">
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
              </span>
            )}
            <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-slate-400"}`}>
              {change}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Live synchronized</span>
        </div>

        {/* Small premium sparkline graph */}
        <div className="opacity-70 group-hover:opacity-100 transition-opacity duration-300 pl-4">
          <svg width={width} height={height} className="overflow-visible">
            {/* Sparkline glow filter */}
            <defs>
              <filter id={`glow-${title.replace(/\s+/g, "")}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <polyline
              fill="none"
              stroke={glowStyles.stroke}
              strokeWidth="2"
              points={points}
              filter={`url(#glow-${title.replace(/\s+/g, "")})`}
              className="transition-all duration-500"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
