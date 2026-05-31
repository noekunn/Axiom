"use client";

import React from "react";
import Link from "next/link";
import { 
  Terminal, 
  ArrowLeft, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Layers 
} from "lucide-react";

// Inline Custom SVGs for branding
const LogoIcon = () => (
  <svg className="w-9 h-9 text-[#ffffff] drop-shadow-[0_0_10px_rgba(94,92,230,0.6)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function TerminalsPage() {
  const terminalNodes = [
    {
      title: "Expert Workbench & Portal",
      desc: "Vetted subject specialists validate domain prompt sets, claims dynamic validation task blocks, connect Razorpay payout layers, and check compounding dataset royalty passive yields.",
      href: "/expert",
      accentText: "EXPERT PLATFORM",
      colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      buttonText: "Launch Workbench",
      icon: Database
    },
    {
      title: "Vetting Arena",
      desc: "Automated, tier-based testing hub where expert candidates take time-locked MCQs and Hinglish/Indic translation evaluations to secure higher point multipliers.",
      href: "/vetting",
      accentText: "CHALLENGE ARENA",
      colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      buttonText: "Enter Arena",
      icon: ShieldCheck
    },
    {
      title: "Enterprise Lab & SFT Console",
      desc: "Enterprise purchasers license fractionalized training datasets, configure OpenAI Supervised Fine-Tuning endpoints, inspect dataset schemas, and manage billing payouts.",
      href: "/client",
      accentText: "ENTERPRISE PORTAL",
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      buttonText: "Enter Lab",
      icon: Cpu
    },
    {
      title: "Admin Operational Console",
      desc: "Operator command panel to check background verification BullMQ latencies, audit Stripe payouts, and dynamically calibrate AI model consensus thresholds.",
      href: "/admin",
      accentText: "SYSTEM ADMIN",
      colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      buttonText: "Access Systems",
      icon: Terminal
    },
    {
      title: "Model Benchmark Leaderboard",
      desc: "Real-time, interactive ranking of top LLM architectures (GPT-4o, Claude 3.5, Llama 3) across bilingual regional datasets with dynamic SVG group-width matrices.",
      href: "/leaderboard",
      accentText: "LLM BENCHMARKS",
      colorClass: "text-sky-500 bg-sky-500/10 border-sky-500/20",
      buttonText: "View Rankings",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-[#141313] text-[#e7e4ee] font-sans selection:bg-[#ffffff]/30 selection:text-[#ffffff] overflow-x-hidden relative">
      
      {/* Background Ambience and Grids */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute top-[-5%] left-[-15%] w-[60%] h-[55%] rounded-full bg-[#ffffff]/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[55%] h-[55%] rounded-full bg-[#10B981]/5 blur-[140px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#141313]/80 backdrop-blur-xl border-b border-[#262626]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <LogoIcon />
              <span className="text-xl font-bold tracking-tighter text-white font-display">
                AXIOM
              </span>
            </Link>
            <span className="text-[10px] tracking-widest bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-mono font-bold border border-indigo-500/20">
              TERMINALS ACTIVATED
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link 
              href="/signup" 
              className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[900px] mx-auto px-6 py-16 relative z-10 space-y-12">
        
        {/* Page Title & Intro */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ffffff]/10 text-indigo-500 text-xs font-mono font-semibold border border-[#262626]">
            <Layers className="w-4 h-4" /> Global Stack Registry
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
            Protocol Terminals &amp; Directories
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Direct access channels into Axiom's specialist validation pipelines, enterprise marketplace hubs, model ranking index, and administrator queue consoles.
          </p>
        </div>

        {/* Terminals Listing Grid */}
        <div className="space-y-6 pt-6">
          {terminalNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div key={idx} className="p-6 lg:p-8 rounded-lg border border-[#262626] bg-[#121212] glass-panel flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl hover:translate-y-[-2px] transition duration-300">
                <div className="space-y-3.5 max-w-lg">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${node.colorClass}`}>
                    <Icon className="w-3.5 h-3.5" /> {node.accentText}
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">{node.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">{node.desc}</p>
                </div>

                <div className="shrink-0 flex items-center md:justify-end">
                  <Link href={node.href}>
                    <button className="py-2.5 px-5 rounded bg-white text-black font-display font-bold text-xs hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98]">
                      {node.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#262626] bg-[#141313] z-20 relative py-12 text-xs text-zinc-500 font-mono mt-16">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-base font-bold text-white tracking-widest font-mono">
              AXIOM
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-[10px]">
            <span>© 2026 Axiom Protocol Layer. All rights reserved.</span>
            <span className="text-zinc-800">|</span>
            <Link href="/terminals" className="hover:text-white transition-colors">Terminals</Link>
            <span className="text-zinc-800">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Ledger</Link>
            <span className="text-zinc-800">|</span>
            <Link href="/whitepaper" className="hover:text-white transition-colors">Whitepaper v2.4</Link>
          </div>

          <div className="flex items-center gap-2 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider font-mono">
              ALL PROTOCOL NODES OPERATIONAL
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
