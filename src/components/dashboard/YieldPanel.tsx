import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Activity, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Connection, PublicKey } from "@solana/web3.js";
import { PythHttpClient, getPythProgramKeyForCluster } from "@pythnetwork/client";
import { toast } from "sonner";

const allApyData = [
  { week: "Feb 1", apy: 7.42 },
  { week: "Feb 8", apy: 7.58 },
  { week: "Feb 15", apy: 7.91 },
  { week: "Feb 22", apy: 8.12 },
  { week: "Mar 1", apy: 8.24 },
  { week: "Mar 8", apy: 8.39 },
  { week: "Mar 14", apy: 8.42 },
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
  { date: "Oct 12, 2023", amount: "+$4,250.00", apy: "7.84%", source: "Kamino Strategy" },
  { date: "Nov 12, 2023", amount: "+$5,120.00", apy: "8.12%", source: "Kamino Strategy" },
  { date: "Dec 12, 2023", amount: "+$6,480.00", apy: "8.24%", source: "Drift Protocol" },
  { date: "Jan 12, 2024", amount: "+$7,910.00", apy: "8.39%", source: "Multi-Strategy" },
  { date: "Feb 12, 2024", amount: "+$8,560.00", apy: "8.42%", source: "Multi-Strategy" },
];

const YieldPanel = () => {
  const [range, setRange] = useState<TimeRange>("3M");
  const [usdcPrice, setUsdcPrice] = useState<number | null>(null);
  const [loadingOracle, setLoadingOracle] = useState(true);

  // Pyth USDC/USD Devnet Feed
  const USDC_FEED = "5SSkXsEKQepHHAewytB3SusrZ65ndq6uQQ8bbT396mAS";

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster("devnet"));
        const data = await pythClient.getData();
        const price = data.productPrice.get(USDC_FEED);

        if (price && price.price) {
          console.log("[Yield] Pyth USDC Price Loaded:", price.price);
          setUsdcPrice(price.price);
        } else {
          // Default to 1.0 for USDC if feed is weird
          setUsdcPrice(1.0000);
        }
      } catch (err) {
        console.warn("[Yield] Pyth Oracle error - falling back to 1.0:", err);
        setUsdcPrice(1.0000);
      } finally {
        setLoadingOracle(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    return allApyData;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Yield</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Track your vault earnings and APY performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Earned",
            value: loadingOracle ? "..." : "$0.00",
            sub: "Lifetime",
            highlight: false
          },
          {
            label: "Oracle Price (USDC)",
            value: loadingOracle ? "..." : `$${usdcPrice?.toFixed(4) || "1.0000"}`,
            sub: loadingOracle ? "Syncing..." : "Live Pyth Feed",
            highlight: true
          },
          {
            label: "Estimated APY",
            value: "8.42%",
            sub: "Avg. Strategy Yield",
            highlight: false
          },
        ].map((card) => (
          <Card key={card.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">{card.label}</p>
                {card.highlight && !loadingOracle && <RefreshCw size={12} className="text-primary animate-spin-slow" />}
              </div>
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
                className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors ${range === r.label
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
            <div className="grid grid-cols-4 text-xs text-muted-foreground font-sans uppercase tracking-wider py-2 border-b border-border">
              <span>Date</span>
              <span>Amount</span>
              <span>APY</span>
              <span>Source</span>
            </div>
            {yieldHistory.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm font-sans">
                Yield data will populate once the Devnet strategy contract initializes payouts.
              </div>
            ) : yieldHistory.map((row, i) => (
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
    </motion.div>
  );
};

export default YieldPanel;
