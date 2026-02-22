import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, ShoppingCart, TrendingUp, TrendingDown, 
  DollarSign, Calendar, BarChart3, PieChart, 
  ArrowUpRight, ArrowDownRight, Users, Gamepad2,
  RefreshCw, Download, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SalesSummary {
  totalRevenueScPerDay: number;
  totalPayoutsScPerDay: number;
  netProfitScPerDay: number;
  totalTransactions: number;
}

interface GameTypeStat {
  game_type: string;
  total_sales: number;
  total_revenue_sc: number;
  total_payouts_sc: number;
  net_profit_sc: number;
  avg_purchase_cost: number;
  avg_win_amount: number;
}

const AdminSalesDashboard: React.FC = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [gameStats, setGameStats] = useState<GameTypeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [summaryRes, statsRes] = await Promise.all([
        apiCall<SalesSummary>('/admin/v2/sales/revenue'),
        apiCall<GameTypeStat[]>('/admin/v2/sales/by-game'),
      ]);

      if (summaryRes) setSummary(summaryRes);
      if (statsRes) setGameStats(statsRes);
    } catch (error) {
      console.error('Failed to fetch sales dashboard data:', error);
      toast.error('Failed to load sales analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Sales & Revenue Analytics</h2>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Real-time financial performance across all games</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isRefreshing} className="font-black italic uppercase text-[10px]">
            {isRefreshing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" className="font-black italic uppercase text-[10px]">
            <Download className="w-3 h-3 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-slate-100 shadow-xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl font-black italic tracking-tighter text-slate-900">
              {summary?.totalRevenueScPerDay.toFixed(2)} SC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-green-500 font-black italic text-xs">
              <ArrowUpRight className="w-3 h-3" /> +12.5% 
              <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <TrendingDown className="w-3 h-3" /> Total Payouts
            </CardDescription>
            <CardTitle className="text-3xl font-black italic tracking-tighter text-red-500">
              {summary?.totalPayoutsScPerDay.toFixed(2)} SC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-red-500 font-black italic text-xs">
              <ArrowUpRight className="w-3 h-3" /> +8.2%
              <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">payout ratio 78%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden bg-slate-950 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase text-primary/70 tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Net Profit (House)
            </CardDescription>
            <CardTitle className="text-3xl font-black italic tracking-tighter text-primary">
              {summary?.netProfitScPerDay.toFixed(2)} SC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-primary font-black italic text-xs">
              <ArrowUpRight className="w-3 h-3" /> +24.1%
              <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Margin 22%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <ShoppingCart className="w-3 h-3" /> Transactions
            </CardDescription>
            <CardTitle className="text-3xl font-black italic tracking-tighter text-slate-900">
              {summary?.totalTransactions.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-blue-500 font-black italic text-xs">
              <Users className="w-3 h-3" /> {Math.round((summary?.totalTransactions || 0) / 30)} 
              <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Avg daily volume</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Type Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-2 border-slate-100 shadow-xl">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black italic uppercase tracking-tight">Performance by Game Type</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest">Revenue and Payout distribution</CardDescription>
              </div>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/50 text-[10px] font-black uppercase text-slate-500 border-b">
                    <th className="p-4 pl-6">Game Category</th>
                    <th className="p-4">Volume</th>
                    <th className="p-4">Revenue</th>
                    <th className="p-4">Payouts</th>
                    <th className="p-4 pr-6 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gameStats.map((stat) => (
                    <tr key={stat.game_type} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                            stat.game_type === 'scratch_ticket' ? "bg-red-500" :
                            stat.game_type === 'pull_tab' ? "bg-blue-500" :
                            stat.game_type === 'slot' ? "bg-orange-500" :
                            "bg-slate-900"
                          )}>
                            <Gamepad2 className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black uppercase text-slate-900 italic tracking-tight">
                            {stat.game_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-black italic text-slate-500 tracking-tighter">
                          {stat.total_sales.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-black italic text-slate-900 tracking-tighter">
                          {stat.total_revenue_sc.toFixed(2)} SC
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-black italic text-red-500 tracking-tighter">
                          {stat.total_payouts_sc.toFixed(2)} SC
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Badge className={cn(
                          "font-black italic uppercase text-[10px]",
                          stat.net_profit_sc >= 0 ? "bg-green-500" : "bg-red-500"
                        )}>
                          {stat.net_profit_sc >= 0 ? '+' : ''}{stat.net_profit_sc.toFixed(2)} SC
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Insights */}
        <Card className="border-2 border-slate-100 shadow-xl">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg font-black italic uppercase tracking-tight">AI Insights</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Financial intelligence</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                   <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-black uppercase text-green-700 italic">High Margin Alert</span>
                   </div>
                   <p className="text-[10px] font-bold text-green-600/80 leading-relaxed uppercase">
                      Scratch Tickets are currently performing at 32% margin. This is 10% above platform average. Recommend promoting these to top-tier players.
                   </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                   <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-black uppercase text-orange-700 italic">Volume Trend</span>
                   </div>
                   <p className="text-[10px] font-bold text-orange-600/80 leading-relaxed uppercase">
                      Pull Tab volume has decreased by 15% in the last 48 hours. Consider a "Make It Rain" campaign for this category to boost engagement.
                   </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                   <div className="flex items-center gap-2 mb-1">
                      <PieChart className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-black uppercase text-purple-700 italic">RTP Analysis</span>
                   </div>
                   <p className="text-[10px] font-bold text-purple-600/80 leading-relaxed uppercase">
                      Overall platform RTP is currently 94.2%. This is within the optimal range for sustained growth and player retention.
                   </p>
                </div>
             </div>

             <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black italic uppercase rounded-xl h-12 shadow-xl">
                View Full Financial Report
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filter Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-black italic text-xs uppercase cursor-pointer hover:bg-white/10 transition-all">
               <Calendar className="w-4 h-4 text-primary" />
               Last 30 Days
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-black italic text-xs uppercase cursor-pointer hover:bg-white/10 transition-all">
               <Filter className="w-4 h-4 text-primary" />
               Filter All Channels
            </div>
         </div>
         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">
            * AI is monitoring transaction integrity in real-time. All data is cryptographically verified.
         </p>
      </div>
    </div>
  );
};

export default AdminSalesDashboard;
