"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Cpu, 
  Database, 
  Key, 
  Check, 
  X, 
  Info, 
  Search
} from "lucide-react";

// Inline Custom SVGs for Branding and visual depth
const LogoIcon = () => (
  <svg className="w-9 h-9 text-[#5E5CE6] drop-shadow-[0_0_10px_rgba(94,92,230,0.6)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"expert" | "client">("expert");
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<"all" | "network" | "expert" | "client">("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Contributor/Expert Calculator States
  const [expertTasks, setExpertTasks] = useState(1200); // 50 to 5,000 tasks
  const [expertResales, setExpertResales] = useState(15); // 1 to 50 resales

  // Enterprise/Client Calculator States
  const [clientDataPoints, setClientDataPoints] = useState(75000); // 1,000 to 250,000
  const [complexityFactor, setComplexityFactor] = useState(1.4); // 1.0, 1.4, 2.2, 3.0

  // Form State for Modals
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittingState, setSubmittingState] = useState<"idle" | "verifying" | "success">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "general",
    details: "",
    nodeTier: "standard",
    termsAccepted: false,
  });
  const [cryptoHash, setCryptoHash] = useState("");

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

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStats((prev) => ({
        activeNodes: prev.activeNodes + (Math.random() > 0.7 ? 1 : 0),
        validatedData: prev.validatedData + Math.floor(Math.random() * 8) + 2,
        royaltiesPaid: prev.royaltiesPaid + Math.floor(Math.random() * 25) + 5,
        gasSaved: prev.gasSaved,
      }));
    }, 4000);
    return () => clearInterval(interval);
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

  // Handle lead capture submit
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.termsAccepted) return;

    setSubmittingState("verifying");
    
    setTimeout(() => {
      const hex = "0123456789abcdef";
      let generatedHash = "0x";
      for (let i = 0; i < 40; i++) {
        generatedHash += hex[Math.floor(Math.random() * 16)];
      }
      setCryptoHash(generatedHash);
      setSubmittingState("success");
      setFormSubmitted(true);
    }, 1800);
  };

  const resetForm = () => {
    setFormSubmitted(false);
    setSubmittingState("idle");
    setFormData({
      name: "",
      email: "",
      specialty: "general",
      details: "",
      nodeTier: "standard",
      termsAccepted: false,
    });
    setCryptoHash("");
  };

  const openFormModal = (type: "expert" | "client") => {
    setModalType(type);
    resetForm();
    setIsModalOpen(true);
  };

  // Filter FAQ based on search and category
  const filteredFaqs = faqItems.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = faqCategory === "all" || item.category === faqCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0e0e15] text-[#e7e4ee] font-sans selection:bg-[#5E5CE6]/30 selection:text-[#a5a5ff] overflow-x-hidden relative">
      
      {/* AMBIENT NEON GLOW DECORATIONS (Stitch MCP - Neon Nocturne Guidelines) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #5E5CE6 1px, transparent 1px), linear-gradient(to bottom, #5E5CE6 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Soft Tonal Ambient Shadows (No line rule) */}
        <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-[#5E5CE6]/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute top-[35%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#BF5AF2]/5 blur-[160px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[55%] h-[55%] rounded-full bg-[#0A84FF]/5 blur-[140px]" />
      </div>

      {/* PERSISTENT HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 w-full bg-[#0e0e15]/75 backdrop-blur-md transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-xl font-bold tracking-widest text-white font-mono bg-gradient-to-r from-white via-gray-100 to-[#5E5CE6] bg-clip-text text-transparent">
              AXIOM
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
            <a href="#about" className="hover:text-[#5E5CE6] transition-colors">About</a>
            <a href="#experts" className="hover:text-[#BF5AF2] transition-colors">Experts</a>
            <a href="#clients" className="hover:text-[#0A84FF] transition-colors">Clients</a>
            <a href="#pricing" className="hover:text-[#5E5CE6] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#BF5AF2] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/expert" 
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#5E5CE6] hover:text-white bg-[#5E5CE6]/10 hover:bg-[#5E5CE6]/25 border border-[#5E5CE6]/20 px-4 py-2.5 rounded-full transition-all duration-300"
            >
              Expert Hub
            </Link>
            <Link 
              href="/client" 
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A84FF] hover:text-white bg-[#0A84FF]/10 hover:bg-[#0A84FF]/25 border border-[#0A84FF]/20 px-4 py-2.5 rounded-full transition-all duration-300"
            >
              Enterprise Lab
            </Link>
            <Link 
              href="/admin" 
              className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-500/25 border border-violet-500/20 px-4 py-2.5 rounded-full transition-all duration-300"
            >
              Operator Core
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 text-center lg:text-left grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-[#5E5CE6]/10 px-4 py-2 rounded-full text-xs font-mono text-[#a5a5ff] self-center lg:self-start w-fit shadow-[0_0_15px_rgba(94,92,230,0.1)]">
              <span className="w-2 h-2 rounded-full bg-[#5E5CE6] animate-ping" />
              SOVEREIGN AI TRAINING DATA LAYER
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-display">
              Own the Data. <br />
              <span className="bg-gradient-to-r from-[#5E5CE6] via-[#0A84FF] to-[#BF5AF2] bg-clip-text text-transparent drop-shadow-sm">
                Train the Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Axiom connects elite domain specialists with leading AI laboratories to compile, validate, and license high-fidelity training data under cryptographic proof. Earn compounding royalties for every training dataset licensed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start pt-4">
              <button 
                onClick={() => openFormModal("expert")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-[#5E5CE6] to-[#BF5AF2] hover:brightness-110 transition-all duration-300 text-center shadow-[0_4px_25px_rgba(94,92,230,0.3)]"
              >
                Join as Expert
              </button>
              <a 
                href="#experts"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 text-center font-mono text-xs uppercase tracking-wider"
              >
                Simulate Returns
              </a>
            </div>

            {/* TRUSTED BY / TAGS */}
            <div className="pt-8 border-t border-white/[0.03] mt-4">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500 block mb-4">
                Engineered for Next-Gen Architectures
              </span>
              <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start items-center text-xs font-bold text-gray-400 font-mono">
                <span className="hover:text-[#5E5CE6] transition-all">RLHF Alignment</span>
                <span className="text-gray-700">•</span>
                <span className="hover:text-[#BF5AF2] transition-all">DPO Tuning</span>
                <span className="text-gray-700">•</span>
                <span className="hover:text-[#0A84FF] transition-all">Custom Red Teaming</span>
                <span className="text-gray-700">•</span>
                <span className="hover:text-[#5E5CE6] transition-all">Bilingual Reasoning</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC REAL-TIME STATS CARD */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#5E5CE6]/5 rounded-3xl blur-3xl z-0" />
            
            <div className="relative z-10 glass-panel rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#BF5AF2]/5 rounded-full blur-xl" />
              
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.03]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5E5CE6] animate-pulse" />
                  <span className="text-xs font-mono text-[#a5a5ff] uppercase tracking-widest font-semibold">
                    AXIOM DECENTRALIZED STACK
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">v2.4.0-PROD</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Active Expert Nodes
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.activeNodes.toLocaleString('en-US')}
                  </div>
                  <span className="text-[9px] text-[#5E5CE6] font-mono flex items-center gap-1 mt-1">
                    <span className="font-bold">↑</span> +12% this week
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Validated Tokens
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.validatedData.toLocaleString('en-US')}
                  </div>
                  <span className="text-[9px] text-[#BF5AF2] font-mono flex items-center gap-1 mt-1">
                    <span className="font-bold">↑</span> live streaming
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Royalties Distributed
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#5E5CE6] tracking-tight font-mono">
                    ${(networkStats.royaltiesPaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1 mt-1">
                    USD settlement layer
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider mb-1 font-mono">
                    Efficiency Gain
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.gasSaved.toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-[#0A84FF] font-mono mt-1 block">
                    vs consulting firms
                  </span>
                </div>
              </div>

              {/* Metric Pipeline Indicator */}
              <div className="mt-8 pt-6 border-t border-white/[0.03]">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mb-2">
                  <span>NETWORK METRIC PIPELINE</span>
                  <span className="text-[#a5a5ff]">STABLE CONSENSUS</span>
                </div>
                <div className="h-2 w-full bg-[#13131a] rounded-full overflow-hidden flex">
                  <div className="bg-[#5E5CE6] h-full" style={{ width: "65%" }}></div>
                  <div className="bg-[#BF5AF2] h-full animate-pulse-slow" style={{ width: "20%" }}></div>
                  <div className="bg-[#0A84FF] h-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT / PROTOCOL FEATURES SECTION */}
        <section id="about" className="py-24 relative overflow-hidden">
          {/* Subtle Glow Transition */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-[#5E5CE6]/5 to-transparent blur-[120px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5E5CE6] mb-2.5 block">
              AXIOM STACK SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Cryptographic Consensus Pipelines
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Axiom replaces administrative overhead with math. Explore the four core pillars of our high-integrity training network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_30px_rgba(94,92,230,0.1)] transition-all duration-500 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#5E5CE6]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-[#5E5CE6]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Consensus Validation</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Raw contributor outputs are processed through multiple layers of blind validator nodes. Slashing rules keep validators strictly honest and accurate.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#5E5CE6] mt-6 block tracking-widest font-semibold uppercase">
                Zero-Leakage Assurance
              </span>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_30px_rgba(191,90,242,0.1)] transition-all duration-500 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#BF5AF2]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-6 h-6 text-[#BF5AF2]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Fractional Ownership</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Datasets are fractionalized using secure smart licensing protocols. You maintain sovereign custody and secure continuous secondary income.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#BF5AF2] mt-6 block tracking-widest font-semibold uppercase">
                ERC-1155 Smart License
              </span>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_30px_rgba(10,132,255,0.1)] transition-all duration-500 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0A84FF]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6 text-[#0A84FF]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Structured DP</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Built-in mathematical models automatically mask individual variables, preventing corporate dataset leakage or alignment reverse-engineering.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#0A84FF] mt-6 block tracking-widest font-semibold uppercase">
                DP-SGD Compliance
              </span>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_30px_rgba(94,92,230,0.1)] transition-all duration-500 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#5E5CE6]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Key className="w-6 h-6 text-[#5E5CE6]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Instant Payouts</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Successful dataset validations triggers smart payment protocols. Earnings are settled directly to active contributors in seconds.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#5E5CE6] mt-6 block tracking-widest font-semibold uppercase">
                USD Settled Engine
              </span>
            </div>

          </div>
        </section>

        {/* EXPERT / CALCULATORS & SIMULATORS SECTION */}
        <section id="experts" className="py-24 relative overflow-hidden">
          {/* Subtle Glow Transition */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-[#BF5AF2]/5 to-transparent blur-[120px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#BF5AF2] mb-2.5 block">
              MODEL YOUR ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Interactive Return Engines
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Toggle between the Contributor Yield Engine to estimate Passive Royalties, or the Enterprise Simulator to calculate custom production cost savings.
            </p>

            {/* TAB SELECTORS */}
            <div className="inline-flex p-1.5 rounded-full bg-[#13131a] border border-white/5 shadow-inner mt-8">
              <button 
                onClick={() => setActiveTab("expert")}
                className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === "expert" ? "bg-[#5E5CE6] text-white shadow-lg shadow-[#5E5CE6]/25" : "text-gray-400 hover:text-gray-200"}`}
              >
                For Contributors (Yields)
              </button>
              <button 
                onClick={() => setActiveTab("client")}
                className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === "client" ? "bg-[#BF5AF2] text-white shadow-lg shadow-[#BF5AF2]/25" : "text-gray-400 hover:text-gray-200"}`}
              >
                For AI Enterprises (Savings)
              </button>
            </div>
          </div>

          {/* INTERACTIVE CALCULATOR ENGINE */}
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute inset-0 bg-[#5E5CE6]/5 rounded-3xl blur-2xl z-0" />
            
            <div className="relative z-10 glass-panel rounded-3xl p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
              
              {/* TAB 1: EXPERT ROYALTY CALCULATOR */}
              {activeTab === "expert" && (
                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left: Sliders */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5E5CE6] mb-2 block">
                        ROYALTY ENGINE SIMULATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                        Earn Compounding Royalty Yields
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        Slide to model your volume of task annotations and average resales to third-party AI enterprises on the Axiom Secondary Marketplace.
                      </p>
                    </div>

                    {/* Slider 1: Tasks Completed */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs sm:text-sm font-semibold text-gray-300 flex items-center font-mono">
                          Tasks Completed & Approved
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {expertTasks.toLocaleString('en-US')} <span className="text-xs text-gray-500 font-normal">tasks</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="5000" 
                        step="50"
                        value={expertTasks}
                        onChange={(e) => setExpertTasks(Number(e.target.value))}
                        className="w-full h-2 bg-[#13131a] rounded-lg appearance-none cursor-pointer accent-[#5E5CE6]"
                        style={{
                          background: `linear-gradient(to right, #5E5CE6 0%, #5E5CE6 ${(expertTasks - 50) / 49.5}%, #13131a ${(expertTasks - 50) / 49.5}%, #13131a 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 font-mono font-semibold">
                        <span>50 TASKS</span>
                        <span>2,500</span>
                        <span>5,000 TASKS</span>
                      </div>
                    </div>

                    {/* Slider 2: Resales */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-end">
                        <label className="text-xs sm:text-sm font-semibold text-gray-300 font-mono">
                          Marketplace Licensing Runs
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {expertResales} <span className="text-xs text-gray-500 font-normal">runs</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        step="1"
                        value={expertResales}
                        onChange={(e) => setExpertResales(Number(e.target.value))}
                        className="w-full h-2 bg-[#13131a] rounded-lg appearance-none cursor-pointer accent-[#5E5CE6]"
                        style={{
                          background: `linear-gradient(to right, #5E5CE6 0%, #5E5CE6 ${(expertResales - 1) * 2.04}%, #13131a ${(expertResales - 1) * 2.04}%, #13131a 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 font-mono font-semibold">
                        <span>1 SALE</span>
                        <span>25 SALES</span>
                        <span>50 SALES</span>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-[#13131a]/60 rounded-2xl p-4 text-xs text-gray-400 mt-2 flex gap-3 items-start">
                      <Info className="w-5 h-5 text-[#5E5CE6] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-200 block mb-1 font-mono">How is this compounding?</span>
                        Your validated datasets are fractionalized using secure ERC-1155 smart licenses. You maintain legal attribution, generating $3.50 every time an enterprise locks that bundle into an active training run.
                      </div>
                    </div>
                  </div>

                  {/* Right: Summary Box */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#13131a]/80 to-[#5E5CE6]/5 border border-[#5E5CE6]/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#5E5CE6]/[0.02] rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#5E5CE6] uppercase block mb-1">
                          PROJECTED YIELDS
                        </span>
                        <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider font-mono">
                          ESTIMATED PASSIVE PAYOUT
                        </h4>
                      </div>

                      {/* Large Number */}
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-[#5E5CE6] tracking-tight font-mono drop-shadow-[0_0_10px_rgba(94,92,230,0.3)]">
                          ${expertTotalEarnings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          Compounding lifetime earnings yield
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/[0.03] text-xs">
                        <div className="flex justify-between text-gray-400 font-mono">
                          <span>Base Task Pay (Upfront):</span>
                          <span className="text-white font-semibold">${expertActiveEarnings.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 font-mono">
                          <span>Axiom Secondary Royalties:</span>
                          <span className="text-[#a5a5ff] font-semibold">${expertRoyaltyEarnings.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 pt-2 border-t border-white/[0.03] font-mono">
                          <span>Traditional mechanical payout:</span>
                          <span className="line-through">${mturkBaselineEarnings.toLocaleString('en-US')}</span>
                        </div>
                      </div>

                      {/* Performance Badge */}
                      <div className="bg-[#5E5CE6]/10 border border-[#5E5CE6]/20 rounded-xl p-3 text-center mt-2">
                        <span className="text-xs text-[#a5a5ff] font-semibold block font-mono">
                          📈 {expertRoyaltyMultiplier}x Yield Performance
                        </span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">
                          Compared to legacy crowsourced Mechanical Turk
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => openFormModal("expert")}
                      className="w-full bg-[#5E5CE6] hover:bg-[#6c6af7] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(94,92,230,0.3)] mt-8 uppercase tracking-wider text-xs font-mono"
                    >
                      Register Node Candidate
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: CLIENT SAVINGS CALCULATOR */}
              {activeTab === "client" && (
                <div id="clients" className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left: Sliders */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#BF5AF2] mb-2 block">
                        COST REDUCTION SIMULATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                        Calculate Savings vs. Traditional Agencies
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        Slide to input target dataset size and select complexity domain to simulate real cost benefits of Axiom versus legacy high-friction services firms.
                      </p>
                    </div>

                    {/* Slider 1: Dataset Size */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs sm:text-sm font-semibold text-gray-300 font-mono">
                          Target Dataset Size
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {clientDataPoints.toLocaleString('en-US')} <span className="text-xs text-gray-500 font-normal">records</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1000" 
                        max="250000" 
                        step="1000"
                        value={clientDataPoints}
                        onChange={(e) => setClientDataPoints(Number(e.target.value))}
                        className="w-full h-2 bg-[#13131a] rounded-lg appearance-none cursor-pointer accent-[#BF5AF2]"
                        style={{
                          background: `linear-gradient(to right, #BF5AF2 0%, #BF5AF2 ${(clientDataPoints - 1000) / 2490}%, #13131a ${(clientDataPoints - 1000) / 2490}%, #13131a 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 font-mono font-semibold">
                        <span>1,000</span>
                        <span>125,000</span>
                        <span>250,000 RECORDS</span>
                      </div>
                    </div>

                    {/* Domain Selectors */}
                    <div className="space-y-3">
                      <label className="text-xs sm:text-sm font-semibold text-gray-300 block font-mono">
                        Domain Specialty & Complexity Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button 
                          onClick={() => handleComplexityChange(1.0)}
                          className={`p-3 rounded-xl border text-center transition-all duration-300 ${complexityFactor === 1.0 ? "border-[#BF5AF2] bg-[#BF5AF2]/10 text-white shadow-sm" : "border-white/5 hover:border-white/10 text-gray-400 bg-[#13131a]/40"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 1</span>
                          <span className="text-xs font-bold block">General NLP</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(1.4)}
                          className={`p-3 rounded-xl border text-center transition-all duration-300 ${complexityFactor === 1.4 ? "border-[#BF5AF2] bg-[#BF5AF2]/10 text-white shadow-sm" : "border-white/5 hover:border-white/10 text-gray-400 bg-[#13131a]/40"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 2</span>
                          <span className="text-xs font-bold block">Finance</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(2.2)}
                          className={`p-3 rounded-xl border text-center transition-all duration-300 ${complexityFactor === 2.2 ? "border-[#BF5AF2] bg-[#BF5AF2]/10 text-white shadow-sm" : "border-white/5 hover:border-white/10 text-gray-400 bg-[#13131a]/40"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 3</span>
                          <span className="text-xs font-bold block">BioMedical</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(3.0)}
                          className={`p-3 rounded-xl border text-center transition-all duration-300 ${complexityFactor === 3.0 ? "border-[#BF5AF2] bg-[#BF5AF2]/10 text-white shadow-sm" : "border-white/5 hover:border-white/10 text-gray-400 bg-[#13131a]/40"}`}
                        >
                          <span className="text-[9px] font-mono block mb-1">LEVEL 4</span>
                          <span className="text-xs font-bold block">Deep Tech</span>
                        </button>
                      </div>
                    </div>

                    {/* Comparison note */}
                    <div className="bg-[#13131a]/60 rounded-2xl p-4 text-xs text-gray-400 flex gap-3 items-start mt-2">
                      <Info className="w-5 h-5 text-[#BF5AF2] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-200 block mb-1 font-mono">Why is there such a massive gap?</span>
                        Services firms (like Vetto) charge steep commissions for manager nodes, manual operations, and specialized recruiting. Axiom routes allocations algorithmically to peer-audited networks, stripping out middleman markups.
                      </div>
                    </div>
                  </div>

                  {/* Right: Summary Box */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-[#13131a]/80 to-[#BF5AF2]/5 border border-[#BF5AF2]/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#BF5AF2]/[0.02] rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#BF5AF2] uppercase block mb-1">
                          SIMULATED METRICS
                        </span>
                        <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider font-mono">
                          NET ENTERPRISE SAVINGS
                        </h4>
                      </div>

                      {/* Large Savings Number */}
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-[#BF5AF2] tracking-tight font-mono drop-shadow-[0_0_10px_rgba(191,90,242,0.3)]">
                          ${clientNetSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          Savings vs Legacy Consulting Firms ({clientSavingsPercent}% Saved)
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/[0.03] text-xs">
                        <div className="flex justify-between text-gray-400 font-mono">
                          <span>Legacy Consulting Cost (Vetto):</span>
                          <span className="text-white font-semibold">${vettoCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 font-mono">
                          <span>Axiom Ecosystem Cost:</span>
                          <span className="text-[#c974fa] font-semibold">${axiomCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 pt-2 border-t border-white/[0.03] font-mono">
                          <span>Setup / Onboarding Overhead:</span>
                          <span className="text-emerald-400 font-bold">$0.00 <span className="line-through text-gray-600 font-normal">($15k agency fee)</span></span>
                        </div>
                      </div>

                      {/* Quality Assurance Badge */}
                      <div className="bg-[#BF5AF2]/10 border border-[#BF5AF2]/20 rounded-xl p-3 text-center mt-2">
                        <span className="text-xs text-[#c974fa] font-semibold block font-mono">
                          ⚡ 100% Validated Integrity & Zero Risk
                        </span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">
                          Every dataset is cryptographically validated and proven before delivery
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => openFormModal("client")}
                      className="w-full bg-[#BF5AF2] hover:bg-[#c974fa] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(191,90,242,0.3)] mt-8 uppercase tracking-wider text-xs font-mono"
                    >
                      Estimate Custom Savings
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* PRICING & MATRIX SECTION */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          {/* Subtle Glow Transition */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-[#0A84FF]/5 to-transparent blur-[120px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0A84FF] mb-2.5 block">
              PRICING & PARADIGM SHIFT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              A Sovereign Paradigm Shift
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Compare Axiom&apos;s decentralized protocol costs, speeds, and royalties against traditional high-friction services and crowdsourcing options.
            </p>
          </div>

          {/* Three Premium Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16 items-stretch">
            
            {/* Card 1: Shared Dataset Licensing */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_40px_rgba(94,92,230,0.15)] transition-all duration-500 rounded-3xl p-8 flex flex-col justify-between relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#5E5CE6]/[0.02] rounded-full blur-2xl" />
              <div>
                <span className="text-[10px] font-mono font-bold text-[#5E5CE6] tracking-widest uppercase block mb-3">
                  COMMERCIAL SHARED
                </span>
                <h3 className="text-2xl font-bold text-white mb-1.5 font-display">Shared Dataset</h3>
                <p className="text-gray-400 text-xs mb-6 font-normal leading-relaxed">
                  Access compiled specialist datasets fractionalized using secure smart contract licenses.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-white font-mono">$0.50</span>
                  <span className="text-xs text-gray-500 font-mono">/ data point</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-gray-300 font-medium mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#5E5CE6] shrink-0" />
                    <span>Cryptographic proof of origin hash</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#5E5CE6] shrink-0" />
                    <span>Double-blind consensus verified</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#5E5CE6] shrink-0" />
                    <span>Differential Privacy compliance filter</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => openFormModal("client")}
                className="w-full bg-[#5E5CE6] hover:bg-[#6c6af7] text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-xs font-mono uppercase tracking-wider shadow-[0_4px_15px_rgba(94,92,230,0.2)]"
              >
                License Dataset
              </button>
            </div>

            {/* Card 2: Custom Specialist Sourcing */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_40px_rgba(191,90,242,0.2)] transition-all duration-500 rounded-3xl p-8 flex flex-col justify-between relative group overflow-hidden border border-[#BF5AF2]/20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#BF5AF2]/[0.03] rounded-full blur-2xl" />
              <div>
                <span className="text-[10px] font-mono font-bold text-[#BF5AF2] tracking-widest uppercase block mb-3">
                  ACCELERATED ADJUDICATION
                </span>
                <h3 className="text-2xl font-bold text-white mb-1.5 font-display">Specialist Sourcing</h3>
                <p className="text-gray-400 text-xs mb-6 font-normal leading-relaxed">
                  Design bespoke annotation and red-teaming tasks routed to high-yield specialist node queues.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black text-white font-mono">Custom Proposal</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-gray-300 font-medium mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#BF5AF2] shrink-0" />
                    <span>Bespoke taxonomy & RLHF rulesets</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#BF5AF2] shrink-0" />
                    <span>Direct priority staking queues</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#BF5AF2] shrink-0" />
                    <span>Dedicated double-blind consensus checks</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => openFormModal("client")}
                className="w-full bg-[#BF5AF2] hover:bg-[#c974fa] text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-xs font-mono uppercase tracking-wider shadow-[0_4px_15px_rgba(191,90,242,0.2)]"
              >
                Initiate Proposal
              </button>
            </div>

            {/* Card 3: Exclusive Buyout */}
            <div className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_40px_rgba(10,132,255,0.15)] transition-all duration-500 rounded-3xl p-8 flex flex-col justify-between relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0A84FF]/[0.02] rounded-full blur-2xl" />
              <div>
                <span className="text-[10px] font-mono font-bold text-[#0A84FF] tracking-widest uppercase block mb-3">
                  COMPLETE MONOPOLY IP
                </span>
                <h3 className="text-2xl font-bold text-white mb-1.5 font-display">Exclusive Buyout</h3>
                <p className="text-gray-400 text-xs mb-6 font-normal leading-relaxed">
                  Purchase absolute exclusive title and legal intellectual property keys for your dataset pool.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black text-white font-mono">Marketplace Locks</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-gray-300 font-medium mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0A84FF] shrink-0" />
                    <span>ERC-1155 smart license buyout</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0A84FF] shrink-0" />
                    <span>Complete dataset exclusion locks</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0A84FF] shrink-0" />
                    <span>Attributed validation nodes payouts</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => openFormModal("client")}
                className="w-full bg-[#0A84FF] hover:bg-[#3fa1ff] text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-xs font-mono uppercase tracking-wider shadow-[0_4px_15px_rgba(10,132,255,0.2)]"
              >
                Request IP Proposal
              </button>
            </div>

          </div>

          {/* COMPARATIVE LANDSCAPE TABLE */}
          <div className="bg-[#13131a]/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur shadow-2xl max-w-6xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#13131a]/80 font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    <th className="p-5 font-bold">Core Matrix Features</th>
                    <th className="p-5 font-bold">Legacy Consulting (Vetto)</th>
                    <th className="p-5 font-bold">Legacy Crowd (MTurk)</th>
                    <th className="p-5 font-bold bg-[#5E5CE6]/10 text-[#a5a5ff] font-semibold border-x border-[#5E5CE6]/15">
                      Axiom Protocol Layer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-white/[0.02]">
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Secondary Marketplace Royalties</td>
                    <td className="p-5 text-gray-500">❌ Zero (Agency retains all value)</td>
                    <td className="p-5 text-gray-500">❌ Zero (Platform owns data)</td>
                    <td className="p-5 bg-[#5E5CE6]/5 border-x border-[#5E5CE6]/10 font-semibold text-[#a5a5ff]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Check className="w-3.5 h-3.5 text-[#5E5CE6]" /> Yes ($3.50 per license run)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Data Cost per Annotation</td>
                    <td className="p-5 text-gray-400">$2.40 - $7.20 (Extremely Premium markup)</td>
                    <td className="p-5 text-gray-400">$0.80 - $1.80 (Low quality overhead)</td>
                    <td className="p-5 bg-[#5E5CE6]/5 border-x border-[#5E5CE6]/10 font-semibold text-[#a5a5ff]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Check className="w-3.5 h-3.5 text-[#5E5CE6]" /> $0.50 (Unmatched programmatic cost)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Verification Engine</td>
                    <td className="p-5 text-gray-400">Manual review loops (6-8 weeks)</td>
                    <td className="p-5 text-gray-400">Basic algorithms (Spam vulnerability)</td>
                    <td className="p-5 bg-[#5E5CE6]/5 border-x border-[#5E5CE6]/10 font-semibold text-[#a5a5ff]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Check className="w-3.5 h-3.5 text-[#5E5CE6]" /> Peer-Audited Consensus
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Domain Expert Pool Level</td>
                    <td className="p-5 text-gray-400">Limited (Slow manual recruitment)</td>
                    <td className="p-5 text-gray-400">Generalists (Lacks specialized logic)</td>
                    <td className="p-5 bg-[#5E5CE6]/5 border-x border-[#5E5CE6]/10 font-semibold text-[#a5a5ff]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Check className="w-3.5 h-3.5 text-[#5E5CE6]" /> Decentralized Sovereign Nodes
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-semibold text-white">Cryptographic Data Provenance</td>
                    <td className="p-5 text-gray-500">❌ None (Self-reporting contract)</td>
                    <td className="p-5 text-gray-500">❌ None (Complete origin opacity)</td>
                    <td className="p-5 bg-[#5E5CE6]/5 border-x border-[#5E5CE6]/10 font-semibold text-[#a5a5ff]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Check className="w-3.5 h-3.5 text-[#5E5CE6]" /> On-Chain Origin Hash
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24 relative overflow-hidden">
          {/* Subtle Glow Transition */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-[#5E5CE6]/5 to-transparent blur-[120px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5E5CE6] mb-2.5 block">
              COMMUNITY TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Sovereign Nodes Speak Out
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Read how contributors and enterprise architects alike are transforming their operations using Axiom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, index) => (
              <div 
                key={index} 
                className="glass-panel hover:bg-[#13131a]/60 hover:shadow-[0_0_30px_rgba(94,92,230,0.08)] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative hover:border-[#5E5CE6]/20 transition-all duration-500 group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#5E5CE6]/[0.01] rounded-full blur-xl" />
                <div className="text-[#5E5CE6] text-5xl font-serif leading-none mb-4 group-hover:scale-110 transition-transform select-none">&ldquo;</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-normal">
                  {test.quote}
                </p>
                <div className="flex items-center gap-4 border-t border-white/[0.03] pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#5E5CE6]/10 border border-[#5E5CE6]/30 flex items-center justify-center font-bold text-[#a5a5ff] text-sm font-mono uppercase">
                    {test.avatarSeed.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">{test.author}</h4>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">
                      {test.role} · <span className="text-[#a5a5ff]">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="py-24 relative overflow-hidden">
          {/* Subtle Glow Transition */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-[#BF5AF2]/5 to-transparent blur-[120px] pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#BF5AF2] mb-2.5 block">
              COMMON QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
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
                  className="w-full px-5 py-3.5 pl-11 rounded-xl bg-[#13131a]/80 border border-white/5 focus:border-[#BF5AF2] focus:outline-none text-xs sm:text-sm text-white font-medium transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0 font-mono">
                <button 
                  onClick={() => { setFaqCategory("all"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${faqCategory === "all" ? "bg-[#BF5AF2] text-white shadow-lg shadow-[#BF5AF2]/25" : "bg-[#13131a] border border-white/5 text-gray-400 hover:text-white"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setFaqCategory("expert"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${faqCategory === "expert" ? "bg-[#BF5AF2] text-white shadow-lg shadow-[#BF5AF2]/25" : "bg-[#13131a] border border-white/5 text-gray-400 hover:text-white"}`}
                >
                  Experts
                </button>
                <button 
                  onClick={() => { setFaqCategory("client"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${faqCategory === "client" ? "bg-[#BF5AF2] text-white shadow-lg shadow-[#BF5AF2]/25" : "bg-[#13131a] border border-white/5 text-gray-400 hover:text-white"}`}
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
                    className="bg-[#13131a]/30 border border-white/5 hover:border-white/10 transition-all duration-300 rounded-2xl overflow-hidden shadow-inner"
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                    >
                      <span className="text-sm sm:text-base font-bold text-white pr-2 font-display">
                        {faq.question}
                      </span>
                      <span className="text-2xl font-mono text-[#BF5AF2] shrink-0 transition-transform duration-300 select-none" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                        +
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/[0.02] pt-4 font-normal">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 font-mono text-[10px]">
                NO PROTOCOL RECORDS MATCHING YOUR QUERY
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM FINAL CONVERSION BLOCK */}
        <section className="py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0e0e15] via-[#13131a] to-[#5E5CE6]/10 border border-white/5 p-8 sm:p-16 text-center shadow-3xl overflow-hidden max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-[#5E5CE6]/[0.02] pointer-events-none" />
            
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5E5CE6] mb-3 block">
              IMMEDIATE PROTOCOL ENROLLMENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight font-display">
              Ready to Join the <br />
              <span className="bg-gradient-to-r from-[#5E5CE6] to-[#BF5AF2] bg-clip-text text-transparent">
                Sovereign Data Layer?
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              Claim your cryptographically signed validation node, or initiate an enterprise consultation to evaluate pipeline savings. Start building high-fidelity datasets today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button 
                onClick={() => openFormModal("expert")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-[#5E5CE6] to-[#BF5AF2] hover:brightness-110 transition-all duration-300 text-center shadow-[0_4px_20px_rgba(94,92,230,0.35)]"
              >
                Join as Expert
              </button>
              <button 
                onClick={() => openFormModal("client")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 text-center font-mono text-xs uppercase tracking-wider"
              >
                Initiate Proposal
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.03] bg-[#0e0e15]/90 backdrop-blur z-20 relative py-12 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-base font-bold text-white tracking-widest font-mono">
              AXIOM
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-[10px]">
            <span>© 2026 Axiom Protocol Layer. All rights reserved.</span>
            <span className="text-gray-800">|</span>
            <a href="#" className="hover:text-[#5E5CE6] transition-colors">Terminals</a>
            <span className="text-gray-800">|</span>
            <a href="#" className="hover:text-[#BF5AF2] transition-colors">Privacy Ledger</a>
            <span className="text-gray-800">|</span>
            <a href="#" className="hover:text-[#0A84FF] transition-colors">Whitepaper v2.4</a>
          </div>

          <div className="flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-[#5E5CE6] animate-pulse" />
            <span className="text-[10px] text-gray-400 font-bold tracking-wider font-mono">
              ALL PROTOCOL NODES OPERATIONAL
            </span>
          </div>
        </div>
      </footer>

      {/* INTERACTIVE LEAD CAPTURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Background Blur Overlay */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-[#0e0e15] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9)] z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5E5CE6]/[0.02] rounded-full blur-2xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-white/[0.03]">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#5E5CE6] uppercase block mb-1">
                  SECURE REGISTER INTERFACE
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                  {modalType === "expert" ? "Claim Contributor Node License" : "Initiate Custom Dataset Proposal"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body / Submitting State */}
            {submittingState === "verifying" && (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                  {/* Glowing spinner */}
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin border-[#5E5CE6]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white font-mono uppercase tracking-wider animate-pulse">
                    MINTING CREDENTIALS...
                  </h4>
                  <p className="text-xs text-gray-500 font-mono">
                    Generating cryptographic handshake keys on the Axiom layer
                  </p>
                </div>
              </div>
            )}

            {/* Modal Body / Success Screen */}
            {submittingState === "success" && formSubmitted && (
              <div className="py-10 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="text-center space-y-2">
                  <h4 className="text-lg sm:text-xl font-bold text-white font-display">
                    Registration Securely Authenticated
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Your candidate credentials have been generated and signed. A network steward will initiate manual validation shortly.
                  </p>
                </div>

                {/* Cryptographic hash badge */}
                <div className="bg-[#13131a] border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs shadow-inner">
                  <div className="flex justify-between items-center text-gray-500 border-b border-white/[0.03] pb-2">
                    <span>SECURITY RECORD DETAILS</span>
                    <span className="text-emerald-400 font-semibold">VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">AUTHENTICATED IDENTITY:</span>
                    <span className="text-white font-bold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">STATED EMAIL ADDR:</span>
                    <span className="text-white font-bold">{formData.email}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-white/[0.03]">
                    <span className="text-gray-500">MINTED REGISTRATION HASH:</span>
                    <span className="text-[#a5a5ff] font-bold break-all font-mono">
                      {cryptoHash}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(cryptoHash);
                      alert("Cryptographic hash copied to clipboard!");
                    }}
                    className="w-1/2 py-3 border border-white/10 hover:border-white/20 bg-[#13131a] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all font-mono"
                  >
                    Copy Auth Hash
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-3 bg-gradient-to-r from-[#5E5CE6] to-[#BF5AF2] text-white rounded-xl text-xs font-bold transition-all hover:brightness-110"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body / Active Form */}
            {submittingState === "idle" && (
              <form onSubmit={handleLeadSubmit} className="space-y-5 pt-4">
                
                {/* Switch modal type dynamically within the modal */}
                <div className="grid grid-cols-2 p-1 bg-[#13131a] rounded-xl border border-white/5 mb-2 font-mono">
                  <button 
                    type="button"
                    onClick={() => setModalType("expert")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 ${modalType === "expert" ? "bg-[#5E5CE6] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Expert Node
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalType("client")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 ${modalType === "client" ? "bg-[#BF5AF2] text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Enterprise Client
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                    Full Legal Identity / Corporate Name
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dr. Ada Lovelace"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[#13131a]/80 border border-white/5 text-sm text-white focus:outline-none focus:border-[#5E5CE6] font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                    Secure Communications Address (Email)
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="ada@axiom.network"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[#13131a]/80 border border-white/5 text-sm text-white focus:outline-none focus:border-[#5E5CE6] font-medium transition-colors"
                  />
                </div>

                {modalType === "expert" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                          Primary Domain
                        </label>
                        <select 
                          value={formData.specialty}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-[#13131a] border border-white/5 text-sm text-white focus:outline-none focus:border-[#5E5CE6] font-semibold cursor-pointer"
                        >
                          <option value="general">General Language</option>
                          <option value="medical">BioMedicine & Immunology</option>
                          <option value="finance">Quantitative Finance</option>
                          <option value="legal">Legal & Compliance</option>
                          <option value="code">Multi-Turn Software Eng</option>
                          <option value="quantum">Quantum & Chemistry</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                          Staking Level
                        </label>
                        <select 
                          value={formData.nodeTier}
                          onChange={(e) => setFormData(prev => ({ ...prev, nodeTier: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-[#13131a] border border-white/5 text-sm text-white focus:outline-none focus:border-[#5E5CE6] font-semibold cursor-pointer"
                        >
                          <option value="standard">Standard Node (0 Stake)</option>
                          <option value="validated">Premium Node (Active Stake)</option>
                          <option value="consensus">Steward Node (High Stake)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                        Validation Bio & Credentials (Optional)
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Brief summary of your academic or corporate credentials..."
                        value={formData.details}
                        onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-[#13131a]/80 border border-white/5 text-sm text-white focus:outline-none focus:border-[#5E5CE6] font-medium resize-none transition-colors"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                          Model Architecture
                        </label>
                        <select 
                          value={formData.specialty}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-[#13131a] border border-white/5 text-sm text-white focus:outline-none focus:border-[#BF5AF2] font-semibold cursor-pointer"
                        >
                          <option value="general">Transformer / LLM</option>
                          <option value="medical">Diffusion / Vision Model</option>
                          <option value="finance">Reinforcement Agent</option>
                          <option value="legal">Mixture of Experts (MoE)</option>
                          <option value="code">Proprietary Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                          Urgency Level
                        </label>
                        <select 
                          value={formData.nodeTier}
                          onChange={(e) => setFormData(prev => ({ ...prev, nodeTier: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-[#13131a] border border-white/5 text-sm text-white focus:outline-none focus:border-[#BF5AF2] font-semibold cursor-pointer"
                        >
                          <option value="standard">Standard (5 - 7 Days)</option>
                          <option value="validated">Accelerated (48 Hours)</option>
                          <option value="consensus">Immediate Sprint (24 Hours)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                        Dataset Specifications
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Provide details on the type of data annotation, alignment, or evaluations required..."
                        value={formData.details}
                        onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-[#13131a]/80 border border-white/5 text-sm text-white focus:outline-none focus:border-[#BF5AF2] font-medium resize-none transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Terms checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="termsAccepted"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 w-4 h-4 rounded border-white/15 text-[#5E5CE6] bg-[#13131a] focus:ring-[#5E5CE6]/20 cursor-pointer focus:ring-2"
                  />
                  <label htmlFor="termsAccepted" className="text-[11px] text-gray-400 leading-normal cursor-pointer select-none">
                    I authorize Axiom to authenticate these details under public key encryption standards and generate custom protocol configurations. I agree to the Node Terms of Engagement.
                  </label>
                </div>

                <button 
                  type="submit"
                  className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 font-mono text-xs uppercase tracking-widest mt-2 ${modalType === "expert" ? "bg-[#5E5CE6] text-white hover:bg-[#6c6af7] shadow-[0_4px_15px_rgba(94,92,230,0.2)]" : "bg-[#BF5AF2] text-white hover:bg-[#c974fa] shadow-[0_4px_15px_rgba(191,90,242,0.2)]"}`}
                >
                  {modalType === "expert" ? "Claim Contributor Key" : "Generate Custom proposal"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
