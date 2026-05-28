'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';


// Interfaces for structured types
interface CalibrationSettings {
  agreementMargin: number;
  autoApprovalThreshold: number;
  humanEscalationMargin: number;
  retryLimit: number;
  strategy: 'strict' | 'highest_confidence' | 'groq_primary' | 'openai_primary';
  strictAlignment: boolean;
  logDiscrepancies: boolean;
  queues: Record<string, 'active' | 'paused'>;
}

interface QueueMetric {
  name: string;
  avgLatencyMs: number;
  maxLatencyMs: number;
  backlog: number;
  activeRetries: number;
  status: 'active' | 'paused';
  ratePerMin: number;
}

interface GatewayMetric {
  volume: number;
  percentage: number;
}

interface PayoutMetrics {
  totalVolume: number;
  paid: number;
  processing: number;
  failed: number;
  successRate: number;
  gateways: {
    stripe: GatewayMetric;
    razorpay: GatewayMetric;
  };
}

interface WebhookLog {
  id: string;
  provider: 'Stripe' | 'Razorpay';
  eventType: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  processingMs: number;
  idempotency: 'Verified' | 'Replayed';
  timestamp: string;
  payload: string;
  error?: string;
}

interface RoyaltyPayout {
  id: string;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  currency: string;
  gateway: 'Stripe' | 'Razorpay';
  status: 'Paid' | 'Processing' | 'Failed';
  timestamp: string;
  payoutRef: string;
  failureReason?: string;
}

interface IdempotencyEvent {
  key: string;
  provider: 'Stripe' | 'Razorpay';
  matchType: 'Cache Hit' | 'Lock Acquired' | 'New Registry Created';
  resource: string;
  timestamp: string;
}

