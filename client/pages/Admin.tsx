import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { admin } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Gamepad2, BarChart3, AlertCircle, Zap } from 'lucide-react';
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

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, playersRes, gamesRes, aiRes] = await Promise.all([
          admin.getDashboardStats(),
          admin.getPlayers(),
          admin.getGames(),
          admin.getAIEmployees(),
        ]);

        setStats(statsRes.data);
        setPlayers(playersRes.data || []);
        setGames(gamesRes.data || []);
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
  }, [isAdmin, authLoading, navigate]);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Total Players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stats.total_players || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_players || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Verified Players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-600">{stats.verified_players || 0}</div>
              <p className="text-xs text-muted-foreground">KYC Verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Active Games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-primary">{games?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Available to play</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>AI Employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-600">{aiEmployees?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active assistants</p>
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players.length > 0 ? (
                  players.map(player => (
                    <div key={player.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.email}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>GC: {(player.gc_balance || 0).toLocaleString()}</p>
                        <p>SC: {(player.sc_balance || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No players found</p>
                )}
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
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Platform statistics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg GC Balance</p>
                    <p className="text-2xl font-bold">
                      ${(stats?.avg_gc_balance || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg SC Balance</p>
                    <p className="text-2xl font-bold">
                      ${(stats?.avg_sc_balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
