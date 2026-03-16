import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ComplianceService, PreflightResult, FullComplianceStatus } from "../services/ComplianceService";
import { TravelRuleParams, TravelRuleService } from "../services/TravelRuleService";

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
  
  preflightResult: PreflightResult | null;
  complianceStatus: FullComplianceStatus | null;
  isCheckingCompliance: boolean;
  travelRuleHash: string | null;
  auditTrail: any[];

  runPreflightDeposit: (wallet: string, amount: number) => Promise<PreflightResult>;
  runPreflightTransfer: (sender: string, receiver: string, amount: number) => Promise<PreflightResult>;
  loadComplianceStatus: (wallet: string) => Promise<void>;
  submitTravelRule: (params: TravelRuleParams) => Promise<string>;
  refreshAuditTrail: (wallet?: string) => Promise<void>;
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
  updateStepStatus: () => {},
  initiateVerification: () => {},
  resetStep: () => {},
  resetAll: () => {},
  preflightResult: null,
  complianceStatus: null,
  isCheckingCompliance: false,
  travelRuleHash: null,
  auditTrail: [],
  runPreflightDeposit: async () => ({} as any),
  runPreflightTransfer: async () => ({} as any),
  loadComplianceStatus: async () => {},
  submitTravelRule: async () => "",
  refreshAuditTrail: async () => {},
});

export const useCompliance = () => useContext(ComplianceContext);

export const ComplianceProvider = ({ children }: { children: ReactNode }) => {
  const [preflightResult, setPreflightResult] = useState<PreflightResult | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<FullComplianceStatus | null>(null);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState<boolean>(false);
  const [travelRuleHash, setTravelRuleHash] = useState<string | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  const [steps, setSteps] = useState<ComplianceStep[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
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

  /**
   * Initiates a verification flow for a step.
   * 
   * INTEGRATION POINT: Replace the body of this function with a call
   * to your edge function / API endpoint. Example:
   * 
   * ```ts
   * const res = await fetch('/api/compliance/verify', {
   *   method: 'POST',
   *   body: JSON.stringify({ stepId: id, walletAddress }),
   * });
   * const data = await res.json();
   * updateStepStatus(id, data.status, data.verification);
   * ```
   * 
   * For now, it sets status to "in_progress" so the UI reflects the loading state.
   * The actual verification result should come back via `updateStepStatus`.
   */
  const initiateVerification = useCallback(async (id: string) => {
    updateStepStatus(id, "in_progress");

    try {
      const { data, error } = await (ComplianceService as any).invokeVerification(id);
      
      if (error) {
        console.error(`Verification error for ${id}:`, error);
        updateStepStatus(id, "failed", { errorMessage: error.message });
        return;
      }

      updateStepStatus(id, data.status, data.verification);
    } catch (err) {
      console.error(`Unexpected error for ${id}:`, err);
      updateStepStatus(id, "failed", { errorMessage: "Connection to compliance service failed" });
    }
  }, [updateStepStatus]);

  const resetStep = useCallback((id: string) => {
    updateStepStatus(id, "pending", { ...emptyVerification });
  }, [updateStepStatus]);

  const resetAll = useCallback(() => {
    persist(defaultSteps);
  }, []);

  const completedCount = steps.filter(s => s.status === "verified").length;
  const isFullyCompliant = completedCount === steps.length;

  const runPreflightDeposit = useCallback(async (wallet: string, amount: number) => {
    setIsCheckingCompliance(true);
    try {
      const result = await ComplianceService.preflightDeposit(wallet, amount);
      setPreflightResult(result);
      return result;
    } finally {
      setIsCheckingCompliance(false);
    }
  }, []);

  const runPreflightTransfer = useCallback(async (sender: string, receiver: string, amount: number) => {
    setIsCheckingCompliance(true);
    try {
      const result = await ComplianceService.preflightTransfer(sender, receiver, amount);
      setPreflightResult(result);
      return result;
    } finally {
      setIsCheckingCompliance(false);
    }
  }, []);

  const loadComplianceStatus = useCallback(async (wallet: string) => {
    setIsCheckingCompliance(true);
    try {
      const status = await ComplianceService.getFullStatus(wallet);
      setComplianceStatus(status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingCompliance(false);
    }
  }, []);

  const submitTravelRule = useCallback(async (params: TravelRuleParams) => {
    setIsCheckingCompliance(true);
    try {
      const { hash } = await TravelRuleService.submit(params);
      setTravelRuleHash(hash);
      return hash;
    } finally {
      setIsCheckingCompliance(false);
    }
  }, []);

  const refreshAuditTrail = useCallback(async (wallet?: string) => {
    try {
      const logs = await ComplianceService.getAuditTrail(wallet);
      setAuditTrail(logs);
    } catch (err) {
      console.error(err);
    }
  }, []);

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
        preflightResult,
        complianceStatus,
        isCheckingCompliance,
        travelRuleHash,
        auditTrail,
        runPreflightDeposit,
        runPreflightTransfer,
        loadComplianceStatus,
        submitTravelRule,
        refreshAuditTrail,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};
