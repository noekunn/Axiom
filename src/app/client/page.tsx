"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Cpu,
  Database,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  ArrowRight,
  Receipt,
  FileText
} from "lucide-react";
import ClientLayout from "@/components/ClientLayout";
import TerminalConsole from "@/components/TerminalConsole";

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

  // Download registry state
  const [purchasedPools, setPurchasedPools] = useState<Record<string, string>>({}); // poolId -> downloadToken

  // Fine-tuning states
  const [fineTuningJob, setFineTuningJob] = useState<{
    id: string;
    status: string;
    mock: boolean;
    poolId: string;
  } | null>(null);
  const [fineTuningStatus, setFineTuningStatus] = useState<'idle' | 'submitting' | 'running' | 'completed'>('idle');

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  // Auto trigger alerts timeout
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
        setPurchaseSuccess({
          poolTitle: data.poolTitle,
          token: data.token,
          licenseType
        });
        setPurchasedPools(prev => ({
          ...prev,
          [licensingPool.id]: data.token
        }));
        setLicensingPool(null);
        setAlert({ type: 'success', message: `Dataset licensed successfully under ${licenseType} model!` });
        fetchPools(); // refresh pools
      } else {
        setAlert({ type: 'error', message: data.error || 'Checkout failed' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to process licensing checkout' });
    } finally {
      setCheckingOut(false);
    }
  };

  // OpenAI Fine-Tuning Action
  const triggerFineTuning = async (poolId: string) => {
    try {
      setFineTuningStatus('submitting');
      setFineTuningJob(null);

      // Simulating JSONL packaging and parsing delays
      await new Promise(resolve => setTimeout(resolve, 3000));

      const res = await fetch('/api/client/fine-tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId })
      });
      const data = await res.json();
      if (data.success) {
        setFineTuningJob({
          id: data.jobId,
          status: data.status,
          mock: data.mock,
          poolId
        });
        setFineTuningStatus('running');
        setAlert({ type: 'success', message: data.message });
      } else {
        setFineTuningStatus('idle');
        setAlert({ type: 'error', message: data.error || 'Fine-tuning failed' });
      }
    } catch {
      setFineTuningStatus('idle');
      setAlert({ type: 'error', message: 'Server error triggering SFT' });
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

      {/* Main Grid Canvas */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Marketplace Section (Left 7 Columns) */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-black text-white leading-none">B2B Dataset Marketplace</h2>
              <p className="text-xs text-[#acaab4] font-label mt-1">Enterprise-grade domain-expert instruction corpora</p>
            </div>
            <div className="flex items-center gap-2 bg-[#13131a]/60 px-3.5 py-1.5 rounded-xl border border-white/5 text-[11px] font-mono text-zinc-400 self-start sm:self-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Stripe checkout live
            </div>
          </div>

          {/* Secure Download Card for successful checkout */}
          {purchaseSuccess && (
            <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/5 relative overflow-hidden animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  License Secured
                </h3>
              </div>
              <p className="text-xs text-[#acaab4] leading-relaxed mb-4">
                Thank you! Your license checkout for <strong className="text-white">{purchaseSuccess.poolTitle}</strong> has cleared successfully. The dataset token is now provisioned in your R2 registry.
              </p>
              
              <div className="p-3.5 rounded-xl bg-[#13131a] border border-white/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#acaab4] uppercase block">Download Key</span>
                  <span className="text-[11px] font-mono text-emerald-400 block break-all font-semibold select-all">
                    {purchaseSuccess.token}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(purchaseSuccess.token);
                    setAlert({ type: 'success', message: 'Token copied to clipboard!' });
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-300 whitespace-nowrap active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Copy R2 Token
                </button>
              </div>
            </div>
          )}

          {/* Catalog grid list */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="glass-panel h-52 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl">
              <Database className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-sm text-[#acaab4]">No active datasets available in marketplace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pools.map((pool) => {
                const isPurchased = !!purchasedPools[pool.id];
                const token = purchasedPools[pool.id];

                return (
                  <div
                    key={pool.id}
                    className="glass-panel rounded-2xl p-5 border border-white/[0.01] hover:border-white/5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-bold bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/15 uppercase tracking-widest">
                          {pool.category}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {pool.licenseCount} active licenses
                        </span>
                      </div>
                      
                      <h3 className="font-display font-bold text-sm text-white leading-snug mb-1">{pool.title}</h3>
                      <p className="text-[11px] text-[#acaab4] leading-relaxed mb-4 line-clamp-3">{pool.description}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Technical specifications */}
                      <div className="p-2.5 bg-[#13131a]/60 rounded-xl border border-white/[0.02] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#acaab4]">
                        <div>
                          <span className="opacity-55 block">Expert Contributions</span>
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
                            className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2 transition duration-300 active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Secure R2 Token Active
                          </button>
                          
                          <button
                            onClick={() => triggerFineTuning(pool.id)}
                            className="w-full py-2 bg-[#0A84FF] hover:bg-[#0062cc] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-300 active:scale-95 shadow-[0_0_15px_-5px_rgba(10,132,255,0.4)]"
                          >
                            <Cpu className="w-3.5 h-3.5 animate-pulse" />
                            Launch OpenAI SFT Job
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setLicenseType('SHARED');
                              setLicensingPool(pool);
                            }}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition duration-300 active:scale-95"
                          >
                            Shared: ${pool.basePrice.toLocaleString()}
                          </button>
                          
                          <button
                            onClick={() => {
                              setLicenseType('EXCLUSIVE');
                              setLicensingPool(pool);
                            }}
                            className="flex-1 py-2 bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 text-[#0A84FF] text-xs font-bold rounded-xl border border-[#0A84FF]/15 transition duration-300 active:scale-95"
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
        </section>

        {/* OpenAI SFT Console (Right 5 Columns) */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-display font-black text-white leading-none">OpenAI SFT Console</h2>
            <p className="text-xs text-[#acaab4] font-label mt-1">Fine-tune gpt-4o-mini inside enterprise bounds</p>
          </div>

          {/* Active Job status card */}
          {fineTuningJob && (
            <div className="glass-panel rounded-2xl p-5 border border-[#0A84FF]/30 bg-[#0A84FF]/5 relative overflow-hidden animate-fade-in">
              <h3 className="text-xs font-display font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#0A84FF] animate-spin" />
                Active Supervised Fine-Tuning
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#acaab4] mb-5">
                <div>
                  <span className="opacity-55 block">OpenAI Job ID</span>
                  <span className="text-white font-bold block mt-0.5 truncate">{fineTuningJob.id}</span>
                </div>
                <div>
                  <span className="opacity-55 block">Current status</span>
                  <span className="text-[#0A84FF] font-bold block mt-0.5 uppercase tracking-wide">
                    {fineTuningStatus === 'completed' ? 'DEPLOYED' : 'TRAINING'}
                  </span>
                </div>
              </div>

              {/* Training progress steps */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500">
                  <span>Progress trace</span>
                  <span className="font-mono text-[#0A84FF]">
                    {fineTuningStatus === 'completed' ? '100%' : '45%'}
                  </span>
                </div>
                <div className="w-full bg-[#13131a] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#0A84FF] h-full rounded-full transition-all duration-1000 shadow-md shadow-[#0A84FF]/40" 
                    style={{ width: fineTuningStatus === 'completed' ? '100%' : '45%' }}
                  />
                </div>
              </div>

              {fineTuningStatus === 'running' && (
                <button
                  onClick={() => setFineTuningStatus('completed')}
                  className="w-full py-2 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 mt-4 transition active:scale-95"
                >
                  Complete &amp; Deploy Weights (Demo)
                </button>
              )}
            </div>
          )}

          {/* SFT Terminal display */}
          <div id="sft" className="flex-grow">
            <TerminalConsole 
              status={fineTuningStatus}
              jobId={fineTuningJob?.id || 'FT-AXM-MOCK-JOB'}
              targetPoolTitle={pools.find(p => p.id === fineTuningJob?.poolId)?.title || 'Consensus Clinical Diagnoses'}
            />
          </div>
        </section>

      </div>

      {/* ================= STRIPE SECURE LICENSING MODAL ================= */}
      {licensingPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel relative overflow-hidden animate-fade-in border border-white/5">
            <h3 className="text-base font-display font-black text-white mb-1.5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0A84FF]" />
              Secure License Checkout
            </h3>
            <p className="text-xs text-[#acaab4] mb-5 leading-relaxed">
              Unlock the full R2 tokenized dataset repository for training validation. A pro-rata royalty split is distributed instantly to contributors.
            </p>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#13131a] border border-white/5 text-xs text-[#acaab4]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white">Target Corpus:</span>
                  <span className="font-bold text-gray-300">{licensingPool.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">License model:</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20">
                    {licenseType === 'SHARED' ? 'SHARED END-USER LICENSE' : 'EXCLUSIVE CORPUS BUYOUT'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#acaab4] uppercase block mb-1">Stripe Checkout Account Email</label>
                <input
                  type="email"
                  placeholder="labs@openai.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#13131a] border border-white/10 text-white text-xs font-mono focus:border-[#0A84FF]/40 outline-none transition"
                  disabled={checkingOut}
                />
              </div>

              {/* Total license fee */}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-[#acaab4]">Total licensing fee:</span>
                <span className="text-2xl font-black text-[#0A84FF]">
                  ${(licenseType === 'SHARED' ? licensingPool.basePrice : licensingPool.exclusivePrice).toLocaleString()}
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setLicensingPool(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/5 transition"
                  disabled={checkingOut}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A84FF] text-white hover:bg-[#0062cc] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_-5px_rgba(10,132,255,0.4)]"
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checkout in progress...
                    </>
                  ) : (
                    <>
                      Confirm &amp; Purchase
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
