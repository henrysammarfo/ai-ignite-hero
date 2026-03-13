import { useState } from "react";
import { Plus, Wallet, Tag, ArrowUpFromLine, ArrowDownToLine, TrendingUp, Shield, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedDialogContent, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ThemedDialog";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance } from "@/contexts/ComplianceContext";
import { toast } from "sonner";
import WalletConnectModal from "./WalletConnectModal";

interface Vault {
  id: string;
  name: string;
  tag: string;
  balance: number;
  apy: number;
  createdAt: string;
  lockDays: number;
  minDeposit: number;
}

const strategyDefaults: Record<string, { lockDays: number; minDeposit: number; apyRange: string }> = {
  conservative: { lockDays: 90, minDeposit: 50000, apyRange: "4-6%" },
  growth: { lockDays: 30, minDeposit: 10000, apyRange: "7-10%" },
  custom: { lockDays: 30, minDeposit: 1000, apyRange: "Variable" },
};

const defaultVaults: Vault[] = [
  { id: "v1", name: "Treasury Reserve", tag: "conservative", balance: 150000, apy: 6.8, createdAt: "2026-02-15", lockDays: 90, minDeposit: 50000 },
  { id: "v2", name: "Yield Pool Alpha", tag: "growth", balance: 100000, apy: 9.4, createdAt: "2026-03-01", lockDays: 30, minDeposit: 10000 },
];

const tagColors: Record<string, string> = {
  conservative: "bg-primary/10 text-primary",
  growth: "bg-accent/10 text-accent",
  custom: "bg-muted text-muted-foreground",
};

const VaultsPanel = () => {
  const { connected } = useWallet();
  const { isFullyCompliant } = useCompliance();
  const [vaults, setVaults] = useState<Vault[]>(defaultVaults);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Create vault modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("conservative");
  const [customLockDays, setCustomLockDays] = useState("30");
  const [customMinDeposit, setCustomMinDeposit] = useState("1000");

  // Deposit modal
  const [depositVault, setDepositVault] = useState<Vault | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStep, setDepositStep] = useState<"form" | "confirm" | "done">("form");

  // Withdraw modal
  const [withdrawVault, setWithdrawVault] = useState<Vault | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawStep, setWithdrawStep] = useState<"form" | "confirm" | "done">("form");

  const locked = !isFullyCompliant;

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Wallet size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">Connect your wallet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto font-sans">
            Connect a Solana wallet to create and manage your institutional vaults.
          </p>
          <Button onClick={() => setWalletModalOpen(true)} className="gap-2 font-sans">
            <Wallet size={14} />
            Connect Wallet
          </Button>
          <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
        </div>
      </div>
    );
  }

  const totalBalance = vaults.reduce((sum, v) => sum + v.balance, 0);

  const handleCreateVault = () => {
    if (!newName.trim()) return;
    const defaults = strategyDefaults[newTag] || strategyDefaults.custom;
    const lockDays = newTag === "custom" ? parseInt(customLockDays) || 30 : defaults.lockDays;
    const minDeposit = newTag === "custom" ? parseInt(customMinDeposit) || 1000 : defaults.minDeposit;
    const vault: Vault = {
      id: `v${Date.now()}`,
      name: newName,
      tag: newTag,
      balance: 0,
      apy: parseFloat((5 + Math.random() * 5).toFixed(1)),
      createdAt: new Date().toISOString().split("T")[0],
      lockDays,
      minDeposit,
    };
    setVaults([...vaults, vault]);
    setNewName("");
    setNewTag("conservative");
    setCustomLockDays("30");
    setCustomMinDeposit("1000");
    setShowCreate(false);
    toast.success(`Vault "${vault.name}" created`);
  };

  const handleDeposit = () => {
    if (!depositVault) return;
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    setDepositStep("confirm");
  };

  const confirmDeposit = () => {
    if (!depositVault) return;
    const amt = parseFloat(depositAmount);
    setVaults(vaults.map(v =>
      v.id === depositVault.id ? { ...v, balance: v.balance + amt } : v
    ));
    setDepositStep("done");
    toast.success(`Deposited $${amt.toLocaleString()} USDC into ${depositVault.name}`);
  };

  const handleWithdraw = () => {
    if (!withdrawVault) return;
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || amt > withdrawVault.balance) return;
    setWithdrawStep("confirm");
  };

  const confirmWithdraw = () => {
    if (!withdrawVault) return;
    const amt = parseFloat(withdrawAmount);
    setVaults(vaults.map(v =>
      v.id === withdrawVault.id ? { ...v, balance: Math.max(0, v.balance - amt) } : v
    ));
    setWithdrawStep("done");
    toast.success(`Withdrew $${amt.toLocaleString()} USDC from ${withdrawVault.name}`);
  };

  const closeDeposit = () => { setDepositVault(null); setDepositAmount(""); setDepositStep("form"); };
  const closeWithdraw = () => { setWithdrawVault(null); setWithdrawAmount(""); setWithdrawStep("form"); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Vaults</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">Manage your permissioned USDC vaults</p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 font-sans text-xs shrink-0"
          onClick={() => setShowCreate(true)}
          disabled={locked}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Vault</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {locked && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
          <Shield size={16} className="text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-sans text-foreground font-medium">Vault operations locked</p>
            <p className="text-xs text-muted-foreground font-sans mt-1">
              Complete all 4 compliance checks to create vaults, deposit, and withdraw.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase tracking-wider">Balance</p>
            <p className="text-base sm:text-xl font-bold font-sans text-foreground mt-1">${totalBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase tracking-wider">Vaults</p>
            <p className="text-base sm:text-xl font-bold font-sans text-foreground mt-1">{vaults.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase tracking-wider">Avg APY</p>
            <p className="text-base sm:text-xl font-bold font-sans text-primary mt-1">
              {vaults.length ? (vaults.reduce((s, v) => s + v.apy, 0) / vaults.length).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vault list */}
      <div className="space-y-3">
        {vaults.map(vault => (
          <Card key={vault.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-sans font-semibold text-foreground truncate">{vault.name}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-sans font-medium capitalize ${tagColors[vault.tag] || tagColors.custom}`}>
                    <Tag size={8} />
                    {vault.tag}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">Balance</p>
                    <p className="text-lg font-bold font-sans text-foreground">${vault.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">APY</p>
                    <p className="text-lg font-bold font-sans text-primary flex items-center gap-1">
                      <TrendingUp size={14} />
                      {vault.apy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">Created</p>
                    <p className="text-sm font-sans text-foreground flex items-center gap-1">
                      <Clock size={12} className="text-muted-foreground" />
                      {vault.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="gap-1.5 font-sans text-xs flex-1 sm:flex-none"
                    disabled={locked}
                    onClick={() => { setDepositVault(vault); setDepositAmount(""); setDepositStep("form"); }}
                  >
                    <ArrowDownToLine size={12} />
                    Deposit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 font-sans text-xs flex-1 sm:flex-none"
                    disabled={locked || vault.balance <= 0}
                    onClick={() => { setWithdrawVault(vault); setWithdrawAmount(""); setWithdrawStep("form"); }}
                  >
                    <ArrowUpFromLine size={12} />
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Vault Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <ThemedDialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Create New Vault</DialogTitle>
            <DialogDescription className="font-sans text-sm">
              Set up a new permissioned USDC vault with your preferred strategy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Vault Name</label>
              <Input placeholder="e.g. Treasury Reserve" value={newName} onChange={e => setNewName(e.target.value)} className="font-sans" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Strategy Tag</label>
              <div className="flex gap-2 flex-wrap">
                {["conservative", "growth", "custom"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setNewTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium capitalize transition-all ${
                      newTag === tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom strategy inputs */}
            {newTag === "custom" && (
              <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-sans font-semibold text-primary uppercase tracking-wider">Custom Parameters</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">Lock Period (days)</label>
                    <Input type="number" value={customLockDays} onChange={e => setCustomLockDays(e.target.value)} className="font-sans text-sm" min="1" max="365" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">Min Deposit (USDC)</label>
                    <Input type="number" value={customMinDeposit} onChange={e => setCustomMinDeposit(e.target.value)} className="font-sans text-sm" min="100" />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-muted p-3 space-y-1.5">
              <p className="text-xs font-sans font-medium text-foreground">Vault Parameters</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans text-muted-foreground">
                <span>Min Deposit:</span>
                <span className="text-foreground">
                  ${newTag === "custom" ? parseInt(customMinDeposit || "1000").toLocaleString() : strategyDefaults[newTag]?.minDeposit.toLocaleString()} USDC
                </span>
                <span>Lock Period:</span>
                <span className="text-foreground">
                  {newTag === "custom" ? (customLockDays || "30") : strategyDefaults[newTag]?.lockDays} days
                </span>
                <span>Compliance:</span><span className="text-foreground">KYC + AML Required</span>
                <span>Est. APY:</span><span className="text-primary font-medium">{strategyDefaults[newTag]?.apyRange || "Variable"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="font-sans text-sm">Cancel</Button>
            <Button onClick={handleCreateVault} disabled={!newName.trim()} className="font-sans text-sm">Create Vault</Button>
          </DialogFooter>
        </ThemedDialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={!!depositVault} onOpenChange={(open) => !open && closeDeposit()}>
        <ThemedDialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {depositStep === "done" ? "Deposit Complete" : `Deposit to ${depositVault?.name}`}
            </DialogTitle>
          </DialogHeader>
          {depositVault && depositStep === "form" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted-foreground">Vault</span>
                  <span className="text-foreground font-medium">{depositVault.name}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className="text-foreground font-medium">${depositVault.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted-foreground">APY</span>
                  <span className="text-primary font-medium">{depositVault.apy}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Amount (USDC)</label>
                <div className="relative">
                  <Input type="number" placeholder="50,000" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="font-sans text-lg pr-16" min="1" />
                  <button onClick={() => setDepositAmount("250000")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-sans font-medium hover:underline">MAX</button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeDeposit} className="font-sans text-sm">Cancel</Button>
                <Button onClick={handleDeposit} disabled={!depositAmount || parseFloat(depositAmount) <= 0} className="font-sans text-sm gap-1.5">
                  <ArrowDownToLine size={14} />
                  Continue
                </Button>
              </DialogFooter>
            </div>
          )}
          {depositVault && depositStep === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center space-y-2">
                <p className="text-2xl font-bold font-sans text-foreground">${parseFloat(depositAmount).toLocaleString()} USDC</p>
                <p className="text-xs text-muted-foreground font-sans">→ {depositVault.name}</p>
              </div>
              <div className="rounded-lg border border-border divide-y divide-border">
                <div className="flex justify-between px-4 py-2 text-xs font-sans">
                  <span className="text-muted-foreground">Network Fee</span><span className="text-foreground">~0.00025 SOL</span>
                </div>
                <div className="flex justify-between px-4 py-2 text-xs font-sans">
                  <span className="text-muted-foreground">Compliance</span><span className="text-primary">✓ Verified</span>
                </div>
                <div className="flex justify-between px-4 py-2 text-xs font-sans">
                  <span className="text-muted-foreground">Lock Period</span><span className="text-foreground">30 days</span>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs font-sans text-foreground">Deposits are subject to a 30-day lock period. Early withdrawal may incur penalties.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDepositStep("form")} className="font-sans text-sm">Back</Button>
                <Button onClick={confirmDeposit} className="font-sans text-sm gap-1.5">
                  <Shield size={14} />
                  Confirm Deposit
                </Button>
              </DialogFooter>
            </div>
          )}
          {depositStep === "done" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ArrowDownToLine size={24} className="text-primary" />
              </div>
              <p className="text-lg font-bold font-sans text-foreground">${parseFloat(depositAmount).toLocaleString()} USDC deposited</p>
              <p className="text-xs text-muted-foreground font-sans">Transaction submitted. Compliance checks passed.</p>
              <Button onClick={closeDeposit} className="font-sans text-sm">Done</Button>
            </div>
          )}
        </ThemedDialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={!!withdrawVault} onOpenChange={(open) => !open && closeWithdraw()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {withdrawStep === "done" ? "Withdrawal Complete" : `Withdraw from ${withdrawVault?.name}`}
            </DialogTitle>
          </DialogHeader>
          {withdrawVault && withdrawStep === "form" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="text-foreground font-medium">${withdrawVault.balance.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Amount (USDC)</label>
                <div className="relative">
                  <Input type="number" placeholder="10,000" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="font-sans text-lg pr-16" min="1" max={withdrawVault.balance.toString()} />
                  <button onClick={() => setWithdrawAmount(withdrawVault.balance.toString())} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary font-sans font-medium hover:underline">MAX</button>
                </div>
                <p className="text-[10px] text-muted-foreground font-sans">Available: ${withdrawVault.balance.toLocaleString()}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeWithdraw} className="font-sans text-sm">Cancel</Button>
                <Button variant="destructive" onClick={handleWithdraw} disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > withdrawVault.balance} className="font-sans text-sm gap-1.5">
                  <ArrowUpFromLine size={14} />
                  Continue
                </Button>
              </DialogFooter>
            </div>
          )}
          {withdrawVault && withdrawStep === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-destructive/5 p-4 text-center space-y-2">
                <p className="text-2xl font-bold font-sans text-foreground">${parseFloat(withdrawAmount).toLocaleString()} USDC</p>
                <p className="text-xs text-muted-foreground font-sans">← {withdrawVault.name}</p>
              </div>
              <div className="rounded-lg border border-border divide-y divide-border">
                <div className="flex justify-between px-4 py-2 text-xs font-sans">
                  <span className="text-muted-foreground">Network Fee</span><span className="text-foreground">~0.00025 SOL</span>
                </div>
                <div className="flex justify-between px-4 py-2 text-xs font-sans">
                  <span className="text-muted-foreground">Travel Rule</span><span className="text-primary">✓ Logged</span>
                </div>
                <div className="flex justify-between px-4 py-2 text-xs font-sans">
                  <span className="text-muted-foreground">Remaining Balance</span>
                  <span className="text-foreground">${(withdrawVault.balance - parseFloat(withdrawAmount)).toLocaleString()}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawStep("form")} className="font-sans text-sm">Back</Button>
                <Button variant="destructive" onClick={confirmWithdraw} className="font-sans text-sm gap-1.5">
                  <Shield size={14} />
                  Confirm Withdrawal
                </Button>
              </DialogFooter>
            </div>
          )}
          {withdrawStep === "done" && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ArrowUpFromLine size={24} className="text-primary" />
              </div>
              <p className="text-lg font-bold font-sans text-foreground">${parseFloat(withdrawAmount).toLocaleString()} USDC withdrawn</p>
              <p className="text-xs text-muted-foreground font-sans">Funds sent to your connected wallet.</p>
              <Button onClick={closeWithdraw} className="font-sans text-sm">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
};

export default VaultsPanel;
