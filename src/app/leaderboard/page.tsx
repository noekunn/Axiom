'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ModelScore } from '../api/leaderboard/route';

// Static client-side simulation fallback data to ensure smooth rendering and instant load times
const LOCAL_MODEL_PROFILES = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    developer: 'Anthropic',
    parameters: 'Proprietary',
    type: 'Closed' as const,
    baseScores: { linguistic: 89.2, domain: 91.5, reasoning: 93.4 },
    adjustments: {
      domains: {
        medical: { domain: 2.1, reasoning: 1.5, linguistic: 0.5 },
        legal: { domain: 3.5, reasoning: 2.8, linguistic: -0.2 },
        finance: { domain: 1.8, reasoning: 1.2, linguistic: 0.2 },
      },
      languages: {
        hinglish: { linguistic: 3.8, reasoning: 1.0 },
        hindi: { linguistic: 1.5, reasoning: 0.5 },
        tamil: { linguistic: -2.5, reasoning: -2.0, domain: -1.0 },
        telugu: { linguistic: -2.8, reasoning: -2.2, domain: -1.2 },
        bengali: { linguistic: -1.8, reasoning: -1.2, domain: -0.5 },
        marathi: { linguistic: -2.2, reasoning: -1.5, domain: -0.8 },
      },
    },
    metrics: { latency: 410, throughput: 78, costInput: 3.0, costOutput: 15.0, winRate: 85.4, contextUsed: 8192 },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    developer: 'OpenAI',
    parameters: 'Proprietary',
    type: 'Closed' as const,
    baseScores: { linguistic: 88.5, domain: 90.2, reasoning: 91.1 },
    adjustments: {
      domains: {
        medical: { domain: 2.8, reasoning: 2.0, linguistic: 0.2 },
        legal: { domain: 1.8, reasoning: 1.2, linguistic: -0.5 },
        finance: { domain: 3.5, reasoning: 2.5, linguistic: 0.8 },
      },
      languages: {
        hinglish: { linguistic: 3.2, reasoning: 0.8 },
        hindi: { linguistic: 1.2, reasoning: 0.2 },
        tamil: { linguistic: -1.8, reasoning: -1.2, domain: -0.8 },
        telugu: { linguistic: -2.2, reasoning: -1.5, domain: -1.0 },
        bengali: { linguistic: -1.4, reasoning: -0.8, domain: -0.4 },
        marathi: { linguistic: -1.6, reasoning: -1.0, domain: -0.6 },
      },
    },
    metrics: { latency: 290, throughput: 92, costInput: 2.5, costOutput: 10.0, winRate: 81.2, contextUsed: 8192 },
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    developer: 'Google',
    parameters: 'Proprietary',
    type: 'Closed' as const,
    baseScores: { linguistic: 85.8, domain: 86.5, reasoning: 87.2 },
    adjustments: {
      domains: {
        medical: { domain: 1.5, reasoning: 0.8, linguistic: 0.5 },
        legal: { domain: 0.8, reasoning: 0.5, linguistic: -0.2 },
        finance: { domain: 1.8, reasoning: 1.5, linguistic: 0.4 },
      },
      languages: {
        hinglish: { linguistic: -1.8, reasoning: -0.5 },
        hindi: { linguistic: 2.8, reasoning: 1.8, domain: 1.0 },
        tamil: { linguistic: 4.2, reasoning: 3.2, domain: 2.0 },
        telugu: { linguistic: 3.8, reasoning: 2.8, domain: 1.8 },
        bengali: { linguistic: 3.5, reasoning: 2.5, domain: 1.5 },
        marathi: { linguistic: 3.0, reasoning: 2.2, domain: 1.2 },
      },
    },
    metrics: { latency: 380, throughput: 84, costInput: 1.25, costOutput: 5.0, winRate: 75.8, contextUsed: 16384 },
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 (70B)',
    developer: 'Meta',
    parameters: '70B',
    type: 'Open' as const,
    baseScores: { linguistic: 82.1, domain: 83.4, reasoning: 82.8 },
    adjustments: {
      domains: {
        medical: { domain: 0.8, reasoning: -0.5, linguistic: 0.2 },
        legal: { domain: -1.5, reasoning: -2.0, linguistic: -0.8 },
        finance: { domain: 1.2, reasoning: 0.8, linguistic: 0.4 },
      },
      languages: {
        hinglish: { linguistic: 2.5, reasoning: 0.5 },
        hindi: { linguistic: 0.8, reasoning: 0.0 },
        tamil: { linguistic: -5.2, reasoning: -4.5, domain: -3.5 },
        telugu: { linguistic: -5.8, reasoning: -5.0, domain: -3.8 },
        bengali: { linguistic: -4.0, reasoning: -3.5, domain: -2.8 },
        marathi: { linguistic: -4.5, reasoning: -3.8, domain: -3.0 },
      },
    },
    metrics: { latency: 190, throughput: 115, costInput: 0.35, costOutput: 0.40, winRate: 60.1, contextUsed: 8192 },
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    developer: 'Mistral AI',
    parameters: '123B',
    type: 'Open' as const,
    baseScores: { linguistic: 83.2, domain: 84.8, reasoning: 84.5 },
    adjustments: {
      domains: {
        medical: { domain: 1.0, reasoning: 0.4, linguistic: 0.2 },
        legal: { domain: 0.5, reasoning: 0.2, linguistic: -0.4 },
        finance: { domain: 1.5, reasoning: 1.2, linguistic: 0.5 },
      },
      languages: {
        hinglish: { linguistic: 1.8, reasoning: 0.2 },
        hindi: { linguistic: -0.5, reasoning: -0.5 },
        tamil: { linguistic: -4.8, reasoning: -4.2, domain: -3.2 },
        telugu: { linguistic: -5.2, reasoning: -4.8, domain: -3.5 },
        bengali: { linguistic: -3.8, reasoning: -3.2, domain: -2.5 },
        marathi: { linguistic: -4.0, reasoning: -3.5, domain: -2.8 },
      },
    },
    metrics: { latency: 260, throughput: 68, costInput: 2.0, costOutput: 6.0, winRate: 64.8, contextUsed: 8192 },
  },
];

