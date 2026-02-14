import { RequestHandler } from 'express';

// ===== GOLD COIN PACKAGES =====

export const getStorePackages: RequestHandler = async (req, res) => {
  try {
    // For now, return mock data - replace with DB query when schema is ready
    const packages = [
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

    res.json({ success: true, data: packages });
  } catch (error) {
    console.error('Failed to get packages:', error);
    res.status(500).json({ error: 'Failed to get packages' });
  }
};

export const createStorePackage: RequestHandler = async (req, res) => {
  try {
    const { title, description, price_usd, gold_coins, sweeps_coins, bonus_sc, bonus_percentage, is_popular, is_best_value, display_order } = req.body;

    // Validation
    if (!title || !price_usd || !gold_coins || !sweeps_coins) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For now, return success with mock data - replace with DB insert when schema is ready
    const newPackage = {
      id: Math.floor(Math.random() * 10000),
      title,
      description,
      price_usd: parseFloat(price_usd),
      gold_coins: parseInt(gold_coins),
      sweeps_coins: parseFloat(sweeps_coins),
      bonus_sc: parseFloat(bonus_sc) || 0,
      bonus_percentage: parseInt(bonus_percentage) || 0,
      is_popular: is_popular || false,
      is_best_value: is_best_value || false,
      display_order: parseInt(display_order) || 1,
    };

    res.json({ success: true, data: newPackage });
  } catch (error) {
    console.error('Failed to create package:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
};

export const updateStorePackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price_usd, gold_coins, sweeps_coins, bonus_sc, bonus_percentage, is_popular, is_best_value, display_order } = req.body;

    // For now, return success with updated mock data
    const updatedPackage = {
      id: parseInt(id),
      title,
      description,
      price_usd: parseFloat(price_usd),
      gold_coins: parseInt(gold_coins),
      sweeps_coins: parseFloat(sweeps_coins),
      bonus_sc: parseFloat(bonus_sc) || 0,
      bonus_percentage: parseInt(bonus_percentage) || 0,
      is_popular: is_popular || false,
      is_best_value: is_best_value || false,
      display_order: parseInt(display_order) || 1,
    };

    res.json({ success: true, data: updatedPackage });
  } catch (error) {
    console.error('Failed to update package:', error);
    res.status(500).json({ error: 'Failed to update package' });
  }
};

export const deleteStorePackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // For now, just return success
    res.json({ success: true, message: `Package ${id} deleted` });
  } catch (error) {
    console.error('Failed to delete package:', error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
};

// ===== PAYMENT METHODS =====

export const getPaymentMethods: RequestHandler = async (req, res) => {
  try {
    // Return mock payment methods - replace with DB query when schema is ready
    const methods = [
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

    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
};

export const createPaymentMethod: RequestHandler = async (req, res) => {
  try {
    const { name, provider, config, is_active } = req.body;

    if (!name || !provider) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMethod = {
      id: Math.floor(Math.random() * 10000),
      name,
      provider,
      is_active: is_active !== false,
      config: config || {},
    };

    res.json({ success: true, data: newMethod });
  } catch (error) {
    console.error('Failed to create payment method:', error);
    res.status(500).json({ error: 'Failed to create payment method' });
  }
};

export const updatePaymentMethod: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, provider, config, is_active } = req.body;

    const updatedMethod = {
      id: parseInt(id),
      name,
      provider,
      is_active: is_active !== false,
      config: config || {},
    };

    res.json({ success: true, data: updatedMethod });
  } catch (error) {
    console.error('Failed to update payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
};

export const deletePaymentMethod: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    res.json({ success: true, message: `Payment method ${id} deleted` });
  } catch (error) {
    console.error('Failed to delete payment method:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
};

// ===== STORE SETTINGS =====

export const getStoreSettings: RequestHandler = async (req, res) => {
  try {
    const settings = {
      store_name: 'CoinKrazy Store',
      store_description: 'Get more Gold Coins and Sweeps Coins to play your favorite games',
      bonus_percentage: 20,
      currency: 'USD',
      enabled: true,
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to get store settings:', error);
    res.status(500).json({ error: 'Failed to get store settings' });
  }
};

export const updateStoreSettings: RequestHandler = async (req, res) => {
  try {
    const { store_name, store_description, bonus_percentage, currency, enabled } = req.body;

    const settings = {
      store_name: store_name || 'CoinKrazy Store',
      store_description: store_description || 'Get more Gold Coins and Sweeps Coins to play your favorite games',
      bonus_percentage: parseInt(bonus_percentage) || 20,
      currency: currency || 'USD',
      enabled: enabled !== false,
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to update store settings:', error);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
};
