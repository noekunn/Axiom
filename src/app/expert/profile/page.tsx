"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  TrendingUp,
  Award,
  Calendar,
  Database,
  CheckCircle2,
  Mail,
  Copy,
  ChevronRight,
  MapPin,
  Flame,
  Star,
  AlertCircle
} from "lucide-react";
import ExpertLayout from "@/components/ExpertLayout";

interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE';
  upiId: string;
  points: number;
  totalEarnings: number;
  accuracy: number;
  tasksCompleted: number;
  joinedDate: string;
  domains: string[];
}

export default function ExpertProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [expertEmail, setExpertEmail] = useState('ananya.iyer@axiom.ai');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch expert data
  const fetchExpertData = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api?action=expert&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        // Build robust comprehensive mock attributes on top of core profile data
        setProfile({
          id: data.expert.id,
          name: data.expert.name,
          email: data.expert.email,
          tier: data.expert.tier,
          upiId: data.expert.upiId,
          points: data.expert.points || 842.9,
          totalEarnings: data.expert.totalEarnings || 115200,
          accuracy: 97.4,
          tasksCompleted: 42,
          joinedDate: "February 2026",
          domains: ["Bilingual Hinglish", "Clinical Diagnostic Reasoning", "Organic Chemistry"]
        });
      }
    } catch (err) {
      console.error("Failed to fetch expert details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertData(expertEmail);
  }, [expertEmail]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text);
    setAlert({ type: 'success', message: `${subject} copied to clipboard!` });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ELITE': return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20';
      case 'SENIOR': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'GOLD': return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20';
      case 'SILVER': return 'text-slate-300 border-slate-500/30 bg-slate-850/20';
      default: return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
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

      <div className="space-y-8 select-none">
        
        {/* Header section with switch */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Sovereign Node Profile</h2>
            <p className="text-xs text-[#acaab4] font-label mt-1">Inspect your high-accuracy credential triage record and verified expert node status.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-label">Switch Node:</span>
            <select
              value={expertEmail}
              onChange={(e) => setExpertEmail(e.target.value)}
              className="text-xs font-mono bg-[#121212] border border-[#262626] text-white rounded px-3 py-1.5 focus:outline-none hover:border-white/20 transition-all cursor-pointer"
            >
              <option value="ananya.iyer@axiom.ai">Dr. Ananya Iyer</option>
              <option value="rahul.banerjee@axiom.ai">Adv. Rahul Banerjee</option>
              <option value="priya.sharma@axiom.ai">Dr. Priya Sharma</option>
            </select>
          </div>
        </div>

        {loading || !profile ? (
          <div className="space-y-6">
            <div className="h-44 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-60 bg-white/5 rounded-xl animate-pulse"></div>
              <div className="h-60 bg-white/5 rounded-xl col-span-2 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            
            {/* Identity Card & Badges (4 Columns) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Profile Avatar Frame */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 mb-4 select-none">
                  <img
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPiAgYk0cgHkRdff-CdxETwSAhMYc4kPoWzET9rmyHgfZTqZnobyIlqScXnZru2ODKwEPD_fNdQhxi_4ynF726dZvpt9ZRFQinEUqtPwRNnJyF5XiL8GSArybev_ptHgSSyur1qWG4J6eo0rL8EXXRYUXjSke8WHRp0n1bNuWcmysvjarbCzweicvVWV0dCifv4uXU8_VkqEBWo-el-QBPrHSPfB_bwCeXlMWVappw0_KaxYm2eNE5dg8pk0-1gdo1HE8XNsWUy_1"
                  />
                </div>
                
                <h3 className="font-display font-bold text-lg text-white leading-tight">{profile.name}</h3>
                <span className={`inline-block px-3 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider mt-2.5 ${getTierColor(profile.tier)}`}>
                  {profile.tier} NODE TRIAGE
                </span>

                <div className="w-full h-[1px] bg-white/5 my-5" />

                <div className="w-full space-y-3.5 text-xs text-[#acaab4] text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                    <span className="font-mono text-zinc-300 block truncate max-w-[170px]" title={profile.email}>{profile.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Active Since</span>
                    <span className="text-zinc-300">{profile.joinedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Status</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[10px] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      VERIFIED NODE
                    </span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-white/5 my-5" />

                <div className="w-full space-y-2 text-left">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Cryptographic Key</span>
                  <div className="p-2.5 rounded bg-[#141313] border border-white/5 flex justify-between items-center gap-2">
                    <span className="font-mono text-[9px] text-zinc-400 block truncate max-w-[190px]">
                      axiom_node_key_0x_axm_{profile.id}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(`axiom_node_key_0x_axm_${profile.id}`, "Sovereign Node Key")}
                      className="text-zinc-500 hover:text-white transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Vetting Milestones Progress */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6">
                <h4 className="text-xs font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-white" />
                  Reputation Milestones
                </h4>
                
                <div className="space-y-4">
                  {[
                    { level: "BRONZE", points: "0 PTS", desc: "Basic triage credentials unlocked", done: true },
                    { level: "SILVER", points: "150 PTS", desc: "Unlock 1.2x task point multipliers", done: true },
                    { level: "GOLD", points: "300 PTS", desc: "Unlock Instant Razorpay UPI settlements", done: profile.points >= 300 },
                    { level: "SENIOR", points: "500 PTS", desc: "Become validator of regional Indic datasets", done: profile.points >= 500 },
                    { level: "ELITE", points: "800 PTS", desc: "Compounding 5% dataset buyout royalties active", done: profile.points >= 800 }
                  ].map((milestone, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold ${
                          milestone.done 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-transparent border-[#262626] text-zinc-600'
                        }`}>
                          ✓
                        </span>
                        {idx !== 4 && <div className={`w-[1px] h-9 border-l ${milestone.done ? 'border-emerald-500/20' : 'border-[#262626]'}`} />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold uppercase text-[10px] ${milestone.done ? 'text-white' : 'text-zinc-500'}`}>{milestone.level}</span>
                          <span className="font-mono text-[9px] text-zinc-500">({milestone.points})</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-snug">{milestone.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Analytics & Bounties Logs (8 Columns) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              {/* Key stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="bg-[#121212] border border-[#262626] p-5 rounded">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Consensus QA Accuracy</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight mt-1.5 font-mono">
                    {profile.accuracy}%
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold mt-1.5 block">
                    ↑ elite range accuracy
                  </span>
                </div>

                <div className="bg-[#121212] border border-[#262626] p-5 rounded">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Completed Bounties</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight mt-1.5 font-mono">
                    {profile.tasksCompleted}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono mt-1.5 block">
                    across {profile.domains.length} categories
                  </span>
                </div>

                <div className="bg-[#121212] border border-[#262626] p-5 rounded">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Reputation Points</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight mt-1.5 font-mono">
                    {profile.points.toFixed(1)}
                  </div>
                  <span className="text-[9px] text-[#ffffff] font-mono font-bold mt-1.5 block">
                    +{(profile.points * 0.12).toFixed(1)} earned this month
                  </span>
                </div>

              </div>

              {/* Verified Expertise Domains */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6">
                <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-white animate-pulse" />
                  Verified Expertise Triages
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.domains.map((domain, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#141313] border border-white/5 flex items-start gap-3">
                      <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-white flex-shrink-0 border border-white/10">
                        0{idx+1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block font-display">{domain}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 mt-1 font-mono uppercase tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified Triage
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-4 rounded-xl border border-dashed border-[#262626] flex items-center justify-center text-center cursor-pointer hover:border-white/20 transition-colors group">
                    <span className="text-xs font-semibold text-zinc-500 group-hover:text-white flex items-center gap-1.5 font-display transition duration-200">
                      Claim New Domain Challenge <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Point progression details and Razorpay configuration */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6">
                <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                  <Database className="w-4 h-4 text-white" />
                  Razorpay UPI Payment Calibrations
                </h4>
                
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded bg-[#141313] border border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase block font-mono">UPI VPA Address</span>
                      <span className="font-mono text-zinc-300 block font-semibold">{profile.upiId}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase block font-mono">Gateway Status</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono uppercase text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        INSTANT UPI ACTIVE
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#acaab4] leading-relaxed">
                    Under the Axiom smart-payout protocol, Razorpay instant payouts are dynamically routed as upfront point transfers. Every consensus QA approval matches <strong>1 PTS = ₹120 INR</strong>, directly routed to your calibrated UPI VPA address.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </ExpertLayout>
  );
}
