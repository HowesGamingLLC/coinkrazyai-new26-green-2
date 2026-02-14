import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreVertical, UserPlus, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PlayerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchPlayers();
    fetchStats();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/admin/players?limit=50');
      const data = await response.json();
      if (data.success) {
        setPlayers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const mockPlayers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2024-01-15', balance: '$1,250.50', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2024-02-03', balance: '$3,420.00', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', joinDate: '2024-01-22', balance: '$560.25', status: 'Suspended', lastLogin: 'Never' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', joinDate: '2024-02-10', balance: '$2,100.00', status: 'Active', lastLogin: '5 hours ago' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', joinDate: '2024-01-30', balance: '$890.75', status: 'Active', lastLogin: '3 hours ago' },
  ];

  const filters = [
    { id: 'all', label: 'All Players', count: 1527 },
    { id: 'active', label: 'Active', count: 1450 },
    { id: 'suspended', label: 'Suspended', count: 42 },
    { id: 'vip', label: 'VIP', count: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Total Players</p>
            <p className="text-3xl font-black">{stats?.players?.total_players || '1,527'}</p>
            <p className="text-xs text-green-500 mt-2">+12% this week</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Active Now</p>
            <p className="text-3xl font-black">{stats?.players?.active_players || '342'}</p>
            <p className="text-xs text-muted-foreground mt-2">22% of total</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Verified</p>
            <p className="text-3xl font-black">{stats?.players?.verified_players || '156'}</p>
            <p className="text-xs text-blue-500 mt-2">KYC Complete</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Avg GC Balance</p>
            <p className="text-3xl font-black">{stats?.players?.avg_gc_balance ? Math.round(stats.players.avg_gc_balance) : '42'}</p>
            <p className="text-xs text-muted-foreground mt-2">Per player</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Player Database</CardTitle>
              <CardDescription>Manage and monitor all players</CardDescription>
            </div>
            <Button className="font-bold">
              <UserPlus className="w-4 h-4 mr-2" /> Add Player
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or player ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors",
                  selectedFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground hover:bg-muted"
                )}
              >
                {filter.label} <span className="ml-2 opacity-60">({filter.count})</span>
              </button>
            ))}
          </div>

          {/* Players Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-bold uppercase text-xs text-muted-foreground">Player</th>
                  <th className="text-left p-3 font-bold uppercase text-xs text-muted-foreground">Joined</th>
                  <th className="text-left p-3 font-bold uppercase text-xs text-muted-foreground">Balance</th>
                  <th className="text-left p-3 font-bold uppercase text-xs text-muted-foreground">Last Login</th>
                  <th className="text-left p-3 font-bold uppercase text-xs text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-bold uppercase text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(players.length > 0 ? players : mockPlayers).map((player) => (
                  <tr key={player.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div>
                        <p className="font-bold">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.email}</p>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{player.join_date ? new Date(player.join_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-3 font-bold">${(parseFloat(player.gc_balance || 0) + parseFloat(player.sc_balance || 0)).toFixed(2)}</td>
                    <td className="p-3 text-muted-foreground text-xs">{player.last_login ? new Date(player.last_login).toLocaleString() : 'Never'}</td>
                    <td className="p-3">
                      <Badge className={cn(
                        (player.status || 'Active') === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500',
                        'border-none'
                      )}>
                        {player.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          {player.status === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(players.length > 0 ? players : mockPlayers).length} of {stats?.players?.total_players || 1527} players
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={loading}>Previous</Button>
              <Button variant="outline" size="sm" disabled={loading}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
