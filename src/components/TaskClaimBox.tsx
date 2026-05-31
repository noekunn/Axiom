"use client";

import React, { useState } from "react";

export interface Task {
  id: string;
  title: string;
  category: string;
  reward: string;
  difficulty: 1 | 2 | 3;
  claimed: boolean;
  claimedBy?: string;
  timeRemaining?: string;
}

interface TaskClaimBoxProps {
  tasks: Task[];
  onClaimTask: (id: string) => void;
  claimedCount: number;
  totalRewards: number;
}

export default function TaskClaimBox({
  tasks,
  onClaimTask,
  claimedCount,
  totalRewards,
}: TaskClaimBoxProps) {
  const [filter, setFilter] = useState<"all" | "unclaimed" | "claimed">("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "unclaimed") return !task.claimed;
    if (filter === "claimed") return task.claimed;
    return true;
  });

  return (
    <div className="bg-[#121212] p-6 rounded-xl relative overflow-hidden flex flex-col h-full border border-[#262626]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#262626] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <h3 className="text-lg font-bold text-slate-100 font-display">Task Claim Console</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-body-md">
            Claim high-priority alignment and validation jobs to earn AXM tokens.
          </p>
        </div>

        {/* Console Rewards Panel */}
        <div className="flex items-center gap-3 bg-[#0A0A0A] p-2.5 rounded-lg border border-[#262626]">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-display">Active Claims</p>
            <p className="text-xs font-semibold text-slate-300">{claimedCount} tasks</p>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest font-display">Total Earned</p>
            <p className="text-xs font-bold text-[#10B981] tracking-tight">
              {totalRewards} AXM
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 my-4 bg-[#0A0A0A] p-1 rounded-lg border border-[#262626] self-start">
        {(["all", "unclaimed", "claimed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs px-3 py-1.5 rounded font-medium capitalize transition-all duration-200 ${
              filter === tab
                ? "bg-white text-black font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List Grid */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#262626] rounded-xl bg-[#0A0A0A]">
            <svg className="w-8 h-8 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs text-slate-400 font-medium">No tasks match selected filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all duration-300 relative group overflow-hidden ${
                task.claimed
                  ? "bg-[#0A0A0A] border-[#262626] opacity-70"
                  : "bg-[#0A0A0A]/60 border-[#262626] hover:border-white/20 hover:bg-[#0A0A0A]/80"
              }`}
            >
              {/* Subtle visual stripe for active claimed tasks */}
              {task.claimed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]" />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 bg-[#121212] px-2 py-0.5 rounded border border-[#262626] uppercase tracking-wide font-display">
                      {task.category}
                    </span>
                    {/* Difficulty indicator */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((dot) => (
                        <span
                          key={dot}
                          className={`w-1 h-1 rounded-full ${
                            dot <= task.difficulty
                              ? "bg-[#10B981]"
                              : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 tracking-tight group-hover:text-[#ffffff] transition-colors font-display">
                    {task.title}
                  </h4>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase font-medium font-display">Bounty</p>
                    <p className="text-xs font-bold text-[#10B981] tracking-tight">{task.reward}</p>
                  </div>

                  {task.claimed ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[8px] block text-[#10B981] font-bold uppercase tracking-wider font-display">
                          CLAIMED BY YOU
                        </span>
                        {task.timeRemaining && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            expires in {task.timeRemaining}
                          </span>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onClaimTask(task.id)}
                      className="px-4 py-2 rounded bg-white text-black hover:bg-zinc-200 active:scale-95 text-xs font-bold font-display transition-all duration-200"
                    >
                      Claim Bounty
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
