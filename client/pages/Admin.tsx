import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { admin, adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Gamepad2, BarChart3, AlertCircle, Zap, Search, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [aiEmployees, setAiEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, playersRes, gamesRes, aiRes] = await Promise.all([
          adminV2.dashboard.getStats(),
          adminV2.players.list(1, 20, searchTerm),
          adminV2.games.list(),
          admin.getAIEmployees(),
        ]);

        setStats(statsRes);
        setPlayers(playersRes.players || []);
        setGames(gamesRes || []);
        setAiEmployees(aiRes.data || []);
      } catch (error: any) {
        console.error('Failed to fetch admin data:', error);
        toast.error('Failed to load admin dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, authLoading, navigate, searchTerm]);

  const handleToggleMaintenance = async () => {
    try {
      await admin.setMaintenanceMode(!maintenanceMode);
      setMaintenanceMode(!maintenanceMode);
      toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error('Failed to toggle maintenance mode');
    }
  };

  const handleUpdatePlayerBalance = async (playerId: number, gc: number, sc: number) => {
    try {
      await admin.updatePlayerBalance(playerId, gc, sc);
      toast.success('Player balance updated');
      // Refresh players
      const res = await admin.getPlayers();
      setPlayers(res.data || []);
    } catch (error: any) {
      toast.error('Failed to update player balance');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Maintenance Mode */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">ADMIN DASHBOARD</h1>
          <p className="text-muted-foreground">Manage the CoinKrazy AI2 platform</p>
        </div>
        <Button
          onClick={handleToggleMaintenance}
          variant={maintenanceMode ? 'destructive' : 'outline'}
        >
          {maintenanceMode ? 'End Maintenance' : 'Maintenance Mode'}
        </Button>
      </div>

      {maintenanceMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-600 font-semibold">Maintenance mode is active - players cannot access the platform</p>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Players</CardDescription>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stats.totalPlayers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePlayers || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-600">${(stats.totalRevenue || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Active Games</CardDescription>
              <Gamepad2 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">{games?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Available to play</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Pending Actions</CardDescription>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-yellow-600">{(stats.pendingKyc || 0) + (stats.pendingWithdrawals || 0)}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingKyc || 0} KYC, {stats.pendingWithdrawals || 0} Withdrawals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="players">
            <Users className="w-4 h-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="games">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Games
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Zap className="w-4 h-4 mr-2" />
            AI Staff
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
              <CardDescription>Manage player accounts and balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto border border-border rounded-lg p-2">
                  {players.length > 0 ? (
                    players.map(player => (
                      <div key={player.id} className="p-3 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50">
                        <div>
                          <p className="font-semibold">{player.username}</p>
                          <p className="text-xs text-muted-foreground">{player.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{player.status}</Badge>
                            <Badge variant="outline" className="text-xs">{player.kyc_level}</Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p><span className="text-muted-foreground">GC:</span> {(player.gc_balance || 0).toLocaleString()}</p>
                          <p><span className="text-muted-foreground">SC:</span> {(player.sc_balance || 0).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{player.games_played || 0} games</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No players found</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Games</CardTitle>
              <CardDescription>Manage game settings and RTP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {games.length > 0 ? (
                  games.map(game => (
                    <div key={game.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{game.name}</p>
                        <p className="text-xs text-muted-foreground">{game.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={game.enabled ? 'default' : 'destructive'}>
                          RTP: {game.rtp}%
                        </Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No games found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Staff Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Employees</CardTitle>
              <CardDescription>Manage AI assistants and their duties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {aiEmployees.length > 0 ? (
                  aiEmployees.map(ai => (
                    <div key={ai.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{ai.name}</p>
                          <p className="text-xs text-muted-foreground">{ai.role}</p>
                        </div>
                        <Badge variant={ai.status === 'active' ? 'default' : 'secondary'}>
                          {ai.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tasks: {ai.tasks?.join(', ') || 'None'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No AI employees found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Wagered</p>
                  <p className="text-2xl font-bold">
                    ${(stats?.totalWagered || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Won</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(stats?.totalWon || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Average Player Value</p>
                  <p className="text-2xl font-bold">
                    ${(stats?.averagePlayerValue || 0).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Games Today</p>
                  <p className="text-2xl font-bold">{stats?.gamesToday || 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">New Players Today</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.newPlayersToday || 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Open Support Tickets</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.openTickets || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
