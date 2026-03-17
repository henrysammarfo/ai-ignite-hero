import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ThemedDialogContent, Dialog, DialogHeader, DialogTitle, DialogDescription } from "./ThemedDialog";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WalletConnectModal = ({ open, onOpenChange }: WalletConnectModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ThemedDialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Connect Wallet</DialogTitle>
          <DialogDescription className="font-sans text-xs">
            Select a Solana wallet to connect. Currently on <span className="text-primary font-medium">Devnet</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-6 pb-4">
          <WalletMultiButton className="!bg-primary !font-sans !rounded-lg !h-12 !px-8 hover:!bg-primary/90 transition-all font-semibold" />
        </div>

        <p className="text-[10px] text-muted-foreground font-sans text-center">
          Your wallet will be verified for KYC/AML compliance before vault access is granted.
        </p>
      </ThemedDialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
