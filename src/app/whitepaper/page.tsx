"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Zap, 
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

export default function WhitepaperPage() {
  const [activeSection, setActiveSection] = useState("abstract");

  const sections = [
    { id: "abstract", label: "1. Abstract & Vision" },
    { id: "royalty-model", label: "2. Relational Royalty Model" },
    { id: "consensus", label: "3. Cryptographic Consensus" },
    { id: "vetting-math", label: "4. Vetting Node Multipliers" },
    { id: "governance", label: "5. Security & Isolation" }
  ];

  return (
    <div className="min-h-screen bg-[#141313] text-[#e7e4ee] font-sans selection:bg-[#ffffff]/30 selection:text-[#ffffff] overflow-x-hidden relative">
      
      {/* Dynamic Grid Background & Ambient Shadows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-[#ffffff]/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[55%] h-[55%] rounded-full bg-[#10B981]/5 blur-[140px]" />
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
            <span className="text-zinc-600 text-xs px-2.5 py-1 rounded bg-[#262626] font-mono">v2.4-PROD</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link 
              href="/docs" 
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200"
            >
              Docs
            </Link>
            <Link 
              href="/expert" 
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200"
            >
              Expert Hub
            </Link>
            <Link 
              href="/signup" 
              className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              Join Platform
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-[1200px] mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Table of Contents Side Navigation */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 p-5 rounded-lg border border-[#262626] bg-[#121212] glass-panel">
            <h3 className="font-display font-bold text-sm text-white mb-4 uppercase tracking-widest text-zinc-400">
              Whitepaper Sections
            </h3>
            <nav className="flex flex-col gap-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-semibold tracking-tight transition-all duration-200 flex items-center justify-between ${
                    activeSection === sec.id
                      ? "bg-[#1c1917]/5 text-[#1c1917] border border-[#1c1917]/10 font-bold"
                      : "text-zinc-600 hover:text-[#1c1917] hover:bg-[#1c1917]/[0.02]"
                  }`}
                >
                  {sec.label}
                  <ChevronRight className="w-3 h-3 opacity-65" />
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-5 border-t border-white/5 flex flex-col gap-3">
              <a 
                href="/api/whitepaper"
                className="w-full text-center py-2 rounded bg-[#1c1917] hover:bg-[#2e2a28] text-white text-xs font-bold font-display shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" /> Download PDF v2.4
              </a>
            </div>
          </div>
        </aside>

        {/* Paper Content Pane */}
        <section className="lg:col-span-3">
          <div className="p-8 lg:p-12 rounded-lg border border-[#262626] bg-[#121212] glass-panel shadow-2xl space-y-12">
            
            {/* Section 1: Abstract */}
            {activeSection === "abstract" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 text-indigo-500 font-mono text-xs uppercase tracking-widest">
                  <Database className="w-4 h-4" /> Section 1.0
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  1. Abstract & Vision
                </h2>
                <hr className="border-white/5" />
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  The rapidly escalating performance demands of generative artificial intelligence model architectures (e.g., Large Language Models, Multi-Modal Systems, and RLHF Reward Agents) are heavily constrained by the quality and authenticity of their alignment data. Traditional visual labeling crowdsourcing layers have failed, resulting in systemic hallucination reinforcement and high manual engineering overheads.
                </p>
                <div className="p-5 rounded border border-[#262626] bg-white/5 border-l-4 border-l-indigo-500 my-6">
                  <h4 className="text-xs font-bold font-display text-indigo-500 uppercase tracking-widest mb-2">Architectural Hypothesis</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Axiom replaces administrative consultancy overheads with math. By fractionalizing curated domain expert datasets into cryptographic ledger pools, Axiom introduces a peer-to-peer training network that provides perpetual compounding royalty dividends back to the expert validators who validated them.
                  </p>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  By routing multi-turn annotation requests through double-blind validator structures and calculating consensus validation using advanced margin calculations, Axiom enforces extreme dataset fidelity, producing pre-training and fine-tuning datasets that achieve higher downstream alignment benchmarks than service consulting firms at 20% of the cost.
                </p>
              </div>
            )}

            {/* Section 2: Relational Royalty Model */}
            {activeSection === "royalty-model" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 text-indigo-500 font-mono text-xs uppercase tracking-widest">
                  <Layers className="w-4 h-4" /> Section 2.0
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  2. Relational Relocation & Royalty Model
                </h2>
                <hr className="border-white/5" />
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  The core value vector of Axiom is the **Relational Royalty Engine**. Unlike standard crowdsourcing platforms where expert annotations are bought once as flat commodities, approved expert validations inside Axiom remain perpetually linked to their contributors.
                </p>
                <div className="my-8 overflow-hidden rounded border border-[#262626] bg-white/5 p-6 space-y-4">
                  <h3 className="text-sm font-bold font-display text-white">Compounding Yield Mechanics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded bg-[#141313]/40 border border-[#262626]">
                      <h4 className="text-[11px] font-mono text-indigo-500 uppercase tracking-wider mb-1">Upfront Payout Vector</h4>
                      <p className="text-xs text-zinc-600">Experts claim and resolve tasks inside specific domain vetting pools, instantly earning baseline upfront points mapped directly into sovereign payouts (Razorpay/Stripe).</p>
                    </div>
                    <div className="p-4 rounded bg-[#141313]/40 border border-[#262626]">
                      <h4 className="text-[11px] font-mono text-emerald-500 uppercase tracking-wider mb-1">Passive Royalty Stream</h4>
                      <p className="text-xs text-zinc-600">Whenever an enterprise purchaser licenses that specific asset pool to reinforce their LLMs, secondary marketplace royalties (up to 20%) are routed directly back to the original validators.</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  This creates an asset-class structure out of human-labeled inputs. The Relational Royalty formula integrates complexity factors, active vetting tier multipliers, and double-blind validation ratings to distribute royal dividends proportionally and mathematically back to contributing expert nodes.
                </p>
              </div>
            )}

            {/* Section 3: Cryptographic Consensus */}
            {activeSection === "consensus" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 text-indigo-500 font-mono text-xs uppercase tracking-widest">
                  <Cpu className="w-4 h-4" /> Section 3.0
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  3. Cryptographic Consensus QA Engine
                </h2>
                <hr className="border-white/5" />
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  To eliminate visual inspect pipelines and manual administrative audits, Axiom manages annotation accuracy using a randomized **multi-model cryptographic consensus checker**.
                </p>
                <div className="p-6 rounded-lg border border-indigo-500/10 bg-indigo-500/[0.02] flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-12 h-12 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Double-Blind Verification Protocol</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Every submission submitted by a specialist contributor is immediately routed to a queue in the background. Two independent vetting nodes (validators) verify the submission blindly. If the scoring margin matches standard quality parameters (e.g. &gt;95%), the task is instantly approved.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  In cases of a discrepancy, the task is routed to a third-tier consensus audit. Our consensus algorithms calibrates margin score boundaries across LLMs (using Groq Llama 3.3 and GPT-4o validations) to automatically slash rewards for poor annotation nodes, guaranteeing clean data generation pipelines.
                </p>
              </div>
            )}

            {/* Section 4: Vetting Node Multipliers */}
            {activeSection === "vetting-math" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 text-indigo-500 font-mono text-xs uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" /> Section 4.0
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  4. Vetting Arena & Node Tiers Math
                </h2>
                <hr className="border-white/5" />
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  Axiom contributors are not anonymous crowdfinders; they are vetted domain expert nodes. To qualify for specific asset pools, contributors must enter the **Vetting Arena**, passing automated time-based challenges mapped directly to their domains (e.g., Medical diagnosis, Hinglish legal clause checks).
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  Based on their performance in the Vetting Arena, nodes receive structural tiers that multiply their relocation points:
                </p>
                <div className="overflow-x-auto rounded border border-[#262626] bg-white/5">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#141313]/60 border-b border-[#262626] text-white">
                      <tr>
                        <th className="px-4 py-3">Node Tier Level</th>
                        <th className="px-4 py-3">Minimum XP Needed</th>
                        <th className="px-4 py-3">Base Point Multiplier</th>
                        <th className="px-4 py-3">Access Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626] text-zinc-600">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-white">Bronze Node</td>
                        <td className="px-4 py-3 font-mono">0 XP</td>
                        <td className="px-4 py-3 font-mono">1.00x</td>
                        <td className="px-4 py-3">Standard Queue</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-white">Silver Node</td>
                        <td className="px-4 py-3 font-mono">1,000 XP</td>
                        <td className="px-4 py-3 font-mono">1.25x</td>
                        <td className="px-4 py-3">Elevated Queue</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-white">Gold Node</td>
                        <td className="px-4 py-3 font-mono">3,000 XP</td>
                        <td className="px-4 py-3 font-mono">1.50x</td>
                        <td className="px-4 py-3">Priority Vetting</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-white">Senior Node</td>
                        <td className="px-4 py-3 font-mono">6,000 XP</td>
                        <td className="px-4 py-3 font-mono">2.00x</td>
                        <td className="px-4 py-3">Guaranteed Claims</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-indigo-500">Elite Node</td>
                        <td className="px-4 py-3 font-mono text-indigo-500">10,000 XP</td>
                        <td className="px-4 py-3 font-mono text-indigo-500">2.50x</td>
                        <td className="px-4 py-3 text-indigo-500">Instant Automated Claims</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 5: Security & Isolation */}
            {activeSection === "governance" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 text-indigo-500 font-mono text-xs uppercase tracking-widest">
                  <Layers className="w-4 h-4" /> Section 5.0
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight leading-tight">
                  5. Zero-Leakage Security & Privacy
                </h2>
                <hr className="border-white/5" />
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  Enterprise machine learning systems operate under heavy regulatory compliance mandates (e.g. HIPAA, GDPR, Digital Personal Data Protection Act). Axiom ensures complete, strict visual isolation and zero leaks for target training datasets:
                </p>
                <div className="space-y-4">
                  <div className="p-4 rounded border border-[#262626] bg-[#141313]/30">
                    <h4 className="text-xs font-bold text-white font-display mb-1">Differential Privacy (DP) Filters</h4>
                    <p className="text-xs text-zinc-600">Axiom injects advanced differential noise checks into pre-training prompt corpuses, preventing generative models from memorizing personal identifying info (PII).</p>
                  </div>
                  <div className="p-4 rounded border border-[#262626] bg-[#141313]/30">
                    <h4 className="text-xs font-bold text-white font-display mb-1">ZKP Specialist Verification</h4>
                    <p className="text-xs text-zinc-600">Zero-knowledge proof verification algorithms check the credentials and academic degrees of professional contributor nodes, protecting their identities while proving expertise parameters.</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-sans">
                  The result is a clean, compliant, high-integrity decentralized intelligence stack where datasets remain mathematically protected and contributors earn compounding royalties in absolute structural safety.
                </p>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#262626] bg-[#141313] z-20 relative py-12 text-xs text-zinc-500 font-mono mt-12">
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
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
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
