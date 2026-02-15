import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';

const AdminFinancial = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('30days');

  // Mock financial data
  const financialData = {
    totalRevenue: 125432.50,
    totalWagered: 456789.00,
    totalWinnings: 234567.89,
    playerDepositValue: 45000.00,
    withdrawalsPending: 12500.00,
    houseProfit: 222221.11,
    playerCount: 1234,
    activePlayerCount: 456,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialData.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Wagered</CardTitle>
                <Wallet className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialData.totalWagered.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Player activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Winnings</CardTitle>
                <TrendingDown className="w-4 h-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialData.totalWinnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Paid to players</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">House Profit</CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialData.houseProfit.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Net profit</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span>Player Deposit Value</span>
                  <span className="font-semibold">${financialData.playerDepositValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span>Withdrawals Pending</span>
                  <span className="font-semibold text-orange-600">${financialData.withdrawalsPending.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span>Payout Ratio</span>
                  <span className="font-semibold">{((financialData.totalWinnings / financialData.totalWagered) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span>Margin</span>
                  <span className="font-semibold">{((financialData.houseProfit / financialData.totalRevenue) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVENUE */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>By source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Casino Games</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-blue-600 h-2 rounded" style={{ width: '45%' }}></div></div>
                  <p className="text-xs text-muted-foreground mt-1">$56,444.63</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Slots</span>
                    <span>35%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-green-600 h-2 rounded" style={{ width: '35%' }}></div></div>
                  <p className="text-xs text-muted-foreground mt-1">$43,901.38</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Scratch Tickets</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-purple-600 h-2 rounded" style={{ width: '15%' }}></div></div>
                  <p className="text-xs text-muted-foreground mt-1">$18,814.88</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Pull Tabs</span>
                    <span>5%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-orange-600 h-2 rounded" style={{ width: '5%' }}></div></div>
                  <p className="text-xs text-muted-foreground mt-1">$6,271.63</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WITHDRAWALS */}
        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Pending Withdrawals</p>
                    <p className="text-sm text-muted-foreground">45 requests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600">${financialData.withdrawalsPending.toFixed(2)}</p>
                    <Button size="sm" variant="outline" className="mt-2">Review</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Completed Today</p>
                    <p className="text-sm text-muted-foreground">12 withdrawals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">$8,500.00</p>
                    <Button size="sm" variant="outline" className="mt-2">View</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Failed Withdrawals</p>
                    <p className="text-sm text-muted-foreground">3 failed attempts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">$1,250.00</p>
                    <Button size="sm" variant="outline" className="mt-2">Investigate</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Revenue Report</span>
                  </div>
                  <select className="w-full px-3 py-2 border rounded-md text-sm mb-3">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Year to date</option>
                  </select>
                  <Button className="w-full">Generate</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Player Report</span>
                  </div>
                  <select className="w-full px-3 py-2 border rounded-md text-sm mb-3">
                    <option>Active players</option>
                    <option>Inactive players</option>
                    <option>New players</option>
                    <option>VIP players</option>
                  </select>
                  <Button className="w-full">Generate</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold">Profit Report</span>
                  </div>
                  <select className="w-full px-3 py-2 border rounded-md text-sm mb-3">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Year to date</option>
                  </select>
                  <Button className="w-full">Generate</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Payout Report</span>
                  </div>
                  <select className="w-full px-3 py-2 border rounded-md text-sm mb-3">
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Failed</option>
                    <option>All</option>
                  </select>
                  <Button className="w-full">Generate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORECASTS */}
        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Forecasts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Projected 30-day Revenue</p>
                  <p className="text-2xl font-bold text-green-600">$142,500.00</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on current trends</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Expected Player Growth</p>
                  <p className="text-2xl font-bold text-blue-600">+234 players</p>
                  <p className="text-xs text-muted-foreground mt-1">Next 30 days projection</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-semibold mb-2">Predicted Churn Rate</p>
                  <p className="text-2xl font-bold text-orange-600">8.5%</p>
                  <p className="text-xs text-muted-foreground mt-1">Monthly churn prediction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinancial;
