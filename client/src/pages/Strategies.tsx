import { useState, useMemo } from "react";
import { useStrategies } from "@/hooks/use-strategies";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DepositModal } from "@/components/DepositModal";
import { Strategy } from "@shared/schema";
import { Info, TrendingUp, Lock, Filter, ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "apy-high" | "apy-low" | "tvl-high" | "tvl-low" | "risk-low" | "risk-high";
type FilterOption = "all" | "Raydium" | "Orca" | "Solend" | "Meteora";

export default function Strategies() {
  const { data: strategies, isLoading, error } = useStrategies();
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("apy-high");
  const [filterProtocol, setFilterProtocol] = useState<FilterOption>("all");

  const handleDepositClick = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setIsModalOpen(true);
  };

  // Filter and sort strategies
  const filteredAndSortedStrategies = useMemo(() => {
    if (!strategies) return [];

    // Filter by protocol
    let filtered = filterProtocol === "all"
      ? strategies
      : strategies.filter(s => s.protocol === filterProtocol);

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "apy-high":
          return parseFloat(b.apy) - parseFloat(a.apy);
        case "apy-low":
          return parseFloat(a.apy) - parseFloat(b.apy);
        case "tvl-high":
          return Number(b.tvl) - Number(a.tvl);
        case "tvl-low":
          return Number(a.tvl) - Number(b.tvl);
        case "risk-low":
          return a.riskScore - b.riskScore;
        case "risk-high":
          return b.riskScore - a.riskScore;
        default:
          return 0;
      }
    });

    return sorted;
  }, [strategies, filterProtocol, sortBy]);

  if (isLoading) return <div className="p-8 space-y-4">
    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
  </div>;

  if (error) return <div className="p-8 text-destructive">Error loading strategies</div>;

  return (
    <TooltipProvider>
      <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Yield Strategies</h2>
          <p className="text-muted-foreground">Deposit assets into automated yield farming protocols.</p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterProtocol} onValueChange={(value) => setFilterProtocol(value as FilterOption)}>
              <SelectTrigger className="w-[180px] bg-card/40 border-white/10">
                <SelectValue placeholder="Filter by protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="Raydium">Raydium</SelectItem>
                <SelectItem value="Orca">Orca</SelectItem>
                <SelectItem value="Solend">Solend</SelectItem>
                <SelectItem value="Meteora">Meteora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] bg-card/40 border-white/10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apy-high">APY: High to Low</SelectItem>
                <SelectItem value="apy-low">APY: Low to High</SelectItem>
                <SelectItem value="tvl-high">TVL: High to Low</SelectItem>
                <SelectItem value="tvl-low">TVL: Low to High</SelectItem>
                <SelectItem value="risk-low">Risk: Low to High</SelectItem>
                <SelectItem value="risk-high">Risk: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Strategy Cards */}
        <div className="space-y-4">
          {filteredAndSortedStrategies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No strategies found matching your filters</p>
              <Button
                variant="ghost"
                onClick={() => setFilterProtocol("all")}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredAndSortedStrategies.map((strategy) => (
              <div
                key={strategy.id}
                className="group relative bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:bg-card/60 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <span className="font-bold text-lg">{strategy.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{strategy.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="bg-white/5 px-2 py-0.5 rounded text-white/70">{strategy.protocol}</span>
                        <span>•</span>
                        <span>Single-Sided</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">APY</div>
                      <div className="text-2xl font-bold font-mono text-secondary flex items-center gap-2">
                        {strategy.apy}%
                        <TrendingUp className="w-4 h-4 text-secondary/70" />
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">TVL</div>
                      <div className="text-xl font-mono text-white/90">
                        ${Number(strategy.tvl).toLocaleString()}
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        Risk Score
                        <Tooltip>
                          <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                          <TooltipContent>1 (Safe) - 10 (Degen)</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full ${strategy.riskScore < 4 ? 'bg-secondary' :
                                strategy.riskScore < 7 ? 'bg-yellow-500' : 'bg-destructive'
                              }`}
                            style={{ width: `${strategy.riskScore * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{strategy.riskScore}/10</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDepositClick(strategy)}
                    className="bg-primary hover:bg-primary/80 text-white font-semibold shadow-lg shadow-primary/20"
                  >
                    Deposit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DepositModal
          strategy={selectedStrategy}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
