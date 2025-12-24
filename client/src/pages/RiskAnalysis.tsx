import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Zap, ShieldCheck, FileCheck } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'Smart Contract', A: 120, fullMark: 150 },
  { subject: 'Liquidity', A: 98, fullMark: 150 },
  { subject: 'Volatility', A: 86, fullMark: 150 },
  { subject: 'Audit Score', A: 99, fullMark: 150 },
  { subject: 'Team', A: 85, fullMark: 150 },
  { subject: 'Time in Market', A: 65, fullMark: 150 },
];

export default function RiskAnalysis() {
  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Risk Analysis</h2>
        <p className="text-muted-foreground">Real-time risk scoring and safety parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="glass-panel border-none">
          <CardHeader>
            <CardTitle>Portfolio Risk Profile</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="My Portfolio" dataKey="A" stroke="#9333ea" fill="#9333ea" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card/40 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Flash Loan Protection</CardTitle>
              <Zap className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Monitoring for sandwich attacks</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audit Status</CardTitle>
              <FileCheck className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Verified</div>
              <p className="text-xs text-muted-foreground mt-1">All contracts audited by Certik</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-destructive/20 col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold text-white">92<span className="text-xl text-muted-foreground">/100</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Excellent safety rating</p>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold border border-green-500/20">
                  LOW RISK
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-4">
        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-orange-500">Risk Disclaimer</h4>
          <p className="text-sm text-muted-foreground mt-1">
            DeFi protocols carry inherent risks including smart contract vulnerabilities and imperfect liquidity. 
            YieldFlow aggregates third-party protocols and does not guarantee the safety of underlying funds. 
            Always do your own research.
          </p>
        </div>
      </div>
    </div>
  );
}
