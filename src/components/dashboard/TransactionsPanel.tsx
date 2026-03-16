import { useState, useMemo, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, ExternalLink, Copy, X, RotateCcw, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemedDialogContent, Dialog, DialogHeader, DialogTitle } from "./ThemedDialog";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance } from "@/contexts/ComplianceContext";
import { toast } from "sonner";

type FilterType = "all" | "passed" | "blocked";

const TransactionsPanel = () => {
  const { connected, address } = useWallet();
  const { auditTrail, refreshAuditTrail } = useCompliance();
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    refreshAuditTrail(address || undefined);
    const interval = setInterval(() => refreshAuditTrail(address || undefined), 60000);
    return () => clearInterval(interval);
  }, [address, refreshAuditTrail]);

  const filtered = useMemo(() => {
    return auditTrail.filter((log) => {
      const isBlocked = log.blocked === true;
      const matchesType = filterType === "all" || (filterType === "passed" && !isBlocked) || (filterType === "blocked" && isBlocked);
      if (!matchesType) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        log.wallet_address.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.metadata?.amount?.toString() || "").includes(q) ||
        (log.metadata?.kyc_status || "").toLowerCase().includes(q)
      );
    });
  }, [auditTrail, search, filterType]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied");
  };

  const truncate = (str: string, len: number = 8) => {
    if (!str) return "";
    if (str.length <= len) return str;
    return str.slice(0, len/2) + "..." + str.slice(-len/2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">Real-time compliance audit trail from Supabase</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-sans"
          onClick={() => refreshAuditTrail(address || undefined)}
        >
          <RotateCcw size={14} />
          Refresh
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search audit trail..."
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

      {showFilter && (
        <div className="flex gap-2 flex-wrap">
          {(["all", "passed", "blocked"] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium capitalize transition-all ${
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "all" ? "All Logs" : type}
            </button>
          ))}
        </div>
      )}

      {/* Audit Log Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-9 text-[10px] text-muted-foreground font-sans uppercase tracking-wider py-3 px-5 border-b border-border bg-muted/20">
              <span>Time</span>
              <span>Wallet</span>
              <span>Action</span>
              <span>Amount</span>
              <span className="text-center">KYC</span>
              <span className="text-center">Risk</span>
              <span className="text-center">Travel Rule</span>
              <span className="text-center">Status</span>
              <span className="text-right">TX</span>
            </div>
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground font-sans">No logs matching criteria</p>
              </div>
            ) : (
              filtered.map((log) => {
                const isBlocked = log.blocked === true;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedTx(log)}
                    className={`grid grid-cols-9 text-xs font-sans py-3 px-5 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors cursor-pointer ${isBlocked ? 'bg-destructive/5' : ''}`}
                  >
                    <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-mono text-muted-foreground">{truncate(log.wallet_address)}</span>
                    <span className="font-medium text-foreground capitalize">{log.action.replace('_', ' ')}</span>
                    <span className="font-semibold text-foreground">${log.metadata?.amount?.toLocaleString() || '—'}</span>
                    <span className="text-center">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${log.metadata?.kyc_status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {log.metadata?.kyc_status || '—'}
                      </span>
                    </span>
                    <span className={`text-center font-bold ${log.metadata?.risk_score >= 75 ? 'text-destructive' : 'text-primary'}`}>
                      {log.metadata?.risk_score || '—'}
                    </span>
                    <span className="text-center text-[9px] text-muted-foreground truncate">
                      {log.metadata?.travel_rule_hash ? '✓ Active' : '—'}
                    </span>
                    <span className="text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${isBlocked ? 'bg-destructive/10 text-destructive ring-destructive/20' : 'bg-primary/10 text-primary ring-primary/20'}`}>
                        {isBlocked ? 'Blocked' : 'Passed'}
                      </span>
                    </span>
                    <div className="text-right flex justify-end">
                      {log.metadata?.travel_rule_hash ? (
                        <a 
                          href={`https://explorer.solana.com/tx/${log.metadata.travel_rule_hash}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          SOL <ExternalLink size={10} />
                        </a>
                      ) : '—'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <ThemedDialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Audit Details</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTx.blocked ? "bg-red-500/10" : "bg-primary/10"}`}>
                  <Shield size={20} className={selectedTx.blocked ? "text-red-500" : "text-primary"} />
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-foreground capitalize">{selectedTx.action.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{new Date(selectedTx.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border divide-y divide-border">
                {[
                  { label: "Wallet", value: selectedTx.wallet_address, mono: true },
                  { label: "Compliance Status", value: selectedTx.blocked ? "Blocked" : "Passed", badge: true, color: selectedTx.blocked ? "red" : "primary" },
                  { label: "Risk Score", value: selectedTx.metadata?.risk_score || "N/A" },
                  { label: "KYC Status", value: selectedTx.metadata?.kyc_status || "N/A" },
                  { label: "Travel Rule", value: selectedTx.metadata?.travel_rule_hash ? "Transmitted" : "Not Required" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">{row.label}</span>
                    {row.badge ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${row.color === 'red' ? 'bg-destructive/10 text-destructive ring-destructive/20' : 'bg-primary/10 text-primary ring-primary/20'}`}>
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

              {selectedTx.metadata?.travel_rule_hash && (
                <div className="rounded-lg bg-muted p-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Travel Rule Ref</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground flex-1 break-all">{selectedTx.metadata.travel_rule_hash}</code>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyHash(selectedTx.metadata.travel_rule_hash)}>
                      <Copy size={12} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </ThemedDialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPanel;
