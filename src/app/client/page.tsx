"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Trophy,
  Receipt
} from "lucide-react";
import Link from "next/link";
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
  samplePrompt: string;
}

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<AssetPool[]>([]);

  // Licensing Modal/Checkout state
  const [licensingPool, setLicensingPool] = useState<AssetPool | null>(null);
  const [licenseType, setLicenseType] = useState<'SHARED' | 'EXCLUSIVE'>('SHARED');
  const [buyerEmail, setBuyerEmail] = useState('labs@openai.com');
  const [checkingOut, setCheckingOut] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<{
    poolTitle: string;
    token: string;
    licenseType: string;
  } | null>(null);

  // Download registry state shared via localStorage
  const [purchasedPools, setPurchasedPools] = useState<Record<string, string>>({});

  // Error/Success Notifications
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
        // Pre-seed default purchase if not exist to make other tabs immediately active
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

  // Stripe License purchase action
  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensingPool) return;

    try {
      setCheckingOut(true);
      setPurchaseSuccess(null);
      
      // Simulating Stripe Checkout transition
      await new Promise(resolve => setTimeout(resolve, 2000));

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
        const nextPurchased = {
          ...purchasedPools,
          [licensingPool.id]: data.token
        };
        
        setPurchasedPools(nextPurchased);
        if (typeof window !== "undefined") {
          localStorage.setItem("axiom_purchased_pools", JSON.stringify(nextPurchased));
        }

        setPurchaseSuccess({
          poolTitle: data.poolTitle,
          token: data.token,
          licenseType
        });
        
        setLicensingPool(null);
        setAlert({ type: 'success', message: `Dataset licensed successfully under ${licenseType} model!` });
        fetchPools(); // refresh pools status
      } else {
        setAlert({ type: 'error', message: data.error || 'Checkout failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to process licensing checkout' });
    } finally {
      setCheckingOut(false);
    }
  };

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">B2B Dataset Marketplace</h2>
          <p className="text-xs text-[#acaab4] font-label mt-1">Enterprise-grade domain-expert instruction corpora for fine-tuning</p>
        </div>
        <div className="flex items-center gap-2 bg-[#121212] px-3.5 py-1.5 rounded-xl border border-[#262626] text-[11px] font-mono text-zinc-400 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Stripe gateways ready
        </div>
      </div>

      {/* Layout Content */}
      <div className="space-y-8 select-none">
        
        {/* Secure Download Card for successful checkout */}
        {purchaseSuccess && (
          <div className="bg-[#121212] border border-[#10B981]/30 p-6 rounded relative overflow-hidden animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                License Secured
              </h3>
            </div>
            <p className="text-xs text-[#acaab4] leading-relaxed mb-4">
              Thank you! Your license checkout for <strong className="text-white">{purchaseSuccess.poolTitle}</strong> has cleared successfully. The dataset token is now provisioned in your R2 registry.
            </p>
            
            <div className="p-3.5 rounded-xl bg-[#141313] border border-[#262626] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-[#acaab4] uppercase block">Download Key</span>
                <span className="text-[11px] font-mono text-emerald-400 block break-all font-semibold select-all">
                  {purchaseSuccess.token}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(purchaseSuccess.token);
                    setAlert({ type: 'success', message: 'Token copied to clipboard!' });
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded flex items-center justify-center gap-2 transition duration-300 whitespace-nowrap active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Copy R2 Token
                </button>
                <Link href="/client/sft">
                  <button className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded flex items-center justify-center gap-2 transition duration-300 whitespace-nowrap active:scale-95">
                    <Cpu className="w-4 h-4" />
                    Launch SFT
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Catalog grid list (Full width spacious 12 columns grid / 3 cards layout) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(idx => (
              <div key={idx} className="bg-[#121212] border border-[#262626] rounded h-80 animate-pulse"></div>
            ))}
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-20 bg-[#121212] border border-[#262626] rounded">
            <Database className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-[#acaab4]">No active datasets available in marketplace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => {
              const isPurchased = !!purchasedPools[pool.id];
              const token = purchasedPools[pool.id];

              return (
                <div
                  key={pool.id}
                  className="bg-[#121212] border border-[#262626] rounded p-6 hover:border-white/20 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-0.5 rounded-[4px] text-[8px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/15 uppercase tracking-widest">
                        {pool.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {pool.licenseCount} active licenses
                      </span>
                    </div>
                    
                    <h3 className="font-display font-bold text-base text-white leading-snug mb-2">{pool.title}</h3>
                    <p className="text-xs text-[#acaab4] leading-relaxed mb-6 line-clamp-4">{pool.description}</p>
                  </div>

                  <div className="space-y-4">
                    {/* Technical specifications */}
                    <div className="p-3 bg-[#141313] rounded border border-[#262626] grid grid-cols-2 gap-3 text-[10px] font-mono text-zinc-400">
                      <div>
                        <span className="opacity-55 block">Expert Bounties</span>
                        <span className="font-semibold text-white block mt-0.5">
                          {pool.totalPoints.toLocaleString()} PTS
                        </span>
                      </div>
                      <div>
                        <span className="opacity-55 block">Languages</span>
                        <span className="font-semibold text-white block mt-0.5 uppercase truncate">
                          {pool.languages.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Download or licensing CTA */}
                    {isPurchased ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(token);
                            setAlert({ type: 'success', message: 'Download token copied!' });
                          }}
                          className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20 flex items-center justify-center gap-2 transition duration-300 active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Secure R2 Token Active
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/client/sft" className="w-full">
                            <button className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition duration-200 active:scale-95 uppercase font-mono tracking-wider text-[10px]">
                              <Cpu className="w-3.5 h-3.5" />
                              SFT Console
                            </button>
                          </Link>
                          <Link href="/client/billing" className="w-full">
                            <button className="w-full py-2 bg-white/5 border border-[#262626] hover:bg-white/10 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition duration-200 active:scale-95 uppercase font-mono tracking-wider text-[10px]">
                              <Receipt className="w-3.5 h-3.5" />
                              Billing Log
                            </button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setLicenseType('SHARED');
                            setLicensingPool(pool);
                          }}
                          className="flex-1 py-2 bg-[#141313] border border-[#262626] hover:border-white/20 text-white text-xs font-bold rounded transition duration-200 active:scale-95 text-center"
                        >
                          Shared: ${pool.basePrice.toLocaleString()}
                        </button>
                        
                        <button
                          onClick={() => {
                            setLicenseType('EXCLUSIVE');
                            setLicensingPool(pool);
                          }}
                          className="flex-1 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded transition duration-200 active:scale-95 text-center"
                        >
                          Buyout: ${pool.exclusivePrice.toLocaleString()}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= STRIPE SECURE LICENSING MODAL ================= */}
      {licensingPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 bg-[#121212] border border-[#262626] rounded relative overflow-hidden animate-fade-in">
            <h3 className="text-base font-display font-bold text-white mb-1.5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#10B981]" />
              Secure License Checkout
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Unlock the full R2 tokenized dataset repository for training validation. A pro-rata royalty split is distributed instantly to contributors.
            </p>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="p-3.5 rounded bg-[#141313] border border-[#262626] text-xs text-zinc-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white">Target Corpus:</span>
                  <span className="font-bold text-gray-300">{licensingPool.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">License model:</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    {licenseType === 'SHARED' ? 'SHARED END-USER LICENSE' : 'EXCLUSIVE CORPUS BUYOUT'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1 font-mono">Stripe Checkout Account Email</label>
                <input
                  type="email"
                  placeholder="labs@openai.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-mono focus:border-[#10B981] focus:bg-[#141313] outline-none transition"
                  disabled={checkingOut}
                />
              </div>

              {/* Total license fee */}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-[#acaab4]">Total licensing fee:</span>
                <span className="text-2xl font-black text-[#10B981]">
                  ${(licenseType === 'SHARED' ? licensingPool.basePrice : licensingPool.exclusivePrice).toLocaleString()}
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setLicensingPool(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded border border-[#262626] transition"
                  disabled={checkingOut}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded transition flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider font-extrabold"
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checkout...
                    </>
                  ) : (
                    <>
                      Confirm Purchase
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
