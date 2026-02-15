import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, AlertTriangle, Users, Headphones, Code, Database, Bell, Shield, Zap, Settings } from 'lucide-react';
import { toast } from 'sonner';

const AdminAdvanced = () => {
  const [vipTiers, setVipTiers] = useState([
    { id: 1, name: 'Silver', minDeposit: 100, players: 45, benefits: 'Basic rewards' },
    { id: 2, name: 'Gold', minDeposit: 500, players: 28, benefits: 'Premium rewards' },
    { id: 3, name: 'Platinum', minDeposit: 2000, players: 8, benefits: 'VIP benefits' },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleAddVIPTier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    toast.success('VIP tier created');
    (e.target as HTMLFormElement).reset();
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Settings saved');
      setIsSaving(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-8 overflow-x-auto">
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="vip" className="text-xs">VIP</TabsTrigger>
          <TabsTrigger value="fraud" className="text-xs">Fraud</TabsTrigger>
          <TabsTrigger value="affiliate" className="text-xs">Affiliate</TabsTrigger>
          <TabsTrigger value="support" className="text-xs">Support</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
          <TabsTrigger value="api" className="text-xs">API</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
        </TabsList>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reporting</CardTitle>
              <CardDescription>Platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Daily Active Users</p>
                  <p className="text-2xl font-bold text-blue-600">1,234</p>
                  <p className="text-xs text-muted-foreground">+5% from yesterday</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Daily Revenue</p>
                  <p className="text-2xl font-bold text-green-600">$4,523.00</p>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-purple-600">23m 45s</p>
                  <p className="text-xs text-muted-foreground">-2% from yesterday</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Retention (7d)</p>
                  <p className="text-2xl font-bold text-orange-600">68%</p>
                  <p className="text-xs text-muted-foreground">+3% from last week</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Report Builder</h4>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 border rounded-md text-sm">
                    <option>Select Report Type...</option>
                    <option>Revenue Report</option>
                    <option>Player Report</option>
                    <option>Game Performance</option>
                    <option>Compliance Report</option>
                  </select>
                  <Button className="w-full">Generate Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIP MANAGEMENT */}
        <TabsContent value="vip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VIP Management</CardTitle>
              <CardDescription>Manage VIP tiers and benefits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create VIP Tier</Button>

              <div className="space-y-3">
                {vipTiers.map(tier => (
                  <div key={tier.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{tier.name}</p>
                      <Badge>{tier.players} players</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Min Deposit: ${tier.minDeposit}</p>
                    <p className="text-sm text-muted-foreground">Benefits: {tier.benefits}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Add New VIP Tier</h4>
                <form onSubmit={handleAddVIPTier} className="space-y-2">
                  <Input placeholder="Tier Name" required />
                  <Input type="number" placeholder="Minimum Deposit" required />
                  <Input placeholder="Benefits Description" required />
                  <Button type="submit" className="w-full">Create Tier</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FRAUD DETECTION */}
        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Account Anomalies</p>
                      <p className="text-sm text-muted-foreground">12 suspicious accounts</p>
                    </div>
                    <Button size="sm" variant="destructive">Review</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Large Transactions</p>
                      <p className="text-sm text-muted-foreground">5 over $10,000</p>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Duplicate Accounts</p>
                      <p className="text-sm text-muted-foreground">3 suspected duplicates</p>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AFFILIATE PROGRAM */}
        <TabsContent value="affiliate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold">Active Affiliates</p>
                  <p className="text-2xl font-bold">45</p>
                  <Button className="w-full mt-3" size="sm">Manage</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold">Total Referrals</p>
                  <p className="text-2xl font-bold">234</p>
                  <Button className="w-full mt-3" size="sm">View</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold">Commission Paid</p>
                  <p className="text-2xl font-bold">$12,450</p>
                  <Button className="w-full mt-3" size="sm">View</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold">Pending Commission</p>
                  <p className="text-2xl font-bold">$2,500</p>
                  <Button className="w-full mt-3" size="sm">Approve</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPORT */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Open Tickets</p>
                      <p className="text-sm text-muted-foreground">34 pending</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Average Response Time</p>
                      <p className="text-sm text-muted-foreground">2.5 hours</p>
                    </div>
                    <Button size="sm" variant="outline">Improve</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Satisfaction Rating</p>
                      <p className="text-sm text-muted-foreground">4.2 / 5.0</p>
                    </div>
                    <Badge variant="default">Good</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Input type="date" />
                <select className="px-3 py-2 border rounded-md text-sm flex-1">
                  <option>All Levels</option>
                  <option>Error</option>
                  <option>Warning</option>
                  <option>Info</option>
                </select>
                <Button>Filter</Button>
              </div>

              <div className="space-y-2">
                <div className="p-3 border rounded text-sm font-mono bg-gray-50">
                  <p className="text-xs text-gray-500">[2024-02-15 14:32:45] INFO: User login - player1</p>
                </div>
                <div className="p-3 border rounded text-sm font-mono bg-yellow-50">
                  <p className="text-xs text-yellow-600">[2024-02-15 14:25:12] WARNING: High memory usage detected</p>
                </div>
                <div className="p-3 border rounded text-sm font-mono bg-red-50">
                  <p className="text-xs text-red-600">[2024-02-15 14:18:03] ERROR: Database connection timeout</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">API Keys</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded border flex items-center justify-between">
                    <code className="text-xs font-mono">sk_live_1234567890</code>
                    <Button size="sm" variant="destructive">Revoke</Button>
                  </div>
                </div>
                <Button className="w-full mt-3">Generate New Key</Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">API Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Requests (30d)</span>
                    <span className="font-semibold">45,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Errors Rate</span>
                    <span className="font-semibold text-green-600">0.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Response Time</span>
                    <span className="font-semibold">145ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Regulations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">GDPR Compliance</p>
                      <p className="text-sm text-muted-foreground">Data deletion requests: 5 pending</p>
                    </div>
                    <Badge variant="default">Compliant</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Age Verification</p>
                      <p className="text-sm text-muted-foreground">100% of players verified</p>
                    </div>
                    <Badge variant="default">Compliant</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Account Limitations</p>
                      <p className="text-sm text-muted-foreground">Self-exclusion: 12 active</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Audit Trail</h4>
                  <Button className="w-full" size="sm">Download Compliance Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAdvanced;
