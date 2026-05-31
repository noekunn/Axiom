"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  Cpu,
  Award,
  Calendar,
  Database,
  CheckCircle2,
  Mail,
  Copy,
  CreditCard,
  Key,
  Globe,
  Settings,
  Receipt,
  AlertCircle
} from "lucide-react";
import ClientLayout from "@/components/ClientLayout";

interface ClientProfile {
  id: string;
  companyName: string;
  email: string;
  llmSize: string;
  stripeBilling: string;
  datasetNeeds: string;
  billingTier: string;
  licenseCount: number;
  totalSpent: number;
  fineTuningJobs: number;
  joinedDate: string;
}

export default function ClientProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  useEffect(() => {
    // Set realistic enterprise profile details
    setTimeout(() => {
      setProfile({
        id: "client_aether_labs_8294",
        companyName: "Aether Labs",
        email: "labs@openai.com",
        llmSize: "Large (70B+ parameters)",
        stripeBilling: "VISA •••• 4892",
        datasetNeeds: "High-fidelity bilingual and domain-expert clinical diagnostics",
        billingTier: "Enterprise Premium Plan",
        licenseCount: 2,
        totalSpent: 60000,
        fineTuningJobs: 1,
        joinedDate: "April 2026"
      });
      setLoading(false);
    }, 800);
  }, []);

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
        
        {/* Header section */}
        <div className="border-b border-[#262626] pb-6">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Enterprise Client Profile</h2>
          <p className="text-xs text-[#acaab4] font-label mt-1">Configure your enterprise corporate credentials, API access keys, and Stripe billing parameters.</p>
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
            
            {/* Identity Card (4 Columns) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Profile Card Frame */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded bg-[#141313] border border-[#262626] flex items-center justify-center text-emerald-400 mb-4 select-none">
                  <Globe className="w-10 h-10" />
                </div>
                
                <h3 className="font-display font-bold text-lg text-white leading-tight">{profile.companyName}</h3>
                <span className="inline-block px-3 py-0.5 rounded text-[9px] font-bold border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 uppercase tracking-wider mt-2.5">
                  {profile.billingTier}
                </span>

                <div className="w-full h-[1px] bg-white/5 my-5" />

                <div className="w-full space-y-3.5 text-xs text-[#acaab4] text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Billing Account</span>
                    <span className="font-mono text-zinc-300 block truncate max-w-[170px]" title={profile.email}>{profile.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Registered Since</span>
                    <span className="text-zinc-300">{profile.joinedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Payment Link</span>
                    <span className="font-mono text-zinc-300">{profile.stripeBilling}</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-white/5 my-5" />

                <div className="w-full space-y-2 text-left">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Stripe Account Reference ID</span>
                  <div className="p-2.5 rounded bg-[#141313] border border-white/5 flex justify-between items-center gap-2">
                    <span className="font-mono text-[9px] text-zinc-400 block truncate max-w-[190px]">
                      cus_stripe_acct_aether_8294_f7
                    </span>
                    <button 
                      onClick={() => copyToClipboard(`cus_stripe_acct_aether_8294_f7`, "Stripe Reference ID")}
                      className="text-zinc-500 hover:text-white transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics & Credentials Logs (8 Columns) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              {/* Key stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="bg-[#121212] border border-[#262626] p-5 rounded">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Acquired Licenses</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight mt-1.5 font-mono">
                    {profile.licenseCount}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono mt-1.5 block">
                    secured dataset tokens
                  </span>
                </div>

                <div className="bg-[#121212] border border-[#262626] p-5 rounded">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Total B2B Spend</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight mt-1.5 font-mono">
                    ${profile.totalSpent.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold mt-1.5 block">
                    5% routed to triage nodes
                  </span>
                </div>

                <div className="bg-[#121212] border border-[#262626] p-5 rounded">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">OpenAI SFT Runs</span>
                  <div className="text-2xl font-extrabold text-white tracking-tight mt-1.5 font-mono">
                    {profile.fineTuningJobs}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono mt-1.5 block">
                    active deployment weights
                  </span>
                </div>

              </div>

              {/* Secure API Key Management */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6">
                <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                  <Key className="w-4 h-4 text-white" />
                  API Integration Credentials
                </h4>
                
                <div className="space-y-4 text-xs">
                  <p className="text-[11px] text-[#acaab4] leading-relaxed">
                    Integrate your enterprise LLM fine-tuning pipelines directly with our API endpoint layer. Programmatically download licensed training pools or fetch consensus statistics.
                  </p>

                  <div className="p-4 rounded-xl bg-[#141313] border border-white/5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono block">Production Client Key</span>
                        <span className="font-mono text-zinc-300 block font-semibold mt-1">
                          {apiKeyVisible ? "axm_api_prod_a8f9c1b2d3e4f5a6b7c8" : "axm_api_prod_••••••••••••••••••••"}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                          className="px-3.5 py-1.5 border border-[#262626] hover:bg-white/5 text-white font-bold text-[10px] rounded transition"
                        >
                          {apiKeyVisible ? "Hide" : "Reveal"}
                        </button>
                        <button
                          onClick={() => copyToClipboard("axm_api_prod_a8f9c1b2d3e4f5a6b7c8", "Production API Key")}
                          className="px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 font-bold text-[10px] rounded transition"
                        >
                          Copy Key
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure R2 Download Endpoints */}
              <div className="bg-[#121212] border border-[#262626] rounded p-6">
                <h4 className="text-sm font-display font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-4">
                  <Database className="w-4 h-4 text-white" />
                  Enterprise Storage Linking
                </h4>
                
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded bg-[#141313] border border-white/5 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase block font-mono">Secure CDN Node</span>
                      <span className="text-zinc-300 font-mono">axm-eu-west-01.axiom.ai</span>
                    </div>
                    <div className="p-3.5 rounded bg-[#141313] border border-white/5 space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase block font-mono">Inference Endpoint</span>
                      <span className="text-zinc-300 font-mono">api.inference.axiom.ai/v1</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </ClientLayout>
  );
}
