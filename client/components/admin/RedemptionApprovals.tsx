import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';

export const RedemptionApprovals = () => {
  const [requests] = useState([
    { id: 1, player: 'John Doe', amount: '$500', method: 'Bank Transfer', status: 'Pending', time: '2 hours ago' },
    { id: 2, player: 'Jane Smith', amount: '$1,250', method: 'Card', status: 'Pending', time: '4 hours ago' },
    { id: 3, player: 'Mike Johnson', amount: '$750', method: 'Crypto', status: 'Review', time: '8 hours ago' },
    { id: 4, player: 'Sarah Wilson', amount: '$2,100', method: 'Bank Transfer', status: 'Review', time: '12 hours ago' }
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border"><CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Pending</p>
            <p className="text-3xl font-black">12</p>
            <p className="text-xs text-orange-500 mt-2">$8,450</p>
          </CardContent>
        </Card>
        <Card className="border-border"><CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Approved (24h)</p>
            <p className="text-3xl font-black">34</p>
            <p className="text-xs text-green-500 mt-2">$42,100</p>
          </CardContent>
        </Card>
        <Card className="border-border"><CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Rejected (24h)</p>
            <p className="text-3xl font-black">2</p>
            <p className="text-xs text-red-500 mt-2">$1,500</p>
          </CardContent>
        </Card>
        <Card className="border-border"><CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Avg Processing</p>
            <p className="text-3xl font-black">4.2h</p>
            <p className="text-xs text-blue-500 mt-2">Time to approve</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.filter(r => r.status === 'Pending').map((request) => (
            <div key={request.id} className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold">{request.player}</p>
                  <p className="text-sm text-muted-foreground">{request.method} • {request.time}</p>
                </div>
                <p className="font-black text-lg">{request.amount}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-8 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"><Check className="w-3 h-3 mr-1" />Approve</Button>
                <Button size="sm" variant="outline" className="h-8 text-red-500 hover:bg-red-500/20"><X className="w-3 h-3 mr-1" />Reject</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {requests.filter(r => r.status === 'Review').map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border">
                <div>
                  <p className="font-bold text-sm">{request.player}</p>
                  <p className="text-xs text-muted-foreground">{request.method} • {request.time}</p>
                </div>
                <p className="font-black">{request.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Payout Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { method: 'Bank Transfer', daily: '$50K', fee: '2.5%', time: '1-2 days' },
            { method: 'Credit Card', daily: '$10K', fee: '3.5%', time: '1-3 days' },
            { method: 'Crypto', daily: '$100K', fee: '1.0%', time: '30 min' }
          ].map((payout) => (
            <div key={payout.method} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border">
              <div>
                <p className="font-bold text-sm">{payout.method}</p>
                <p className="text-xs text-muted-foreground">Daily: {payout.daily} • Fee: {payout.fee}</p>
              </div>
              <p className="text-xs font-bold">{payout.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
