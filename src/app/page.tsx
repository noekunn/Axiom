"use client";

import React, { useState, useEffect } from "react";
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
  Send
} from "lucide-react";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<'expert' | 'client'>('expert');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expert Sign Up Action
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupUpi) {
      setAlert({ type: 'error', message: 'Please fill in all the details' });
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
        setAlert({ type: 'success', message: 'Expert connected successfully!' });
        setExpertEmail(signupEmail);
        setExpertProfile(data.expert);
        setIsSignupOpen(false);
        fetchExpertData(signupEmail);
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
            ? `Approved! Points registered. Baseline payment sent to UPI.`
            : `Submitted! Response routed for human adjudication.`
        });
        setSubmissionPrompt('');
        setSubmissionResponse('');
        // Reload expert data
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
      // Simulate Stripe API checkout
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch('/api?action=buy', {
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
          token: `cf-r2-download-token-${Math.random().toString(36).substring(2, 15)}-${licensingPool.id}`,
          poolTitle: licensingPool.title
        });
        setAlert({ type: 'success', message: 'Dataset licensed successfully! Check download credentials.' });
        fetchPools(); // refresh pools (check archived status)
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
      
      const res = await fetch('/api?action=finetune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      });
      const data = await res.json();
      if (data.success) {
        setFineTuningJob(data);
        
        // Simulate fine-tuning steps
        setTimeout(() => setFineTuningStatus('running'), 2000);
        setTimeout(() => setFineTuningStatus('completed'), 6000);
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to trigger fine-tune' });
        setFineTuningStatus('idle');
      }
    } catch {
      setAlert({ type: 'error', message: 'Network error fine-tuning model' });
      setFineTuningStatus('idle');
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#08080c] text-[#f1f1f6] p-4 sm:p-8 flex flex-col justify-between">
      {/* Alert Banner */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border ${
          alert.type === 'success' 
            ? 'bg-emerald-955/80 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-955/80 border-rose-500/30 text-rose-300'
        } shadow-lg transition-all duration-300 transform translate-y-0 scale-100`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl glass-card backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 pointer-events-none" />
          
          <div className="flex items-center gap-3 relative">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 glow-emerald">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
                AXIOM <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">MVP</span>
              </h1>
              <p className="text-xs text-[#acaab4]">Decentralized Royalty-Backed Dataset Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 sm:mt-0 p-1 rounded-xl bg-black/40 border border-white/5">
            <button
              onClick={() => setActiveTab('expert')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'expert'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-[#acaab4] hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Expert Workbench
            </button>
            <button
              onClick={() => setActiveTab('client')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'client'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-[#acaab4] hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Client Licensing Portal
            </button>
          </div>
        </header>

        {/* ==================== TAB A: EXPERT WORKBENCH ==================== */}
        {activeTab === 'expert' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Hand: Profile & Statistics */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Expert Profile Panel */}
              <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Expert Identity
                </h3>

                {loading ? (
                  /* Loading Skeleton */
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-white/5 rounded w-2/3"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-10 bg-white/5 rounded mt-4"></div>
                  </div>
                ) : expertProfile ? (
                  /* Connected State */
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[#acaab4] uppercase tracking-wider">Expert Name</p>
                      <h4 className="text-base font-semibold text-white mt-0.5">{expertProfile.name}</h4>
                    </div>
                    <div>
                      <p className="text-xs text-[#acaab4] uppercase tracking-wider">Credential Email</p>
                      <p className="text-sm font-mono mt-0.5 text-gray-300">{expertProfile.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#acaab4] uppercase tracking-wider">Expertise Tier</p>
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-400 mt-1 uppercase tracking-wide">
                          {expertProfile.tier} (
                          {expertProfile.tier === 'ELITE' ? '2.0x' : 
                           expertProfile.tier === 'SENIOR' ? '1.7x' : 
                           expertProfile.tier === 'GOLD' ? '1.5x' : 
                           expertProfile.tier === 'SILVER' ? '1.2x' : '1.0x'}
                           )
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-[#acaab4] uppercase tracking-wider">Razorpay Payouts</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Connected UPI
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#acaab4] uppercase tracking-wider">UPI VPA</p>
                      <p className="text-xs font-mono mt-0.5 text-emerald-300/80">{expertProfile.upiId}</p>
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
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-[#f1f1f6] text-xs font-semibold rounded-xl border border-white/5 hover:border-white/10 transition duration-300"
                      >
                        Adjust Credentials / Switch Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Disconnected State */
                  <div className="text-center py-6 space-y-4">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">No Connected Expert Credentials</h4>
                      <p className="text-xs text-[#acaab4] mt-1">Sign up or enter pre-seeded credentials to load active royalty balances.</p>
                    </div>
                    <button
                      onClick={() => setIsSignupOpen(true)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl transition duration-300 glow-emerald"
                    >
                      Connect Expert Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Economic Ledger Statistics */}
              <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Royalty Ledger
                </h3>

                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-white/5 rounded"></div>
                      <div className="h-16 bg-white/5 rounded"></div>
                    </div>
                    <div className="h-20 bg-white/5 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Points & Earnings Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 text-center">
                        <span className="text-xs text-[#acaab4] block">Accumulated Points</span>
                        <span className="text-2xl font-bold text-white block mt-1 glow-text-emerald font-mono">
                          {expertProfile ? expertProfile.points.toFixed(1) : "0.0"}
                        </span>
                      </div>
                      <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 text-center">
                        <span className="text-xs text-[#acaab4] block">Total Inflow</span>
                        <span className="text-lg font-bold text-emerald-400 block mt-1.5 font-mono">
                          ₹{expertProfile ? expertProfile.totalEarnings.toLocaleString('en-IN') : "0"}
                        </span>
                      </div>
                    </div>

                    {/* Passive Income Breakdown */}
                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-1 bg-indigo-500/10 rounded-bl-xl border-l border-b border-indigo-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      
                      <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Passive Royalty Dividends</h4>
                      <p className="text-[11px] text-[#acaab4] leading-relaxed">
                        Earn a <strong className="text-white">5% perpetual royalty</strong> split pro-rata based on your point contributions every time pool datasets are resold.
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-indigo-500/10 pt-3">
                        <span className="text-xs text-gray-300">Estimated Active Pools:</span>
                        <span className="text-xs font-bold text-white font-mono">
                          {submissions.reduce((acc, curr) => {
                            if (!acc.includes(curr.poolId)) acc.push(curr.poolId);
                            return acc;
                          }, [] as string[]).length} Pools
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Hand: Submissions Board & Consensus QA Report */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Task Submission Form */}
              <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400 animate-pulse-glow rounded-full" />
                  Active Dataset Task Board
                </h3>

                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Select Asset Pool */}
                    <div>
                      <label className="text-xs text-[#acaab4] font-medium block mb-1">Target Asset Pool / Fund</label>
                      <select
                        value={selectedPoolId}
                        onChange={(e) => setSelectedPoolId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300"
                        disabled={submittingTask}
                      >
                        {pools.length === 0 ? (
                          <option>Loading pools...</option>
                        ) : (
                          pools.map(pool => (
                            <option key={pool.id} value={pool.id}>{pool.title}</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Difficulty Multiplier */}
                    <div>
                      <label className="text-xs text-[#acaab4] font-medium block mb-1">Complexity / Difficulty Multiplier</label>
                      <select
                        value={difficultyMultiplier}
                        onChange={(e) => setDifficultyMultiplier(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300"
                        disabled={submittingTask}
                      >
                        <option value="1.0">Standard Reasoning (1.0x)</option>
                        <option value="1.2">Multi-Step Medical/Legal Diagnostic (1.2x)</option>
                        <option value="1.5">Bilingual Code-Mixed Expert Synthesizer (1.5x)</option>
                        <option value="2.0">Hard Consensus Cross-Examination (2.0x)</option>
                      </select>
                    </div>

                  </div>

                  {/* Submission Prompt */}
                  <div>
                    <label className="text-xs text-[#acaab4] font-medium block mb-1">High-Fidelity Prompt Instruction</label>
                    <textarea
                      placeholder="e.g. Patient complaining of acute chest pain, explain diagnostics under West Bengal clinical limits..."
                      value={submissionPrompt}
                      onChange={(e) => setSubmissionPrompt(e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300 resize-none"
                      disabled={submittingTask}
                    />
                  </div>

                  {/* Submission Response */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-[#acaab4] font-medium block">Reasoning Trace & Domain Expert Response</label>
                      <span className="text-[10px] text-[#5e5ce6] font-semibold uppercase tracking-wider animate-pulse">Min. 100 characters for optimal consensus approval</span>
                    </div>
                    <textarea
                      placeholder="Dekhiye patient agar chhaban acidity ya pressure ki complaint kare toh primary care me immediate ECG trigger hona chahiye. Emergency clinical steps me sublingual Aspirin 325mg chewable administer karna aur emergency ambulance summon karna key guidelines hain..."
                      value={submissionResponse}
                      onChange={(e) => setSubmissionResponse(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300 resize-none font-mono text-[11px] leading-relaxed"
                      disabled={submittingTask}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingTask || !expertProfile}
                      className={`w-full py-3 text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center gap-2 ${
                        submittingTask 
                          ? 'bg-[#12221b] border border-emerald-500/30 text-emerald-400 cursor-not-allowed animate-pulse-glow'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-black glow-emerald disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {submittingTask ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Consensus QA Vetting in Progress (Llama 3.3 + Claude)...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit to Consensus QA Pipeline
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Consensus QA Network Report Overlay / Results Panel */}
              {consensusReport && (
                <div className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-md glow-violet relative overflow-hidden animate-fade-in">
                  <div className="absolute top-0 right-0 p-2 bg-indigo-500/10 rounded-bl-xl border-l border-b border-indigo-500/20">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                  </div>
                  
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className={`w-3 h-3 rounded-full ${
                      consensusReport.status === 'APPROVED' ? 'bg-emerald-400' :
                      consensusReport.status === 'BORDERLINE' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    <h3 className="text-base font-bold text-white">Consensus AI QA Calibration Report</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                      Task: {consensusReport.id}
                    </span>
                  </div>

                  <p className="text-xs text-[#acaab4] mb-4">
                    Our multi-model consensus network evaluated the structural coherence, linguistic alignment (Hinglish/Bilingual), and clinical/legal validity of your submission:
                  </p>

                  {/* Side by side Model Evaluations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {consensusReport.evaluations?.map((evaluation, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white block">{evaluation.provider}</span>
                            <span className="text-[10px] text-indigo-400 font-mono">{evaluation.modelName}</span>
                          </div>
                          <p className="text-xs text-[#acaab4] leading-relaxed italic">
                            &ldquo;{evaluation.reasoning}&rdquo;
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
                          <span className="text-[10px] text-[#acaab4]">Score Metric</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">{evaluation.score}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adjudication Outcome */}
                  <div className="p-4 rounded-xl bg-black/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block">Consensus Verdict</span>
                      <span className={`text-base font-bold tracking-wide ${
                        consensusReport.status === 'APPROVED' ? 'text-emerald-400 glow-text-emerald' :
                        consensusReport.status === 'BORDERLINE' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {consensusReport.status}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block">Points Credited</span>
                      <span className="text-base font-bold text-white font-mono">+{consensusReport.pointsEarned?.toFixed(2)} Points</span>
                    </div>

                    {consensusReport.pointsEarned && consensusReport.pointsEarned > 0 && (
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/20 text-center">
                        <span className="text-[9px] text-[#acaab4] uppercase tracking-wider block">UPI Baseline Cash</span>
                        <span className="text-xs font-bold text-emerald-400">₹{(consensusReport.pointsEarned * 120).toLocaleString('en-IN')} paid</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submissions & Historical LEDGER */}
              <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Your Reasoning Contributions
                </h3>

                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-white/5 rounded"></div>
                    <div className="h-10 bg-white/5 rounded"></div>
                    <div className="h-10 bg-white/5 rounded"></div>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5">
                    <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-[#acaab4]">No tasks submitted under this profile yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-bold text-[#acaab4] uppercase tracking-wider">
                          <th className="pb-3 pr-2">Task Prompt</th>
                          <th className="pb-3 px-2">Dataset Fund</th>
                          <th className="pb-3 px-2 text-center">Score</th>
                          <th className="pb-3 px-2 text-center">Points</th>
                          <th className="pb-3 pl-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-white/5 transition duration-300">
                            <td className="py-3 pr-2 font-medium text-white max-w-[200px] truncate">{sub.prompt}</td>
                            <td className="py-3 px-2 text-[#acaab4] truncate max-w-[120px]">{sub.poolTitle}</td>
                            <td className="py-3 px-2 text-center font-mono font-bold text-indigo-300">{sub.qualityScore || "-"}</td>
                            <td className="py-3 px-2 text-center font-mono font-semibold text-emerald-400">+{sub.pointsEarned?.toFixed(2)}</td>
                            <td className="py-3 pl-2 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                                sub.status === 'APPROVED' ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' :
                                sub.status === 'BORDERLINE' ? 'bg-amber-950/80 border border-amber-500/20 text-amber-400' :
                                'bg-rose-950/80 border border-rose-500/20 text-rose-400'
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
              </div>

              {/* UPI Transaction Ledger */}
              <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Razorpay UPI Payout Ledger
                </h3>

                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-white/5 rounded"></div>
                    <div className="h-10 bg-white/5 rounded"></div>
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5">
                    <Wallet className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-[#acaab4]">No recent payouts recorded.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-bold text-[#acaab4] uppercase tracking-wider">
                          <th className="pb-3 pr-2">Transaction ID</th>
                          <th className="pb-3 px-2">Pool Source</th>
                          <th className="pb-3 px-2">Gross Payout</th>
                          <th className="pb-3 px-2">Net (2% fees)</th>
                          <th className="pb-3 pl-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {payouts.map((pay) => (
                          <tr key={pay.id} className="hover:bg-white/5 transition duration-300">
                            <td className="py-3 pr-2 font-mono text-[10px] text-gray-300">{pay.payoutTransactionId}</td>
                            <td className="py-3 px-2 text-[#acaab4] max-w-[150px] truncate">{pay.poolTitle}</td>
                            <td className="py-3 px-2 text-white font-semibold">₹{pay.grossRoyalty.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-2 text-emerald-400 font-bold">₹{pay.netRoyalty.toLocaleString('en-IN')}</td>
                            <td className="py-3 pl-2 text-right">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                Success
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB B: CLIENT LICENSING PORTAL ==================== */}
        {activeTab === 'client' && (
          <div className="space-y-8">
            
            {/* Header Description */}
            <div className="p-6 rounded-2xl glass-card backdrop-blur-md relative overflow-hidden text-center sm:text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Axiom Data-Asset Marketplace
              </h2>
              <p className="text-xs sm:text-sm text-[#acaab4] mt-2 max-w-3xl leading-relaxed">
                Axiom aggregates raw reasoning instruction datasets into themed index funds, locking in quality via automated QA consensus. Clients license pools non-exclusively or opt for exclusive buyouts, unlocking immediate Cloudflare R2 downloads and OpenAI fine-tuning connections.
              </p>
            </div>

            {/* Main Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pools.length === 0 ? (
                /* Skeleton Loader for Pools */
                [1, 2, 3].map(i => (
                  <div key={i} className="p-6 rounded-2xl glass-card animate-pulse space-y-4">
                    <div className="h-6 bg-white/5 rounded w-3/4"></div>
                    <div className="h-20 bg-white/5 rounded"></div>
                    <div className="h-10 bg-white/5 rounded"></div>
                  </div>
                ))
              ) : (
                pools.map(pool => (
                  <div key={pool.id} className="p-6 rounded-2xl glass-card glass-card-hover flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-indigo-500/20 to-emerald-500/20 pointer-events-none" />
                    
                    <div>
                      {/* Category & Languages */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                          {pool.category}
                        </span>
                        
                        <div className="flex gap-1.5">
                          {pool.languages.map((l, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-gray-300">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white mb-2">{pool.title}</h3>
                      
                      {/* Description */}
                      <p className="text-xs text-[#acaab4] leading-relaxed mb-4">{pool.description}</p>

                      {/* Metadata Statistics */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 border border-white/5 rounded-xl mb-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#acaab4] block">Accumulated Points:</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{pool.totalPoints.toFixed(1)} pts</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#acaab4] block">Resale Licenses:</span>
                          <span className="text-sm font-bold text-emerald-400 block mt-0.5">{pool.licenseCount} sold</span>
                        </div>
                      </div>

                      {/* Sample Prompt Preview */}
                      <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl mb-4 text-xs font-mono leading-relaxed">
                        <span className="text-[9px] text-indigo-400 uppercase tracking-wider font-bold block mb-1">Dataset Instruction Prompt Sample:</span>
                        <p className="text-[#acaab4] line-clamp-3 text-[10px]">
                          &ldquo;{pool.samplePrompt}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-300">Standard Shared License:</span>
                        <span className="text-white font-bold font-mono">${pool.basePrice.toLocaleString()} USD</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs font-medium pb-2">
                        <span className="text-gray-300">Exclusive Buyout:</span>
                        <span className="text-indigo-400 font-bold font-mono">${pool.exclusivePrice.toLocaleString()} USD</span>
                      </div>

                      <button
                        onClick={() => {
                          setLicensingPool(pool);
                          setLicenseType('SHARED');
                          setPurchaseSuccess(null);
                        }}
                        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center gap-1.5"
                      >
                        <LockIcon className="w-3.5 h-3.5" />
                        License Dataset Pool
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Purchase Success State: Secure Token & OpenAI Fine Tuning trigger */}
            {purchaseSuccess && (
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 backdrop-blur-md glow-emerald relative overflow-hidden animate-fade-in max-w-4xl mx-auto">
                <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 rounded-bl-xl border-l border-b border-emerald-500/20">
                  <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                </div>

                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Stripe Checkout Completed & Verified
                </h3>
                
                <p className="text-xs text-[#acaab4] leading-relaxed mb-4">
                  {purchaseSuccess.message} Standard Shared and Exclusive licensing models have updated the royalty distributions. Your secure Cloudflare R2 download credentials are ready:
                </p>

                {/* Cloudflare R2 secure details */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono text-xs space-y-3 mb-6 relative">
                  <div>
                    <span className="text-[10px] text-[#acaab4] block uppercase">Dataset Target Pool</span>
                    <span className="text-white font-bold">{purchaseSuccess.poolTitle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#acaab4] block uppercase">Cloudflare R2 Download Token (72 Hours Egress Free)</span>
                    <span className="text-emerald-400 font-semibold truncate block max-w-full select-all">{purchaseSuccess.token}</span>
                  </div>
                  
                  <div className="pt-2">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setAlert({ type: 'success', message: 'Starting secure JSONL dataset download...' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-white transition duration-300 font-sans"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSONL Dataset
                    </a>
                  </div>
                </div>

                {/* OpenAI Fine Tuning Webhook integration */}
                <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    OpenAI Fine-Tuning Integration Webhook
                  </h4>
                  <p className="text-xs text-[#acaab4] leading-relaxed mb-4">
                    co-optimize this licensed dataset and trigger a Supervised Fine-Tuning (SFT) job on OpenAI&apos;s models (<code className="text-white">gpt-4o-mini</code> or <code className="text-white">gpt-4o</code>) directly via our webhook.
                  </p>

                  {fineTuningStatus === 'idle' ? (
                    <button
                      onClick={() => triggerFineTuning(licensingPool?.id || '')}
                      className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition duration-300 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Trigger OpenAI Fine-Tuning
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Job Status Banner */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Loader2 className={`w-3.5 h-3.5 text-indigo-400 ${fineTuningStatus !== 'completed' ? 'animate-spin' : ''}`} />
                          <span>Job: <strong className="text-white">{fineTuningJob?.jobId}</strong></span>
                        </div>
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            fineTuningStatus === 'submitting' ? 'bg-indigo-955 text-indigo-400 border border-indigo-500/30' :
                            fineTuningStatus === 'running' ? 'bg-amber-955 text-amber-400 border border-amber-500/30 animate-pulse' :
                            'bg-emerald-955 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {fineTuningStatus === 'submitting' ? 'Validating Dataset' :
                             fineTuningStatus === 'running' ? 'Training Active' : 'Training Completed!'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Logs */}
                      <div className="p-3 bg-black/80 rounded-lg border border-white/5 font-mono text-[10px] leading-relaxed text-gray-400 h-28 overflow-y-auto">
                        <p>[INFO] Initializing Supervised Fine-Tuning (SFT) request on Axiom datasets...</p>
                        <p>[INFO] Uploading formatted JSONL dataset file to OpenAI files API...</p>
                        {fineTuningStatus !== 'submitting' && (
                          <>
                            <p className="text-indigo-300">[INFO] File upload success! File ID: file-AxIoM982a7d6d</p>
                            <p>[INFO] Creating fine-tuning job model targeted: gpt-4o...</p>
                            <p className="text-indigo-300">[INFO] Job initiated! Job ID: {fineTuningJob?.jobId}</p>
                          </>
                        )}
                        {fineTuningStatus === 'running' && (
                          <>
                            <p className="text-amber-400">[TRAIN] Hyperparameters loaded. Epoch 1/3 in progress...</p>
                            <p className="text-amber-400">[TRAIN] Loss reduction trend: 1.842 -&gt; 0.941...</p>
                          </>
                        )}
                        {fineTuningStatus === 'completed' && (
                          <>
                            <p className="text-amber-400">[TRAIN] Loss reduction trend: 0.941 -&gt; 0.224...</p>
                            <p className="text-emerald-400">[SUCCESS] OpenAI Model gpt-4o successfully fine-tuned! Custom Model Name: ft:gpt-4o:axiom:medical-hinglish-v1</p>
                            <p className="text-emerald-400">[SUCCESS] Model deployed for inference endpoints.</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="mt-16 pt-8 border-t border-white/5 max-w-7xl mx-auto w-full text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        <p className="text-xs text-[#acaab4] font-medium">&copy; 2026 Axiom Labs. All rights reserved. Outskill × OpenAI AI Builders Hackathon MVP.</p>
        
        <div className="flex gap-6 text-xs text-[#acaab4]">
          <a href="#" className="hover:text-emerald-400 transition" onClick={(e) => { e.preventDefault(); setAlert({ type: 'success', message: "Razorpay portal active. Contact: payments@axiom.ai" }); }}>Razorpay Payouts</a>
          <a href="#" className="hover:text-emerald-400 transition" onClick={(e) => { e.preventDefault(); setAlert({ type: 'success', message: "Stripe Billing portal active. Contact: accounts@axiom.ai" }); }}>Stripe Billing</a>
          <a href="#" className="hover:text-emerald-400 transition" onClick={(e) => { e.preventDefault(); setAlert({ type: 'success', message: "OpenAI fine-tuning endpoint verified and active." }); }}>OpenAI Webhooks</a>
        </div>
      </footer>

      {/* ==================== SIGNUP MODAL (EXPERT PROFILE MODAL) ==================== */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card backdrop-blur-md glow-emerald relative overflow-hidden animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Connect Expert Profile
            </h3>
            <p className="text-xs text-[#acaab4] mb-6">
              Enter your credentials to connect with Razorpay for instant UPI payouts and access active passive-income royalty ledgers.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="Dr. Ananya Iyer"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300"
                />
              </div>

              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Credential Email (Pre-seeded matches record)</label>
                <input
                  type="email"
                  placeholder="ananya.iyer@axiom.ai"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300 font-mono"
                />
                <span className="text-[9px] text-[#acaab4] block mt-1">Pre-seeded matching emails: <code className="text-indigo-400">ananya.iyer@axiom.ai</code>, <code className="text-indigo-400">rahul.banerjee@axiom.ai</code>, <code className="text-indigo-400">priya.sharma@axiom.ai</code></span>
              </div>

              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Razorpay Payouts UPI ID (VPA)</label>
                <input
                  type="text"
                  placeholder="ananya.iyer@okaxis"
                  value={signupUpi}
                  onChange={(e) => setSignupUpi(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Expertise Tier Selection</label>
                <select
                  value={signupTier}
                  onChange={(e) => setSignupTier(e.target.value as 'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE')}
                  className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-emerald-500/50 outline-none transition duration-300"
                >
                  <option value="BRONZE">Bronze Specialist (1.0x multiplier)</option>
                  <option value="SILVER">Silver Specialist (1.2x multiplier)</option>
                  <option value="GOLD">Gold Specialist (1.5x multiplier)</option>
                  <option value="SENIOR">Senior Specialist (1.7x multiplier)</option>
                  <option value="ELITE">Elite Specialist (2.0x multiplier)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSignupOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-[#f1f1f6] text-xs font-semibold rounded-xl border border-white/5 hover:border-white/10 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl transition duration-300 glow-emerald"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== STRIPE LICENSING CHECKOUT MODAL ==================== */}
      {licensingPool && !purchaseSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card backdrop-blur-md glow-violet relative overflow-hidden animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
              Stripe Dataset Licensing Checkout
            </h3>
            <p className="text-xs text-[#acaab4] mb-4">
              Select your commercial licensing model to acquire Cloudflare R2 download tokens for the thematic index pool <strong className="text-white">{licensingPool.title}</strong>.
            </p>

            <form onSubmit={handlePurchase} className="space-y-4">
              
              {/* Select License Type */}
              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Commercial Licensing Model</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLicenseType('SHARED')}
                    className={`p-3 rounded-xl border text-left transition duration-300 flex flex-col justify-between h-20 ${
                      licenseType === 'SHARED'
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                        : 'bg-[#191921] border-white/5 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Standard Shared</span>
                    <span className="text-base font-extrabold font-mono block mt-1">${licensingPool.basePrice.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLicenseType('EXCLUSIVE')}
                    className={`p-3 rounded-xl border text-left transition duration-300 flex flex-col justify-between h-20 ${
                      licenseType === 'EXCLUSIVE'
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 font-bold'
                        : 'bg-[#191921] border-white/5 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Exclusive Buyout</span>
                    <span className="text-base font-extrabold font-mono block mt-1">${licensingPool.exclusivePrice.toLocaleString()}</span>
                  </button>
                </div>
                <span className="text-[9px] text-[#acaab4] block mt-1.5">
                  {licenseType === 'SHARED' 
                    ? 'Non-exclusive. Dataset remains active on the marketplace for subsequent buyers.' 
                    : 'Dataset pool is immediately ARCHIVED and removed from all marketplace active listings to ensure legal competitive advantages.'
                  }
                </span>
              </div>

              {/* Enterprise Billing Email */}
              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Enterprise Billing Email (Stripe Registered)</label>
                <input
                  type="email"
                  placeholder="billing@openai.com"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#191921] border border-white/10 text-white text-xs font-medium focus:border-indigo-500/50 outline-none transition duration-300 font-mono"
                />
              </div>

              {/* Stripe Payment Simulator Card Inputs */}
              <div>
                <label className="text-xs text-[#acaab4] font-medium block mb-1">Secure Card Details (Simulated Gateway)</label>
                <div className="p-3 bg-[#191921] border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono text-[#acaab4]">
                  <span className="text-white">••••  ••••  ••••  4242</span>
                  <span>12 / 28</span>
                  <span>738</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setLicensingPool(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-[#f1f1f6] text-xs font-semibold rounded-xl border border-white/5 hover:border-white/10 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkingOut}
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-950 disabled:text-indigo-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition duration-300 glow-violet flex items-center justify-center gap-1.5"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Authorizing Stripe...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Authorize & Checkout
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