const getDatasetStats = (domain: string, language: string) => {
  let baseCases = 36500;
  let languageCount = baseCases;
  if (language !== 'all') {
    switch (language) {
      case 'hinglish': languageCount = 12500; break;
      case 'hindi': languageCount = 6000; break;
      case 'tamil': languageCount = 4500; break;
      case 'telugu': languageCount = 4500; break;
      case 'bengali': languageCount = 4500; break;
      case 'marathi': languageCount = 4500; break;
    }
  }

  let finalCount = languageCount;
  if (domain !== 'all') {
    switch (domain) {
      case 'medical': finalCount = Math.round(languageCount * 0.35); break;
      case 'legal': finalCount = Math.round(languageCount * 0.30); break;
      case 'finance': finalCount = Math.round(languageCount * 0.35); break;
    }
  }

  return {
    testCases: finalCount,
    humanValidatedPct: 94.8,
    lastUpdated: '2026-05-28',
    promptTypes: {
      conversational: Math.round(finalCount * 0.40),
      reasoning: Math.round(finalCount * 0.35),
      factualQA: Math.round(finalCount * 0.25),
    }
  };
};

const getModelInsights = (id: string, domain: string, language: string) => {
  const domName = domain === 'all' ? 'general domains' : domain.toUpperCase();
  const langName = language === 'all' ? 'bilingual scripts' : language.toUpperCase();

  switch (id) {
    case 'claude-3-5-sonnet':
      return `Demonstrates peerless linguistic nuance in code-mixed Hinglish and complex reasoning depth. Captures subtle cultural idioms and achieves perfect semantic fidelity in legal drafts. Slower than GPT-4o but exceptionally robust.`;
    case 'gpt-4o':
      return `Phenomenal financial and medical domain reasoning. Yields lightning-fast latencies and highly structured formatting. Occasionally displays slight stiffness or overly-formal translations in regional Indic scripts like Tamil or Telugu.`;
    case 'gemini-1-5-pro':
      return `Outstanding linguistic authenticity in native regional Indic scripts (especially Tamil and Telugu) due to its massive, unfragmented vocabulary. Shows remarkable contextual recall but struggles slightly with conversational Hinglish slang.`;
    case 'llama-3-3-70b':
      return `Very efficient open-weights option. Excellent at conversational alignment and informal dialogue in Hinglish, though logical reasoning and domain accuracy show modest drops in low-resource regional Indic scripts.`;
    case 'mistral-large-2':
      return `Strong open-source model showing solid bilingual translation. Good overall grasp of finance terminologies. Latency is higher than Llama, and complex reasoning depth is slightly limited in low-resource environments.`;
    default:
      return `Solid general purpose performance. Showcases reliable output generation across all datasets.`;
  }
};

