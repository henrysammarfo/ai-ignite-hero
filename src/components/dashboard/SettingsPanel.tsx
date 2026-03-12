import { useState, useCallback } from "react";
import { User, Bell, Shield, Key, Sun, Moon, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface NotificationPref {
  label: string;
  desc: string;
  key: string;
}

const notificationItems: NotificationPref[] = [
  { label: "Yield payouts", desc: "Get notified when yield is distributed", key: "yield" },
  { label: "Compliance alerts", desc: "KYC expiry, AML flags, Travel Rule issues", key: "compliance" },
  { label: "Large deposits/withdrawals", desc: "Transactions exceeding $100,000", key: "large_tx" },
  { label: "Weekly performance digest", desc: "Summary of vault performance and APY", key: "weekly" },
];

const defaultNotifs: Record<string, boolean> = {
  yield: true,
  compliance: true,
  large_tx: true,
  weekly: false,
};

type ThemeMode = "light" | "dark";

const SettingsPanel = () => {
  const { connected } = useWallet();
  const [notifs, setNotifs] = useState<Record<string, boolean>>(defaultNotifs);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [org, setOrg] = useState("Acme Capital AG");
  const [email, setEmail] = useState("treasury@acme-capital.ch");

  const toggleNotif = useCallback((key: string) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${next[key] ? "Enabled" : "Disabled"} notification`, { duration: 1500 });
      return next;
    });
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    // For now this is a placeholder — teammates will wire up real theme persistence
    // The dashboard already uses .dashboard-theme for light mode
    toast.success(`Theme set to ${mode}`, { duration: 1500 });
  };

  const handleSave = () => {
    toast.success("Settings saved successfully", { duration: 2000 });
  };

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-sans">Connect wallet to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground font-sans mt-1">Manage your account and vault preferences</p>
      </div>

      {/* Profile */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">Organization</label>
              <Input value={org} onChange={(e) => setOrg(e.target.value)} className="font-sans" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">Contact Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="font-sans" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">Jurisdiction</label>
            <Input defaultValue="Switzerland (FINMA regulated)" className="font-sans" disabled />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Palette size={16} className="text-muted-foreground" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all font-sans text-sm font-medium ${
                theme === "light"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Sun size={18} />
              Light
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all font-sans text-sm font-medium ${
                theme === "dark"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Moon size={18} />
              Dark
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-sans mt-3">
            Theme switching will be fully functional once integrated with the backend.
          </p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Bell size={16} className="text-muted-foreground" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground font-sans">{item.desc}</p>
              </div>
              <Switch
                checked={notifs[item.key]}
                onCheckedChange={() => toggleNotif(item.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-sans font-semibold flex items-center gap-2">
            <Shield size={16} className="text-muted-foreground" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground font-sans">Add an extra layer of security to your account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-sans text-xs"
              onClick={() => toast.info("2FA setup will be available after backend integration", { duration: 2500 })}
            >
              Enable 2FA
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans font-medium text-foreground">API Keys</p>
              <p className="text-xs text-muted-foreground font-sans">Manage programmatic access to your vault</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-sans text-xs gap-1"
              onClick={() => toast.info("API key management will be available after backend integration", { duration: 2500 })}
            >
              <Key size={12} /> Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="font-sans font-semibold rounded-lg">Save Changes</Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
