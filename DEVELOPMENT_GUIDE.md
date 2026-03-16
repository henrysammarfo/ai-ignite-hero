# Fortis — Development Guide & Task Assignments

> **Hackathon:** StableHacks 2026 · **Deadline:** March 22, 2026
> **Network:** Solana Devnet / Testnet · **Stablecoin:** USDC (SPL)

---

## 📋 Overview — What's Already Done

The entire frontend dashboard is **production-ready** and waiting for real data. Nothing needs to be built on the UI side — every panel, modal, context, and state flow is wired up with typed interfaces ready to receive live responses.

### What the frontend provides:

| Area | Status | Where |
|------|--------|-------|
| Auth (Email, Google, Wallet) | ✅ Shell ready | `src/contexts/AuthContext.tsx`, `src/pages/Login.tsx` |
| Wallet Connect Modal (Phantom/Solflare) | ✅ Shell ready | `src/components/dashboard/WalletConnectModal.tsx` |
| Wallet Context | ✅ Shell ready | `src/contexts/WalletContext.tsx` |
| 4-Layer Compliance (KYC/AML/Travel/SoF) | ✅ Shell ready | `src/contexts/ComplianceContext.tsx`, `CompliancePanel.tsx` |
| Compliance Edge Function Skeleton | ✅ Shell ready | `supabase/functions/compliance-verify/index.ts` |
| Vault Create/Deposit/Withdraw UI | ✅ Shell ready | `VaultsPanel.tsx`, `DepositPanel.tsx` |
| Yield, Transactions, Reports, Settings | ✅ Shell ready | `src/components/dashboard/*.tsx` |
| Dashboard Theme (Dark/Light) | ✅ Complete | `src/contexts/DashboardThemeContext.tsx` |
| Mobile Responsive | ✅ Complete | All panels |
| Action Gating (wallet + compliance) | ✅ Complete | All financial panels |

### How gating works:
1. **No wallet connected** → User sees all panels but action buttons show "Connect Wallet"
2. **Wallet connected, compliance incomplete** → Buttons show "Complete Compliance"
3. **Wallet + full compliance** → All actions unlocked

---

## 🏗️ Architecture — How Everything Connects

```
┌────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite + Tailwind)                │
│                                                     │
│  AuthContext ──→ Supabase Auth (Email/Google)       │
│  WalletContext ──→ @solana/wallet-adapter            │
│  ComplianceContext ──→ Edge Function → Providers     │
│  VaultsPanel ──→ Anchor Program (PDAs)              │
│  DepositPanel ──→ SPL Token Transfer                │
│  YieldPanel ──→ Pyth Oracle Feed                    │
│  ReportsPanel ──→ generateReport.ts (jsPDF)         │
│  TransactionsPanel ──→ Supabase DB / on-chain       │
└──────────────┬─────────────────────────────────────┘
               │
    ┌──────────▼──────────┐
    │  SUPABASE (Backend)  │
    │  - Auth              │
    │  - Edge Functions    │
    │  - Database          │
    │  - Realtime          │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │  SOLANA DEVNET       │
    │  - Anchor Program    │
    │  - PDA Vaults        │
    │  - SPL USDC          │
    │  - Pyth Oracle       │
    └─────────────────────┘
```

---

## 👥 Team Member Assignments

### Member 1 — Solana Smart Contracts (Anchor/Rust)

**Goal:** Build the on-chain program that manages PDA vaults for institutional deposits/withdrawals.

#### Tasks:
- [ ] Initialize Anchor project (`programs/fortis-vault`)
- [ ] Create `create_vault` instruction — derives PDA from org wallet + vault name
- [ ] Create `deposit` instruction — transfers SPL USDC into PDA vault
- [ ] Create `withdraw` instruction — transfers SPL USDC out of PDA vault (with compliance check)
- [ ] Create `close_vault` instruction — returns remaining funds and closes PDA
- [ ] Add Source of Funds attestation PDA (`sof_attestation` account)
- [ ] Write Anchor tests for all instructions
- [ ] Deploy to Solana Devnet and provide Program ID

#### Frontend Integration Points:
- `src/contexts/WalletContext.tsx` → Replace mock `connect()`/`disconnect()` with `@solana/wallet-adapter-react`
- `src/components/dashboard/VaultsPanel.tsx` → Replace `defaultVaults[]` with on-chain PDA reads
- `src/components/dashboard/DepositPanel.tsx` → Wire `handleDeposit()` to Anchor `deposit` instruction
- `src/components/dashboard/WalletConnectModal.tsx` → Use `useWallet()` from `@solana/wallet-adapter-react`

