# Fortis — Institutional Stablecoin Treasury on Solana

> Compliant. Institutional. On-chain.

Fortis is an institutional-grade stablecoin treasury management platform built on Solana. It provides permissioned PDA vaults, 4-layer compliance verification (KYC, AML, Travel Rule, Source of Funds), and real-time yield tracking — designed for companies, funds, and DAOs.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd fortis

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — Auth, Database, Edge Functions, Realtime
- **Blockchain:** Solana Devnet — Anchor PDA Vaults, SPL USDC
- **Compliance:** Civic Pass (KYC), TRM Labs (AML), Notabene (Travel Rule), On-chain PDA (SoF)
- **Oracle:** Pyth Network for real-time price feeds
- **Reports:** jsPDF for FINMA-compliant PDF generation

## 📁 Project Structure

```
src/
├── contexts/           # Auth, Wallet, Compliance, Theme state
├── components/
│   ├── dashboard/      # All dashboard panels (Vaults, Deposit, Yield, etc.)
│   └── ui/             # shadcn/ui component library
├── pages/              # Route pages (Index, Login, Dashboard)
├── lib/                # Utilities and report generation
└── integrations/       # Supabase client (auto-configured)

supabase/functions/     # Edge functions (compliance verification)
```

## 🔐 Features

- **Multi-Auth:** Email, Google, or Solana Wallet sign-in
- **4-Layer Compliance:** KYC → AML → Travel Rule → Source of Funds verification pipeline
- **PDA Vaults:** Create, deposit, withdraw with on-chain Solana program
- **Action Gating:** Financial operations locked until wallet + compliance verified
- **Real-time Dashboard:** Overview, transactions, yield metrics, compliance status
- **PDF Reports:** FINMA-aligned compliance and financial reporting
- **Dark/Light Mode:** Full theme support across all panels
- **Mobile Responsive:** Optimized for all screen sizes

## 📖 Development Guide

See **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** for the full task breakdown, teammate assignments, integration points, and timeline.

## 🧪 Testing

```bash
npm run test          # Run unit tests
npm run test:watch    # Watch mode
```

## 📦 Deployment

Frontend deploys via Lovable. Backend (edge functions, database) deploys automatically.

## 📄 License

Built for StableHacks 2026.
