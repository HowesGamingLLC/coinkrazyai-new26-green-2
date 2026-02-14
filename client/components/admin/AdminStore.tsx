import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trash2, Edit2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface GoldCoinPackage {
  id: number;
  title: string;
  description: string;
  price_usd: number;
  gold_coins: number;
  sweeps_coins: number;
  bonus_sc: number;
  bonus_percentage: number;
  is_popular: boolean;
  is_best_value: boolean;
  display_order: number;
}

interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
  config: Record<string, any>;
}

const AdminStore = () => {
  const [packages, setPackages] = useState<GoldCoinPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<GoldCoinPackage | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch packages and payment methods
      const [packagesRes, methodsRes] = await Promise.all([
        adminV2.store?.getPackages?.() || Promise.resolve({ data: [] }),
        adminV2.store?.getPaymentMethods?.() || Promise.resolve({ data: [] }),
      ]);
      
      setPackages(packagesRes.data || []);
      setPaymentMethods(methodsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch store data:', error);
      toast.error('Failed to load store data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Gold Coin Packages</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="settings">Store Settings</TabsTrigger>
        </TabsList>

        {/* Gold Coin Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gold Coin Packages</CardTitle>
                  <CardDescription>Create and manage coin packages for players</CardDescription>
                </div>
                <Button onClick={() => setEditingPackage({} as GoldCoinPackage)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Package
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : packages.length > 0 ? (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{pkg.title}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-primary font-semibold">${Number(pkg.price_usd).toFixed(2)}</span>
                          <span className="text-secondary">{Number(pkg.gold_coins).toLocaleString()} GC</span>
                          <span className="text-primary">{Number(pkg.sweeps_coins).toFixed(2)} SC</span>
                          {pkg.bonus_sc > 0 && (
                            <span className="text-green-600 font-semibold">+{Number(pkg.bonus_sc).toFixed(2)} SC Bonus</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPackage(pkg)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await adminV2.store?.deletePackage?.(pkg.id);
                              setPackages(packages.filter(p => p.id !== pkg.id));
                              toast.success('Package deleted');
                            } catch (error) {
                              toast.error('Failed to delete package');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No packages created yet</p>
              )}
            </CardContent>
          </Card>

          {/* Package Form */}
          {editingPackage && (
            <Card className="border-2 border-primary/50">
              <CardHeader>
                <CardTitle>
                  {editingPackage.id ? 'Edit Package' : 'Create New Package'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PackageForm
                  package={editingPackage}
                  onSubmit={async (data) => {
                    try {
                      if (editingPackage.id) {
                        await adminV2.store?.updatePackage?.(editingPackage.id, data);
                        setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...data } : p));
                        toast.success('Package updated');
                      } else {
                        const res = await adminV2.store?.createPackage?.(data);
                        setPackages([...packages, res.data]);
                        toast.success('Package created');
                      }
                      setEditingPackage(null);
                    } catch (error) {
                      toast.error('Failed to save package');
                    }
                  }}
                  onCancel={() => setEditingPackage(null)}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Configure payment gateways (Stripe, PayPal, Google Pay)</CardDescription>
                </div>
                <Button onClick={() => setEditingPaymentMethod({} as PaymentMethod)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Provider: {method.provider}
                        </p>
                        <div className="mt-2">
                          {method.is_active ? (
                            <span className="px-2 py-1 bg-green-500/10 text-green-700 rounded text-xs font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-500/10 text-gray-700 rounded text-xs font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPaymentMethod(method)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await adminV2.store?.deletePaymentMethod?.(method.id);
                              setPaymentMethods(paymentMethods.filter(m => m.id !== method.id));
                              toast.success('Payment method deleted');
                            } catch (error) {
                              toast.error('Failed to delete payment method');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No payment methods configured</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Form */}
          {editingPaymentMethod && (
            <Card className="border-2 border-primary/50">
              <CardHeader>
                <CardTitle>
                  {editingPaymentMethod.id ? 'Edit Payment Method' : 'Add Payment Method'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodForm
                  method={editingPaymentMethod}
                  onSubmit={async (data) => {
                    try {
                      if (editingPaymentMethod.id) {
                        await adminV2.store?.updatePaymentMethod?.(editingPaymentMethod.id, data);
                        setPaymentMethods(paymentMethods.map(m => m.id === editingPaymentMethod.id ? { ...m, ...data } : m));
                        toast.success('Payment method updated');
                      } else {
                        const res = await adminV2.store?.createPaymentMethod?.(data);
                        setPaymentMethods([...paymentMethods, res.data]);
                        toast.success('Payment method added');
                      }
                      setEditingPaymentMethod(null);
                    } catch (error) {
                      toast.error('Failed to save payment method');
                    }
                  }}
                  onCancel={() => setEditingPaymentMethod(null)}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Store Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Configure store name, description, and general settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StoreSettingsForm onSave={() => toast.success('Store settings saved')} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface PackageFormProps {
  package: Partial<GoldCoinPackage>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({ package: pkg, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(pkg);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Package Title</label>
          <Input
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Gold Starter Pack"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Price (USD)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.price_usd || ''}
            onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })}
            placeholder="9.99"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">Description</label>
        <Input
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Package description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold">Gold Coins</label>
          <Input
            type="number"
            value={formData.gold_coins || ''}
            onChange={(e) => setFormData({ ...formData, gold_coins: parseInt(e.target.value) })}
            placeholder="1000"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Sweeps Coins</label>
          <Input
            type="number"
            step="0.01"
            value={formData.sweeps_coins || ''}
            onChange={(e) => setFormData({ ...formData, sweeps_coins: parseFloat(e.target.value) })}
            placeholder="5.00"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">SC Bonus</label>
          <Input
            type="number"
            step="0.01"
            value={formData.bonus_sc || ''}
            onChange={(e) => setFormData({ ...formData, bonus_sc: parseFloat(e.target.value) })}
            placeholder="1.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold">Bonus %</label>
          <Input
            type="number"
            value={formData.bonus_percentage || ''}
            onChange={(e) => setFormData({ ...formData, bonus_percentage: parseInt(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Display Order</label>
          <Input
            type="number"
            value={formData.display_order || ''}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
            placeholder="1"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_popular || false}
            onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
          />
          <span className="text-sm">Mark as Popular</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_best_value || false}
            onChange={(e) => setFormData({ ...formData, is_best_value: e.target.checked })}
          />
          <span className="text-sm">Mark as Best Value</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Package
        </Button>
      </div>
    </form>
  );
};

interface PaymentMethodFormProps {
  method: Partial<PaymentMethod>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ method, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(method);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Method Name</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Stripe Payment"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Provider</label>
          <select
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={formData.provider || ''}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            required
          >
            <option value="">Select Provider</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="google_pay">Google Pay</option>
            <option value="apple_pay">Apple Pay</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
        <label className="text-sm font-semibold">Provider Configuration</label>
        <div>
          <label className="text-xs text-muted-foreground">API Key</label>
          <Input
            type="password"
            value={formData.config?.api_key || ''}
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, api_key: e.target.value }
            })}
            placeholder="Your API key"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Secret Key</label>
          <Input
            type="password"
            value={formData.config?.secret_key || ''}
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, secret_key: e.target.value }
            })}
            placeholder="Your secret key"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.is_active !== false}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <label htmlFor="active" className="text-sm">Enable this payment method</label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Payment Method
        </Button>
      </div>
    </form>
  );
};

interface StoreSettingsFormProps {
  onSave: () => void;
}

const StoreSettingsForm: React.FC<StoreSettingsFormProps> = ({ onSave }) => {
  const [formData, setFormData] = useState({
    store_name: 'CoinKrazy Store',
    store_description: 'Get more Gold Coins and Sweeps Coins',
    bonus_percentage: 20,
    currency: 'USD',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminV2.store?.updateSettings?.(formData);
      onSave();
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold">Store Name</label>
        <Input
          value={formData.store_name}
          onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Store Description</label>
        <Input
          value={formData.store_description}
          onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Default Bonus %</label>
          <Input
            type="number"
            value={formData.bonus_percentage}
            onChange={(e) => setFormData({ ...formData, bonus_percentage: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Currency</label>
          <select className="w-full px-3 py-2 border rounded-md text-sm" value={formData.currency}>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Save Settings
      </Button>
    </form>
  );
};

export default AdminStore;
