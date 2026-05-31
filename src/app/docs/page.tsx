import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Database,
  GitBranch,
  KeyRound,
  Layers,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import PublicFooter from "@/components/PublicFooter";

const systemRoutes = [
  { path: "/", purpose: "Unified dashboard and demo marketplace for expert submissions, licensing, payouts, and fine-tuning." },
  { path: "/signup", purpose: "Dual-track onboarding for expert specialists and enterprise clients." },
  { path: "/expert", purpose: "Expert workbench for identity, vetting status, task contribution, and consensus reports." },
  { path: "/client", purpose: "Enterprise dataset marketplace with shared and exclusive licensing flows." },
  { path: "/client/sft", purpose: "OpenAI supervised fine-tuning console for licensed dataset pools." },
  { path: "/admin", purpose: "Operator console for queue health, payout audits, calibration, and manual review." },
  { path: "/leaderboard", purpose: "Model comparison surface for domain, language, latency, and quality metrics." },
  { path: "/whitepaper", purpose: "Protocol thesis, royalty mechanics, consensus design, and security model." },
];

const apiRoutes = [
  { path: "GET /api?action=pools", purpose: "Lists active and completed dataset pools from the simulated marketplace store." },
  { path: "GET /api?action=expert", purpose: "Fetches an expert profile, contribution ledger, and payout history by email." },
  { path: "POST /api?action=signup", purpose: "Creates or retrieves expert profiles for the demo onboarding path." },
  { path: "POST /api?action=submit", purpose: "Runs Groq/OpenAI consensus scoring, credits points, and starts payout ledger entries." },
  { path: "POST /api/client/purchase", purpose: "Licenses a dataset pool, updates Prisma when available, and falls back to mock state." },
  { path: "POST /api/client/fine-tune", purpose: "Builds JSONL training data and starts or simulates an OpenAI fine-tuning job." },
  { path: "POST /api/vetting", purpose: "Grades vetting arena answers and updates the local expert activation path." },
  { path: "POST /api/webhooks/razorpay", purpose: "Verifies Razorpay signatures and updates payout status idempotently." },
];

