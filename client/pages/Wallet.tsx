import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, DollarSign, Coins, Loader } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { Transaction } from '@shared/api';
import ApiClient from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function Wallet() {
  const { wallet, isLoading: walletLoading, refreshWallet } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await ApiClient.getWalletTransactions(50);
        if (res.success && res.data) {
          setTransactions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load transactions',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingTx(false);
      }
    };

    fetchTransactions();
  }, []);

  if (walletLoading || !wallet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">My Wallet</h1>
            <p className="text-muted-foreground mt-2">View balance and manage funds</p>
          </div>
          <Button onClick={refreshWallet} variant="outline" className="h-10">
            Refresh
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground uppercase font-bold">Gold Coins (GC)</p>
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-4xl font-black mb-2">{wallet.goldCoins.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                ≈ ${(wallet.goldCoins / 100).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground uppercase font-bold">Sweeps Coins (SC)</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-4xl font-black mb-2">{wallet.sweepsCoins.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Premium Currency</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button className="font-bold h-10">
            <ArrowDown className="w-4 h-4 mr-2" />
            Deposit
          </Button>
          <Button className="font-bold h-10">
            <ArrowUp className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
          <Button variant="outline" className="h-10">Buy SC</Button>
          <Button variant="outline" className="h-10">Transfer</Button>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            {isLoadingTx && <Loader className="w-5 h-5 animate-spin text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            {isLoadingTx ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isIncome =
                    tx.type === 'win' ||
                    tx.type === 'purchase' ||
                    tx.type === 'bonus' ||
                    (tx.gc_amount || 0) > 0 ||
                    (tx.sc_amount || 0) > 0;

                  const displayAmount = Math.abs((tx.gc_amount || 0) + (tx.sc_amount || 0));

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded ${isIncome ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {isIncome ? (
                            <ArrowDown className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowUp className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold capitalize">{tx.type?.replace('_', ' ') || 'Transaction'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                          {isIncome ? '+' : '-'}{displayAmount}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limits & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Limits</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'Daily Deposit', limit: '$10,000', used: '$1,500' },
              { type: 'Daily Withdrawal', limit: '$5,000', used: '$0' },
              { type: 'Monthly Deposit', limit: '$50,000', used: '$28,500' },
              { type: 'Monthly Withdrawal', limit: '$20,000', used: '$8,500' }
            ].map((limitItem) => {
              const usedAmount = parseInt(limitItem.used.replace('$', '').replace(',', ''));
              const limitAmount = parseInt(limitItem.limit.replace('$', '').replace(',', ''));
              const percentage = (usedAmount / limitAmount) * 100;

              return (
                <div key={limitItem.type} className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="font-bold text-sm mb-2">{limitItem.type}</p>
                  <p className="text-lg font-black mb-2">{limitItem.limit}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Used: {limitItem.used}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
