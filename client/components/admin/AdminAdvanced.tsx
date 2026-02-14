import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, AlertTriangle, Users, Headphones, Code, Database, Bell } from 'lucide-react';

const AdminAdvanced = () => {
  const [vipTiers, setVipTiers] = useState([
    { id: 1, name: 'Silver', minDeposit: 100, players: 45 },
    { id: 2, name: 'Gold', minDeposit: 500, players: 28 },
    { id: 3, name: 'Platinum', minDeposit: 2000, players: 8 },
  ]);

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

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reporting</CardTitle>
              <CardDescription>Platform performance and player behavior analytics</CardDescription>
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
                  <p className="text-2xl font-bold text-green-600">$45,230</p>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-purple-600">23m 45s</p>
                  <p className="text-xs text-muted-foreground">-2% from yesterday</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Player Retention (7d)</p>
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

        {/* VIP Management */}
        <TabsContent value="vip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VIP Management</CardTitle>
              <CardDescription>Manage VIP tiers and player promotions</CardDescription>
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
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Edit Benefits</Button>
                      <Button size="sm" variant="outline">Manage Players</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Detection */}
        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection</CardTitle>
              <CardDescription>Monitor and manage suspicious activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline">Active Flags</Button>
                <Button variant="outline">Resolved</Button>
                <Button variant="outline">All</Button>
              </div>

              <div className="space-y-3">
                {[
                  { type: 'Account Takeover', risk: 'Critical', player: 'Player #123' },
                  { type: 'Rapid Betting Pattern', risk: 'High', player: 'Player #456' },
                  { type: 'Multiple Accounts', risk: 'Medium', player: 'Player #789' },
                ].map((flag, i) => (
                  <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{flag.type}</p>
                      <p className="text-xs text-muted-foreground">{flag.player}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={flag.risk === 'Critical' ? 'destructive' : 'secondary'}>
                        {flag.risk}
                      </Badge>
                      <Button size="sm">Investigate</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Fraud Patterns</h4>
                <Button className="w-full mb-2">+ Add Pattern</Button>
                <p className="text-sm text-muted-foreground">2 patterns configured</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Affiliate Management */}
        <TabsContent value="affiliate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Management</CardTitle>
              <CardDescription>Manage affiliate partners and commissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Add Affiliate Partner</Button>

              <div className="space-y-3">
                {[
                  { name: 'GameMasters Network', status: 'Active', revenue: '$12,450' },
                  { name: 'Casino Reviews Pro', status: 'Active', revenue: '$8,230' },
                  { name: 'Slots Hub', status: 'Pending', revenue: '-' },
                ].map((partner, i) => (
                  <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{partner.name}</p>
                      <p className="text-sm text-muted-foreground">Revenue: {partner.revenue}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={partner.status === 'Active' ? 'default' : 'secondary'}>
                        {partner.status}
                      </Badge>
                      <Button size="sm" variant="outline">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support & Tickets */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage customer support requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">5</p>
                  <p className="text-xs text-muted-foreground">Open</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">12</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">284</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: '#T001', subject: 'Withdrawal Issue', priority: 'High', status: 'Open' },
                  { id: '#T002', subject: 'Game Crash', priority: 'Medium', status: 'Open' },
                  { id: '#T003', subject: 'Account Recovery', priority: 'Critical', status: 'Open' },
                ].map(ticket => (
                  <div key={ticket.id} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={ticket.priority === 'Critical' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                      <Button size="sm">Respond</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>View system and admin activity logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 mb-4">
                <Input placeholder="Filter by action..." />
                <select className="w-full px-3 py-2 border rounded-md text-sm">
                  <option>All Actions</option>
                  <option>Player Updates</option>
                  <option>Game Changes</option>
                  <option>Bonus Grants</option>
                </select>
              </div>

              <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-3 border rounded flex items-start justify-between hover:bg-muted/50">
                    <div>
                      <p className="font-mono text-xs">Admin #1 updated Player #123 balance</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                    <Badge variant="outline">success</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Management */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Management</CardTitle>
              <CardDescription>Manage API keys and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Generate API Key</Button>

              <div className="space-y-3">
                {[
                  { name: 'Mobile App', key: 'sk_test_abc123...', status: 'Active' },
                  { name: 'Web App', key: 'sk_test_def456...', status: 'Active' },
                  { name: 'Analytics Tool', key: 'sk_test_ghi789...', status: 'Inactive' },
                ].map((api, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{api.name}</p>
                      <Badge variant={api.status === 'Active' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mb-3">{api.key}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Copy</Button>
                      <Button size="sm" variant="destructive">Revoke</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Regulations</CardTitle>
              <CardDescription>Monitor compliance with regulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">AML Checks</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="text-lg font-bold">12</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Verified</p>
                      <p className="text-lg font-bold text-green-600">1,234</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3">Review</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Compliance Logs</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <p className="text-muted-foreground">Audit Trail</p>
                      <p className="text-lg font-bold">Enabled</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data Retention</p>
                      <p className="text-lg font-bold">7 Years</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" variant="outline">Download Report</Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Regulatory Requirements</h4>
                <div className="space-y-2 text-sm">
                  {['KYC Verification', 'AML Compliance', 'Age Verification', 'Responsible Gaming'].map(req => (
                    <div key={req} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <p>{req}</p>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                  ))}
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
