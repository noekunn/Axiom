"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Layers,
  Cpu,
  Database,
  TrendingUp,
  Wallet,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Sparkles,
  UserCheck,
  FileText,
  Check,
  Lock as LockIcon,
  Send,
  HelpCircle,
  Plus
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import RoyaltyAnalytics from "@/components/RoyaltyAnalytics";
import TerminalConsole from "@/components/TerminalConsole";

interface Expert {
  id: string;
  name: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE';
  upiId: string;
  points: number;
  totalEarnings: number;
  razorpayStatus: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED';
}

interface AssetPool {
  id: string;
  title: string;
  description: string;
  category: string;
  totalPoints: number;
  basePrice: number;
  exclusivePrice: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  licenseCount: number;
  languages: string[];
  samplePrompt: string;
}

interface TaskSubmission {
  id: string;
  expertId: string;
  expertName: string;
  expertTier: string;
  poolId: string;
  poolTitle: string;
  prompt: string;
  response: string;
  difficultyMultiplier: number;
  qualityScore?: number;
  pointsEarned?: number;
  status: 'PENDING' | 'APPROVED' | 'BORDERLINE' | 'REJECTED' | 'HUMAN_REVIEW_REQUIRED';
  timestamp: string;
  evaluations?: Array<{
    provider: string;
    modelName: string;
    score: number;
    verdict: 'APPROVED' | 'BORDERLINE' | 'REJECTED';
    reasoning: string;
  }>;
}

interface RoyaltyPayout {
  id: string;
  expertId: string;
  expertName: string;
  poolId: string;
  poolTitle: string;
  licenseType: 'SHARED' | 'EXCLUSIVE';
  grossRoyalty: number;
  netRoyalty: number;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  payoutTransactionId: string;
}

interface PurchaseSuccess {
  message: string;
  token: string;
  poolTitle: string;
}

interface FineTuningJob {
  success: boolean;
  message: string;
  jobId: string;
  status: string;
}

