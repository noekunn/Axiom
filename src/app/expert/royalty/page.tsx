"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Database,
  Check,
  Wallet,
  AlertCircle,
  UserCheck
} from "lucide-react";
import ExpertLayout from "@/components/ExpertLayout";
import RoyaltyAnalytics from "@/components/RoyaltyAnalytics";

interface Expert {
  id: string;
  name: string;
  email: string;
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

const SEEDED_EXPERTS = [
  { email: 'ananya.iyer@axiom.ai', name: 'Dr. Ananya Iyer' },
  { email: 'rahul.banerjee@axiom.ai', name: 'Adv. Rahul Banerjee' },
  { email: 'priya.sharma@axiom.ai', name: 'Dr. Priya Sharma' },
];

export default function RoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [expertEmail, setExpertEmail] = useState('ananya.iyer@axiom.ai');
  const [expertProfile, setExpertProfile] = useState<Expert | null>(null);
  const [payouts, setPayouts] = useState<RoyaltyPayout[]>([]);
  const [pools, setPools] = useState<AssetPool[]>([]);

  // Fetch expert data
  const fetchExpertData = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api?action=expert&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setExpertProfile(data.expert);
        setPayouts(data.payouts || []);
      } else {
        setExpertProfile(null);
        setPayouts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pools
  const fetchPools = async () => {
    try {
      const res = await fetch('/api?action=pools');
      const data = await res.json();
      if (data.success) {
        setPools(data.pools || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchExpert = useCallback((email: string) => {
    setExpertEmail(email);
    fetchExpertData(email);
  }, []);

  useEffect(() => {
    fetchExpertData(expertEmail);
    fetchPools();
  }, []);

  return (
    <ExpertLayout>
      <div className="space-y-8 select-none">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Royalty Projections &amp; Payouts</h2>
            <p className="text-xs text-[#acaab4] font-label mt-1">Track your compounding intellectual property licensing revenues</p>
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

        {/* Dynamic Royalty Analytics Panel */}
        <div className="bg-[#121212] border border-[#262626] rounded p-6">
          <RoyaltyAnalytics 
            points={expertProfile?.points ?? 84291.5}
            earnings={expertProfile?.totalEarnings ?? 115200}
            poolCount={payouts.reduce((acc, curr) => acc.includes(curr.poolId) ? acc : [...acc, curr.poolId], [] as string[]).length || 3}
          />
        </div>

        {/* Razorpay UPI Payout Ledger */}
        <div className="bg-[#121212] border border-[#262626] rounded p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-display font-bold uppercase text-[#e7e4ee] tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white" />
                Razorpay Sovereign Payout Ledger
              </h3>
              <p className="text-[11px] text-zinc-500 font-label mt-1">Simulated instant settlements routed via automated UPI smart gateways</p>
            </div>
            {payouts.some(p => p.status === 'PENDING') && (
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Settling Invoices
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-10 bg-white/5 rounded"></div>
              <div className="h-10 bg-white/5 rounded"></div>
              <div className="h-10 bg-white/5 rounded"></div>
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12 bg-[#141313] rounded border border-[#262626]">
              <Wallet className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-[#acaab4]">No royalty payouts recorded for this node.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] text-[9px] font-bold text-[#acaab4] uppercase tracking-wider">
                    <th className="pb-3 pr-2">Transaction VPA</th>
                    <th className="pb-3 px-2">Dataset Source</th>
                    <th className="pb-3 px-2">Licensing Stake</th>
                    <th className="pb-3 px-2">Gross Payout (₹)</th>
                    <th className="pb-3 px-2 text-emerald-400">Net Settled</th>
                    <th className="pb-3 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-[#acaab4]">
                  {payouts.map((pay) => {
                    const isPassive = pay.id.includes('royalty');
                    const poolObj = pools.find(p => p.id === pay.poolId);
                    const baseINR = poolObj ? poolObj.basePrice * 83 : 0;

                    return (
                      <tr key={pay.id} className="hover:bg-white/[0.02] transition duration-300">
                        <td className="py-4 pr-2 font-mono text-[10px] text-gray-300 truncate max-w-[120px] select-all">{pay.payoutTransactionId}</td>
                        <td className="py-4 px-2 truncate max-w-[150px] font-semibold text-white">{pay.poolTitle}</td>
                        <td className="py-4 px-2">
                          {isPassive ? (
                            <span className="text-[10px] font-mono text-zinc-300">
                              5% split of ₹{baseINR.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">Upfront Bounty</span>
                          )}
                        </td>
                        <td className="py-4 px-2 font-semibold text-[#acaab4]">₹{pay.grossRoyalty.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-2 text-emerald-400 font-bold font-mono">₹{pay.netRoyalty.toLocaleString('en-IN')}</td>
                        <td className="py-4 pl-2 text-right">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
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
        </div>

      </div>
    </ExpertLayout>
  );
}
