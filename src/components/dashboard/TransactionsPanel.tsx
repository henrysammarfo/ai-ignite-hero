import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, ExternalLink, Copy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "yield";
  amount: string;
  rawAmount: number;
  token: string;
  date: string;
  hash: string;
  fullHash: string;
  status: string;
  from: string;
  to: string;
  fee: string;
  block: number;
  confirmations: number;
}

const transactions: Transaction[] = [
  { id: "tx-001", type: "deposit", amount: "+$50,000.00", rawAmount: 50000, token: "USDC", date: "Mar 10, 2026 · 14:23", hash: "5xKR...m9Fp", fullHash: "5xKRj8mNqW2vB4pLzD7hT9cFx3sYaE6uR1wK0gHnm9Fp", status: "Confirmed", from: "8fT2...xQ4p", to: "FtsVault...9pRm", fee: "0.00025 SOL", block: 284719523, confirmations: 847 },
  { id: "tx-002", type: "yield", amount: "+$312.40", rawAmount: 312.40, token: "USDC", date: "Mar 10, 2026 · 00:01", hash: "8bNx...q2Wp", fullHash: "8bNxp3LkR7mW5vJ2cD9tF6yH4sA1gQ8eZ0uX3nBq2Wp", status: "Confirmed", from: "Marinade...Pool", to: "8fT2...xQ4p", fee: "0.00005 SOL", block: 284712018, confirmations: 1293 },
  { id: "tx-003", type: "deposit", amount: "+$100,000.00", rawAmount: 100000, token: "USDC", date: "Mar 5, 2026 · 09:15", hash: "2mTz...k7Lp", fullHash: "2mTzn4PjS6kW8vL1cD3tF9yH7sA2gQ5eZ0uX6nBk7Lp", status: "Confirmed", from: "8fT2...xQ4p", to: "FtsVault...9pRm", fee: "0.00025 SOL", block: 284523891, confirmations: 5214 },
  { id: "tx-004", type: "yield", amount: "+$298.15", rawAmount: 298.15, token: "USDC", date: "Mar 3, 2026 · 00:01", hash: "9pRw...d4Hn", fullHash: "9pRwk2MjT5nW7vL3cD1tF8yH6sA4gQ9eZ0uX2nBd4Hn", status: "Confirmed", from: "Marinade...Pool", to: "8fT2...xQ4p", fee: "0.00005 SOL", block: 284448210, confirmations: 6891 },
  { id: "tx-005", type: "deposit", amount: "+$100,000.00", rawAmount: 100000, token: "USDC", date: "Feb 28, 2026 · 11:42", hash: "3cVx...j8Qp", fullHash: "3cVxm5RjU7nW9vL2cD4tF1yH3sA8gQ6eZ0uX5nBj8Qp", status: "Confirmed", from: "8fT2...xQ4p", to: "FtsVault...9pRm", fee: "0.00025 SOL", block: 284291445, confirmations: 9102 },
  { id: "tx-006", type: "yield", amount: "+$305.60", rawAmount: 305.60, token: "USDC", date: "Feb 24, 2026 · 00:01", hash: "7kSm...f1Bp", fullHash: "7kSmn8QjV2nW4vL6cD9tF3yH1sA5gQ7eZ0uX8nBf1Bp", status: "Confirmed", from: "Marinade...Pool", to: "8fT2...xQ4p", fee: "0.00005 SOL", block: 284102788, confirmations: 12003 },
  { id: "tx-007", type: "withdrawal", amount: "-$25,000.00", rawAmount: 25000, token: "USDC", date: "Feb 20, 2026 · 16:30", hash: "4gNx...w5Tp", fullHash: "4gNxp6SjW1nW3vL8cD2tF7yH5sA9gQ4eZ0uX1nBw5Tp", status: "Confirmed", from: "FtsVault...9pRm", to: "8fT2...xQ4p", fee: "0.00025 SOL", block: 283948120, confirmations: 14500 },
  { id: "tx-008", type: "yield", amount: "+$289.92", rawAmount: 289.92, token: "USDC", date: "Feb 17, 2026 · 00:01", hash: "6dRq...n3Yp", fullHash: "6dRqm9TjX4nW6vL5cD7tF2yH8sA3gQ1eZ0uX9nBn3Yp", status: "Confirmed", from: "Marinade...Pool", to: "8fT2...xQ4p", fee: "0.00005 SOL", block: 283810445, confirmations: 16200 },
];

