"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Globe
} from "lucide-react";
import ExpertLayout from "@/components/ExpertLayout";

interface Expert {
  id: string;
  name: string;
  email: string;
  upiId: string;
  points: number;
  totalEarnings: number;
  razorpayStatus: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED';
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE';
}

const SEEDED_EXPERTS = [
  { email: 'ananya.iyer@axiom.ai', name: 'Dr. Ananya Iyer' },
  { email: 'rahul.banerjee@axiom.ai', name: 'Adv. Rahul Banerjee' },
  { email: 'priya.sharma@axiom.ai', name: 'Dr. Priya Sharma' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [expertEmail, setExpertEmail] = useState('ananya.iyer@axiom.ai');
  const [expertProfile, setExpertProfile] = useState<Expert | null>(null);

  // Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUpi, setSignupUpi] = useState('');
  const [signupTier, setSignupTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'SENIOR' | 'ELITE'>('GOLD');
  const [updating, setUpdating] = useState(false);

  // Error/Success Notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch expert data
  const fetchExpertData = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api?action=expert&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setExpertProfile(data.expert);
        setSignupName(data.expert.name);
        setSignupEmail(data.expert.email);
        setSignupUpi(data.expert.upiId);
        setSignupTier(data.expert.tier);
      } else {
        setExpertProfile(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchExpert = useCallback((email: string) => {
    setExpertEmail(email);
    fetchExpertData(email);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupUpi) {
      setAlert({ type: 'error', message: 'Please fill in all profile fields.' });
      return;
    }

    try {
      setUpdating(true);
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
        setAlert({ type: 'success', message: 'Expert profile connected/updated successfully!' });
        setExpertProfile(data.expert);
        fetchExpertData(signupEmail);
      } else {
        setAlert({ type: 'error', message: data.error || 'Update failed' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to update expert profile credentials.' });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchExpertData(expertEmail);
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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

      <div className="space-y-8 select-none max-w-4xl">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Profile Credentials</h2>
            <p className="text-xs text-[#acaab4] font-label mt-1">Configure your domain validation settings and instant payout UPI linkage</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-label">Switch Node:</span>
            <select
              value={expertEmail}
              onChange={(e) => handleSwitchExpert(e.target.value)}
              className="text-xs font-mono bg-[#121212] border border-[#262626] text-white rounded px-3 py-1.5 focus:outline-none hover:border-white/20 transition-all"
            >
              {SEEDED_EXPERTS.map((exp) => (
                <option key={exp.email} value={exp.email}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Identity Info Card */}
          <div className="md:col-span-1 bg-[#121212] border border-[#262626] rounded p-6 h-fit">
            <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-white" />
              Active Holder Vetting
            </h3>

            {loading ? (
              <div className="space-y-4">
                <div className="h-6 bg-white/5 rounded w-2/3"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            ) : expertProfile ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Expert Profile</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{expertProfile.name}</span>
                </div>
                
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Triage Level</span>
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold rounded bg-white/10 border border-white/20 text-white mt-1 uppercase tracking-wide">
                    {expertProfile.tier}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono">Sovereign Node Key</span>
                  <span className="font-mono text-zinc-400 block break-all leading-normal text-[10px] mt-1 bg-[#141313] p-2 rounded border border-white/5">
                    node_key_0x_axm_{expertProfile.id.substring(0, 8)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No profile connected.</p>
            )}
          </div>

          {/* Form Editor Column */}
          <form onSubmit={handleUpdateProfile} className="md:col-span-2 bg-[#121212] border border-[#262626] rounded p-6 space-y-6">
            <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              Calibrate Node Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Full Legal Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white outline-none transition"
                    disabled={updating}
                  />
                  <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Verified Academic/Professional Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white outline-none transition"
                    disabled={updating}
                  />
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
              </div>

              {/* UPI ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Razorpay UPI Address (VPA)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={signupUpi}
                    onChange={(e) => setSignupUpi(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-mono focus:border-white outline-none transition"
                    disabled={updating}
                  />
                  <Wallet className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
                <span className="text-[9px] text-zinc-500 block">Required for routing upfront point payouts in INR</span>
              </div>

              {/* Vetting Level Tier */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider block">Adjudication Multiplier Tier</label>
                <select
                  value={signupTier}
                  onChange={(e) => setSignupTier(e.target.value as any)}
                  className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-white outline-none cursor-pointer transition"
                  disabled={updating}
                >
                  <option value="BRONZE">Bronze Node (1.0x)</option>
                  <option value="SILVER">Silver Node (1.1x)</option>
                  <option value="GOLD">Gold Node (1.25x)</option>
                  <option value="SENIOR">Senior Node (1.5x)</option>
                  <option value="ELITE">Elite Node (2.0x)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider transition active:scale-95"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating Node...
                  </>
                ) : (
                  <>Connect / Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </ExpertLayout>
  );
}
