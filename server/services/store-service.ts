// In-memory store for packages and payment methods
// This will be replaced with database queries once persistence is added

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

class StoreService {
  private packages: GoldCoinPackage[] = [
    {
      id: 1,
      title: 'Starter Pack',
      description: 'Perfect for new players',
      price_usd: 4.99,
      gold_coins: 500,
      sweeps_coins: 2.5,
      bonus_sc: 0,
      bonus_percentage: 0,
      is_popular: false,
      is_best_value: false,
      display_order: 1,
    },
    {
      id: 2,
      title: 'Popular Pack',
      description: 'Most popular choice',
      price_usd: 9.99,
      gold_coins: 1200,
      sweeps_coins: 6.0,
      bonus_sc: 1.0,
      bonus_percentage: 20,
      is_popular: true,
      is_best_value: false,
      display_order: 2,
    },
    {
      id: 3,
      title: 'Gold Pack',
      description: 'Best value option',
      price_usd: 24.99,
      gold_coins: 3500,
      sweeps_coins: 17.5,
      bonus_sc: 5.0,
      bonus_percentage: 25,
      is_popular: false,
      is_best_value: true,
      display_order: 3,
    },
  ];

  private paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      name: 'Stripe Payment',
      provider: 'stripe',
      is_active: true,
      config: { api_key: '***', secret_key: '***' },
    },
    {
      id: 2,
      name: 'PayPal',
      provider: 'paypal',
      is_active: true,
      config: { api_key: '***', secret_key: '***' },
    },
    {
      id: 3,
      name: 'Google Pay',
      provider: 'google_pay',
      is_active: true,
      config: { api_key: '***', secret_key: '***' },
    },
  ];

  private nextPackageId = 4;
  private nextPaymentMethodId = 4;

  // ===== PACKAGES =====

  getPackages(): GoldCoinPackage[] {
    return this.packages.sort((a, b) => a.display_order - b.display_order);
  }

  getActivePackages(): GoldCoinPackage[] {
    return this.packages.filter(p => p.gold_coins > 0).sort((a, b) => a.display_order - b.display_order);
  }

  getPackageById(id: number): GoldCoinPackage | undefined {
    return this.packages.find(p => p.id === id);
  }

  createPackage(data: Omit<GoldCoinPackage, 'id'>): GoldCoinPackage {
    const newPackage: GoldCoinPackage = {
      ...data,
      id: this.nextPackageId++,
    };
    this.packages.push(newPackage);
    return newPackage;
  }

  updatePackage(id: number, data: Partial<GoldCoinPackage>): GoldCoinPackage | undefined {
    const index = this.packages.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.packages[index] = {
      ...this.packages[index],
      ...data,
      id, // Ensure ID doesn't change
    };
    return this.packages[index];
  }

  deletePackage(id: number): boolean {
    const index = this.packages.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.packages.splice(index, 1);
    return true;
  }

  // ===== PAYMENT METHODS =====

  getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods;
  }

  getActivePaymentMethods(): PaymentMethod[] {
    return this.paymentMethods.filter(m => m.is_active);
  }

  getPaymentMethodById(id: number): PaymentMethod | undefined {
    return this.paymentMethods.find(m => m.id === id);
  }

  createPaymentMethod(data: Omit<PaymentMethod, 'id'>): PaymentMethod {
    const newMethod: PaymentMethod = {
      ...data,
      id: this.nextPaymentMethodId++,
    };
    this.paymentMethods.push(newMethod);
    return newMethod;
  }

  updatePaymentMethod(id: number, data: Partial<PaymentMethod>): PaymentMethod | undefined {
    const index = this.paymentMethods.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    this.paymentMethods[index] = {
      ...this.paymentMethods[index],
      ...data,
      id, // Ensure ID doesn't change
    };
    return this.paymentMethods[index];
  }

  deletePaymentMethod(id: number): boolean {
    const index = this.paymentMethods.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.paymentMethods.splice(index, 1);
    return true;
  }
}

// Export singleton instance
export const storeService = new StoreService();