#### Free Tools Needed:
| Tool | Purpose | Link |
|------|---------|------|
| Anchor CLI | Solana framework | `avm install latest` via [anchor-lang.com](https://www.anchor-lang.com/) |
| Solana CLI | Devnet management | [docs.solana.com/cli/install](https://docs.solanalabs.com/cli/install) |
| SPL Token CLI | Create test USDC mint | `spl-token create-token` |
| Solana Playground | Browser IDE for testing | [beta.solpg.io](https://beta.solpg.io/) |

---

### Member 2 — Compliance Service & Backend

**Goal:** Wire the 4 compliance providers into the edge function and set up the database.

#### Tasks:
- [ ] Set up Civic Pass integration (KYC) — get API key from [civic.com](https://www.civic.com/)
- [ ] Set up TRM Labs integration (AML) — apply for free API at [trmlabs.com](https://www.trmlabs.com/)
- [ ] Set up Notabene integration (Travel Rule) — sandbox at [notabene.id](https://notabene.id/)
- [ ] Wire Source of Funds to read on-chain PDA from Member 1's program
- [ ] Complete the edge function at `supabase/functions/compliance-verify/index.ts` (replace TODO stubs)
- [ ] Create Supabase tables: `organizations`, `compliance_records`, `transactions`
- [ ] Set up RLS policies for multi-org data isolation
- [ ] Wire `ComplianceContext.initiateVerification()` to call the edge function via `supabase.functions.invoke()`
- [ ] Store verification results in DB and return to frontend

#### Frontend Integration Points:
- `src/contexts/ComplianceContext.tsx` → `initiateVerification()` function (line ~160) — replace the placeholder with:
  ```typescript
  const { data, error } = await supabase.functions.invoke('compliance-verify', {
    body: { stepId: id, walletAddress: walletAddress }
  });
  ```
- `src/contexts/AuthContext.tsx` → Replace sessionStorage auth with Supabase Auth (`supabase.auth.signUp`, `signInWithPassword`, `signInWithOAuth`)
- `src/components/dashboard/TransactionsPanel.tsx` → Query `transactions` table
- `src/components/dashboard/SettingsPanel.tsx` → Query/update `organizations` table

#### Edge Function Secrets Needed:
```
CIVIC_API_KEY        → From Civic Pass dashboard
TRM_API_KEY          → From TRM Labs dashboard  
NOTABENE_API_KEY     → From Notabene sandbox
SOLANA_RPC_URL       → https://api.devnet.solana.com (free)
FORTIS_PROGRAM_ID    → From Member 1 after deploy
```

#### Free Tools Needed:
| Tool | Purpose | Link |
|------|---------|------|
| Civic Pass (sandbox) | KYC verification | [civic.com/pass](https://www.civic.com/pass) |
| TRM Labs (free tier) | AML screening | [trmlabs.com](https://www.trmlabs.com/) |
| Notabene (sandbox) | Travel rule | [notabene.id](https://notabene.id/) |
| Supabase CLI | Local dev | Already configured via Lovable Cloud |

#### Database Schema (suggested):
```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Records  
CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL, -- 'kyc', 'aml', 'travel', 'sof'
  status TEXT NOT NULL DEFAULT 'pending',
  verification_hash TEXT,
  risk_score TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vault_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal'
  amount NUMERIC NOT NULL,
  token TEXT DEFAULT 'USDC',
  tx_signature TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Member 3 — Wallet Adapter, Yield/Oracle & Reports

**Goal:** Integrate the real Solana wallet adapter, Pyth price feeds, and finalize the PDF reporting.

#### Tasks:
- [ ] Install and configure `@solana/wallet-adapter-react` + `@solana/wallet-adapter-wallets`
- [ ] Replace `WalletContext.tsx` mock with real wallet adapter provider
- [ ] Update `WalletConnectModal.tsx` to use `useWallet()` from adapter (auto-detect installed wallets)
- [ ] Integrate Pyth Oracle for real-time USDC yield data in `YieldPanel.tsx`
- [ ] Wire `ReportsPanel.tsx` to pull real data from DB and generate FINMA-compliant PDF reports
- [ ] Add real-time transaction feed using Supabase Realtime subscription in `TransactionsPanel.tsx`
- [ ] Test full flow on Solana Devnet with Phantom and Solflare wallets

#### Frontend Integration Points:
- `src/contexts/WalletContext.tsx` → Full rewrite with `@solana/wallet-adapter-react`:
  ```typescript
  import { useWallet } from '@solana/wallet-adapter-react';
  // Re-export the adapter's useWallet hook
  ```
- `src/components/dashboard/YieldPanel.tsx` → Replace static data with Pyth feed
- `src/components/dashboard/ReportsPanel.tsx` → Wire `generateReport()` to query real DB
- `src/components/dashboard/TransactionsPanel.tsx` → Add Supabase Realtime channel
- `src/main.tsx` → Wrap app with `ConnectionProvider` + `WalletProvider` from adapter

#### Free Tools Needed:
| Tool | Purpose | Link |
|------|---------|------|
| @solana/wallet-adapter | Wallet integration | [npm: @solana/wallet-adapter-react](https://www.npmjs.com/package/@solana/wallet-adapter-react) |
| Pyth Network | Price oracle | [pyth.network](https://pyth.network/) |
| Phantom Wallet | Testing | [phantom.app](https://phantom.app/) |
| Solflare Wallet | Testing | [solflare.com](https://solflare.com/) |
| jsPDF (installed) | PDF reports | Already in `package.json` |

---

## 🔧 Setup Instructions (All Members)

### 1. Clone and Install
```bash
git clone <REPO_URL>
cd fortis
npm install
```

### 2. Environment Variables
The `.env` file is auto-configured by Lovable Cloud. You'll need to add secrets via the Lovable dashboard for edge functions.

### 3. Run Locally
```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Key Files to Know
```
src/
├── contexts/
│   ├── AuthContext.tsx        ← Auth state (replace with Supabase Auth)
│   ├── WalletContext.tsx      ← Wallet state (replace with adapter)
│   ├── ComplianceContext.tsx   ← 4-step compliance state machine
│   └── DashboardThemeContext.tsx ← Dark/light theme
├── components/dashboard/
│   ├── CompliancePanel.tsx    ← Full compliance UI with all states
│   ├── ComplianceBanner.tsx   ← Compact compliance indicator
│   ├── VaultsPanel.tsx        ← Vault CRUD with deposit/withdraw
│   ├── DepositPanel.tsx       ← Dedicated deposit form
│   ├── YieldPanel.tsx         ← Yield metrics and charts
│   ├── TransactionsPanel.tsx  ← Transaction history
│   ├── ReportsPanel.tsx       ← PDF report generation
│   ├── SettingsPanel.tsx      ← Org settings
│   ├── OverviewPanel.tsx      ← Dashboard home
│   └── WalletConnectModal.tsx ← Phantom/Solflare selector modal
├── lib/
│   └── generateReport.ts     ← jsPDF report builder
└── integrations/supabase/
    ├── client.ts              ← Auto-configured (DO NOT EDIT)
    └── types.ts               ← Auto-generated (DO NOT EDIT)

supabase/functions/
└── compliance-verify/
    └── index.ts               ← Edge function with provider stubs
```

---

## ✅ Definition of Done (Demo-Ready Checklist)

- [ ] Can sign up with Email or Google → lands on dashboard
- [ ] Dashboard shows "Connect Wallet" prompt → modal opens → Phantom/Solflare connects on Devnet
- [ ] Compliance panel: click Start on each step → real API call → status updates with hash/timestamp
- [ ] All 4 compliance steps verified → vault actions unlock
- [ ] Can create a new vault → PDA created on-chain
- [ ] Can deposit USDC into vault → SPL transfer → balance updates
- [ ] Can withdraw USDC from vault → SPL transfer → balance updates
- [ ] Transactions panel shows real tx history with Solana signatures
- [ ] Yield panel shows live data from Pyth oracle
- [ ] Reports panel generates PDF with real compliance + financial data
- [ ] Settings panel persists org info to database
- [ ] Full flow works on mobile (Phantom mobile browser)
- [ ] Dark mode works across all panels

---

## 📅 Timeline (March 13 → March 22)

| Day | Target |
|-----|--------|
| Mar 13–14 | Member 1: Anchor program scaffolded and `create_vault` working on devnet |
| Mar 13–14 | Member 2: Supabase tables created, Auth wired, 1 compliance provider live |
| Mar 13–14 | Member 3: Wallet adapter integrated, Phantom connecting on devnet |
| Mar 15–17 | Member 1: All instructions working (deposit/withdraw/close) |
| Mar 15–17 | Member 2: All 4 compliance providers wired in edge function |
| Mar 15–17 | Member 3: Pyth oracle feeding yield panel, realtime tx feed |
| Mar 18–19 | Integration testing — full flow end-to-end on devnet |
| Mar 20 | Bug fixes, mobile testing, PDF reports finalized |
| Mar 21 | Demo rehearsal, video recording |
| Mar 22 | **Submission deadline** |

---

## 🎯 Judging Criteria Alignment

| Criteria | How Fortis Addresses It |
|----------|------------------------|
| **Innovation** | First institutional-grade compliance layer on Solana for stablecoin treasury |
| **Technical Execution** | Anchor PDA vaults + 4-layer compliance + real-time oracle integration |
| **Completeness** | Full dashboard with auth, compliance, vaults, deposits, yields, reports |
| **UX/Design** | Professional dark-mode institutional UI, mobile responsive |
| **Real-world Viability** | FINMA-aligned compliance framework, institutional wallet support |

---

*Built with ❤️ for StableHacks 2026*
