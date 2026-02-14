import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { wallet } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Send, Download, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Transaction } from '@shared/api';

const Wallet = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await wallet.getTransactions();
        setTransactions(response.data || []);
      } catch (error: any) {
        console.error('Failed to fetch transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
      case 'Win':
      case 'Bonus':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'Withdrawal':
      case 'Loss':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'Transfer':
        return <Send className="w-4 h-4 text-blue-600" />;
      default:
        return <Coins className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Deposit':
      case 'Win':
      case 'Bonus':
        return 'bg-green-500/10 text-green-700';
      case 'Withdrawal':
      case 'Loss':
        return 'bg-red-500/10 text-red-700';
      case 'Transfer':
        return 'bg-blue-500/10 text-blue-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your coins and transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardHeader>
            <CardDescription>Total Value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {((user?.gc_balance || 0) + (user?.sc_balance || 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">GC + SC Combined</p>
          </CardContent>
        </Card>

        {/* Gold Coins */}
        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
          <CardHeader>
            <CardDescription>Gold Coins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-secondary">
              {(user?.gc_balance || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">For Fun Play</p>
          </CardContent>
        </Card>

        {/* Sweeps Coins */}
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardHeader>
            <CardDescription>Sweeps Coins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">
              {(user?.sc_balance || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Redeemable Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button size="lg" asChild className="flex-1">
          <a href="/store">Buy Coins</a>
        </Button>
        <Button size="lg" variant="outline" className="flex-1">
          Withdraw
        </Button>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent wallet activity</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {/* Icon and Description */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${getTransactionColor(tx.type)}`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-semibold">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      tx.type === 'Deposit' || tx.type === 'Win' || tx.type === 'Bonus'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {tx.type === 'Deposit' || tx.type === 'Win' || tx.type === 'Bonus' ? '+' : '-'}
                      ${tx.gc_amount ? tx.gc_amount.toFixed(2) : tx.sc_amount?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Balance: ${tx.gc_balance_after?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
              <Button asChild variant="outline" className="mt-4">
                <a href="/store">Buy Your First Coins</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">About Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Gold Coins (GC)</span> are used for fun play and cannot be redeemed for real money.
          </p>
          <p>
            <span className="font-semibold">Sweeps Coins (SC)</span> represent real value and can be withdrawn or redeemed.
          </p>
          <p>
            All transactions are processed securely and appear here immediately upon completion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
