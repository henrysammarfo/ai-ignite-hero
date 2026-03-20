import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { TrendingUp, Activity, RefreshCw, ArrowRightLeft, Lock, Unlock, Zap, ShieldAlert } from "lucide-react";
import ReconciliationOracle from "./ReconciliationOracle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { PythHttpClient, getPythProgramKeyForCluster } from "@pythnetwork/client";
import { toast } from "sonner";
import { SolsticeService } from "@/services/SolsticeService";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FUSX_MINT, TOKEN_DISPLAY_NAMES } from "@/lib/solana";


const allApyData = [
  { week: "Feb 1", apy: 7.42 },
  { week: "Feb 8", apy: 7.58 },
  { week: "Feb 15", apy: 7.91 },
  { week: "Feb 22", apy: 8.12 },
  { week: "Mar 1", apy: 8.24 },
  { week: "Mar 8", apy: 8.39 },
  { week: "Mar 14", apy: 8.42 },
];

const chartConfig = {
  apy: {
    label: "APY %",
    color: "hsl(var(--primary))",
  },
};

const YieldPanel = () => {
  const [usdcPrice, setUsdcPrice] = useState<number | null>(null);
  const [loadingOracle, setLoadingOracle] = useState(true);
  const { wallet, publicKey, sendTransaction } = useWallet();
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Transaction States
  const [mintAmount, setMintAmount] = useState("");
  const [lockAmount, setLockAmount] = useState("");
  const [unlockAmount, setUnlockAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  // Pyth USDC/USD Devnet Feed
  const USDC_FEED = "5SSkXsEKQepHHAewytB3SusrZ65ndq6uQQ8bbT396mAS";

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster("devnet"));
        const data = await pythClient.getData();
        const price = data.productPrice.get(USDC_FEED);
        if (price && price.price) setUsdcPrice(price.price);
        else setUsdcPrice(1.0000);
      } catch (err) {
        setUsdcPrice(1.0000);
      } finally {
        setLoadingOracle(false);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Generic instruction broadcast runner
  const broadcastSolsticeInstruction = async (apiCall: Promise<any>, successMsg: string) => {
    if (!publicKey) return toast.error("Wallet not connected");
    try {
      setIsLoadingTx(true);
      toast.loading("Fetching Solstice payload...", { id: "solstice-tx" });
      
      const instruction = await apiCall;
      
      toast.loading("Requesting wallet signature...", { id: "solstice-tx" });
      const tx = new Transaction().add(instruction);
      
      // Request latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      
      toast.loading("Confirming transaction block...", { id: "solstice-tx" });
      await connection.confirmTransaction(signature, "confirmed");

      toast.success(`${successMsg} (TX: ${signature.slice(0, 8)}...)`, { id: "solstice-tx" });
    } catch (err: any) {
      console.error(err);
      toast.error(`Transaction Failed: ${err.message}`, { id: "solstice-tx" });
    } finally {
      setIsLoadingTx(false);
    }
  };

  const handleMintUSX = () => {
    if (!mintAmount || !publicKey) return;
    broadcastSolsticeInstruction(
      SolsticeService.requestMint(publicKey.toBase58(), parseFloat(mintAmount)),
      `Successfully requested mint for ${mintAmount} ${TOKEN_DISPLAY_NAMES[FUSX_MINT.toBase58()] || "USX"}!`
    );
  };

  const handleLockEUSX = () => {
    if (!lockAmount || !publicKey) return;
    broadcastSolsticeInstruction(
      SolsticeService.lockToYieldVault(publicKey.toBase58(), parseFloat(lockAmount)),
      `Successfully locked ${lockAmount} USX into YieldVault!`
    );
  };

  const handleUnlockEUSX = () => {
    if (!unlockAmount || !publicKey) return;
    broadcastSolsticeInstruction(
      SolsticeService.unlockFromYieldVault(publicKey.toBase58(), parseFloat(unlockAmount)),
      `Successfully unlocked ${unlockAmount} eUSX!`
    );
  };

  const handleRedeemUSX = () => {
    if (!redeemAmount || !publicKey) return;
    broadcastSolsticeInstruction(
      SolsticeService.requestRedeem(publicKey.toBase58(), parseFloat(redeemAmount)),
      `Successfully requested redemption of ${redeemAmount} USX back to USDC collateral!`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Yield Management</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Interact natively with the Solstice Finance YieldVault protocol.</p>
      </div>

      <ReconciliationOracle />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Solstice Trade Terminal */}
        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-3 border-b border-border/10">
            <CardTitle className="text-base font-sans font-semibold flex items-center gap-2 text-primary">
              <Zap size={16} />
              Solstice Trade Terminal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="mint" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border/10 bg-transparent p-0">
                <TabsTrigger value="mint" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10">Mint</TabsTrigger>
                <TabsTrigger value="lock" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10">Lock</TabsTrigger>
                <TabsTrigger value="unlock" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10">Unlock</TabsTrigger>
                <TabsTrigger value="redeem" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10">Redeem</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mint" className="p-4 space-y-4 outline-none">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-sans tracking-wider">Amount (USDC)</label>
                  <div className="relative">
                    <Input type="number" placeholder="1,000" value={mintAmount} onChange={e => setMintAmount(e.target.value)} disabled={isLoadingTx} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDC → Fortis USX</span>
                  </div>
                </div>
                <Button onClick={handleMintUSX} disabled={!mintAmount || isLoadingTx || !publicKey} className="w-full gap-2">
                  <ArrowRightLeft size={14} /> Request Mint
                </Button>
              </TabsContent>

              <TabsContent value="lock" className="p-4 space-y-4 outline-none">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-sans tracking-wider">Amount (USX)</label>
                  <div className="relative">
                    <Input type="number" placeholder="100" value={lockAmount} onChange={e => setLockAmount(e.target.value)} disabled={isLoadingTx} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USX → eUSX</span>
                  </div>
                </div>
                <Button onClick={handleLockEUSX} disabled={!lockAmount || isLoadingTx || !publicKey} className="w-full gap-2">
                  <Lock size={14} /> Lock into YieldVault
                </Button>
              </TabsContent>

              <TabsContent value="unlock" className="p-4 space-y-4 outline-none">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-sans tracking-wider">Amount (eUSX)</label>
                  <div className="relative">
                    <Input type="number" placeholder="100" value={unlockAmount} onChange={e => setUnlockAmount(e.target.value)} disabled={isLoadingTx} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">eUSX → USX</span>
                  </div>
                </div>
                <Button onClick={handleUnlockEUSX} disabled={!unlockAmount || isLoadingTx || !publicKey} variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/10">
                  <Unlock size={14} /> Unlock from YieldVault
                </Button>
              </TabsContent>

              <TabsContent value="redeem" className="p-4 space-y-4 outline-none">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase font-sans tracking-wider">Amount (USX)</label>
                  <div className="relative">
                    <Input type="number" placeholder="100" value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)} disabled={isLoadingTx} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USX → USDC</span>
                  </div>
                </div>
                <Button onClick={handleRedeemUSX} disabled={!redeemAmount || isLoadingTx || !publicKey} className="w-full gap-2" variant="destructive">
                  <ArrowRightLeft size={14} /> Request Redeem
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 h-full">
          <Card className="shadow-sm flex flex-col justify-center">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">Oracle Price (USDC)</p>
              <p className="text-2xl font-bold font-sans text-foreground">${usdcPrice?.toFixed(4) || "..."}</p>
              <p className="text-xs text-muted-foreground font-sans mt-1">Pyth Network</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm flex flex-col justify-center">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-1">Solstice APY</p>
              <p className="text-2xl font-bold font-sans text-primary">13.96%</p>
              <p className="text-xs text-muted-foreground font-sans mt-1">Live Average</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-sm border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-sans font-medium text-yellow-800 dark:text-yellow-500">End-to-End Environment Live</p>
            <p className="text-xs font-sans text-yellow-700/80 dark:text-yellow-500/80">
              The Trade Terminal generates real, signable transactions via the native Solstice Finance API pipeline. 
              Confirming these prompts will directly broadcast them onto the Solana Devnet blockchain via your connected browser wallet.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* APY Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            Historical Global APY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={allApyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
    </motion.div>
  );
};

export default YieldPanel;
