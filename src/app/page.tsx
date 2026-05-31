"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Cpu, 
  Database, 
  Key, 
  Check, 
  Info, 
  Search
} from "lucide-react";

// Inline Custom SVGs for Branding and visual depth
const LogoIcon = () => (
  <svg className="w-9 h-9 text-[#ffffff] drop-shadow-[0_0_10px_rgba(94,92,230,0.6)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Types
interface FAQItem {
  question: string;
  answer: string;
  category: "network" | "expert" | "client";
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarSeed: string;
}

export default function HomePage() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<"expert" | "client">("expert");
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<"all" | "network" | "expert" | "client">("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Contributor/Expert Calculator States
  const [expertTasks, setExpertTasks] = useState(1200); // 50 to 5,000 tasks
  const [expertResales, setExpertResales] = useState(15); // 1 to 50 resales

  // Enterprise/Client Calculator States
  const [clientDataPoints, setClientDataPoints] = useState(75000); // 1,000 to 250,000
  const [complexityFactor, setComplexityFactor] = useState(1.4); // 1.0, 1.4, 2.2, 3.0

  // Expert Math Formulas
  const baseRewardPerTask = 12.50;
  const royaltyPerResale = 3.50;
  
  const expertActiveEarnings = expertTasks * baseRewardPerTask;
  const expertRoyaltyEarnings = expertTasks * expertResales * royaltyPerResale;
  const expertTotalEarnings = expertActiveEarnings + expertRoyaltyEarnings;
  
  // MTurk reference baseline ($0.35/task flat, no resales)
  const mturkFlatRate = 0.35;
  const mturkBaselineEarnings = expertTasks * mturkFlatRate;
  const expertRoyaltyMultiplier = mturkBaselineEarnings > 0 
    ? (expertTotalEarnings / mturkBaselineEarnings).toFixed(1) 
    : "0";

  // Client Math Formulas
  const vettoBasePerPoint = 2.40;
  const vettoSetupFee = 15000;
  const vettoCost = (clientDataPoints * vettoBasePerPoint * complexityFactor) + vettoSetupFee;

  const axiomBasePerPoint = 0.50;
  const axiomCost = clientDataPoints * axiomBasePerPoint * complexityFactor;

  const clientNetSavings = Math.max(0, vettoCost - axiomCost);
  const clientSavingsPercent = vettoCost > 0 ? ((clientNetSavings / vettoCost) * 100).toFixed(0) : "0";

  // Real-time network dynamic counters simulation
  const [networkStats, setNetworkStats] = useState({
    activeNodes: 8421,
    validatedData: 14284200,
    royaltiesPaid: 12484910,
    gasSaved: 92.4,
  });

  const [consensusLogs, setConsensusLogs] = useState<string[]>([
    "[CONSENSUS] Node #408 submitted Organic Chemistry reasoning prompt...",
    "[CALIBRATING] Llama 3.3 (95% accuracy) + GPT-4o (94% accuracy) matching...",
    "[SUCCESS] Bounties routed to Dr. Elena Rostova: +13.50 PTS via Razorpay UPI",
    "[CONSENSUS] Node #210 submitted Indian Contract Act clause audit..."
  ]);

  useEffect(() => {
    const statsInterval = setInterval(() => {
      setNetworkStats((prev) => ({
        activeNodes: prev.activeNodes + (Math.random() > 0.7 ? 1 : 0),
        validatedData: prev.validatedData + Math.floor(Math.random() * 8) + 2,
        royaltiesPaid: prev.royaltiesPaid + Math.floor(Math.random() * 25) + 5,
        gasSaved: prev.gasSaved,
      }));
    }, 4000);

    const logTemplates = [
      "[CONSENSUS] Node #408 submitted Organic Chemistry reasoning prompt...",
      "[CALIBRATING] Llama 3.3 (95% accuracy) + GPT-4o (94% accuracy) matching...",
      "[SUCCESS] Bounties routed to Dr. Elena Rostova: +13.50 PTS via Razorpay UPI",
      "[CONSENSUS] Node #210 submitted Indian Contract Act clause audit...",
      "[SUCCESS] Upfront payout routed to Adv. Rahul Banerjee: +22.50 PTS (₹2,700)",
      "[INFO] Enterprise Aether Labs licensed Hinglish-Clinical shared corpus: $25,000",
      "[INFO] 5% royalty dividend distributed instantly to 18 triage nodes...",
      "[CONSENSUS] Node #412 claimed cardiac diagnostic validation challenge...",
      "[CALIBRATING] Consensus match score: 98.2% accuracy verified."
    ];

    const logInterval = setInterval(() => {
      setConsensusLogs((prev) => {
        const nextLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        return [...prev.slice(1), nextLog];
      });
    }, 3500);

    return () => {
      clearInterval(statsInterval);
      clearInterval(logInterval);
    };
  }, []);

  // Complexity Handler
  const handleComplexityChange = (factor: number) => {
    setComplexityFactor(factor);
  };

  // FAQ Database
  const faqItems: FAQItem[] = [
    {
      category: "network",
      question: "What is the Axiom sovereign training data layer?",
      answer: "Axiom is a decentralized protocol engineered to compile, cleanse, and validate enterprise-grade machine learning datasets. By leveraging cryptographic proofs of origin and a consensus-backed specialist network, Axiom delivers ultra-high-fidelity training material directly into generative AI pipelines at a fraction of traditional agency costs."
    },
    {
      category: "expert",
      question: "How do compounding dataset royalties work for expert contributors?",
      answer: "Unlike traditional crowdsourcing sites that buy your labor once for pennies, Axiom mints approved specialist datasets as fractionalized ledger assets. Every time a new AI laboratory licenses that dataset for model reinforcement (RLHF) or pre-training, contributors earn secondary marketplace royalties in proportion to their valid micro-tasks. This creates compounding, long-term passive yields."
    },
    {
      category: "client",
      question: "Why is Axiom so much cheaper and faster than services firms like Vetto?",
      answer: "Traditional consulting agencies suffer from high operational management overheads, recruiting friction for niche subject matter, and manual visual inspections. Axiom programmatically routes tasks to decentralized experts via automated smart pipelines and processes validations using high-throughput consensus protocols, eliminating intermediary costs and cutting deployment pipelines from weeks to hours."
    },
    {
      category: "expert",
      question: "What domain expertise is currently in high demand for active nodes?",
      answer: "We are currently prioritizing specialists in: Computational Medicine & Biotech, Legal Precedent Analysis, Quantum Chemistry & Physics, Advanced Multi-turn Coding, and Cryptographic Security Auditing. Active nodes inside these domains receive priority queue access and elevated base rewards."
    },
    {
      category: "client",
      question: "How does Axiom ensure training data security and privacy?",
      answer: "Axiom employs Differential Privacy (DP) filters, secure multi-party computation nodes, and strict automated zero-knowledge sanitization pipelines. Your proprietary enterprise structures remain completely confidential, and output materials are rigorously audited against toxic alignments, biases, and leakage before licensing."
    },
    {
      category: "network",
      question: "How do validator nodes guarantee consensus and prevent poor quality?",
      answer: "Axiom relies on a multi-tiered validation game. Raw annotations submitted by contributor nodes are randomly routed through double-blind validator nodes. Discrepancies prompt a third-tier consensus audit. Malicious or low-fidelity nodes have their staked rewards slashed, while consistent high-accuracy contributors are automatically promoted into premium high-yield tiers."
    }
  ];

  // Testimonials
  const testimonials: Testimonial[] = [
    {
      quote: "Prior crowdsourcing platforms treated domain experts like mechanical cogs. Axiom recognized the premium value of my medical degree. I spent 40 hours validating biochemistry pipelines and now receive over $1,800/month in compounding licensing royalties.",
      author: "Dr. Elena Rostova",
      role: "Immunology Research Fellow & Axiom Bio-Node #408",
      company: "Decentralized Clinical Layer",
      avatarSeed: "elena"
    },
    {
      quote: "We were quoted $210k and 8 weeks by a boutique services firm for custom multi-turn dialogue annotation in quantitative finance. Axiom completed the entire validation matrix in 72 hours for under $40,000, with cryptographic proof of accuracy.",
      author: "Marcus Vance",
      role: "Lead Architect of LLM Infrastructure",
      company: "Aether Wealth Management",
      avatarSeed: "marcus"
    }
  ];

  // Filter FAQ based on search and category
  const filteredFaqs = faqItems.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = faqCategory === "all" || item.category === faqCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#141313] text-[#e7e4ee] font-sans selection:bg-[#ffffff]/30 selection:text-[#ffffff] overflow-x-hidden relative">
      
      {/* AMBIENT NEON GLOW DECORATIONS (Stitch MCP - Neon Nocturne Guidelines) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Soft Tonal Ambient Shadows (No line rule) */}
        <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-[#ffffff]/10 blur-[130px] " />
        <div className="absolute top-[35%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#ffffff]/5 blur-[160px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[55%] h-[55%] rounded-full bg-[#10B981]/5 blur-[140px]" />
      </div>

      {/* PERSISTENT HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 w-full bg-[#141313]/80 backdrop-blur-xl border-b border-[#262626]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-xl font-bold tracking-tighter text-white active:scale-[0.98] transition-transform font-display">
              AXIOM
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-display text-sm font-medium tracking-tight">
            <a href="#about" className="text-zinc-400 hover:text-white transition-colors duration-200">About</a>
            <a href="#experts" className="text-zinc-400 hover:text-white transition-colors duration-200">Experts</a>
            <a href="#clients" className="text-zinc-400 hover:text-white transition-colors duration-200">Clients</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#faq" className="text-zinc-400 hover:text-white transition-colors duration-200">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/expert" 
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200"
            >
              Expert Hub
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
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1200px] mx-auto px-6 pb-24">
        
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 text-center lg:text-left grid lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-[#121212] border border-[#262626] px-3 py-1 rounded text-label-sm font-label-sm text-[#dae2fd] self-center lg:self-start w-fit uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
              SOVEREIGN AI TRAINING DATA LAYER
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-display">
              Uncompromising speed.<br />
              <span className="text-zinc-500 font-medium">Unquestionable precision.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-body-lg">
              Axiom connects elite domain specialists with leading AI laboratories to compile, validate, and license high-fidelity training data under cryptographic proof. Earn compounding royalties for every training dataset licensed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start pt-2">
              <Link 
                href="/signup?track=expert"
                className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded font-display font-bold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
              >
                Join as Expert
              </Link>
              <a 
                href="#experts"
                className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-6 py-3 rounded font-display font-semibold text-sm hover:bg-white/5 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
              >
                Simulate Returns
              </a>
            </div>

            {/* TRUSTED BY / TAGS */}
            <div className="pt-8 border-t border-[#262626] mt-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-4">
                Engineered for Next-Gen Architectures
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start items-center text-xs font-semibold text-zinc-400 font-mono">
                <span className="hover:text-white transition-colors">RLHF Alignment</span>
                <span className="text-zinc-800">•</span>
                <span className="hover:text-white transition-colors">DPO Tuning</span>
                <span className="text-zinc-800">•</span>
                <span className="hover:text-white transition-colors">Custom Red Teaming</span>
                <span className="text-zinc-800">•</span>
                <span className="hover:text-white transition-colors">Bilingual Reasoning</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC REAL-TIME STATS CARD */}
          <div className="lg:col-span-5">
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 sm:p-8">
              
              <div className="flex items-center justify-between pb-6 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ffffff]" />
                  <span className="text-xs font-display text-zinc-400 uppercase tracking-wider font-semibold">
                    AXIOM DECENTRALIZED STACK
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">v2.4.0-PROD</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Active Expert Nodes
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.activeNodes.toLocaleString('en-US')}
                  </div>
                  <span className="text-[9px] text-[#ffffff] font-mono flex items-center gap-1 mt-1 font-bold">
                    ↑ +12% this week
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Validated Tokens
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.validatedData.toLocaleString('en-US')}
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1 mt-1">
                    live streaming
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Royalties Distributed
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#ffffff] tracking-tight font-mono">
                    ${(networkStats.royaltiesPaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1 mt-1">
                    USD settlement layer
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Efficiency Gain
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.gasSaved.toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-[#10B981] font-mono mt-1 block font-bold">
                    vs consulting firms
                  </span>
                </div>
              </div>

              {/* Live Triage Consensus Stream Console */}
              <div className="mt-8 pt-6 border-t border-[#262626] space-y-3">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                  <span>LIVE TRIAGE CONSENSUS STREAM</span>
                  <span className="text-[#10B981] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    Node Stream Active
                  </span>
                </div>
                <div className="bg-[#141313] border border-white/5 p-4 rounded-xl font-mono text-[9px] leading-relaxed space-y-2 h-36 overflow-hidden flex flex-col justify-end">
                  {consensusLogs.map((log, index) => {
                    const isSuccess = log.includes("[SUCCESS]");
                    const isCalibrating = log.includes("[CALIBRATING]");
                    const isInfo = log.includes("[INFO]");
                    
                    return (
                      <div key={index} className="truncate transition-all duration-300 transform translate-y-0 opacity-80 hover:opacity-100">
                        {isSuccess && <span className="text-[#10B981] font-bold mr-1">[SUCCESS]</span>}
                        {isCalibrating && <span className="text-yellow-400 font-bold mr-1">[CALIBRATING]</span>}
                        {isInfo && <span className="text-zinc-400 font-bold mr-1">[INFO]</span>}
                        {!isSuccess && !isCalibrating && !isInfo && <span className="text-[#ffffff] font-bold mr-1">[CONSENSUS]</span>}
                        
                        <span className="text-zinc-400">
                          {log.replace(/\[(SUCCESS|CALIBRATING|INFO|CONSENSUS)\]\s*/, "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT / PROTOCOL FEATURES SECTION */}
        <section id="about" className="py-24 relative overflow-hidden">
          {/* Subtle Glow Transition */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2.5 block">
              AXIOM STACK SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Cryptographic Consensus Pipelines
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-body-md">
              Axiom replaces administrative overhead with math. Explore the four core pillars of our high-integrity training network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded bg-[#141313] border border-[#262626] flex items-center justify-center mb-5 group-hover:border-[#ffffff]/50 transition-colors duration-200">
                  <Shield className="w-5 h-5 text-[#ffffff]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Consensus Validation</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-body-md">
                  Raw contributor outputs are processed through multiple layers of blind validator nodes. Slashing rules keep validators strictly honest and accurate.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#ffffff] mt-6 block tracking-widest font-semibold uppercase">
                Zero-Leakage Assurance
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded bg-[#141313] border border-[#262626] flex items-center justify-center mb-5 group-hover:border-[#ffffff]/50 transition-colors duration-200">
                  <Cpu className="w-5 h-5 text-[#ffffff]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Fractional Ownership</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-body-md">
                  Datasets are fractionalized using secure smart licensing protocols. You maintain sovereign custody and secure continuous secondary income.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#ffffff] mt-6 block tracking-widest font-semibold uppercase">
                ERC-1155 Smart License
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded bg-[#141313] border border-[#262626] flex items-center justify-center mb-5 group-hover:border-[#10B981]/50 transition-colors duration-200">
                  <Database className="w-5 h-5 text-[#10B981]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Structured DP</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-body-md">
                  Built-in mathematical models automatically mask individual variables, preventing corporate dataset leakage or alignment reverse-engineering.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] mt-6 block tracking-widest font-semibold uppercase">
                DP-SGD Compliance
              </span>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded bg-[#141313] border border-[#262626] flex items-center justify-center mb-5 group-hover:border-[#ffffff]/50 transition-colors duration-200">
                  <Key className="w-5 h-5 text-[#ffffff]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Instant Payouts</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-body-md">
                  Successful dataset validations triggers smart payment protocols. Earnings are settled directly to active contributors in seconds.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#ffffff] mt-6 block tracking-widest font-semibold uppercase">
                USD Settled Engine
              </span>
            </div>

          </div>
        </section>

        {/* EXPERT / CALCULATORS & SIMULATORS SECTION */}
        <section id="experts" className="py-24">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2.5 block">
              MODEL YOUR ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Interactive Return Engines
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-body-md">
              Toggle between the Contributor Yield Engine to estimate Passive Royalties, or the Enterprise Simulator to calculate custom production cost savings.
            </p>

            {/* TAB SELECTORS */}
            <div className="inline-flex p-1 rounded bg-[#1e1c1c] border border-zinc-700 mt-8">
              <button 
                onClick={() => setActiveTab("expert")}
                className={`px-6 py-2 rounded text-xs font-bold tracking-wide transition-all duration-200 ${activeTab === "expert" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
              >
                For Contributors (Yields)
              </button>
              <button 
                onClick={() => setActiveTab("client")}
                className={`px-6 py-2 rounded text-xs font-bold tracking-wide transition-all duration-200 ${activeTab === "client" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
              >
                For AI Enterprises (Savings)
              </button>
            </div>
          </div>

          {/* INTERACTIVE CALCULATOR ENGINE */}
          <div className="max-w-5xl mx-auto">
            
            <div className="relative z-10 bg-[#1a1818] border border-zinc-700 rounded-xl p-6 sm:p-10 shadow-2xl">
              
              {/* TAB 1: EXPERT ROYALTY CALCULATOR */}
              {activeTab === "expert" && (
                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left: Sliders */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2 block">
                        ROYALTY ENGINE SIMULATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                        Earn Compounding Royalty Yields
                      </h3>
                      <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-body-md">
                        Slide to model your volume of task annotations and average resales to third-party AI enterprises on the Axiom Secondary Marketplace.
                      </p>
                    </div>

                    {/* Slider 1: Tasks Completed */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center font-mono">
                          Tasks Completed & Approved
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {expertTasks.toLocaleString('en-US')} <span className="text-xs text-zinc-500 font-normal">tasks</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="5000" 
                        step="50"
                        value={expertTasks}
                        onChange={(e) => setExpertTasks(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-300 rounded appearance-none cursor-pointer accent-[#1c1917]"
                        style={{
                          background: `linear-gradient(to right, #1c1917 0%, #1c1917 ${(expertTasks - 50) / 49.5}%, #e2dedc ${(expertTasks - 50) / 49.5}%, #e2dedc 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-semibold">
                        <span>50 TASKS</span>
                        <span>2,500</span>
                        <span>5,000 TASKS</span>
                      </div>
                    </div>

                    {/* Slider 2: Resales */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-end">
                        <label className="text-xs sm:text-sm font-semibold text-zinc-300 font-mono">
                          Marketplace Licensing Runs
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {expertResales} <span className="text-xs text-zinc-500 font-normal">runs</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        step="1"
                        value={expertResales}
                        onChange={(e) => setExpertResales(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-300 rounded appearance-none cursor-pointer accent-[#1c1917]"
                        style={{
                          background: `linear-gradient(to right, #1c1917 0%, #1c1917 ${(expertResales - 1) * 2.04}%, #e2dedc ${(expertResales - 1) * 2.04}%, #e2dedc 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-semibold">
                        <span>1 SALE</span>
                        <span>25 SALES</span>
                        <span>50 SALES</span>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-[#141313] border border-[#262626] rounded-xl p-4 text-xs text-zinc-400 mt-2 flex gap-3 items-start font-body-md">
                      <Info className="w-5 h-5 text-[#ffffff] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-zinc-200 block mb-1 font-mono">How is this compounding?</span>
                        Your validated datasets are fractionalized using secure ERC-1155 smart licenses. You maintain legal attribution, generating $3.50 every time an enterprise licenses that bundle into an active training run.
                      </div>
                    </div>
                  </div>

                  {/* Right: Summary Box */}
                  <div className="lg:col-span-5 bg-[#141313] border border-[#ffffff]/20 rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#ffffff] uppercase block mb-1">
                          PROJECTED YIELDS
                        </span>
                        <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-mono">
                          ESTIMATED PASSIVE PAYOUT
                        </h4>
                      </div>

                      {/* Large Number */}
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                          ${expertTotalEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-[11px] text-zinc-400 mt-1 block">
                          Compounding lifetime earnings yield
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#262626] text-xs font-mono">
                        <div className="flex justify-between text-zinc-400">
                          <span>Base Task Pay (Upfront):</span>
                          <span className="text-white font-semibold">${expertActiveEarnings.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Axiom Secondary Royalties:</span>
                          <span className="text-[#ffffff] font-semibold">${expertRoyaltyEarnings.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500 pt-2 border-t border-[#262626]">
                          <span>Traditional mechanical payout:</span>
                          <span className="line-through">${mturkBaselineEarnings.toLocaleString('en-US')}</span>
                        </div>
                      </div>

                      {/* Performance Badge */}
                      <div className="bg-[#ffffff]/10 border border-[#262626] rounded p-3 text-center mt-2">
                        <span className="text-xs text-[#ffffff] font-semibold block font-mono">
                          📈 {expertRoyaltyMultiplier}x Yield Performance
                        </span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">
                          Compared to legacy crowdsourced Mechanical Turk
                        </span>
                      </div>
                    </div>

                    <Link 
                      href="/signup?track=expert"
                      className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3.5 px-6 rounded transition-all duration-200 mt-8 uppercase tracking-wider text-xs font-mono text-center block"
                    >
                      Register Node Candidate
                    </Link>
                  </div>

                </div>
              )}

              {/* TAB 2: CLIENT SAVINGS CALCULATOR */}
              {activeTab === "client" && (
                <div id="clients" className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left: Sliders */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2 block">
                        COST REDUCTION SIMULATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                        Calculate Savings vs. Traditional Agencies
                      </h3>
                      <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-body-md">
                        Slide to input target dataset size and select complexity domain to simulate real cost benefits of Axiom versus legacy high-friction services firms.
                      </p>
                    </div>

                    {/* Slider 1: Dataset Size */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs sm:text-sm font-semibold text-zinc-300 font-mono">
                          Target Dataset Size
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {clientDataPoints.toLocaleString('en-US')} <span className="text-xs text-zinc-500 font-normal">records</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1000" 
                        max="250000" 
                        step="1000"
                        value={clientDataPoints}
                        onChange={(e) => setClientDataPoints(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-300 rounded appearance-none cursor-pointer accent-[#1c1917]"
                        style={{
                          background: `linear-gradient(to right, #1c1917 0%, #1c1917 ${(clientDataPoints - 1000) / 2490}%, #e2dedc ${(clientDataPoints - 1000) / 2490}%, #e2dedc 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-semibold">
                        <span>1,000</span>
                        <span>125,000</span>
                        <span>250,000 RECORDS</span>
                      </div>
                    </div>

                    {/* Domain Selectors */}
                    <div className="space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-zinc-300 block font-mono">
                        Domain Specialty & Complexity Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button 
                          onClick={() => handleComplexityChange(1.0)}
                          className={`p-3 rounded border text-center transition-all duration-200 ${complexityFactor === 1.0 ? "border-[#ffffff] bg-white/10 text-white shadow-sm font-bold" : "border-zinc-800 hover:border-zinc-700 text-zinc-400 bg-[#1a1818]"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 1</span>
                          <span className="text-xs font-bold block">General NLP</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(1.4)}
                          className={`p-3 rounded border text-center transition-all duration-200 ${complexityFactor === 1.4 ? "border-[#ffffff] bg-white/10 text-white shadow-sm font-bold" : "border-zinc-800 hover:border-zinc-700 text-zinc-400 bg-[#1a1818]"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 2</span>
                          <span className="text-xs font-bold block">Finance</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(2.2)}
                          className={`p-3 rounded border text-center transition-all duration-200 ${complexityFactor === 2.2 ? "border-[#ffffff] bg-white/10 text-white shadow-sm font-bold" : "border-zinc-800 hover:border-zinc-700 text-zinc-400 bg-[#1a1818]"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 3</span>
                          <span className="text-xs font-bold block">BioMedical</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(3.0)}
                          className={`p-3 rounded border text-center transition-all duration-200 ${complexityFactor === 3.0 ? "border-[#ffffff] bg-white/10 text-white shadow-sm font-bold" : "border-zinc-800 hover:border-zinc-700 text-zinc-400 bg-[#1a1818]"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 4</span>
                          <span className="text-xs font-bold block">Deep Tech</span>
                        </button>
                      </div>
                    </div>

                    {/* Comparison note */}
                    <div className="bg-[#141313] border border-[#262626] rounded-xl p-4 text-xs text-zinc-400 flex gap-3 items-start mt-2 font-body-md">
                      <Info className="w-5 h-5 text-[#ffffff] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-zinc-200 block mb-1 font-mono">Why is there such a massive gap?</span>
                        Services firms charge steep commissions for manager nodes, manual operations, and specialized recruiting. Axiom routes allocations algorithmically to peer-audited networks, stripping out middleman markups.
                      </div>
                    </div>
                  </div>

                  {/* Right: Summary Box */}
                  <div className="lg:col-span-5 bg-[#141313] border border-[#ffffff]/20 rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#ffffff] uppercase block mb-1">
                          SIMULATED METRICS
                        </span>
                        <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-wider font-mono">
                          NET ENTERPRISE SAVINGS
                        </h4>
                      </div>

                      {/* Large Savings Number */}
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                          ${clientNetSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-[11px] text-zinc-400 mt-1 block">
                          Savings vs Legacy Consulting Firms ({clientSavingsPercent}% Saved)
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#262626] text-xs font-mono">
                        <div className="flex justify-between text-zinc-400">
                          <span>Legacy Consulting Cost (Vetto):</span>
                          <span className="text-white font-semibold">${vettoCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Axiom Ecosystem Cost:</span>
                          <span className="text-[#ffffff] font-semibold">${axiomCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500 pt-2 border-t border-[#262626]">
                          <span>Setup / Onboarding Overhead:</span>
                          <span className="text-emerald-400 font-bold">$0.00 <span className="line-through text-zinc-600 font-normal">($15k agency fee)</span></span>
                        </div>
                      </div>

                      {/* Quality Assurance Badge */}
                      <div className="bg-[#ffffff]/10 border border-[#262626] rounded p-3 text-center mt-2">
                        <span className="text-xs text-[#ffffff] font-semibold block font-mono">
                          ⚡ 100% Validated Integrity & Zero Risk
                        </span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">
                          Every dataset is cryptographically validated and proven before delivery
                        </span>
                      </div>
                    </div>

                    <Link 
                      href="/signup?track=client"
                      className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3.5 px-6 rounded transition-all duration-200 mt-8 uppercase tracking-wider text-xs font-mono text-center block"
                    >
                      Estimate Custom Savings
                    </Link>
                  </div>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* PRICING & MATRIX SECTION */}
        <section id="pricing" className="py-24">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2.5 block">
              PRICING & PARADIGM SHIFT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              A Sovereign Paradigm Shift
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-body-md">
              Compare Axiom&apos;s decentralized protocol costs, speeds, and royalties against traditional high-friction services and crowdsourcing options.
            </p>
          </div>

          {/* Three Premium Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16 items-stretch">
            
            {/* Card 1: Shared Dataset Licensing */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-8 flex flex-col justify-between relative group overflow-hidden">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#ffffff] tracking-widest uppercase block mb-3">
                  COMMERCIAL SHARED
                </span>
                <h3 className="text-2xl font-bold text-white mb-1.5 font-display">Shared Dataset</h3>
                <p className="text-zinc-400 text-xs mb-6 font-normal leading-relaxed font-body-md">
                  Access compiled specialist datasets fractionalized using secure smart contract licenses.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-white font-mono">$0.50</span>
                  <span className="text-xs text-zinc-500 font-mono">/ data point</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-zinc-300 font-medium mb-8 font-body-md">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                    <span>Cryptographic proof of origin hash</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                    <span>Double-blind consensus verified</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                    <span>Differential Privacy compliance filter</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/signup?track=client"
                className="w-full bg-white text-black font-bold py-3.5 rounded text-xs font-mono uppercase tracking-wider text-center block hover:bg-zinc-200 transition-all"
              >
                License Dataset
              </Link>
            </div>

            {/* Card 2: Custom Specialist Sourcing */}
            <div className="bg-[#121212] border-2 border-[#ffffff]/50 rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-8 flex flex-col justify-between relative group overflow-hidden">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#ffffff] tracking-widest uppercase block mb-3">
                  ACCELERATED ADJUDICATION
                </span>
                <h3 className="text-2xl font-bold text-white mb-1.5 font-display">Specialist Sourcing</h3>
                <p className="text-zinc-400 text-xs mb-6 font-normal leading-relaxed font-body-md">
                  Design bespoke annotation and red-teaming tasks routed to high-yield specialist node queues.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black text-white font-mono">Custom Proposal</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-zinc-300 font-medium mb-8 font-body-md">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                    <span>Bespoke taxonomy & RLHF rulesets</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                    <span>Direct priority staking queues</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#ffffff] shrink-0" />
                    <span>Dedicated double-blind consensus checks</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/signup?track=client"
                className="w-full bg-white text-black font-bold py-3.5 rounded text-xs font-mono uppercase tracking-wider text-center block hover:bg-zinc-200 transition-all"
              >
                Initiate Proposal
              </Link>
            </div>

            {/* Card 3: Exclusive Buyout */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] transition-all duration-300 p-8 flex flex-col justify-between relative group overflow-hidden">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#10B981] tracking-widest uppercase block mb-3">
                  COMPLETE MONOPOLY IP
                </span>
                <h3 className="text-2xl font-bold text-white mb-1.5 font-display">Exclusive Buyout</h3>
                <p className="text-zinc-400 text-xs mb-6 font-normal leading-relaxed font-body-md">
                  Purchase absolute exclusive title and legal intellectual property keys for your dataset pool.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black text-white font-mono">Marketplace Locks</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-zinc-300 font-medium mb-8 font-body-md">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>ERC-1155 smart license buyout</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Complete dataset exclusion locks</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Attributed validation nodes payouts</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/signup?track=client"
                className="w-full bg-white text-black font-bold py-3.5 rounded text-xs font-mono uppercase tracking-wider text-center block hover:bg-zinc-200 transition-all"
              >
                Request IP Proposal
              </Link>
            </div>

          </div>

          {/* COMPARATIVE LANDSCAPE TABLE */}
          <div className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden max-w-6xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#141313] font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                    <th className="p-5 font-bold">Core Matrix Features</th>
                    <th className="p-5 font-bold">Legacy Consulting (Vetto)</th>
                    <th className="p-5 font-bold">Legacy Crowd (MTurk)</th>
                    <th className="p-5 font-bold bg-[#ffffff]/10 text-[#ffffff] font-semibold border-x border-[#262626]">
                      Axiom Protocol Layer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Secondary Marketplace Royalties</td>
                    <td className="p-5 text-zinc-500">❌ Zero (Agency retains all value)</td>
                    <td className="p-5 text-zinc-500">❌ Zero (Platform owns data)</td>
                    <td className="p-5 bg-[#ffffff]/5 border-x border-[#262626] font-semibold text-[#ffffff]">
                      <span className="flex items-center gap-1.5 font-mono">
                         Yes ($3.50 per license run)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Data Cost per Annotation</td>
                    <td className="p-5 text-zinc-400">$2.40 - $7.20 (Extremely Premium markup)</td>
                    <td className="p-5 text-zinc-400">$0.80 - $1.80 (Low quality overhead)</td>
                    <td className="p-5 bg-[#ffffff]/5 border-x border-[#262626] font-semibold text-[#ffffff]">
                      <span className="flex items-center gap-1.5 font-mono">
                         $0.50 (Unmatched programmatic cost)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Verification Engine</td>
                    <td className="p-5 text-zinc-400">Manual review loops (6-8 weeks)</td>
                    <td className="p-5 text-zinc-400">Basic algorithms (Spam vulnerability)</td>
                    <td className="p-5 bg-[#ffffff]/5 border-x border-[#262626] font-semibold text-[#ffffff]">
                      <span className="flex items-center gap-1.5 font-mono">
                         Peer-Audited Consensus
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Domain Expert Pool Level</td>
                    <td className="p-5 text-zinc-400">Limited (Slow manual recruitment)</td>
                    <td className="p-5 text-zinc-400">Generalists (Lacks specialized logic)</td>
                    <td className="p-5 bg-[#ffffff]/5 border-x border-[#262626] font-semibold text-[#ffffff]">
                      <span className="flex items-center gap-1.5 font-mono">
                         Decentralized Sovereign Nodes
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Cryptographic Data Provenance</td>
                    <td className="p-5 text-zinc-500">❌ None (Self-reporting contract)</td>
                    <td className="p-5 text-zinc-500">❌ None (Complete origin opacity)</td>
                    <td className="p-5 bg-[#ffffff]/5 border-x border-[#262626] font-semibold text-[#ffffff]">
                      <span className="flex items-center gap-1.5 font-mono">
                         On-Chain Origin Hash
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2.5 block">
              COMMUNITY TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Sovereign Nodes Speak Out
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-body-md">
              Read how contributors and enterprise architects alike are transforming their operations using Axiom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, index) => (
              <div 
                key={index} 
                className="bg-[#121212] border border-[#262626] rounded-xl hover:bg-[#1e293b] hover:border-[#ffffff]/50 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative group overflow-hidden"
              >
                <div className="text-[#ffffff] text-5xl font-serif leading-none mb-4 group-hover:scale-110 transition-transform select-none">&ldquo;</div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-body-md">
                  {test.quote}
                </p>
                <div className="flex items-center gap-4 border-t border-[#262626] pt-4">
                  <div className="w-10 h-10 rounded bg-[#141313] border border-[#262626] flex items-center justify-center font-bold text-[#ffffff] text-sm font-mono uppercase">
                    {test.avatarSeed.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">{test.author}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                      {test.role} · <span className="text-[#ffffff]">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="py-24">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2.5 block">
              COMMON QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-body-md">
              Explore deep technical details regarding smart fractional licensing, differential privacy algorithms, and Consensus QA rulesets.
            </p>
            
            {/* SEARCH AND FILTERS */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search protocol details..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full px-5 py-3.5 pl-11 rounded bg-[#141313] border border-[#262626] focus:border-[#ffffff] focus:outline-none text-xs sm:text-sm text-white font-medium transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0 font-mono">
                <button 
                  onClick={() => { setFaqCategory("all"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2 rounded text-xs font-bold transition-all ${faqCategory === "all" ? "bg-white text-black" : "bg-[#121212] border border-[#262626] text-zinc-400 hover:text-white"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setFaqCategory("expert"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2 rounded text-xs font-bold transition-all ${faqCategory === "expert" ? "bg-white text-black" : "bg-[#121212] border border-[#262626] text-zinc-400 hover:text-white"}`}
                >
                  Experts
                </button>
                <button 
                  onClick={() => { setFaqCategory("client"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2 rounded text-xs font-bold transition-all ${faqCategory === "client" ? "bg-white text-black" : "bg-[#121212] border border-[#262626] text-zinc-400 hover:text-white"}`}
                >
                  Clients
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index} 
                    className="bg-[#121212] border border-[#262626] hover:border-white/20 transition-all duration-300 rounded overflow-hidden"
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                    >
                      <span className="text-sm sm:text-base font-bold text-white pr-2 font-display">
                        {faq.question}
                      </span>
                      <span className="text-2xl font-mono text-[#ffffff] shrink-0 transition-transform duration-300 select-none" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                        +
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-[#262626] pt-4 font-body-md">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-500 font-mono text-[10px]">
                NO PROTOCOL RECORDS MATCHING YOUR QUERY
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM FINAL CONVERSION BLOCK */}
        <section className="py-16">
          <div className="relative rounded-xl bg-[#121212] border border-[#262626] p-8 sm:p-16 text-center max-w-5xl mx-auto">
            
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-3 block">
              IMMEDIATE PROTOCOL ENROLLMENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight font-display">
              Ready to Join the <br />
              <span className="text-zinc-500">Sovereign Data Layer?</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-body-lg">
              Claim your cryptographically signed validation node, or initiate an enterprise consultation to evaluate pipeline savings. Start building high-fidelity datasets today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link 
                href="/signup?track=expert"
                className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded font-bold hover:bg-zinc-200 transition-all text-center flex items-center justify-center"
              >
                Join as Expert
              </Link>
              <Link 
                href="/signup?track=client"
                className="w-full sm:w-auto bg-transparent border border-white/20 text-white hover:bg-white/5 px-8 py-4 rounded font-semibold transition-all text-center flex items-center justify-center"
              >
                Initiate Proposal
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#262626] bg-[#141313] z-20 relative py-12 text-xs text-zinc-500 font-mono">
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
