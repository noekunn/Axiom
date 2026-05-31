"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Loader2 } from "lucide-react";

interface TerminalConsoleProps {
  status: "idle" | "submitting" | "running" | "completed";
  jobId?: string;
  targetPoolTitle?: string;
}

export default function TerminalConsole({ status, jobId = "OpenAI-FT-72B", targetPoolTitle = "Global Chat Corpus v4" }: TerminalConsoleProps) {
  const [logs, setLogs] = useState<string[]>([
    "[INFO] Initializing distributed training environment...",
    "[INFO] Loading dataset: Global Chat Corpus v4 (Shared)",
    "[INFO] Tokenizing... 14M tokens processed.",
    "[WARN] GPU Memory utilization at 92%. Scaling batch size.",
    "Epoch 1/5 [=======>..........] 45%",
    "Step 100/1000: loss=2.4512, lr=0.0001",
    "Step 200/1000: loss=2.1034, lr=0.0001",
    "Step 254/1000: loss=1.9845, lr=0.00009 ... processing tensor matrices_"
  ]);

  const [loss, setLoss] = useState(1.98);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Handle local simulated training loop when in 'running' state
  useEffect(() => {
    if (status !== "running") return;

    const timer = setInterval(() => {
      setLogs((prev) => {
        const lastStep = prev[prev.length - 1];
        let nextStepNum = 260;
        let nextLoss = 1.95;

        // Parse last step if it exists
        if (lastStep && lastStep.includes("Step")) {
          const match = lastStep.match(/Step (\d+)/);
          if (match) {
            nextStepNum = parseInt(match[1]) + 10;
          }
        }

        if (nextStepNum >= 1000) {
          clearInterval(timer);
          return [
            ...prev,
            `Step 1000/1000: loss=0.2241, lr=0.00001`,
            "[SUCCESS] Distributed weights validation successfully verified.",
            "[INFO] Exporting fine-tuned checkpoint to Cloudflare R2 bucket...",
            "[SUCCESS] Training job completed successfully."
          ];
        }

        nextLoss = Math.max(0.22, Number((2.0 - (nextStepNum / 1000) * 1.78 + Math.random() * 0.05).toFixed(4)));
        setLoss(nextLoss);

        return [
          ...prev,
          `Step ${nextStepNum}/1000: loss=${nextLoss.toFixed(4)}, lr=${(0.0001 * (1 - nextStepNum / 1000)).toFixed(6)}`
        ];
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [status]);

  // Synchronize with external status updates
  useEffect(() => {
    if (status === "completed") {
      setLogs((prev) => [
        ...prev,
        "[SUCCESS] Supervised Fine-Tuning job completed successfully.",
        `[INFO] Model deployed for inference endpoints: ft:gpt-4o-mini:axiom:${jobId.toLowerCase()}`
      ]);
      setLoss(0.22);
    } else if (status === "submitting") {
      setLogs([
        `[INFO] Initializing Supervised Fine-Tuning request on Axiom datasets...`,
        `[INFO] Uploading formatted JSONL dataset file to OpenAI files API...`,
        `[INFO] Establishing R2 endpoint linkages for job: ${jobId}`
      ]);
      setLoss(2.8);
    }
  }, [status, jobId]);

  return (
    <section className="flex flex-col h-full min-h-[420px] select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-extrabold text-lg text-[#e7e4ee] flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#ffffff]" />
          Terminal Visualizer
          <span className="text-xs font-normal text-[#acaab4] bg-[#1f1f28] px-2 py-0.5 rounded-md border border-[#262626]">
            Job: {jobId}
          </span>
        </h2>
      </div>

      <div className="bg-[#1e293b] border border-[#262626] rounded-xl rounded-2xl flex-1 flex flex-col overflow-hidden relative border border-white/[0.01]">
        {/* Terminal Header */}
        <div className="bg-[#000000]/60 px-4 py-3 border-b border-[#262626] flex items-center justify-between backdrop-blur-md z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6e84]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#5f9eff]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="text-[10px] font-mono text-[#acaab4] tracking-wider uppercase">
            axiom-train-cluster-01 ~ zsh
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
              status === "running" 
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/25 " 
                : status === "completed" 
                  ? "bg-indigo-950/40 text-[#ffffff] border-[#ffffff]/25"
                  : "bg-white/5 text-[#acaab4] border-[#262626]"
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 bg-[#000000]/30 p-5 font-mono text-xs overflow-y-auto min-h-[280px] max-h-[360px] relative">
          <div className="space-y-1.5 text-[#acaab4]/80">
            {logs.map((log, index) => {
              const isInfo = log.includes("[INFO]");
              const isSuccess = log.includes("[SUCCESS]");
              const isWarn = log.includes("[WARN]");
              const isStep = log.includes("Step");
              
              return (
                <div key={index} className="leading-relaxed">
                  {isInfo && <span className="text-[#5f9eff] font-bold mr-1.5">[INFO]</span>}
                  {isSuccess && <span className="text-emerald-400 font-bold mr-1.5">[SUCCESS]</span>}
                  {isWarn && <span className="text-[#d277ff] font-bold mr-1.5">[WARN]</span>}
                  
                  {isStep ? (
                    <span className="text-white font-semibold">{log}</span>
                  ) : isInfo || isSuccess || isWarn ? (
                    <span>{log.replace(/\[(INFO|SUCCESS|WARN)\]\s*/, "")}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              );
            })}
            <div ref={consoleEndRef} />
          </div>

          {/* Floating Curve Graph Overlay */}
          <div className="absolute bottom-5 right-5 w-44 h-24 bg-[#1f1f28]/60 border border-[#262626] rounded-xl p-3 flex flex-col justify-between overflow-hidden backdrop-blur-md pointer-events-none shadow-2xl">
            <div className="flex justify-between items-center text-[8px] text-[#acaab4] uppercase tracking-wider font-sans">
              <span>Loss Curve</span>
              <span className="font-mono text-emerald-400 font-bold">{loss.toFixed(3)}</span>
            </div>
            
            {/* Draw curve via custom SVG path */}
            <div className="h-12 w-full relative mt-2">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path 
                  d="M0,10 Q20,15 40,30 T80,45 L100,48 L100,50 L0,50 Z" 
                  fill="rgba(165,165,255,0.06)"
                />
                <path 
                  className="opacity-80 transition-all duration-500" 
                  d="M0,10 Q20,15 40,30 T80,45 L100,48" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