const architectureCards = [
  {
    icon: Layers,
    title: "App Router Frontend",
    body: "Next.js 14 App Router powers public protocol pages plus role-specific expert, client, and admin workspaces.",
  },
  {
    icon: Database,
    title: "Data Layer",
    body: "Prisma models define the production ledger, while src/app/api/db.ts provides a hot-reload-safe in-memory fallback for demos.",
  },
  {
    icon: Cpu,
    title: "Consensus QA",
    body: "Submissions are scored through Groq Llama and OpenAI GPT evaluators, with deterministic mock fallbacks when keys are missing.",
  },
  {
    icon: Wallet,
    title: "Payout Rails",
    body: "Razorpay X handles expert UPI payout orchestration. Stripe-style licensing is represented in the client purchase flow.",
  },
  {
    icon: Receipt,
    title: "Royalty Ledger",
    body: "Every license creates a 5 percent royalty pool, distributed pro-rata by contribution points and logged per expert.",
  },
  {
    icon: ShieldCheck,
    title: "Auth Simulation",
    body: "Role gates use browser localStorage to keep the hackathon demo fluid without blocking on full identity infrastructure.",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#141313] text-[#e7e4ee] font-sans selection:bg-white/30 selection:text-white overflow-x-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-[-10%] right-[-12%] w-[55%] h-[45%] rounded-full bg-white/10 blur-[130px]" />
        <div className="absolute bottom-[15%] left-[-10%] w-[50%] h-[45%] rounded-full bg-[#10B981]/5 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-50 w-full bg-[#141313]/80 backdrop-blur-xl border-b border-[#262626]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#121212] border border-[#262626] flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white font-display">
              AXIOM
            </span>
            <span className="text-[10px] tracking-widest bg-white/10 text-white px-2 py-0.5 rounded font-mono font-bold border border-white/10">
              DOCS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-[#262626] hover:bg-white/5 px-4 py-2 rounded transition-all duration-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <Link
              href="/whitepaper"
              className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              Whitepaper
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-14 relative z-10 space-y-12">
        <section className="space-y-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-white text-xs font-mono font-semibold border border-[#262626]">
            <BookOpen className="w-4 h-4" /> Axiom Codebase Documentation
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Decentralized expert data marketplace, documented end to end.
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Axiom connects vetted domain experts, enterprise dataset buyers, multi-model QA, payout rails, and fine-tuning workflows into a single demo platform. This guide maps the codebase, runtime flows, routes, integrations, and operational assumptions.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {architectureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-[#121212] border border-[#262626] rounded p-5 space-y-4">
                <div className="w-10 h-10 rounded bg-white/10 border border-white/10 flex items-center justify-center text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-display font-bold text-white mb-2">{card.title}</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">{card.body}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#121212] border border-[#262626] rounded p-6">
            <div className="flex items-center gap-2 mb-5">
              <GitBranch className="w-4 h-4 text-white" />
              <h2 className="text-base font-display font-bold text-white">Core Product Flow</h2>
            </div>
            <ol className="space-y-4 text-xs text-zinc-400 leading-relaxed list-decimal list-inside">
              <li>Experts onboard through signup, receive a shortlisted or approved local session, then complete vetting when required.</li>
              <li>Approved experts claim dataset prompts and submit domain-rich instruction responses.</li>
              <li>Groq and OpenAI evaluators score the submission; mock fallback keeps the demo usable without API keys.</li>
              <li>Accepted work credits points, creates upfront payout entries, and updates pool contribution totals.</li>
              <li>Clients license dataset pools, receive R2-style tokens, and create royalty distributions for contributors.</li>
              <li>Licensed pools can be converted into JSONL and sent to the OpenAI fine-tuning endpoint.</li>
            </ol>
          </div>

          <div className="bg-[#121212] border border-[#262626] rounded p-6">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound className="w-4 h-4 text-white" />
              <h2 className="text-base font-display font-bold text-white">Environment Variables</h2>
            </div>
            <div className="space-y-3 text-xs text-zinc-400">
              <p><code className="text-white">DATABASE_URL</code> connects Prisma to PostgreSQL. If unavailable, purchase and fine-tune paths fall back to mock state.</p>
              <p><code className="text-white">OPENAI_API_KEY</code> enables real evaluation and fine-tuning. Placeholder keys trigger deterministic simulated responses.</p>
              <p><code className="text-white">GROQ_API_KEY</code> enables Llama-based scoring through the OpenAI-compatible Groq endpoint.</p>
              <p><code className="text-white">RAZORPAY_KEY_ID</code>, <code className="text-white">RAZORPAY_KEY_SECRET</code>, and <code className="text-white">RAZORPAY_WEBHOOK_SECRET</code> enable payout creation and webhook verification.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#121212] border border-[#262626] rounded p-6">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-4 h-4 text-white" />
            <h2 className="text-base font-display font-bold text-white">Website Routes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-500 border-b border-[#262626]">
                <tr>
                  <th className="py-3 pr-4 font-mono">Route</th>
                  <th className="py-3 font-mono">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {systemRoutes.map((route) => (
                  <tr key={route.path}>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <Link href={route.path} className="text-white hover:text-[#10B981] font-mono transition-colors">
                        {route.path}
                      </Link>
                    </td>
                    <td className="py-3 text-zinc-400 leading-relaxed">{route.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-[#121212] border border-[#262626] rounded p-6">
          <div className="flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-white" />
            <h2 className="text-base font-display font-bold text-white">API Surface</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiRoutes.map((route) => (
              <div key={route.path} className="p-4 rounded bg-[#141313] border border-[#262626]">
                <code className="text-[11px] text-white font-mono block mb-2">{route.path}</code>
                <p className="text-xs text-zinc-400 leading-relaxed">{route.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#121212] border border-[#262626] rounded p-6">
          <h2 className="text-base font-display font-bold text-white mb-4">Operational Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400 leading-relaxed">
            <p>Use <code className="text-white">npm run dev</code> for local work, <code className="text-white">npm run build</code> before deployment, and <code className="text-white">npx prisma db push</code> when a PostgreSQL instance is available.</p>
            <p>The project intentionally mixes production-like Prisma paths with hackathon-safe mock state, so demos remain usable when external services are offline.</p>
            <p>Before production, replace localStorage role gates with server-backed auth, move demo secrets out of client flows, and align copy with final payment providers.</p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
