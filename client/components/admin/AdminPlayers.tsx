import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Eye, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface Player {
  id: number;
  username: string;
  email: string;
  name: string;
  gc_balance: number;
  sc_balance: number;
  status: string;
  kyc_level: string;
  created_at: string;
  last_login?: string;
  total_wagered?: number;
  total_won?: number;
  games_played?: number;
}

const AdminPlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await adminV2.players.list(page, limit, searchTerm, statusFilter, kycFilter);
      setPlayers(response.players || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch players:', error);
      toast.error('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, kycFilter]);

  useEffect(() => {
    fetchPlayers();
  }, [page, searchTerm, statusFilter, kycFilter]);

  const handleStatusChange = async (playerId: number, newStatus: string) => {
    try {
      await adminV2.players.updateStatus(playerId, newStatus);
      toast.success(`Player status updated to ${newStatus}`);
      fetchPlayers();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update player status');
    }
  };

  const handleBalanceUpdate = async (playerId: number, gcAmount: number, scAmount: number) => {
    const newGc = prompt('Enter new GC balance:', String(gcAmount));
    if (newGc !== null) {
      const newSc = prompt('Enter new SC balance:', String(scAmount));
      if (newSc !== null) {
        try {
          await adminV2.players.updateBalance(playerId, parseFloat(newGc), parseFloat(newSc));
          toast.success('Player balance updated');
          fetchPlayers();
        } catch (error) {
          console.error('Failed to update balance:', error);
          toast.error('Failed to update player balance');
        }
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Player Management</CardTitle>
          <CardDescription>Search and manage player accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search Players</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Banned">Banned</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">KYC Level</label>
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Levels</option>
                <option value="None">None</option>
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Full">Full</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setKycFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle>Players ({total})</CardTitle>
          <CardDescription>Page {page} of {totalPages}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Player</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Balance</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">KYC</th>
                    <th className="text-left py-2 px-2">Games</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-semibold">{player.username}</p>
                          <p className="text-xs text-muted-foreground">{player.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs">{player.email}</td>
                      <td className="py-3 px-2">
                        <div className="text-xs">
                          <p className="font-mono">{player.gc_balance.toLocaleString()} GC</p>
                          <p className="font-mono text-muted-foreground">{player.sc_balance.toFixed(2)} SC</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={player.status === 'Active' ? 'default' : 'destructive'}>
                          {player.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{player.kyc_level}</Badge>
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {player.games_played || 0} games
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBalanceUpdate(player.id, player.gc_balance, player.sc_balance)}
                          >
                            Balance
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(
                              player.id,
                              player.status === 'Active' ? 'Suspended' : 'Active'
                            )}
                          >
                            {player.status === 'Active' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No players found</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlayers;
