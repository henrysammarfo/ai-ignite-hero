import { useState } from "react";
import { WalletProvider } from "@/contexts/WalletContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OverviewPanel from "@/components/dashboard/OverviewPanel";
import CompliancePanel from "@/components/dashboard/CompliancePanel";
import DepositPanel from "@/components/dashboard/DepositPanel";
import YieldPanel from "@/components/dashboard/YieldPanel";
import ReportsPanel from "@/components/dashboard/ReportsPanel";

const panels: Record<string, () => JSX.Element> = {
  overview: OverviewPanel,
  compliance: CompliancePanel,
  deposit: DepositPanel,
  yield: YieldPanel,
  reports: ReportsPanel,
};

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const ActivePanel = panels[activeTab] || OverviewPanel;

  return (
    <div className="dashboard-theme flex min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8">
        <ActivePanel />
      </main>
    </div>
  );
};

const Dashboard = () => (
  <WalletProvider>
    <DashboardContent />
  </WalletProvider>
);

export default Dashboard;
