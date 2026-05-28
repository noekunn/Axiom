import { NextResponse } from 'next/server';

export interface ModelScore {
  rank: number;
  id: string;
  name: string;
  developer: string;
  parameters: string;
  type: 'Closed' | 'Open';
  overallScore: number;
  scores: {
    linguistic: number;
    domain: number;
    reasoning: number;
  };
  metrics: {
    latency: number; // ms
    throughput: number; // tok/sec
    costInput: number; // per 1M tokens
    costOutput: number; // per 1M tokens
    winRate: number; // percent
    contextUsed: number; // kb or tokens
  };
}

interface BaseProfile {
  id: string;
  name: string;
  developer: string;
  parameters: string;
  type: 'Closed' | 'Open';
  baseScores: {
    linguistic: number;
    domain: number;
    reasoning: number;
  };
  adjustments: {
    domains: Record<string, { linguistic?: number; domain?: number; reasoning?: number }>;
    languages: Record<string, { linguistic?: number; domain?: number; reasoning?: number }>;
  };
  metrics: {
    latency: number;
    throughput: number;
    costInput: number;
    costOutput: number;
    winRate: number;
    contextUsed: number;
  };
}

const MODEL_PROFILES: BaseProfile[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    developer: 'Anthropic',
    parameters: 'Proprietary',
    type: 'Closed',
    baseScores: {
      linguistic: 89.2,
      domain: 91.5,
      reasoning: 93.4,
    },
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
    metrics: {
      latency: 410,
      throughput: 78,
      costInput: 3.0,
      costOutput: 15.0,
      winRate: 85.4,
      contextUsed: 8192,
    },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    developer: 'OpenAI',
    parameters: 'Proprietary',
    type: 'Closed',
    baseScores: {
      linguistic: 88.5,
      domain: 90.2,
      reasoning: 91.1,
    },
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
    metrics: {
      latency: 290,
      throughput: 92,
      costInput: 2.5,
      costOutput: 10.0,
      winRate: 81.2,
      contextUsed: 8192,
    },
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    developer: 'Google',
    parameters: 'Proprietary',
    type: 'Closed',
    baseScores: {
      linguistic: 85.8,
      domain: 86.5,
      reasoning: 87.2,
    },
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
    metrics: {
      latency: 380,
      throughput: 84,
      costInput: 1.25,
      costOutput: 5.0,
      winRate: 75.8,
      contextUsed: 16384,
    },
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 (70B)',
    developer: 'Meta',
    parameters: '70B',
    type: 'Open',
    baseScores: {
      linguistic: 82.1,
      domain: 83.4,
      reasoning: 82.8,
    },
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
    metrics: {
      latency: 190,
      throughput: 115,
      costInput: 0.35,
      costOutput: 0.40,
      winRate: 60.1,
      contextUsed: 8192,
    },
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    developer: 'Mistral AI',
    parameters: '123B',
    type: 'Open',
    baseScores: {
      linguistic: 83.2,
      domain: 84.8,
      reasoning: 84.5,
    },
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
    metrics: {
      latency: 260,
      throughput: 68,
      costInput: 2.0,
      costOutput: 6.0,
      winRate: 64.8,
      contextUsed: 8192,
    },
  },
];

const getDatasetStats = (domain: string, language: string) => {
  let baseCases = 36500;
  let languageCount = baseCases;
  if (language !== 'all') {
    switch (language) {
      case 'hinglish':
        languageCount = 12500;
        break;
      case 'hindi':
        languageCount = 6000;
        break;
      case 'tamil':
        languageCount = 4500;
        break;
      case 'telugu':
        languageCount = 4500;
        break;
      case 'bengali':
        languageCount = 4500;
        break;
      case 'marathi':
        languageCount = 4500;
        break;
    }
  }

  let finalCount = languageCount;
  if (domain !== 'all') {
    switch (domain) {
      case 'medical':
        finalCount = Math.round(languageCount * 0.35);
        break;
      case 'legal':
        finalCount = Math.round(languageCount * 0.30);
        break;
      case 'finance':
        finalCount = Math.round(languageCount * 0.35);
        break;
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || 'all';
  const language = searchParams.get('language') || 'all';

  const rankedModels: ModelScore[] = MODEL_PROFILES.map((profile) => {
    let linguistic = profile.baseScores.linguistic;
    let domainScore = profile.baseScores.domain;
    let reasoning = profile.baseScores.reasoning;

    if (domain !== 'all') {
      const domainAdj = profile.adjustments.domains[domain];
      if (domainAdj) {
        if (domainAdj.linguistic) linguistic += domainAdj.linguistic;
        if (domainAdj.domain) domainScore += domainAdj.domain;
        if (domainAdj.reasoning) reasoning += domainAdj.reasoning;
      }
    }

    if (language !== 'all') {
      const langAdj = profile.adjustments.languages[language];
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

    const latencyMultiplier = domain === 'legal' ? 1.15 : domain === 'medical' ? 1.05 : 1.0;
    const languageLatencyMultiplier = language === 'tamil' || language === 'telugu' ? 1.2 : 1.0;
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
      scores: {
        linguistic,
        domain: domainScore,
        reasoning,
      },
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

  rankedModels.forEach((model, index) => {
    model.rank = index + 1;
  });

  const datasetStats = getDatasetStats(domain, language);

  return NextResponse.json({
    filter: {
      domain,
      language,
    },
    stats: datasetStats,
    leaderboard: rankedModels,
  });
}
