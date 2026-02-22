import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, TrendingUp, TrendingDown, DollarSign, Calendar, Info, History, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Transaction {
  id: number;
  game_type: string;
  design_id?: number;
  purchase_cost_sc: number;
  win_amount_sc: number;
  created_at: string;
}

export const SalesHistorySection: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPurchased: 0,
    totalWon: 0,
    netProfit: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<Transaction[]>('/sales/history');
      if (response) {
        setTransactions(response);
        
        // Calculate stats
        const totalPurchased = response.reduce((sum, t) => sum + Number(t.purchase_cost_sc), 0);
        const totalWon = response.reduce((sum, t) => sum + Number(t.win_amount_sc), 0);
        setStats({
          totalPurchased,
          totalWon,
          netProfit: totalWon - totalPurchased,
          transactionCount: response.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch sales history:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Purchase History</CardTitle>
              <CardDescription>View your social store transactions</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-black italic bg-primary/10 text-primary border-primary/20">
              {stats.transactionCount} TRANSACTIONS
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b">
          <div className="p-6 border-r text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Purchased</p>
            <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
              {stats.totalPurchased.toFixed(2)} SC
            </p>
          </div>
          <div className="p-6 border-r text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Returns</p>
            <p className="text-2xl font-black text-green-500 italic tracking-tighter">
              {stats.totalWon.toFixed(2)} SC
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Net Outcome</p>
            <p className={cn(
              "text-2xl font-black italic tracking-tighter",
              stats.netProfit >= 0 ? "text-primary" : "text-red-500"
            )}>
              {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)} SC
            </p>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-500 border-b">
                <th className="p-4 pl-6">Purchase Type</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Returns</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-bold italic">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No transactions found in your history
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                          t.game_type === 'scratch_ticket' ? "bg-red-500" :
                          t.game_type === 'pull_tab' ? "bg-blue-500" :
                          "bg-slate-900"
                        )}>
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-900 italic tracking-tight">
                            {t.game_type.replace('_', ' ')}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">Design ID: #{t.design_id || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-black italic text-slate-500 tracking-tighter">
                        -{t.purchase_cost_sc.toFixed(2)} SC
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-sm font-black italic tracking-tighter",
                        t.win_amount_sc > 0 ? "text-green-500" : "text-slate-400"
                      )}>
                        {t.win_amount_sc > 0 ? `+${t.win_amount_sc.toFixed(2)}` : '0.00'} SC
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[8px] font-black uppercase bg-green-50 text-green-600 border-green-200">
                        COMPLETED
                      </Badge>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-900">
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="p-6 bg-slate-50 border-t">
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase mb-1 italic">Note on Social Casino Play</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                This history shows specific scratch ticket and pull tab purchases. For general slots and casino game history, please visit the Statistics section of your profile.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
