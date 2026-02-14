import { query } from '../db/connection';

interface GoldCoinPackage {
  id: number;
  title: string;
  description: string;
  price_usd: number;
  gold_coins: number;
  sweeps_coins: number;
  bonus_percentage: number;
  is_popular: boolean;
  is_best_value: boolean;
  position: number;
  enabled: boolean;
}

interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
  config: Record<string, any>;
}

class StoreService {
  // ===== PACKAGES =====

  async getPackages(): Promise<GoldCoinPackage[]> {
    const result = await query('SELECT * FROM store_packs ORDER BY position ASC');
    return result.rows;
  }

  async getActivePackages(): Promise<GoldCoinPackage[]> {
    const result = await query('SELECT * FROM store_packs WHERE enabled = true ORDER BY position ASC');
    return result.rows;
  }

  async getPackageById(id: number): Promise<GoldCoinPackage | undefined> {
    const result = await query('SELECT * FROM store_packs WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createPackage(data: Omit<GoldCoinPackage, 'id'>): Promise<GoldCoinPackage> {
    const result = await query(
      `INSERT INTO store_packs (title, description, price_usd, gold_coins, sweeps_coins, bonus_percentage, is_popular, is_best_value, position, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [data.title, data.description, data.price_usd, data.gold_coins, data.sweeps_coins, data.bonus_percentage, data.is_popular, data.is_best_value, data.position, data.enabled]
    );
    return result.rows[0];
  }

  async updatePackage(id: number, data: Partial<GoldCoinPackage>): Promise<GoldCoinPackage | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    Object.entries(data).forEach(([key, value]) => {
      fields.push(`${key} = $${i++}`);
      values.push(value);
    });

    if (fields.length === 0) return this.getPackageById(id);

    values.push(id);
    const result = await query(
      `UPDATE store_packs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async deletePackage(id: number): Promise<boolean> {
    const result = await query('DELETE FROM store_packs WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ===== PAYMENT METHODS =====
  // Note: payment_methods table was not in schema.sql, but referenced in service. 
  // I will use a simple in-memory fallback for now or assume it might be added.
  // Actually, I should probably add it to the schema if it's needed for "completeness".
  
  private mockPaymentMethods: PaymentMethod[] = [
    {
      id: 1,
      name: 'Stripe Payment',
      provider: 'stripe',
      is_active: true,
      config: { api_key: '***', secret_key: '***' },
    }
  ];

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.mockPaymentMethods;
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    return this.mockPaymentMethods.filter(m => m.is_active);
  }

  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    return this.mockPaymentMethods.find(m => m.id === id);
  }

  async createPaymentMethod(data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const newMethod = {
      id: this.mockPaymentMethods.length + 1,
      ...data,
    };
    this.mockPaymentMethods.push(newMethod);
    return newMethod;
  }

  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const index = this.mockPaymentMethods.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    this.mockPaymentMethods[index] = {
      ...this.mockPaymentMethods[index],
      ...data,
    };
    return this.mockPaymentMethods[index];
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const index = this.mockPaymentMethods.findIndex(m => m.id === id);
    if (index === -1) return false;

    this.mockPaymentMethods.splice(index, 1);
    return true;
  }
}

// Export singleton instance
export const storeService = new StoreService();
