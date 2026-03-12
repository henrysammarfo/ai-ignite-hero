import { LayoutDashboard, Shield, ArrowDownToLine, TrendingUp, FileText, LogOut, Wallet, Menu, X } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { id: "yield", label: "Yield", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
];

const SidebarContent = ({ activeTab, onTabChange, onNavigate }: DashboardSidebarProps & { onNavigate?: () => void }) => {
  const { connected, address, connect, disconnect } = useWallet();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onNavigate?.();
  };

  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <a href="/" className="font-serif text-xl font-bold text-sidebar-primary tracking-tight">
          Fortis
        </a>
        <p className="text-xs text-sidebar-foreground/50 mt-1 font-sans">Institutional Dashboard</p>
      </div>

      {/* Wallet */}
      <div className="p-4 border-b border-sidebar-border">
        {connected ? (
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-sidebar-foreground/50 font-sans">Connected</p>
              <p className="text-sm font-mono text-sidebar-foreground truncate">{address}</p>
            </div>
            <button onClick={disconnect} className="text-sidebar-foreground/40 hover:text-destructive transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Button onClick={connect} className="w-full gap-2 rounded-lg font-sans" size="sm">
            <Wallet size={14} />
            Connect Wallet
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-200 ${
              activeTab === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/30 font-sans">Fortis v0.1.0 · Devnet</p>
      </div>
    </>
  );
};

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border flex flex-col">
          <SidebarContent activeTab={activeTab} onTabChange={onTabChange} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-sidebar flex flex-col hidden md:flex">
      <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
    </aside>
  );
};

export default DashboardSidebar;
