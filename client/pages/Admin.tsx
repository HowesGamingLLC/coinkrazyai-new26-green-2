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
  AlertCircle,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Lock,
  MessageSquare,
  Gift,
  Trophy,
  CreditCard,
  Check,
  Zap,
  Users2,
  Database,
  FileText,
  Key,
  Upload,
  Bell,
  Link2
} from 'lucide-react';
import { PlayerManagement } from '@/components/admin/PlayerManagement';
import { BonusManagement } from '@/components/admin/BonusManagement';
import { GameManagement } from '@/components/admin/GameManagement';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { SecurityManagement } from '@/components/admin/SecurityManagement';
import { WalletManagement } from '@/components/admin/WalletManagement';
import { KYCSettings } from '@/components/admin/KYCSettings';
import { PokerManagement } from '@/components/admin/PokerManagement';
import { BingoManagement } from '@/components/admin/BingoManagement';
import { SportsManagement } from '@/components/admin/SportsManagement';
import { APIManagement } from '@/components/admin/APIManagement';
import { VIPManagement } from '@/components/admin/VIPManagement';
import { MakeItRain } from '@/components/admin/MakeItRain';
import { JackpotManagement } from '@/components/admin/JackpotManagement';
import { FraudDetection } from '@/components/admin/FraudDetection';
import { RedemptionApprovals } from '@/components/admin/RedemptionApprovals';
import { SupportTickets } from '@/components/admin/SupportTickets';
import {
  BankingPayments,
  GameIngestion,
  AIGameBuilder,
  ContentManagement,
  CasinoSettings,
  SocialManagement,
  PlayerRetention,
  AffiliateManagement,
  SystemLogs,
  DatabaseBackups,
  PerformanceMonitoring,
  NotificationSettings,
  ComplianceManagement,
  AdvancedSettings,
  CallerManagement,
  SportsSettings
} from '@/components/admin/RemainingAdminSections';

// --- Stats Card ---
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

// --- Admin Section Placeholder ---
const AdminSection = ({ title, description, icon: Icon }: any) => (
  <Card className="border-border">
    <CardHeader>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p className="text-center">
          <span className="font-bold">{title}</span> management interface coming soon...
        </p>
      </div>
    </CardContent>
  </Card>
);

