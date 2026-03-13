import { createContext, useContext, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextType {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContextCustom = createContext<WalletContextType>({
  connected: false,
  address: null,
  publicKey: null,
  connect: () => { },
  disconnect: () => { },
});

export const useWallet = () => {
  const solanaWallet = useSolanaWallet();
  return {
    connected: solanaWallet.connected,
    address: solanaWallet.publicKey?.toBase58() || null,
    publicKey: solanaWallet.publicKey?.toBase58() || null,
    connect: solanaWallet.connect,
    disconnect: solanaWallet.disconnect,
  };
};

export const AppWalletProvider = ({ children }: { children: ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
