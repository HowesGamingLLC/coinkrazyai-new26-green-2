import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, DollarSign, Gift, Trophy, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const AdminFinancial = () => {
  const [bonuses, setBonuses] = useState([]);
  const [jackpots, setJackpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [bonusRes, jackpotRes] = await Promise.all([
          adminV2.bonuses.list().catch(() => ({ data: [] })),
          adminV2.jackpots.list().catch(() => ({ data: [] }))
        ]);
        setBonuses(bonusRes.data || bonusRes || []);
        setJackpots(jackpotRes.data || jackpotRes || []);
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
        toast.error('Failed to load financial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="make-it-rain" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="make-it-rain">Make It Rain</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
          <TabsTrigger value="jackpots">Jackpots</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>

        {/* Make It Rain */}
        <TabsContent value="make-it-rain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Make It Rain Campaigns</CardTitle>
              <CardDescription>Distribute rewards to multiple players at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Create Campaign</h4>
                  <div className="space-y-2">
                    <Input placeholder="Campaign Name" />
                    <Input placeholder="Description" />
                    <Input placeholder="Total Budget" type="number" />
                    <select className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Select Reward Type...</option>
                      <option>GC (Gold Coins)</option>
                      <option>SC (Sweeps)</option>
                      <option>Free Spins</option>
                      <option>Mixed</option>
                    </select>
                    <Button className="w-full">Create Campaign</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Target Players</h4>
                  <div className="space-y-2">
                    <select className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Select Target Group...</option>
                      <option>All Active Players</option>
                      <option>VIP Players</option>
                      <option>Inactive 7 Days</option>
                      <option>High Rollers</option>
                      <option>New Players</option>
                    </select>
                    <Input placeholder="Min/Max Bet Amount" />
                    <Input placeholder="Min/Max Account Age (days)" />
                    <Button className="w-full">Filter Players</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm"><strong>Active Campaigns:</strong> 3</p>
                <p className="text-sm text-muted-foreground">Total Budget Allocated: $12,500</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonuses */}
        <TabsContent value="bonuses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bonus Management</CardTitle>
              <CardDescription>Create and manage player bonuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create New Bonus</Button>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : bonuses.length > 0 ? (
                <div className="space-y-3">
                  {bonuses.map((bonus: any) => (
                    <div key={bonus.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{bonus.name}</p>
                        <p className="text-sm text-muted-foreground">{bonus.type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold">{bonus.amount || bonus.percentage}%</span>
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="destructive">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No bonuses configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jackpots */}
        <TabsContent value="jackpots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jackpot Management</CardTitle>
              <CardDescription>Manage progressive and fixed jackpots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create New Jackpot</Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : jackpots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jackpots.map((jackpot: any) => (
                    <div key={jackpot.id} className="p-4 border rounded-lg">
                      <p className="font-semibold">{jackpot.name}</p>
                      <p className="text-2xl font-black text-green-600 my-2">
                        ${jackpot.current_amount?.toFixed(2) || 0}
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Type:</span> {jackpot.type}</p>
                        <p><span className="text-muted-foreground">Min Bet:</span> ${jackpot.min_bet}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Update Amount</Button>
                        <Button size="sm" variant="outline">View Wins</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No jackpots configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redemptions */}
        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Approvals</CardTitle>
              <CardDescription>Manage sweeps coin redemption requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline">Pending</Button>
                <Button variant="outline">Approved</Button>
                <Button variant="outline">Rejected</Button>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Player #{i}</p>
                      <p className="text-sm text-muted-foreground">SC: 5,000.00 | Method: Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">Requested: 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Approve</Button>
                      <Button size="sm" variant="destructive">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinancial;
