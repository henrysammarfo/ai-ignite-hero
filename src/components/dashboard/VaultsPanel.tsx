import { useState } from "react";
import { Plus, Wallet, Tag, ArrowUpFromLine, ArrowDownToLine, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

const defaultVaults: Vault[] = [
  { id: "v1", name: "Treasury Reserve", tag: "conservative", balance: 150000, apy: 6.8, createdAt: "2026-02-15" },
  { id: "v2", name: "Yield Pool Alpha", tag: "growth", balance: 100000, apy: 9.4, createdAt: "2026-03-01" },
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
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("conservative");
  const [withdrawVaultId, setWithdrawVaultId] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositVaultId, setDepositVaultId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);

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
  const locked = !isFullyCompliant;

  const handleCreateVault = () => {
    if (!newName.trim()) return;
    const vault: Vault = {
      id: `v${Date.now()}`,
      name: newName,
      tag: newTag,
      balance: 0,
      apy: parseFloat((5 + Math.random() * 5).toFixed(1)),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setVaults([...vaults, vault]);
    setNewName("");
    setShowCreate(false);
    toast.success(`Vault "${vault.name}" created`);
  };

  const handleWithdraw = (vaultId: string) => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;
    setVaults(vaults.map(v =>
      v.id === vaultId ? { ...v, balance: Math.max(0, v.balance - amt) } : v
    ));
    toast.success(`Withdrew $${amt.toLocaleString()} USDC — compliance checks passed`);
    setWithdrawVaultId(null);
    setWithdrawAmount("");
  };

  const handleDeposit = (vaultId: string) => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    setVaults(vaults.map(v =>
      v.id === vaultId ? { ...v, balance: v.balance + amt } : v
    ));
    toast.success(`Deposited $${amt.toLocaleString()} USDC into vault`);
    setDepositVaultId(null);
    setDepositAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Vaults</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Manage your permissioned USDC vaults
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 font-sans text-xs shrink-0"
          onClick={() => setShowCreate(!showCreate)}
          disabled={locked}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Vault</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {locked && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm font-sans text-foreground font-medium">🔒 Vault operations locked</p>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Complete all 4 compliance checks to create vaults, deposit, and withdraw.
          </p>
        </div>
      )}

      {/* Total stats */}
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

      {/* Create vault form */}
      {showCreate && !locked && (
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-sans font-semibold text-foreground">Create New Vault</h3>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Vault Name</label>
              <Input
                placeholder="e.g. Treasury Reserve"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Strategy Tag</label>
              <div className="flex gap-2 flex-wrap">
                {["conservative", "growth", "custom"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setNewTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium capitalize transition-all ${
                      newTag === tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateVault} className="font-sans text-sm" size="sm">Create Vault</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="font-sans text-sm" size="sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vault list */}
      <div className="space-y-3">
        {vaults.map(vault => (
          <Card key={vault.id} className="shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                {/* Vault header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Wallet size={14} className="text-primary shrink-0" />
                  <h3 className="text-sm font-sans font-semibold text-foreground truncate">{vault.name}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-sans font-medium capitalize ${tagColors[vault.tag] || tagColors.custom}`}>
                    <Tag size={8} />
                    {vault.tag}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-sans">Balance</p>
                    <p className="text-lg font-bold font-sans text-foreground">${vault.balance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-sans">APY</p>
                    <p className="text-lg font-bold font-sans text-primary flex items-center gap-1">
                      <TrendingUp size={14} />
                      {vault.apy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-sans">Created</p>
                    <p className="text-sm font-sans text-foreground">{vault.createdAt}</p>
                  </div>
                </div>

                {/* Action buttons - stack on mobile */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 font-sans text-xs flex-1 sm:flex-none"
                    disabled={locked}
                    onClick={() => {
                      setDepositVaultId(depositVaultId === vault.id ? null : vault.id);
                      setWithdrawVaultId(null);
                    }}
                  >
                    <ArrowDownToLine size={12} />
                    Deposit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 font-sans text-xs flex-1 sm:flex-none"
                    disabled={locked || vault.balance <= 0}
                    onClick={() => {
                      setWithdrawVaultId(withdrawVaultId === vault.id ? null : vault.id);
                      setDepositVaultId(null);
                    }}
                  >
                    <ArrowUpFromLine size={12} />
                    Withdraw
                  </Button>
                </div>
              </div>

              {/* Deposit inline form */}
              {depositVaultId === vault.id && !locked && (
                <div className="mt-4 pt-4 border-t border-border space-y-3 sm:space-y-0 sm:flex sm:items-end sm:gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1 block">Deposit USDC</label>
                    <Input
                      type="number"
                      placeholder="50,000"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="font-sans"
                      min="1"
                    />
                  </div>
                  <Button size="sm" className="font-sans text-xs w-full sm:w-auto" onClick={() => handleDeposit(vault.id)}>
                    Confirm Deposit
                  </Button>
                </div>
              )}

              {/* Withdraw inline form */}
              {withdrawVaultId === vault.id && !locked && (
                <div className="mt-4 pt-4 border-t border-border space-y-3 sm:space-y-0 sm:flex sm:items-end sm:gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1 block">Withdraw USDC</label>
                    <Input
                      type="number"
                      placeholder="10,000"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      className="font-sans"
                      min="1"
                      max={vault.balance.toString()}
                    />
                    <p className="text-[10px] text-muted-foreground font-sans mt-1">Available: ${vault.balance.toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="destructive" className="font-sans text-xs w-full sm:w-auto" onClick={() => handleWithdraw(vault.id)}>
                    Confirm Withdrawal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VaultsPanel;
