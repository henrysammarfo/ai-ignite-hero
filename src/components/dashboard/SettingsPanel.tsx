import { Settings, User, Bell, Shield, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useWallet } from "@/contexts/WalletContext";

const SettingsPanel = () => {
  const { connected } = useWallet();

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
              <Input defaultValue="Acme Capital AG" className="font-sans" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">Contact Email</label>
              <Input defaultValue="treasury@acme-capital.ch" className="font-sans" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-2 block">Jurisdiction</label>
            <Input defaultValue="Switzerland (FINMA regulated)" className="font-sans" disabled />
          </div>
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
          {[
            { label: "Yield payouts", desc: "Get notified when yield is distributed", default: true },
            { label: "Compliance alerts", desc: "KYC expiry, AML flags, Travel Rule issues", default: true },
            { label: "Large deposits/withdrawals", desc: "Transactions exceeding $100,000", default: true },
            { label: "Weekly performance digest", desc: "Summary of vault performance and APY", default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground font-sans">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
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
            <Button variant="outline" size="sm" className="font-sans text-xs">Enable 2FA</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans font-medium text-foreground">API Keys</p>
              <p className="text-xs text-muted-foreground font-sans">Manage programmatic access to your vault</p>
            </div>
            <Button variant="outline" size="sm" className="font-sans text-xs gap-1">
              <Key size={12} /> Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="font-sans font-semibold rounded-lg">Save Changes</Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
