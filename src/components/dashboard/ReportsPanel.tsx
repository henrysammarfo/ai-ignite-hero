import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";
import { generateReport } from "@/lib/generateReport";
import { useState } from "react";
import { toast } from "sonner";

type ReportType = "FINMA" | "AML" | "Travel Rule" | "Performance";

const reports: { id: number; name: string; date: string; type: ReportType; status: string }[] = [
  { id: 1, name: "FINMA Compliance Report — Q1 2026", date: "Mar 10, 2026", type: "FINMA", status: "Ready" },
  { id: 2, name: "AML Screening Summary", date: "Mar 8, 2026", type: "AML", status: "Ready" },
  { id: 3, name: "Travel Rule Transfers Log", date: "Mar 5, 2026", type: "Travel Rule", status: "Ready" },
  { id: 4, name: "Vault Performance Report", date: "Mar 1, 2026", type: "Performance", status: "Ready" },
];

const ReportsPanel = () => {
  const { connected, address } = useWallet();
  const [generating, setGenerating] = useState<number | null>(null);

  const handleGenerate = async (report: typeof reports[0]) => {
    if (!address) return;
    setGenerating(report.id);
    try {
      // Small delay for UX feedback
      await new Promise((r) => setTimeout(r, 400));
      generateReport({ type: report.type, walletAddress: address, date: report.date });
      toast.success(`${report.type} report downloaded`);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateNew = async () => {
    if (!address) return;
    setGenerating(-1);
    try {
      await new Promise((r) => setTimeout(r, 400));
      generateReport({ type: "FINMA", walletAddress: address });
      toast.success("New FINMA report generated and downloaded");
    } finally {
      setGenerating(null);
    }
  };

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground font-sans">Connect wallet to access reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            FINMA-compliant PDF reports with full compliance data
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-lg font-sans text-sm"
          onClick={handleGenerateNew}
          disabled={generating === -1}
        >
          {generating === -1 ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          Generate New
        </Button>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="border-border/50 bg-card/80">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium text-foreground truncate">{report.name}</p>
                <p className="text-xs text-muted-foreground font-sans">{report.date}</p>
              </div>
              <Badge variant="outline" className="font-sans text-xs shrink-0">{report.type}</Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleGenerate(report)}
                  disabled={generating === report.id}
                  title="Preview & Download"
                >
                  {generating === report.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleGenerate(report)}
                  disabled={generating === report.id}
                  title="Download PDF"
                >
                  {generating === report.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsPanel;