const typeConfig = {
  deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-green-600" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-red-500" },
  yield: { label: "Yield", icon: ArrowDownLeft, color: "text-primary" },
};

type FilterType = "all" | "deposit" | "withdrawal" | "yield";

const TransactionsPanel = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = filterType === "all" || tx.type === filterType;
      if (!matchesType) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        tx.hash.toLowerCase().includes(q) ||
        tx.fullHash.toLowerCase().includes(q) ||
        tx.amount.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q)
      );
    });
  }, [search, filterType]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Transaction hash copied");
  };

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
          <Input
            placeholder="Search by hash, amount, or type..."
            className="pl-10 font-sans"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={filterType !== "all" ? "default" : "outline"}
          className="gap-2 font-sans text-sm shrink-0"
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter size={14} />
          Filter
          {filterType !== "all" && (
            <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-xs">1</span>
          )}
        </Button>
      </div>

      {/* Filter chips */}
      {showFilter && (
        <div className="flex gap-2 flex-wrap">
          {(["all", "deposit", "withdrawal", "yield"] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium capitalize transition-all ${
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {(search || filterType !== "all") && (
        <p className="text-xs text-muted-foreground font-sans">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
          {search && <> for "{search}"</>}
          {filterType !== "all" && <> · filtered by {filterType}</>}
        </p>
      )}

      {/* Transactions Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Header */}
            <div className="grid grid-cols-6 text-xs text-muted-foreground font-sans uppercase tracking-wider py-3 px-5 border-b border-border">
              <span>Type</span>
              <span>Amount</span>
              <span>Token</span>
              <span>Date</span>
              <span>Tx Hash</span>
              <span className="text-right">Status</span>
            </div>
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground font-sans">No transactions found</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 font-sans text-xs"
                  onClick={() => { setSearch(""); setFilterType("all"); }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filtered.map((tx) => {
                const config = typeConfig[tx.type];
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="grid grid-cols-6 text-sm font-sans py-3.5 px-5 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors cursor-pointer"
                  >
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
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        {tx.status}
                      </span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              {/* Type badge */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedTx.type === "deposit" ? "bg-green-500/10" :
                  selectedTx.type === "withdrawal" ? "bg-red-500/10" : "bg-primary/10"
                }`}>
                  {selectedTx.type === "withdrawal" ?
                    <ArrowUpRight size={20} className="text-red-500" /> :
                    <ArrowDownLeft size={20} className={selectedTx.type === "deposit" ? "text-green-600" : "text-primary"} />
                  }
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-foreground capitalize">{selectedTx.type}</p>
                  <p className={`text-lg font-bold font-sans ${selectedTx.type === "withdrawal" ? "text-red-500" : "text-foreground"}`}>
                    {selectedTx.amount}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="rounded-lg border border-border divide-y divide-border">
                {[
                  { label: "Status", value: selectedTx.status, badge: true },
                  { label: "Date", value: selectedTx.date },
                  { label: "Token", value: selectedTx.token },
                  { label: "From", value: selectedTx.from, mono: true },
                  { label: "To", value: selectedTx.to, mono: true },
                  { label: "Network Fee", value: selectedTx.fee },
                  { label: "Block", value: selectedTx.block.toLocaleString() },
                  { label: "Confirmations", value: selectedTx.confirmations.toLocaleString() },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">{row.label}</span>
                    {row.badge ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        {row.value}
                      </span>
                    ) : (
                      <span className={`text-sm font-sans text-foreground ${row.mono ? "font-mono text-xs" : "font-medium"}`}>
                        {row.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Tx hash with copy */}
              <div className="rounded-lg bg-muted p-3 space-y-1.5">
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-foreground flex-1 break-all">{selectedTx.fullHash}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyHash(selectedTx.fullHash)}>
                    <Copy size={12} />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2 font-sans text-sm" asChild>
                <a href={`https://explorer.solana.com/tx/${selectedTx.fullHash}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                  View on Solana Explorer
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPanel;
