import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ComplianceStep {
  id: string;
  title: string;
  provider: string;
  status: "pending" | "verifying" | "verified";
}

interface ComplianceContextType {
  steps: ComplianceStep[];
  isFullyCompliant: boolean;
  verifyStep: (id: string) => void;
  verifyAll: () => void;
}

const defaultSteps: ComplianceStep[] = [
  { id: "kyc", title: "KYC — Identity Verification", provider: "Civic Pass", status: "pending" },
  { id: "aml", title: "AML — Anti-Money Laundering", provider: "TRM Labs", status: "pending" },
  { id: "travel", title: "Travel Rule — IVMS-101", provider: "Notabene", status: "pending" },
  { id: "sof", title: "Source of Funds", provider: "On-Chain Hash", status: "pending" },
];

const ComplianceContext = createContext<ComplianceContextType>({
  steps: defaultSteps,
  isFullyCompliant: false,
  verifyStep: () => {},
  verifyAll: () => {},
});

export const useCompliance = () => useContext(ComplianceContext);

export const ComplianceProvider = ({ children }: { children: ReactNode }) => {
  const [steps, setSteps] = useState<ComplianceStep[]>(() => {
    const saved = sessionStorage.getItem("fortis_compliance");
    return saved ? JSON.parse(saved) : defaultSteps;
  });

  const persist = (updated: ComplianceStep[]) => {
    setSteps(updated);
    sessionStorage.setItem("fortis_compliance", JSON.stringify(updated));
  };

  const verifyStep = useCallback((id: string) => {
    setSteps(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, status: "verifying" as const } : s
      );
      sessionStorage.setItem("fortis_compliance", JSON.stringify(updated));
      return updated;
    });

    setTimeout(() => {
      setSteps(prev => {
        const updated = prev.map(s =>
          s.id === id ? { ...s, status: "verified" as const } : s
        );
        sessionStorage.setItem("fortis_compliance", JSON.stringify(updated));
        return updated;
      });
    }, 1500);
  }, []);

  const verifyAll = useCallback(() => {
    const ids = defaultSteps.map(s => s.id);
    ids.forEach((id, i) => {
      setTimeout(() => verifyStep(id), i * 800);
    });
  }, [verifyStep]);

  const isFullyCompliant = steps.every(s => s.status === "verified");

  return (
    <ComplianceContext.Provider value={{ steps, isFullyCompliant, verifyStep, verifyAll }}>
      {children}
    </ComplianceContext.Provider>
  );
};
