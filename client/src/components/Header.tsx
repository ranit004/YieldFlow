import { useWallet } from "@/hooks/use-wallet";
import { Bell, Search, Menu, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletModal } from "@/components/WalletModal";

export function Header() {
  const { isConnected, connect, disconnect, address, isConnecting, balance, isLoadingBalance, showModal, setShowModal } = useWallet();

  return (
    <>
      <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md fixed top-0 right-0 left-0 md:left-64 z-10 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6" />
          </Button>
          <span className="font-bold text-xl">YieldFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search protocols..."
              className="w-full bg-muted/50 border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </Button>

          {isConnected ? (
            <div className="flex items-center gap-2">
              {balance !== null && !isLoadingBalance && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-primary/20">
                  <WalletIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{balance.toFixed(4)} SOL</span>
                </div>
              )}
              <Button
                onClick={disconnect}
                variant="outline"
                className="rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary font-mono"
              >
                {address}
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </header>

      <WalletModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
