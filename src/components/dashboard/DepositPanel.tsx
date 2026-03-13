import { useState } from "react";
import { ArrowDownToLine, Info, CheckCircle2, Lock, Wallet, Shield, ChevronDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance } from "@/contexts/ComplianceContext";
import WalletConnectModal from "./WalletConnectModal";
import { toast } from "sonner";

const vaultOptions = [
  { id: "v1", name: "Treasury Reserve", apy: 6.8, minDeposit: 10000, lockDays: 30 },
  { id: "v2", name: "Yield Pool Alpha", apy: 9.4, minDeposit: 25000, lockDays: 60 },
  { id: "v3", name: "Fortis USDC Vault", apy: 8.2, minDeposit: 10000, lockDays: 30 },
];

const DepositPanel = () => {
  const { connected } = useWallet();
  const { isFullyCompliant } = useCompliance();
  const [amount, setAmount] = useState("");
  const [selectedVault, setSelectedVault] = useState(vaultOptions[2].id);
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const locked = !isFullyCompliant;
  const needsWallet = !connected;
  const vault = vaultOptions.find(v => v.id === selectedVault)!;

  const handleContinue = () => {
    if (!amount || parseFloat(amount) < vault.minDeposit) {
      toast.error(`Minimum deposit is $${vault.minDeposit.toLocaleString()} USDC`);
      return;
    }
    setStep("review");
  };

  const handleConfirm = () => {
    setStep("done");
    toast.success(`Deposited $${parseFloat(amount).toLocaleString()} USDC into ${vault.name}`);
  };

  const handleReset = () => {
    setStep("form");
    setAmount("");
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Deposit</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Deposit USDC into your permissioned vault</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["Select Vault", "Enter Amount", "Review & Confirm"].map((label, i) => {
          const active = i === (step === "form" ? 0 : step === "review" ? 2 : 2);
          const completed = step === "done" || (step === "review" && i < 2) || (step === "form" && i < 0);
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-sans font-bold shrink-0 ${
                step === "done" ? "bg-primary text-primary-foreground" :
                i <= (step === "review" ? 2 : 1) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step === "done" ? "✓" : i + 1}
              </div>
              <span className="text-xs font-sans text-muted-foreground hidden sm:inline">{label}</span>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {step === "form" && (
        <>
          {/* Vault Selection */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans font-semibold">Select Vault</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedVault} onValueChange={setSelectedVault}>
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vaultOptions.map(v => (
                    <SelectItem key={v.id} value={v.id} className="font-sans">
                      <div className="flex items-center gap-2">
                        <span>{v.name}</span>
                        <span className="text-primary text-xs font-medium">{v.apy}% APY</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "APY", value: `${vault.apy}%`, icon: TrendingUp, highlight: true },
                  { label: "Min Deposit", value: `$${vault.minDeposit.toLocaleString()}`, icon: ArrowDownToLine },
                  { label: "Lock Period", value: `${vault.lockDays} days`, icon: Lock },
                  { label: "Compliance", value: "KYC + AML", icon: Shield },
                ].map(item => (
                  <div key={item.label} className="rounded-lg bg-muted p-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <item.icon size={12} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className={`text-sm font-sans font-bold ${item.highlight ? "text-primary" : "text-foreground"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
                <ArrowDownToLine size={16} className="text-primary" />
                Deposit Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">Amount (USDC)</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={vault.minDeposit.toLocaleString()}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="font-sans text-lg pr-16"
                    min={vault.minDeposit}
                    disabled={needsWallet}
                  />
                  <button
                    onClick={() => setAmount("250000")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-sans font-medium hover:underline"
                    disabled={needsWallet}
                  >
                    MAX
                  </button>
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-xs text-muted-foreground font-sans mt-2">
                    Est. weekly yield: <span className="text-primary font-medium">${((parseFloat(amount) * vault.apy / 100) / 52).toFixed(2)}</span>
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted p-3 flex items-start gap-2">
                <Info size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground font-sans">
                  Deposits are subject to compliance verification. KYC, AML screening, and Travel Rule checks are enforced before funds enter the vault.
                </p>
              </div>

              {needsWallet ? (
                <>
                  <Button onClick={() => setWalletModalOpen(true)} className="w-full rounded-lg font-sans font-semibold gap-2" size="lg">
                    <Wallet size={16} />
                    Connect Wallet to Deposit
                  </Button>
                  <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
                </>
              ) : locked ? (
                <Button disabled className="w-full rounded-lg font-sans font-semibold gap-2" size="lg">
                  <Lock size={16} />
                  Complete Compliance to Deposit
                </Button>
              ) : (
                <Button onClick={handleContinue} className="w-full rounded-lg font-sans font-semibold gap-2" size="lg" disabled={!amount || parseFloat(amount) <= 0}>
                  <ArrowDownToLine size={16} />
                  Review Deposit
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {step === "review" && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-sans font-semibold">Review Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-5 text-center">
              <p className="text-3xl font-bold font-sans text-foreground">${parseFloat(amount).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground font-sans mt-1">USDC → {vault.name}</p>
            </div>
            <div className="rounded-lg border border-border divide-y divide-border">
              {[
                { label: "Vault", value: vault.name },
                { label: "APY", value: `${vault.apy}%` },
                { label: "Lock Period", value: `${vault.lockDays} days` },
                { label: "Network Fee", value: "~0.00025 SOL" },
                { label: "Compliance", value: "✓ All checks passed" },
                { label: "Est. Weekly Yield", value: `$${((parseFloat(amount) * vault.apy / 100) / 52).toFixed(2)}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between px-4 py-2.5 text-xs font-sans">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1 font-sans text-sm">Back</Button>
              <Button onClick={handleConfirm} className="flex-1 font-sans text-sm gap-1.5">
                <Shield size={14} />
                Confirm Deposit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground">Deposit Submitted</h2>
            <p className="text-sm text-muted-foreground font-sans">
              ${parseFloat(amount).toLocaleString()} USDC has been deposited into {vault.name}. Compliance checks passed.
            </p>
            <div className="rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground">
              Tx: {Math.random().toString(36).substring(2, 8)}...{Math.random().toString(36).substring(2, 6)}
            </div>
            <Button onClick={handleReset} variant="outline" className="font-sans text-sm">Make Another Deposit</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DepositPanel;
