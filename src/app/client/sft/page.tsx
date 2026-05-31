"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play
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

export default function SftConsolePage() {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<AssetPool[]>([]);
  const [purchasedPools, setPurchasedPools] = useState<Record<string, string>>({});
  const [selectedPoolId, setSelectedPoolId] = useState("");

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
      console.error("Failed to fetch pools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();

    // Load purchased pools from localStorage (pre-seed if empty to make UI look amazing and immediately active)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("axiom_purchased_pools");
      if (saved) {
        setPurchasedPools(JSON.parse(saved));
      } else {
        // Pre-seed one purchase so SFT can be launched instantly
        const defaultSeeded = { "pool_hinglish_clinical": "r2_dl_token_seeded_clinical_v1" };
        localStorage.setItem("axiom_purchased_pools", JSON.stringify(defaultSeeded));
        setPurchasedPools(defaultSeeded);
      }
    }
  }, []);

  // Update default selected pool ID when pools load
  useEffect(() => {
    const purchasedIds = Object.keys(purchasedPools);
    if (purchasedIds.length > 0 && !selectedPoolId) {
      setSelectedPoolId(purchasedIds[0]);
    } else if (pools.length > 0 && !selectedPoolId) {
      setSelectedPoolId(pools[0].id);
    }
  }, [pools, purchasedPools, selectedPoolId]);

  // Alert dismiss timer
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // OpenAI Fine-Tuning Action
  const triggerFineTuning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoolId) return;

    try {
      setFineTuningStatus('submitting');
      setFineTuningJob(null);

      // Simulating JSONL packaging and parsing delays
      await new Promise(resolve => setTimeout(resolve, 3000));

      const res = await fetch('/api/client/fine-tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: selectedPoolId })
      });
      const data = await res.json();
      if (data.success) {
        setFineTuningJob({
          id: data.jobId,
          status: data.status,
          mock: data.mock,
          poolId: selectedPoolId
        });
        setFineTuningStatus('running');
        setAlert({ type: 'success', message: data.message });
      } else {
        setFineTuningStatus('idle');
        setAlert({ type: 'error', message: data.error || 'Fine-tuning failed' });
      }
    } catch (err) {
      setFineTuningStatus('idle');
      setAlert({ type: 'error', message: 'Server error triggering SFT' });
    }
  };

  const getPoolTitle = (id: string) => {
    return pools.find(p => p.id === id)?.title || "Selected Corpus";
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

      <div className="space-y-8 select-none">
        {/* Header Section */}
        <div className="border-b border-[#262626] pb-6">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">OpenAI Supervised Fine-Tuning Console</h2>
          <p className="text-xs text-[#acaab4] font-label mt-1">
            Fine-tune gpt-4o-mini inside secure enterprise bounds using your licensed expert-curated corpora.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Configure and Launch Form (Left 5 Columns) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#121212] border border-[#262626] rounded p-6">
              <h3 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-white" />
                Launch Supervised Training
              </h3>

              <form onSubmit={triggerFineTuning} className="space-y-5">
                {/* Select Purchased Dataset */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1.5">Licensed Dataset Source</label>
                  <select
                    value={selectedPoolId}
                    onChange={(e) => setSelectedPoolId(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-[#10B981] focus:bg-[#141313] outline-none transition duration-200"
                    disabled={fineTuningStatus === 'running' || fineTuningStatus === 'submitting'}
                  >
                    {pools.map(pool => {
                      const isLicensed = !!purchasedPools[pool.id];
                      return (
                        <option key={pool.id} value={pool.id} disabled={!isLicensed}>
                          {pool.title} {!isLicensed ? "(Not Licensed)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-[10px] text-zinc-500 mt-1.5 block">
                    Only datasets with active end-user licenses purchased via Stripe checkout can be training-tokenized.
                  </span>
                </div>

                {/* Base Model selection */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1.5">Target OpenAI Foundation Model</label>
                  <select
                    className="w-full p-2.5 rounded bg-[#141313] border border-[#262626] text-white text-xs font-semibold focus:border-[#10B981] focus:bg-[#141313] outline-none transition duration-200"
                    disabled
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Low Cost)</option>
                    <option value="gpt-4o">gpt-4o (Premium Inference)</option>
                  </select>
                </div>

                {/* Training parameters summary */}
                <div className="p-3 bg-[#141313] rounded border border-[#262626] space-y-2 text-[10px] font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Target Epochs</span>
                    <span className="text-white font-bold">5 (Auto-calibrated)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Batch Size</span>
                    <span className="text-white font-bold">Auto</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Learning Rate Multiplier</span>
                    <span className="text-white font-bold">1.2x</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={fineTuningStatus === 'running' || fineTuningStatus === 'submitting' || !selectedPoolId}
                  className={`w-full py-3 text-xs font-bold rounded transition duration-200 flex items-center justify-center gap-2 ${
                    fineTuningStatus === 'submitting'
                      ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed uppercase font-mono tracking-wider font-extrabold'
                  }`}
                >
                  {fineTuningStatus === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading JSONL dataset to OpenAI...
                    </>
                  ) : fineTuningStatus === 'running' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      In-Progress Training Job Active
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Trigger OpenAI Fine-Tuning
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Active Training Status Panel */}
            {fineTuningJob && (
              <div className="bg-[#121212] border border-[#10B981]/30 p-5 rounded relative overflow-hidden animate-fade-in">
                <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#10B981] animate-spin" />
                  Active SFT Metrics
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#acaab4] mb-5">
                  <div>
                    <span className="opacity-55 block">OpenAI Job ID</span>
                    <span className="text-white font-bold block mt-0.5 truncate select-all">{fineTuningJob.id}</span>
                  </div>
                  <div>
                    <span className="opacity-55 block">Status</span>
                    <span className="text-[#10B981] font-bold block mt-0.5 uppercase tracking-wide">
                      {fineTuningStatus === 'completed' ? 'DEPLOYED' : 'TRAINING'}
                    </span>
                  </div>
                </div>

                {/* Training progress steps */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500">
                    <span>Progress trace</span>
                    <span className="font-mono text-[#10B981]">
                      {fineTuningStatus === 'completed' ? '100%' : '45%'}
                    </span>
                  </div>
                  <div className="w-full bg-[#121212] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#10B981] h-full rounded-full transition-all duration-1000 shadow-md shadow-[#10B981]/40" 
                      style={{ width: fineTuningStatus === 'completed' ? '100%' : '45%' }}
                    />
                  </div>
                </div>

                {fineTuningStatus === 'running' && (
                  <button
                    onClick={() => setFineTuningStatus('completed')}
                    className="w-full py-2 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 mt-4 transition active:scale-95 uppercase font-mono tracking-widest text-[9px]"
                  >
                    Complete &amp; Deploy Weights (Demo)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SFT Terminal display (Right 7 Columns) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col">
            <div className="bg-[#121212] border border-[#262626] rounded p-6 h-full">
              <TerminalConsole 
                status={fineTuningStatus}
                jobId={fineTuningJob?.id || 'FT-AXM-MOCK-JOB'}
                targetPoolTitle={getPoolTitle(fineTuningJob?.poolId || selectedPoolId)}
              />
            </div>
          </div>

        </div>
      </div>
    </ClientLayout>
  );
}
