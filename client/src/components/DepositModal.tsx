import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateDeposit } from "@/hooks/use-deposits";
import { useToast } from "@/hooks/use-toast";
import { Strategy } from "@shared/schema";
import { Loader2, TrendingUp } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

interface DepositModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ strategy, isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const { mutate, isPending } = useCreateDeposit();
  const { toast } = useToast();
  const { address } = useWallet();

  if (!strategy) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast({ title: "Wallet not connected", description: "Please connect your wallet first", variant: "destructive" });
      return;
    }

    mutate({
      walletAddress: address,
      strategyId: strategy.id,
      amount: amount,
      tokenSymbol: strategy.name.split(" ")[0] || "USDC", // Naive token extraction
      status: "confirmed", // Simulating instant success
    }, {
      onSuccess: () => {
        toast({ title: "Deposit Successful", description: `You deposited ${amount} into ${strategy.name}` });
        onClose();
        setAmount("");
      },
      onError: (err) => {
        toast({ title: "Deposit Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  // Rough estimation
  const estimatedMonthly = amount ? (parseFloat(amount) * (parseFloat(strategy.apy) / 100) / 12).toFixed(4) : "0.00";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                className="bg-background/50 border-white/10 font-mono text-lg pl-4 pr-16"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                USDC
              </div>
            </div>
          </div>

          <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
            <div className="flex items-center gap-2 text-secondary mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">Estimated Yield</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Earnings:</span>
              <span className="font-mono font-medium text-foreground">~{estimatedMonthly} USDC</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isPending || !amount || !address}
              className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isPending ? "Confirming..." : "Confirm Deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
