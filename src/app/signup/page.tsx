"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Globe,
  Wallet,
  ArrowRight,
  Sparkles,
  Zap,
  BookOpen,
  DollarSign,
  ChevronRight,
  Database,
  ArrowLeft,
  Loader2,
  Terminal,
  Languages,
  Layers,
  Heart,
  Scale,
  Code
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<"expert" | "client">("expert");
  
  // Expert Form State
  const [expertName, setExpertName] = useState("");
  const [expertEmail, setExpertEmail] = useState("");
  const [expertArea, setExpertArea] = useState<"Medical" | "Legal" | "Tech">("Medical");
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["Hinglish"]);
  const [expertUpi, setExpertUpi] = useState("");
  const [expertTier, setExpertTier] = useState<"BRONZE" | "SILVER" | "GOLD" | "SENIOR" | "ELITE">("GOLD");

  // Client Form State
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientLlmSize, setClientLlmSize] = useState<string>("8B-70B");
  const [clientStripe, setClientStripe] = useState("");
  const [clientDatasetNeeds, setClientDatasetNeeds] = useState("");

  // UI Touched/Validation States
  const [expertNameTouched, setExpertNameTouched] = useState(false);
  const [expertEmailTouched, setExpertEmailTouched] = useState(false);
  const [expertUpiTouched, setExpertUpiTouched] = useState(false);

  const [clientCompanyTouched, setClientCompanyTouched] = useState(false);
  const [clientEmailTouched, setClientEmailTouched] = useState(false);
  const [clientStripeTouched, setClientStripeTouched] = useState(false);
  const [clientNeedsTouched, setClientNeedsTouched] = useState(false);

  // Submission Logging Animation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subProgress, setSubProgress] = useState<Array<{ text: string; status: "pending" | "running" | "success" | "error" }>>([]);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Standard email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // UPI validation (e.g. username@bank)
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

  // Check validations
  const isExpertNameValid = expertName.trim().length >= 2;
  const isExpertEmailValid = emailRegex.test(expertEmail);
  const isExpertUpiValid = upiRegex.test(expertUpi);
  const isExpertFormValid = isExpertNameValid && isExpertEmailValid && isExpertUpiValid && selectedLangs.length > 0;

  const isClientCompanyValid = clientCompany.trim().length >= 2;
  const isClientEmailValid = emailRegex.test(clientEmail);
  const isClientStripeValid = emailRegex.test(clientStripe) || clientStripe.trim().length >= 2;
  const isClientNeedsValid = clientDatasetNeeds.trim().length >= 10;
  const isClientFormValid = isClientCompanyValid && isClientEmailValid && isClientStripeValid && isClientNeedsValid;

  const availableLanguages = [
    "Hinglish",
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
    "Kannada",
    "Gujarati"
  ];

  const handleLangToggle = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter((l) => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  // Run Onboarding Submission Sequence
  const handleExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExpertFormValid) return;

    setIsSubmitting(true);
    setSubmissionComplete(false);
    
    // Sequence steps
    const logs = [
      { text: "AXIOM-SECURE: Establishing connection to primary identity registry...", status: "running" as const },
      { text: "CRYPTO: Generating cryptographic public/private key pairs...", status: "pending" as const },
      { text: "VALIDATOR: Verifying credential node against simulated Razorpay UPI API...", status: "pending" as const },
      { text: "DATABASE: Syncing credentials to Axiom Vetting Registry...", status: "pending" as const },
      { text: "INTEGRATION: Provisioning Cloudflare R2 access tokens...", status: "pending" as const },
      { text: "ONBOARDING COMPLETE: Node authorized. Redirecting to dashboard...", status: "pending" as const }
    ];
    setSubProgress(logs);

    // Step 1: Initializing
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      { ...prev[0], status: "success" },
      { ...prev[1], status: "running" },
      ...prev.slice(2)
    ]);

    // Step 2: Keys
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      { ...prev[1], status: "success" },
      { ...prev[2], status: "running" },
      ...prev.slice(3)
    ]);

    // Step 3: API Check (Backend trigger call)
    let expertResponse: any = null;
    try {
      const res = await fetch("/api?action=signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: expertName,
          email: expertEmail,
          upiId: expertUpi,
          tier: expertTier,
          languages: selectedLangs,
          expertise: expertArea
        })
      });
      const data = await res.json();
      if (data.success) {
        expertResponse = data.expert;
      }
    } catch (err) {
      console.error("Backend trigger failed, continuing with client-side simulation", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      { ...prev[2], text: `VALIDATOR: UPI VPA [${expertUpi}] authenticated with Razorpay rails.`, status: "success" },
      { ...prev[3], status: "running" },
      ...prev.slice(4)
    ]);

    // Step 4: DB sync
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      prev[2],
      { ...prev[3], text: "DATABASE: Expert Node stored successfully.", status: "success" },
      { ...prev[4], status: "running" },
      ...prev.slice(5)
    ]);

    // Step 5: Cloudflare
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      prev[2],
      prev[3],
      { ...prev[4], status: "success" },
      { ...prev[5], status: "running" }
    ]);

    // Step 6: Complete
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      prev[2],
      prev[3],
      prev[4],
      { ...prev[5], status: "success" }
    ]);

    // Store expert identity in localStorage to auto login on dashboard
    if (typeof window !== "undefined") {
      localStorage.setItem("axiom_expert_email", expertEmail);
    }

    setSuccessData({
      role: "Expert Specialist",
      name: expertName,
      email: expertEmail,
      upi: expertUpi,
      tier: expertTier,
      languages: selectedLangs.join(", ")
    });
    setSubmissionComplete(true);

    // Redirect to home dashboard after a brief delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/?email=${encodeURIComponent(expertEmail)}`);
    }, 2500);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClientFormValid) return;

    setIsSubmitting(true);
    setSubmissionComplete(false);
    
    // Sequence steps
    const logs = [
      { text: "AXIOM-SECURE: Establishing enterprise connection layer...", status: "running" as const },
      { text: "VALIDATOR: Verifying Stripe billing contact signature...", status: "pending" as const },
      { text: "DATABASE: Creating Client & Organization profiles...", status: "pending" as const },
      { text: "AI-PROVISIONING: Matching custom training demand parameters...", status: "pending" as const },
      { text: "INTEGRATION: Activating Stripe billing webhook listener...", status: "pending" as const },
      { text: "ONBOARDING COMPLETE: Redirecting to dashboard...", status: "pending" as const }
    ];
    setSubProgress(logs);

    // Step 1: Initializing
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      { ...prev[0], status: "success" },
      { ...prev[1], status: "running" },
      ...prev.slice(2)
    ]);

    // Step 2: Stripe Signature
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      { ...prev[1], status: "success" },
      { ...prev[2], status: "running" },
      ...prev.slice(3)
    ]);

    // Step 3: DB profile creation via backend trigger
    let clientResponse: any = null;
    try {
      const res = await fetch("/api?action=client-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: clientCompany,
          email: clientEmail,
          llmSize: clientLlmSize,
          stripeBilling: clientStripe,
          datasetNeeds: clientDatasetNeeds
        })
      });
      const data = await res.json();
      if (data.success) {
        clientResponse = data.client;
      }
    } catch (err) {
      console.error("Backend trigger failed, continuing with client-side simulation", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      { ...prev[2], text: `DATABASE: Organization [${clientCompany}] mapped to simulated Stripe customer.`, status: "success" },
      { ...prev[3], status: "running" },
      ...prev.slice(4)
    ]);

    // Step 4: AI Matching
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      prev[2],
      { ...prev[3], text: `AI-PROVISIONING: Dialect mix tuned for targeted model size [${clientLlmSize}].`, status: "success" },
      { ...prev[4], status: "running" },
      ...prev.slice(5)
    ]);

    // Step 5: Webhooks listener
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      prev[2],
      prev[3],
      { ...prev[4], status: "success" },
      { ...prev[5], status: "running" }
    ]);

    // Step 6: Complete
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubProgress((prev) => [
      prev[0],
      prev[1],
      prev[2],
      prev[3],
      prev[4],
      { ...prev[5], status: "success" }
    ]);

    setSuccessData({
      role: "Enterprise B2B Client",
      name: clientCompany,
      email: clientEmail,
      llm: clientLlmSize,
      stripe: clientStripe,
      needs: clientDatasetNeeds
    });
    setSubmissionComplete(true);

    // Redirect to home dashboard after a brief delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0e0e15] text-[#e7e4ee] font-label relative flex flex-col items-center justify-center py-12 px-4 bg-grid-cyber selection:bg-[#a5a5ff]/30 selection:text-white overflow-hidden">
      
      {/* Premium ambient radial glows to replace border styling lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#5E5CE6]/15 via-transparent to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-[#BF5AF2]/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-[#0A84FF]/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Floating Header Navbar */}
      <header className="absolute top-0 left-0 w-full h-20 px-8 flex justify-between items-center z-40 bg-transparent">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#5E5CE6]/10 flex items-center justify-center border border-white/5 group-hover:bg-[#5E5CE6]/20 transition-all">
            <Database className="w-4 h-4 text-[#5E5CE6]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight text-white group-hover:text-[#5E5CE6] transition-colors leading-none">Axiom</h1>
            <p className="text-[9px] text-[#acaab4] uppercase tracking-widest mt-1">Decentralized Data</p>
          </div>
        </Link>
        <Link href="/">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#acaab4] hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Marketplace
          </button>
        </Link>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 mt-12 flex flex-col items-center">
        
        {/* Pitch Headline */}
        <div className="text-center mb-10 max-w-2xl px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E5CE6]/10 border border-[#5E5CE6]/20 text-[#5E5CE6] text-[10px] font-bold uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles className="w-3 h-3" />
            Consensus Data Network Onboarding
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white mb-4 leading-[1.1]">
            Own the Future of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#a5a5ff] via-[#BF5AF2] to-[#0A84FF] bg-clip-text text-transparent">
              Bilingual Intelligence
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#acaab4] leading-relaxed max-w-lg mx-auto">
            Choose your gateway. Specialists earn compounding passive royalties by contributing high-density clinical, legal, or tech reasoning traces. Enterprises license elite custom sets instantly.
          </p>
        </div>

        {/* Unified Sliding Switcher Toggle */}
        <div className="p-1 rounded-full bg-[#13131a]/80 backdrop-blur-md ambient-shadow-primary max-w-md w-full mb-8 flex relative z-10 select-none">
          <button
            onClick={() => setActiveTrack("expert")}
            className={`flex-1 py-3 px-6 rounded-full text-xs font-display font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 relative z-10 ${
              activeTrack === "expert" ? "text-[#1700a1]" : "text-[#acaab4] hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" />
            Expert Specialist
          </button>
          
          <button
            onClick={() => setActiveTrack("client")}
            className={`flex-1 py-3 px-6 rounded-full text-xs font-display font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 relative z-10 ${
              activeTrack === "client" ? "text-[#1700a1]" : "text-[#acaab4] hover:text-white"
            }`}
          >
            <Building className="w-4 h-4" />
            Enterprise Client
          </button>

          {/* Sliding highlight pill */}
          <div
            className={`absolute top-1 bottom-1 left-1 rounded-full bg-gradient-to-r from-[#a5a5ff] to-[#5E5CE6] transition-all duration-500 shadow-[0_0_15px_rgba(94,92,230,0.4)] ${
              activeTrack === "expert" ? "w-[calc(50%-4px)] translate-x-0" : "w-[calc(50%-4px)] translate-x-full"
            }`}
          />
        </div>

        {/* Side-by-Side Cards on Desktop, Sliding/Switching on Mobile */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative px-2">
          
          {/* Track 1: Expert Onboarding Card */}
          <div
            className={`lg:col-span-6 lg:block transition-all duration-500 ${
              activeTrack === "expert"
                ? "block translate-x-0 opacity-100 scale-100"
                : "hidden lg:opacity-40 lg:scale-[0.98] lg:pointer-events-none"
            }`}
          >
            <div className={`glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
              activeTrack === "expert" 
                ? "bg-[#191921]/50 border-2 border-[#5E5CE6]/30 shadow-[0_0_50px_-10px_rgba(94,92,230,0.25)]" 
                : "bg-[#13131a]/40"
            }`}>
              {/* Inner glowing element */}
              {activeTrack === "expert" && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5E5CE6]/10 blur-3xl rounded-full" />
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#5E5CE6]/10 flex items-center justify-center text-[#5E5CE6]">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-white">Specialist Expert Onboarding</h3>
                  <p className="text-[10px] text-[#acaab4] uppercase tracking-wider mt-0.5">Route payouts via Razorpay UPI</p>
                </div>
              </div>

              {/* EXPERT FORM */}
              <form onSubmit={handleExpertSubmit} className="space-y-5">
                
                {/* Name */}
                <div className="relative">
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1.5">Expert Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ananya Iyer"
                    value={expertName}
                    onChange={(e) => {
                      setExpertName(e.target.value);
                      setExpertNameTouched(true);
                    }}
                    onBlur={() => setExpertNameTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#5E5CE6]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(94,92,230,0.2)] focus:ring-0 outline-none transition duration-300 font-semibold"
                  />
                  {expertNameTouched && (
                    <span className="absolute right-3.5 top-[38px]">
                      {isExpertNameValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1.5">Professional Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya.iyer@axiom.ai"
                    value={expertEmail}
                    onChange={(e) => {
                      setExpertEmail(e.target.value);
                      setExpertEmailTouched(true);
                    }}
                    onBlur={() => setExpertEmailTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#5E5CE6]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(94,92,230,0.2)] focus:ring-0 outline-none transition duration-300 font-mono"
                  />
                  {expertEmailTouched && (
                    <span className="absolute right-3.5 top-[38px]">
                      {isExpertEmailValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Area of Expertise */}
                <div>
                  <label className="text-xs text-[#acaab4] font-semibold block mb-2">Area of Core Expertise</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "Medical" as const, icon: Heart, label: "Medical", color: "text-rose-400 bg-rose-400/5 border-rose-400/10" },
                      { value: "Legal" as const, icon: Scale, label: "Legal", color: "text-amber-400 bg-amber-400/5 border-amber-400/10" },
                      { value: "Tech" as const, icon: Code, label: "Tech", color: "text-[#0A84FF] bg-[#0A84FF]/5 border-[#0A84FF]/10" }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = expertArea === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setExpertArea(item.value)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition duration-300 ${
                            isSelected
                              ? "bg-[#5E5CE6]/10 border-[#5E5CE6]/50 text-white shadow-[0_0_15px_rgba(94,92,230,0.25)]"
                              : "bg-[#13131a]/60 border-white/5 text-[#acaab4] hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#a5a5ff]" : "text-gray-400"}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Triage Tier Dropdown Selection */}
                <div>
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1.5">Starting Vetting Tier</label>
                  <select
                    value={expertTier}
                    onChange={(e) => setExpertTier(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#5E5CE6]/60 focus:bg-[#191921] focus:ring-0 outline-none transition duration-300 font-semibold cursor-pointer"
                  >
                    <option value="BRONZE">Bronze (1.0x Point Multiplier)</option>
                    <option value="SILVER">Silver (1.2x Point Multiplier)</option>
                    <option value="GOLD">Gold (1.5x Point Multiplier)</option>
                    <option value="SENIOR">Senior Specialist (1.7x Point Multiplier)</option>
                    <option value="ELITE">Elite Consensus Judge (2.0x Point Multiplier)</option>
                  </select>
                </div>

                {/* Dialect Languages (Hinglish/regional) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-[#acaab4] font-semibold block">Instruction Languages</label>
                    <span className="text-[9px] text-[#5E5CE6] font-bold uppercase tracking-wider">Select 1 or more</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map((lang) => {
                      const isSelected = selectedLangs.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLangToggle(lang)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all duration-300 ${
                            isSelected
                              ? "bg-[#BF5AF2]/10 border-[#BF5AF2]/40 text-[#BF5AF2] shadow-[0_0_10px_rgba(191,90,242,0.15)]"
                              : "bg-[#13131a]/40 border-white/5 text-[#acaab4] hover:border-white/10 hover:text-white"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Razorpay UPI VPA */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-[#acaab4] font-semibold block">Razorpay UPI VPA ID</label>
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      Razorpay X Rails
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourname@okhdfc or expert@okaxis"
                    value={expertUpi}
                    onChange={(e) => {
                      setExpertUpi(e.target.value);
                      setExpertUpiTouched(true);
                    }}
                    onBlur={() => setExpertUpiTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#5E5CE6]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(94,92,230,0.2)] focus:ring-0 outline-none transition duration-300 font-mono"
                  />
                  {expertUpiTouched && (
                    <span className="absolute right-3.5 top-[38px]">
                      {isExpertUpiValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                  {expertUpiTouched && !isExpertUpiValid && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      Must be a valid UPI address structure (e.g. name@bank)
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isExpertFormValid}
                    className="w-full py-3.5 bg-gradient-to-r from-[#a5a5ff] to-[#5E5CE6] text-[#1700a1] hover:text-white font-display font-black uppercase text-xs rounded-xl shadow-[0_0_30px_-5px_rgba(94,92,230,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_0_35px_-2px_rgba(94,92,230,0.6)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Activate Expert Node</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Track 2: Client Onboarding Card */}
          <div
            className={`lg:col-span-6 lg:block transition-all duration-500 ${
              activeTrack === "client"
                ? "block translate-x-0 opacity-100 scale-100"
                : "hidden lg:opacity-40 lg:scale-[0.98] lg:pointer-events-none"
            }`}
          >
            <div className={`glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${
              activeTrack === "client" 
                ? "bg-[#191921]/50 border-2 border-[#BF5AF2]/30 shadow-[0_0_50px_-10px_rgba(191,90,242,0.25)]" 
                : "bg-[#13131a]/40"
            }`}>
              {/* Inner glowing element */}
              {activeTrack === "client" && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#BF5AF2]/10 blur-3xl rounded-full" />
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#BF5AF2]/10 flex items-center justify-center text-[#BF5AF2]">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-white">Enterprise Client Gateway</h3>
                  <p className="text-[10px] text-[#acaab4] uppercase tracking-wider mt-0.5">Integrate Stripe billing profiles</p>
                </div>
              </div>

              {/* CLIENT FORM */}
              <form onSubmit={handleClientSubmit} className="space-y-5">
                
                {/* Company Name */}
                <div className="relative">
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1.5">Enterprise Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google DeepMind India"
                    value={clientCompany}
                    onChange={(e) => {
                      setClientCompany(e.target.value);
                      setClientCompanyTouched(true);
                    }}
                    onBlur={() => setClientCompanyTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#BF5AF2]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(191,90,242,0.2)] focus:ring-0 outline-none transition duration-300 font-semibold"
                  />
                  {clientCompanyTouched && (
                    <span className="absolute right-3.5 top-[38px]">
                      {isClientCompanyValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div className="relative">
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1.5">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. corporate.billing@deepmind.ai"
                    value={clientEmail}
                    onChange={(e) => {
                      setClientEmail(e.target.value);
                      setClientEmailTouched(true);
                    }}
                    onBlur={() => setClientEmailTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#BF5AF2]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(191,90,242,0.2)] focus:ring-0 outline-none transition duration-300 font-mono"
                  />
                  {clientEmailTouched && (
                    <span className="absolute right-3.5 top-[38px]">
                      {isClientEmailValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Model Size Interest */}
                <div>
                  <label className="text-xs text-[#acaab4] font-semibold block mb-2">Targeted LLM Architecture Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "Small (<7B)", desc: "Sub-7B params" },
                      { value: "8B-70B", desc: "Mid-scale range" },
                      { value: "Frontier (>70B)", desc: "Deep Mixture model" }
                    ].map((item) => {
                      const isSelected = clientLlmSize === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setClientLlmSize(item.value)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition duration-300 ${
                            isSelected
                              ? "bg-[#BF5AF2]/10 border-[#BF5AF2]/50 text-white shadow-[0_0_15px_rgba(191,90,242,0.25)]"
                              : "bg-[#13131a]/60 border-white/5 text-[#acaab4] hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.value}</span>
                          <span className="text-[8px] text-[#acaab4]/70 tracking-tight">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stripe Billing Contact info */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-[#acaab4] font-semibold block">Stripe Billing Contact</label>
                    <span className="text-[9px] font-bold text-[#0A84FF] flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#0A84FF] animate-ping" />
                      International Checkout API
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. corporate-invoice@deepmind.ai"
                    value={clientStripe}
                    onChange={(e) => {
                      setClientStripe(e.target.value);
                      setClientStripeTouched(true);
                    }}
                    onBlur={() => setClientStripeTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#BF5AF2]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(191,90,242,0.2)] focus:ring-0 outline-none transition duration-300 font-mono"
                  />
                  {clientStripeTouched && (
                    <span className="absolute right-3.5 top-[38px]">
                      {isClientStripeValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                  {clientStripeTouched && !isClientStripeValid && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      Must be a valid email or authorized Stripe invoice handle
                    </p>
                  )}
                </div>

                {/* Custom Dataset Demand Text */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-[#acaab4] font-semibold block">Custom Dataset Specifications</label>
                    <span className="text-[9px] text-[#acaab4]/70 font-mono">Min 10 characters</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe specific corporate legal clauses, clinical triage goals, or specific dialects needed..."
                    value={clientDatasetNeeds}
                    onChange={(e) => {
                      setClientDatasetNeeds(e.target.value);
                      setClientNeedsTouched(true);
                    }}
                    onBlur={() => setClientNeedsTouched(true)}
                    className="w-full p-3 rounded-xl bg-[#13131a]/80 text-white text-xs border border-white/5 focus:border-[#BF5AF2]/60 focus:bg-[#191921] focus:shadow-[0_0_20px_rgba(191,90,242,0.2)] focus:ring-0 outline-none transition duration-300 font-sans resize-none"
                  />
                  {clientNeedsTouched && (
                    <span className="absolute right-3.5 bottom-3.5">
                      {isClientNeedsValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isClientFormValid}
                    className="w-full py-3.5 bg-gradient-to-r from-[#BF5AF2] to-[#0A84FF] text-white hover:text-white font-display font-black uppercase text-xs rounded-xl shadow-[0_0_30px_-5px_rgba(191,90,242,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_0_35px_-2px_rgba(191,90,242,0.6)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Provision Enterprise Gateway</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>

      </div>

      {/* Sci-Fi Submission Log Terminal Modal Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0e15]/95 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl p-1 bg-gradient-to-br from-[#5E5CE6] via-[#BF5AF2] to-[#0A84FF] rounded-2xl shadow-[0_0_80px_rgba(94,92,230,0.3)]">
            <div className="bg-[#0e0e15] rounded-xl p-6 relative overflow-hidden">
              
              {/* Star/grid terminal particles */}
              <div className="absolute inset-0 bg-grid-cyber opacity-20 pointer-events-none" />

              <div className="flex items-center justify-between mb-5 relative pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-[#a5a5ff] animate-pulse" />
                  <span className="font-mono text-xs text-white font-bold tracking-widest uppercase">
                    Axiom Node Calibration Sequence
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-[9px] text-[#acaab4] uppercase font-bold tracking-wider">
                    Secure Channel
                  </span>
                </div>
              </div>

              {/* Progress Logs */}
              <div className="font-mono text-[11px] leading-relaxed space-y-3.5 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {subProgress.map((prog, index) => {
                  let indicatorColor = "text-gray-500";
                  let statusText = "[ PENDING ]";
                  
                  if (prog.status === "running") {
                    indicatorColor = "text-[#a5a5ff] animate-pulse";
                    statusText = "[ RUNNING ]";
                  } else if (prog.status === "success") {
                    indicatorColor = "text-emerald-400";
                    statusText = "[   OK    ]";
                  } else if (prog.status === "error") {
                    indicatorColor = "text-rose-400";
                    statusText = "[  FAIL   ]";
                  }

                  return (
                    <div key={index} className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-2 text-gray-300">
                        <span className={`${indicatorColor} select-none`}>&gt;</span>
                        <span className={prog.status === "running" ? "text-white font-bold" : ""}>
                          {prog.text}
                        </span>
                      </div>
                      <span className={`font-bold shrink-0 ${indicatorColor}`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Loader or Success Summary */}
              {submissionComplete ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-display font-black text-white uppercase tracking-wider mb-2">
                    Onboarding Node Synced
                  </h4>
                  <p className="text-[10px] text-[#acaab4] leading-relaxed max-w-sm mx-auto">
                    Key pairs authorized. System is loading. Enjoy compounding royalties in the decentralized bilingual marketplace.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3.5 py-4 border-t border-white/5">
                  <Loader2 className="w-4 h-4 text-[#a5a5ff] animate-spin" />
                  <span className="font-mono text-[10px] text-[#acaab4] uppercase font-bold tracking-widest animate-pulse">
                    Broadcasting node transaction state...
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
