import { TrendingUp, Shield, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";

const stats = [
  { label: "Total Deposited", value: "$250,000.00", change: "+2.4%", icon: DollarSign },
  { label: "Current APY", value: "8.2%", change: "+0.3%", icon: TrendingUp },
  { label: "Yield Earned", value: "$4,109.58", change: "+$312.40", icon: TrendingUp },
  { label: "Next Payout", value: "2d 14h", change: "Mar 14", icon: Clock },
];

const OverviewPanel = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Shield size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">Connect your wallet</h2>
          <p className="text-sm text-muted-foreground max-w-sm font-sans">
            Connect a Solana wallet to access your institutional vault dashboard.
          </p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">{stat.label}</span>
                <stat.icon size={14} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold font-sans text-foreground">{stat.value}</p>
              <p className="text-xs text-primary font-sans mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Status Quick View */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-sans">
              ✓ KYC Verified
            </Badge>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-sans">
              ✓ AML Clear
            </Badge>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-sans">
              ✓ Travel Rule
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-sans">
              ✓ Source of Funds
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Deposit", amount: "+$50,000 USDC", time: "2 hours ago", status: "Completed" },
              { action: "Yield Payout", amount: "+$312.40 USDC", time: "1 day ago", status: "Completed" },
              { action: "KYC Renewal", amount: "—", time: "3 days ago", status: "Verified" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-sans font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground font-sans">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-sans font-medium text-foreground">{item.amount}</p>
                  <p className="text-xs text-green-400 font-sans">{item.status}</p>
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
