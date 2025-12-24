import { useStrategies } from "@/hooks/use-strategies";
import { useDeposits } from "@/hooks/use-deposits";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Shield, Wallet, Layers, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart
const chartData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 4200 },
  { name: 'Wed', value: 4100 },
  { name: 'Thu', value: 4800 },
  { name: 'Fri', value: 5100 },
  { name: 'Sat', value: 5400 },
  { name: 'Sun', value: 6000 },
];

export default function Dashboard() {
  const { address } = useWallet();
  const { data: strategies, isLoading: strategiesLoading } = useStrategies();
  const { data: deposits, isLoading: depositsLoading } = useDeposits(address || "");

  const totalDeposited = deposits?.reduce((acc, d) => acc + Number(d.amount), 0) || 0;
  const activeStrategiesCount = deposits?.length || 0;
  
  // Calculate weighted average APY roughly
  const avgApy = strategies && strategies.length > 0 
    ? strategies.reduce((acc, s) => acc + Number(s.apy), 0) / strategies.length 
    : 0;

  if (strategiesLoading) {
    return <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Overview</h2>
          <p className="text-muted-foreground mt-1">Your yield aggregation performance at a glance.</p>
        </div>
        {!address && (
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Connect wallet to see personal data
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
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

        <Card className="glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average APY</CardTitle>
            <Layers className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">
              {avgApy.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all active strategies</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Exposure</CardTitle>
            <Shield className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-white">Low</div>
            <div className="w-full bg-muted/50 h-2 mt-3 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-[25%]" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Diversified across {activeStrategiesCount} protocols</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-none p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Yield Performance</h3>
          <select className="bg-background/50 border border-white/10 rounded-lg text-sm px-3 py-1">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
