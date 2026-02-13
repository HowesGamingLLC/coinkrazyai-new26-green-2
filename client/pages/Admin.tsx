import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  Settings, 
  BarChart3, 
  ShieldAlert, 
  Coins, 
  Gamepad2, 
  Bot,
  LogOut
} from 'lucide-react';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.data.token);
        setIsLoggedIn(true);
        fetchStats();
        toast({ title: "Welcome back, Admin", description: "Login successful." });
      } else {
        toast({ title: "Login failed", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md border-primary/20 bg-muted/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="text-primary-foreground w-10 h-10" />
            </div>
            <CardTitle className="text-2xl font-black italic">ADMIN LOGIN</CardTitle>
            <CardDescription>Enter your credentials to access the command center.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Admin Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>
              <Button type="submit" className="w-full font-bold h-12">LOGIN TO DASHBOARD</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">ADMIN <span className="text-primary">COMMAND CENTER</span></h1>
          <p className="text-muted-foreground">Full control over CoinKrazyAI2 platform.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="border-destructive/20 text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Total Players" value={stats?.totalPlayers || '...'} color="text-blue-400" />
        <StatsCard icon={Gamepad2} label="Active Tables" value={stats?.activeTables || '...'} color="text-green-400" />
        <StatsCard icon={Coins} label="SC Volume" value={`${stats?.totalSCVolume || '0'} SC`} color="text-yellow-400" />
        <StatsCard icon={ShieldAlert} label="System Health" value={stats?.systemHealth || '...'} color="text-primary" />
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="bg-muted border border-border p-1">
          <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bot className="w-4 h-4 mr-2" /> AI Employees
          </TabsTrigger>
          <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gamepad2 className="w-4 h-4 mr-2" /> Game Control
          </TabsTrigger>
          <TabsTrigger value="economy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Coins className="w-4 h-4 mr-2" /> Store & Economy
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AICard name="LuckyAI" role="Manager" status="Active" tasks={['Managing Employees', 'Daily Reporting']} />
            <AICard name="SecurityAI" role="Fraud/KYC" status="Monitoring" tasks={['Analyzing Transactions', 'Verifying IDs']} />
            <AICard name="SlotsAI" role="RTP Monitor" status="Active" tasks={['Adjusting Odds', 'Player Tracking']} />
            <AICard name="JoseyAI" role="Poker Watch" status="Idle" tasks={['Anti-Collusion', 'Pot Monitoring']} />
            <AICard name="SocialAI" role="Chat Mod" status="Active" tasks={['Moderating Chat', 'Banning Bots']} />
            <AICard name="PromotionsAI" role="Bonus Desk" status="Active" tasks={['Assigning SC Bonuses', 'Event Planning']} />
          </div>
        </TabsContent>

        <TabsContent value="games">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Game Management</CardTitle>
              <CardDescription>Configure RTP, table limits, and room settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Slots', 'Poker', 'Bingo', 'Sportsbook'].map((game) => (
                  <div key={game} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Gamepad2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">{game}</h4>
                        <p className="text-xs text-muted-foreground">Status: Operational</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="RTP %" className="w-20 bg-background" defaultValue="96.5" />
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economy">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>GC Store & Square Settings</CardTitle>
              <CardDescription>Manage pack prices and SC bonuses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-xs font-bold text-muted-foreground uppercase px-4">
                  <span>Pack Name</span>
                  <span>Price ($)</span>
                  <span>GC Amount</span>
                  <span>SC Bonus</span>
                </div>
                {[
                  { name: 'Starter Pack', price: 4.99, gc: 5000, sc: 5 },
                  { name: 'Pro Pack', price: 9.99, gc: 12000, sc: 12 },
                  { name: 'High Roller', price: 49.99, gc: 65000, sc: 65 },
                ].map((pack) => (
                  <div key={pack.name} className="grid grid-cols-4 gap-4 items-center p-4 bg-muted/50 rounded-xl border border-border">
                    <span className="font-bold">{pack.name}</span>
                    <Input defaultValue={pack.price} className="bg-background" />
                    <Input defaultValue={pack.gc} className="bg-background" />
                    <Input defaultValue={pack.sc} className="bg-background" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader><CardTitle>Revenue (7d)</CardTitle></CardHeader>
              <CardContent className="h-64 flex items-end justify-around gap-2 pt-8">
                {[40, 60, 45, 90, 85, 100, 75].map((h, i) => (
                  <div key={i} className="bg-primary w-full rounded-t-lg" style={{ height: `${h}%` }} />
                ))}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader><CardTitle>User Activity</CardTitle></CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-[20px] border-primary border-r-transparent animate-spin-slow flex items-center justify-center">
                  <span className="text-2xl font-black">84% Retention</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, color }: any) => (
  <Card className="border-border">
    <CardContent className="p-6 flex items-center gap-4">
      <div className={cn("p-3 bg-muted rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-semibold uppercase">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const AICard = ({ name, role, status, tasks }: any) => (
  <Card className="border-border hover:border-primary/30 transition-colors">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          <CardDescription>{role}</CardDescription>
        </div>
        <Badge className={cn(
          status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500',
          'border-none'
        )}>
          {status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase">Current Tasks</p>
        <ul className="text-sm space-y-1">
          {tasks.map((t: string) => (
            <li key={t} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <Button className="w-full" variant="outline" size="sm">Assign Duty</Button>
    </CardContent>
  </Card>
);

import { cn } from '@/lib/utils';
export default Admin;