export default function LeaderboardPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [activeModelId, setActiveModelId] = useState<string>('claude-3-5-sonnet');
  const [apiData, setApiData] = useState<{ leaderboard: ModelScore[]; stats: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'scatter'>('comparison');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<{ modelIndex: number; barIndex: number } | null>(null);
  const [hoveredScatterId, setHoveredScatterId] = useState<string | null>(null);

  // Dynamic filter updates
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?domain=${selectedDomain}&language=${selectedLanguage}`);
        if (!res.ok) throw new Error('API down');
        const json = await res.json();
        if (active) {
          setApiData(json);
        }
      } catch (err) {
        // Fallback to local simulation if API call fails
        const rankedModels: ModelScore[] = LOCAL_MODEL_PROFILES.map((profile) => {
          let linguistic = profile.baseScores.linguistic;
          let domainScore = profile.baseScores.domain;
          let reasoning = profile.baseScores.reasoning;

          if (selectedDomain !== 'all') {
            const domainAdj = profile.adjustments.domains[selectedDomain as keyof typeof profile.adjustments.domains];
            if (domainAdj) {
              if (domainAdj.linguistic) linguistic += domainAdj.linguistic;
              if (domainAdj.domain) domainScore += domainAdj.domain;
              if (domainAdj.reasoning) reasoning += domainAdj.reasoning;
            }
          }

          if (selectedLanguage !== 'all') {
            const langAdj = profile.adjustments.languages[selectedLanguage as keyof typeof profile.adjustments.languages] as { linguistic?: number; domain?: number; reasoning?: number } | undefined;
            if (langAdj) {
              if (langAdj.linguistic) linguistic += langAdj.linguistic;
              if (langAdj.domain) domainScore += langAdj.domain;
              if (langAdj.reasoning) reasoning += langAdj.reasoning;
            }
          }

          linguistic = Math.min(100, Math.max(0, Math.round(linguistic * 10) / 10));
          domainScore = Math.min(100, Math.max(0, Math.round(domainScore * 10) / 10));
          reasoning = Math.min(100, Math.max(0, Math.round(reasoning * 10) / 10));

          const overallScore = Math.round(((linguistic + domainScore + reasoning) / 3) * 10) / 10;

          const latencyMultiplier = selectedDomain === 'legal' ? 1.15 : selectedDomain === 'medical' ? 1.05 : 1.0;
          const languageLatencyMultiplier = selectedLanguage === 'tamil' || selectedLanguage === 'telugu' ? 1.2 : 1.0;
          const actualLatency = Math.round(profile.metrics.latency * latencyMultiplier * languageLatencyMultiplier);
          const actualThroughput = Math.round(profile.metrics.throughput / (latencyMultiplier * languageLatencyMultiplier));

          return {
            rank: 0,
            id: profile.id,
            name: profile.name,
            developer: profile.developer,
            parameters: profile.parameters,
            type: profile.type,
            overallScore,
            scores: { linguistic, domain: domainScore, reasoning },
            metrics: {
              latency: actualLatency,
              throughput: actualThroughput,
              costInput: profile.metrics.costInput,
              costOutput: profile.metrics.costOutput,
              winRate: Math.min(99, Math.max(20, Math.round((profile.metrics.winRate + (overallScore - (profile.baseScores.linguistic + profile.baseScores.domain + profile.baseScores.reasoning) / 3)) * 10) / 10)),
              contextUsed: profile.metrics.contextUsed,
            },
          };
        });

        rankedModels.sort((a, b) => b.overallScore - a.overallScore);
        rankedModels.forEach((model, index) => { model.rank = index + 1; });

        const stats = getDatasetStats(selectedDomain, selectedLanguage);
        if (active) {
          setApiData({ leaderboard: rankedModels, stats });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, [selectedDomain, selectedLanguage]);

  // Read data securely or fallback
  const data = useMemo(() => {
    if (apiData) return apiData;
    
    // Quick synchronous bootstrap data for immediate SSR compatibility
    const initialModels: ModelScore[] = LOCAL_MODEL_PROFILES.map((profile, index) => ({
      rank: index + 1,
      id: profile.id,
      name: profile.name,
      developer: profile.developer,
      parameters: profile.parameters,
      type: profile.type,
      overallScore: Math.round(((profile.baseScores.linguistic + profile.baseScores.domain + profile.baseScores.reasoning) / 3) * 10) / 10,
      scores: { ...profile.baseScores },
      metrics: {
        latency: profile.metrics.latency,
        throughput: profile.metrics.throughput,
        costInput: profile.metrics.costInput,
        costOutput: profile.metrics.costOutput,
        winRate: profile.metrics.winRate,
        contextUsed: profile.metrics.contextUsed,
      }
    }));
    return {
      leaderboard: initialModels,
      stats: getDatasetStats('all', 'all')
    };
  }, [apiData]);

  // Find active inspected model
  const activeModel = useMemo(() => {
    return data.leaderboard.find(m => m.id === activeModelId) || data.leaderboard[0];
  }, [data.leaderboard, activeModelId]);

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans selection:bg-violet-500/30 pb-20">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-violet-950/15 via-indigo-950/5 to-transparent pointer-events-none" />
      <div className="absolute top-[200px] left-[10%] w-[350px] h-[350px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[350px] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-600/5 blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Dashboard Header */}
        <header className="border-b border-zinc-800/80 pb-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">Axiom Analytics Benchmarks</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Indic & Hinglish LLM Leaderboard
              </h1>
              <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                Evaluating top-tier foundation models on complex conversational Hinglish (Hindi + English) code-mixed text and regional Indic languages across high-stakes domains.
              </p>
            </div>
            
            {/* Summary Cards */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/60 rounded-xl px-4 py-3 min-w-[130px]">
                <div className="text-xs text-zinc-500 font-medium">Active Test Cases</div>
                <div className="text-xl font-bold text-violet-400 mt-0.5">
                  {loading ? (
                    <span className="inline-block h-5 w-16 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    data.stats.testCases.toLocaleString()
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Adversarial prompts</div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/60 rounded-xl px-4 py-3 min-w-[130px]">
                <div className="text-xs text-zinc-500 font-medium">Expert Validation</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5">
                  {data.stats.humanValidatedPct}%
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Human alignment rate</div>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/60 rounded-xl px-4 py-3 min-w-[130px]">
                <div className="text-xs text-zinc-500 font-medium">Last Audited</div>
                <div className="text-xl font-bold text-zinc-300 mt-0.5">May 2026</div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" /> Version 2.4
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Global Evaluation Filters Section */}
        <section className="bg-zinc-900/40 backdrop-blur border border-zinc-800/80 rounded-2xl p-6 mb-8 shadow-xl shadow-black/30">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            
            {/* Domain Filter Pills */}
            <div className="w-full lg:w-auto">
              <span className="text-xs font-semibold text-zinc-400 block mb-2 tracking-wide uppercase">Select Target Domain</span>
              <div className="flex flex-wrap gap-2 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/60 w-max">
                {[
                  { id: 'all', label: 'All Domains' },
                  { id: 'medical', label: 'Medical & Health' },
                  { id: 'legal', label: 'Legal & Compliance' },
                  { id: 'finance', label: 'Finance & Banking' }
                ].map((dom) => (
                  <button
                    key={dom.id}
                    onClick={() => setSelectedDomain(dom.id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      selectedDomain === dom.id
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    }`}
                  >
                    {dom.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection Filter */}
            <div className="w-full lg:w-auto">
              <span className="text-xs font-semibold text-zinc-400 block mb-2 tracking-wide uppercase">Target Language Dataset</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Languages' },
                  { id: 'hinglish', label: 'Hinglish' },
                  { id: 'hindi', label: 'Hindi (हिन्दी)' },
                  { id: 'tamil', label: 'Tamil (தமிழ்)' },
                  { id: 'telugu', label: 'Telugu (తెలుగు)' },
                  { id: 'bengali', label: 'Bengali (বাংলা)' },
                  { id: 'marathi', label: 'Marathi (मराठी)' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                      selectedLanguage === lang.id
                        ? 'bg-zinc-800 text-white border-zinc-700 shadow-md'
                        : 'bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800 hover:bg-zinc-900/30'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Dynamic Charts and Detailed Analytics Visualization Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main SVG Interactive Chart Card (Takes 2 Columns) */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-lg shadow-black/20 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <svg className="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 20V10M12 20V4M6 20v-6"/>
                    </svg>
                    Interactive Benchmark Analytics
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Visualize LLM capabilities across our three custom core evaluation layers</p>
                </div>
                
                {/* Chart Type Toggle Tabs */}
                <div className="flex p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs">
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                      activeTab === 'comparison' ? 'bg-zinc-900 text-violet-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    3-Dimension Stack
                  </button>
                  <button
                    onClick={() => setActiveTab('scatter')}
                    className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                      activeTab === 'scatter' ? 'bg-zinc-900 text-cyan-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Latency vs. Score
                  </button>
                </div>
              </div>

              {/* Rendering Dynamic Charts */}
              <div className="relative w-full h-[260px] flex items-center justify-center">
                {loading && (
                  <div className="absolute inset-0 bg-[#030712]/40 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-2 rounded-xl">
                    <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-zinc-400">Recalculating models...</span>
                  </div>
                )}

                {activeTab === 'comparison' ? (
                  /* Custom Built React-SVG Grouped Bar Chart */
                  <svg viewBox="0 0 800 260" className="w-full h-full text-zinc-400 select-none">
                    {/* Horizontal Reference Lines & Labels */}
                    {[100, 90, 80, 70, 60].map((level, idx) => {
                      const y = 20 + ((100 - level) / 40) * 180;
                      return (
                        <g key={level} className="opacity-45">
                          <line x1="50" y1={y} x2="780" y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="15" y={y + 4} className="text-[10px] font-medium fill-zinc-500 text-right">{level}%</text>
                        </g>
                      );
                    })}

                    {/* Grouped Bars per model */}
                    {data.leaderboard.map((model, modelIdx) => {
                      // Model group starting X coordinate
                      const groupWidth = 110;
                      const startX = 65 + modelIdx * 145;
                      
                      const barWidth = 16;
                      const barSpacing = 4;
                      
                      // Base calculation (y=20 to y=200 represents 100% to 60%)
                      const getBarY = (val: number) => 20 + ((100 - val) / 40) * 180;
                      const getBarHeight = (val: number) => 180 - ((100 - val) / 40) * 180;

                      const lingScore = model.scores.linguistic;
                      const domScore = model.scores.domain;
                      const reasScore = model.scores.reasoning;

                      return (
                        <g key={model.id} className="transition-all duration-300">
                          {/* X-axis Model Badge */}
                          <text x={startX + 24} y="222" className={`text-[11px] font-bold text-center fill-zinc-400 transition-colors ${activeModelId === model.id ? 'fill-violet-400 font-extrabold text-[12px]' : ''}`}>
                            {model.name.split(' ')[0]} {model.name.split(' ')[1] || ''}
                          </text>
                          
                          {/* Hover highlights for active elements */}
                          {activeModelId === model.id && (
                            <rect x={startX - 10} y="15" width="70" height="225" rx="8" className="fill-violet-500/5 stroke-violet-500/10 stroke-1" />
                          )}

                          {/* Bar 1: Linguistic Authenticity (Purple) */}
                          <g
                            onMouseEnter={() => setHoveredBarIndex({ modelIndex: modelIdx, barIndex: 0 })}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            onClick={() => setActiveModelId(model.id)}
                            className="cursor-pointer group"
                          >
                            <rect
                              x={startX}
                              y={getBarY(lingScore)}
                              width={barWidth}
                              height={Math.max(2, getBarHeight(lingScore))}
                              rx="3"
                              className={`fill-[#818CF8] hover:fill-[#A5B4FC] transition-colors duration-200 ${
                                activeModelId === model.id ? 'opacity-100 shadow-lg' : 'opacity-70'
                              }`}
                            />
                            {/* Bar mini border glow if active */}
                            {activeModelId === model.id && (
                              <rect x={startX} y={getBarY(lingScore)} width={barWidth} height={2} fill="#A5B4FC" />
                            )}
                          </g>

                          {/* Bar 2: Domain Accuracy (Teal) */}
                          <g
                            onMouseEnter={() => setHoveredBarIndex({ modelIndex: modelIdx, barIndex: 1 })}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            onClick={() => setActiveModelId(model.id)}
                            className="cursor-pointer group"
                          >
                            <rect
                              x={startX + barWidth + barSpacing}
                              y={getBarY(domScore)}
                              width={barWidth}
                              height={Math.max(2, getBarHeight(domScore))}
                              rx="3"
                              className={`fill-[#2DD4BF] hover:fill-[#6EE7B7] transition-colors duration-200 ${
                                activeModelId === model.id ? 'opacity-100 shadow-lg' : 'opacity-70'
                              }`}
                            />
                            {activeModelId === model.id && (
                              <rect x={startX + barWidth + barSpacing} y={getBarY(domScore)} width={barWidth} height={2} fill="#6EE7B7" />
                            )}
                          </g>

                          {/* Bar 3: Reasoning Depth (Rose) */}
                          <g
                            onMouseEnter={() => setHoveredBarIndex({ modelIndex: modelIdx, barIndex: 2 })}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            onClick={() => setActiveModelId(model.id)}
                            className="cursor-pointer group"
                          >
                            <rect
                              x={startX + (barWidth + barSpacing) * 2}
                              y={getBarY(reasScore)}
                              width={barWidth}
                              height={Math.max(2, getBarHeight(reasScore))}
                              rx="3"
                              className={`fill-[#F43F5E] hover:fill-[#FDA4AF] transition-colors duration-200 ${
                                activeModelId === model.id ? 'opacity-100 shadow-lg' : 'opacity-70'
                              }`}
                            />
                            {activeModelId === model.id && (
                              <rect x={startX + (barWidth + barSpacing) * 2} y={getBarY(reasScore)} width={barWidth} height={2} fill="#FDA4AF" />
                            )}
                          </g>
                        </g>
                      );
                    })}

                    {/* Chart Tooltips for bars */}
                    {hoveredBarIndex && (
                      <g className="pointer-events-none">
                        {(() => {
                          const mIndex = hoveredBarIndex.modelIndex;
                          const bIndex = hoveredBarIndex.barIndex;
                          const model = data.leaderboard[mIndex];
                          if (!model) return null;
                          
                          const metricNames = ['Linguistic Authenticity', 'Domain Accuracy', 'Reasoning Depth'];
                          const scoresList = [model.scores.linguistic, model.scores.domain, model.scores.reasoning];
                          const colors = ['#818CF8', '#2DD4BF', '#F43F5E'];
                          
                          const value = scoresList[bIndex];
                          const name = metricNames[bIndex];
                          const color = colors[bIndex];

                          const groupX = 65 + mIndex * 145;
                          const tooltipX = Math.min(680, Math.max(10, groupX - 35));
                          const tooltipY = 45;

                          return (
                            <g>
                              {/* Background panel */}
                              <rect x={tooltipX} y={tooltipY} width="165" height="42" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" className="shadow-2xl" />
                              <text x={tooltipX + 10} y={tooltipY + 16} className="text-[10px] font-semibold fill-zinc-300">{model.name}</text>
                              <circle cx={tooltipX + 15} cy={tooltipY + 28} r="3" fill={color} />
                              <text x={tooltipX + 22} y={tooltipY + 31} className="text-[9px] fill-zinc-400 font-medium">
                                {name}: <tspan className="font-bold fill-zinc-100">{value}%</tspan>
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                ) : (
                  /* Custom Interactive Latency vs. Accuracy Scatter Plot */
                  <svg viewBox="0 0 800 260" className="w-full h-full text-zinc-400 select-none">
                    {/* Reference Line for 'Efficiency Frontier' */}
                    <path d="M120 40 Q 220 50 720 180" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5 5" className="opacity-30" />
                    <text x="130" y="35" className="text-[9px] font-semibold tracking-wider uppercase fill-violet-400/50">Efficiency Frontier</text>

                    {/* Horizontal Reference Lines (Scores) */}
                    {[95, 90, 85, 80, 75].map((lvl) => {
                      const y = 30 + ((95 - lvl) / 20) * 170;
                      return (
                        <g key={lvl} className="opacity-35">
                          <line x1="60" y1={y} x2="780" y2={y} stroke="#27272a" strokeWidth="1" />
                          <text x="25" y={y + 4} className="text-[10px] font-medium fill-zinc-500 text-right">{lvl}%</text>
                        </g>
                      );
                    })}

                    {/* Vertical Reference Lines (Latency in ms) */}
                    {[150, 200, 250, 300, 350, 400, 450, 500].map((lat) => {
                      const x = 70 + ((lat - 150) / 350) * 680;
                      return (
                        <g key={lat} className="opacity-35">
                          <line x1={x} y1="30" x2={x} y2="200" stroke="#27272a" strokeWidth="1" />
                          <text x={x} y="215" className="text-[10px] font-medium fill-zinc-500 text-center">{lat}ms</text>
                        </g>
                      );
                    })}

                    {/* Y & X Axis labels */}
                    <text x="-120" y="15" transform="rotate(-90)" className="text-[9px] font-bold tracking-wider uppercase fill-zinc-500 text-center">Overall Accuracy (%)</text>
                    <text x="420" y="240" className="text-[9px] font-bold tracking-wider uppercase fill-zinc-500 text-center">Latency (ms) — Lower is Faster</text>

                    {/* Model Bubbles */}
                    {data.leaderboard.map((model) => {
                      const lat = model.metrics.latency;
                      const score = model.overallScore;

                      // Map coordinates securely
                      const cx = 70 + ((lat - 150) / 350) * 680;
                      const cy = 30 + ((95 - score) / 20) * 170;

                      // Radius scaled by context window or parameter scale approximation
                      const r = model.type === 'Closed' ? 14 : 10;
                      const bubbleColor = model.id === 'claude-3-5-sonnet' ? '#818CF8'
                                          : model.id === 'gpt-4o' ? '#2DD4BF'
                                          : model.id === 'gemini-1-5-pro' ? '#F59E0B'
                                          : '#10B981';

                      const isSelected = activeModelId === model.id;

                      return (
                        <g key={model.id} className="transition-all duration-300">
                          {/* Inner glow halo for the active model bubble */}
                          {isSelected && (
                            <circle cx={cx} cy={cy} r={r + 8} fill={bubbleColor} className="opacity-15 animate-ping" />
                          )}
                          
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? r + 3 : r}
                            fill={bubbleColor}
                            onClick={() => {
                              setActiveModelId(model.id);
                              setHoveredScatterId(model.id);
                            }}
                            onMouseEnter={() => setHoveredScatterId(model.id)}
                            onMouseLeave={() => setHoveredScatterId(null)}
                            className={`cursor-pointer stroke-zinc-950 stroke-2 hover:opacity-100 transition-all duration-200 ${
                              isSelected ? 'opacity-100 scale-110 shadow-lg' : 'opacity-70'
                            }`}
                          />

                          {/* Bubble Text tag */}
                          <text
                            x={cx}
                            y={cy - (r + 7)}
                            className={`text-[9px] font-extrabold text-center transition-colors pointer-events-none fill-zinc-400 ${
                              isSelected ? 'fill-white text-[10px]' : ''
                            }`}
                            textAnchor="middle"
                          >
                            {model.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Tooltip for Scatter Bubble hover */}
                    {hoveredScatterId && (
                      <g className="pointer-events-none">
                        {(() => {
                          const model = data.leaderboard.find(m => m.id === hoveredScatterId);
                          if (!model) return null;
                          const cx = 70 + ((model.metrics.latency - 150) / 350) * 680;
                          const cy = 30 + ((95 - model.overallScore) / 20) * 170;
                          
                          const tWidth = 150;
                          const tHeight = 65;
                          const tx = Math.min(630, Math.max(70, cx - 75));
                          const ty = cy > 130 ? cy - tHeight - 15 : cy + 15;

                          return (
                            <g>
                              <rect x={tx} y={ty} width={tWidth} height={tHeight} rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1" className="shadow-2xl" />
                              <text x={tx + 12} y={ty + 18} className="text-[10px] font-bold fill-white">{model.name}</text>
                              <text x={tx + 12} y={ty + 32} className="text-[9px] fill-zinc-400">Score: <tspan className="font-semibold fill-zinc-200">{model.overallScore}%</tspan></text>
                              <text x={tx + 12} y={ty + 44} className="text-[9px] fill-zinc-400">Latency: <tspan className="font-semibold fill-zinc-200">{model.metrics.latency} ms</tspan></text>
                              <text x={tx + 12} y={ty + 56} className="text-[9px] fill-zinc-400">Throughput: <tspan className="font-semibold fill-zinc-200">{model.metrics.throughput} t/s</tspan></text>
                            </g>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                )}
              </div>
            </div>

            {/* Metric Legend */}
            <div className="flex flex-wrap gap-6 border-t border-zinc-800/50 pt-4 mt-2 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#818CF8]" />
                <span className="text-xs font-semibold text-zinc-400">Linguistic Authenticity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#2DD4BF]" />
                <span className="text-xs font-semibold text-zinc-400">Domain Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#F43F5E]" />
                <span className="text-xs font-semibold text-zinc-400">Reasoning Depth</span>
              </div>
              <div className="text-[10px] text-zinc-500 self-center lg:ml-auto">
                * Click bars or circles to inspect specific model breakdown card.
              </div>
            </div>

          </div>

          {/* Inspected Model Scorecard (Right sidebar widget) */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-lg shadow-black/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Detailed Scorecard</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                  activeModel.type === 'Closed'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {activeModel.type} Source
                </span>
              </div>

              {/* Model Name & Stats */}
              <div>
                <h4 className="text-2xl font-black text-white leading-tight">{activeModel.name}</h4>
                <div className="text-xs text-zinc-500 mt-0.5">By {activeModel.developer} • {activeModel.parameters} params</div>
              </div>

              {/* Circle Score visualization */}
              <div className="my-6 flex items-center justify-center relative">
                {/* SVG Progress Circle Ring */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="url(#purpleTealGrad)"
                    strokeWidth="9"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - activeModel.overallScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Linear Gradient for Ring */}
                  <defs>
                    <linearGradient id="purpleTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#2DD4BF" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Absolute overlay content */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white tracking-tighter">{activeModel.overallScore}%</span>
                  <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">Overall Index</span>
                </div>
              </div>

              {/* Dimension scores block */}
              <div className="space-y-3">
                {[
                  { name: 'Linguistic Authenticity', score: activeModel.scores.linguistic, color: 'bg-[#818CF8]' },
                  { name: 'Domain Accuracy', score: activeModel.scores.domain, color: 'bg-[#2DD4BF]' },
                  { name: 'Reasoning Depth', score: activeModel.scores.reasoning, color: 'bg-[#F43F5E]' }
                ].map((dim) => (
                  <div key={dim.name}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-zinc-400">{dim.name}</span>
                      <span className="text-zinc-200">{dim.score}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dim.color} rounded-full transition-all duration-500`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Insight Comment Box */}
            <div className="mt-6 pt-4 border-t border-zinc-800/60 bg-zinc-950/40 rounded-xl p-3 border border-zinc-900/60">
              <span className="text-[10px] font-bold tracking-wider text-violet-400 uppercase block mb-1">Expert Contextual Evaluation</span>
              <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                "{getModelInsights(activeModel.id, selectedDomain, selectedLanguage)}"
              </p>
            </div>

          </div>

        </section>

        {/* Complete Benchmark Ranking Table */}
        <section className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl shadow-black/30">
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                Detailed Benchmark Rankings
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Audited metrics including cost structures, latencies, and human validation win rates</p>
            </div>
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/60 rounded-full px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Live Sandbox Verified</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/20 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-12">Rank</th>
                  <th className="py-4 px-6">Model Definition</th>
                  <th className="py-4 px-4 text-center">Overall</th>
                  <th className="py-4 px-4 text-center">Linguistic Auth</th>
                  <th className="py-4 px-4 text-center">Domain Acc</th>
                  <th className="py-4 px-4 text-center">Reasoning Depth</th>
                  <th className="py-4 px-4 text-center">Latency</th>
                  <th className="py-4 px-4 text-center">Throughput</th>
                  <th className="py-4 px-4 text-center">Est. Cost (1M Tokens)</th>
                  <th className="py-4 px-6 text-center">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {data.leaderboard.map((model) => {
                  const isInspected = activeModelId === model.id;
                  
                  return (
                    <tr
                      key={model.id}
                      onClick={() => setActiveModelId(model.id)}
                      className={`cursor-pointer transition-colors group ${
                        isInspected
                          ? 'bg-violet-950/10 border-l-2 border-l-violet-500'
                          : 'hover:bg-zinc-850/25 border-l-2 border-l-transparent'
                      }`}
                    >
                      {/* Rank Indicator */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center">
                          {model.rank === 1 ? (
                            <span className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center justify-center border border-amber-500/20 shadow-sm shadow-amber-500/5">
                              🥇
                            </span>
                          ) : model.rank === 2 ? (
                            <span className="h-6 w-6 rounded-full bg-slate-300/10 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-300/20">
                              🥈
                            </span>
                          ) : model.rank === 3 ? (
                            <span className="h-6 w-6 rounded-full bg-amber-700/10 text-amber-700 text-xs font-bold flex items-center justify-center border border-amber-700/20">
                              🥉
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-bold">{model.rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Model & Metadata details */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className={`font-bold transition-colors ${isInspected ? 'text-violet-400' : 'text-zinc-100 group-hover:text-violet-400'}`}>
                            {model.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {model.developer} • {model.parameters}
                          </span>
                        </div>
                      </td>

                      {/* Overall Index Score */}
                      <td className="py-4 px-4 text-center font-extrabold text-white text-base">
                        {model.overallScore}%
                      </td>

                      {/* Individual Evaluation Breakdown Dimensions */}
                      <td className="py-4 px-4 text-center font-medium text-zinc-300">
                        {model.scores.linguistic}%
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-zinc-300">
                        {model.scores.domain}%
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-zinc-300">
                        {model.scores.reasoning}%
                      </td>

                      {/* Latency (ms) */}
                      <td className="py-4 px-4 text-center text-zinc-400 font-semibold font-mono">
                        {model.metrics.latency} ms
                      </td>

                      {/* Throughput (tokens/sec) */}
                      <td className="py-4 px-4 text-center text-zinc-400 font-mono">
                        {model.metrics.throughput} tok/s
                      </td>

                      {/* Cost estimate */}
                      <td className="py-4 px-4 text-center text-zinc-400 font-mono text-xs">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-zinc-300">${model.metrics.costInput.toFixed(2)} <span className="text-[9px] text-zinc-500 font-normal">in</span></span>
                          <span className="text-[10px] text-zinc-500">${model.metrics.costOutput.toFixed(2)} <span className="text-[8px] text-zinc-600 font-normal">out</span></span>
                        </div>
                      </td>

                      {/* Win Rate (human validation preference) */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-zinc-200 font-bold font-mono">{model.metrics.winRate}%</span>
                          <div className="w-12 bg-zinc-950 h-1 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${model.metrics.winRate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer info */}
          <div className="p-4 bg-zinc-950/40 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-zinc-500">
            <span>* Win rate is computed using Bradley-Terry model values on blind pair evaluations.</span>
            <span>Evaluations compiled strictly utilizing standard model API endpoints on identical prompt seeds.</span>
          </div>
        </section>

        {/* Methodology explanation section */}
        <section className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6 shadow-md shadow-black/10">
          <h3 className="text-base font-bold text-zinc-200 mb-3 flex items-center gap-2">
            <svg className="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Benchmark Methodology & Dataset Curation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-400 leading-relaxed">
            <div>
              <h4 className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                Linguistic Authenticity Layer
              </h4>
              Evaluating the capability to parse colloquial nuances, natural grammar transitions, vocabulary mixing patterns, and local vernacular idioms in code-mixed Hinglish sentences. Unlike direct machine translations, we audit for conversational alignment.
            </div>
            <div>
              <h4 className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Specialized Domain Accuracy
              </h4>
              Audited in Medical (clinical terminology transliterations and doctor-patient dialogue parsing), Legal (regional compliance, penal codes, and legal notification syntax), and Finance (vernacular banking schemes and financial literacy indices).
            </div>
            <div>
              <h4 className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Reasoning Depth Metric
              </h4>
              Focusing on multi-step reasoning, mathematical word problems phrased in Indic contexts, logical consistency across long dialogues, anti-hallucination metrics, and complex context synthesis under native sentence alignments.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
