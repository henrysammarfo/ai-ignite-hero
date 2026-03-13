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
  const { steps, isFullyCompliant, completedCount, totalCount, initiateVerification } = useCompliance();

  if (isFullyCompliant) return null;

  const progress = (completedCount / totalCount) * 100;
  const hasInProgress = steps.some(s => s.status === "in_progress");

  return (
    <Card className="shadow-sm border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-foreground">Compliance Verification Required</h3>
              <p className="text-xs text-muted-foreground font-sans">
                Complete all {totalCount} checks to unlock vault operations · {completedCount}/{totalCount} verified
              </p>
            </div>
          </div>
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
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1.5" />

        {/* Steps */}
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
      </CardContent>
    </Card>
  );
};

export default ComplianceBanner;
