import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Strategy } from "@shared/schema";
import { Loader2, TrendingUp, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { solanaTransactionService } from "@/services/solana-transactions";
import { RAYDIUM_POOLS } from "@/services/raydium-service";
import { TransactionStatusDisplay, TransactionStatus } from "@/components/TransactionStatus";
import { useCreateDeposit } from "@/hooks/use-deposits";


interface DepositModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ strategy, isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txSignature, setTxSignature] = useState<string>('');
  const [txError, setTxError] = useState<string>('');
  const { toast } = useToast();
  const { address, balance, isConnected } = useWallet();
  const solanaWallet = useSolanaWallet();
  const { mutate: createDeposit } = useCreateDeposit();

  if (!strategy) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !solanaWallet.publicKey) {
      toast({ title: "Wallet not connected", description: "Please connect your wallet first", variant: "destructive" });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (balance && depositAmount > balance) {
      toast({ title: "Insufficient balance", description: `You only have ${balance.toFixed(4)} SOL`, variant: "destructive" });
      return;
    }

    try {
      // Reset status
      setTxStatus('signing');
      setTxSignature('');
      setTxError('');

      // Get pool address for the strategy
      const poolAddress = RAYDIUM_POOLS['SOL-USDC'].address;

      // Show signing status
      toast({ title: "Please sign the transaction", description: "Check your wallet for approval" });

      // Send transaction
      setTxStatus('sending');
      const result = await solanaTransactionService.depositToRaydium(
        solanaWallet,
        depositAmount,
        poolAddress
      );

      if (!result.success) {
        setTxStatus('failed');
        setTxError(result.error || 'Transaction failed');
        toast({
          title: "Transaction Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive"
        });
        return;
      }

      // Transaction sent, now confirming
      setTxStatus('confirming');
      setTxSignature(result.signature);

      // Wait a bit for confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check status
      const status = await solanaTransactionService.getTransactionStatus(result.signature);

      if (status.confirmed) {
        setTxStatus('confirmed');

        // Save deposit to database with FULL wallet address
        const fullWalletAddress = solanaWallet.publicKey?.toBase58() || address;
        createDeposit({
          walletAddress: fullWalletAddress, // Use full address, not truncated!
          strategyId: strategy.id,
          amount: amount,
          tokenSymbol: 'SOL',
          status: 'confirmed',
          txHash: result.signature,
        }, {
          onSuccess: () => {
            console.log('Deposit saved to database with address:', fullWalletAddress);
          },
          onError: (error) => {
            console.error('Failed to save deposit to database:', error);
          }
        });

        toast({
          title: "Deposit Successful!",
          description: `You deposited ${amount} SOL into ${strategy.name}`
        });

        // Reset form after success
        setTimeout(() => {
          setAmount("");
          setTxStatus('idle');
          onClose();
        }, 3000);
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
      console.error('Deposit error:', error);
      setTxStatus('failed');
      setTxError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      // Reserve 0.01 SOL for transaction fees
      const maxAmount = Math.max(0, balance - 0.01);
      setAmount(maxAmount.toFixed(6));
    }
  };

  const handleClose = () => {
    if (txStatus !== 'signing' && txStatus !== 'sending' && txStatus !== 'confirming') {
      setAmount("");
      setTxStatus('idle');
      setTxSignature('');
      setTxError('');
      onClose();
    }
  };

  // Rough estimation
  const estimatedMonthly = amount ? (parseFloat(amount) * (parseFloat(strategy.apy) / 100) / 12).toFixed(4) : "0.00";
  const estimatedYearly = amount ? (parseFloat(amount) * (parseFloat(strategy.apy) / 100)).toFixed(4) : "0.00";

  const explorerUrl = txSignature ? solanaTransactionService.getExplorerUrl(txSignature) : undefined;
  const isProcessing = txStatus === 'signing' || txStatus === 'sending' || txStatus === 'confirming';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            Deposit into <span className="text-primary">{strategy.name}</span>
          </DialogTitle>
          <DialogDescription>
            Current APY: <span className="text-secondary font-bold">{strategy.apy}%</span>.
            Risk Score: {strategy.riskScore}/10
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Transaction Status */}
          <TransactionStatusDisplay
            status={txStatus}
            signature={txSignature}
            error={txError}
            explorerUrl={explorerUrl}
          />

          {/* Wallet Balance Display */}
          {isConnected && balance !== null && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span>Wallet Balance:</span>
              </div>
              <span className="font-mono font-medium">{balance.toFixed(4)} SOL</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Deposit</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50 border-white/10 font-mono text-lg pl-4 pr-24"
                required
                disabled={isProcessing}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxClick}
                  className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                  disabled={!isConnected || balance === null || isProcessing}
                >
                  MAX
                </Button>
                <span className="text-muted-foreground font-mono text-sm">SOL</span>
              </div>
            </div>
            {amount && balance && parseFloat(amount) > balance && (
              <p className="text-xs text-destructive">Insufficient balance</p>
            )}
          </div>

          <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20 space-y-2">
            <div className="flex items-center gap-2 text-secondary mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">Estimated Yield</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Earnings:</span>
              <span className="font-mono font-medium text-foreground">~{estimatedMonthly} SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yearly Earnings:</span>
              <span className="font-mono font-medium text-secondary">~{estimatedYearly} SOL</span>
            </div>
          </div>

          {!isConnected && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500">Please connect your wallet to deposit</p>
            </div>
          )}

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
              type="submit"
              disabled={isProcessing || !amount || !address || (balance !== null && parseFloat(amount) > balance) || txStatus === 'confirmed'}
              className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isProcessing ? "Processing..." : txStatus === 'confirmed' ? "Completed" : "Confirm Deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
