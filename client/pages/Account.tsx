import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Lock, Bell, Eye, EyeOff } from 'lucide-react';

export default function Account() {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    email: 'john@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactor: false,
    responsibleGaming: true,
    gameSpeed: 'normal',
    theme: 'dark'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your security password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 block">Current Password</label>
              <Input type="password" placeholder="••••••••" className="bg-muted/50" />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">New Password</label>
              <Input type="password" placeholder="••••••••" className="bg-muted/50" />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">Confirm Password</label>
              <Input type="password" placeholder="••••••••" className="bg-muted/50" />
            </div>
            <Button className="font-bold">
              <Save className="w-4 h-4 mr-2" /> Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add extra security to your account</CardDescription>
              </div>
              <Badge className={settings.twoFactor ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'} style={{borderStyle: 'none'}}>
                {settings.twoFactor ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {settings.twoFactor ? 'Two-factor authentication is enabled.' : 'Protect your account with an extra layer of security.'}
            </p>
            <Button className={settings.twoFactor ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'font-bold'}>
              {settings.twoFactor ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Email Notifications', key: 'emailNotifications', desc: 'Game results, bonuses, promotions' },
              { label: 'SMS Notifications', key: 'smsNotifications', desc: 'Important account alerts' },
              { label: 'Push Notifications', key: 'pushNotifications', desc: 'Live game updates' }
            ].map((notif) => (
              <div key={notif.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-bold">{notif.label}</p>
                  <p className="text-sm text-muted-foreground">{notif.desc}</p>
                </div>
                <input type="checkbox" defaultChecked={settings[notif.key as keyof typeof settings] === true} className="w-5 h-5 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Game Speed</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option>Slow</option>
                  <option selected>Normal</option>
                  <option>Fast</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Theme</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option>Light</option>
                  <option selected>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <p className="font-bold">Responsible Gaming</p>
                <p className="text-sm text-muted-foreground">Set spending limits and session timers</p>
              </div>
              <input type="checkbox" defaultChecked={settings.responsibleGaming} className="w-5 h-5 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="font-bold text-sm mb-2">Delete Account</p>
              <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all data. This cannot be undone.</p>
              <Button className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
