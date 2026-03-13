import { Shield, CheckCircle2, Loader2, Circle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompliance } from "@/contexts/ComplianceContext";

const ComplianceBanner = () => {
  const { steps, isFullyCompliant, verifyStep, verifyAll } = useCompliance();

  if (isFullyCompliant) return null;

  const verified = steps.filter(s => s.status === "verified").length;

  return (
    <Card className="shadow-sm border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-foreground">Compliance Verification Required</h3>
              <p className="text-xs text-muted-foreground font-sans">
                Complete all 4 checks to unlock vault operations · {verified}/4 verified
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 font-sans text-xs" onClick={verifyAll}>
            <Zap size={12} />
            Verify All
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(verified / 4) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => step.status === "pending" ? verifyStep(step.id) : undefined}
              disabled={step.status !== "pending"}
              className={`flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                step.status === "verified"
                  ? "bg-primary/10 border border-primary/20"
                  : step.status === "verifying"
                  ? "bg-muted border border-border animate-pulse"
                  : "bg-card border border-border hover:border-primary/30 cursor-pointer"
              }`}
            >
              {step.status === "verified" ? (
                <CheckCircle2 size={16} className="text-primary shrink-0" />
              ) : step.status === "verifying" ? (
                <Loader2 size={16} className="text-muted-foreground shrink-0 animate-spin" />
              ) : (
                <Circle size={16} className="text-muted-foreground/40 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-sans font-medium text-foreground truncate">{step.title}</p>
                <p className="text-[10px] text-muted-foreground font-sans">{step.provider}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceBanner;
