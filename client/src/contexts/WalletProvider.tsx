import React, { createContext, useContext, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';

// Solana testnet RPC endpoint
const SOLANA_TESTNET_RPC = "https://api.testnet.solana.com";

interface WalletContextProviderProps {
    children: React.ReactNode;
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
    // Use testnet
    const endpoint = useMemo(() => SOLANA_TESTNET_RPC, []);

    // We'll use an empty wallets array for now since wallet-adapter-wallets failed to install
    // Users can still connect via browser wallet extensions
    const wallets = useMemo(() => [], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                {children}
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
}
