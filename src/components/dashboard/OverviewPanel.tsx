import { TrendingUp, Shield, DollarSign, Clock, Activity, CheckCircle2, Circle, Loader2, AlertTriangle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance, ComplianceStatus } from "@/contexts/ComplianceContext";
import WalletConnectModal from "./WalletConnectModal";
import { useState } from "react";

const stats = [
  { label: "Total Deposited", value: "$250,000.00", change: "+2.4%", icon: DollarSign },
  { label: "Current APY", value: "8.2%", change: "+0.3%", icon: TrendingUp },
  { label: "Yield Earned", value: "$4,109.58", change: "+$312.40", icon: TrendingUp },
  { label: "Next Payout", value: "2d 14h", change: "Mar 14", icon: Clock },
];

const statusIcons: Record<ComplianceStatus, typeof CheckCircle2> = {
  pending: Circle,
  in_progress: Loader2,
  verified: CheckCircle2,
  failed: AlertTriangle,
  expired: Clock,
};

const OverviewPanel = () => {
  const { connected } = useWallet();
  const { steps, completedCount, totalCount } = useCompliance();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

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
        {stats.map((stat) => (
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-sans font-medium ring-1 ring-inset ${
                    step.status === "verified"
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
        <CardContent>
          <div className="space-y-0">
            {[
              { action: "Deposit", amount: "+$50,000 USDC", time: "2 hours ago", status: "Completed" },
              { action: "Yield Payout", amount: "+$312.40 USDC", time: "1 day ago", status: "Completed" },
              { action: "KYC Renewal", amount: "—", time: "3 days ago", status: "Verified" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-sans font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground font-sans">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-sans font-medium text-foreground">{item.amount}</p>
                  <span className="text-xs text-primary font-sans font-medium">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewPanel;
