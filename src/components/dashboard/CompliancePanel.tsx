import { Shield, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  verified: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Verified", Icon: CheckCircle2 },
  clear: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Clear", Icon: CheckCircle2 },
  compliant: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Compliant", Icon: CheckCircle2 },
  recorded: { color: "bg-primary/10 text-primary border-primary/20", label: "Recorded", Icon: CheckCircle2 },
  pending: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Pending", Icon: AlertCircle },
};

const CompliancePanel = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
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
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-sans font-bold text-foreground">Fully Compliant</p>
            <p className="text-sm text-muted-foreground font-sans">All checks passed. Vault access is enabled.</p>
          </div>
          <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20 font-sans text-sm px-4 py-1">
            Active
          </Badge>
        </CardContent>
      </Card>

      {/* Individual Layers */}
      <div className="space-y-3">
        {complianceLayers.map((layer) => {
          const config = statusConfig[layer.status];
          return (
            <Card key={layer.id} className="border-border/50 bg-card/80">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <config.Icon size={16} className="text-green-400" />
                      <h3 className="text-sm font-sans font-semibold text-foreground">{layer.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans">{layer.detail}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground/60 font-mono">{layer.hash}</span>
                      <span className="text-[10px] text-muted-foreground/40 font-sans">via {layer.provider}</span>
                    </div>
                  </div>
                  <Badge className={`${config.color} font-sans text-xs shrink-0`}>
                    {config.label}
                  </Badge>
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
