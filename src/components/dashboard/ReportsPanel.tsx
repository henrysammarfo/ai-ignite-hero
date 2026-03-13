import { useState } from "react";
import { FileText, Download, Eye, Loader2, Wallet, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemedDialogContent, Dialog, DialogHeader, DialogTitle } from "./ThemedDialog";
import { useWallet } from "@/contexts/WalletContext";
import { generateReport, getReportPreviewData } from "@/lib/generateReport";
import { toast } from "sonner";
import WalletConnectModal from "./WalletConnectModal";

type ReportType = "FINMA" | "AML" | "Travel Rule" | "Performance";

const reports: { id: number; name: string; date: string; type: ReportType; status: string }[] = [
  { id: 1, name: "FINMA Compliance Report — Q1 2026", date: "Mar 10, 2026", type: "FINMA", status: "Ready" },
  { id: 2, name: "AML Screening Summary", date: "Mar 8, 2026", type: "AML", status: "Ready" },
  { id: 3, name: "Travel Rule Transfers Log", date: "Mar 5, 2026", type: "Travel Rule", status: "Ready" },
  { id: 4, name: "Vault Performance Report", date: "Mar 1, 2026", type: "Performance", status: "Ready" },
];

interface PreviewData {
  title: string;
  subtitle: string;
  sections: { heading: string; rows: string[][] }[];
  footer: string;
}

const ReportsPanel = () => {
  const { connected, address } = useWallet();
  const [generating, setGenerating] = useState<number | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewReport, setPreviewReport] = useState<typeof reports[0] | null>(null);

  const handleDownload = async (report: typeof reports[0]) => {
    if (!connected || !address) {
      setWalletModalOpen(true);
      return;
    }
    setGenerating(report.id);
    try {
      await new Promise((r) => setTimeout(r, 400));
      generateReport({ type: report.type, walletAddress: address, date: report.date });
      toast.success(`${report.type} report downloaded`);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const handlePreview = (report: typeof reports[0]) => {
    if (!connected || !address) {
      setWalletModalOpen(true);
      return;
    }
    const data = getReportPreviewData({ type: report.type, walletAddress: address, date: report.date });
    setPreviewData(data);
    setPreviewReport(report);
  };

  const handleGenerateNew = async () => {
    if (!connected || !address) {
      setWalletModalOpen(true);
      return;
    }
    setGenerating(-1);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const data = getReportPreviewData({ type: "FINMA", walletAddress: address });
      setPreviewData(data);
      setPreviewReport({ id: -1, name: "New FINMA Compliance Report", date: new Date().toISOString().split("T")[0], type: "FINMA", status: "Ready" });
      toast.success("New FINMA report generated");
    } finally {
      setGenerating(null);
    }
  };

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

      {!connected && (
        <div className="rounded-lg bg-muted/50 border border-border p-4 flex items-center gap-3">
          <Wallet size={16} className="text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground font-sans flex-1">
            Connect a wallet to generate and download reports with your wallet address.
          </p>
          <Button size="sm" variant="outline" className="font-sans text-xs shrink-0" onClick={() => setWalletModalOpen(true)}>
            Connect
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium text-foreground truncate">{report.name}</p>
                <p className="text-xs text-muted-foreground font-sans">{report.date}</p>
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-sans font-medium ring-1 ring-inset ring-border text-muted-foreground shrink-0">
                {report.type}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePreview(report)}
                  title="Preview Report"
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDownload(report)}
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

      {/* Report Preview Modal */}
      <Dialog open={!!previewData} onOpenChange={(open) => { if (!open) { setPreviewData(null); setPreviewReport(null); } }}>
        <ThemedDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">{previewData?.title}</DialogTitle>
            <p className="text-xs text-muted-foreground font-sans">{previewData?.subtitle}</p>
          </DialogHeader>
          {previewData && (
            <div className="space-y-5">
              {previewData.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-sm font-sans font-semibold text-foreground mb-2">{section.heading}</h3>
                  <div className="rounded-lg border border-border divide-y divide-border">
                    {section.rows.map((row, j) => (
                      <div key={j} className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-muted-foreground font-sans font-medium">{row[0]}</span>
                        <span className="text-sm font-sans text-foreground text-right">{row[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-lg bg-muted p-3">
                <p className="text-[10px] text-muted-foreground font-sans italic">{previewData.footer}</p>
              </div>

              <Button
                className="w-full gap-2 font-sans text-sm"
                onClick={() => {
                  if (previewReport && address) {
                    generateReport({ type: previewReport.type, walletAddress: address, date: previewReport.date });
                    toast.success("PDF downloaded");
                  }
                }}
              >
                <Download size={14} />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
};

export default ReportsPanel;
