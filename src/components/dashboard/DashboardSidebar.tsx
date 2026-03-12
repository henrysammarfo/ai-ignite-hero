import { LayoutDashboard, Shield, ArrowDownToLine, TrendingUp, FileText, LogOut, Wallet, Menu, ArrowLeftRight, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { id: "yield", label: "Yield", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const SidebarInner = ({ activeTab, onTabChange, onNavigate }: DashboardSidebarProps & { onNavigate?: () => void }) => {
  const { connected, address, connect, disconnect } = useWallet();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <a href="/" className="font-serif text-xl font-bold text-primary tracking-tight">
          Fortis
        </a>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Institutional Dashboard</p>
      </div>

      {/* Wallet */}
      <div className="p-4 border-b border-border">
        {connected ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-sans">Connected</p>
              <p className="text-sm font-mono text-foreground truncate">{address}</p>
            </div>
            <button onClick={disconnect} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button onClick={connect} className="w-full gap-2 rounded-lg font-sans text-sm justify-start" size="sm" variant="outline">
              <img src="https://raw.githubusercontent.com/nicnocquee/cryptocurrency-icons/master/icons/sol.svg" alt="" className="w-4 h-4" />
              Phantom
            </Button>
            <Button onClick={connect} className="w-full gap-2 rounded-lg font-sans text-sm justify-start" size="sm" variant="outline">
              <Wallet size={14} />
              Solflare
            </Button>
          </div>
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
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <button
          onClick={() => {
            disconnect();
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut size={16} />
          Log Out
        </button>
        <p className="text-[10px] text-muted-foreground/50 font-sans">Fortis v0.1.0 · Devnet</p>
      </div>
    </div>
  );
};

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  const { themeClass } = useDashboardTheme();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <div className={`fixed top-0 left-0 right-0 z-50 md:hidden ${themeClass} bg-card border-b border-border`}>
            <div className="flex items-center justify-between px-4 h-14">
              <a href="/" className="font-serif text-lg font-bold text-primary tracking-tight">
                Fortis
              </a>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
            </div>
          </div>
          <SheetContent side="left" className={`w-64 p-0 flex flex-col ${themeClass} bg-card`}>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarInner activeTab={activeTab} onTabChange={onTabChange} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        {/* Spacer for fixed top bar */}
        <div className="h-14 md:hidden" />
      </>
    );
  }

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-card hidden md:flex flex-col">
      <SidebarInner activeTab={activeTab} onTabChange={onTabChange} />
    </aside>
  );
};

export default DashboardSidebar;
