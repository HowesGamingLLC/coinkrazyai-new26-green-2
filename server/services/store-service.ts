import { query } from '../db/connection';

interface GoldCoinPackage {
  id: number;
  title: string;
  description: string;
  price_usd: number;
  gold_coins: number;
  sweeps_coins: number;
  bonus_sc?: number;
  bonus_percentage: number;
  is_popular: boolean;
  is_best_value: boolean;
  position?: number;
  display_order?: number;
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
    const result = await query('SELECT * FROM store_packs ORDER BY display_order ASC');
    return result.rows.map((row: any) => this.mapRowToPackage(row));
  }

  async getActivePackages(): Promise<GoldCoinPackage[]> {
    try {
      console.log('[StoreService] getActivePackages called');

      // Try with display_order first, fall back to position if needed
      let result;
      try {
        console.log('[StoreService] Trying with display_order column...');
        result = await query('SELECT * FROM store_packs WHERE enabled = true ORDER BY display_order ASC');
      } catch (orderError: any) {
        console.warn('[StoreService] display_order query failed, trying position:', orderError.message);
        result = await query('SELECT * FROM store_packs WHERE enabled = true ORDER BY COALESCE(display_order, position, 0) ASC');
      }

      console.log('[StoreService] Query successful, rows:', result.rows.length);

      if (result.rows.length === 0) {
        console.log('[StoreService] No active packages found');
        return [];
      }

      console.log('[StoreService] Sample row columns:', Object.keys(result.rows[0]));

      return result.rows.map((row: any) => this.mapRowToPackage(row));
    } catch (error) {
      console.error('[StoreService] getActivePackages error:', error);
      if (error instanceof Error) {
        console.error('[StoreService] Error message:', error.message);
        console.error('[StoreService] Error code:', (error as any).code);
      }
      throw error;
    }
  }

  async getPackageById(id: number): Promise<GoldCoinPackage | undefined> {
    const result = await query('SELECT * FROM store_packs WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRowToPackage(result.rows[0]) : undefined;
  }

  async createPackage(data: Omit<GoldCoinPackage, 'id'>): Promise<GoldCoinPackage> {
    const displayOrder = data.display_order || data.position || 0;
    const result = await query(
      `INSERT INTO store_packs (title, description, price_usd, gold_coins, sweeps_coins, bonus_percentage, is_popular, is_best_value, display_order, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [data.title, data.description, data.price_usd, data.gold_coins, data.sweeps_coins, data.bonus_percentage, data.is_popular, data.is_best_value, displayOrder, data.enabled]
    );
    return this.mapRowToPackage(result.rows[0]);
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
    return result.rows[0] ? this.mapRowToPackage(result.rows[0]) : undefined;
  }

  async deletePackage(id: number): Promise<boolean> {
    const result = await query('DELETE FROM store_packs WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Helper to map database row to GoldCoinPackage interface
  private mapRowToPackage(row: any): GoldCoinPackage {
    try {
      const mapped: GoldCoinPackage = {
        id: Number(row.id),
        title: String(row.title || ''),
        description: String(row.description || ''),
        price_usd: Number(row.price_usd || 0),
        gold_coins: Number(row.gold_coins || 0),
        sweeps_coins: Number(row.sweeps_coins || 0),
        bonus_sc: Number(row.bonus_sc || 0),
        bonus_percentage: Number(row.bonus_percentage || 0),
        is_popular: Boolean(row.is_popular),
        is_best_value: Boolean(row.is_best_value),
        display_order: Number(row.display_order || 0),
        enabled: Boolean(row.enabled),
      };
      console.log('[StoreService] Mapped package:', { id: mapped.id, title: mapped.title, display_order: mapped.display_order });
      return mapped;
    } catch (error) {
      console.error('[StoreService] Error mapping row:', row, error);
      throw error;
    }
  }

  // ===== PAYMENT METHODS =====

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const result = await query('SELECT * FROM payment_methods ORDER BY id ASC');
    return result.rows.map((row: any) => this.mapRowToPaymentMethod(row));
  }

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const result = await query('SELECT * FROM payment_methods WHERE is_active = true ORDER BY id ASC');
    return result.rows.map((row: any) => this.mapRowToPaymentMethod(row));
  }

  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    const result = await query('SELECT * FROM payment_methods WHERE id = $1', [id]);
    return result.rows[0] ? this.mapRowToPaymentMethod(result.rows[0]) : undefined;
  }

  async createPaymentMethod(data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const result = await query(
      `INSERT INTO payment_methods (name, provider, is_active, config)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.provider, data.is_active, data.config]
    );
    return this.mapRowToPaymentMethod(result.rows[0]);
  }

  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id') {
        fields.push(`${key} = $${i++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getPaymentMethodById(id);

    values.push(id);
    const result = await query(
      `UPDATE payment_methods SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapRowToPaymentMethod(result.rows[0]) : undefined;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const result = await query('DELETE FROM payment_methods WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  private mapRowToPaymentMethod(row: any): PaymentMethod {
    return {
      id: Number(row.id),
      name: String(row.name),
      provider: String(row.provider),
      is_active: Boolean(row.is_active),
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
    };
  }
}

// Export singleton instance
export const storeService = new StoreService();
