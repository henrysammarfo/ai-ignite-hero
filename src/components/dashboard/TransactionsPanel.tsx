import { ArrowUpRight, ArrowDownLeft, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";

const transactions = [
  { id: "tx-001", type: "deposit" as const, amount: "+$50,000.00", token: "USDC", date: "Mar 10, 2026 · 14:23", hash: "5xKR...m9Fp", status: "Confirmed" },
  { id: "tx-002", type: "yield" as const, amount: "+$312.40", token: "USDC", date: "Mar 10, 2026 · 00:01", hash: "8bNx...q2Wp", status: "Confirmed" },
  { id: "tx-003", type: "deposit" as const, amount: "+$100,000.00", token: "USDC", date: "Mar 5, 2026 · 09:15", hash: "2mTz...k7Lp", status: "Confirmed" },
  { id: "tx-004", type: "yield" as const, amount: "+$298.15", token: "USDC", date: "Mar 3, 2026 · 00:01", hash: "9pRw...d4Hn", status: "Confirmed" },
  { id: "tx-005", type: "deposit" as const, amount: "+$100,000.00", token: "USDC", date: "Feb 28, 2026 · 11:42", hash: "3cVx...j8Qp", status: "Confirmed" },
  { id: "tx-006", type: "yield" as const, amount: "+$305.60", token: "USDC", date: "Feb 24, 2026 · 00:01", hash: "7kSm...f1Bp", status: "Confirmed" },
  { id: "tx-007", type: "withdrawal" as const, amount: "-$25,000.00", token: "USDC", date: "Feb 20, 2026 · 16:30", hash: "4gNx...w5Tp", status: "Confirmed" },
  { id: "tx-008", type: "yield" as const, amount: "+$289.92", token: "USDC", date: "Feb 17, 2026 · 00:01", hash: "6dRq...n3Yp", status: "Confirmed" },
];

const typeConfig = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-green-600" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-red-500" },
  yield: { label: "Yield", icon: ArrowDownLeft, color: "text-primary" },
};

const TransactionsPanel = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Connect wallet to view transactions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Full history of vault deposits, withdrawals, and yield payouts</p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by hash, amount, or type..." className="pl-10 font-sans" />
        </div>
        <Button variant="outline" className="gap-2 font-sans text-sm shrink-0">
          <Filter size={14} />
          Filter
        </Button>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {/* Header */}
          <div className="grid grid-cols-6 text-xs text-muted-foreground font-sans uppercase tracking-wider py-3 px-5 border-b border-border">
            <span>Type</span>
            <span>Amount</span>
            <span>Token</span>
            <span>Date</span>
            <span>Tx Hash</span>
            <span className="text-right">Status</span>
          </div>
          {transactions.map((tx) => {
            const config = typeConfig[tx.type];
            return (
              <div key={tx.id} className="grid grid-cols-6 text-sm font-sans py-3.5 px-5 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <config.icon size={14} className={config.color} />
                  <span className="text-foreground font-medium">{config.label}</span>
                </div>
                <span className={`font-medium ${tx.type === "withdrawal" ? "text-red-500" : "text-foreground"}`}>
                  {tx.amount}
                </span>
                <span className="text-muted-foreground">{tx.token}</span>
                <span className="text-muted-foreground text-xs">{tx.date}</span>
                <span className="text-muted-foreground font-mono text-xs">{tx.hash}</span>
                <span className="text-right">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                    {tx.status}
                  </span>
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPanel;
