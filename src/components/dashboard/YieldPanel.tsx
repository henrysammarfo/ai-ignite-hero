import { TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";

const yieldHistory = [
  { date: "Mar 10, 2026", amount: "$312.40", apy: "8.2%", source: "Marinade SOL Staking" },
  { date: "Mar 3, 2026", amount: "$298.15", apy: "7.9%", source: "Marinade SOL Staking" },
  { date: "Feb 24, 2026", amount: "$305.60", apy: "8.1%", source: "Marinade SOL Staking" },
  { date: "Feb 17, 2026", amount: "$289.92", apy: "7.7%", source: "Marinade SOL Staking" },
  { date: "Feb 10, 2026", amount: "$310.20", apy: "8.3%", source: "Marinade SOL Staking" },
];

const YieldPanel = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground font-sans">Connect wallet to view yield data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Yield</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Track your vault earnings and APY performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2">Total Earned</p>
            <p className="text-2xl font-bold font-sans text-foreground">$4,109.58</p>
            <p className="text-xs text-primary font-sans mt-1">Lifetime</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2">Current APY</p>
            <p className="text-2xl font-bold font-sans text-primary">8.2%</p>
            <p className="text-xs text-muted-foreground font-sans mt-1">Pyth oracle feed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2">Next Payout</p>
            <p className="text-2xl font-bold font-sans text-foreground">~$315</p>
            <p className="text-xs text-muted-foreground font-sans mt-1">in 2d 14h</p>
          </CardContent>
        </Card>
      </div>

      {/* Yield History */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-4 text-xs text-muted-foreground font-sans uppercase tracking-wider py-2 border-b border-border/30">
              <span>Date</span>
              <span>Amount</span>
              <span>APY</span>
              <span>Source</span>
            </div>
            {yieldHistory.map((row, i) => (
              <div key={i} className="grid grid-cols-4 text-sm font-sans py-3 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground">{row.date}</span>
                <span className="text-foreground font-medium">{row.amount}</span>
                <span className="text-primary">{row.apy}</span>
                <span className="text-muted-foreground text-xs">{row.source}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YieldPanel;
