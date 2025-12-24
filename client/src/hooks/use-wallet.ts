// A simulated wallet hook since we don't have real web3 provider
import { useState, useEffect } from "react";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Persist simulated session
    const stored = localStorage.getItem("mock_wallet_address");
    if (stored) setAddress(stored);
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockAddress = "8x...39a2"; // Simulated SOL address
    setAddress(mockAddress);
    localStorage.setItem("mock_wallet_address", mockAddress);
    setIsConnecting(false);
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("mock_wallet_address");
  };

  return { address, connect, disconnect, isConnecting, isConnected: !!address };
}
