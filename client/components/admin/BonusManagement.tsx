import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Copy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BonusManagement = () => {
  const [showNewBonusForm, setShowNewBonusForm] = useState(false);
  const [bonuses, setBonuses] = useState([
    {
      id: 1,
      name: 'Welcome Bonus 100%',
      type: 'Deposit',
      amount: '$100',
      percentage: '100%',
      minDeposit: '$10',
      usage: '892 / 1,200',
      status: 'Active',
      created: '2024-02-01',
      expires: '2024-12-31'
    },
    {
      id: 2,
      name: 'VIP Reload Bonus',
      type: 'Reload',
      amount: '$50',
      percentage: '50%',
      minDeposit: '$50',
      usage: '456 / 500',
      status: 'Active',
      created: '2024-02-05',
      expires: '2024-04-30'
    },
    {
      id: 3,
      name: 'Free Spins 50',
      type: 'Free Spins',
      amount: '50 Spins',
      percentage: 'N/A',
      minDeposit: 'None',
      usage: '1,234 / 2,000',
      status: 'Active',
      created: '2024-01-15',
      expires: '2024-05-15'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Active Bonuses</p>
            <p className="text-3xl font-black">12</p>
            <p className="text-xs text-green-500 mt-2">All running</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Total Claimed</p>
            <p className="text-3xl font-black">$45.2K</p>
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Avg Usage</p>
            <p className="text-3xl font-black">78%</p>
            <p className="text-xs text-green-500 mt-2">+5% vs last month</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Conversions</p>
            <p className="text-3xl font-black">64%</p>
            <p className="text-xs text-blue-500 mt-2">Claiming ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Bonus */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bonus Campaigns</CardTitle>
              <CardDescription>Create and manage bonus offers</CardDescription>
            </div>
            <Button className="font-bold" onClick={() => setShowNewBonusForm(!showNewBonusForm)}>
              <Plus className="w-4 h-4 mr-2" /> Create Bonus
            </Button>
          </div>
        </CardHeader>
        
        {showNewBonusForm && (
          <CardContent className="border-t border-border pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">Bonus Name</label>
                <Input placeholder="e.g., Welcome Bonus 100%" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Type</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option>Deposit Match</option>
                  <option>Reload</option>
                  <option>Free Spins</option>
                  <option>Cash Bonus</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Amount</label>
                <Input placeholder="$100 or 50 Spins" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Percentage</label>
                <Input placeholder="100%" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Minimum Deposit</label>
                <Input placeholder="$10" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Max Claims</label>
                <Input placeholder="1,000" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Start Date</label>
                <Input type="date" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">End Date</label>
                <Input type="date" className="bg-muted/50" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="font-bold">Create Bonus</Button>
              <Button variant="outline" onClick={() => setShowNewBonusForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        )}

        <CardContent className="pt-6">
          <div className="space-y-4">
            {bonuses.map((bonus) => (
              <div key={bonus.id} className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{bonus.name}</h4>
                    <p className="text-sm text-muted-foreground">{bonus.type} • Created {bonus.created}</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-none">
                    {bonus.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Amount</p>
                    <p className="text-lg font-black">{bonus.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Match</p>
                    <p className="text-lg font-black">{bonus.percentage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Min Deposit</p>
                    <p className="text-lg font-black">{bonus.minDeposit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Usage</p>
                    <p className="text-lg font-black">{bonus.usage}</p>
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div className="bg-primary h-1 rounded-full" style={{width: '74%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
