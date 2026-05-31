"use client";

import React from "react";
import { TrendingUp, Star, Activity } from "lucide-react";

interface RoyaltyAnalyticsProps {
  points: number;
  earnings: number;
  poolCount: number;
}

export default function RoyaltyAnalytics({ points, earnings, poolCount }: RoyaltyAnalyticsProps) {
  // Abstract bar chart height definitions
  const chartBars = [30, 45, 20, 60, 40, 80, 100];

  return (
    <div className="flex flex-col gap-6">
      {/* Earnings Chart Card */}
      <div className="bg-[#1e293b] border border-[#262626] rounded-xl rounded-2xl p-6  flex flex-col h-64 relative overflow-hidden select-none border border-white/[0.01]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#e7e4ee]">Royalty Analytics</h2>
            <p className="text-xs text-[#acaab4] font-label mt-0.5">Current Epoch Earnings</p>
          </div>
          <span className="text-[#ffffff] font-bold font-display text-lg">1.4k AXM</span>
        </div>
        
        {/* Abstract chart bar representation */}
        <div className="flex-1 flex items-end justify-between gap-2.5 mt-auto h-24">
          {chartBars.map((height, i) => {
            const isLast = i === chartBars.length - 1;
            const isPeak = i === 3;
            
            return (
              <div 
                key={i} 
                className={`w-full rounded-t-md transition-all duration-300 relative group cursor-pointer ${
                  isLast 
                    ? "bg-[#ffffff] shadow-[0_0_15px_rgba(165,165,255,0.45)]" 
                    : isPeak
                      ? "bg-[#ffffff]/40 hover:bg-[#ffffff]/60"
                      : "bg-[#ffffff]/20 hover:bg-[#ffffff]/40"
                }`}
                style={{ height: `${height}%` }}
              >
                {isPeak && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#ffffff] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Peak
                  </div>
                )}
                {/* Micro tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1f1f28] border border-[#262626] rounded px-1.5 py-0.5 text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-25">
                  {(height * 14).toFixed(0)} AXM
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribution Points Card */}
      <div className="bg-[#1e293b] border border-[#262626] rounded-xl rounded-2xl p-5 border border-white/[0.01] flex items-center justify-between">
        <div>
          <p className="text-xs text-[#acaab4] font-label mb-1">Contribution Points</p>
          <p className="font-display font-black text-2xl text-[#e7e4ee] tracking-tight">{points.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-[#ffffff]/10 flex items-center justify-center text-[#ffffff] border border-[#ffffff]/10">
          <Star className="w-5 h-5 fill-[#ffffff]/20" />
        </div>
      </div>

      {/* UPI & Sync Status Card */}
      <div className="bg-[#1e293b] border border-[#262626] rounded-xl rounded-2xl p-5 border border-white/[0.01] flex flex-col gap-3">
        <p className="text-xs text-[#acaab4] font-label">UPI Network Sync</p>
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="font-display font-bold text-sm text-[#e7e4ee]">Active &amp; Synchronized</span>
        </div>
        
        <div className="text-[10px] text-[#acaab4] font-mono mt-1 bg-[#121212]/60 p-2.5 rounded-xl border border-[#1a1a1a] leading-relaxed">
          <div className="flex justify-between">
            <span className="opacity-60">Connected Pools:</span>
            <span className="font-semibold text-[#e7e4ee]">{poolCount} pools</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="opacity-60">Total Earnings:</span>
            <span className="font-semibold text-emerald-400">₹{earnings.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="opacity-60">UPI Ping:</span>
            <span className="font-semibold text-emerald-400">12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
