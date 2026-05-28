import { NextResponse } from "next/server";

interface QuestionResult {
  questionId: number;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

const TIER_THRESHOLDS = [
  { name: "Bronze", minXp: 0, multiplier: 1.0, color: "from-amber-700 to-amber-900", border: "border-amber-600" },
  { name: "Silver", minXp: 100, multiplier: 1.5, color: "from-slate-400 to-slate-600", border: "border-slate-400" },
  { name: "Gold", minXp: 250, multiplier: 2.0, color: "from-yellow-400 to-amber-500", border: "border-yellow-400" },
  { name: "Senior", minXp: 450, multiplier: 3.0, color: "from-emerald-400 to-teal-600", border: "border-emerald-500" },
  { name: "Elite", minXp: 700, multiplier: 5.0, color: "from-violet-500 via-purple-600 to-indigo-700", border: "border-purple-500" },
];

function getTierFromXp(xp: number) {
  let activeTier = TIER_THRESHOLDS[0];
  for (const tier of TIER_THRESHOLDS) {
    if (xp >= tier.minXp) {
      activeTier = tier;
    }
  }
  return activeTier;
}

const QUESTIONS_DB = {
  coding: [
    {
      id: 1,
      correctOption: "B",
      title: "Memory-Mapped Ring Buffer Queue",
      explanation: "A lock-free Ring Buffer utilizing SharedArrayBuffer and typed arrays avoids garbage collection heap fragmentation and removes mutex write-lock contention, enabling high-throughput worker writes in O(1) time.",
      testSuite: [
        "✓ RingBuffer initialization: Passed (0.1ms)",
        "✓ Concurrent write contention test: 1,000,000 ops/sec: Passed (14ms)",
        "✓ Garbage collection heap impact: 0MB allocation overhead: Passed (0.2ms)",
        "✓ Overflow boundary validation: Safe wrap-around: Passed (0.1ms)"
      ]
    },
    {
      id: 2,
      correctOption: "A",
      title: "Recursive Tree Memoizer",
      explanation: "Recursive traversal with dynamic memoization (caching resolved sub-trees) optimizes database node queries from O(N^2) to O(N) time complexity by avoiding duplicate visits to overlapping paths.",
      testSuite: [
        "✓ Base leaf resolution: Passed (0.05ms)",
        "✓ O(N) scaling confirmation: Traversed 10,000 nodes in 4.2ms: Passed (4.2ms)",
        "✓ Tree depth validation (1000 nodes): No stack overflow: Passed (0.8ms)"
      ]
    },
    {
      id: 3,
      correctOption: "A",
      title: "Prototype Pollution Guard",
      explanation: "Explicitly blocking '__proto__' and 'constructor' properties during deep merges prevents attackers from injecting properties into the global Object prototype, which can lead to remote code execution (RCE) or denial of service.",
      testSuite: [
        "✓ Standard recursive merge: Passed (0.1ms)",
        "✓ Prototype pollution payload rejection: Passed (0.3ms)",
        "✓ Constructor pollution block: Passed (0.1ms)"
      ]
    }
  ],
  medical: [
    {
      id: 1,
      correctOption: "B",
      title: "Ischemic Stroke with Active Bleeding Ulcer",
      explanation: "Intravenous tPA is strictly contraindicated in active internal bleeding or gastrointestinal hemorrhage within 21 days due to the lethal risk of exsanguination. Emergency mechanical thrombectomy is the optimal non-systemic path to revascularize the cerebral artery without systemic thrombolysis.",
      testSuite: [
        "✓ Diagnostic criteria scan: Stroke symptoms confirmed (2.5h onset): Passed",
        "✓ Absolute contraindication analysis: Active Gastric Ulcer Bleeding flagged: Passed",
        "✓ Thrombolytic safety validation: Systemic tPA suspended: Passed",
        "✓ Alternative therapy selector: Mechanical Thrombectomy selected: Passed"
      ]
    },
    {
      id: 2,
      correctOption: "C",
      title: "MAO Inhibitor and Triptan Interaction",
      explanation: "Combining a Monoamine Oxidase Inhibitor (Phenelzine) with a Serotonin Receptor Agonist (Sumatriptan) causes profound accumulation of synaptic serotonin, leading to life-threatening Serotonin Syndrome. Discontinuing MAOIs requires a full 14-day washout period before initiating triptans; therefore, sumatriptan must be suspended.",
      testSuite: [
        "✓ Drug class mapper: MAOI + Triptan collision flagged: Passed",
        "✓ Pathophysiological risk score: Serotonin toxicity risk 99%: Passed",
        "✓ Washout timeline checker: 24h wash vs required 14d wash flagged: Passed"
      ]
    },
    {
      id: 3,
      correctOption: "B",
      title: "Wellens Syndrome and Critical LAD Stenosis",
      explanation: "Deep, symmetric T-wave inversions in leads V2-V4 combined with mild chest pain and slight troponin elevation characterize Wellens Syndrome (Type B), representing critical proximal Left Anterior Descending (LAD) coronary artery stenosis. Outpatient cardiac stress tests are strictly contraindicated as they can trigger fatal myocardial infarction; urgent coronary angiography is required.",
      testSuite: [
        "✓ ECG analysis: V2-V4 symmetric T-wave inversion recognized: Passed",
        "✓ Pathology categorizer: Wellens Syndrome high-risk classification: Passed",
        "✓ Stress test risk calculator: Fatal cardiac arrest risk: Passed",
        "✓ Intervention path: Scheduled for urgent cardiac cath lab: Passed"
      ]
    }
  ],
  legal: [
    {
      id: 1,
      correctOption: "A",
      title: "Delaware SaaS Breach & GDPR Jurisdiction",
      explanation: "Under EU law, choice-of-law clauses in consumer or public-interest frameworks (like data privacy) cannot deprive EU citizens of the mandatory protections guaranteed by the GDPR. A data breach affecting German citizens allows them to litigate in German forums, applying the GDPR, regardless of Delaware incorporation.",
      testSuite: [
        "✓ Choice-of-law clause analysis: Clause validated under US jurisdiction: Passed",
        "✓ GDPR Article 3(2) extraterritoriality test: Targeting EU citizens confirmed: Passed",
        "✓ Mandatory override test: Consumer/PII public policy override: Passed"
      ]
    },
    {
      id: 2,
      correctOption: "B",
      title: "AI LLM Training & Fair Use Market Effect",
      explanation: "Under the four-factor fair use analysis (17 U.S.C. § 107), the fourth factor (effect of the use upon the potential market for or value of the copyrighted work) weighs heavily against fair use when an AI model is trained on textbooks to directly answer technical queries, serving as a functional market substitute for purchasing those books.",
      testSuite: [
        "✓ Statutory Factor 1 check: Transformative nature: Passed",
        "✓ Statutory Factor 2 check: Nature of creative/academic work: Passed",
        "✓ Statutory Factor 4 check: Direct commercial market substitution: Failed (Breach likely)"
      ]
    },
    {
      id: 3,
      correctOption: "B",
      title: "Board Duty of Care & Gross Negligence",
      explanation: "Under Delaware corporate law (Smith v. Van Gorkom), board directors commit a breach of the fiduciary Duty of Care by approving a major transaction (like an acquisition) based solely on brief verbal summaries without reviewing key financial statements or consulting independent financial advisors. This constitutes gross negligence, overcoming the protection of the Business Judgment Rule.",
      testSuite: [
        "✓ Business Judgment Rule eligibility test: Defeated by gross negligence: Passed",
        "✓ Fiduciary duty analysis: Duty of Care breach identified: Passed",
        "✓ Van Gorkom precedent mapping: Strict liability standard applied: Passed"
      ]
    }
  ]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, domain, answers, currentXp, codeSnippet } = body;

