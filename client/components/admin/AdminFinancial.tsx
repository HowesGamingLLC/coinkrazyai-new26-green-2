import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, DollarSign, Gift, Trophy, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const AdminFinancial = () => {
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [jackpots, setJackpots] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bonusRes, jackpotRes, campaignRes] = await Promise.all([
        adminV2.bonuses.list().catch(() => ({ data: [] })),
        adminV2.jackpots.list().catch(() => ({ data: [] })),
        adminV2.makeItRain.list().catch(() => ({ data: [] }))
      ]);
      setBonuses(Array.isArray(bonusRes) ? bonusRes : (bonusRes?.data || []));
      setJackpots(Array.isArray(jackpotRes) ? jackpotRes : (jackpotRes?.data || []));
      setCampaigns(Array.isArray(campaignRes) ? campaignRes : (campaignRes?.data || []));
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBonus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await adminV2.bonuses.create({
        name: formData.get('bonusName'),
        type: formData.get('bonusType'),
        amount: formData.get('amount'),
        percentage: formData.get('percentage'),
      });
      toast.success('Bonus created successfully');
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create bonus:', error);
      toast.error('Failed to create bonus');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await adminV2.makeItRain.create({
        name: formData.get('campaignName'),
        description: formData.get('description'),
        budget: formData.get('budget'),
      });
      toast.success('Campaign created successfully');
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Make It Rain Campaigns</CardTitle>
                <CardDescription>Distribute rewards to multiple players at once</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchData}>Refresh</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm"><strong>Active Campaigns:</strong> {campaigns.length}</p>
                  <p className="text-sm text-muted-foreground">Campaigns running</p>
                </div>
              )}
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
              <form onSubmit={handleCreateBonus} className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Bonus Name</label>
                  <Input name="bonusName" placeholder="e.g., Welcome Bonus" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select name="bonusType" className="w-full px-3 py-2 border rounded-md text-sm" required>
                    <option>Deposit</option>
                    <option>Reload</option>
                    <option>Free Spins</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Amount/Percentage</label>
                  <Input name="amount" placeholder="100 or 50%" type="number" />
                </div>
                <Button type="submit" className="md:col-span-3">Create Bonus</Button>
              </form>

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
                        <span className="font-mono font-bold">{bonus.amount || bonus.percentage}</span>
                        <Button size="sm" variant="outline" onClick={() => toast.info('Edit feature coming soon')}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => adminV2.bonuses.delete(bonus.id).then(() => { toast.success('Deleted'); fetchData(); }).catch(() => toast.error('Failed'))}>Delete</Button>
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await adminV2.jackpots.create({
                    name: formData.get('jackpotName'),
                    type: formData.get('jackpotType'),
                    minBet: formData.get('minBet'),
                  });
                  toast.success('Jackpot created');
                  fetchData();
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  toast.error('Failed to create jackpot');
                }
              }} className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Jackpot Name</label>
                  <Input name="jackpotName" placeholder="e.g., Mega Slots Jackpot" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select name="jackpotType" className="w-full px-3 py-2 border rounded-md text-sm" required>
                    <option>Progressive</option>
                    <option>Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Min Bet</label>
                  <Input name="minBet" placeholder="10" type="number" required />
                </div>
                <Button type="submit" className="md:col-span-3">Create Jackpot</Button>
              </form>

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
                        ${(jackpot.current_amount || 0).toFixed(2)}
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Type:</span> {jackpot.type}</p>
                        <p><span className="text-muted-foreground">Min Bet:</span> ${jackpot.min_bet}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => {
                          const newAmount = prompt('Enter new amount:', String(jackpot.current_amount || 0));
                          if (newAmount) {
                            adminV2.jackpots.update(jackpot.id, parseFloat(newAmount))
                              .then(() => { toast.success('Updated'); fetchData(); })
                              .catch(() => toast.error('Failed'));
                          }
                        }}>Update Amount</Button>
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
                <Button variant="outline" onClick={() => { toast.info('Filter by pending'); fetchData(); }}>Pending</Button>
                <Button variant="outline" onClick={() => { toast.info('Filter by approved'); fetchData(); }}>Approved</Button>
                <Button variant="outline" onClick={() => { toast.info('Filter by rejected'); fetchData(); }}>Rejected</Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-center py-8 text-muted-foreground">Loading redemption requests...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinancial;
