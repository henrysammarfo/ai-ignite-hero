import { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { ThemedDialogContent, Dialog, DialogHeader, DialogTitle, DialogDescription } from "./ThemedDialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, called after successful connection instead of default wallet context */
  onConnected?: (walletName: string) => void;
}

const WalletConnectModal = ({ open, onOpenChange, onConnected }: WalletConnectModalProps) => {
  const { connect } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (walletName: string) => {
    setConnecting(walletName);
    toast.loading(`Connecting ${walletName}...`, { id: "wallet-connect" });

    setTimeout(() => {
      setConnecting(null);
      connect();
      toast.success(`${walletName} connected on Solana Devnet`, { id: "wallet-connect" });
      onOpenChange(false);
      onConnected?.(walletName);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Connect Wallet</DialogTitle>
          <DialogDescription className="font-sans text-xs">
            Select a Solana wallet to connect. Currently on <span className="text-primary font-medium">Devnet / Testnet</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14 font-sans text-sm"
            onClick={() => handleConnect("Phantom")}
            disabled={!!connecting}
          >
            {connecting === "Phantom" ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <img
                src="https://raw.githubusercontent.com/nicnocquee/cryptocurrency-icons/master/icons/sol.svg"
                alt=""
                className="w-5 h-5"
              />
            )}
            <div className="text-left">
              <p className="font-medium text-foreground">Phantom</p>
              <p className="text-[10px] text-muted-foreground">Most popular Solana wallet</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-14 font-sans text-sm"
            onClick={() => handleConnect("Solflare")}
            disabled={!!connecting}
          >
            {connecting === "Solflare" ? (
              <Loader2 size={20} className="animate-spin text-primary" />
            ) : (
              <Wallet size={20} className="text-muted-foreground" />
            )}
            <div className="text-left">
              <p className="font-medium text-foreground">Solflare</p>
              <p className="text-[10px] text-muted-foreground">Advanced Solana wallet</p>
            </div>
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground font-sans text-center pt-2">
          Your wallet will be verified for KYC/AML compliance before vault access is granted.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
