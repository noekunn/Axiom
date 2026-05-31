"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  FileText,
  Send
} from "lucide-react";
import ExpertLayout from "@/components/ExpertLayout";

interface Expert {
  id: string;
  name: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE';
  upiId: string;
  points: number;
  totalEarnings: number;
  razorpayStatus: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED';
  expertise?: string;
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

// Pre-seeded expert accounts for the demo switcher
const SEEDED_EXPERTS = [
  { email: 'ananya.iyer@axiom.ai', name: 'Dr. Ananya Iyer' },
  { email: 'rahul.banerjee@axiom.ai', name: 'Adv. Rahul Banerjee' },
  { email: 'priya.sharma@axiom.ai', name: 'Dr. Priya Sharma' },
];

export default function ExpertDashboard() {
  const [loading, setLoading] = useState(true);

  // Expert State
  const [expertEmail, setExpertEmail] = useState('ananya.iyer@axiom.ai');
  const [expertProfile, setExpertProfile] = useState<Expert | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);

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
      } else {
        setExpertProfile(null);
        setSubmissions([]);
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
    // Auto-approve seeded expert nodes for convenience
    if (typeof window !== "undefined") {
      const isSeeded = SEEDED_EXPERTS.some(exp => exp.email === email);
      if (isSeeded) {
        localStorage.setItem("axiom_expert_status", "Approved");
        localStorage.setItem("axiom_user_role", "expert");
        localStorage.setItem("axiom_user_email", email);
        const name = SEEDED_EXPERTS.find(exp => exp.email === email)?.name || "";
        localStorage.setItem("axiom_user_name", name);
        setExpertStatus("Approved");
      } else {
        const storedStatus = localStorage.getItem("axiom_expert_status") || "Shortlisted";
        setExpertStatus(storedStatus);
      }
    }
  }, []);

  // Auto trigger alerts timeout
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Read local storage on mount to identify active expert
  const [expertStatus, setExpertStatus] = useState<string>("Approved");

  useEffect(() => {
    let email = "ananya.iyer@axiom.ai";
    let status = "Approved";
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("axiom_user_email");
      const storedStatus = localStorage.getItem("axiom_expert_status");
      if (storedEmail) {
        email = storedEmail;
        setExpertEmail(storedEmail);
      }
      if (storedStatus) {
        status = storedStatus;
        setExpertStatus(storedStatus);
      } else {
        localStorage.setItem("axiom_expert_status", "Approved");
      }
    }
    fetchExpertData(email);
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

  return (
    <ExpertLayout>
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Expert Workbench</h2>
          <p className="text-xs text-[#acaab4] font-label mt-1">Claim active dataset instruction challenges and verify responses</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-label">Switch Node:</span>
          <select
            value={expertEmail}
            onChange={(e) => handleSwitchExpert(e.target.value)}
            className="text-xs font-mono bg-[#121212] border border-[#262626] text-white rounded px-3 py-1.5 focus:outline-none hover:border-white/20 transition-all cursor-pointer"
          >
            {SEEDED_EXPERTS.map((exp) => (
              <option key={exp.email} value={exp.email}>
                {exp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-12 gap-8 select-none">
        
        {/* Left Identity Column (Left 3 Columns) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div id="settings" className="bg-[#121212] border border-[#262626] rounded p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-display font-bold uppercase text-[#e7e4ee] tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-white" />
                Active Node
              </h3>
            </div>

            {loading ? (
              <div className="space-y-4">
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
                  <span className="text-xs font-mono text-zinc-400 mt-0.5 block truncate">{expertProfile.email}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-[#acaab4] uppercase tracking-wider block font-semibold">Triage Tier</span>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-white/10 border border-white/20 text-[#ffffff] mt-1 uppercase tracking-wide">
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
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded border border-[#262626] transition duration-200"
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
                  className="w-full py-2 bg-white text-black font-bold rounded hover:bg-zinc-200 transition duration-200"
                >
                  Connect Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area (Right 9 Columns) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8 animate-fade-in">
          
          {expertStatus === "Shortlisted" ? (
            <div className="bg-[#121212] border border-[#262626] rounded p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/[0.02] blur-[80px] pointer-events-none" />

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#ffffff] mb-2.5 block">
                  Onboarding Ledger &amp; Node Activation
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                  Sovereign Candidate Shortlist
                </h3>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-body-md">
                  Welcome to the Axiom Sovereign Network, <span className="text-white font-bold">{expertProfile?.name || "Candidate Specialist"}</span>. 
                  Your credentials have been successfully shortlisted from thousands of applicants. To activate your node and unlock mainnet claiming payouts, complete the final vetting activation checkpoint.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider">
                  NODE VERIFICATION CHECKLIST
                </h4>

                <div className="space-y-3.5">
                  <div className="flex gap-4 p-4 rounded bg-[#141313] border border-[#262626] items-start transition-all duration-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wide text-zinc-300 uppercase block">
                        Step 1: Application Ledger Submitted
                      </span>
                      <p className="text-zinc-500 text-xs font-body-md">
                        Onboarding application logged securely. Linked credential details match expert specifications.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-[#10B981] ml-auto shrink-0 bg-[#10B981]/15 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Complete
                    </span>
                  </div>

                  <div className="flex gap-4 p-4 rounded bg-[#141313] border border-[#262626] items-start transition-all duration-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wide text-zinc-300 uppercase block">
                        Step 2: Axiom Core Selection &amp; Shortlist
                      </span>
                      <p className="text-zinc-500 text-xs font-body-md">
                        Review of expert portfolio approved. Node successfully shortlisted into specialized domain group: <span className="text-white font-bold">{expertProfile?.expertise || "Biomedical/Technical"} Track</span>.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-[#10B981] ml-auto shrink-0 bg-[#10B981]/15 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Complete
                    </span>
                  </div>

                  <div className="flex gap-4 p-4 rounded bg-[#141313]/50 border border-white/10 items-start transition-all duration-300 hover:border-white/20">
                    <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5 animate-pulse">
                      3
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wide text-white uppercase block">
                        Step 3: Cognitive Domain Vetting V2 (PENDING)
                      </span>
                      <p className="text-zinc-400 text-xs font-body-md">
                        Axiom requires newly registered nodes to complete a simulated instruction evaluation task in the Vetting Arena to grade precision thresholds.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-white ml-auto shrink-0 bg-white/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                      Vetting Required
                    </span>
                  </div>

                  <div className="flex gap-4 p-4 rounded bg-[#141313] border border-[#262626] items-start transition-all duration-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wide text-zinc-300 uppercase block">
                        Step 4: Payout UPI VPA Verification
                      </span>
                      <p className="text-zinc-500 text-xs font-body-md">
                        Expert Razorpay UPI address linked: <span className="text-white font-mono">{expertProfile?.upiId || "upi@vpa"}</span>. Standard transactions connected.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-[#10B981] ml-auto shrink-0 bg-[#10B981]/15 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Complete
                    </span>
                  </div>

                  <div className="flex gap-4 p-4 rounded bg-[#141313]/30 border border-[#262626] items-start transition-all duration-300 opacity-50">
                    <span className="w-5 h-5 rounded-full bg-[#141313] text-zinc-600 border border-zinc-700 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                      🔑
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold tracking-wide text-zinc-500 uppercase block">
                        Step 5: Final Node Signature Activation
                      </span>
                      <p className="text-zinc-600 text-xs font-body-md">
                        Mainnet claim logs lock and perpetual token royalty allocations activate upon successful onboarding signoff.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-600 ml-auto shrink-0 bg-transparent px-2 py-0.5 border border-zinc-700 rounded font-bold uppercase tracking-wider">
                      Locked
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#262626] flex flex-col sm:flex-row items-center gap-4">
                <div className="text-xs text-zinc-400 font-body-md">
                  Ready to activate? Complete the cognitive task in the vetting arena now.
                </div>
                <Link href="/vetting" className="sm:ml-auto w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold px-8 py-3.5 rounded text-xs font-mono uppercase tracking-wider">
                    Enter Vetting Arena →
                  </button>
                </Link>
              </div>

            </div>
          ) : (
            <>
          
          {/* Expert Submission Workbench */}
          <section className="bg-[#121212] border border-[#262626] rounded p-6 relative overflow-hidden">
            <h3 className="text-sm font-display font-bold uppercase text-white mb-5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-white" />
              Expert Reasoning Workbench
            </h3>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Asset Pool */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Target Asset Pool</label>
                  <select
                    value={selectedPoolId}
                    onChange={(e) => setSelectedPoolId(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white focus:bg-[#141313] outline-none transition duration-200 cursor-pointer"
                    disabled={submittingTask}
                  >
                    {pools.map(pool => (
                      <option key={pool.id} value={pool.id}>{pool.title}</option>
                    ))}
                  </select>
                </div>

                {/* Multiplier Option */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Task Complexity Multiplier</label>
                  <select
                    value={difficultyMultiplier}
                    onChange={(e) => setDifficultyMultiplier(Number(e.target.value))}
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white focus:bg-[#141313] outline-none transition duration-200 cursor-pointer"
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
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Instruction Challenge Prompt</label>
                <textarea
                  placeholder="Specify clear, domain-specific instruction challenge..."
                  value={submissionPrompt}
                  onChange={(e) => setSubmissionPrompt(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white focus:bg-[#141313] outline-none transition duration-200 resize-none font-sans"
                  disabled={submittingTask}
                />
              </div>

              {/* Response Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-zinc-400 font-semibold block">Expert Reasoning Response</label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Consensus calibration scores best on high-density traces
                  </span>
                </div>
                <textarea
                  placeholder="Provide rich step-by-step reasoning details, incorporating Hinglish/bilingual mix where applicable..."
                  value={submissionResponse}
                  onChange={(e) => setSubmissionResponse(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded bg-[#141313] border border-[#262626] text-white text-xs font-mono focus:border-white focus:bg-[#141313] outline-none transition duration-200 resize-none text-[11px] leading-relaxed"
                  disabled={submittingTask}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingTask || !expertProfile}
                  className={`w-full py-3 text-xs font-bold rounded transition duration-200 flex items-center justify-center gap-2 ${
                    submittingTask 
                      ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed font-display uppercase tracking-wider font-bold'
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
            <div className="bg-[#121212] border border-[#262626] p-6 rounded relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 p-2.5 bg-white/5 rounded-bl-xl border-l border-b border-[#262626]">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  consensusReport.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-amber-400'
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
                <div className="p-4 rounded bg-[#141313] border border-[#262626] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">Llama 3.3 Score</span>
                      <span className="text-[9px] text-zinc-500 font-mono">llama-3.3-70b</span>
                    </div>
                    <p className="text-xs text-[#acaab4] italic leading-relaxed">
                      &ldquo;{consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('groq'))?.reasoning || "Evaluation completed successfully by Llama-3.3 parser."}&rdquo;
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#262626] flex justify-between items-center text-xs">
                    <span className="text-[#acaab4]">Adjudication score:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {(() => {
                        const score = consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('groq'))?.score ?? 0.85;
                        return score > 1 ? (score / 100).toFixed(2) : score.toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>

                {/* OpenAI evaluation */}
                <div className="p-4 rounded bg-[#141313] border border-[#262626] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">GPT-4o Score</span>
                      <span className="text-[9px] text-zinc-500 font-mono">gpt-4o</span>
                    </div>
                    <p className="text-xs text-[#acaab4] italic leading-relaxed">
                      &ldquo;{consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('openai'))?.reasoning || "Evaluation completed successfully by GPT-4o parser."}&rdquo;
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#262626] flex justify-between items-center text-xs">
                    <span className="text-[#acaab4]">Adjudication score:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {(() => {
                        const score = consensusReport.evaluations?.find(e => e.provider.toLowerCase().includes('openai'))?.score ?? 0.90;
                        return score > 1 ? (score / 100).toFixed(2) : score.toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Adjudication Banner */}
              <div className="p-4 rounded bg-[#141313] border border-[#262626] flex flex-col sm:flex-row justify-between items-center gap-4">
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
                  <div className="px-3.5 py-2 rounded bg-[#121212] border border-[#262626] text-center font-mono">
                    <span className="text-[9px] text-gray-500 block uppercase font-sans">Razorpay UPI Transfer</span>
                    <span className="text-xs font-bold text-emerald-400">₹{(consensusReport.pointsEarned * 120).toLocaleString('en-IN')} paid</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reasoning Contributions Historical Ledger */}
          <section className="bg-[#121212] border border-[#262626] rounded p-6">
            <h3 className="text-xs font-display font-bold uppercase text-[#e7e4ee] tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              Reasoning Contributions Ledger
            </h3>

            {submissions.length === 0 ? (
              <div className="text-center py-6 bg-[#141313] rounded border border-[#262626]">
                <FileText className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-[#acaab4]">No tasks submitted under this profile yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#262626] text-[9px] font-bold text-[#acaab4] uppercase tracking-wider">
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
                        <td className="py-3.5 pr-2 font-medium text-white max-w-[220px] truncate">{sub.prompt}</td>
                        <td className="py-3.5 px-2 truncate max-w-[140px]">{sub.poolTitle}</td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-[#ffffff]">{sub.qualityScore || "-"}</td>
                        <td className="py-3.5 px-2 text-center font-mono font-semibold text-emerald-400">+{sub.pointsEarned?.toFixed(2)}</td>
                        <td className="py-3.5 pl-2 text-right">
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
            </>
          )}
        </div>
      </div>

      {/* ================= EXPERT ONBOARDING MODAL ================= */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 bg-[#121212] border border-[#262626] rounded relative overflow-hidden animate-fade-in">
            <h3 className="text-base font-display font-bold text-white mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-white" />
              Connect Expert Identity
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Register or update credentials linked to Razorpay for compounding royalty dividends and instant UPI distributions.
            </p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1 font-mono">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="Dr. Ananya Iyer"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white focus:bg-[#141313] outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1 font-mono">Holder Email</label>
                <input
                  type="email"
                  placeholder="ananya.iyer@axiom.ai"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-mono focus:border-white focus:bg-[#141313] outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1 font-mono">Razorpay UPI ID (VPA)</label>
                <input
                  type="text"
                  placeholder="ananya@okaxis"
                  value={signupUpi}
                  onChange={(e) => setSignupUpi(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-mono focus:border-white focus:bg-[#141313] outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1 font-mono">Expertise Calibration Tier</label>
                <select
                  value={signupTier}
                  onChange={(e) => setSignupTier(e.target.value as any)}
                  className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white focus:bg-[#141313] outline-none transition"
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
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded border border-[#262626] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded transition font-mono uppercase"
                >
                  Register holder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ExpertLayout>
  );
}
