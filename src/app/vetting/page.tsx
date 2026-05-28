"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";


// Types
interface Question {
  id: number;
  scenario: string;
  codeBlock?: string;
  questionText: string;
  options: { label: string; text: string; code?: string }[];
  defaultCode?: string;
  placeholder?: string;
  patientRecord?: {
    age: number;
    gender: string;
    onset: string;
    vitals: string;
    labs: string;
    history: string;
  };
  caseRecord?: {
    parties: string;
    jurisdiction: string;
    breach: string;
    governingLaw: string;
    precedents: string;
  };
}

interface QuestionResult {
  questionId: number;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface GradeReport {
  score: number;
  accuracy: number;
  xpEarned: number;
  basePoints: number;
  speedFactor: number;
  speedBonusPercent: number;
  timeSpent: number;
  feedbackHeadline: string;
  strengths: string[];
  growthAreas: string[];
  promoted: boolean;
  oldTier: string;
  newTier: string;
  newXp: number;
  breakdown: QuestionResult[];
  tierConfig: {
    name: string;
    multiplier: number;
    color: string;
    border: string;
  };
  allTiers: { name: string; minXp: number; multiplier: number; color: string }[];
}

// Domain Questions Definition
const QUESTIONS: Record<string, Question[]> = {
  coding: [
    {
      id: 1,
      scenario: "A high-frequency web service reports massive GC pauses and lock timeouts under heavy write load (1,000,000 requests/sec). Profiling logs indicate mutex contention on the message queue and rapid memory allocations fragmenting the v8 engine heap. Optimize the buffer write strategy.",
      defaultCode: `// OPTIMIZE MESSAGE QUEUE TO AVOID GC AND LOCKS\nexport class TelemetryQueue<T> {\n  private buffer: Array<T> = [];\n  private mutex = new MutexLock();\n\n  async enqueue(item: T) {\n    await this.mutex.lock();\n    this.buffer.push(item);\n    this.mutex.unlock();\n  }\n}`,
      placeholder: "// Type your lock-free ring buffer design utilizing SharedArrayBuffer...",
      questionText: "Which architecture resolves lock contention and garbage collection pauses under 1M ops/sec?",
      options: [
        { label: "A", text: "Wrap queue operations with async semaphores and run GC manually inside task loops." },
        { label: "B", text: "Implement a lock-free Ring Buffer queue backed by a SharedArrayBuffer and typed float arrays.", code: `export class RingBufferQueue {\n  private sab = new SharedArrayBuffer(1024);\n  private head = new Int32Array(this.sab, 0, 1);\n  // ...\n}` },
        { label: "C", text: "Delegate writes to high-priority async generator queues running in recursive worker pools." }
      ]
    },
    {
      id: 2,
      scenario: "A deep database hierarchy maps organizational relationships. A recursive node resolver runs at O(N^2) because overlap paths are traversed multiple times. Optimize the lookup velocity to achieve strict linear performance.",
      defaultCode: `// OPTIMIZE TREE RESOLVER SPEED\nexport function resolveSubtree(nodeId: string): TreeNode[] {\n  const node = fetchDbNode(nodeId);\n  const children = node.childIds.flatMap(id => resolveSubtree(id));\n  return [node, ...children];\n}`,
      placeholder: "// Add caching structures to eliminate overlapping sub-tree lookups...",
      questionText: "Select the strategy that guarantees strict O(N) linear time complexity for heavy overlap nodes:",
      options: [
        { label: "A", text: "Implement deep memoization using an active lookup Map cache to resolve nodes uniquely.", code: `const cache = new Map<string, TreeNode[]>();\nif (cache.has(id)) return cache.get(id);` },
        { label: "B", text: "Convert recursion to BFS using an array-based stack and run secondary filtering.", code: `const queue = [rootId];\nwhile(queue.length) { ... }` },
        { label: "C", text: "Execute stored DB joins on every recursive child frame using connection pooling." }
      ]
    },
    {
      id: 3,
      scenario: "A generic object merging utility merges configuration templates. A lint check flags security vulnerabilities permitting attackers to modify the global object prototype (Prototype Pollution). Harden the object recursive merge algorithm.",
      defaultCode: `// HARDEN SECURE DEEP MERGE\nexport function deepMerge(target: any, source: any) {\n  for (const key in source) {\n    if (typeof source[key] === 'object') {\n      deepMerge(target[key], source[key]);\n    } else {\n      target[key] = source[key];\n    }\n  }\n}`,
      placeholder: "// Add prototype defense filters to target keys...",
      questionText: "What validation filter prevents proto pollution and deep prototype injections?",
      options: [
        { label: "A", text: "Reject keys containing '__proto__' or 'constructor' prototypes explicitly.", code: `if (key === '__proto__' || key === 'constructor') continue;` },
        { label: "B", text: "Use Object.assign({}, source) and clone recursively without checking nested descriptors." },
        { label: "C", text: "Force freeze target configurations using Object.freeze() at the entry layer." }
      ]
    }
  ],
  medical: [
    {
      id: 1,
      scenario: "A patient presents with sudden severe stroke symptoms. Thrombolysis is evaluated, but critical indicators restrict common therapies. Select the optimal course to prevent severe complications.",
      patientRecord: {
        age: 68,
        gender: "Male",
        onset: "2.5 hours ago - left unilateral hemiparesis & aphasia",
        vitals: "BP 168/94 mmHg, HR 88 bpm, SpO2 96% on room air",
        labs: "Creatinine 2.8 mg/dL (CKD Stage 4), Platelets 130k",
        history: "Active peptic gastric ulcer bleeding (hospitalized 10 days ago)"
      },
      questionText: "Analyze clinical records and determine the safest intervention path:",
      options: [
        { label: "A", text: "Administer Intravenous tPA (Alteplase) immediately. The patient is within the 3-hour golden window." },
        { label: "B", text: "Arrange immediate emergency Mechanical Thrombectomy. Avoid systemic tPA due to active bleeding risk." },
        { label: "C", text: "Initiate therapeutic Heparin infusion combined with 325mg Aspirin to dissolve the clot." }
      ]
    },
    {
      id: 2,
      scenario: "A patient diagnosed with major clinical depression is currently on complex drug regimens. She seeks help for severe acute migraine relief. Inspect active medications for fatal drug-drug interactions.",
      patientRecord: {
        age: 45,
        gender: "Female",
        onset: "Acute severe hemicranial headache with visual aura",
        vitals: "BP 130/80 mmHg, HR 72 bpm",
        labs: "Normal metabolic and cellular panels",
        history: "Currently taking Phenelzine (MAO Inhibitor) for treatment-resistant depression"
      },
      questionText: "Identify the safest diagnostic course and prevent severe neurovascular toxicity:",
      options: [
        { label: "A", text: "Administer 6mg subcutaneous Sumatriptan immediately for rapid migraine resolution." },
        { label: "B", text: "Instruct the patient to stop Phenelzine for 24 hours, then administer oral Sumatriptan safely." },
        { label: "C", text: "Suspend Sumatriptan prescription. Contraindicated due to fatal Serotonin Syndrome risk under MAOIs." }
      ]
    },
    {
      id: 3,
      scenario: "An electrocardiogram displays atypical waveforms. A patient reports intermittent chest pressure. The troponin score is slightly elevated. Formulate the coronary management plan.",
      patientRecord: {
        age: 58,
        gender: "Male",
        onset: "Intermittent retrosternal squeezing chest pain for 3 days",
        vitals: "BP 142/88 mmHg, HR 78 bpm",
        labs: "Cardiac Troponin T: 0.04 ng/mL (slightly elevated)",
        history: "ECG shows deep, symmetrical T-wave inversions in chest leads V2, V3, and V4"
      },
      questionText: "Identify the ECG syndrome and select the safest clinical workflow:",
      options: [
        { label: "A", text: "Refer the patient for an immediate outpatient exercise nuclear stress test to assess ischemia." },
        { label: "B", text: "Diagnose Wellens Syndrome and admit for urgent coronary angiography. Avoid cardiac stress tests." },
        { label: "C", text: "Discharge the patient with elevated Beta-blocker dosages and schedule a 2-week outpatient follow-up." }
      ]
    }
  ],
  legal: [
    {
      id: 1,
      scenario: "A Delaware corporation with server databases in Oregon breaches data. The service contract states Delaware law governs. European consumers sue for PII exposure. Evaluate jurisdictional standing.",
      caseRecord: {
        parties: "German Consumer Group (Plaintiff) vs. Delaware Cloud SaaS Corp (Defendant)",
        jurisdiction: "PII leakage affecting 10,000+ German citizens",
        breach: "SQL Injection exposed user email, decrypted passwords, and financial logs",
        governingLaw: "Delaware State Law, choice-of-law clause validated",
        precedents: "GDPR Article 3(2) extraterritorial applicability"
      },
      questionText: "Determine where the suit can proceed and which regulatory framework overrides contract parameters:",
      options: [
        { label: "A", text: "German courts have jurisdiction; GDPR mandates override Delaware choice-of-law for consumer privacy rights." },
        { label: "B", text: "Delaware Federal Court has exclusive jurisdiction. Choice-of-law and corporate location clauses are absolute." },
        { label: "C", text: "Oregon District Court, since the physical data servers and database structures are situated there." }
      ]
    },
    {
      id: 2,
      scenario: "An AI company feeds academic manuals into model matrices without licensing. They assert Fair Use, claiming the network produces completely transformative weights. Legal counsels evaluate copyright liability.",
      caseRecord: {
        parties: "Academic Publishers (Plaintiff) vs. NeuralNet LLM Inc (Defendant)",
        jurisdiction: "United States District Court, Southern District of NY",
        breach: "Ingested 50,000 proprietary textbooks to train deep expert model nodes",
        governingLaw: "17 U.S.C. § 107 (US Copyright Act - Fair Use Factors)",
        precedents: "Andy Warhol Foundation v. Goldsmith / Authors Guild v. Google"
      },
      questionText: "Evaluate the Fair Use defense against potential infringement liabilities:",
      options: [
        { label: "A", text: "Protected under absolute Fair Use since training weights represent algorithmic numbers, not copyright text." },
        { label: "B", text: "Infringement is likely. Under the 4th factor, the model serves as a direct commercial substitute for the textbooks." },
        { label: "C", text: "Training constitutes fair use exclusively under patent guidelines rather than copyright frameworks." }
      ]
    },
    {
      id: 3,
      scenario: "Company directors accept an acquisition offer based solely on an informal CEO speech without analyzing balance sheets. The target company collapses within weeks. Shareholders sue the board.",
      caseRecord: {
        parties: "Vanguard Shareholders (Plaintiff) vs. TechCorp Directors (Defendant)",
        jurisdiction: "Delaware Court of Chancery",
        breach: "Approved $80M acquisition in a 20-minute meeting with no audited statements",
        governingLaw: "Delaware Corporate Law - Fiduciary Duties",
        precedents: "Smith v. Van Gorkom, 488 A.2d 858 (Del. 1985)"
      },
      questionText: "Evaluate board liability under corporate governance doctrines:",
      options: [
        { label: "A", text: "Directors are shielded. The Business Judgment Rule protects all board business decisions from liability." },
        { label: "B", text: "Directors breached their Duty of Care; gross negligence overrides the Business Judgment Rule protections." },
        { label: "C", text: "Liability is dismissed; directors are protected under Duty of Loyalty since they did not profit personally." }
      ]
    }
  ]
};

const TIERS = [
  { name: "Bronze", minXp: 0, multiplier: 1.0, color: "from-amber-600 to-amber-950", text: "text-amber-500", glow: "shadow-amber-500/20" },
  { name: "Silver", minXp: 100, multiplier: 1.5, color: "from-slate-400 to-slate-800", text: "text-slate-300", glow: "shadow-slate-500/20" },
  { name: "Gold", minXp: 250, multiplier: 2.0, color: "from-yellow-400 to-yellow-900", text: "text-yellow-400", glow: "shadow-yellow-400/20" },
  { name: "Senior", minXp: 450, multiplier: 3.0, color: "from-emerald-400 to-emerald-950", text: "text-emerald-400", glow: "shadow-emerald-400/20" },
  { name: "Elite", minXp: 700, multiplier: 5.0, color: "from-violet-500 via-purple-700 to-indigo-950", text: "text-purple-400", glow: "shadow-purple-500/30" },
];

export default function VettingArena() {
  // Navigation / Phase States
  // 'lobby' | 'testing' | 'results'
  const [phase, setPhase] = useState<"lobby" | "testing" | "results">("lobby");
  const [selectedDomain, setSelectedDomain] = useState<"coding" | "medical" | "legal" | null>(null);

  // Player State
  const [xp, setXp] = useState(0);
  const [tier, setTier] = useState(TIERS[0]);

  // Test Runner State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [codeSnippets, setCodeSnippets] = useState<string[]>(["", "", ""]);
  const [activeCodeText, setActiveCodeText] = useState("");
  
  // Timer (30s per question = 90s total)
  const [timeLeft, setTimeLeft] = useState(30.0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  
  // Terminal logs simulation
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Grading Result State
  const [gradeReport, setGradeReport] = useState<GradeReport | null>(null);

  // Level Up Promotion Overlay
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [promotedTo, setPromotedTo] = useState("");
  const [unlockedMultiplier, setUnlockedMultiplier] = useState(1.0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  // Load XP from localStorage on mount
  useEffect(() => {
    const savedXp = localStorage.getItem("axiom_vetting_xp");
    if (savedXp) {
      const parsedXp = parseInt(savedXp, 10);
      setXp(parsedXp);
      updateTierForXp(parsedXp);
    }
  }, []);

  const updateTierForXp = (currentXp: number) => {
    let resolved = TIERS[0];
    for (const t of TIERS) {
      if (currentXp >= t.minXp) {
        resolved = t;
      }
    }
    setTier(resolved);
  };

  // Play Epic Synthesizer Level Up Sound using Web Audio API
  const playLevelUpSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      // 1. Epic synth laser sweep
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(120, now);
      osc1.frequency.exponentialRampToValueAtTime(520, now + 0.2);
      osc1.frequency.exponentialRampToValueAtTime(1040, now + 0.6);

      osc2.frequency.setValueAtTime(240, now);
      osc2.frequency.exponentialRampToValueAtTime(780, now + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(1560, now + 0.6);

      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);

      // 2. Bright ascending major chord chime
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale arpeggio
      notes.forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        
        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(freq, now + 0.2 + idx * 0.08);
        
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.15, now + 0.2 + idx * 0.08);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.08);
        
        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        
        chimeOsc.start(now);
        chimeOsc.stop(now + 1.5);
      });

      // 3. Sub boom base impact
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.8);

    } catch (e) {
      console.warn("Audio Context blocked by browser autoplay settings.", e);
    }
  };

  // Spark Particle Explosion Canvas Physics
  useEffect(() => {
    if (!showLevelUp || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle Interface
    class Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      alpha: number;
      decay: number;
      gravity: number;

      constructor() {
        this.x = width / 2;
        this.y = height / 2 - 50;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 2; // slight upward velocity
        this.size = Math.random() * 4 + 2;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.015 + 0.01;
        this.gravity = 0.15;

        // Custom cyber-neon palette matches GOLD / ELITE
        const colors = [
          "#facc15", // yellow-400
          "#eab308", // yellow-500
          "#a78bfa", // purple-400
          "#818cf8", // indigo-400
          "#34d399", // emerald-400
          "#ec4899", // pink-500
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98; // air resistance
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.shadowBlur = 10;
        c.shadowColor = this.color;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    let sparks: Spark[] = Array.from({ length: 150 }, () => new Spark());

    // Loop
    const render = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Filter and redraw
      sparks = sparks.filter((s) => s.alpha > 0);
      sparks.forEach((s) => {
        s.update();
        s.draw(ctx);
      });

      // Periodically spawn slow falling random ambient particles
      if (Math.random() < 0.15 && sparks.length < 200) {
        const s = new Spark();
        s.x = Math.random() * width;
        s.y = -10;
        s.vy = Math.random() * 2 + 1;
        s.vx = Math.random() * 2 - 1;
        sparks.push(s);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [showLevelUp]);

  // Handle Question Change
  useEffect(() => {
    if (phase !== "testing" || !selectedDomain) return;

    // Load active question configurations
    const currentQ = QUESTIONS[selectedDomain][currentQuestionIndex];
    
    // Set initial text inside textarea code input editor
    const savedCode = codeSnippets[currentQuestionIndex];
    if (savedCode) {
      setActiveCodeText(savedCode);
    } else {
      const defaultText = currentQ.defaultCode || "";
      setActiveCodeText(defaultText);
      const updated = [...codeSnippets];
      updated[currentQuestionIndex] = defaultText;
      setCodeSnippets(updated);
    }

    // Reset single question timer to 30.0s
    setTimeLeft(30.0);
    setTerminalLogs([
      `[SYSTEM] Connected to ${selectedDomain.toUpperCase()} sandbox channel.`,
      `[SHELL] Ready. Input options or tweak script resolution above.`
    ]);

  }, [currentQuestionIndex, phase, selectedDomain]);

  // Global Timer and Auto-Submit loop
  useEffect(() => {
    if (phase !== "testing") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          // Trigger automatic submission of current answer choice (blank if none)
          handleNextQuestion();
          return 30.0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
      setTotalTimeSpent((t) => t + 0.1);
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase, currentQuestionIndex]);

  // Scroll Console to bottom
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Start Assessment Vetting Test
  const handleStartVetting = (domain: "coding" | "medical" | "legal") => {
    setSelectedDomain(domain);
    setCurrentQuestionIndex(0);
    setAnswers(["", "", ""]);
    setCodeSnippets(["", "", ""]);
    setTotalTimeSpent(0);
    setPhase("testing");
  };

  // Option select
  const handleSelectOption = (optLabel: string) => {
    const updated = [...answers];
    updated[currentQuestionIndex] = optLabel;
    setAnswers(updated);

    // Mirror in code editor as a selection indicator if desired
    const qDb = QUESTIONS[selectedDomain || "coding"][currentQuestionIndex];
    const targetOpt = qDb.options.find(o => o.label === optLabel);
    
    setTerminalLogs((prev) => [
      ...prev,
      `[INPUT] Selected Option ${optLabel}: ${targetOpt?.text.substring(0, 45)}...`,
      targetOpt?.code ? `[COMPILER] Loading code segment into buffer:\n${targetOpt.code}` : `[VALIDATOR] Option buffered. Ready to run compile sandbox.`
    ]);
  };

  // Run Sandbox Code Simulator (fetches from simulated route)
  const handleRunCompiler = async () => {
    if (!selectedDomain) return;
    setIsRunningCode(true);

    setTerminalLogs((prev) => [
      ...prev,
      `\n[EXEC] Triggering compilation payload at dynamic api routing...`,
    ]);

    try {
      const response = await fetch("/api/vetting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_code",
          domain: selectedDomain,
          codeSnippet: activeCodeText,
        }),
      });

      const data = await response.json();
      if (data.logs && Array.isArray(data.logs)) {
        // Append compiling outputs with simulated lag
        data.logs.forEach((log: string, idx: number) => {
          setTimeout(() => {
            setTerminalLogs((prev) => [...prev, log]);
          }, idx * 150);
        });
      } else {
        setTerminalLogs((prev) => [...prev, `✗ Fatal: Invalid server console stream response.`]);
      }
    } catch (err) {
      setTerminalLogs((prev) => [...prev, `✗ Link Failure: Unable to establish API kernel link.`]);
    } finally {
      setTimeout(() => {
        setIsRunningCode(false);
      }, 800);
    }
  };

  // Next / Submit Question Frame
  const handleNextQuestion = () => {
    if (!selectedDomain) return;
    const questionsLength = QUESTIONS[selectedDomain].length;

    if (currentQuestionIndex < questionsLength - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Test ended, compile grade results
      submitTestForGrading();
    }
  };

  // Submit test compilation for final score scoring
  const submitTestForGrading = async () => {
    if (!selectedDomain) return;
    setPhase("results");

    try {
      const response = await fetch("/api/vetting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_test",
          domain: selectedDomain,
          answers,
          currentXp: xp,
          timeSpent: Math.round(totalTimeSpent),
        }),
      });

      const data = (await response.json()) as GradeReport;
      setGradeReport(data);

      // Save XP in local variable
      const oldXp = xp;
      const newXp = data.newXp;
      setXp(newXp);
      localStorage.setItem("axiom_vetting_xp", newXp.toString());
      updateTierForXp(newXp);

      // Check if user has advanced tiers to fire Level-Up sequence
      if (data.promoted) {
        setTimeout(() => {
          setPromotedTo(data.newTier);
          setUnlockedMultiplier(data.tierConfig.multiplier);
          setShowLevelUp(true);
          playLevelUpSound();
        }, 1200);
      }
    } catch (e) {
      console.error("Link Failure during grading evaluation", e);
    }
  };

  // Clear XP Reset
  const handleResetProgress = () => {
    if (window.confirm("Confirm system deletion? All vetting XP credentials and tiers will be wiped.")) {
      localStorage.removeItem("axiom_vetting_xp");
      setXp(0);
      setTier(TIERS[0]);
    }
  };

  return (
    <DashboardLayout>
      {/* Spark Particle Explosion Overlay Canvas */}
      {showLevelUp && (
        <canvas 
          ref={canvasRef} 
          className="fixed inset-0 w-full h-full pointer-events-none z-45"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      
      {/* Header Widget */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-zinc-800 pb-6 mb-8 gap-4 select-none">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 font-headline">
            AXIOM <span className="text-[#a5a5ff] font-extrabold text-xs px-2 py-0.5 rounded border border-[#a5a5ff]/20 bg-[#a5a5ff]/5 font-mono">VETTING CORE</span>
          </h1>
          <p className="text-[10px] text-zinc-500 tracking-wider font-mono">PREMIUM ALGORITHMIC PLAYGROUND</p>
        </div>

        {/* Micro XP Profile Summary Widget */}
        <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-zinc-850 shadow-md">
          {/* Rank Shield */}
          <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-br ${tier.color} text-zinc-100 flex flex-col items-center justify-center border border-white/5 shadow-inner`}>
            <span className="text-[9px] uppercase font-bold tracking-widest text-white/70">RANK</span>
            <span className="text-xs font-extrabold tracking-wide uppercase font-headline">{tier.name}</span>
          </div>

          {/* XP bar details */}
          <div className="flex flex-col w-36 sm:w-48">
            <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 mb-1">
              <span>MULTIPLIER: <span className="text-indigo-400">{tier.multiplier}x</span></span>
              <span>{xp} XP</span>
            </div>
            
            {/* Progress Slider */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out shadow-lg shadow-indigo-500/50"
                style={{ 
                  width: `${Math.min(100, Math.max(8, (xp / 700) * 100))}%` 
                }}
              />
            </div>
          </div>

          {/* Reset */}
          <button 
            onClick={handleResetProgress}
            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
            title="Reset System Core Credentials"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>


        {/* ================= PHASE 1: LOBBY ================= */}
        {phase === "lobby" && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Panel */}
            <div className="text-center max-w-3xl mx-auto space-y-4 py-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-500/5 text-xs text-indigo-300 font-bold uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Next-Gen Gamified Triage System Active
              </div>
              <h2 className="text-4xl font-extrabold sm:text-5xl tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-300">
                Establish Your Domain Authority
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Take command of high-integrity scenarios. Sandbox compilers, clinical protocols, and case precedents evaluate your precision velocity. Accumulate XP credentials, unlock multipliers, and secure Elite Vetting clearance.
              </p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* CARD 1: MEDICAL DIAGNOSIS */}
              <div 
                onClick={() => handleStartVetting("medical")}
                className="group relative rounded-2xl border border-zinc-800 bg-[#09090b]/80 p-6 flex flex-col justify-between hover:border-pink-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/5 cursor-pointer hover:-translate-y-1"
              >
                {/* Glow filter */}
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl duration-500 pointer-events-none" />
                
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors duration-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold tracking-widest text-pink-400 uppercase">CLINICAL TRIALS</span>
                      <span className="text-[10px] font-semibold text-zinc-500">DIFFICULTY: EXPERT</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-wide group-hover:text-pink-400 transition-colors duration-300">Medical Diagnosis</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Evaluate complex patient files, navigate absolute contraindications, audit drug interactions, and resolve ECG anomalies under triage stress.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className="flex items-center gap-1 group-hover:text-pink-400 transition-colors duration-300">
                    LAUNCH ARENA
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">3 SCENARIOS</span>
                </div>
              </div>

              {/* CARD 2: LEGAL STATUTES */}
              <div 
                onClick={() => handleStartVetting("legal")}
                className="group relative rounded-2xl border border-zinc-800 bg-[#09090b]/80 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 cursor-pointer hover:-translate-y-1"
              >
                {/* Glow filter */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl duration-500 pointer-events-none" />

                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors duration-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">JURISPRUDENCE</span>
                      <span className="text-[10px] font-semibold text-zinc-500">DIFFICULTY: HARDCORE</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-wide group-hover:text-indigo-400 transition-colors duration-300">Legal Statutes</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Deconstruct jurisdictional conflicts, model compliance frameworks, evaluate intellectual property liabilities, and analyze board fiduciary duties.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors duration-300">
                    LAUNCH ARENA
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">3 SCENARIOS</span>
                </div>
              </div>

              {/* CARD 3: CODING LOGIC */}
              <div 
                onClick={() => handleStartVetting("coding")}
                className="group relative rounded-2xl border border-zinc-800 bg-[#09090b]/80 p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer hover:-translate-y-1"
              >
                {/* Glow filter */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl duration-500 pointer-events-none" />

                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors duration-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">SANDBOX CORE</span>
                      <span className="text-[10px] font-semibold text-zinc-500">DIFFICULTY: ELITE</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-wide group-hover:text-emerald-400 transition-colors duration-300">Coding Logic</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Optimize massive memory arrays, fix async race conditions, mitigate concurrency traps, and audit prototype security vulnerabilities.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span className="flex items-center gap-1 group-hover:text-emerald-400 transition-colors duration-300">
                    LAUNCH ARENA
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span className="text-[10px] text-zinc-500 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">3 SCENARIOS</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= PHASE 2: TESTING ROOM ================= */}
        {phase === "testing" && selectedDomain && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header: Progress & Active Timer Bar */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-extrabold uppercase">
                    SCENARIO {currentQuestionIndex + 1} / {QUESTIONS[selectedDomain].length}
                  </span>
                  <span className="text-sm font-semibold text-zinc-300 tracking-wide">
                    {QUESTIONS[selectedDomain][currentQuestionIndex].questionText}
                  </span>
                </div>
                
                {/* Numeric Timer */}
                <div className="flex items-center gap-1.5 font-mono text-sm">
                  <svg className={`w-4 h-4 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-zinc-200'}`}>
                    {timeLeft.toFixed(1)}s SECONDS LEFT
                  </span>
                </div>
              </div>

              {/* Graphical countdown bar */}
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full transition-all duration-100 ease-linear shadow-lg ${
                    timeLeft > 15 
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/20" 
                      : timeLeft > 7 
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-500/20"
                        : "bg-gradient-to-r from-red-600 to-red-400 animate-pulse shadow-red-500/30"
                  }`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Core Work Deck Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT PANEL: Scenario or Patient Card */}
              <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  {/* Decorative Terminal Header */}
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-500 border-b border-zinc-800 pb-3">
                    <span>PATHWAY_DECK_V2.9.LOG</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      CONNECTED
                    </span>
                  </div>

                  {/* Context Title */}
                  <h4 className="text-lg font-bold text-zinc-100 tracking-wide">
                    {QUESTIONS[selectedDomain][currentQuestionIndex].options[0] ? "Target Investigation Context" : "Assessment Data Frame"}
                  </h4>

                  {/* Narrative Body */}
                  <p className="text-zinc-300 text-sm leading-relaxed bg-[#060608] p-4 rounded-xl border border-zinc-900 font-sans shadow-inner">
                    {QUESTIONS[selectedDomain][currentQuestionIndex].scenario}
                  </p>
                  
                  {/* Nested metadata cards based on Domain */}
                  {selectedDomain === "medical" && QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/60">
                      <div>
                        <span className="text-zinc-500 block font-semibold mb-0.5">AGE/GENDER</span>
                        <span className="text-zinc-300 font-bold">{QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord?.age} / {QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord?.gender}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-semibold mb-0.5">ONSET TIMER</span>
                        <span className="text-zinc-300 font-bold text-pink-400">{QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord?.onset}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-500 block font-semibold mb-0.5">ACTIVE VITALS</span>
                        <span className="text-zinc-300 font-mono font-bold">{QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord?.vitals}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-500 block font-semibold mb-0.5">LAB RESULTS</span>
                        <span className="text-zinc-300 font-mono font-bold text-yellow-400/90">{QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord?.labs}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-500 block font-semibold mb-0.5">CLINICAL HISTORY</span>
                        <span className="text-zinc-300 font-bold text-red-400/90">{QUESTIONS[selectedDomain][currentQuestionIndex].patientRecord?.history}</span>
                      </div>
                    </div>
                  )}

                  {selectedDomain === "legal" && QUESTIONS[selectedDomain][currentQuestionIndex].caseRecord && (
                    <div className="space-y-2 text-xs bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/60">
                      <div className="grid grid-cols-2 gap-2 border-b border-zinc-800/80 pb-2">
                        <div>
                          <span className="text-zinc-500 block font-semibold">PLAINTIFF vs. DEFENDANT</span>
                          <span className="text-zinc-300 font-bold">{QUESTIONS[selectedDomain][currentQuestionIndex].caseRecord?.parties}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-semibold">TRIAL COURT</span>
                          <span className="text-zinc-300 font-bold">{QUESTIONS[selectedDomain][currentQuestionIndex].caseRecord?.jurisdiction}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-zinc-500 block font-semibold">BREACH ACTION</span>
                          <span className="text-zinc-300 font-bold text-red-400/90">{QUESTIONS[selectedDomain][currentQuestionIndex].caseRecord?.breach}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block font-semibold">GOVERNING PRECEDENT</span>
                          <span className="text-zinc-300 font-bold text-indigo-400">{QUESTIONS[selectedDomain][currentQuestionIndex].caseRecord?.precedents}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Cyber Footer Decoration */}
                <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono">
                  <span>KERNEL: SEED_A998F</span>
                  <span>ENCRYPTED MEMORY BUFFER V.2</span>
                </div>
              </div>

              {/* RIGHT PANEL: Code Editor & Multi-Choice Deck */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                {/* interactive Question Options Selectors */}
                <div className="bg-[#09090b]/80 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Choose Resolution Pathway:</span>
                  
                  <div className="space-y-3">
                    {QUESTIONS[selectedDomain][currentQuestionIndex].options.map((opt) => {
                      const isSelected = answers[currentQuestionIndex] === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => handleSelectOption(opt.label)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 relative group ${
                            isSelected 
                              ? "bg-indigo-500/10 border-indigo-500 shadow-md shadow-indigo-500/5 text-zinc-100" 
                              : "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {/* Option Badge */}
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black select-none ${
                            isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-colors"
                          }`}>
                            {opt.label}
                          </span>
                          
                          {/* Option Text */}
                          <div className="flex-1 space-y-2">
                            <p className="text-xs sm:text-sm leading-relaxed">{opt.text}</p>
                            {opt.code && (
                              <pre className="text-[10px] font-mono p-2.5 rounded bg-zinc-950/60 border border-zinc-900 overflow-x-auto text-indigo-300">
                                {opt.code}
                              </pre>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Editor Workspace Input */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-[300px]">
                  
                  {/* Editor Header tabs */}
                  <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="text-[11px] font-semibold tracking-wide ml-2 text-zinc-300">
                        {selectedDomain === "coding" ? "sandbox_worker.ts" : selectedDomain === "medical" ? "clinical_note.md" : "briefcase_pleading.txt"}
                      </span>
                    </div>
                    <span>UTF-8</span>
                  </div>

                  {/* Code textarea container */}
                  <div className="flex-1 relative">
                    <textarea
                      value={activeCodeText}
                      onChange={(e) => {
                        setActiveCodeText(e.target.value);
                        const updated = [...codeSnippets];
                        updated[currentQuestionIndex] = e.target.value;
                        setCodeSnippets(updated);
                      }}
                      placeholder={QUESTIONS[selectedDomain][currentQuestionIndex].placeholder}
                      className="w-full h-full min-h-[160px] bg-zinc-950 text-indigo-200/90 font-mono text-xs p-4 focus:outline-none focus:ring-0 resize-none leading-relaxed select-all"
                    />
                  </div>

                  {/* Terminal console frame */}
                  <div className="bg-[#050507] border-t border-zinc-800 p-4 font-mono text-[10px] space-y-2 flex flex-col h-40 overflow-y-auto shadow-inner">
                    <div className="text-zinc-500 font-bold border-b border-zinc-900 pb-1.5 flex justify-between items-center uppercase tracking-wider">
                      <span>SANDBOX DIAGNOSTIC STAGES</span>
                      <span>BUFFER: ONLINE</span>
                    </div>
                    <div className="space-y-1.5 flex-1 overflow-y-auto">
                      {terminalLogs.map((log, i) => {
                        let color = "text-zinc-400";
                        if (log.startsWith("✓")) color = "text-emerald-400 font-semibold";
                        else if (log.startsWith("✗") || log.toLowerCase().includes("fail")) color = "text-red-400 font-semibold";
                        else if (log.startsWith("[SYSTEM]")) color = "text-indigo-400";
                        else if (log.startsWith("[INPUT]")) color = "text-pink-400";
                        else if (log.startsWith("[PARSER]")) color = "text-yellow-400/90";
                        
                        return (
                          <div key={i} className={`whitespace-pre-wrap leading-normal ${color}`}>
                            {log}
                          </div>
                        );
                      })}
                      <div ref={consoleBottomRef} />
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="bg-zinc-900/60 px-4 py-3 border-t border-zinc-800 flex justify-between items-center gap-4">
                    <button
                      onClick={handleRunCompiler}
                      disabled={isRunningCode}
                      className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 transition-all font-mono text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-2 select-none"
                    >
                      {isRunningCode ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                          RUNNING...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                          RUN COMPILE SANDBOX
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold text-xs tracking-wide text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:translate-y-px transition-all select-none"
                    >
                      {currentQuestionIndex < QUESTIONS[selectedDomain].length - 1 ? (
                        <>
                          COMMIT RESOLUTION
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          SUBMIT ENTIRE TEST
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= PHASE 3: RESULTS CARD ================= */}
        {phase === "results" && (
          <div className="space-y-8 animate-fade-in">
            {gradeReport ? (
              <div className="space-y-8">
                
                {/* Score Header Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* accuracy circular progress meter */}
                  <div className="bg-[#09090b]/80 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">ACCURACY SCORE</span>
                    <div className="relative w-32 h-32">
                      {/* SVG Gauge */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="54" className="stroke-zinc-900 fill-none" strokeWidth="10" />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="54" 
                          className="stroke-indigo-500 fill-none transition-all duration-1000 ease-out" 
                          strokeWidth="10" 
                          strokeDasharray="339.29" 
                          strokeDashoffset={339.29 - (339.29 * gradeReport.accuracy) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Inner Numeric Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                        <span className="text-3xl font-black text-white">{gradeReport.accuracy}%</span>
                        <span className="text-[10px] text-zinc-500 font-sans tracking-wide">PRECISION</span>
                      </div>
                    </div>
                  </div>

                  {/* speed metric and speed multiplier */}
                  <div className="bg-[#09090b]/80 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">RESPONSE VELOCITY</span>
                      <span className="text-3xl font-black text-white font-mono">{gradeReport.timeSpent}s</span>
                      <span className="text-[10px] text-zinc-500 block">TOTAL TRIAL ELAPSED TIME</span>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">SPEED FACTOR BONUS:</span>
                      <span className="text-emerald-400 font-bold font-mono">+{gradeReport.speedBonusPercent}%</span>
                    </div>
                  </div>

                  {/* XP Gained display */}
                  <div className="bg-[#09090b]/80 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">XP Payout</span>
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-mono">
                        +{gradeReport.xpEarned} XP
                      </span>
                      <span className="text-[10px] text-zinc-500 block">MULTIPLIED EXPERIENCE PAYOUT</span>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">BASE SCORE POINTS:</span>
                        <span className="text-zinc-300 font-semibold font-mono">{gradeReport.basePoints}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">RANK MULTIPLIER:</span>
                        <span className="text-indigo-400 font-bold font-mono">{gradeReport.tierConfig.multiplier}x</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier status indicator */}
                  <div className="bg-[#09090b]/80 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">CURRENT RANK CLEARANCE</span>
                      <span className={`text-2xl font-black bg-gradient-to-r ${gradeReport.tierConfig.color} bg-clip-text text-transparent uppercase tracking-wider`}>
                        {gradeReport.newTier}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">SYSTEM AUTHENTICATED TIER</span>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80">
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${Math.min(100, (gradeReport.newXp / 700) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 text-right block font-mono">
                        {gradeReport.newXp} / 700 XP TO MAX CLEARANCE
                      </span>
                    </div>
                  </div>

                </div>

                {/* Professional feedback box */}
                <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <h3 className="text-lg font-bold text-zinc-200 tracking-wide">
                      {gradeReport.feedbackHeadline}
                    </h3>
                    <p className="text-xs text-zinc-500 tracking-wider font-mono">AUTHENTICATED EVALUATOR CHIPS REPORT</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Strengths */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ESTABLISHED STRENGTHS
                      </h4>
                      <ul className="space-y-2 text-xs text-zinc-400">
                        {gradeReport.strengths.map((str, index) => (
                          <li key={index} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-emerald-400 font-bold select-none">✓</span>
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Growth */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        RECOMMENDED DRILLS
                      </h4>
                      <ul className="space-y-2 text-xs text-zinc-400">
                        {gradeReport.growthAreas.map((gr, index) => (
                          <li key={index} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-indigo-400 font-bold select-none">›</span>
                            {gr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Question Breakdown Analysis List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">SCENARIO RUN BREAKDOWN:</h3>
                  
                  <div className="space-y-4">
                    {gradeReport.breakdown.map((res, idx) => {
                      const qDb = QUESTIONS[selectedDomain || "coding"][idx];
                      return (
                        <div 
                          key={res.questionId}
                          className={`border rounded-2xl p-6 ${
                            res.correct 
                              ? "bg-emerald-950/5 border-emerald-900/30" 
                              : "bg-red-950/5 border-red-900/30"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                res.correct 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/25"
                              }`}>
                                {res.correct ? "✓" : "✗"}
                              </span>
                              <h4 className="text-sm font-bold tracking-wide text-zinc-200">
                                SCENARIO {idx + 1}: {qDb.questionText}
                              </h4>
                            </div>
                            
                            <div className="font-mono text-xs flex items-center gap-3">
                              <span>SELECTED: <span className={res.correct ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{res.userAnswer}</span></span>
                              <span>CORRECT: <span className="text-emerald-400 font-bold">{res.correctAnswer}</span></span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-zinc-400 text-xs leading-relaxed italic bg-zinc-950/60 p-3 rounded-lg border border-zinc-900">
                              "{qDb.scenario.substring(0, 180)}..."
                            </p>
                            <div className="text-xs leading-relaxed text-zinc-300">
                              <span className="font-bold text-indigo-400 block mb-0.5 uppercase tracking-wide">EVALUATION METRIC:</span>
                              {res.explanation}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Score CTAs */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => selectedDomain && handleStartVetting(selectedDomain)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs tracking-wider uppercase text-white shadow-lg shadow-indigo-600/20 active:translate-y-px transition-all select-none"
                  >
                    RE-RUN SIMULATION
                  </button>
                  <button
                    onClick={() => {
                      setPhase("lobby");
                      setSelectedDomain(null);
                      setGradeReport(null);
                    }}
                    className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 font-semibold text-xs tracking-wider uppercase text-zinc-300 hover:text-white transition-all select-none"
                  >
                    BACK TO DOMAIN DECK
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4">
                <div className="w-10 h-10 border-3 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  COMPILING GRADE SCHEDULER PATHWAYS...
                </p>
              </div>
            )}
          </div>
        )}



      {/* ================= LEVEL UP PROMOTION DEEPLINK OVERLAY ================= */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in px-4">
          
          {/* Confetti Explosion Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
          
          <div className="relative max-w-lg w-full bg-[#08080a] border border-yellow-500/30 rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(234,179,8,0.06)] overflow-hidden space-y-8 animate-scale-up z-10">
            
            {/* Spinning Cyber-rings decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-yellow-500/5 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '30s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-purple-500/5 border-dashed rounded-full animate-spin pointer-events-none" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            
            <div className="space-y-4 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-yellow-500/35 bg-yellow-500/5 text-[10px] text-yellow-400 font-extrabold uppercase tracking-widest animate-bounce">
                ★ SYSTEM PROMOTION UNLOCKED ★
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                RANK ELEVATED
              </h2>
            </div>

            {/* Glowing Rank Crest Shield Badge */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-6">
              {/* Pulsing Backlight */}
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl animate-pulse" />
              
              {/* Golden Crest */}
              <svg className="w-28 h-28 text-yellow-400 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>

              {/* Orbital Runes Ring */}
              <div className="absolute inset-0 border border-yellow-500/25 border-t-transparent border-b-transparent rounded-full animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <div className="space-y-2 relative">
              <span className="text-zinc-500 text-xs block font-mono">NEW AUTHENTICATED TIER CREDENTIAL:</span>
              <span className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 uppercase block select-all">
                {promotedTo}
              </span>
            </div>

            {/* Point Multiplier details */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 py-3.5 px-6 rounded-2xl max-w-xs mx-auto text-center space-y-1 relative">
              <span className="text-yellow-400/90 text-sm font-extrabold tracking-wider font-mono">
                {unlockedMultiplier}x XP MULTIPLIER ACTIVE
              </span>
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">
                Clearance upgraded. Future test scores will scale.
              </span>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setShowLevelUp(false)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-extrabold text-xs tracking-widest uppercase hover:brightness-105 active:translate-y-px transition-all select-none shadow-lg shadow-yellow-500/20 relative"
            >
              ACCEPT SYSTEM COMMISSION
            </button>

          </div>
        </div>
      )}

    </DashboardLayout>

  );
}

