import { useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { wallets, select, connect, connecting } = useSolanaWallet();

    const handleWalletClick = async (walletName: any) => {
        try {
            select(walletName);
            // Give time for the wallet to be selected, then connect
            setTimeout(async () => {
                try {
                    await connect();
                } catch (error) {
                    console.error('Connection error:', error);
                }
            }, 100);
            onClose();
        } catch (error) {
            console.error('Wallet selection error:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                    <DialogDescription>
                        Choose a wallet to connect to Solana testnet
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                    {wallets.length > 0 ? (
                        wallets.map((wallet) => (
                            <Button
                                key={wallet.adapter.name}
                                onClick={() => handleWalletClick(wallet.adapter.name as any)}
                                variant="outline"
                                className="justify-start gap-3 h-14"
                            >
                                {wallet.adapter.icon && (
                                    <img
                                        src={wallet.adapter.icon}
                                        alt={wallet.adapter.name}
                                        className="w-6 h-6"
                                    />
                                )}
                                <span className="font-medium">{wallet.adapter.name}</span>
                                {wallet.readyState === 'Installed' && (
                                    <span className="ml-auto text-xs text-green-500">Detected</span>
                                )}
                            </Button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="mb-4">No wallet detected</p>
                            <p className="text-sm">
                                Please install a Solana wallet extension like{' '}
                                <a
                                    href="https://phantom.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Phantom
                                </a>
                                {' '}or{' '}
                                <a
                                    href="https://solflare.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Solflare
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
