import { Shield, CheckCircle2, Loader2, Circle, AlertTriangle, Clock, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCompliance, ComplianceStatus } from "@/contexts/ComplianceContext";

const statusConfig: Record<ComplianceStatus, { color: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "text-muted-foreground/40", icon: Circle },
  in_progress: { color: "text-primary animate-spin", icon: Loader2 },
  verified: { color: "text-primary", icon: CheckCircle2 },
  failed: { color: "text-destructive", icon: AlertTriangle },
  expired: { color: "text-amber-500", icon: Clock },
};

const ComplianceBanner = () => {
  const { steps, complianceStatus, isFullyCompliant, completedCount, totalCount, initiateVerification } = useCompliance();

  const progress = (completedCount / totalCount) * 100;
  const hasInProgress = steps.some(s => s.status === "in_progress");

  // Status Badge Helper
  const StatusBadge = ({ status, label }: { status: string; label: string }) => {
    let colors = "bg-muted text-muted-foreground ring-border";
    if (status === 'approved' || status === 'active' || status === 'clear') {
      colors = "bg-primary/10 text-primary ring-primary/20";
    } else if (status === 'rejected' || status === 'blocked' || status === 'failed') {
      colors = "bg-destructive/10 text-destructive ring-destructive/20";
    } else if (status === 'pending' || status === 'required') {
      colors = "bg-amber-500/10 text-amber-500 ring-amber-500/20";
    }
    
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-sans font-medium ring-1 ring-inset ${colors}`}>
        {label}
      </span>
    );
  };

  return (
    <Card className={`shadow-sm mb-6 ${isFullyCompliant ? "border-primary/20 bg-primary/5" : "border-amber-500/20 bg-amber-500/5"}`}>
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFullyCompliant ? "bg-primary/10" : "bg-amber-500/10"}`}>
              <Shield size={20} className={isFullyCompliant ? "text-primary" : "text-amber-500"} />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-foreground">
                {isFullyCompliant ? "All Compliance Layers Active" : "Compliance Verification Required"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground font-sans">
                  {isFullyCompliant 
                    ? "Your account is fully cleared for all vault operations."
                    : `Complete all ${totalCount} checks to unlock vault operations.`
                  }
                </p>
                {complianceStatus && (
                  <div className="flex gap-1.5">
                    <StatusBadge status={complianceStatus.kycStatus} label={`KYC: ${complianceStatus.kycStatus}`} />
                    <StatusBadge status={complianceStatus.isSanctioned ? 'blocked' : 'clear'} label={complianceStatus.isSanctioned ? "OFAC: Blocked" : "OFAC: Clear"} />
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isFullyCompliant && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-sans text-xs shrink-0"
              disabled={hasInProgress}
              onClick={() => {
                steps
                  .filter(s => s.status === "pending" || s.status === "failed" || s.status === "expired")
                  .forEach((s, i) => setTimeout(() => initiateVerification(s.id), i * 500));
              }}
            >
              {hasInProgress ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
              Verify All
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <Progress value={isFullyCompliant ? 100 : progress} className="h-1.5" />

        {/* Steps - Only show if not fully compliant to keep UI clean */}
        {!isFullyCompliant && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((step) => {
              const config = statusConfig[step.status];
              const StatusIcon = config.icon;
              const canStart = step.status === "pending" || step.status === "failed" || step.status === "expired";

              return (
                <button
                  key={step.id}
                  onClick={() => canStart ? initiateVerification(step.id) : undefined}
                  disabled={!canStart}
                  className={`flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                    step.status === "verified"
                      ? "bg-primary/10 border border-primary/20"
                      : step.status === "in_progress"
                      ? "bg-muted border border-border"
                      : step.status === "failed"
                      ? "bg-destructive/5 border border-destructive/20 cursor-pointer hover:border-destructive/40"
                      : step.status === "expired"
                      ? "bg-amber-500/5 border border-amber-500/20 cursor-pointer hover:border-amber-500/40"
                      : "bg-card border border-border hover:border-primary/30 cursor-pointer"
                  }`}
                >
                  <StatusIcon size={16} className={`shrink-0 ${config.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-sans font-medium text-foreground truncate">{step.title}</p>
                    <p className="text-[10px] text-muted-foreground font-sans">
                      {step.status === "in_progress" ? "Verifying…" : step.provider}
                    </p>
                  </div>
                  {step.status === "verified" && step.verification.timestamp && (
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                      ✓
                    </span>
                  )}
                  {(step.status === "failed" || step.status === "expired") && (
                    <RotateCcw size={12} className="text-muted-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceBanner;
