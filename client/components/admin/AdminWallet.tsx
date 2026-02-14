import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, DollarSign, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  player_id: number;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  created_at: string;
  description: string;
}

const AdminWallet = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [totalGCCirculation, setTotalGCCirculation] = useState(0);
  const [totalSCCirculation, setTotalSCCirculation] = useState(0);

  const fetchTransactions = async (playerId: string) => {
    if (!playerId) {
      setTransactions([]);
      return;
    }
    try {
      setIsLoading(true);
      const response = await adminV2.players.getTransactions(parseInt(playerId), 1, 50);
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedPlayerId);
  }, [selectedPlayerId]);

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total GC in Circulation</CardDescription>
            <Wallet className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">
              1,234,567
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gold Coins distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total SC in Circulation</CardDescription>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-600">
              45,234.56
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sweeps Coins distributed</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and track wallet transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter player ID..."
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              type="number"
            />
            <Button onClick={() => setSelectedPlayerId('')}>Clear</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Balance Before</th>
                    <th className="text-left py-2 px-2">Balance After</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-mono text-xs">{tx.type}</td>
                      <td className="py-3 px-2 font-mono">{tx.amount.toFixed(2)}</td>
                      <td className="py-3 px-2 font-mono text-xs">{tx.balance_before?.toFixed(2) || '-'}</td>
                      <td className="py-3 px-2 font-mono text-xs">{tx.balance_after?.toFixed(2) || '-'}</td>
                      <td className="py-3 px-2 text-xs">{tx.description}</td>
                      <td className="py-3 px-2 text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {selectedPlayerId ? 'No transactions found for this player' : 'Enter a player ID to view transactions'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Wallet Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Operations</CardTitle>
          <CardDescription>Manage player wallet balances</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const playerId = parseInt(formData.get('playerId') as string);
                const gc = parseFloat(formData.get('gcAmount') as string);
                const sc = parseFloat(formData.get('scAmount') as string);
                await adminV2.players.updateBalance(playerId, gc, sc, 'Admin fund addition');
                toast.success('Funds added successfully');
                (e.target as HTMLFormElement).reset();
              } catch (error) {
                toast.error('Failed to add funds');
              }
            }} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Add Funds</h4>
              <div className="space-y-2">
                <Input name="playerId" placeholder="Player ID" type="number" required />
                <Input name="gcAmount" placeholder="GC Amount" type="number" step="0.01" required />
                <Input name="scAmount" placeholder="SC Amount" type="number" step="0.01" required />
                <Button className="w-full" type="submit">Add Funds</Button>
              </div>
            </form>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const playerId = parseInt(formData.get('playerId') as string);
                const gc = -parseFloat(formData.get('gcAmount') as string);
                const sc = -parseFloat(formData.get('scAmount') as string);
                await adminV2.players.updateBalance(playerId, gc, sc, 'Admin fund removal');
                toast.success('Funds removed successfully');
                (e.target as HTMLFormElement).reset();
              } catch (error) {
                toast.error('Failed to remove funds');
              }
            }} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Remove Funds</h4>
              <div className="space-y-2">
                <Input name="playerId" placeholder="Player ID" type="number" required />
                <Input name="gcAmount" placeholder="GC Amount" type="number" step="0.01" required />
                <Input name="scAmount" placeholder="SC Amount" type="number" step="0.01" required />
                <Button variant="destructive" className="w-full" type="submit">Remove Funds</Button>
              </div>
            </form>

            <form onSubmit={(e) => {
              e.preventDefault();
              toast.info('Transfer feature coming soon');
            }} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Transfer Between Players</h4>
              <div className="space-y-2">
                <Input placeholder="From Player ID" type="number" required />
                <Input placeholder="To Player ID" type="number" required />
                <Input placeholder="GC Amount" type="number" required />
                <Button className="w-full" type="submit">Transfer</Button>
              </div>
            </form>

            <form onSubmit={(e) => {
              e.preventDefault();
              toast.info('Reset wallet feature coming soon');
            }} className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Reset Wallet</h4>
              <div className="space-y-2">
                <Input placeholder="Player ID" type="number" required />
                <select className="w-full px-3 py-2 border rounded-md text-sm">
                  <option>Select action...</option>
                  <option>Reset to Zero</option>
                  <option>Reset to Default</option>
                </select>
                <Button variant="destructive" className="w-full" type="submit">Reset Wallet</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWallet;