// Pre-seeded expert accounts for the demo switcher
const SEEDED_EXPERTS = [
  { email: 'ananya.iyer@axiom.ai', name: 'Dr. Ananya Iyer' },
  { email: 'rahul.banerjee@axiom.ai', name: 'Adv. Rahul Banerjee' },
  { email: 'priya.sharma@axiom.ai', name: 'Dr. Priya Sharma' },
];

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Expert State
  const [expertEmail, setExpertEmail] = useState('ananya.iyer@axiom.ai');
  const [expertProfile, setExpertProfile] = useState<Expert | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [payouts, setPayouts] = useState<RoyaltyPayout[]>([]);

  // Pools State
  const [pools, setPools] = useState<AssetPool[]>([]);

  // Action / Form States
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUpi, setSignupUpi] = useState('');
  const [signupTier, setSignupTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE'>('GOLD');

  // Submit Task Form State
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [submissionPrompt, setSubmissionPrompt] = useState('');
  const [submissionResponse, setSubmissionResponse] = useState('');
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1.2);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [consensusReport, setConsensusReport] = useState<TaskSubmission | null>(null);

  // Client Purchase State
  const [licensingPool, setLicensingPool] = useState<AssetPool | null>(null);
  const [licenseType, setLicenseType] = useState<'SHARED' | 'EXCLUSIVE'>('SHARED');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState<PurchaseSuccess | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [purchasedPools, setPurchasedPools] = useState<Record<string, string>>({});

  // OpenAI Fine Tuning Integration State
  const [fineTuningJob, setFineTuningJob] = useState<FineTuningJob | null>(null);
  const [fineTuningStatus, setFineTuningStatus] = useState<'idle' | 'submitting' | 'running' | 'completed'>('idle');

  // Error/Success Notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch expert profile and lists
  const fetchExpertData = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api?action=expert&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setExpertProfile(data.expert);
        setSubmissions(data.submissions || []);
        setPayouts(data.payouts || []);
      } else {
        setExpertProfile(null);
        setSubmissions([]);
        setPayouts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active pools
  const fetchPools = async () => {
    try {
      const res = await fetch('/api?action=pools');
      const data = await res.json();
      if (data.success) {
        setPools(data.pools || []);
        if (data.pools.length > 0 && !selectedPoolId) {
          setSelectedPoolId(data.pools[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch expert handler
  const handleSwitchExpert = useCallback((email: string) => {
    setExpertEmail(email);
    fetchExpertData(email);
  }, []);

  // Status polling for pending payouts
  useEffect(() => {
    const hasPendingPayouts = payouts.some(p => p.status === 'PENDING');
    if (!hasPendingPayouts || loading) return;

    const pollInterval = setInterval(() => {
      if (expertProfile?.email) {
        fetchExpertData(expertProfile.email);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [payouts, loading, expertProfile?.email]);

  // Auto trigger alerts timeout
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    fetchExpertData(expertEmail);
    fetchPools();
  }, []);

  // Expert Sign Up Action
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupUpi) {
      setAlert({ type: 'error', message: 'Please fill in all details' });
      return;
    }

    try {
      const res = await fetch('/api?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          upiId: signupUpi,
          tier: signupTier
        })
      });
      const data = await res.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Expert profile connected successfully!' });
        setExpertEmail(signupEmail);
        setExpertProfile(data.expert);
        setIsSignupOpen(false);
        fetchExpertData(signupEmail);
        fetchPools();
      } else {
        setAlert({ type: 'error', message: data.error || 'Signup failed' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to connect expert profile' });
    }
  };

  // Task Submission Action
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertProfile) {
      setAlert({ type: 'error', message: 'Please connect/signup an expert profile first' });
      return;
    }
    if (!selectedPoolId || !submissionPrompt || !submissionResponse) {
      setAlert({ type: 'error', message: 'All task submission fields are required' });
      return;
    }

    try {
      setSubmittingTask(true);
      setConsensusReport(null);
      
      // Artificial delay to simulate Consensus QA checking in-flight
      await new Promise(resolve => setTimeout(resolve, 3000));

      const res = await fetch('/api?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: expertProfile.id,
          poolId: selectedPoolId,
          prompt: submissionPrompt,
          response: submissionResponse,
          difficultyMultiplier: Number(difficultyMultiplier)
        })
      });
      const data = await res.json();
      if (data.success) {
        setConsensusReport(data.submission);
        setAlert({ 
          type: 'success', 
          message: data.submission.status === 'APPROVED' || data.submission.status === 'BORDERLINE'
            ? `Consensus Approved! Upfront payment routed via Razorpay.`
            : `Submitted! Response routed for manual adjudication.`
        });
        setSubmissionPrompt('');
        setSubmissionResponse('');
        // Reload expert and pool data
        fetchExpertData(expertProfile.email);
        fetchPools();
      } else {
        setAlert({ type: 'error', message: data.error || 'Task submission failed' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Server error during consensus review' });
    } finally {
      setSubmittingTask(false);
    }
  };

  // Client Purchase Action
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensingPool || !buyerEmail) {
      setAlert({ type: 'error', message: 'Stripe Billing details are missing' });
      return;
    }

    try {
      setCheckingOut(true);
      // Simulate Stripe API checkout auth delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch('/api/client/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: licensingPool.id,
          licenseType,
          buyerEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        setPurchaseSuccess({
          message: data.message,
          token: data.token,
          poolTitle: data.poolTitle
        });
        setPurchasedPools(prev => ({ ...prev, [licensingPool.id]: data.token }));
        setAlert({ type: 'success', message: 'Dataset licensed successfully! Check download credentials.' });
        fetchPools(); // refresh pools
      } else {
        setAlert({ type: 'error', message: data.error || 'Checkout failed' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to process purchase' });
    } finally {
      setCheckingOut(false);
    }
  };

  // OpenAI Fine Tuning Trigger
  const triggerFineTuning = async (poolId: string) => {
    try {
      setFineTuningStatus('submitting');
      
      const res = await fetch('/api/client/fine-tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      });
      const data = await res.json();
      if (data.success) {
        setFineTuningJob({
          success: true,
          message: data.message,
          jobId: data.jobId,
          status: data.status
        });
        
        if (data.mock) {
          // Simulate visual training steps locally
          setTimeout(() => setFineTuningStatus('running'), 2000);
          setTimeout(() => setFineTuningStatus('completed'), 8000);
        } else {
          // Track SFT job state directly from OpenAI response
          if (data.status === 'succeeded' || data.status === 'completed') {
            setFineTuningStatus('completed');
          } else if (data.status === 'validating_files') {
            setFineTuningStatus('submitting');
          } else {
            setFineTuningStatus('running');
          }
        }
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to trigger fine-tune' });
        setFineTuningStatus('idle');
      }
    } catch {
      setAlert({ type: 'error', message: 'Network error fine-tuning model' });
      setFineTuningStatus('idle');
    }
  };

  const downloadLicensedDataset = () => {
    if (!purchaseSuccess) return;

    const pool = pools.find((item) => item.title === purchaseSuccess.poolTitle) || licensingPool;
    const records = [
      {
        messages: [
          { role: "system", content: "You are an expert reasoning assistant trained on Axiom licensed data." },
          { role: "user", content: pool?.samplePrompt || "Provide a domain-specific expert reasoning response." },
          { role: "assistant", content: `Licensed Axiom dataset sample for ${purchaseSuccess.poolTitle}. Access token: ${purchaseSuccess.token}` },
        ],
      },
      {
        metadata: {
          poolTitle: purchaseSuccess.poolTitle,
          licenseToken: purchaseSuccess.token,
          licenseType,
          exportedAt: new Date().toISOString(),
        },
      },
    ];

    const jsonl = records.map((record) => JSON.stringify(record)).join("\n");
    const blob = new Blob([jsonl], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${purchaseSuccess.poolTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jsonl`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setAlert({ type: 'success', message: 'Secure JSONL dataset downloaded.' });
  };

  return (
    <DashboardLayout>
      {/* Alert Banner */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border ${
          alert.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-950/80 border-rose-500/20 text-rose-300'
        } shadow-2xl transition-all duration-300 transform translate-y-0 scale-100`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-xs font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Grid Canvas */}
      <div className="grid grid-cols-12 gap-8 select-none">
        
        {/* Left Analytics Column */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
          {/* Identity Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/[0.01]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-display font-black uppercase text-[#e7e4ee] tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#a5a5ff]" />
                Identity Node
              </h3>
              
              {/* Expert Dropdown Switcher */}
              <select
                value={expertEmail}
                onChange={(e) => handleSwitchExpert(e.target.value)}
                className="text-[10px] font-mono bg-[#191921]/60 border border-white/10 text-gray-300 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer hover:border-white/20 transition-all"
              >
                {SEEDED_EXPERTS.map((exp) => (
                  <option key={exp.email} value={exp.email}>
                    {exp.name}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-white/5 rounded w-2/3"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
              </div>
            ) : expertProfile ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block font-semibold">Expert Holder</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{expertProfile.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block font-semibold">Verified Credential</span>
                  <span className="text-xs font-mono text-[#a5a5ff] mt-0.5 block truncate">{expertProfile.email}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block font-semibold">Triage Tier</span>
                    <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-[#bf5af2]/10 border border-[#bf5af2]/20 text-[#bf5af2] mt-1 uppercase tracking-wide">
                      {expertProfile.tier}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block font-semibold">Payout Link</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Razorpay Active
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSignupName(expertProfile.name);
                      setSignupEmail(expertProfile.email);
                      setSignupUpi(expertProfile.upiId);
                      setSignupTier(expertProfile.tier);
                      setIsSignupOpen(true);
                    }}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/5 hover:border-white/10 transition duration-300"
                  >
                    Adjust Credentials
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-[#acaab4]">No active credentials linked.</p>
                <button
                  onClick={() => setIsSignupOpen(true)}
                  className="w-full py-2 bg-[#a5a5ff] text-[#1700a1] text-xs font-bold rounded-xl hover:bg-[#6462ec] hover:text-white transition duration-300"
                >
                  Connect Profile
                </button>
              </div>
            )}
          </div>

          {/* Royalty Analytics Widgets */}
          <RoyaltyAnalytics 
            points={expertProfile?.points ?? 84291.5}
            earnings={expertProfile?.totalEarnings ?? 115200}
            poolCount={submissions.reduce((acc, curr) => acc.includes(curr.poolId) ? acc : [...acc, curr.poolId], [] as string[]).length || 3}
          />
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 xl:col-span-9 flex flex-col gap-8">
          
          {/* Dataset Licensing Grid Section */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-extrabold text-xl text-[#e7e4ee] tracking-tight">Dataset Licensing</h2>
              <span className="text-xs text-[#acaab4] bg-[#1f1f28] px-3 py-1 rounded-full border border-white/5">
                {pools.length} Pools Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map((pool) => {
                const isExclusive = pool.exclusivePrice >= 3000;
                const isPurchased = purchasedPools[pool.id];
                
                return (
                  <div 
                    key={pool.id}
                    className="glass-panel rounded-2xl p-1 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 border border-white/[0.01]"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      isExclusive ? "from-[#bf5af2]/10" : "from-[#5f9eff]/10"
                    } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                    
                    <div className="bg-[#1f1f28]/40 rounded-xl p-5 h-full flex flex-col relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-[#0e0e15] flex items-center justify-center border border-white/[0.02]">
                          <Database className={`w-5 h-5 ${isExclusive ? "text-[#bf5af2]" : "text-[#5f9eff]"}`} />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          isExclusive 
                            ? "bg-[#bf5af2]/10 border-[#bf5af2]/20 text-[#bf5af2]" 
                            : "bg-[#5f9eff]/10 border-[#5f9eff]/20 text-[#5f9eff]"
                        }`}>
                          {isExclusive ? "Exclusive" : "Shared"}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base mb-1.5 text-white group-hover:text-[#a5a5ff] transition-colors">
                        {pool.title}
                      </h3>
                      
                      <p className="text-xs text-[#acaab4] font-label mb-5 line-clamp-2 leading-relaxed">
                        {pool.description}
                      </p>

                      <div className="flex gap-1.5 mb-5 flex-wrap">
                        {pool.languages.map((lang, index) => (
                          <span key={index} className="text-[9px] px-2 py-0.5 rounded-md bg-[#13131a] text-[#acaab4] border border-white/5 font-mono">
                            {lang}
                          </span>
                        ))}
                      </div>

                      {/* License Action / Token Display */}
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#acaab4] uppercase">Shared Cost</span>
                          <span className="font-display font-black text-sm text-[#e7e4ee]">
                            ${pool.basePrice.toLocaleString()} USD
                          </span>
                        </div>

                        {isPurchased ? (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono select-all truncate max-w-[120px]">
                            {isPurchased}
                          </span>
                        ) : (
                          <button 
                            onClick={() => {
                              setLicensingPool(pool);
                              setLicenseType('SHARED');
                              setPurchaseSuccess(null);
                            }}
                            className="w-8 h-8 rounded-full bg-[#13131a] hover:bg-[#a5a5ff] hover:text-[#1700a1] transition-all flex items-center justify-center text-white border border-white/5"
                          >
                            <LockIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Expert Submission Workbench */}
          <section className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-white/[0.01]">
            <h3 className="text-lg font-display font-black text-white mb-5 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#a5a5ff] animate-pulse" />
              Expert Reasoning Workbench
            </h3>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Asset Pool */}
                <div>
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1">Target Asset Pool</label>
                  <select
                    value={selectedPoolId}
                    onChange={(e) => setSelectedPoolId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-semibold focus:border-[#a5a5ff]/40 outline-none transition duration-300"
                    disabled={submittingTask}
                  >
                    {pools.map(pool => (
                      <option key={pool.id} value={pool.id}>{pool.title}</option>
                    ))}
                  </select>
                </div>

                {/* Multiplier Option */}
                <div>
                  <label className="text-xs text-[#acaab4] font-semibold block mb-1">Task Complexity Multiplier</label>
                  <select
                    value={difficultyMultiplier}
                    onChange={(e) => setDifficultyMultiplier(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-semibold focus:border-[#a5a5ff]/40 outline-none transition duration-300"
                    disabled={submittingTask}
                  >
                    <option value="1.0">Standard Reasoning (1.0x)</option>
                    <option value="1.2">Multi-Step Specialized Diagnostic (1.2x)</option>
                    <option value="1.5">Bilingual Code-Mixed Expert (1.5x)</option>
                    <option value="2.0">Hard Consensus Cross-Evaluation (2.0x)</option>
                  </select>
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="text-xs text-[#acaab4] font-semibold block mb-1">Instruction Prompt</label>
                <textarea
                  placeholder="Specify clear, domain-specific instruction challenge..."
                  value={submissionPrompt}
                  onChange={(e) => setSubmissionPrompt(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-semibold focus:border-[#a5a5ff]/40 outline-none transition duration-300 resize-none font-sans"
                  disabled={submittingTask}
                />
              </div>

              {/* Response Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-[#acaab4] font-semibold block">Expert Reasoning Response</label>
                  <span className="text-[10px] text-[#bf5af2] font-bold uppercase tracking-wider animate-pulse">
                    Consensus calibration scores best on high-density traces
                  </span>
                </div>
                <textarea
                  placeholder="Provide rich step-by-step reasoning details, incorporating Hinglish/bilingual mix where applicable..."
                  value={submissionResponse}
                  onChange={(e) => setSubmissionResponse(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-mono focus:border-[#a5a5ff]/40 outline-none transition duration-300 resize-none text-[11px] leading-relaxed"
                  disabled={submittingTask}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingTask || !expertProfile}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center gap-2 ${
                    submittingTask 
                      ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 cursor-not-allowed animate-pulse'
                      : 'bg-[#a5a5ff] hover:bg-[#6462ec] text-[#1700a1] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(165,165,255,0.4)]'
                  }`}
                >
                  {submittingTask ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calibrating Multi-Model Consensus QA (Llama 3.3 + GPT-4o)...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit to AI Consensus Pipeline
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Consensus AI QA Calibration Report */}
          {consensusReport && (
            <div className="glass-panel rounded-2xl p-6 border border-[#bf5af2]/30 bg-[#bf5af2]/5 relative overflow-hidden animate-fade-in mb-4">
              <div className="absolute top-0 right-0 p-2.5 bg-[#bf5af2]/10 rounded-bl-xl border-l border-b border-[#bf5af2]/20">
                <Cpu className="w-4 h-4 text-[#bf5af2]" />
              </div>
              
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  consensusReport.status === 'APPROVED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  Consensus AI QA Calibration Report
                </h3>
              </div>

              <p className="text-xs text-[#acaab4] mb-4 leading-relaxed">
                Multi-model consensus network scoring aggregates independent critiques:
              </p>

              {/* Groq / Llama evaluation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="p-4 rounded-xl bg-[#13131a]/60 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">Llama 3.3 Score</span>
                      <span className="text-[9px] text-[#a5a5ff] font-mono">llama-3.3-70b</span>
                    </div>
                    <p className="text-xs text-[#acaab4] italic leading-relaxed">
                      &ldquo;{consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('groq'))?.reasoning || "Evaluation completed successfully by Llama-3.3 parser."}&rdquo;
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-[#acaab4]">Adjudication score:</span>
                    <span className="font-bold text-emerald-400">
                      {(() => {
                        const score = consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('groq'))?.score ?? 0.85;
                        return score > 1 ? (score / 100).toFixed(2) : score.toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>

                {/* OpenAI evaluation */}
                <div className="p-4 rounded-xl bg-[#13131a]/60 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">GPT-4o Score</span>
                      <span className="text-[9px] text-[#a5a5ff] font-mono">gpt-4o</span>
                    </div>
                    <p className="text-xs text-[#acaab4] italic leading-relaxed">
                      &ldquo;{consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('openai'))?.reasoning || "Evaluation completed successfully by GPT-4o parser."}&rdquo;
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-[#acaab4]">Adjudication score:</span>
                    <span className="font-bold text-emerald-400">
                      {(() => {
                        const score = consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('openai'))?.score ?? 0.90;
                        return score > 1 ? (score / 100).toFixed(2) : score.toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Adjudication Banner */}
              <div className="p-4 rounded-xl bg-[#13131a]/80 border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-[9px] text-[#acaab4] uppercase block">Consensus Status</span>
                  <span className="text-sm font-black text-emerald-400 uppercase tracking-widest block mt-0.5">
                    {consensusReport.status}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-[#acaab4] uppercase block">Points Credited</span>
                  <span className="text-sm font-bold text-white font-mono block mt-0.5">
                    +{consensusReport.pointsEarned?.toFixed(2) || "0.00"} PTS
                  </span>
                </div>
                {consensusReport.pointsEarned && (
                  <div className="px-3.5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-center font-mono">
                    <span className="text-[9px] text-gray-400 block uppercase font-sans">Razorpay UPI Transfer</span>
                    <span className="text-xs font-bold text-emerald-400">₹{(consensusReport.pointsEarned * 120).toLocaleString('en-IN')} paid</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secure Download and Supervised Fine Tuning panel after Purchase */}
          {purchaseSuccess && (
            <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/5 relative overflow-hidden animate-fade-in">
              <h3 className="text-base font-display font-black text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Stripe Billing Checkout Success
              </h3>
              <p className="text-xs text-[#acaab4] leading-relaxed mb-4">
                Standard commercial dataset licensing has updated active royalty dividends. Secure Cloudflare R2 download credentials have been generated:
              </p>

              <div className="p-4 rounded-xl bg-[#0e0e15]/80 border border-white/5 font-mono text-xs space-y-3 mb-6">
                <div>
                  <span className="text-[10px] text-[#acaab4] block">Licensed Dataset Pool:</span>
                  <span className="text-white font-bold">{purchaseSuccess.poolTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#acaab4] block">Secure Cloudflare R2 Access Token:</span>
                  <span className="text-emerald-400 font-semibold truncate block select-all">{purchaseSuccess.token}</span>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={downloadLicensedDataset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white transition duration-300 font-sans font-bold text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSONL Dataset
                  </button>
                </div>
              </div>

              {/* Fine tuning webhook trigger */}
              <div className="p-5 rounded-xl bg-[#bf5af2]/5 border border-[#bf5af2]/20">
                <h4 className="text-sm font-display font-black text-white mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#bf5af2]" />
                  OpenAI Fine-Tuning Integration Webhook
                </h4>
                <p className="text-xs text-[#acaab4] leading-relaxed mb-4">
                  Co-optimize this licensed dataset and trigger a Supervised Fine-Tuning (SFT) job on OpenAI&apos;s models directly via our webhook.
                </p>

                {fineTuningStatus === 'idle' ? (
                  <button
                    onClick={() => triggerFineTuning(licensingPool?.id || '')}
                    className="py-2.5 px-4 bg-[#bf5af2] hover:bg-[#d277ff] text-white text-xs font-bold rounded-xl transition duration-300 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Trigger OpenAI Fine-Tuning Job
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e0e15]/60 border border-white/5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Loader2 className={`w-3.5 h-3.5 text-[#bf5af2] ${fineTuningStatus !== 'completed' ? 'animate-spin' : ''}`} />
                        <span>Job ID: <strong className="text-white">{fineTuningJob?.jobId}</strong></span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        fineTuningStatus === 'submitting' ? 'bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20' :
                        fineTuningStatus === 'running' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {fineTuningStatus === 'submitting' ? 'Validating Dataset' :
                         fineTuningStatus === 'running' ? 'Training Active' : 'Succeeded!'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terminal Console Visualizer */}
          <TerminalConsole 
            status={fineTuningStatus}
            jobId={fineTuningJob?.jobId || "OpenAI-FT-72B"}
            targetPoolTitle={licensingPool?.title || "Global Chat Corpus v4"}
          />

          {/* Reasoning Contributions Historical Ledger */}
          <section className="glass-panel rounded-2xl p-6 border border-white/[0.01]">
            <h3 className="text-sm font-display font-black uppercase text-[#e7e4ee] tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#a5a5ff]" />
              Expert Reasoning Ledger
            </h3>

            {submissions.length === 0 ? (
              <div className="text-center py-6 bg-[#13131a]/40 rounded-xl border border-white/5">
                <FileText className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-[#acaab4]">No tasks submitted under this profile yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-[#acaab4] uppercase tracking-wider">
                      <th className="pb-3 pr-2">Instruction Prompt</th>
                      <th className="pb-3 px-2">Dataset Fund</th>
                      <th className="pb-3 px-2 text-center">QA Score</th>
                      <th className="pb-3 px-2 text-center">Points</th>
                      <th className="pb-3 pl-2 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-[#acaab4]">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition duration-300">
                        <td className="py-3 pr-2 font-medium text-white max-w-[220px] truncate">{sub.prompt}</td>
                        <td className="py-3 px-2 truncate max-w-[140px]">{sub.poolTitle}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-[#a5a5ff]">{sub.qualityScore || "-"}</td>
                        <td className="py-3 px-2 text-center font-mono font-semibold text-emerald-400">+{sub.pointsEarned?.toFixed(2)}</td>
                        <td className="py-3 pl-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider ${
                            sub.status === 'APPROVED' ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' :
                            'bg-amber-950/80 border border-amber-500/20 text-amber-400'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Razorpay UPI Payout Ledger */}
          <section className="glass-panel rounded-2xl p-6 border border-white/[0.01]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-display font-black uppercase text-[#e7e4ee] tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#a5a5ff]" />
                Razorpay Payout Ledger
              </h3>
              {payouts.some(p => p.status === 'PENDING') && (
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing
                </span>
              )}
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-6 bg-[#13131a]/40 rounded-xl border border-white/5">
                <Wallet className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-[#acaab4]">No payouts recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-[#acaab4] uppercase tracking-wider">
                      <th className="pb-3 pr-2">Transaction VPA</th>
                      <th className="pb-3 px-2">Pool Source</th>
                      <th className="pb-3 px-2">Royalty Stake</th>
                      <th className="pb-3 px-2">Gross (₹)</th>
                      <th className="pb-3 px-2 text-emerald-400">Net Paid</th>
                      <th className="pb-3 pl-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-[#acaab4]">
                    {payouts.map((pay) => {
                      const isPassive = pay.id.includes('royalty');
                      const poolObj = pools.find(p => p.id === pay.poolId);
                      const baseINR = poolObj ? poolObj.basePrice * 83 : 0;
                      const fivePercent = baseINR * 0.05;

                      return (
                        <tr key={pay.id} className="hover:bg-white/[0.02] transition duration-300">
                          <td className="py-3 pr-2 font-mono text-[10px] text-gray-300 truncate max-w-[120px]">{pay.payoutTransactionId}</td>
                          <td className="py-3 px-2 truncate max-w-[120px]">{pay.poolTitle}</td>
                          <td className="py-3 px-2">
                            {isPassive ? (
                              <span className="text-[10px] font-mono text-[#a5a5ff]">
                                5% split of ₹{baseINR.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#acaab4]/60">Upfront payment</span>
                            )}
                          </td>
                          <td className="py-3 px-2 font-semibold text-[#acaab4]">₹{pay.grossRoyalty.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-2 text-emerald-400 font-bold">₹{pay.netRoyalty.toLocaleString('en-IN')}</td>
                          <td className="py-3 pl-2 text-right">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                              pay.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {pay.status === 'SUCCESS' ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              )}
                              {pay.status === 'SUCCESS' ? "Paid" : "Processing"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ================= EXPERT ONBOARDING MODAL ================= */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel relative overflow-hidden animate-fade-in border border-white/5">
            <h3 className="text-base font-display font-black text-white mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#a5a5ff]" />
              Connect Expert Identity
            </h3>
            <p className="text-xs text-[#acaab4] mb-5 leading-relaxed">
              Register or update credentials linked to Razorpay for compounding royalty dividends and instant UPI distributions.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="Dr. Ananya Iyer"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-semibold focus:border-[#a5a5ff]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Holder Email</label>
                <input
                  type="email"
                  placeholder="ananya.iyer@axiom.ai"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-mono focus:border-[#a5a5ff]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Razorpay UPI ID (VPA)</label>
                <input
                  type="text"
                  placeholder="ananya@okaxis"
                  value={signupUpi}
                  onChange={(e) => setSignupUpi(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-mono focus:border-[#a5a5ff]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Expertise Calibration Tier</label>
                <select
                  value={signupTier}
                  onChange={(e) => setSignupTier(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-semibold focus:border-[#a5a5ff]/40 outline-none transition"
                >
                  <option value="BRONZE">Bronze Triage (1.0x multiplier)</option>
                  <option value="SILVER">Silver Triage (1.2x multiplier)</option>
                  <option value="GOLD">Gold Triage (1.5x multiplier)</option>
                  <option value="SENIOR">Senior Triage (1.7x multiplier)</option>
                  <option value="ELITE">Elite Triage (2.0x multiplier)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSignupOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#a5a5ff] text-[#1700a1] hover:bg-[#6462ec] hover:text-white text-xs font-bold rounded-xl transition"
                >
                  Register holder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= STRIPE CHECKOUT MODAL ================= */}
      {licensingPool && !purchaseSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel relative overflow-hidden animate-fade-in border border-white/5">
            <h3 className="text-base font-display font-black text-white mb-2 flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-[#a5a5ff]" />
              Secure Dataset Checkout
            </h3>
            <p className="text-xs text-[#acaab4] mb-4 leading-relaxed">
              Select commercial licensing model for dataset pool <strong className="text-white">{licensingPool.title}</strong>.
            </p>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1.5 font-bold">Licensing Tier</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLicenseType('SHARED')}
                    className={`p-3 rounded-xl border text-left transition duration-300 flex flex-col justify-between h-20 ${
                      licenseType === 'SHARED'
                        ? 'bg-[#a5a5ff]/10 border-[#a5a5ff]/30 text-[#a5a5ff]'
                        : 'bg-[#13131a] border-white/5 text-[#acaab4] hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider">Shared License</span>
                    <span className="text-sm font-black font-mono block mt-1">${licensingPool.basePrice.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLicenseType('EXCLUSIVE')}
                    className={`p-3 rounded-xl border text-left transition duration-300 flex flex-col justify-between h-20 ${
                      licenseType === 'EXCLUSIVE'
                        ? 'bg-[#a5a5ff]/10 border-[#a5a5ff]/30 text-[#a5a5ff]'
                        : 'bg-[#13131a] border-white/5 text-[#acaab4] hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-wider">Exclusive Buyout</span>
                    <span className="text-sm font-black font-mono block mt-1">${licensingPool.exclusivePrice.toLocaleString()}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Billing Email (Stripe Account)</label>
                <input
                  type="email"
                  placeholder="billing@openai.com"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-mono focus:border-[#a5a5ff]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Simulated Card Gateway</label>
                <div className="p-3 bg-[#13131a] border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-[#acaab4]">
                  <span className="text-white">••••  ••••  ••••  4242</span>
                  <span>12 / 28</span>
                  <span>738</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setLicensingPool(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkingOut}
                  className="flex-1 py-2.5 bg-[#a5a5ff] text-[#1700a1] hover:bg-[#6462ec] hover:text-white disabled:opacity-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Authorizing Stripe...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Checkout
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