// --- Sidebar Navigation ---
const AdminSideMenu = ({ activeSection, onSelectSection }: any) => {
  const sections = [
    {
      title: "CORE MANAGEMENT",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "players", label: "Player Management", icon: Users2 },
        { id: "kyc", label: "KYC Settings", icon: Shield },
        { id: "wallet", label: "Wallet Management", icon: Coins }
      ]
    },
    {
      title: "FINANCIAL",
      items: [
        { id: "rain", label: "Make it Rain", icon: Gift },
        { id: "bonuses", label: "Bonus Management", icon: Zap },
        { id: "jackpot", label: "Jackpot Management", icon: Trophy },
        { id: "banking", label: "Banking & Payments", icon: CreditCard },
        { id: "redemption", label: "Redemption Approvals", icon: Check }
      ]
    },
    {
      title: "GAMES & SPORTS",
      items: [
        { id: "library", label: "Game Library", icon: Gamepad2 },
        { id: "ingestion", label: "Game Ingestion", icon: Upload },
        { id: "ai-builder", label: "AI Game Builder", icon: Bot },
        { id: "poker", label: "Poker Management", icon: Gamepad2 },
        { id: "bingo", label: "Bingo Management", icon: Gamepad2 },
        { id: "caller", label: "Caller Management", icon: MessageSquare },
        { id: "sportsbook", label: "Sportsbook", icon: TrendingUp },
        { id: "sports-settings", label: "Sports Settings", icon: Settings }
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { id: "security", label: "Security Management", icon: Lock },
        { id: "content", label: "Content Management", icon: FileText },
        { id: "casino-settings", label: "Casino Settings", icon: Settings },
        { id: "social", label: "Social Management", icon: MessageSquare },
        { id: "retention", label: "Player Retention", icon: Users }
      ]
    },
    {
      title: "ADVANCED",
      items: [
        { id: "analytics", label: "Analytics & Reporting", icon: BarChart3 },
        { id: "vip", label: "VIP Management", icon: Gift },
        { id: "fraud", label: "Fraud Detection", icon: ShieldAlert },
        { id: "affiliate", label: "Affiliate Management", icon: Link2 },
        { id: "tickets", label: "Support & Tickets", icon: MessageSquare },
        { id: "logs", label: "System Logs", icon: FileText },
        { id: "api", label: "API Management", icon: Key },
        { id: "database", label: "Database & Backups", icon: Database },
        { id: "performance", label: "Performance", icon: Zap },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "compliance", label: "Compliance", icon: Check },
        { id: "advanced-settings", label: "Advanced Settings", icon: Settings }
      ]
    }
  ];

  return (
    <div className="w-72 bg-muted/30 border-r border-border overflow-y-auto max-h-[calc(100vh-200px)]">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider sticky top-0 bg-muted/50 border-b border-border/50">
            {section.title}
          </div>
          <div className="space-y-1 p-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Admin Component ---
const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/stats', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">ADMIN <span className="text-primary">COMMAND CENTER</span></h1>
          <p className="text-muted-foreground">Full control over CoinKrazyAI2 platform.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="border-destructive/20 text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <AdminSideMenu activeSection={activeSection} onSelectSection={setActiveSection} />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-4">
          {activeSection === 'dashboard' && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon={Users} label="Total Players" value={stats?.overview?.totalPlayers || '1.5K'} color="text-blue-400" />
                <StatsCard icon={Gamepad2} label="Active Tables" value={stats?.overview?.activeTables || '24'} color="text-green-400" />
                <StatsCard icon={Coins} label="GC Volume" value={`${Math.floor(stats?.overview?.totalGCVolume || 0)} GC`} color="text-yellow-400" />
                <StatsCard icon={ShieldAlert} label="System Health" value={stats?.overview?.systemHealth || 'Optimal'} color="text-primary" />
              </div>

              {/* Dashboard Overview */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted border border-border p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    AI Employees
                  </TabsTrigger>
                  <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Game Control
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Platform Activity</CardTitle>
                      <CardDescription>Real-time platform metrics and performance</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex items-end justify-around gap-2 pt-8">
                      {[40, 60, 45, 90, 85, 100, 75].map((h, i) => (
                        <div key={i} className="bg-primary w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }} />
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai" className="text-muted-foreground">
                  <AdminSection title="AI Employees" description="Manage AI agents and their duties" icon={Bot} />
                </TabsContent>

                <TabsContent value="games" className="text-muted-foreground">
                  <AdminSection title="Game Control" description="Configure game settings and RTP" icon={Gamepad2} />
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Core Management Sections */}
          {activeSection === 'players' && <PlayerManagement />}
          {activeSection === 'kyc' && <KYCSettings />}
          {activeSection === 'wallet' && <WalletManagement />}

          {/* Financial Sections */}
          {activeSection === 'rain' && <MakeItRain />}
          {activeSection === 'bonuses' && <BonusManagement />}
          {activeSection === 'jackpot' && <JackpotManagement />}
          {activeSection === 'banking' && <BankingPayments />}
          {activeSection === 'redemption' && <RedemptionApprovals />}

          {/* Games & Sports Sections */}
          {activeSection === 'library' && <GameManagement />}
          {activeSection === 'ingestion' && <GameIngestion />}
          {activeSection === 'ai-builder' && <AIGameBuilder />}
          {activeSection === 'poker' && <PokerManagement />}
          {activeSection === 'bingo' && <BingoManagement />}
          {activeSection === 'caller' && <CallerManagement />}
          {activeSection === 'sportsbook' && <SportsManagement />}
          {activeSection === 'sports-settings' && <SportsSettings />}

          {/* Operations Sections */}
          {activeSection === 'security' && <SecurityManagement />}
          {activeSection === 'content' && <ContentManagement />}
          {activeSection === 'casino-settings' && <CasinoSettings />}
          {activeSection === 'social' && <SocialManagement />}
          {activeSection === 'retention' && <PlayerRetention />}

          {/* Advanced Sections */}
          {activeSection === 'analytics' && <AnalyticsDashboard />}
          {activeSection === 'vip' && <VIPManagement />}
          {activeSection === 'fraud' && <FraudDetection />}
          {activeSection === 'affiliate' && <AffiliateManagement />}
          {activeSection === 'tickets' && <SupportTickets />}
          {activeSection === 'logs' && <SystemLogs />}
          {activeSection === 'api' && <APIManagement />}
          {activeSection === 'database' && <DatabaseBackups />}
          {activeSection === 'performance' && <PerformanceMonitoring />}
          {activeSection === 'notifications' && <NotificationSettings />}
          {activeSection === 'compliance' && <ComplianceManagement />}
          {activeSection === 'advanced-settings' && <AdvancedSettings />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
