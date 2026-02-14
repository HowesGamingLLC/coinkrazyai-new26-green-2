import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Calendar, Mail, Verified } from 'lucide-react';

const Profile = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile loading failed</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  const joinDate = user.join_date ? new Date(user.join_date).toLocaleDateString() : 'Unknown';
  const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Player Profile</h1>
        <p className="text-muted-foreground">View and manage your account information</p>
      </div>

      {/* Main Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Account Status</p>
              <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                {user.status}
              </Badge>
            </div>

            {user.kyc_verified && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Verified className="w-4 h-4" />
                <span>KYC Verified</span>
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Button className="w-full" asChild variant="outline">
                <a href="/account">Edit Profile</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-lg">{user.email}</p>
              </div>

              {/* Join Date */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </label>
                <p className="text-lg">{joinDate}</p>
              </div>

              {/* KYC Level */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Verification Level
                </label>
                <Badge variant="outline" className="text-base">
                  {user.kyc_level}
                </Badge>
              </div>

              {/* Last Login */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Last Login
                </label>
                <p className="text-lg">{lastLogin}</p>
              </div>
            </div>

            {/* Wallet Summary */}
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold mb-4">Wallet Balance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/20 p-4 rounded-lg border border-secondary/20">
                  <p className="text-sm text-muted-foreground mb-1">Gold Coins</p>
                  <p className="text-2xl font-bold text-secondary">{Number(user.gc_balance ?? 0).toLocaleString()}</p>
                </div>
                <div className="bg-primary/20 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Sweeps Coins</p>
                  <p className="text-2xl font-bold text-primary">{Number(user.sc_balance ?? 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your security and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <a href="/account">Change Password</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/account">Two-Factor Authentication</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/account">Privacy Settings</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
