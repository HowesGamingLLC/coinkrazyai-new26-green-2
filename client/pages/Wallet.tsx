import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, DollarSign, Coins } from 'lucide-react';

export default function Wallet() {
  const [transactions] = useState([
    { id: 1, type: 'Deposit', amount: '+$100', gc: '+10000 GC', date: 'Today', status: 'Completed' },
    { id: 2, type: 'Win', amount: '+$250', gc: '+0 GC', date: 'Yesterday', status: 'Completed' },
    { id: 3, type: 'Bet', amount: '-$50', gc: '-5000 GC', date: '2 days ago', status: 'Completed' },
    { id: 4, type: 'Bonus', amount: '+$50', gc: '+5000 GC', date: '3 days ago', status: 'Completed' },
    { id: 5, type: 'Withdrawal', amount: '-$500', gc: '-50000 GC', date: '1 week ago', status: 'Completed' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black">My Wallet</h1>
          <p className="text-muted-foreground mt-2">View balance and manage funds</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground uppercase font-bold">Game Chips (GC)</p>
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <p className="text-4xl font-black mb-2">125,450</p>
              <p className="text-sm text-muted-foreground">≈ $1,254.50 USD</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground uppercase font-bold">Square Cash (SC)</p>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-4xl font-black mb-2">2,450</p>
              <p className="text-sm text-muted-foreground">Premium Currency</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button className="font-bold"><ArrowDown className="w-4 h-4 mr-2" />Deposit</Button>
          <Button className="font-bold"><ArrowUp className="w-4 h-4 mr-2" />Withdraw</Button>
          <Button variant="outline">Buy SC</Button>
          <Button variant="outline">Transfer</Button>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded">
                      {tx.type.includes('Win') || tx.type === 'Deposit' || tx.type === 'Bonus' ? (
                        <ArrowDown className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowUp className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.gc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Limits & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit & Withdrawal Limits</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'Daily Deposit', limit: '$10,000', used: '$1,500' },
              { type: 'Daily Withdrawal', limit: '$5,000', used: '$0' },
              { type: 'Monthly Deposit', limit: '$50,000', used: '$28,500' },
              { type: 'Monthly Withdrawal', limit: '$20,000', used: '$8,500' }
            ].map((limit) => (
              <div key={limit.type} className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="font-bold text-sm mb-2">{limit.type}</p>
                <p className="text-lg font-black mb-2">{limit.limit}</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: (parseInt(limit.used) / parseInt(limit.limit)) * 100 + '%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Used: {limit.used}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
