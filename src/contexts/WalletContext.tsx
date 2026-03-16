import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface WalletContextType {
  connected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  connect: () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

const MOCK_ADDRESS = "7xKX...q3Fp";
const MOCK_FULL_ADDRESS = "7xKXRbNmJfN8TZrGpE9xYQ2q3Fp";

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => setConnected(true), []);
  const disconnect = useCallback(() => setConnected(false), []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address: connected ? MOCK_ADDRESS : null,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
