import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Trophy, TrendingUp, Edit2, Copy, Loader } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { wallet } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, txRes] = await Promise.all([
          ApiClient.getProfile(),
          ApiClient.getWalletTransactions(50)
        ]);

        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          setEditForm({ name: profileRes.data.username || '', email: profileRes.data.email || '' });
        } else {
          toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
        }

        if (txRes.success && txRes.data) {
          setTransactions(txRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await ApiClient.updateProfile({
        name: editForm.name,
        email: editForm.email
      });

      if (res.success) {
        setUser({ ...user, ...editForm });
        setIsEditing(false);
        toast({ title: 'Success', description: 'Profile updated successfully' });
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to update profile', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Failed to load profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const wins = transactions.filter(t => (t.gc_amount || 0) + (t.sc_amount || 0) > 0).length;
  const losses = transactions.filter(t => (t.gc_amount || 0) + (t.sc_amount || 0) < 0).length;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-black">{user.username}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <Badge className="mt-2 bg-primary/10 text-primary border-none">Member</Badge>
                </div>
              </div>
              <Button
                className="font-bold gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4" /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Wins</p>
                <p className="text-2xl font-black text-green-500">{wins}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Losses</p>
                <p className="text-2xl font-black text-red-500">{losses}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Win Rate</p>
                <p className="text-2xl font-black">{winRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">GC Balance</p>
                <p className="text-2xl font-black">{wallet?.goldCoins || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">SC Balance</p>
                <p className="text-2xl font-black text-green-500">{wallet?.sweepsCoins || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details / Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Profile' : 'Account Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold uppercase text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full mt-2 p-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold uppercase text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full mt-2 p-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Email</p>
                    <p className="font-bold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Joined</p>
                    <p className="font-bold">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx, i) => {
                const amount = (tx.gc_amount || 0) + (tx.sc_amount || 0);
                const isWin = amount > 0;
                const currencyLabel = tx.gc_amount ? 'GC' : 'SC';

                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-bold capitalize">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={isWin ? 'bg-green-500/10 text-green-500 border-none' : 'bg-red-500/10 text-red-500 border-none'}>
                        {isWin ? 'Win' : 'Loss'}
                      </Badge>
                      <p className={`font-black mt-1 ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                        {isWin ? '+' : ''}{Math.abs(amount)} {currencyLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
