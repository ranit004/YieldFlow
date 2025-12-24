import { Link, useLocation } from "wouter";
import { LayoutDashboard, TrendingUp, Wallet, Settings, Activity, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/strategies", label: "Yield Strategies", icon: TrendingUp },
    { href: "/portfolio", label: "My Portfolio", icon: Wallet },
    { href: "/risk", label: "Risk Analysis", icon: ShieldCheck },
  ];

  return (
    <div className="w-64 h-screen bg-card/30 backdrop-blur-md border-r border-border fixed left-0 top-0 hidden md:flex flex-col z-20">
      <div className="p-8">
        <h1 className="text-2xl font-display font-bold text-gradient">
          YieldFlow
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">SOLANA TESTNET</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}>
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold text-secondary">SYSTEM STATUS</span>
        </div>
        <p className="text-xs text-muted-foreground">Auto-Rebalancer is active and optimizing yields.</p>
      </div>
    </div>
  );
}