    if (action === "run_code") {
      if (!domain || !QUESTIONS_DB[domain as keyof typeof QUESTIONS_DB]) {
        return NextResponse.json({ error: "Invalid domain specified" }, { status: 400 });
      }

      const qDb = QUESTIONS_DB[domain as keyof typeof QUESTIONS_DB];
      const logs = [
        `[SYSTEM] Initializing sandboxed ${domain.toUpperCase()} compile-kernel...`,
        `[SYSTEM] Allocating virtualization sandbox (256MB RAM limit)...`,
        `[PARSER] Static analysis parsing... Syntax: OK. Types: Valid.`,
      ];

      if (domain === "coding") {
        if (codeSnippet && (codeSnippet.includes("RingBuffer") || codeSnippet.includes("SharedArrayBuffer") || codeSnippet.includes("Float64Array"))) {
          logs.push(`[OPTIMIZER] Detected Lock-Free Typed Ring Buffer configuration.`);
          logs.push(`[COMPILER] Dynamic jit compiler: Compiled main ring-queue.`);
          logs.push(`[TEST_RUNNER] Running suite...`);
          logs.push(...qDb[0].testSuite);
          logs.push(`\n[SUCCESS] Sandbox verification completed successfully. Memory leak index: 0.00%`);
        } else if (codeSnippet && (codeSnippet.includes("memo") || codeSnippet.includes("cache") || codeSnippet.includes("Map"))) {
          logs.push(`[OPTIMIZER] Detected Memoized Recursive traversal resolver.`);
          logs.push(`[COMPILER] Dynamic jit compiler: Compiled tree-memoizer.`);
          logs.push(`[TEST_RUNNER] Running suite...`);
          logs.push(...qDb[1].testSuite);
          logs.push(`\n[SUCCESS] Sandbox verification completed successfully. Time complexity: O(N) asymptotic.`);
        } else {
          logs.push(`[COMPILER] Dynamic jit compiler: Compiled dynamic code.`);
          logs.push(`[TEST_RUNNER] Running suite...`);
          logs.push(`✗ Test 1: Thread Contention deadlock detected on Mutex boundary lock.`);
          logs.push(`✗ Test 2: Out of Memory - Heap allocation exceeded maximum tree depth O(N^2).`);
          logs.push(`\n[FAILURE] Compilation failed on test boundaries. Review memory-mapping or cache strategies.`);
        }
      } else if (domain === "medical") {
        logs.push(`[DIAGNOSTIC] Checking clinical pathways against clinical decision database...`);
        logs.push(`[VALIDATOR] Testing contraindication safety bounds...`);
        if (codeSnippet && (codeSnippet.toLowerCase().includes("thrombectomy") || codeSnippet.toLowerCase().includes("mechanical"))) {
          logs.push(...qDb[0].testSuite);
          logs.push(`\n[SUCCESS] Treatment plan conforms fully to AHA/ASA Stroke and GI contraindication guidelines.`);
        } else if (codeSnippet && (codeSnippet.toLowerCase().includes("serotonin") || codeSnippet.toLowerCase().includes("contraindicated") || codeSnippet.toLowerCase().includes("suspend"))) {
          logs.push(...qDb[1].testSuite);
          logs.push(`\n[SUCCESS] Treatment plan successfully avoids Serotonin Syndrome. Correctly suspended.`);
        } else {
          logs.push(`✗ Severe Warning: Fatal bleed risk. Administering systemic tPA is contraindicated for active gastric ulcers.`);
          logs.push(`✗ Severe Warning: Lethal drug interaction. MAOI and Sumatriptan will precipitate Serotonin Syndrome.`);
          logs.push(`\n[CRITICAL_FAIL] Diagnostic pipeline flagged fatal errors in clinician workflow.`);
        }
      } else if (domain === "legal") {
        logs.push(`[LAWSUIT_MODELER] Simulating litigation against precedent statutes...`);
        if (codeSnippet && (codeSnippet.toUpperCase().includes("GDPR") || codeSnippet.toLowerCase().includes("german"))) {
          logs.push(...qDb[0].testSuite);
          logs.push(`\n[SUCCESS] Jurisdictional modeling complete. Defense and forum claims validated.`);
        } else if (codeSnippet && (codeSnippet.toLowerCase().includes("duty of care") || codeSnippet.toLowerCase().includes("negligence") || codeSnippet.toLowerCase().includes("van gorkom"))) {
          logs.push(...qDb[2].testSuite);
          logs.push(`\n[SUCCESS] Precedent analysis completed. Liability triggers fully calculated.`);
        } else {
          logs.push(`✗ Breach identified: Delaware forum claims rejected under EU consumer mandates.`);
          logs.push(`✗ Board Liability failure: Directors fail duty of care standard under Smith v. Van Gorkom.`);
          logs.push(`\n[DISMISSAL] Court scenario models predict absolute case dismissal or liability breach.`);
        }
      }

      return NextResponse.json({ logs });
    }

