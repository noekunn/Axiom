# Axiom: Decentralized Royalty-Backed Dataset Platform

Axiom is a next-generation decentralized reasoning data marketplace that connects domain experts (medical, legal, technical) directly with B2B enterprise AI models. Axiom uses a multi-model consensus QA pipeline to validate reasoning traces, automates upfront micro-payments & passive royalties via Razorpay FinOps, and unlocks immediate dataset licensing downloads and OpenAI fine-tuning pipelines.

---

## 🚀 Links & Deliverables

*   **Live Vercel Demo URL**: `[Insert Live Vercel URL Here]`
*   **2-Minute Video Pitch Link**: `[Insert Video Pitch Link Here]`

---

## 🛠️ Core Features

1.  **Sovereign Light Mode Design Theme**: Re-engineered the entire visual ecosystem from a dark layout into a premium, high-contrast, editorial **Sovereign Light Mode** theme. Outfitted with warm-chalk backgrounds (`#f8f7f6`), pure white cards (`#ffffff`), charcoal ink typography (`#1c1917`), and flat outline grey borders (`#dad5d3`) inspired by the premium Stitch project templates (`projects/14688480690965115472`).
2.  **Role-Based Security Auth Gates**: Locked down individual workspaces under strict security layers. Visitors at `/expert` and `/client` are greeted with secure authorization gates (Expert security node workstation, Enterprise Access Port) to log in instantly using pre-seeded sandbox accounts or link new credentials.
3.  **Shortlist Candidate Onboarding Terminal**: Newly registered specialists are initialized with a `"Shortlisted"` status and guided by a premium, multi-stage candidate onboarding terminal tracker. Active task claim boards remain securely locked until vetting is complete.
4.  **Vetting Arena V2 Grading Engine**: Shortlisted nodes claim timed domain-specific vetting tests (Medical, Legal, Finance). Submitting answers immediately grades their responses, elevates their status to `"Approved"` mainnet nodes, and unlocks the full active claims workbench.
5.  **Multi-Model Consensus QA Pipeline**: Crowdsourced dataset submissions undergo automated consensus evaluations using Groq (Llama 3.3) and OpenAI (GPT-4o) to calibrate quality scores, automate approvals, or route borderline edge cases to human administrators.
6.  **Razorpay FinOps Payouts**: Connects experts with Razorpay X UPI payout channels. Upon task approval, experts receive automated upfront base payments (₹120/point) and passive royalty distribution entries.
7.  **B2B Data-Asset Marketplace**: Enterprises can license dataset index pools non-exclusively or opt for exclusive buyouts, unlocking immediate Cloudflare R2 download tokens.
8.  **OpenAI Fine-Tuning Integration Webhook**: Enables clients to trigger Supervised Fine-Tuning (SFT) jobs on OpenAI models (`gpt-4o-mini`) using the licensed dataset directly from the Axiom interface.
9.  **Fail-Safe DB Graceful Degradation**: Both purchase and fine-tune endpoints detect database connection status. If PostgreSQL is offline, the backend gracefully falls back to simulated in-memory `db.ts` database updates, ensuring the demo works flawlessly.


---

## 📂 Project Tech Stack & Architecture

### Tech Stack
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & Modern Glassmorphism
*   **Database**: PostgreSQL with Prisma Client ORM
*   **SDKs**: Official `openai` SDK (Fine-tuning), `razorpay` Node SDK (FinOps UPI Payouts)
*   **Queueing**: BullMQ & Redis (Consensus pipeline background jobs)

### Core Architecture Flow
```mermaid
graph TD
    A[Expert Workbench] -->|Submit Instruction Pair| B(Multi-Model QA Consensus)
    B -->|Groq / OpenAI Auditor| C{Consensus Status}
    C -->|Approved >= 0.8| D[Prisma Transaction / Mock DB]
    C -->|Borderline / Disagreement| E[Admin Human Review]
    D -->|Upfront Cash Payout| F[Razorpay X UPI Payout]
    D -->|Points Credited| G[Expert Dashboard Points]
    
    H[Client Licensing Portal] -->|Shared / Exclusive License| I[Stripe Checkout Simulator]
    I -->|Calculate Stakes| J[5% Perpetual Royalty Split]
    J -->|Pro-rata Distribution| K[Prisma RoyaltyLedger & Mock DB]
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
Create a `.env` file in the root directory and copy the following configuration variables (credentials are pre-configured to default test/simulation modes):
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

## 🎯 Demo & Evaluation Flow

For judges evaluating this hackathon submission, follow this 5-step walkthrough:

1.  **Onboard/Switch Experts**: Under the **Expert Workbench** tab, use the **Expert Identity** dropdown to switch between pre-seeded experts (e.g., Dr. Ananya Iyer, Adv. Rahul Banerjee). Observe their active points, lifetime earnings, and transaction history.
2.  **Submit Reasoning Dataset**:
    *   Select a Target Asset Pool (e.g. `Axiom-Hinglish-Clinical-V1`).
    *   Enter a high-fidelity prompt instruction and expert response (e.g. Hinglish clinical diagnostic trace).
    *   Click **Submit to Consensus QA Pipeline**. Observe the Groq and OpenAI model grading, points counter animating up, and the immediate payout added to the **Razorpay Payout Ledger** as `SUCCESS` (upfront base payment).
3.  **Purchase Dataset License**:
    *   Switch to the **Client Licensing Portal** tab.
    *   Select a dataset pool and click **License Dataset Pool**.
    *   Select **Standard Shared** or **Exclusive Buyout** and enter a billing email.
    *   Click **Authorize & Checkout**. On success:
        *   The buy button on the card is replaced by a secure **Cloudflare R2 Download Token** string.
        *   A success banner displays Stripe verification.
4.  **Verify Royalty Distributions**:
    *   Switch back to the **Expert Workbench** tab.
    *   Observe that the lifetime earnings of the contributors have increased (calculated pro-rata based on points).
    *   Scroll down to the **Razorpay UPI Payout Ledger** to verify that a new passive `SHARED` or `EXCLUSIVE` royalty payout row is registered as `SUCCESS`.
5.  **Trigger Fine-Tuning**:
    *   On the Client tab success banner, click **Trigger OpenAI Fine-Tuning**.
    *   Watch the interactive log console run through file packaging to JSONL, uploading to OpenAI files API, and initiating the Supervised Fine-Tuning (SFT) job with real-time status output.
