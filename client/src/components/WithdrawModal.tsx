import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { solanaTransactionService } from "@/services/solana-transactions";
import { TransactionStatusDisplay, TransactionStatus } from "@/components/TransactionStatus";
import { useQueryClient } from "@tanstack/react-query";

interface WithdrawModalProps {
    deposit: {
        id: number;
        amount: string;
        tokenSymbol: string;
        strategyId: number | null;
        txHash?: string | null;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function WithdrawModal({ deposit, isOpen, onClose, onSuccess }: WithdrawModalProps) {
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [txSignature, setTxSignature] = useState<string>('');
    const [txError, setTxError] = useState<string>('');
    const { toast } = useToast();
    const { address } = useWallet();
    const solanaWallet = useSolanaWallet();
    const queryClient = useQueryClient();
    const fullAddress = solanaWallet.publicKey?.toBase58() || "";

    if (!deposit) return null;

    const handleWithdraw = async () => {
        if (!address || !solanaWallet.publicKey) {
            toast({ title: "Wallet not connected", description: "Please connect your wallet first", variant: "destructive" });
            return;
        }

        try {
            setTxStatus('signing');
            setTxSignature('');
            setTxError('');

            toast({ title: "Please sign the transaction", description: "Check your wallet for approval" });

            // For MVP, we'll simulate a withdraw by sending SOL back to the user
            // In production, this would interact with the protocol to remove liquidity
            setTxStatus('sending');

            // Simulate withdraw transaction
            // In production, this would call a withdraw function on the protocol
            const result = await solanaTransactionService.sendSOLTransfer(
                solanaWallet,
                solanaWallet.publicKey.toBase58(), // Use full wallet address, not truncated
                parseFloat(deposit.amount)
            );

            if (!result.success) {
                setTxStatus('failed');
                setTxError(result.error || 'Transaction failed');
                toast({
                    title: "Withdraw Failed",
                    description: result.error || 'Unknown error occurred',
                    variant: "destructive"
                });
                return;
            }

            setTxStatus('confirming');
            setTxSignature(result.signature);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const status = await solanaTransactionService.getTransactionStatus(result.signature);

            if (status.confirmed) {
                setTxStatus('confirmed');

                // Update deposit status in database to 'withdrawn'
                try {
                    console.log('Updating deposit status to withdrawn for ID:', deposit.id);
                    const response = await fetch(`/api/deposits?id=${deposit.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'withdrawn' }),
                    });
                    const result = await response.json();
                    console.log('Deposit status update response:', result);

                    // Invalidate the deposits query cache to force refresh
                    await queryClient.invalidateQueries({
                        queryKey: ['deposits', fullAddress]
                    });
                    console.log('Query cache invalidated for deposits');
                } catch (error) {
                    console.error('Failed to update deposit status:', error);
                    // Don't fail the whole flow if database update fails
                }

                toast({
                    title: "Withdraw Successful!",
                    description: `You withdrew ${deposit.amount} ${deposit.tokenSymbol}`
                });

                setTimeout(() => {
                    setTxStatus('idle');
                    onSuccess(); // Refresh deposits
                    onClose();
                }, 2000);
            } else {
                setTxStatus('failed');
                setTxError(status.error || 'Transaction not confirmed');
                toast({
                    title: "Transaction Not Confirmed",
                    description: status.error || 'Please check Solana Explorer',
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error('Withdraw error:', error);
            setTxStatus('failed');
            setTxError(error instanceof Error ? error.message : 'Unknown error');
            toast({
                title: "Withdraw Failed",
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive"
            });
        }
    };

    const handleClose = () => {
        if (txStatus !== 'signing' && txStatus !== 'sending' && txStatus !== 'confirming') {
            setTxStatus('idle');
            setTxSignature('');
            setTxError('');
            onClose();
        }
    };

    const explorerUrl = txSignature ? solanaTransactionService.getExplorerUrl(txSignature) : undefined;
    const isProcessing = txStatus === 'signing' || txStatus === 'sending' || txStatus === 'confirming';

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px] bg-card border-white/10 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display flex items-center gap-2">
                        Withdraw <span className="text-primary">{deposit.tokenSymbol}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Withdraw your deposited funds back to your wallet
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Transaction Status */}
                    <TransactionStatusDisplay
                        status={txStatus}
                        signature={txSignature}
                        error={txError}
                        explorerUrl={explorerUrl}
                    />

                    {/* Withdraw Details */}
                    <div className="bg-muted/30 rounded-lg p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount to Withdraw:</span>
                            <span className="font-mono font-medium">{deposit.amount} {deposit.tokenSymbol}</span>
                        </div>
                        {deposit.txHash && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Original Deposit:</span>
                                <span className="font-mono text-xs truncate max-w-[200px]">{deposit.txHash}</span>
                            </div>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-500">
                            <p className="font-semibold mb-1">Important</p>
                            <p>Withdrawing will remove your position from the strategy. You will stop earning yield.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            {txStatus === 'confirmed' ? 'Close' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={isProcessing || txStatus === 'confirmed'}
                            variant="destructive"
                            className="min-w-[120px]"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isProcessing ? "Processing..." : txStatus === 'confirmed' ? "Completed" : "Confirm Withdraw"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
