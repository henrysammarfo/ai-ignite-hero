import { Shield, CheckCircle2, AlertTriangle, Clock, Circle, Loader2, ExternalLink, RotateCcw, Hash, CalendarClock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/contexts/WalletContext";
import { useCompliance, ComplianceStatus, ComplianceStep } from "@/contexts/ComplianceContext";
import WalletConnectModal from "./WalletConnectModal";
import { useState } from "react";

const statusConfig: Record<ComplianceStatus, {
  color: string;
  badgeClass: string;
  label: string;
  Icon: typeof CheckCircle2;
}> = {
  pending: {
    color: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground ring-border",
    label: "Not Started",
    Icon: Circle,
  },
  in_progress: {
    color: "text-primary",
    badgeClass: "bg-primary/10 text-primary ring-primary/20",
    label: "Verifying…",
    Icon: Loader2,
  },
  verified: {
    color: "text-primary",
    badgeClass: "bg-primary/10 text-primary ring-primary/20",
    label: "Verified",
    Icon: CheckCircle2,
  },
  failed: {
    color: "text-destructive",
    badgeClass: "bg-destructive/10 text-destructive ring-destructive/20",
    label: "Failed",
    Icon: AlertTriangle,
  },
  expired: {
    color: "text-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
    label: "Expired",
    Icon: Clock,
  },
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StepCard = ({ step }: { step: ComplianceStep }) => {
  const { initiateVerification, resetStep } = useCompliance();
  const config = statusConfig[step.status];
  const StatusIcon = config.Icon;
  const canRetry = step.status === "failed" || step.status === "expired";
  const canStart = step.status === "pending";
  const isVerified = step.status === "verified";
  const isLoading = step.status === "in_progress";

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusIcon
                size={16}
                className={`shrink-0 ${config.color} ${isLoading ? "animate-spin" : ""}`}
              />
              <h3 className="text-sm font-sans font-semibold text-foreground">{step.title}</h3>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">{step.description}</p>

            {/* Provider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-sans">Provider:</span>
              {step.providerUrl ? (
                <a
                  href={step.providerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary font-sans font-medium hover:underline inline-flex items-center gap-1"
                >
                  {step.provider}
                  <ExternalLink size={8} />
                </a>
              ) : (
                <span className="text-[10px] text-foreground font-sans font-medium">{step.provider}</span>
              )}
            </div>

            {/* Verification details (only when verified or has data) */}
            {isVerified && step.verification.hash && (
              <div className="mt-3 space-y-1.5 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <Hash size={10} className="text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-sans">Tx Hash:</span>
                  <code className="text-[10px] font-mono text-foreground">{step.verification.hash}</code>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock size={10} className="text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-sans">Verified:</span>
                  <span className="text-[10px] font-sans text-foreground">{formatDate(step.verification.timestamp)}</span>
                </div>
                {step.verification.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Clock size={10} className="text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground font-sans">Expires:</span>
                    <span className="text-[10px] font-sans text-foreground">{formatDate(step.verification.expiresAt)}</span>
                  </div>
                )}
                {step.verification.riskScore && (
                  <div className="flex items-center gap-2">
                    <Shield size={10} className="text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground font-sans">Risk Score:</span>
                    <span className="text-[10px] font-sans font-medium text-primary">{step.verification.riskScore}</span>
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {step.status === "failed" && step.verification.errorMessage && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-destructive/5 p-2.5">
                <AlertCircle size={12} className="text-destructive shrink-0 mt-0.5" />
                <p className="text-[10px] text-destructive font-sans">{step.verification.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Status badge & actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-sans font-medium ring-1 ring-inset ${config.badgeClass}`}>
              {config.label}
            </span>

            {canStart && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-sans gap-1"
                onClick={() => initiateVerification(step.id)}
              >
                Start
              </Button>
            )}

            {canRetry && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-sans gap-1"
                onClick={() => initiateVerification(step.id)}
              >
                <RotateCcw size={10} />
                Retry
              </Button>
            )}

            {isVerified && (
              <button
                onClick={() => resetStep(step.id)}
                className="text-[10px] text-muted-foreground font-sans hover:text-foreground transition-colors"
              >
                Re-verify
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CompliancePanel = () => {
  const { connected } = useWallet();
  const { steps, isFullyCompliant, completedCount, totalCount, initiateVerification, resetAll } = useCompliance();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Shield size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">Connect your wallet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto font-sans">
            A connected Solana wallet is required to run compliance verification checks.
          </p>
          <Button onClick={() => setWalletModalOpen(true)} className="gap-2 font-sans">
            Connect Wallet
          </Button>
          <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
        </div>
      </div>
    );
  }

  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Compliance Status</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            All four compliance pillars enforced at the smart contract level
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 font-sans text-xs shrink-0"
          onClick={resetAll}
        >
          <RotateCcw size={12} />
          Reset
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`shadow-sm ${isFullyCompliant ? "border-primary/20 bg-primary/5" : "border-border"}`}>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isFullyCompliant ? "bg-primary/10" : "bg-muted"}`}>
              <Shield size={24} className={isFullyCompliant ? "text-primary" : "text-muted-foreground"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-sans font-bold text-foreground">
                {isFullyCompliant ? "Fully Compliant" : "Verification Incomplete"}
              </p>
              <p className="text-sm text-muted-foreground font-sans">
                {isFullyCompliant
                  ? "All checks passed. Vault access is enabled."
                  : `${completedCount} of ${totalCount} checks completed. Complete all to unlock vaults.`}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-sans font-semibold ring-1 ring-inset shrink-0 ${
              isFullyCompliant
                ? "bg-primary/10 text-primary ring-primary/20"
                : "bg-muted text-muted-foreground ring-border"
            }`}>
              {isFullyCompliant ? "Active" : `${completedCount}/${totalCount}`}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />

          {!isFullyCompliant && (
            <Button
              size="sm"
              className="gap-1.5 font-sans text-xs w-full sm:w-auto"
              onClick={() => {
                steps
                  .filter(s => s.status === "pending" || s.status === "failed" || s.status === "expired")
                  .forEach((s, i) => setTimeout(() => initiateVerification(s.id), i * 500));
              }}
            >
              <Shield size={12} />
              Start All Verifications
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Individual Layers */}
      <div className="space-y-3">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
};

export default CompliancePanel;
