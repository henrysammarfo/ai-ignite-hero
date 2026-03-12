import { useState, useMemo } from "react";
import { TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useWallet } from "@/contexts/WalletContext";

const allApyData = [
  { week: "Mar 15", apy: 6.8 },
  { week: "Apr 1", apy: 7.0 },
  { week: "Apr 15", apy: 6.9 },
  { week: "May 1", apy: 7.2 },
  { week: "May 15", apy: 7.1 },
  { week: "Jun 1", apy: 7.4 },
  { week: "Jun 15", apy: 7.0 },
  { week: "Jul 1", apy: 7.3 },
  { week: "Jul 15", apy: 7.6 },
  { week: "Aug 1", apy: 7.2 },
  { week: "Aug 15", apy: 7.5 },
  { week: "Sep 1", apy: 7.8 },
  { week: "Sep 15", apy: 7.3 },
  { week: "Oct 1", apy: 7.1 },
  { week: "Oct 15", apy: 7.4 },
  { week: "Nov 1", apy: 7.6 },
  { week: "Nov 15", apy: 7.2 },
  { week: "Dec 1", apy: 7.0 },
  { week: "Dec 15", apy: 7.3 },
  { week: "Jan 6", apy: 7.4 },
  { week: "Jan 13", apy: 7.6 },
  { week: "Jan 20", apy: 7.8 },
  { week: "Jan 27", apy: 7.5 },
  { week: "Feb 3", apy: 7.9 },
  { week: "Feb 10", apy: 8.3 },
  { week: "Feb 17", apy: 7.7 },
  { week: "Feb 24", apy: 8.1 },
  { week: "Mar 3", apy: 7.9 },
  { week: "Mar 10", apy: 8.2 },
];

const timeRanges = [
  { label: "1M", points: 4 },
  { label: "3M", points: 10 },
  { label: "6M", points: 19 },
  { label: "1Y", points: 39 },
] as const;

type TimeRange = typeof timeRanges[number]["label"];

const chartConfig = {
  apy: {
    label: "APY %",
    color: "hsl(var(--primary))",
  },
};

const yieldHistory = [
  { date: "Mar 10, 2026", amount: "$312.40", apy: "8.2%", source: "Marinade SOL Staking" },
  { date: "Mar 3, 2026", amount: "$298.15", apy: "7.9%", source: "Marinade SOL Staking" },
  { date: "Feb 24, 2026", amount: "$305.60", apy: "8.1%", source: "Marinade SOL Staking" },
  { date: "Feb 17, 2026", amount: "$289.92", apy: "7.7%", source: "Marinade SOL Staking" },
  { date: "Feb 10, 2026", amount: "$310.20", apy: "8.3%", source: "Marinade SOL Staking" },
];

const YieldPanel = () => {
  const { connected } = useWallet();
  const [range, setRange] = useState<TimeRange>("3M");

  const chartData = useMemo(() => {
    const points = timeRanges.find((r) => r.label === range)!.points;
    return allApyData.slice(-points);
  }, [range]);
  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
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
        {[
          { label: "Total Earned", value: "$4,109.58", sub: "Lifetime", highlight: false },
          { label: "Current APY", value: "8.2%", sub: "Pyth oracle feed", highlight: true },
          { label: "Next Payout", value: "~$315", sub: "in 2d 14h", highlight: false },
        ].map((card) => (
          <Card key={card.label} className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2">{card.label}</p>
              <p className={`text-2xl font-bold font-sans ${card.highlight ? "text-primary" : "text-foreground"}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground font-sans mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* APY Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            APY Performance
          </CardTitle>
          <div className="flex gap-1">
            {timeRanges.map((r) => (
              <button
                key={r.label}
                onClick={() => setRange(r.label)}
                className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors ${
                  range === r.label
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <YAxis domain={[7, 9]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
              <Area type="monotone" dataKey="apy" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#apyGradient)" />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Yield History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Activity size={16} className="text-muted-foreground" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* Table header */}
            <div className="grid grid-cols-4 text-xs text-muted-foreground font-sans uppercase tracking-wider py-2 border-b border-border">
              <span>Date</span>
              <span>Amount</span>
              <span>APY</span>
              <span>Source</span>
            </div>
            {yieldHistory.map((row, i) => (
              <div key={i} className="grid grid-cols-4 text-sm font-sans py-3 border-b border-border last:border-0 items-center">
                <span className="text-muted-foreground">{row.date}</span>
                <span className="text-foreground font-medium">{row.amount}</span>
                <span className="text-primary font-medium">{row.apy}</span>
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
