# 🏛️ Fortis — Demo Walkthrough

> **Institutional-grade stablecoin treasury management on Solana.**
> This guide walks judges through every feature of the Fortis dashboard.

---

## 🔐 1. Authentication

1. Visit the app → you land on the **marketing homepage**.
2. Click **Launch App** or navigate to `/login`.
3. Sign in with **Email/Password** or **Google OAuth**.
4. You're redirected to the **Dashboard** (dark theme by default).

---

## 🏠 2. Dashboard Overview

| Element | What it shows |
|---------|---------------|
| **Total Balance** | Aggregated USDC across all vaults |
| **Active Vaults** | Number of vaults under management |
| **Monthly Yield** | Earnings this period |
| **Compliance Status** | Progress bar + per-step status (KYC, AML, Accreditation, Travel Rule) |
| **Recent Activity** | Last 4 transactions with status badges |

> 💡 **Wallet prompt**: If no Solana wallet is connected, the overview shows a "Connect Wallet" CTA. Email/Google users can still browse but need a wallet for on-chain operations.

---

## 💼 3. Wallet Connection

- Click **Connect Wallet** in the sidebar or any panel prompt.
- Supports **Phantom**, **Solflare**, and **Backpack**.
- Connected state shows the truncated address + Devnet indicator.
- Wallet users can optionally **link a Google account** for recovery.

---

## 🏦 4. Vaults (Core Feature)

### Creating a Vault
1. Click **New Vault** → modal opens.
2. Enter a **vault name** (e.g. "Treasury Reserve").
3. Choose a **strategy tag**:
   - **Conservative** — 90-day lock, $50k min, 4-6% APY
   - **Growth** — 30-day lock, $10k min, 7-10% APY
   - **Custom** — You set lock period + minimum deposit
4. Review parameters → **Create Vault**.

### Managing Vaults
- **Rename** — Click the ✏️ edit icon on any vault card → type new name → confirm.
- **Delete** — Click the 🗑️ trash icon → confirmation dialog → vault removed.
- **Deposit** — Multi-step flow: Enter amount → Review fees & lock period → Confirm.
- **Withdraw** — Multi-step flow: Enter amount (up to available balance) → Review → Confirm.

### Activity Timeline
Each vault card has a **View Activity** button that opens a timeline showing:
- Vault creation
- All deposits with amounts and timestamps
- All withdrawals with amounts and timestamps
- Strategy changes

---

## 🔄 5. Transactions

- **Search** by hash, amount, or type (real-time filtering).
- **Filter** by type: Deposit, Withdrawal, Yield (toggle chips).
- **Click any row** → detail modal with:
  - Full transaction hash (copyable)
  - Block number, confirmations, fees
  - Sender/receiver addresses
  - Link to **Solana Explorer** (Devnet)

---

## ✅ 6. Compliance

Four verification pillars, each with its own status:

| Pillar | Provider | What it checks |
|--------|----------|----------------|
| **KYC** | Civic | Identity verification |
| **AML Screening** | TRM Labs | Wallet risk scoring |
| **Accreditation** | Internal | Institutional investor status |
| **Travel Rule** | Notabene | Cross-border transfer compliance |

- Each pillar shows **Verified ✓**, **Pending ◷**, or **Not Started ○**.
- All 4 must be verified to unlock vault operations (deposit/withdraw).
- A **banner** at the top of every page reminds users of pending compliance.

---

## 💰 7. Deposit Page

- Standalone deposit flow (separate from vault-specific deposits).
- Select a **target vault** from the dropdown.
- Enter USDC amount → see **weekly yield estimate** in real-time.
- Multi-step: **Amount → Review → Confirm**.
- Gated behind wallet connection + full compliance.

---

## 📈 8. Yield

- **APY Performance Chart** (Recharts area chart).
- Time range filters: **1M / 3M / 6M / 1Y**.
- Shows historical yield data for all vaults.
- Current APY and total earned displayed prominently.

---

## 📊 9. Reports

- **Existing reports** listed with date, type, and status.
- **Preview** button → opens in-app modal with report summary (no download).
- **Download** button → generates and downloads PDF.
- **Generate New** → configuration dialog:
  - Select report type (Monthly, Quarterly, Annual, Custom).
  - Choose date range.
  - Generates report → auto-appears in the list.

---

## ⚙️ 10. Settings

- **Organization Profile**: Name, email, organization type.
- **Theme Toggle**: Switch between **Dark** (default) and **Light** mode.
- **Notification Preferences**: Toggle email alerts for deposits, withdrawals, compliance, and reports.
- **Security**: Password change, 2FA placeholder.

---

## 🎨 11. Design & UX

- **Dark theme** is the official/default — institutional, gold-on-dark branding.
- **Light theme** available via Settings for accessibility.
- **Responsive** — full mobile support with slide-out sidebar.
- **Monogram seal logo** — gold on dark, used across favicon, sidebar, and branding assets.
- **Themed modals** — all dialogs correctly inherit the active theme.

---

## 🏗️ Architecture

```
React + Vite + TypeScript + Tailwind CSS
├── Supabase (Auth, Edge Functions, Database)
├── Solana Devnet (Anchor Programs, PDA Vaults)
├── Compliance Providers (Civic, TRM Labs, Notabene)
└── Pyth Oracle (Yield/Price Data)
```

---

## 🚀 Quick Test Flow for Judges

1. **Login** → email or Google
2. **Connect wallet** (Phantom recommended)
3. **Create a vault** → try "Custom" strategy with 7-day lock
4. **Deposit** USDC into the vault
5. **Check Transactions** → search by amount, filter by type, click to view details
6. **Generate a report** → preview it, then download
7. **Switch to light theme** in Settings → verify modals work correctly
8. **Switch back to dark** → the institutional default

---

*Built for the Solana ecosystem. Fortis v0.1.0 — Devnet.*
