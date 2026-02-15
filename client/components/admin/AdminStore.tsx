import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Edit2, Plus, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface GoldCoinPackage {
  id: number;
  title: string;
  description: string;
  price_usd: number;
  gold_coins: number;
  sweeps_coins: number;
  bonus_sc: number;
  is_popular: boolean;
  display_order: number;
}

interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
}

const AdminStore = () => {
  const [packages, setPackages] = useState<GoldCoinPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPackageForm, setShowNewPackageForm] = useState(false);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GoldCoinPackage | null>(null);

  const totalRevenue = packages.reduce((sum, p) => sum + (p.price_usd || 0), 0);
  const totalSales = packages.length;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [packRes, methodRes] = await Promise.all([
        adminV2.store.getPackages(),
        adminV2.store.getPaymentMethods(),
      ]);
      setPackages(packRes.data || []);
      setPaymentMethods(methodRes.data || []);
    } catch (error: any) {
      console.error('Failed to load store data:', error);
      toast.error('Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      setIsLoading(true);
      const newPackageData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price_usd: parseFloat(formData.get('price') as string),
        gold_coins: parseInt(formData.get('gc') as string),
        sweeps_coins: parseInt(formData.get('sc') as string),
        bonus_sc: parseInt(formData.get('bonus') as string),
      };
      await adminV2.store.createPackage(newPackageData);
      setShowNewPackageForm(false);
      toast.success('Package created');
      (e.target as HTMLFormElement).reset();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create package');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (confirm('Delete this package?')) {
      try {
        setIsLoading(true);
        await adminV2.store.deletePackage(id);
        setPackages(packages.filter(p => p.id !== id));
        toast.success('Package deleted');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete package');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTogglePaymentMethod = async (id: number) => {
    try {
      const method = paymentMethods.find(m => m.id === id);
      if (!method) return;
      await adminV2.store.updatePaymentMethod(id, { is_active: !method.is_active });
      setPaymentMethods(methods => methods.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
      toast.success('Payment method updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment method');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* PACKAGES */}
        <TabsContent value="packages" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gold Coin Packages</CardTitle>
                <CardDescription>Create and manage coin packages</CardDescription>
              </div>
              <Button onClick={() => setShowNewPackageForm(!showNewPackageForm)}>
                {showNewPackageForm ? '✕ Cancel' : <><Plus className="w-4 h-4 mr-2" /> New</> }
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewPackageForm && (
                <form onSubmit={handleCreatePackage} className="p-4 border rounded-lg bg-muted/30 space-y-3 mb-4">
                  <Input name="title" placeholder="Package Title" required />
                  <Input name="description" placeholder="Description" required />
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="price" type="number" step="0.01" placeholder="Price (USD)" required />
                    <Input name="gc" type="number" placeholder="Gold Coins" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="sc" type="number" placeholder="Sweeps Coins" required />
                    <Input name="bonus" type="number" placeholder="Bonus SC" required />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Creating...' : 'Create'}</Button>
                </form>
              )}

              <div className="space-y-3">
                {packages.map(pkg => (
                  <div key={pkg.id} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{pkg.title}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-primary font-semibold">${pkg.price_usd.toFixed(2)}</span>
                          <span>{pkg.gold_coins.toLocaleString()} GC</span>
                          <span>{pkg.sweeps_coins} SC</span>
                          <span className="text-green-600">+{pkg.bonus_sc} SC Bonus</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pkg.is_popular && <Badge>Popular</Badge>}
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePackage(pkg.id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENT METHODS */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure payment processing</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map(method => (
                <div key={method.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{method.provider}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={method.is_active ? 'default' : 'secondary'}>{method.is_active ? 'Active' : 'Inactive'}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleTogglePaymentMethod(method.id)}>
                      {method.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Payment Gateway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select className="w-full px-3 py-2 border rounded-md text-sm">
                <option>Select Gateway...</option>
                <option>Stripe</option>
                <option>PayPal</option>
                <option>Square</option>
                <option>Cryptocurrency</option>
              </select>
              <Input placeholder="API Key" type="password" />
              <Input placeholder="API Secret" type="password" />
              <Button className="w-full">Add Gateway</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Sales</CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Avg Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalRevenue / totalSales).toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStore;
