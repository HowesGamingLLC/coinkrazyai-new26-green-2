import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

const AdminOperations = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="casino">Casino Settings</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        {/* Security Management */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Management</CardTitle>
              <CardDescription>Monitor and manage security alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline">All</Button>
                <Button variant="outline">Critical</Button>
                <Button variant="outline">Warning</Button>
                <Button variant="outline">Resolved</Button>
              </div>

              <div className="space-y-3">
                {[
                  { type: 'Login Attempt', severity: 'warning', message: 'Unusual login from new IP' },
                  { type: 'Large Withdrawal', severity: 'info', message: 'Player withdrawing $5,000' },
                  { type: 'Fraud Detection', severity: 'critical', message: 'Potential account takeover detected' },
                ].map((alert, i) => (
                  <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-sm">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <Button size="sm">Investigate</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure platform security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="font-semibold text-sm">Two-Factor Authentication</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="font-semibold text-sm">IP Whitelist</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Restrict admin access to approved IPs</p>
                </div>
              </div>
              <Button className="w-full">Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CMS Pages</CardTitle>
              <CardDescription>Manage website content and pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create New Page</Button>

              <div className="space-y-3">
                {['Terms & Conditions', 'Privacy Policy', 'About Us', 'FAQ'].map((page, i) => (
                  <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{page}</p>
                      <p className="text-xs text-muted-foreground">Last updated: 2 days ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Preview</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banners & Promotions</CardTitle>
              <CardDescription>Manage site banners and promotional content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create Banner</Button>

              <div className="space-y-3">
                {['Welcome Banner', 'Holiday Promo', 'New Game Release'].map((banner, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{banner}</p>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="destructive">Disable</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Casino Settings */}
        <TabsContent value="casino" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Casino Configuration</CardTitle>
              <CardDescription>Configure global casino settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <label className="block text-sm font-semibold mb-2">House Edge (%)</label>
                  <Input type="number" defaultValue="5" step="0.1" />
                </div>

                <div className="p-4 border rounded-lg">
                  <label className="block text-sm font-semibold mb-2">Maximum Bet</label>
                  <Input type="number" defaultValue="10000" />
                </div>

                <div className="p-4 border rounded-lg">
                  <label className="block text-sm font-semibold mb-2">Minimum Bet</label>
                  <Input type="number" defaultValue="1" />
                </div>

                <div className="p-4 border rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="font-semibold text-sm">Enable Maintenance Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Prevent players from accessing games</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="font-semibold text-sm">Enable Demo Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Allow play with virtual currency</p>
                </div>
              </div>

              <Button className="w-full">Save Casino Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Management */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Features</CardTitle>
              <CardDescription>Manage player social interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Player Groups</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="font-semibold">VIP Players</p>
                    <p className="text-muted-foreground">45 members</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">High Rollers</p>
                    <p className="text-muted-foreground">12 members</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">New Players</p>
                    <p className="text-muted-foreground">234 members</p>
                  </div>
                </div>
                <Button className="w-full mt-3">Manage Groups</Button>
              </div>

              <div className="p-4 border rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="font-semibold text-sm">Enable Friend System</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="font-semibold text-sm">Enable Messaging</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="font-semibold text-sm">Enable Tournaments</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Retention</CardTitle>
              <CardDescription>Create campaigns to retain players</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create Campaign</Button>

              <div className="space-y-3">
                {['Win-back Campaign', 'VIP Rewards', 'New Player Onboarding'].map((campaign, i) => (
                  <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{campaign}</p>
                      <p className="text-xs text-muted-foreground">345 targeted players</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Launch</Button>
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

export default AdminOperations;