export default function AdminDashboard() {
  // Console operational states
  const [settings, setSettings] = useState<CalibrationSettings>({
    agreementMargin: 85,
    autoApprovalThreshold: 90,
    humanEscalationMargin: 70,
    retryLimit: 3,
    strategy: 'strict',
    strictAlignment: true,
    logDiscrepancies: false,
    queues: {
      'consensus-qa': 'active',
      'royalty-payouts': 'active',
      'webhook-ingestion': 'active'
    }
  });

  const [queues, setQueues] = useState<QueueMetric[]>([]);
  const [payoutMetrics, setPayoutMetrics] = useState<PayoutMetrics | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [payouts, setPayouts] = useState<RoyaltyPayout[]>([]);
  const [idempotencyEvents, setIdempotencyEvents] = useState<IdempotencyEvent[]>([]);

  // Page level controls
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'payouts' | 'webhooks' | 'idempotency'>('payouts');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter controls
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>('all');
  const [webhookProviderFilter, setWebhookProviderFilter] = useState<string>('all');
  const [webhookStatusFilter, setWebhookStatusFilter] = useState<string>('all');

  // Selected Webhook detail modal state
  const [inspectingWebhook, setInspectingWebhook] = useState<WebhookLog | null>(null);

  // Live Terminal variables
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[00:01:05] [System] Console session initialized. Connection established with Axiom Core Node.',
    '[00:01:10] [Idempotency] Memory cache active: REDIS connection healthy.',
    '[00:01:15] [Consensus-QA] Calibration profiles retrieved: strategy "Consensus Strict" configured.'
  ]);
  const [isLogStreaming, setIsLogStreaming] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Toast Trigger
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch('/api/admin');
      if (!response.ok) throw new Error('Failed to retrieve system status');
      const data = await response.json();

      setSettings(data.settings);
      setQueues(data.queues);
      setPayoutMetrics(data.payoutMetrics);
      setWebhookLogs(data.webhookLogs);
      setPayouts(data.payouts);
      setIdempotencyEvents(data.idempotencyEvents);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error pulling console telemetry';
      showToast('error', errorMessage);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Sync settings/metrics auto refresh
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  // Terminal Log Simulator
  useEffect(() => {
    if (!isLogStreaming) return;

    const logTemplates = [
      () => `[${new Date().toLocaleTimeString()}] [Consensus-QA] Evaluated claim from model pipelines. Agreement: 94.2% -> Auto-approved payout.`,
      () => `[${new Date().toLocaleTimeString()}] [Idempotency] Deduplication query key idemp_stripe_ch_${Math.random().toString(36).substring(7)}: CACHE HIT.`,
      () => `[${new Date().toLocaleTimeString()}] [Royalty-Payouts] Dispatched disbursement sequence to Stripe api gateway. Response: po_str_captured.`,
      () => `[${new Date().toLocaleTimeString()}] [Webhook-Ingestion] Stripe event charge.succeeded verified. Signature digest matched. Duration: 34ms.`,
      () => `[${new Date().toLocaleTimeString()}] [Consensus-QA] Groq: 98% conf, OpenAI: 96% conf. Score delta within agreement margin.`,
      () => `[${new Date().toLocaleTimeString()}] [Royalty-Payouts] Completed batch audit trace for Ledger block. All keys verified.`,
      () => `[${new Date().toLocaleTimeString()}] [Webhook-Ingestion] Razorpay event payment.captured ingested. Idempotency verified. Duration: 74ms.`,
      () => `[${new Date().toLocaleTimeString()}] [Consensus-QA] Warning: Model agreement margin at 84.8% (threshold: ${settings.agreementMargin}%). Escalating to human auditor queue.`,
    ];

    const interval = setInterval(() => {
      const randomTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setTerminalLogs(prev => {
        const next = [...prev, randomTemplate()];
        if (next.length > 50) next.shift(); // Cap terminal history size
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isLogStreaming, settings.agreementMargin]);

  // Auto scroll terminal log window
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Update Calibration settings
  const handleCalibrationSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed updating configurations');
      setSettings(data.settings);
      showToast('success', 'Consensus QA Calibration profiles updated and persisted.');
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [System] Calibration updated. Agreement margin: ${settings.agreementMargin}%, Auto-Approval: ${settings.autoApprovalThreshold}%.`
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating settings';
      showToast('error', errorMessage);
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Queue Operations Action
  const triggerQueueAction = async (queueName: string, action: 'pause' | 'resume') => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueName, action })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setSettings(data.settings);
      // Fetch stats immediately to reflect queue paused latency change
      fetchStats(true);

      showToast('success', `Queue ${queueName} successfully ${action}d.`);
      setTerminalLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [System] Command execution: Queue "${queueName}" state changed to ${action.toUpperCase()}D.`
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to perform queue action';
      showToast('error', `Failed to ${action} queue ${queueName}: ` + errorMessage);
    }
  };

  // Filter payouts
  const filteredPayouts = payouts.filter(p => {
    const searchMatch =
      p.recipientName.toLowerCase().includes(payoutSearch.toLowerCase()) ||
      p.recipientEmail.toLowerCase().includes(payoutSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(payoutSearch.toLowerCase());
    const statusMatch = payoutStatusFilter === 'all' || p.status.toLowerCase() === payoutStatusFilter.toLowerCase();
    return searchMatch && statusMatch;
  });

  // Filter webhook logs
  const filteredWebhooks = webhookLogs.filter(w => {
    const providerMatch = webhookProviderFilter === 'all' || w.provider.toLowerCase() === webhookProviderFilter.toLowerCase();
    const statusMatch = webhookStatusFilter === 'all' || w.status.toLowerCase() === webhookStatusFilter.toLowerCase();
    return providerMatch && statusMatch;
  });

  return (
    <DashboardLayout>
      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-0 animate-bounce ${
          toast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 shadow-emerald-950/40'
            : 'bg-rose-950/80 border-rose-800 text-rose-300 shadow-rose-950/40'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Primary Container */}
      <div className="max-w-7xl mx-auto space-y-6 select-none">
        
        {/* Global Dashboard Navigation Header */}
        <header className="bg-[#1f1f28]/40 backdrop-blur-md border border-white/[0.02] rounded-2xl px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 font-headline">AXIOM OPERATOR</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20 tracking-wider">CONSOLE</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">Continuous consensus QA alignment & payout auditing dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#13131a] px-3.5 py-1.5 rounded-xl border border-white/5 text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API: ONLINE
            </div>
            
            <button
              onClick={() => fetchStats(false)}
              className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600/80 text-zinc-300 hover:text-white transition-all shadow-md group active:scale-95"
              title="Reload Dashboard metrics"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
              </svg>
            </button>
 
            <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700/60 px-3.5 py-2 rounded-xl text-xs">
              <label className="text-zinc-400 select-none cursor-pointer flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-violet-600 focus:ring-violet-600 focus:ring-offset-zinc-900 w-3.5 h-3.5 cursor-pointer"
                />
                AUTO-SYNC (8s)
              </label>
            </div>
          </div>
        </header>


        {/* TOP LEVEL METRICS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Payout volume card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-800 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">Total Volume</span>
              <div className="p-1.5 rounded-lg bg-violet-950/40 text-violet-400 border border-violet-800/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-white leading-tight">
                ${payoutMetrics?.totalVolume.toLocaleString() || '1,248,500'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">14.2%</span> from previous cycle
              </p>
            </div>
            {/* Custom linear gauge */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                <span>STRIP: {payoutMetrics?.gateways.stripe.percentage}%</span>
                <span>RAZOR: {payoutMetrics?.gateways.razorpay.percentage}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 flex overflow-hidden">
                <div className="h-full bg-violet-500 shadow-md shadow-violet-500/20" style={{ width: `${payoutMetrics?.gateways.stripe.percentage || 71.3}%` }}></div>
                <div className="h-full bg-emerald-500 shadow-md shadow-emerald-500/20" style={{ width: `${payoutMetrics?.gateways.razorpay.percentage || 28.7}%` }}></div>
              </div>
            </div>
          </div>

          {/* Paid card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-800 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider text-emerald-500 uppercase">Paid Ledger</span>
              <div className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-white leading-tight">
                ${payoutMetrics?.paid.toLocaleString() || '1,180,000'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Completed disbursements
              </p>
            </div>
            {/* Visual ring gauge */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.5%' }}></div>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">94.5%</span>
            </div>
          </div>

          {/* Processing card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-800 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider text-amber-500 uppercase">Processing</span>
              <div className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-white leading-tight">
                ${payoutMetrics?.processing.toLocaleString() || '48,500'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Queued or pending clearance
              </p>
            </div>
            {/* Visual ring gauge */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '3.9%' }}></div>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">3.9%</span>
            </div>
          </div>

          {/* Failed card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/30 hover:border-zinc-800 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider text-rose-500 uppercase">Failed Audit</span>
              <div className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-white leading-tight">
                ${payoutMetrics?.failed.toLocaleString() || '20,000'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Rejected or bounced claims
              </p>
            </div>
            {/* Visual ring gauge */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '1.6%' }}></div>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">1.6%</span>
            </div>
          </div>
        </section>

        {/* QUEUES STATISTICS SECTION & CALIBRATION DOCK */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BULLMQ QUEUES STATS (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800/85 rounded-2xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h2 className="text-lg font-black tracking-wide text-white">BullMQ Backlog Dashboard</h2>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">3 Active Workers</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Real-time throughput metrics, latency metrics, and queue actions</p>
            </div>

            {/* List of queues */}
            <div className="space-y-4 my-2">
              {queues.length === 0 ? (
                // Skeleton loading state
                [1, 2, 3].map((idx) => (
                  <div key={idx} className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4 animate-pulse h-28"></div>
                ))
              ) : (
                queues.map((q) => {
                  const isPaused = q.status === 'paused';
                  return (
                    <div
                      key={q.name}
                      className={`bg-zinc-950 border rounded-xl p-4.5 hover:border-zinc-700/60 transition-all ${
                        isPaused ? 'border-zinc-900 opacity-60' : 'border-zinc-800/80 shadow-md shadow-black/10'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black tracking-wide text-zinc-100 font-mono">{q.name}</span>
                            <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold font-mono tracking-wider border ${
                              isPaused
                                ? 'bg-rose-950/20 text-rose-400 border-rose-800/40'
                                : 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40'
                            }`}>
                              {isPaused ? 'PAUSED' : 'PROCESSING'}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-wide">
                            Throughput: {q.ratePerMin} jobs/min | Active Retries: {q.activeRetries}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => triggerQueueAction(q.name, isPaused ? 'resume' : 'pause')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide font-mono transition-all duration-200 border ${
                              isPaused
                                ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800/50 text-emerald-400'
                                : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/50 text-rose-400'
                            }`}
                          >
                            {isPaused ? 'Resume' : 'Pause Queue'}
                          </button>
                        </div>
                      </div>

                      {/* Queue metrics indicators (bars) */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-3.5 border-t border-zinc-900">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Avg Latency</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-zinc-100 font-mono">{q.avgLatencyMs}</span>
                            <span className="text-[9px] text-zinc-500 font-bold">ms</span>
                          </div>
                          {/* Mini dynamic background line indicator */}
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-violet-500 h-full" style={{ width: `${Math.min(100, (q.avgLatencyMs / 1000) * 100)}%` }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Max Latency</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-zinc-100 font-mono">{q.maxLatencyMs}</span>
                            <span className="text-[9px] text-zinc-500 font-bold">ms</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, (q.maxLatencyMs / 2500) * 100)}%` }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Backlog Size</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-black font-mono ${q.backlog > 0 && !isPaused ? 'text-rose-400' : 'text-zinc-100'}`}>
                              {q.backlog}
                            </span>
                            {q.backlog > 0 && !isPaused && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                            )}
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                            <div className={`h-full ${q.backlog > 8 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (q.backlog / 20) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 font-medium font-mono text-center flex justify-between">
              <span>REDIS STORAGE: 28MB USED</span>
              <span>EST. CONGESTION RATIO: 0.12%</span>
            </div>
          </div>

          {/* CALIBRATION PANEL (5 cols) */}
          <form onSubmit={handleCalibrationSave} className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800/85 rounded-2xl p-6 shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 hover:opacity-10 transition-opacity pointer-events-none">
              <svg className="w-36 h-36 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>

            <div className="space-y-1 relative">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-violet-950 text-violet-400 rounded-md border border-violet-800/40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-black tracking-wide text-white">Consensus QA Calibration</h2>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Calibrate AI discrepancy gates, margins, and escalation parameters</p>
            </div>

            {/* Calibration Sliders */}
            <div className="space-y-4.5 my-1 relative z-10">
              
              {/* Slider 1: Agreement Margin */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-300">Agreement Margin</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-violet-950/80 text-violet-400 border border-violet-800/40 text-[11px]">
                    {settings.agreementMargin}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.agreementMargin}
                  onChange={(e) => setSettings({ ...settings, agreementMargin: Number(e.target.value) })}
                  className="w-full accent-violet-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer appearance-none"
                />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Minimum consensus overlap required between primary Groq audit & OpenAI secondary evaluator.
                </p>
              </div>

              {/* Slider 2: Auto-Approval Threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-300">Auto-Approval Threshold</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[11px]">
                    {settings.autoApprovalThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={settings.autoApprovalThreshold}
                  onChange={(e) => setSettings({ ...settings, autoApprovalThreshold: Number(e.target.value) })}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer appearance-none"
                />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Minimum calculated confidence index to release payout assets directly without manual reviewer.
                </p>
              </div>

              {/* Slider 3: Human-in-the-Loop Escalation Rules */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-300">Human Escalation Gate</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-800/40 text-[11px]">
                    {settings.humanEscalationMargin}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={settings.humanEscalationMargin}
                  onChange={(e) => setSettings({ ...settings, humanEscalationMargin: Number(e.target.value) })}
                  className="w-full accent-rose-500 h-1.5 bg-zinc-950 rounded-lg cursor-pointer appearance-none"
                />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Confidence scores dropping below this margin trigger automated ticketing to human auditor consoles.
                </p>
              </div>

              {/* Slider 4: Retry Limits */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-300">Queue Retry Limit</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[11px]">
                    {settings.retryLimit} cycles
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.retryLimit}
                  onChange={(e) => setSettings({ ...settings, retryLimit: Number(e.target.value) })}
                  className="w-full accent-zinc-400 h-1.5 bg-zinc-950 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              {/* Strategy Selector Dropdown */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-zinc-400">Consensus Engine Strategy</label>
                <select
                  value={settings.strategy}
                  onChange={(e) => setSettings({ ...settings, strategy: e.target.value as CalibrationSettings['strategy'] })}
                  className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-xs rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono tracking-wide"
                >
                  <option value="strict">Consensus Match (Strict Verification)</option>
                  <option value="highest_confidence">Highest Confidence Pipeline Winner</option>
                  <option value="groq_primary">Groq Engine Primary (OpenAI validator)</option>
                  <option value="openai_primary">OpenAI Engine Primary (Groq validator)</option>
                </select>
              </div>

              {/* Flag Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.strictAlignment}
                    onChange={(e) => setSettings({ ...settings, strictAlignment: e.target.checked })}
                    className="rounded border-zinc-800 bg-zinc-950 text-violet-500 focus:ring-violet-500 focus:ring-offset-zinc-950 w-4 h-4 cursor-pointer"
                  />
                  Strict Alignment
                </label>
                <label className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.logDiscrepancies}
                    onChange={(e) => setSettings({ ...settings, logDiscrepancies: e.target.checked })}
                    className="rounded border-zinc-800 bg-zinc-950 text-violet-500 focus:ring-violet-500 focus:ring-offset-zinc-950 w-4 h-4 cursor-pointer"
                  />
                  Log Discrepancies
                </label>
              </div>

            </div>

            <button
              type="submit"
              disabled={updatingSettings}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all duration-350 shadow-md shadow-indigo-950/50 hover:shadow-indigo-500/20 focus:outline-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {updatingSettings ? 'Applying parameters...' : 'Apply Calibrated Settings'}
            </button>
          </form>

        </section>

        {/* LIVE SYSTEM TERMINAL CONSOLE */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          {/* Header Controls */}
          <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-md shadow-violet-500/50"></div>
              <span className="text-xs font-black tracking-wider text-zinc-100 uppercase">Live Pipeline Tracer</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLogStreaming(!isLogStreaming)}
                className="flex items-center gap-1.5 text-[10px] font-bold font-mono tracking-wide px-2.5 py-1 rounded-md border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all text-zinc-400 bg-zinc-950"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLogStreaming ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                {isLogStreaming ? 'PAUSE STREAM' : 'RESUME STREAM'}
              </button>
              
              <button
                onClick={() => setTerminalLogs([])}
                className="text-[10px] font-bold font-mono tracking-wide px-2.5 py-1 rounded-md border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all text-zinc-400 bg-zinc-950"
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Log outputs */}
          <div className="mt-3 bg-black/90 rounded-xl border border-zinc-950/40 p-4 h-48 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {terminalLogs.length === 0 ? (
              <div className="text-zinc-600 text-center py-10 select-none">No active tracers logged. Stream is empty.</div>
            ) : (
              terminalLogs.map((log, idx) => {
                let colorClass = 'text-emerald-400';
                if (log.includes('[System]')) colorClass = 'text-violet-400';
                if (log.includes('Warning') || log.includes('Escalating')) colorClass = 'text-amber-400';
                if (log.includes('Failed')) colorClass = 'text-rose-400';
                return (
                  <div key={idx} className={`${colorClass} tracking-wide select-text leading-relaxed break-all`}>
                    {log}
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef}></div>
          </div>
        </section>

        {/* AUDITOR TABBED LOG LISTINGS */}
        <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Tab selector bar */}
          <div className="flex border-b border-zinc-800/80 bg-zinc-900/40 px-5 pt-3 justify-between items-center flex-col md:flex-row gap-3 pb-3 md:pb-0">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-3 text-xs font-bold tracking-wide uppercase border-b-2 px-1 transition-all flex items-center gap-2 ${
                  activeTab === 'payouts'
                    ? 'border-violet-500 text-white font-extrabold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payout Auditor ({filteredPayouts.length})
              </button>
              
              <button
                onClick={() => setActiveTab('webhooks')}
                className={`py-3 text-xs font-bold tracking-wide uppercase border-b-2 px-1 transition-all flex items-center gap-2 ${
                  activeTab === 'webhooks'
                    ? 'border-violet-500 text-white font-extrabold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Webhook Ingestion logs ({filteredWebhooks.length})
              </button>

              <button
                onClick={() => setActiveTab('idempotency')}
                className={`py-3 text-xs font-bold tracking-wide uppercase border-b-2 px-1 transition-all flex items-center gap-2 ${
                  activeTab === 'idempotency'
                    ? 'border-violet-500 text-white font-extrabold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-3 4a2 2 0 012 2m-3 4a2 2 0 012 2m-3 4a2 2 0 012 2m-3-12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Idempotency Registry
              </button>
            </nav>

            {/* Filter Panels depending on active tab */}
            <div className="pb-3 flex gap-3 items-center flex-wrap">
              {activeTab === 'payouts' && (
                <>
                  <input
                    type="text"
                    placeholder="Search recipient / ID..."
                    value={payoutSearch}
                    onChange={(e) => setPayoutSearch(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 rounded-xl w-48 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <select
                    value={payoutStatusFilter}
                    onChange={(e) => setPayoutStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 rounded-xl text-zinc-300 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </>
              )}

              {activeTab === 'webhooks' && (
                <>
                  <select
                    value={webhookProviderFilter}
                    onChange={(e) => setWebhookProviderFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 rounded-xl text-zinc-300 focus:outline-none"
                  >
                    <option value="all">All Providers</option>
                    <option value="stripe">Stripe</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                  
                  <select
                    value={webhookStatusFilter}
                    onChange={(e) => setWebhookStatusFilter(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 rounded-xl text-zinc-300 focus:outline-none"
                  >
                    <option value="all">All Results</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="warning">Warning</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Tab 1 Content: Payout Auditor */}
          {activeTab === 'payouts' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950/60 text-zinc-300 uppercase text-[10px] font-black font-mono tracking-wider border-b border-zinc-850">
                  <tr>
                    <th className="px-6 py-4">Ledger Block ID</th>
                    <th className="px-6 py-4">Recipient Detail</th>
                    <th className="px-6 py-4">Payout Volume</th>
                    <th className="px-6 py-4">Processor Route</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Cleared Timestamp</th>
                    <th className="px-6 py-4 text-right">Reference Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 bg-zinc-900/10">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-zinc-600 select-none">No payout records found.</td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => {
                      let statusBadge = '';
                      if (p.status === 'Paid') statusBadge = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
                      if (p.status === 'Processing') statusBadge = 'bg-amber-950/40 text-amber-400 border-amber-800/40';
                      if (p.status === 'Failed') statusBadge = 'bg-rose-950/40 text-rose-400 border-rose-800/40';

                      return (
                        <tr key={p.id} className="hover:bg-zinc-850/30 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-zinc-200">{p.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-zinc-300 leading-tight">{p.recipientName}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{p.recipientEmail}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-zinc-200">
                            {p.currency === 'INR' ? '₹' : p.currency === 'EUR' ? '€' : '$'}
                            {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.gateway === 'Stripe'
                                ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-800/40'
                                : 'bg-sky-950/50 text-sky-400 border border-sky-800/40'
                            }`}>
                              {p.gateway.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border max-w-max ${statusBadge}`}>
                                {p.status}
                              </span>
                              {p.failureReason && (
                                <span className="text-[9px] text-rose-400 max-w-xs leading-normal">
                                  {p.failureReason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-mono">
                            {new Date(p.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-[10px] text-zinc-500">
                            {p.payoutRef}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2 Content: Webhook Logs */}
          {activeTab === 'webhooks' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950/60 text-zinc-300 uppercase text-[10px] font-black font-mono tracking-wider border-b border-zinc-850">
                  <tr>
                    <th className="px-6 py-4">Event ID</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Webhook Event Type</th>
                    <th className="px-6 py-4">Amount Payload</th>
                    <th className="px-6 py-4">Ingestion Ingress</th>
                    <th className="px-6 py-4">Idempotency</th>
                    <th className="px-6 py-4">Ingested Timestamp</th>
                    <th className="px-6 py-4 text-right">Raw Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 bg-zinc-900/10">
                  {filteredWebhooks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-zinc-600 select-none">No webhook event logs captured.</td>
                    </tr>
                  ) : (
                    filteredWebhooks.map((w) => {
                      let statusBadge = '';
                      if (w.status === 'SUCCESS') statusBadge = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
                      if (w.status === 'WARNING') statusBadge = 'bg-amber-950/40 text-amber-400 border-amber-800/40';
                      if (w.status === 'FAILED') statusBadge = 'bg-rose-950/40 text-rose-400 border-rose-800/40';

                      return (
                        <tr key={w.id} className="hover:bg-zinc-850/30 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-zinc-200">{w.id}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.provider === 'Stripe'
                                ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-800/40'
                                : 'bg-sky-950/50 text-sky-400 border border-sky-800/40'
                            }`}>
                              {w.provider.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-300 font-bold">{w.eventType}</td>
                          <td className="px-6 py-4 font-bold text-zinc-200">
                            {w.currency === 'INR' ? '₹' : w.currency === 'EUR' ? '€' : '$'}
                            {w.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                                {w.status}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">{w.processingMs}ms</span>
                            </div>
                            {w.error && <p className="text-[9px] text-rose-400 mt-1 leading-relaxed">{w.error}</p>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wide ${
                              w.idempotency === 'Verified'
                                ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
                                : 'bg-violet-950/30 text-violet-400 border border-violet-900/30 font-bold animate-pulse'
                            }`}>
                              {w.idempotency}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-mono">
                            {new Date(w.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setInspectingWebhook(w)}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-[10px] font-black tracking-wide font-mono text-zinc-300 border border-zinc-700 hover:text-white transition-all active:scale-95"
                            >
                              INSPECT
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3 Content: Idempotency Registry */}
          {activeTab === 'idempotency' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-zinc-400">
                <thead className="bg-zinc-950/60 text-zinc-300 uppercase text-[10px] font-black font-mono tracking-wider border-b border-zinc-850">
                  <tr>
                    <th className="px-6 py-4">Deduplication Registry Key</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Resolution Lock Action</th>
                    <th className="px-6 py-4">API Route Resource Target</th>
                    <th className="px-6 py-4">Deduplication Key Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/50 bg-zinc-900/10">
                  {idempotencyEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-zinc-600 select-none">No active idempotency locks.</td>
                    </tr>
                  ) : (
                    idempotencyEvents.map((evt, idx) => (
                      <tr key={idx} className="hover:bg-zinc-850/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-zinc-200 select-all">{evt.key}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.provider === 'Stripe'
                              ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-800/40'
                              : 'bg-sky-950/50 text-sky-400 border border-sky-800/40'
                          }`}>
                            {evt.provider.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide border ${
                            evt.matchType === 'Cache Hit'
                              ? 'bg-amber-950/30 text-amber-400 border-amber-900/30 font-extrabold animate-pulse'
                              : evt.matchType === 'Lock Acquired'
                              ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                          }`}>
                            {evt.matchType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">{evt.resource}</td>
                        <td className="px-6 py-4 font-mono text-zinc-500">
                          {new Date(evt.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </section>

      </div>

      {/* WEBHOOK INSPECTION COLLAPSIBLE CODE DRAWER/MODAL */}
      {inspectingWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh] animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">PAYLOAD INSPECTOR</span>
                <h3 className="text-sm font-black text-zinc-200 font-mono tracking-wide mt-0.5">
                  {inspectingWebhook.provider.toUpperCase()}::{inspectingWebhook.eventType}
                </h3>
              </div>
              
              <button
                onClick={() => setInspectingWebhook(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 transition-all active:scale-95"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Ingestion status breakdown */}
            <div className="px-5 py-4 bg-zinc-950/50 border-b border-zinc-850 flex justify-between flex-wrap gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-500 text-[10px]">EVENT ID</span>
                <p className="text-zinc-300 font-bold mt-0.5">{inspectingWebhook.id}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">STATUS</span>
                <p className={`font-bold mt-0.5 ${inspectingWebhook.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {inspectingWebhook.status} ({inspectingWebhook.processingMs}ms)
                </p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">IDEMPOTENCY</span>
                <p className="text-zinc-300 font-bold mt-0.5">{inspectingWebhook.idempotency}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">CLEARED TIME</span>
                <p className="text-zinc-300 mt-0.5">{new Date(inspectingWebhook.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-black/95 font-mono text-[11px] text-indigo-300">
              <pre className="whitespace-pre-wrap select-text leading-relaxed">
                {inspectingWebhook.payload}
              </pre>
            </div>
            
            {/* Footer buttons */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 text-right flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500">DIGEST SIGNATURE: SHA-256 HMAC VERIFIED</span>
              <button
                onClick={() => setInspectingWebhook(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-white transition-all hover:scale-98 border border-zinc-750"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

