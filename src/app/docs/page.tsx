"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Wallet,
  Coins,
  Download,
  CreditCard,
  CheckCircle,
  HelpCircle,
  FileText,
  UserCheck,
  ChevronRight,
  Database,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";
import PublicFooter from "@/components/PublicFooter";

export default function DocsPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const categories = [
    { id: "getting-started", label: "Navigation & Overview", icon: Compass },
    { id: "expert-guide", label: "For Experts & Vetting", icon: UserCheck },
    { id: "client-guide", label: "For Clients & Datasets", icon: Database },
    { id: "wallets-payments", label: "Wallets & UPI Payments", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-[#e7e4ee] font-sans selection:bg-white/30 selection:text-white overflow-x-hidden relative">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-[-10%] right-[-12%] w-[55%] h-[45%] rounded-full bg-white/10 blur-[130px]" />
        <div className="absolute bottom-[15%] left-[-10%] w-[50%] h-[45%] rounded-full bg-[#A8A8A8]/5 blur-[140px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#080808]/80 backdrop-blur-xl border-b border-[#181818]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#121212] border border-[#181818] flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white font-display">
              AXIOM
            </span>
            <span className="text-[10px] tracking-widest bg-white/10 text-white px-2 py-0.5 rounded font-mono font-bold border border-white/10">
              SUPPORT
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#181818] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link
              href="/whitepaper"
              className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              Whitepaper
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-14 relative z-10 space-y-12">
        {/* Intro */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-white text-xs font-mono font-semibold border border-[#181818]">
            <BookOpen className="w-4 h-4" /> Axiom Knowledge Base &amp; Help Desk
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            How can we help you navigate Axiom Protocol?
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Find step-by-step documentation, user guides, and FAQs on connecting wallets, setting up instant payouts, configuring datasets, and completing onboarding challenges.
          </p>
        </section>

        {/* Tabbed Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">
              HELP CATEGORIES
            </p>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? "bg-white/10 text-white border-white/20 font-bold"
                        : "text-zinc-400 hover:text-white border-transparent hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/5 mt-6 text-xs text-zinc-400 space-y-2">
              <span className="font-bold text-white block">Need Live Help?</span>
              <p className="leading-relaxed">Our developer and triage teams are online to resolve queue issues.</p>
              <a
                href="mailto:support@axiom.ai"
                className="text-white hover:underline flex items-center gap-1 font-semibold"
              >
                support@axiom.ai <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </aside>

          {/* Right Panel Detailed Documentation Content */}
          <div className="lg:col-span-9 bg-[#121212] border border-[#181818] rounded-xl p-6 md:p-8 min-h-[500px]">
            {activeCategory === "getting-started" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Compass className="w-5 h-5 text-white" /> Navigation Guide &amp; Key Hubs
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">A high-level map of where everything lives on the platform.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white text-[9px] font-mono font-bold">
                      EXPERT PORTAL
                    </span>
                    <h3 className="text-sm font-bold text-white">Expert Workbench</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      If you are an approved data specialist, this is your home. Here you can claim active domain prompts, submit your reasoning dialogue tasks, and review automated AI calibration feedback logs.
                    </p>
                    <Link href="/expert" className="text-xs text-white font-semibold hover:underline inline-flex items-center gap-1">
                      Go to Workbench <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white text-[9px] font-mono font-bold">
                      ENTERPRISE MARKETPLACE
                    </span>
                    <h3 className="text-sm font-bold text-white">Enterprise Lab</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      AI laboratories and companies visit this hub to evaluate dataset pools, buy shared or exclusive licensing permissions, download structured JSONL files, and monitor training integrations.
                    </p>
                    <Link href="/client" className="text-xs text-white font-semibold hover:underline inline-flex items-center gap-1">
                      Go to Lab <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white text-[9px] font-mono font-bold">
                      BENCHMARKS INDEX
                    </span>
                    <h3 className="text-sm font-bold text-white">Model Leaderboard</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Compare the performance of top LLM architectures (like Llama, Claude, and GPT models) on specialized regional training data. Track language precision, latency, and consensus outputs.
                    </p>
                    <Link href="/leaderboard" className="text-xs text-white font-semibold hover:underline inline-flex items-center gap-1">
                      Go to Leaderboard <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white text-[9px] font-mono font-bold">
                      ADMIN CONSOLE
                    </span>
                    <h3 className="text-sm font-bold text-white">Operator Control Panel</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      The core dashboard for platform operators. Monitor BullMQ queue latencies, audit expert point allocations, verify Razorpay UPI transactions, and calibrate multi-model consensus bounds.
                    </p>
                    <Link href="/admin" className="text-xs text-white font-semibold hover:underline inline-flex items-center gap-1">
                      Go to Admin Panel <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "expert-guide" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-white" /> For Experts: Onboarding &amp; Vetting
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">A step-by-step guide to verifying credentials and claiming reasoning tasks.</p>
                </div>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white">Profile Creation &amp; Shortlist</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Sign up with your legal name, email, credentials, and Razorpay UPI VPA. Upon submission, Axiom allocates a standard tier matching your profile. If you have seeded emails, you are immediately approved. Otherwise, your node is marked as <strong className="text-white">Shortlisted</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white">Completing Vetting Challenges</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        If your status requires vetting, navigate to the <Link href="/vetting" className="text-white underline">Vetting Arena</Link> and click "Enter Vetting Arena". Complete the timed multiple-choice cognitive tests (Hinglish/Indic translations, specialized logical loops). Passing immediately activates your mainnet node.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white">Claiming Prompts &amp; Consensus Evaluation</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        In your Workbench, select an active dataset pool. Choose your task difficulty (1.0x to 2.0x multipliers) and input your prompt/response dialogue trace. Clicking "Submit" triggers our dual consensus engine (Llama-3b + GPT-4o). High score submissions route instant cash rewards to your UPI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "client-guide" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Database className="w-5 h-5 text-white" /> For Clients: Licensing &amp; Downloads
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Learn how to license high-fidelity training data and run fine-tuning pipelines.</p>
                </div>

                <div className="space-y-6">
                  {/* Purchase/License */}
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-bold text-white">1. Choose Your License Level</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Axiom offers two tiers of dataset licenses on the <Link href="/client" className="text-white underline">Client Portal</Link>:
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                      <li><strong className="text-white">Shared License</strong>: Grants permission to use the dataset for SFT training while leaving the data pool public for other labs to purchase.</li>
                      <li><strong className="text-white">Exclusive License</strong>: Grants full ownership of the data. Once bought, it is marked as "Exclusively Licensed" and pulled from the marketplace directory.</li>
                    </ul>
                  </div>

                  {/* Downloading Datasets */}
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-bold text-white">2. Downloading Formatted JSONL Data</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      After licensing a dataset pool, click on the **Download JSONL** button from your licensed inventory page. A clean, sanitised file containing system instructions, prompts, and verified reasoning responses will download directly.
                    </p>
                  </div>

                  {/* Fine-Tuning */}
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-bold text-white">3. Running OpenAI Supervised Fine-Tuning (SFT)</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Navigate to the **SFT Console** inside your Enterprise Lab. Select your purchased dataset, configure training hyperparameters (epochs, learning rate multiplier, base model target), and initialize the fine-tuning run. You will receive a simulated tracking ID and active progress metrics.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === "wallets-payments" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-white" /> Wallet Connection &amp; UPI Payouts
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Configuring Web3 credentials and Razorpay instant distributions.</p>
                </div>

                <div className="space-y-6">
                  {/* Web3 Wallet */}
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-bold text-white">1. Connecting Web3 Wallets</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Click the **Connect Wallet** button located in the top-right header section of the Expert or Client dashboards. You can link MetaMask, Coinbase Wallet, or any wallet supported via WalletConnect. This links your cryptographic address, enabling you to earn, verify, and receive recurring data-resale royalties on-chain.
                    </p>
                  </div>

                  {/* UPI / Razorpay */}
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-bold text-white">2. Linking Razorpay UPI VPAs</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Axiom uses Razorpay X to handle upfront cash transfers for claimed tasks. When updating your credentials inside the Expert onboarding modal, specify your UPI Virtual Payment Address (e.g. `name@upi` or `username@okaxis`).
                    </p>
                  </div>

                  {/* Royalties */}
                  <div className="p-5 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-white" />
                      <h3 className="text-sm font-bold text-white">3. Compounding Royalty Payouts</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Every time an enterprise purchaser licenses a dataset, a **5% royalty fee** is allocated to the contributors of that dataset. Payouts are split pro-rata based on the complexity points you earned. You can check your compounding dividends at any time in the **Royalties Ledger** inside the Expert Hub.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
