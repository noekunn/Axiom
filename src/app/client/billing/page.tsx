"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import ClientLayout from "@/components/ClientLayout";

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
}

export default function ClientBillingPage() {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<AssetPool[]>([]);
  const [purchasedPools, setPurchasedPools] = useState<Record<string, string>>({});
  
  // Notification states
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch pools
  const fetchPools = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api?action=pools');
      const data = await res.json();
      if (data.success) {
        setPools(data.pools || []);
      }
    } catch (err) {
      console.error("Failed to fetch pools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();

    // Read purchased pools from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("axiom_purchased_pools");
      if (saved) {
        setPurchasedPools(JSON.parse(saved));
      } else {
        // Pre-seed default purchase if not exist
        const defaultSeeded = { "pool_hinglish_clinical": "r2_dl_token_seeded_clinical_v1" };
        localStorage.setItem("axiom_purchased_pools", JSON.stringify(defaultSeeded));
        setPurchasedPools(defaultSeeded);
      }
    }
  }, []);

  // Alert dismiss timer
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

  const getPoolTitle = (id: string) => {
    return pools.find(p => p.id === id)?.title || "Unknown Dataset";
  };

  // Mock static transactions based on pre-seeded licenses
  const mockTransactions = [
    {
      id: "ch_stripe_8236d9ac",
      invoiceNumber: "INV-2026-084",
      poolId: "pool_hinglish_clinical",
      licenseType: "SHARED",
      fee: 25000,
      date: "May 24, 2026",
      status: "PAID"
    },
    {
      id: "ch_stripe_1029e4bf",
      invoiceNumber: "INV-2026-039",
      poolId: "pool_bilingual_legal",
      licenseType: "SHARED",
      fee: 35000,
      date: "May 12, 2026",
      status: "PAID"
    }
  ];

  return (
    <ClientLayout>
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
        {/* Header Section */}
        <div className="border-b border-[#262626] pb-6">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Billing &amp; License Audit</h2>
          <p className="text-xs text-[#acaab4] font-label mt-1">
            Monitor licensed dataset assets, download cryptographically secured R2 tokens, and inspect Stripe payment logs.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Active Dataset Licenses & R2 Tokens (Left 7 Columns) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#262626] rounded p-6">
              <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Active Dataset Licenses
              </h3>

              {Object.keys(purchasedPools).length === 0 ? (
                <div className="text-center py-8 bg-[#141313] border border-[#262626] rounded">
                  <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-[#acaab4]">No active licenses acquired yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(purchasedPools).map(([poolId, token]) => {
                    const poolDetails = pools.find(p => p.id === poolId);
                    return (
                      <div key={poolId} className="bg-[#141313] border border-[#262626] p-4 rounded-xl flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest block w-fit mb-1.5">
                              {poolDetails?.category || "Dataset Pool"}
                            </span>
                            <h4 className="text-sm font-bold text-white font-display">
                              {poolDetails?.title || getPoolTitle(poolId)}
                            </h4>
                            <p className="text-[11px] text-[#acaab4] leading-relaxed mt-1">
                              {poolDetails?.description || "High-fidelity regional dataset instruction tuning corpus."}
                            </p>
                          </div>
                        </div>

                        <div className="h-[1px] bg-white/5 w-full" />

                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#121212] p-3 rounded-lg border border-white/5">
                          <div className="space-y-1 overflow-hidden">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-mono">Secure Cloudflare R2 Token</span>
                            <span className="text-[11px] font-mono text-emerald-400 block truncate select-all font-semibold max-w-[320px]">
                              {token}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => copyToClipboard(token, "Secure Download Token")}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Token
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audit Log Table */}
            <div className="bg-[#121212] border border-[#262626] rounded p-6">
              <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-white" />
                Stripe Invoice Audit Ledger
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs text-[#acaab4]">
                  <thead>
                    <tr className="border-b border-[#262626] text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                      <th className="pb-3 pr-2">Invoice ID</th>
                      <th className="pb-3 px-2">Dataset Fund</th>
                      <th className="pb-3 px-2">License</th>
                      <th className="pb-3 px-2">Billing Date</th>
                      <th className="pb-3 px-2 text-right">Fee Paid</th>
                      <th className="pb-3 pl-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mockTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition duration-300">
                        <td className="py-3.5 pr-2 font-mono text-[10px] text-zinc-400 select-all">{tx.invoiceNumber}</td>
                        <td className="py-3.5 px-2 font-bold text-white max-w-[150px] truncate">{getPoolTitle(tx.poolId)}</td>
                        <td className="py-3.5 px-2 font-mono text-[10px]">{tx.licenseType}</td>
                        <td className="py-3.5 px-2 text-zinc-500">{tx.date}</td>
                        <td className="py-3.5 px-2 text-right font-bold text-white font-mono">${tx.fee.toLocaleString()}</td>
                        <td className="py-3.5 pl-2 text-right text-emerald-400 font-bold font-mono">SUCCESS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Checkout pricing metrics summary (Right 5 Columns) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#262626] rounded p-6">
              <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-white" />
                Stripe Billing Profile
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#141313] border border-[#262626] space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold">Enterprise Account</span>
                    <span className="text-white font-bold">Aether Labs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold">Payment Method</span>
                    <span className="font-mono text-white">VISA •••• 4892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold">Billing Address</span>
                    <span className="text-zinc-400 text-right">San Francisco, CA, USA</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-[10px] uppercase font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    Pro-Rata Royalty Splitting
                  </h4>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    5% of all client licensing fees are instantly routed cryptographically to our verified expert triage nodes. Outlined in our billing logs.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.alert("Simulating download of PDF receipt archive...");
                    }
                  }}
                  className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider transition active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download PDF Invoice Archive
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ClientLayout>
  );
}
