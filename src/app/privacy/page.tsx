"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  EyeOff, 
  FileCheck, 
  Key 
} from "lucide-react";

// Inline Custom SVGs for branding
const LogoIcon = () => (
  <svg className="w-9 h-9 text-[#ffffff] drop-shadow-[0_0_10px_rgba(94,92,230,0.6)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PrivacyPage() {
  const securityPillars = [
    {
      icon: EyeOff,
      title: "Double-Blind Validator Nodes",
      desc: "Contributor annotation submissions are processed through a strict double-blind distribution protocol. Validators have zero visibility into contributor profiles, and datasets are fully sanitized of original file path markers before audit routing."
    },
    {
      icon: Lock,
      title: "Zero-Leakage Assurances",
      desc: "Proprietary enterprise prompt templates are stored inside decentralized encrypted storage modules. Axiom applies automated Zero-Knowledge sanitization steps, ensuring zero exposure of raw training parameters to external nodes."
    },
    {
      icon: FileCheck,
      title: "Differential Privacy Filters",
      desc: "To guarantee regulatory compliance (such as GDPR, HIPAA, and DPDP), Axiom pipelines pass all textual dialogue pairs through mathematical differential noise sweeps, automatically identifying and cleansing personal identifying markers."
    },
    {
      icon: Key,
      title: "ZKP Credential Isolation",
      desc: "Expert credentials (academic degrees, professional achievements, regulatory memberships) are checked using Zero-Knowledge Proofs (ZKPs). Contributors prove their high-domain competence without revealing personal identifiers or credentials details."
    }
  ];

  return (
    <div className="min-h-screen bg-[#141313] text-[#e7e4ee] font-sans selection:bg-[#ffffff]/30 selection:text-[#ffffff] overflow-x-hidden relative">
      
      {/* Background Blurs and Ambient Shadow Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute top-[-5%] right-[-10%] w-[60%] h-[50%] rounded-full bg-[#ffffff]/10 blur-[130px]" />
        <div className="absolute bottom-[15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#10B981]/5 blur-[140px]" />
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
            <span className="text-[10px] tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/20">
              LEDGER ACTIVE
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
              href="/client" 
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200"
            >
              Enterprise Lab
            </Link>
            <Link 
              href="/signup" 
              className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              Secure Account
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[900px] mx-auto px-6 py-16 relative z-10 space-y-12">
        
        {/* Title and Intro */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ffffff]/10 text-indigo-500 text-xs font-mono font-semibold border border-[#262626]">
            <ShieldCheck className="w-4 h-4" /> Cryptographic Privacy Protocol
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
            Privacy Ledger &amp; Security Assurances
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Axiom utilizes mathematical proofs and zero-knowledge credential isolation to sanitise enterprise prompt data, guaranteeing total compliance and zero raw information leaks.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="p-6 rounded-lg border border-[#262626] bg-[#121212] glass-panel flex flex-col gap-4">
                <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-white">{p.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Security Log Panel (Simulating Ledger Audits) */}
        <div className="p-6 rounded-lg border border-[#262626] bg-[#121212] glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Cryptographic Privacy Logs
            </h4>
            <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
              SECURE
            </span>
          </div>
          <div className="space-y-2.5 font-mono text-[10px] text-zinc-500">
            <p className="flex justify-between">
              <span>[AUDIT] Applied differential privacy noise to Legal Hinglish corpus #208...</span>
              <span className="text-emerald-500">CLEANSED</span>
            </p>
            <p className="flex justify-between">
              <span>[PROOF] Verified Dr. Iyer credential ZKP (Quantum Chem PhD)...</span>
              <span className="text-emerald-500">SUCCESS</span>
            </p>
            <p className="flex justify-between">
              <span>[SANITIZER] Zero-Leakage check passed on cardiac diagnostic dataset #412...</span>
              <span className="text-emerald-500">SAFE</span>
            </p>
            <p className="flex justify-between">
              <span>[CONSENSUS] Randomized blind verification slots allocated to 12 triage nodes...</span>
              <span className="text-zinc-600">ISOLATED</span>
            </p>
          </div>
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
