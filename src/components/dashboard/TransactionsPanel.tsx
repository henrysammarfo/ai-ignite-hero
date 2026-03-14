import { useState, useMemo, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, ExternalLink, Copy, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemedDialogContent, Dialog, DialogHeader, DialogTitle } from "./ThemedDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "yield";
  amount: number;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Transaction[] = data.map(tx => ({
          id: tx.id,
          type: tx.type as any,
          amount: Number(tx.amount),
          token: tx.token || "USDC",
          date: format(new Date(tx.created_at), "MMM d, yyyy HH:mm"),
          hash: tx.tx_signature ? `${tx.tx_signature.slice(0, 4)}...${tx.tx_signature.slice(-4)}` : "Pending",
          fullHash: tx.tx_signature || "",
          status: tx.status || "Pending",
          from: tx.from_address || "N/A",
          to: tx.to_address || "N/A",
          fee: tx.network_fee ? `${tx.network_fee} SOL` : "0.0001 SOL",
          block: Number(tx.block_number || 0),
          confirmations: tx.confirmations || 0
        }));
        setTransactions(mapped);
      }
    } catch (err: any) {
      toast.error("Failed to load transactions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Subscribe to new transactions
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          variant={filterType !== "all" ? "default" : "secondary"}
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
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium capitalize transition-all ${filterType === type
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
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm font-sans">Syncing with blockchain...</p>
              </div>
            ) : filtered.length === 0 ? (
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
                      {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toLocaleString()}
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
        <ThemedDialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              {/* Type badge */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTx.type === "deposit" ? "bg-green-500/10" :
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
                    {selectedTx.type === "withdrawal" ? "-" : "+"}${selectedTx.amount.toLocaleString()}
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
        </ThemedDialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPanel;
