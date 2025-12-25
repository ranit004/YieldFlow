import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, Layers, Globe, Wallet, TrendingUp, ShieldAlert, ArrowUpRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStrategies } from "@/hooks/use-strategies";
import { useDeposits } from "@/hooks/use-deposits";
import { useWallet } from "@/hooks/use-wallet";

const chartData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
  { name: "Jul", value: 3490 },
];

export default function Dashboard() {
  const { address } = useWallet();
  const { data: strategies } = useStrategies();
  const { data: deposits } = useDeposits(address || "");

  const totalDeposited = deposits?.reduce((acc, d) => acc + Number(d.amount), 0) || 0;
  const activeStrategiesCount = deposits?.length || 0;
  
  const avgApy = strategies && strategies.length > 0 
    ? strategies.reduce((acc, s) => acc + Number(s.apy), 0) / strategies.length 
    : 0;

  const { data: solanaStats } = useQuery({
    queryKey: ["/api/solana/stats"],
    queryFn: async () => {
      const res = await fetch("/api/solana/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 5000 
  });

  const { data: activityFeed } = useQuery({
    queryKey: ["/api/solana/feed"],
    queryFn: async () => {
      const res = await fetch("/api/solana/feed");
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
    refetchInterval: 3000
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            DeFi Yield Aggregator
          </h1>
          <p className="text-muted-foreground mt-1">Real-time Solana testnet performance & yield tracking.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-primary/20 text-xs">
          <div className={`w-2 h-2 rounded-full ${solanaStats?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span>Solana Testnet: {solanaStats?.tps || 0} TPS</span>
          <span className="text-muted-foreground">Slot: {solanaStats?.slot || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-elevate glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">
              ${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-secondary flex items-center"><ArrowUpRight className="w-3 h-3" /> +12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average APY</CardTitle>
            <Layers className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">
              {avgApy.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all active strategies</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Strategies</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">
              {activeStrategiesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across 4 protocols</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">Low</div>
            <p className="text-xs text-muted-foreground mt-1">Score: 2/10</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 hover-elevate glass-panel border-none p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Yield Performance</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live World Activity Feed */}
        <Card className="col-span-3 hover-elevate glass-panel border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-4 w-4 text-accent" />
              Live World Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {activityFeed?.map((item: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {item.type === 'SWAP' ? <Zap size={14} /> : <Activity size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.protocol}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground truncate w-16">{item.hash}</p>
                    <p className="text-[10px] text-muted-foreground">Just now</p>
                  </div>
                </motion.div>
              ))}
              {!activityFeed && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Connecting to Solana Testnet...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}