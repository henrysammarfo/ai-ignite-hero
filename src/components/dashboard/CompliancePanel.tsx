import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";

const complianceLayers = [
  {
    id: "kyc",
    title: "KYC — Identity Verification",
    provider: "Civic Pass",
    status: "verified" as const,
    detail: "Civic Pass gate verified on-chain. Pass expires Apr 12, 2026.",
    hash: "0x8f3a...b2c1",
  },
  {
    id: "aml",
    title: "AML — Anti-Money Laundering",
    provider: "TRM Labs",
    status: "clear" as const,
    detail: "Wallet screened against TRM Labs sanctions, darknet, and mixer databases. Risk score: Low.",
    hash: "0x4d21...e7f9",
  },
  {
    id: "travel",
    title: "Travel Rule — IVMS-101",
    provider: "Notabene",
    status: "compliant" as const,
    detail: "IVMS-101 originator/beneficiary data transmitted for transfers ≥$1,000.",
    hash: "0xa1c3...90d4",
  },
  {
    id: "sof",
    title: "Source of Funds",
    provider: "On-Chain Hash",
    status: "recorded" as const,
    detail: "SHA-256 hash of source-of-funds attestation stored on-chain via PDA.",
    hash: "0x7b9e...f3a2",
  },
];

const statusConfig = {
  verified: { color: "bg-primary/10 text-primary ring-primary/20", label: "Verified", Icon: CheckCircle2 },
  clear: { color: "bg-primary/10 text-primary ring-primary/20", label: "Clear", Icon: CheckCircle2 },
  compliant: { color: "bg-primary/10 text-primary ring-primary/20", label: "Compliant", Icon: CheckCircle2 },
  recorded: { color: "bg-accent/10 text-accent ring-accent/20", label: "Recorded", Icon: CheckCircle2 },
  pending: { color: "bg-destructive/10 text-destructive ring-destructive/20", label: "Pending", Icon: AlertCircle },
};

const CompliancePanel = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Connect wallet to view compliance status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Compliance Status</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          All four compliance pillars enforced at the smart contract level
        </p>
      </div>

      {/* Overall Badge */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-sans font-bold text-foreground">Fully Compliant</p>
            <p className="text-sm text-muted-foreground font-sans">All checks passed. Vault access is enabled.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-sans font-semibold text-primary ring-1 ring-inset ring-primary/20">
            Active
          </span>
        </CardContent>
      </Card>

      {/* Individual Layers */}
      <div className="space-y-3">
        {complianceLayers.map((layer) => {
          const config = statusConfig[layer.status];
          return (
            <Card key={layer.id} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <config.Icon size={16} className="text-primary" />
                      <h3 className="text-sm font-sans font-semibold text-foreground">{layer.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">{layer.detail}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground/60 font-mono bg-muted px-2 py-0.5 rounded">{layer.hash}</span>
                      <span className="text-[10px] text-muted-foreground font-sans">via {layer.provider}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-sans font-medium ring-1 ring-inset shrink-0 ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CompliancePanel;
