import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

export type ComplianceStatus = "pending" | "in_progress" | "verified" | "failed" | "expired";

export interface ComplianceVerification {
  hash: string | null;
  timestamp: string | null;
  expiresAt: string | null;
  riskScore: string | null;
  errorMessage: string | null;
}

export interface ComplianceStep {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerUrl: string;
  status: ComplianceStatus;
  statusLabel: string;
  verification: ComplianceVerification;
}

interface ComplianceContextType {
  steps: ComplianceStep[];
  isFullyCompliant: boolean;
  completedCount: number;
  totalCount: number;
  /** Called by the API layer when a verification result comes back */
  updateStepStatus: (id: string, status: ComplianceStatus, verification?: Partial<ComplianceVerification>) => void;
  /** Called to initiate a verification — wire this to your edge function / API */
  initiateVerification: (id: string) => void;
  /** Reset a single step (e.g. on expiry or re-verification) */
  resetStep: (id: string) => void;
  /** Reset all steps */
  resetAll: () => void;
}

const STATUS_LABELS: Record<ComplianceStatus, string> = {
  pending: "Not Started",
  in_progress: "Verifying…",
  verified: "Verified",
  failed: "Failed",
  expired: "Expired",
};

const emptyVerification: ComplianceVerification = {
  hash: null,
  timestamp: null,
  expiresAt: null,
  riskScore: null,
  errorMessage: null,
};

const defaultSteps: ComplianceStep[] = [
  {
    id: "kyc",
    title: "KYC — Identity Verification",
    description: "Verify organization identity via Civic Pass on-chain gate. Required for all vault operations.",
    provider: "Civic Pass",
    providerUrl: "https://civic.com",
    status: "pending",
    statusLabel: STATUS_LABELS.pending,
    verification: { ...emptyVerification },
  },
  {
    id: "aml",
    title: "AML — Anti-Money Laundering",
    description: "Screen connected wallet against TRM Labs sanctions, darknet, and mixer databases.",
    provider: "TRM Labs",
    providerUrl: "https://www.trmlabs.com",
    status: "pending",
    statusLabel: STATUS_LABELS.pending,
    verification: { ...emptyVerification },
  },
  {
    id: "travel",
    title: "Travel Rule — IVMS-101",
    description: "Transmit IVMS-101 originator/beneficiary data for transfers ≥ $1,000 via Notabene.",
    provider: "Notabene",
    providerUrl: "https://notabene.id",
    status: "pending",
    statusLabel: STATUS_LABELS.pending,
    verification: { ...emptyVerification },
  },
  {
    id: "sof",
    title: "Source of Funds Attestation",
    description: "SHA-256 hash of source-of-funds attestation stored on-chain via PDA.",
    provider: "On-Chain PDA",
    providerUrl: "",
    status: "pending",
    statusLabel: STATUS_LABELS.pending,
    verification: { ...emptyVerification },
  },
];

const STORAGE_KEY = "fortis_compliance_v2";

const ComplianceContext = createContext<ComplianceContextType>({
  steps: defaultSteps,
  isFullyCompliant: false,
  completedCount: 0,
  totalCount: 4,
  updateStepStatus: () => { },
  initiateVerification: () => { },
  resetStep: () => { },
  resetAll: () => { },
});

export const useCompliance = () => useContext(ComplianceContext);

export const ComplianceProvider = ({ children }: { children: ReactNode }) => {
  const [steps, setSteps] = useState<ComplianceStep[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { }
    return defaultSteps;
  });

  const persist = (updated: ComplianceStep[]) => {
    setSteps(updated);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateStepStatus = useCallback((
    id: string,
    status: ComplianceStatus,
    verification?: Partial<ComplianceVerification>
  ) => {
    setSteps(prev => {
      const updated = prev.map(s =>
        s.id === id
          ? {
            ...s,
            status,
            statusLabel: STATUS_LABELS[status],
            verification: { ...s.verification, ...verification },
          }
          : s
      );
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const { publicKey } = useWallet();

  /**
   * Initiates a verification flow for a step.
   * Calls the 'compliance-verify' Supabase edge function.
   */
  const initiateVerification = useCallback(async (id: string) => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    updateStepStatus(id, "in_progress");

    try {
      const { data, error } = await supabase.functions.invoke('compliance-verify', {
        body: {
          stepId: id,
          walletAddress: publicKey.toBase58()
        }
      });

      if (error) throw error;

      if (data) {
        updateStepStatus(id, data.status, data.verification);
        if (data.status === "verified") {
          toast.success(`${id.toUpperCase()} Verification Successful`);
        } else {
          toast.error(`${id.toUpperCase()} Verification Failed: ${data.verification?.errorMessage || "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error("[compliance] Verification error:", err);
      updateStepStatus(id, "failed", {
        errorMessage: err instanceof Error ? err.message : "Verification service unavailable"
      });
      toast.error(`Verification failed: ${err instanceof Error ? err.message : "Service error"}`);
    }
  }, [publicKey, updateStepStatus]);

  const resetStep = useCallback((id: string) => {
    updateStepStatus(id, "pending", { ...emptyVerification });
  }, [updateStepStatus]);

  const resetAll = useCallback(() => {
    persist(defaultSteps);
  }, []);

  const completedCount = steps.filter(s => s.status === "verified").length;
  const isFullyCompliant = completedCount === steps.length;

  return (
    <ComplianceContext.Provider
      value={{
        steps,
        isFullyCompliant,
        completedCount,
        totalCount: steps.length,
        updateStepStatus,
        initiateVerification,
        resetStep,
        resetAll,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};