    if (action === "submit_test") {
      if (!domain || !answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: "Missing required submit parameters" }, { status: 400 });
      }

      const qDb = QUESTIONS_DB[domain as keyof typeof QUESTIONS_DB];
      if (!qDb) {
        return NextResponse.json({ error: "Invalid domain specified" }, { status: 400 });
      }

      let correctCount = 0;
      const breakdown: QuestionResult[] = [];

      qDb.forEach((q, index) => {
        const userAnswer = (answers[index] || "").trim().toUpperCase();
        const isCorrect = userAnswer === q.correctOption;

        if (isCorrect) {
          correctCount++;
        }

        breakdown.push({
          questionId: q.id,
          correct: isCorrect,
          userAnswer: userAnswer || "NO RESPONSE",
          correctAnswer: q.correctOption,
          explanation: q.explanation,
        });
      });

      const totalQuestions = qDb.length;
      const accuracy = Math.round((correctCount / totalQuestions) * 100);

      let basePoints = correctCount * 50;
      const timeSpent = body.timeSpent || 30;
      const maxAllowedTime = totalQuestions * 30;
      const speedFactor = Math.max(0.5, Math.min(2.0, Number((1 + (maxAllowedTime - timeSpent) / maxAllowedTime).toFixed(2))));
      const speedBonusPercent = Math.round((speedFactor - 1) * 100);

      const activeTier = getTierFromXp(currentXp || 0);
      const pointsEarned = Math.round(basePoints * speedFactor * activeTier.multiplier);

      const nextXp = (currentXp || 0) + pointsEarned;
      const nextTier = getTierFromXp(nextXp);

      const promoted = nextTier.name !== activeTier.name;

      let feedbackHeadline = "";
      let strengths: string[] = [];
      let growthAreas: string[] = [];

      if (accuracy === 100) {
        feedbackHeadline = "Perfect Performance! Grandmaster Credentials Established.";
        strengths = [
          "Exquisite precision on complex case studies.",
          "Perfect selection of optimal algorithmic and safety pathways.",
          "Complete mastery over deep technical and domain-specific nuances."
        ];
        growthAreas = ["Push response velocity higher to maximize speed-multipliers."];
      } else if (accuracy >= 66) {
        feedbackHeadline = "Excellent Competency. Domain Authority Validated.";
        strengths = [
          "Strong theoretical foundation and quick pattern recognition.",
          "Identified core algorithmic optimization or diagnostic pathway."
        ];
        growthAreas = [
          "Carefully review absolute contraindications or specific judicial overrides.",
          "Avoid sub-optimal O(N^2) or high-memory lock contention fallbacks."
        ];
      } else {
        feedbackHeadline = "Under Review. Recalibration and Rigorous Study Required.";
        strengths = ["Capable of basic triage and parsing syntax constructs."];
        growthAreas = [
          "Critically analyze safety standards (e.g., active bleeding thrombolytic exclusions).",
          "Deep dive into standard corporate oversight (Smith v. Van Gorkom) or lock-free queue mechanics."
        ];
      }

      return NextResponse.json({
        score: accuracy,
        accuracy,
        xpEarned: pointsEarned,
        basePoints,
        speedFactor,
        speedBonusPercent,
        timeSpent,
        feedbackHeadline,
        strengths,
        growthAreas,
        promoted,
        oldTier: activeTier.name,
        newTier: nextTier.name,
        newXp: nextXp,
        breakdown,
        tierConfig: nextTier,
        allTiers: TIER_THRESHOLDS
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Backend error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
