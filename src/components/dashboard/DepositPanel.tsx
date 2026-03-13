import { useState } from "react";
import { ArrowDownToLine, Info, CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance } from "@/contexts/ComplianceContext";

const DepositPanel = () => {
  const { connected } = useWallet();
  const { isFullyCompliant } = useCompliance();
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const locked = !isFullyCompliant;

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Connect wallet to make deposits.</p>
      </div>
    );
  }

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Deposit</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Deposit USDC into your permissioned vault
        </p>
      </div>

      {/* Vault Info */}
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-3">
          {[
            { label: "Vault", value: "Fortis USDC Vault" },
            { label: "Current APY", value: "8.2%", highlight: true },
            { label: "Min Deposit", value: "$10,000 USDC" },
            { label: "Lock Period", value: "30 days" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">{row.label}</span>
              <span className={`text-sm font-sans font-medium ${row.highlight ? "text-primary font-bold" : "text-foreground"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deposit Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <ArrowDownToLine size={16} className="text-primary" />
            Deposit USDC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">
              Amount (USDC)
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="50,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-sans text-lg pr-16"
                min="10000"
              />
              <button
                onClick={() => setAmount("250000")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-sans font-medium hover:underline"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 flex items-start gap-2">
            <Info size={14} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground font-sans">
              Deposits are subject to compliance verification. KYC, AML screening, and Travel Rule checks are enforced before funds enter the vault.
            </p>
          </div>

          {submitted ? (
            <div className="flex items-center gap-2 text-green-600 justify-center py-3">
              <CheckCircle2 size={18} />
              <span className="text-sm font-sans font-medium">Deposit submitted — processing compliance checks</span>
            </div>
          ) : (
            <Button onClick={handleDeposit} className="w-full rounded-lg font-sans font-semibold" size="lg">
              Deposit {amount ? `$${parseFloat(amount).toLocaleString()} USDC` : "USDC"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositPanel;
