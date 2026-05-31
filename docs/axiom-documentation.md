# Axiom Documentation

Axiom is a Next.js 14 App Router application for a decentralized, royalty-backed expert dataset marketplace. It demonstrates how domain experts can contribute high-fidelity reasoning data, how enterprises can license curated dataset pools, and how licensed data can flow into OpenAI fine-tuning jobs.

## Product Model

Axiom has three primary users:

- Expert specialists contribute domain-specific instruction responses, complete vetting tasks, earn points, and receive upfront plus royalty payout ledger entries.
- Enterprise clients license dataset pools under shared or exclusive commercial models, receive download tokens, and trigger fine-tuning.
- Operators inspect calibration, queue health, audit logs, payout records, and manual review surfaces.

## Codebase Map

- `src/app/page.tsx` is the unified demo dashboard for expert contribution, client licensing, payout display, and fine-tuning actions.
- `src/app/signup/page.tsx` provides dual expert/client onboarding with local role/session state.
- `src/app/expert/*` contains the expert workbench, profile, royalty analytics, and settings surfaces.
- `src/app/client/*` contains the enterprise marketplace, SFT console, billing ledger, and profile/API key surface.
- `src/app/admin/page.tsx` contains the operator console for calibration, payouts, and task review.
- `src/app/whitepaper/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terminals/page.tsx`, and `src/app/docs/page.tsx` are public documentation and protocol pages.
- `src/app/api/*` contains the demo REST endpoints, purchase/fine-tune integrations, vetting grader, admin settings, and webhooks.
- `src/lib/llm.ts` wraps OpenAI and Groq consensus scoring with mock fallbacks.
- `src/lib/razorpay.ts` wraps Razorpay contact, fund account, payout, and webhook signature operations.
- `prisma/schema.prisma` defines the production data model for users, expert profiles, pools, submissions, licenses, royalties, and webhooks.

## Runtime Architecture

1. Experts register or authorize a demo node.
2. Experts submit instruction pairs against an active asset pool.
3. The submission route calls Groq and OpenAI scoring helpers in parallel.
4. Scores are averaged, points are credited, and payout ledger entries are created.
5. Enterprise clients license an asset pool through the purchase endpoint.
6. The purchase flow writes to Prisma when available and always updates the mock database for demo continuity.
7. Licensing creates a 5 percent royalty pool distributed pro-rata to active contributors.
8. Fine-tuning compiles approved submissions into JSONL and starts a real or simulated OpenAI fine-tuning job.

## Main API Routes

- `GET /api?action=pools` returns active marketplace pools.
- `GET /api?action=expert&email=...` returns an expert profile, submissions, and payout entries.
- `POST /api?action=signup` creates or retrieves an expert profile in the mock store.
- `POST /api?action=client-signup` creates or retrieves a demo enterprise client.
- `POST /api?action=submit` runs consensus QA, credits points, and starts payout ledger updates.
- `POST /api/client/purchase` licenses a pool, updates Prisma when reachable, falls back to the mock store, and returns an R2-style token.
- `POST /api/client/fine-tune` builds JSONL records and starts or simulates OpenAI fine-tuning.
- `POST /api/vetting` grades vetting arena submissions and returns updated expert status.
- `POST /api/webhooks/razorpay` verifies Razorpay webhook signatures and updates payout records.

## Data Model

The Prisma schema centers on:

- `User`, with `ExpertProfile` and `ClientProfile` one-to-one extensions.
- `AssetPool`, the commercial dataset fund being built and licensed.
- `Task`, `TaskSubmission`, and `ConsensusEvaluation`, which capture expert work and QA evidence.
- `PoolContribution`, which records expert point ownership inside each pool.
- `PoolLicense`, which represents client purchases.
- `RoyaltyLedger`, which records expert royalty distributions.
- `WebhookLog`, which stores payment provider webhook events for idempotency and auditability.

## Environment

Required or supported environment variables:

- `DATABASE_URL` for PostgreSQL and Prisma.
- `OPENAI_API_KEY` for real OpenAI evaluation and fine-tuning.
- `GROQ_API_KEY` for Groq Llama scoring.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` for payout rails.

When keys are missing or contain placeholder values, Axiom intentionally uses simulated responses so the product demo remains functional.

## Local Development

```bash
npm install
npx prisma db push
npm run dev
```

Use `npm run build` before deployment. The app can still demonstrate the main flows when PostgreSQL is offline because `src/app/api/db.ts` provides seeded in-memory state.

## Production Readiness Notes

- Replace browser localStorage role gates with server-side authentication and authorization.
- Move all payment and dataset download authorization behind durable server-side checks.
- Add durable storage for generated JSONL artifacts and R2 tokens.
- Add integration tests for purchase, payout, fine-tuning, and webhook idempotency.
- Normalize payment provider naming in the UI where demo copy currently references both Stripe-style checkout and Razorpay rails.
