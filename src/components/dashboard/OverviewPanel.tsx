import { useState, useEffect } from "react";
import { TrendingUp, Shield, DollarSign, Clock, Activity, CheckCircle2, Circle, Loader2, AlertTriangle, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance, ComplianceStatus } from "@/contexts/ComplianceContext";
import WalletConnectModal from "./WalletConnectModal";
import { getProgram } from "@/lib/solana";
import { useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";


const statusIcons: Record<ComplianceStatus, typeof CheckCircle2> = {
  pending: Circle,
  in_progress: Loader2,
  verified: CheckCircle2,
  failed: AlertTriangle,
  expired: Clock,
};

const OverviewPanel = () => {
  const { connected, wallet } = useWallet();
  const { connection } = useConnection();
  const { steps, completedCount, totalCount } = useCompliance();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const provider = connected && wallet
    ? new anchor.AnchorProvider(connection, wallet.adapter as any, { preflightCommitment: "processed" })
    : null;

  useEffect(() => {
    const fetchAggregates = async () => {
      if (!provider) {
        setTotalDeposited(0);
        setLoadingStats(false);
        return;
      }
      try {
        setLoadingStats(true);
        const program = getProgram(provider);
        const vaults = await program.account.vaultState.all();

        const total = vaults.reduce((sum, v) => sum + (v.account.totalAum.toNumber() / 1e6), 0);
        setTotalDeposited(total);
      } catch (err) {
        console.error("Failed to fetch vaults for overview:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchRecentTransactions = async () => {
      setLoadingTransactions(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentTransactions(data);
      }
      setLoadingTransactions(false);
    };

    fetchAggregates();
    fetchRecentTransactions();

    const channel = supabase
      .channel('overview-tx-sync')
      .on('postgres_changes', { event: 'INSERT', table: 'transactions' }, () => {
        fetchRecentTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connected, wallet]);

  const dynamicStats = [
    { label: "Total Instituional TVL", value: loadingStats ? "..." : `$${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: "Live", icon: DollarSign },
    { label: "Current APY", value: "8.2%", change: "Avg Weighted", icon: TrendingUp },
    { label: "Yield Earned", value: "$0.00", change: "Awaiting Distribution", icon: TrendingUp },
    { label: "Next Payout", value: "2d 14h", change: "Next Epoch", icon: Clock },
  ];

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Shield size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">Connect your wallet</h2>
          <p className="text-sm text-muted-foreground max-w-sm font-sans">
            Connect a Solana wallet to access your institutional vault dashboard.
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Your institutional vault overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {dynamicStats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase tracking-wider">{stat.label}</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon size={14} className="text-primary" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold font-sans text-foreground">{stat.value}</p>
              <p className="text-xs text-primary font-sans font-medium mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Status Quick View */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Compliance Status
            <span className="text-xs font-normal text-muted-foreground ml-auto">{completedCount}/{totalCount}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => {
              const Icon = statusIcons[step.status];
              return (
                <span
                  key={step.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-sans font-medium ring-1 ring-inset ${step.status === "verified"
                    ? "bg-primary/10 text-primary ring-primary/20"
                    : step.status === "in_progress"
                      ? "bg-muted text-muted-foreground ring-border"
                      : step.status === "failed"
                        ? "bg-destructive/10 text-destructive ring-destructive/20"
                        : "bg-muted text-muted-foreground ring-border"
                    }`}
                >
                  <Icon size={10} className={step.status === "in_progress" ? "animate-spin" : ""} />
                  {step.title.split("—")[0].trim()}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Activity size={16} className="text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingTransactions ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-xs font-sans">Loading activity...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="space-y-4 text-center py-12">
              <Activity size={24} className="text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-sm font-sans text-muted-foreground">No recent activity detected.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-sans font-medium text-foreground capitalize">{tx.type}</p>
                      <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">{format(new Date(tx.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-sans font-bold ${tx.type === 'withdrawal' ? 'text-red-500' : 'text-foreground'}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">{tx.tx_signature?.slice(0, 8)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewPanel;
