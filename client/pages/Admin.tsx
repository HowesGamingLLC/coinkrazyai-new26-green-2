import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Settings, 
  BarChart3, 
  ShieldAlert, 
  Coins, 
  Gamepad2, 
  Bot,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// --- Sub-components ---

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

const AICard = ({ name, role, status, tasks, onAssign }: any) => {
  const [newDuty, setNewDuty] = useState('');
  
  return (
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
        <div className="space-y-2 pt-2">
          <Input 
            placeholder="New duty..." 
            value={newDuty} 
            onChange={(e) => setNewDuty(e.target.value)}
            className="text-xs h-8 bg-muted/50"
          />
          <Button 
            className="w-full h-8 text-xs font-bold" 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (newDuty) {
                onAssign(name, newDuty);
                setNewDuty('');
              }
            }}
          >
            Assign Duty
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Admin Component ---

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error("Admin stats fetch error:", e);
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

  const handleUpdateGame = async (gameId: string, rtp: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/game-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, config: { rtp } })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Config Updated", description: data.message });
      }
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePack = async (packId: string, price: string, gc: string, sc: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/store-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, packData: { price, gc, sc } })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Pack Updated", description: data.message });
      }
    } catch (e) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignDuty = async (aiName: string, duty: string) => {
    try {
      const res = await fetch('/api/admin/assign-duty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiName, duty })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Duty Assigned", description: data.message });
        fetchStats(); // Refresh to see potential changes
      }
    } catch (e) {
      toast({ title: "Assignment Failed", variant: "destructive" });
    }
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
            <AICard 
              name="LuckyAI" role="Manager" status="Active" 
              tasks={['Managing Employees', 'Daily Reporting']} 
              onAssign={handleAssignDuty}
            />
            <AICard 
              name="SecurityAI" role="Fraud/KYC" status="Monitoring" 
              tasks={['Analyzing Transactions', 'Verifying IDs']} 
              onAssign={handleAssignDuty}
            />
            <AICard 
              name="SlotsAI" role="RTP Monitor" status="Active" 
              tasks={['Adjusting Odds', 'Player Tracking']} 
              onAssign={handleAssignDuty}
            />
            <AICard 
              name="JoseyAI" role="Poker Watch" status="Idle" 
              tasks={['Anti-Collusion', 'Pot Monitoring']} 
              onAssign={handleAssignDuty}
            />
            <AICard 
              name="SocialAI" role="Chat Mod" status="Active" 
              tasks={['Moderating Chat', 'Banning Bots']} 
              onAssign={handleAssignDuty}
            />
            <AICard 
              name="PromotionsAI" role="Bonus Desk" status="Active" 
              tasks={['Assigning SC Bonuses', 'Event Planning']} 
              onAssign={handleAssignDuty}
            />
          </div>
        </TabsContent>

        <TabsContent value="games">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Game Management</CardTitle>
                <CardDescription>Configure RTP, table limits, and room settings.</CardDescription>
              </div>
              <Button size="sm" className="font-bold">
                <Settings className="w-4 h-4 mr-2" /> Add New Game
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Slots', 'Poker', 'Bingo', 'Sportsbook'].map((game) => (
                  <GameConfigRow key={game} game={game} onUpdate={handleUpdateGame} isSaving={isSaving} />
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
                  { id: 'starter', name: 'Starter Pack', price: 4.99, gc: 5000, sc: 5 },
                  { id: 'pro', name: 'Pro Pack', price: 9.99, gc: 12000, sc: 12 },
                  { id: 'high-roller', name: 'High Roller', price: 49.99, gc: 65000, sc: 65 },
                ].map((pack) => (
                  <PackConfigRow key={pack.id} pack={pack} onUpdate={handleUpdatePack} isSaving={isSaving} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader><CardTitle>Revenue (7d)</CardTitle></CardHeader>
                <CardContent className="h-64 flex items-end justify-around gap-2 pt-8">
                  {stats?.revenueData?.map((h: number, i: number) => (
                    <div key={i} className="bg-primary w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer group relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Day {i + 1}: {h}%
                      </div>
                    </div>
                  )) || [40, 60, 45, 90, 85, 100, 75].map((h, i) => (
                    <div key={i} className="bg-primary w-full rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {stats?.recentTransactions?.map((tx: any) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            tx.type === 'Purchase' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                          )}>
                            {tx.user[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{tx.user}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{tx.type} • {tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-black", tx.currency === 'SC' ? 'text-primary' : 'text-foreground')}>
                            {tx.amount}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{tx.currency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader><CardTitle>User Activity</CardTitle></CardHeader>
                <CardContent className="h-64 flex flex-col items-center justify-center gap-6">
                  <div className="w-48 h-48 rounded-full border-[15px] border-primary border-r-transparent animate-spin-slow flex items-center justify-center relative">
                    <div className="absolute inset-0 border-[15px] border-muted rounded-full -z-10" />
                    <div className="text-center">
                      <span className="text-3xl font-black block">84%</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Retention</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>Retained</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted" />
                      <span>Churned</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-muted/30">
                <CardHeader><CardTitle className="text-sm">Platform Health</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Server Uptime</span>
                    <span className="font-bold">99.98%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Socket Connections</span>
                    <span className="font-bold">142 Active</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">DB Latency</span>
                    <span className="font-bold">14ms</span>
                  </div>
                  <div className="pt-2">
                    <Badge className="w-full justify-center bg-primary/20 text-primary border-none">
                      <CheckCircle2 className="w-3 h-3 mr-2" /> ALL SYSTEMS GO
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Helper Config Rows ---

const GameConfigRow = ({ game, onUpdate, isSaving }: any) => {
  const [rtp, setRtp] = useState('96.5');
  
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
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
        <div className="flex items-center gap-2 px-3 bg-background border border-border rounded-md">
          <span className="text-xs font-bold text-muted-foreground">RTP:</span>
          <Input 
            value={rtp} 
            onChange={(e) => setRtp(e.target.value)}
            className="w-16 h-8 border-none bg-transparent p-0 text-sm font-bold" 
          />
          <span className="text-xs font-bold text-muted-foreground">%</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdate(game, rtp)}
          disabled={isSaving}
          className="h-10"
        >
          {isSaving ? "..." : <Save className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

const PackConfigRow = ({ pack, onUpdate, isSaving }: any) => {
  const [price, setPrice] = useState(pack.price.toString());
  const [gc, setGc] = useState(pack.gc.toString());
  const [sc, setSc] = useState(pack.sc.toString());

  return (
    <div className="grid grid-cols-4 gap-4 items-center p-4 bg-muted/50 rounded-xl border border-border">
      <span className="font-bold">{pack.name}</span>
      <Input value={price} onChange={(e) => setPrice(e.target.value)} className="bg-background h-10 font-mono text-sm" />
      <Input value={gc} onChange={(e) => setGc(e.target.value)} className="bg-background h-10 font-mono text-sm" />
      <div className="flex gap-2">
        <Input value={sc} onChange={(e) => setSc(e.target.value)} className="bg-background h-10 font-mono text-sm flex-1" />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdate(pack.id, price, gc, sc)}
          disabled={isSaving}
          className="h-10"
        >
          {isSaving ? "..." : <Save className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default Admin;
