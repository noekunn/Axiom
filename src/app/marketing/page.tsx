"use client";

import React, { useState, useEffect } from "react";

// Inline SVG Icon components for zero-dependency reliability and instant Tailwind styling
const LogoIcon = () => (
  <svg className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CpuIcon = () => (
  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5 text-emerald-400" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6 text-gray-400 hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4 text-emerald-400 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
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

export default function MarketingPage() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<"expert" | "client">("expert");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"expert" | "client">("expert");
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<"all" | "network" | "expert" | "client">("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Contributor/Expert Calculator States
  const [expertTasks, setExpertTasks] = useState(500); // 50 to 5,000 tasks
  const [expertResales, setExpertResales] = useState(12); // 1 to 50 resales

  // Enterprise/Client Calculator States
  const [clientDataPoints, setClientDataPoints] = useState(50000); // 1,000 to 250,005
  const [complexityFactor, setComplexityFactor] = useState(1.4); // 1.0, 1.4, 2.2, 3.0
  const [complexityName, setComplexityName] = useState("Finance & E-commerce");

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
  // Legacy Service Agency (Vetto) base cost per data point is $2.40, plus $15,000 onboarding fee
  const vettoBasePerPoint = 2.40;
  const vettoSetupFee = 15000;
  const vettoCost = (clientDataPoints * vettoBasePerPoint * complexityFactor) + vettoSetupFee;

  // Axiom Cost: Base cost is $0.48 per point + $0.02 validator network charge = $0.50 flat. Zero setup fee.
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
  const handleComplexityChange = (factor: number, name: string) => {
    setComplexityFactor(factor);
    setComplexityName(name);
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
    
    // Simulate smart contract interactions or node licensing
    setTimeout(() => {
      // Create a pseudo-random cryptographic hash matching Axiom credentials
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
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden relative">
      
      {/* GLOWING GRIDS & RADIAL MASKS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Custom inline grid system using CSS */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Neon radial glow spots */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[35%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/5 blur-[150px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/60 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-xl font-bold tracking-widest text-white font-mono bg-gradient-to-r from-white via-gray-100 to-emerald-400 bg-clip-text text-transparent">
              AXIOM
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <a href="#calculators" className="hover:text-emerald-400 transition-colors">Yield Engine</a>
            <a href="#comparisons" className="hover:text-emerald-400 transition-colors">Axiom vs Legacy</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Protocol Architecture</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => openFormModal("client")} 
              className="text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-full border border-gray-800 hover:border-gray-600 transition-all font-medium"
            >
              Enterprise Demo
            </button>
            <button 
              onClick={() => openFormModal("expert")}
              className="text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-5 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300/20"
            >
              Claim Node
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* HERO SECTION */}
        <section className="pt-20 pb-16 text-center lg:text-left grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-4 py-1.5 rounded-full text-xs font-mono text-emerald-400 self-center lg:self-start w-fit shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SOVEREIGN AI TRAINING DATA NETWORK
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Own the Data. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent drop-shadow-sm">
                Train the Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Axiom connects elite domain specialists with leading AI models to compile, validate, and license high-fidelity training data under cryptographic proof. Earn compounding royalties for every training dataset licensed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start pt-4">
              <button 
                onClick={() => openFormModal("expert")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 transition-all duration-300 text-center shadow-[0_4px_20px_rgba(52,211,153,0.35)]"
              >
                Claim Expert Node
              </button>
              <a 
                href="#calculators"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 bg-gray-950/40 hover:bg-gray-900/60 transition-all duration-300 text-center backdrop-blur"
              >
                Simulate Returns
              </a>
            </div>

            {/* TRUSTED BY / TAGS */}
            <div className="pt-8 border-t border-gray-900/80 mt-4">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500 block mb-4">
                Engineered for Next-Gen Architectures
              </span>
              <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start items-center text-sm font-semibold text-gray-400">
                <span className="hover:text-emerald-400 transition-all font-mono">RLHF Alignment</span>
                <span className="text-gray-700">•</span>
                <span className="hover:text-emerald-400 transition-all font-mono">DPO Tuning</span>
                <span className="text-gray-700">•</span>
                <span className="hover:text-emerald-400 transition-all font-mono">Custom Red Teaming</span>
                <span className="text-gray-700">•</span>
                <span className="hover:text-emerald-400 transition-all font-mono">Multi-Turn Code validation</span>
              </div>
            </div>
          </div>

          {/* HERO GRAPHIC / REAL-TIME STATS CARD */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-3xl z-0" />
            
            <div className="relative z-10 bg-gray-900/40 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
              
              <div className="flex items-center justify-between pb-6 border-b border-gray-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                    AXIOM DECENTRALIZED STACK
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-500">v1.0.8-PROD</span>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div>
                  <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-1">
                    Active Expert Nodes
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.activeNodes.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                    <span className="text-emerald-400 font-bold">↑</span> +12% this week
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-1">
                    Validated Tokens
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.validatedData.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                    <span className="text-emerald-400 font-bold">↑</span> live streaming
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-1">
                    Royalties Distributed
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
                    ${(networkStats.royaltiesPaid / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-1">
                    USD settlement layer
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block uppercase tracking-wider mb-1">
                    Efficiency Gain
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {networkStats.gasSaved.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                    vs consulting firms
                  </span>
                </div>
              </div>

              {/* Minimalist Graphic simulation */}
              <div className="mt-8 pt-6 border-t border-gray-800/60">
                <div className="flex justify-between items-center text-xs text-gray-500 font-mono mb-2">
                  <span>NETWORK METRIC PIPELINE</span>
                  <span className="text-emerald-400">STABLE CONSENSUS</span>
                </div>
                <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500/80 animate-[pulse_1.5s_infinite] h-full" style={{ width: "65%" }}></div>
                  <div className="bg-emerald-400/50 h-full" style={{ width: "20%" }}></div>
                  <div className="bg-emerald-600/30 h-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE TAB SYSTEM & CALCULATORS */}
        <section id="calculators" className="pt-24 pb-16 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Model Your Advantage
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Toggle between the Contributor Yield Engine to estimate Passive Royalties, or the Enterprise Simulator to calculate custom production cost savings.
            </p>

            {/* TAB SELECTORS */}
            <div className="inline-flex p-1.5 rounded-full bg-gray-900 border border-gray-800 shadow-inner mt-8">
              <button 
                onClick={() => setActiveTab("expert")}
                className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === "expert" ? "bg-emerald-400 text-gray-950 shadow-lg" : "text-gray-400 hover:text-gray-200"}`}
              >
                For Contributors (Yields)
              </button>
              <button 
                onClick={() => setActiveTab("client")}
                className={`px-6 sm:px-8 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === "client" ? "bg-emerald-400 text-gray-950 shadow-lg" : "text-gray-400 hover:text-gray-200"}`}
              >
                For AI Enterprises (Savings)
              </button>
            </div>
          </div>

          {/* CALCULATOR AREA */}
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl blur-2xl z-0" />
            
            <div className="relative z-10 bg-gray-950/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
              
              {/* TAB 1: EXPERT ROYALTY CALCULATOR */}
              {activeTab === "expert" && (
                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Sliders */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
                        ROYALTY ENGINE SIMULATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Earn Compounding Royalty Yields
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        Slide to model your volume of task annotations and average resales to third-party AI enterprises on the Axiom Secondary Marketplace.
                      </p>
                    </div>

                    {/* Slider 1: Tasks Completed */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-300 flex items-center">
                          Total Validation Tasks Completed
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {expertTasks.toLocaleString()} <span className="text-xs text-gray-500 font-normal">tasks</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="5000" 
                        step="50"
                        value={expertTasks}
                        onChange={(e) => setExpertTasks(Number(e.target.value))}
                        className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${(expertTasks - 50) / 49.5}%, #111827 ${(expertTasks - 50) / 49.5}%, #111827 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                        <span>50 TASKS</span>
                        <span>2,500</span>
                        <span>5,000 TASKS</span>
                      </div>
                    </div>

                    {/* Slider 2: Resales */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-300">
                          Average Marketplace Resales / Licensing Deals
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {expertResales} <span className="text-xs text-gray-500 font-normal">times</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        step="1"
                        value={expertResales}
                        onChange={(e) => setExpertResales(Number(e.target.value))}
                        className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${(expertResales - 1) * 2.04}%, #111827 ${(expertResales - 1) * 2.04}%, #111827 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                        <span>1 SALE</span>
                        <span>25 SALES</span>
                        <span>50 SALES</span>
                      </div>
                    </div>

                    {/* Mini Information Card */}
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 text-xs text-gray-400 mt-2 flex gap-3 items-start">
                      <InfoIcon />
                      <div>
                        <span className="font-semibold text-gray-200 block mb-1">How is this compounding?</span>
                        Your validated datasets are fractionalized using secure ERC-1155 smart licenses. You maintain legal attribution, generating $3.50 every time an enterprise locks that bundle into an active pre-training or fine-tuning run.
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Earnings Summary Card */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-gray-900/80 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block mb-1">
                          PROJECTED ROYALTIES
                        </span>
                        <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                          ESTIMATED PASSIVE YIELD
                        </h4>
                      </div>

                      {/* Total Number */}
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                          ${expertTotalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">
                          Compounding lifetime earnings yield
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-800/80 text-xs">
                        <div className="flex justify-between text-gray-400">
                          <span>Base Task Pay (Immediate):</span>
                          <span className="text-white font-mono font-semibold">${expertActiveEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Axiom Secondary Royalties:</span>
                          <span className="text-emerald-300 font-mono font-semibold">${expertRoyaltyEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-900/60">
                          <span>Traditional crowdsource pays:</span>
                          <span className="font-mono line-through">${mturkBaselineEarnings.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Multiplier Badge */}
                      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3.5 text-center mt-2">
                        <span className="text-xs text-emerald-400 font-semibold block">
                          📈 {expertRoyaltyMultiplier}x Yield Performance
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Compared to legacy crowdsource networks (like Mechanical Turk)
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => openFormModal("expert")}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.2)] mt-8 uppercase tracking-wider text-xs"
                    >
                      Register Node Candidate
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: CLIENT SAVINGS CALCULATOR */}
              {activeTab === "client" && (
                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Sliders */}
                  <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
                        COST REDUCTION SIMULATOR
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Calculate Savings vs. Traditional Agencies
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        Slide to input target dataset size and select complexity domain to simulate real cost benefits of Axiom versus legacy high-friction services firms.
                      </p>
                    </div>

                    {/* Slider 1: Dataset size */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-300">
                          Target Dataset Size (Data Points)
                        </label>
                        <span className="text-xl font-bold font-mono text-white">
                          {clientDataPoints.toLocaleString()} <span className="text-xs text-gray-500 font-normal">records</span>
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1000" 
                        max="250000" 
                        step="1000"
                        value={clientDataPoints}
                        onChange={(e) => setClientDataPoints(Number(e.target.value))}
                        className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${(clientDataPoints - 1000) / 2490}%, #111827 ${(clientDataPoints - 1000) / 2490}%, #111827 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                        <span>1,000</span>
                        <span>125,000</span>
                        <span>250,000 RECORDS</span>
                      </div>
                    </div>

                    {/* Domain Selectors */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-300 block">
                        Domain Specialty & Complexity Level
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button 
                          onClick={() => handleComplexityChange(1.0, "General NLP & Web")}
                          className={`p-3 rounded-xl border text-center transition-all ${complexityFactor === 1.0 ? "border-emerald-400 bg-emerald-950/20 text-white shadow-sm" : "border-gray-800 hover:border-gray-700 text-gray-400 bg-gray-900/30"}`}
                        >
                          <span className="text-[10px] font-mono block mb-1">LEVEL 1</span>
                          <span className="text-xs font-bold block">General NLP</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(1.4, "Finance & E-commerce")}
                          className={`p-3 rounded-xl border text-center transition-all ${complexityFactor === 1.4 ? "border-emerald-400 bg-emerald-950/20 text-white shadow-sm" : "border-gray-800 hover:border-gray-700 text-gray-400 bg-gray-900/30"}`}
                        >
                          <span className="text-[10px] font-mono block mb-1">LEVEL 2</span>
                          <span className="text-xs font-bold block">Finance</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(2.2, "BioMed & Regulatory")}
                          className={`p-3 rounded-xl border text-center transition-all ${complexityFactor === 2.2 ? "border-emerald-400 bg-emerald-950/20 text-white shadow-sm" : "border-gray-800 hover:border-gray-700 text-gray-400 bg-gray-900/30"}`}
                        >
                          <span className="text-[10px] font-mono block mb-1">LEVEL 3</span>
                          <span className="text-xs font-bold block">BioMedical</span>
                        </button>
                        <button 
                          onClick={() => handleComplexityChange(3.0, "Deep Tech & Quantum")}
                          className={`p-3 rounded-xl border text-center transition-all ${complexityFactor === 3.0 ? "border-emerald-400 bg-emerald-950/20 text-white shadow-sm" : "border-gray-800 hover:border-gray-700 text-gray-400 bg-gray-900/30"}`}
                        >
                          <span className="text-[10px] font-mono block mb-1">LEVEL 4</span>
                          <span className="text-xs font-bold block">Deep Tech</span>
                        </button>
                      </div>
                    </div>

                    {/* Mini comparison tag */}
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 text-xs text-gray-400 flex gap-3 items-start mt-2">
                      <InfoIcon />
                      <div>
                        <span className="font-semibold text-gray-200 block mb-1">Why is there such a massive gap?</span>
                        Services firms (like Vetto) charge steep commissions for manager nodes, manual operations, and specialized recruiting. Axiom routes allocations algorithmically to peer-audited networks, stripping out middleman markups.
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Savings Summary Card */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-gray-900/80 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block mb-1">
                          SIMULATED METRICS
                        </span>
                        <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                          NET ENTERPRISE SAVINGS
                        </h4>
                      </div>

                      {/* Savings Yield */}
                      <div>
                        <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono">
                          ${clientNetSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">
                          Savings vs Legacy Consulting Firms ({clientSavingsPercent}% Saved)
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-800/80 text-xs">
                        <div className="flex justify-between text-gray-400">
                          <span>Legacy Consulting Cost (Vetto):</span>
                          <span className="font-mono font-semibold">${vettoCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Axiom Ecosystem Cost:</span>
                          <span className="text-emerald-300 font-mono font-semibold">${axiomCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-900/60">
                          <span>Setup / Onboarding Overhead:</span>
                          <span className="font-mono text-emerald-400/90 font-semibold">$0.00 <span className="line-through text-gray-600 font-normal">($15k agency fee)</span></span>
                        </div>
                      </div>

                      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-3.5 text-center mt-2">
                        <span className="text-xs text-emerald-400 font-semibold block">
                          ⚡ 100% Validated Integrity & Zero Risk
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Every dataset is cryptographically validated and proven before delivery
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => openFormModal("client")}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.2)] mt-8 uppercase tracking-wider text-xs"
                    >
                      Estimate Custom Savings
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* ECOSYSTEM VALUE COMPARISONS TABLE */}
        <section id="comparisons" className="pt-20 pb-16 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
              competitive landscape
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              A Sovereign Paradigm Shift
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              See how the Axiom Decentralized Protocol stacks up against traditional services firms (like Vetto) and old legacy crowdsourcing systems.
            </p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800/80 rounded-3xl overflow-hidden backdrop-blur shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800/80 bg-gray-950/60 font-mono text-xs text-gray-400 uppercase">
                    <th className="p-5 font-semibold">Core Matrix Features</th>
                    <th className="p-5 font-semibold">Legacy Consulting (Vetto)</th>
                    <th className="p-5 font-semibold">Legacy Crowd (MTurk)</th>
                    <th className="p-5 font-semibold bg-emerald-950/20 text-emerald-400 border-x border-emerald-900/50">
                      Axiom Protocol Layer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-900/65">
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-medium text-white">Secondary Marketplace Royalties</td>
                    <td className="p-5 text-gray-500">❌ Zero (Agency retains all value)</td>
                    <td className="p-5 text-gray-500">❌ Zero (Platform owns data)</td>
                    <td className="p-5 bg-emerald-950/10 border-x border-emerald-900/30">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400" /> Yes ($3.50 per license run)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-medium text-white">Data Cost per Annotation</td>
                    <td className="p-5 text-gray-400">$2.40 - $7.20 (Extremely Premium markup)</td>
                    <td className="p-5 text-gray-400">$0.80 - $1.80 (Low quality overhead)</td>
                    <td className="p-5 bg-emerald-950/10 border-x border-emerald-900/30">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400" /> $0.50 (Unmatched programmatic cost)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-medium text-white">Verification Engine</td>
                    <td className="p-5 text-gray-400">Manual review loops (6-8 weeks)</td>
                    <td className="p-5 text-gray-400">Basic algorithms (Spam vulnerability)</td>
                    <td className="p-5 bg-emerald-950/10 border-x border-emerald-900/30">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400" /> Peer-Audited Consensus
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-medium text-white">Domain Expert Pool Level</td>
                    <td className="p-5 text-gray-400">Limited (Slow manual recruitment)</td>
                    <td className="p-5 text-gray-400">Generalists (Lacks specialized logic)</td>
                    <td className="p-5 bg-emerald-950/10 border-x border-emerald-900/30">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400" /> Decentralized Sovereign Nodes
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 font-medium text-white">Cryptographic Data Provenance</td>
                    <td className="p-5 text-gray-500">❌ None (Self-reporting contract)</td>
                    <td className="p-5 text-gray-500">❌ None (Complete origin opacity)</td>
                    <td className="p-5 bg-emerald-950/10 border-x border-emerald-900/30">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-400" /> On-Chain Origin Hash
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CORE ARCHITECTURE / FEATURE GRID */}
        <section id="features" className="pt-20 pb-16 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
              AXIOM STACK SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Cryptographic Consensus Pipelines
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Axiom replaces administrative overhead with math. Explore the four core pillars of our high-integrity training network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-gray-900/20 border border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-950/[0.03] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <ShieldIcon />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Consensus Validation</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Raw contributor outputs are processed through multiple layers of blind validator nodes. Slashing rules keep validators strictly honest and accurate.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-6 block tracking-widest font-semibold uppercase">
                Zero-Leakage Assurance
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/20 border border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-950/[0.03] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <CpuIcon />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Fractional Ownership</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Datasets are fractionalized using secure smart licensing protocols. You maintain sovereign custody and secure continuous secondary income.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-6 block tracking-widest font-semibold uppercase">
                ERC-1155 Smart License
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/20 border border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-950/[0.03] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <DatabaseIcon />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Structured Differential Privacy</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Built-in mathematical models automatically mask individual variables, preventing corporate dataset leakage or alignment reverse-engineering.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-6 block tracking-widest font-semibold uppercase">
                DP-SGD Pipeline Compliance
              </span>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900/20 border border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-950/[0.03] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <KeyIcon />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">Instant Micropayments</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Successful dataset validations triggers smart payment protocols. Earnings are settled directly to active contributors in seconds.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-6 block tracking-widest font-semibold uppercase">
                USD Settled Engine
              </span>
            </div>

          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
              COMMUNITY TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Sovereign Nodes Speak Out
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Read how contributors and enterprise architects alike are transforming their operations using Axiom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, index) => (
              <div 
                key={index} 
                className="bg-gray-900/20 border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="text-emerald-500 text-4xl font-serif leading-none mb-4">“</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-normal">
                  {test.quote}
                </p>
                <div className="flex items-center gap-4 border-t border-gray-800/40 pt-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm font-mono uppercase">
                    {test.avatarSeed.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{test.author}</h4>
                    <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">
                      {test.role} · <span className="text-emerald-400">{test.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section id="faq" className="pt-20 pb-16 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
              COMMON QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Can&apos;t find what you&apos;re looking for? Search below or reach out to the core team.
            </p>
            
            {/* SEARCH AND FILTERS */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
              <input 
                type="text" 
                placeholder="Search protocol details..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-gray-900 border border-gray-800 focus:border-emerald-400 focus:outline-none text-sm text-white font-medium"
              />
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
                <button 
                  onClick={() => { setFaqCategory("all"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqCategory === "all" ? "bg-emerald-400 text-gray-950" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setFaqCategory("expert"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqCategory === "expert" ? "bg-emerald-400 text-gray-950" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
                >
                  Experts
                </button>
                <button 
                  onClick={() => { setFaqCategory("client"); setOpenFaqIndex(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqCategory === "client" ? "bg-emerald-400 text-gray-950" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
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
                    className="bg-gray-900/10 border border-gray-800/80 hover:border-gray-800 transition-all duration-300 rounded-2xl overflow-hidden"
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                    >
                      <span className="text-base font-bold text-white pr-2">
                        {faq.question}
                      </span>
                      <span className="text-2xl font-mono text-emerald-400 shrink-0 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                        +
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-gray-800/40 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 font-mono text-xs">
                NO PROTOCOL RECORDS MATCHING YOUR QUERY
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM FINAL CONVERSION BLOCK */}
        <section className="pt-16 pb-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/20 border border-emerald-500/10 p-8 sm:p-16 text-center shadow-3xl overflow-hidden max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none blur-3xl" />

            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-3 block">
              IMMEDIATE PROTOCOL ENROLLMENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              Ready to Join the <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Sovereign Data Layer?
              </span>
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
              Claim your cryptographically signed validation node, or initiate an enterprise consultation to evaluate pipeline savings. Start building high-fidelity datasets today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button 
                onClick={() => openFormModal("expert")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-950 bg-emerald-400 hover:bg-emerald-300 transition-all duration-300 text-center shadow-[0_4px_20px_rgba(52,211,153,0.35)]"
              >
                Claim Contributor Node
              </button>
              <button 
                onClick={() => openFormModal("client")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-gray-300 hover:text-white border border-gray-800 hover:border-gray-600 bg-gray-950/40 hover:bg-gray-900/60 transition-all duration-300 text-center backdrop-blur"
              >
                Initiate Proposal
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 bg-gray-950/80 backdrop-blur z-20 relative py-12 text-sm text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="text-base font-bold text-white tracking-widest">
              AXIOM
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-xs">
            <span>© 2026 Axiom Protocol Layer. All rights reserved.</span>
            <span className="text-gray-800">|</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terminals</a>
            <span className="text-gray-800">|</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Ledger</a>
            <span className="text-gray-800">|</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Whitepaper v2.4</a>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-gray-400 font-semibold tracking-wider">
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
          <div className="relative w-full max-w-xl bg-gray-950 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9)] z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-900">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block mb-1">
                  SECURE REGISTER INTERFACE
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {modalType === "expert" ? "Claim Contributor Node License" : "Initiate Custom Dataset Proposal"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body / Submitting State */}
            {submittingState === "verifying" && (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                  {/* Glowing spinner */}
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-950" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white font-mono uppercase tracking-wider animate-pulse">
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
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                  <CheckIcon className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold text-white">
                    Registration Securely Authenticated
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Your candidate credentials have been generated and signed. A network steward will initiate manual validation shortly.
                  </p>
                </div>

                {/* Cryptographic hash badge */}
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-4 space-y-3 font-mono text-[10px] sm:text-xs">
                  <div className="flex justify-between items-center text-gray-500 border-b border-gray-850 pb-2">
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
                  <div className="flex flex-col gap-1 pt-1 border-t border-gray-900">
                    <span className="text-gray-500">MINTED REGISTRATION HASH:</span>
                    <span className="text-emerald-400 font-bold break-all font-mono">
                      {cryptoHash}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      // copy hash to clipboard simulation
                      navigator.clipboard?.writeText(cryptoHash);
                      alert("Cryptographic hash copied to clipboard!");
                    }}
                    className="w-1/2 py-3 border border-gray-850 hover:border-gray-700 bg-gray-950 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all font-mono"
                  >
                    Copy Auth Hash
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-3 bg-emerald-400 hover:bg-emerald-300 text-gray-950 rounded-xl text-xs font-bold transition-all"
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
                <div className="grid grid-cols-2 p-1 bg-gray-900 rounded-xl border border-gray-850 mb-2">
                  <button 
                    type="button"
                    onClick={() => setModalType("expert")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${modalType === "expert" ? "bg-emerald-400 text-gray-950 shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    Expert Contributor Node
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalType("client")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${modalType === "client" ? "bg-emerald-400 text-gray-950 shadow-sm" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    AI Enterprise Client
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                {modalType === "expert" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                          Primary Domain Specialty
                        </label>
                        <select 
                          value={formData.specialty}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-semibold"
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
                          Desired Staking Level
                        </label>
                        <select 
                          value={formData.nodeTier}
                          onChange={(e) => setFormData(prev => ({ ...prev, nodeTier: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-semibold"
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
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                          Target AI Model Architecture
                        </label>
                        <select 
                          value={formData.specialty}
                          onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-semibold"
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
                          Annotation Urgency Level
                        </label>
                        <select 
                          value={formData.nodeTier}
                          onChange={(e) => setFormData(prev => ({ ...prev, nodeTier: e.target.value }))}
                          className="w-full px-3 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-semibold"
                        >
                          <option value="standard">Standard (5 - 7 Days)</option>
                          <option value="validated">Accelerated (48 Hours)</option>
                          <option value="consensus">Immediate Sprint (24 Hours)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 block mb-1.5 font-mono uppercase tracking-wider">
                        Dataset Specifications / Target Complexity Details
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Provide details on the type of data annotation, alignment, or evaluations required..."
                        value={formData.details}
                        onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-medium resize-none"
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
                    className="mt-1 w-4 h-4 rounded border-gray-800 text-emerald-500 bg-gray-900 focus:ring-emerald-500/20 cursor-pointer focus:ring-2"
                  />
                  <label htmlFor="termsAccepted" className="text-[11px] text-gray-400 leading-normal cursor-pointer select-none">
                    I authorize Axiom to authenticate these details under public key encryption standards and generate custom protocol configurations. I agree to the Node Terms of Engagement.
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-gray-950 font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(52,211,153,0.2)] font-mono text-xs uppercase tracking-widest mt-2"
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
