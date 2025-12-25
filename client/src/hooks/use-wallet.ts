import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useWallet() {
  const {
    publicKey,
    connect: connectWallet,
    disconnect: disconnectWallet,
    connecting,
    connected,
    wallet,
    select
  } = useSolanaWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Format address for display (truncated)
  const address = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : null;
  const fullAddress = publicKey ? publicKey.toBase58() : null;

  // Fetch SOL balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setBalance(null);
      return;
    }

    try {
      setIsLoadingBalance(true);
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / LAMPORTS_PER_SOL;
      setBalance(sol);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [publicKey, connection]);

  // Fetch balance on wallet connect and periodically
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();

      // Poll balance every 10 seconds
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, fetchBalance]);

  // Auto-connect when wallet is selected
  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connectWallet().catch((err) => {
        console.error('Auto-connect failed:', err);
      });
    }
  }, [wallet, connected, connecting, connectWallet]);

  // Connect function - shows modal for wallet selection
  const connect = async () => {
    setShowModal(true);
  };

  // Disconnect function
  const disconnect = () => {
    try {
      disconnectWallet();
      setBalance(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return {
    address,
    fullAddress,
    balance,
    isLoadingBalance,
    connect,
    disconnect,
    isConnecting: connecting,
    isConnected: connected,
    publicKey,
    connection,
    showModal,
    setShowModal,
  };
}
