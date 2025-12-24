import { useDeposits } from "@/hooks/use-deposits";
import { useRebalance } from "@/hooks/use-rebalance";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, AlertCircle, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Portfolio() {
  const { address } = useWallet();
  const { data: deposits, isLoading } = useDeposits(address || "");
  const { mutate: rebalance, isPending: isRebalancing } = useRebalance();
  const { toast } = useToast();
  const [autoRebalance, setAutoRebalance] = useState(false);

  const handleRebalance = () => {
    if (!address) return;
    rebalance(address, {
      onSuccess: (data) => {
        toast({ 
          title: "Rebalance Executed", 
          description: data.message 
        });
      },
      onError: () => {
        toast({ title: "Failed", variant: "destructive" });
      }
    });
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Connect Wallet</h2>
        <p className="text-muted-foreground max-w-sm">Please connect your wallet to view your portfolio and manage your deposits.</p>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Your Portfolio</h2>
          <p className="text-muted-foreground">Manage your active positions and optimization settings.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card/50 border border-white/5 p-4 rounded-xl backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-rebalance" 
              checked={autoRebalance}
              onCheckedChange={setAutoRebalance}
            />
            <Label htmlFor="auto-rebalance" className="cursor-pointer">Auto-Rebalance</Label>
          </div>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <Button 
            onClick={handleRebalance} 
            disabled={isRebalancing}
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            {isRebalancing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Rebalance Now
          </Button>
        </div>
      </div>

      {deposits && deposits.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-5 bg-muted/30 p-4 rounded-t-xl text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-2">Strategy</div>
            <div>Amount</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>
          
          {deposits.map((deposit) => (
            <div key={deposit.id} className="grid grid-cols-5 items-center bg-card/40 border border-white/5 p-4 rounded-xl hover:bg-card/60 transition-colors">
              <div className="col-span-2 font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  {deposit.tokenSymbol?.[0]}
                </div>
                {deposit.tokenSymbol} Strategy
              </div>
              <div className="font-mono">{deposit.amount} {deposit.tokenSymbol}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  deposit.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {deposit.status.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Withdraw
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-muted bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold mb-2">No active deposits</h3>
            <p className="text-muted-foreground mb-6">Start earning yield by depositing into a strategy.</p>
            <Button asChild className="bg-primary text-white">
              <a href="/strategies">View Strategies</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
