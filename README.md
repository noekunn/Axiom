# Axiom: Decentralized Royalty-Backed Dataset Platform

Axiom is a next-generation decentralized reasoning data marketplace engineered to compile, cleanse, and validate enterprise-grade machine learning datasets. By connecting specialized domain experts (medical, legal, technical) directly with B2B enterprise AI pipelines, Axiom delivers ultra-high-fidelity training material at a fraction of traditional agency costs.

The platform leverages a cryptographic proof-of-origin framework, a multi-model consensus QA pipeline, automated upfront payments and passive perpetual royalties via Razorpay FinOps, and instant dataset licensing and fine-tuning integrations.

---

## 🛠️ Core Features

1.  **Sovereign Light Mode Design Theme**: A premium, high-contrast, editorial visual layout featuring warm-chalk backgrounds (`#f8f7f6`), pure white cards (`#ffffff`), charcoal ink typography (`#1c1917`), and flat outline grey borders (`#dad5d3`) optimized for readability and developer console contrast.
2.  **Role-Based Security Auth Gates**: Strict authorization overlays protect role-based dashboards (Expert security workstation, Enterprise Access Port), enabling secure node signature linking and session management.
3.  **Shortlist Candidate Onboarding Terminal**: Newly registered specialists are initialized with a `"Shortlisted"` status and guided by a multi-stage onboarding checklist tracker that blocks active claims until verification is complete.
4.  **Vetting Arena V2 Grading Engine**: Shortlisted nodes enter timed, domain-specific vetting tests (Medical, Legal, Finance). Submitting answers triggers automated grading that elevates candidates to `"Approved"` mainnet nodes and unlocks the claims workbench.
5.  **Multi-Model Consensus QA Pipeline**: Crowdsourced dataset submissions undergo automated consensus evaluations using Groq (Llama 3.3) and OpenAI (GPT-4o) to calibrate quality scores, automate approvals, or route borderline edge cases to human administrators.
6.  **Razorpay FinOps Payouts**: Connects experts with Razorpay X UPI payout channels. Upon task approval, experts receive automated upfront base payments (₹120/point) and passive royalty distribution entries.
7.  **B2B Data-Asset Marketplace**: Enterprises can license dataset index pools non-exclusively or opt for exclusive buyouts, unlocking immediate Cloudflare R2 download tokens.
8.  **OpenAI Fine-Tuning Integration Webhook**: Enables clients to trigger Supervised Fine-Tuning (SFT) jobs on OpenAI models (`gpt-4o-mini`) using licensed datasets directly from the Axiom interface.
9.  **Fail-Safe DB Graceful Degradation**: Both purchase and fine-tune endpoints detect database connection status. If PostgreSQL is offline, the backend gracefully falls back to simulated in-memory `db.ts` database updates, ensuring uninterrupted operational uptime.

---

## 📂 Project Tech Stack & Architecture

### Tech Stack
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & Sovereign Light Design tokens
*   **Database**: PostgreSQL with Prisma Client ORM
*   **SDKs**: Official `openai` SDK (Fine-tuning), `razorpay` Node SDK (FinOps UPI Payouts)
*   **Queueing**: BullMQ & Redis (Consensus pipeline background jobs)

### Core Architecture Flow
```mermaid
graph TD
    A[Expert Workbench] -->|Submit Instruction Pair| B(Multi-Model QA Consensus)
    B -->|Groq / OpenAI Auditor| C{Consensus Status}
    C -->|Approved >= 0.8| D[Prisma Transaction / Fallback DB]
    C -->|Borderline / Disagreement| E[Admin Human Review]
    D -->|Upfront Cash Payout| F[Razorpay X UPI Payout]
    D -->|Points Credited| G[Expert Dashboard Points]
    
    H[Client Licensing Portal] -->|Shared / Exclusive License| I[Stripe Checkout Simulator]
    I -->|Calculate Stakes| J[5% Perpetual Royalty Split]
    J -->|Pro-rata Distribution| K[Prisma RoyaltyLedger & Fallback DB]
    K -->|Payout Updated| F
    
    H -->|Download Dataset| L[Cloudflare R2 Secure Token]
    H -->|Trigger Fine-Tuning| M[OpenAI Fine-Tuning API]
    M -->|JSONL File Upload| N[openai.files.create]
    N -->|SFT Training Job| O[openai.fineTuning.jobs.create]
```

---

## 💻 Running Locally

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Axiom
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and copy the following configuration variables:
```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/axiom_db"

# Razorpay X Payout Keys
RAZORPAY_KEY_ID="rzp_test_placeholder_key_id"
RAZORPAY_KEY_SECRET="razorpay_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="razorpay_test_placeholder_webhook_secret"

# LLM Consensus and OpenAI Fine-Tuning API Keys
OPENAI_API_KEY="openai_test_placeholder_api_key"
GROQ_API_KEY="groq_test_placeholder_api_key"
CLAUDE_API_KEY="claude_test_placeholder_api_key"
```

### 3. Initialize the Database
If you have PostgreSQL running locally, push the Prisma schemas:
```bash
npx prisma db push
```
*Note: If your local PostgreSQL server is offline, the application will automatically fall back to simulated in-memory mode, so you can still run, test, and purchase licensing.*

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎯 Operational Walkthrough

Axiom connects experts and enterprises through a complete end-to-end data value cycle:

1.  **Expert Registration & Onboarding**: Domain specialists sign up, link their Razorpay UPI address, and are placed in `"Shortlisted"` status. They enter the timed vetting arena to verify their specialized credentials.
2.  **Cognitive Vetting & Mainnet Promotion**: Upon completing a cognitive vetting assessment, the engine evaluates the score and instantly promotes the candidate to an `"Approved"` mainnet node, unlocking active claim boards.
3.  **Task Claiming & Multi-Model Grading**: Experts claim active dataset tasks and submit high-fidelity instruction pairs. Submissions are audited in real time by Groq and OpenAI models. Upfront micro-payments are instantly routed to their Razorpay UPI accounts.
4.  **B2B Dataset Licensing**: AI laboratories switch to the Client Portal, select standard or exclusive licenses for training pools, and execute sandbox checkouts. On success, Cloudflare R2 download tokens are generated.
5.  **Royalty Distribution**: Licensing sales calculate pro-rata yields across all contributing nodes, distributing perpetual 5% royalties instantly to the expert payout ledgers.
6.  **Supervised Fine-Tuning (SFT)**: Clients trigger Next.js-backed SFT webhooks, packaging dataset assets into JSONL files and initiating real-time training jobs directly via the OpenAI developer API.
