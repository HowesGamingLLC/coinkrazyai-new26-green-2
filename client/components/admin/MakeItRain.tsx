import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Target, Users, TrendingUp } from 'lucide-react';

export const MakeItRain = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Weekend Boost',
      amount: '$50',
      type: 'Bonus',
      recipients: 'All Players',
      claimed: 1204,
      total: 1527,
      status: 'Active',
      created: '2024-02-12'
    },
    {
      id: 2,
      name: 'VIP Mega Bonus',
      amount: '$250',
      type: 'Bonus',
      recipients: 'VIP Only',
      claimed: 342,
      total: 512,
      status: 'Active',
      created: '2024-02-13'
    }
  ]);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Distributed Today</p>
            <p className="text-3xl font-black">$125.4K</p>
            <p className="text-xs text-green-500 mt-2">18 campaigns</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Claim Rate</p>
            <p className="text-3xl font-black">92%</p>
            <p className="text-xs text-muted-foreground mt-2">Very high</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">This Month</p>
            <p className="text-3xl font-black">$2.3M</p>
            <p className="text-xs text-green-500 mt-2">Total distributed</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">ROI</p>
            <p className="text-3xl font-black">3.2x</p>
            <p className="text-xs text-green-500 mt-2">Revenue multiplier</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Campaign</CardTitle>
              <CardDescription>Instantly reward players</CardDescription>
            </div>
            <Button className="font-bold" onClick={() => setShowForm(!showForm)}>
              <Send className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t border-border pt-6 space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Campaign Name</label>
                <Input placeholder="e.g., Friday Bonanza" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Reward Amount</label>
                <Input placeholder="$50 or 1000 GC" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Target Players</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option>All Players</option>
                  <option>Active Only</option>
                  <option>VIP Only</option>
                  <option>New Players (7 days)</option>
                  <option>High Spenders</option>
                  <option>Inactive (30+ days)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Reward Type</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option>Bonus Credit</option>
                  <option>Free Spins</option>
                  <option>Tournament Entry</option>
                  <option>Cashback</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Conditions</label>
                <Input placeholder="e.g., Min deposit $50" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Expiry (days)</label>
                <Input placeholder="7" className="bg-muted/50" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="font-bold">Create & Send</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Campaigns */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Currently running reward distributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.type} • Created {campaign.created}</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-none">{campaign.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Amount</p>
                    <p className="text-lg font-black">{campaign.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Target</p>
                    <p className="text-lg font-black text-sm">{campaign.recipients}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Claimed</p>
                    <p className="text-lg font-black">{campaign.claimed}/{campaign.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Rate</p>
                    <p className="text-lg font-black">{Math.round((campaign.claimed/campaign.total)*100)}%</p>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{width: `${(campaign.claimed/campaign.total)*100}%`}}></div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8">Edit</Button>
                  <Button size="sm" variant="outline" className="h-8">Stop</Button>
                  <Button size="sm" variant="outline" className="h-8">Stats</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Campaigns */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Scheduled Campaigns</CardTitle>
          <CardDescription>Upcoming automatic distributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'Friday Night Bonus', date: 'Feb 16, 8 PM', amount: '$75', target: 'All' },
              { name: 'Weekend Reload', date: 'Feb 17, 10 AM', amount: '$50', target: 'Active' },
              { name: 'Birthday Bonus', date: 'Daily', amount: 'Varies', target: 'Birthdays' }
            ].map((scheduled) => (
              <div key={scheduled.name} className="flex items-center justify-between p-3 bg-muted/30 rounded border border-border">
                <div>
                  <p className="font-bold">{scheduled.name}</p>
                  <p className="text-xs text-muted-foreground">{scheduled.date} • {scheduled.target}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{scheduled.amount}</p>
                  <Button size="sm" variant="ghost" className="h-6 text-xs">Edit</Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 font-bold">Schedule Campaign</Button>
        </CardContent>
      </Card>
    </div>
  );
};
