import { RequestHandler } from "express";
import * as dbQueries from "../db/queries";
import { query } from "../db/connection";

// Get available coin packs
export const handleGetPacks: RequestHandler = async (req, res) => {
  try {
    const result = await dbQueries.getStorePacks();

    const packs = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price_usd: row.price_usd,
      gold_coins: row.gold_coins,
      sweeps_coins: row.sweeps_coins,
      bonus_percentage: row.bonus_percentage,
      is_popular: row.is_popular,
      is_best_value: row.is_best_value
    }));

    res.json({
      success: true,
      data: packs
    });
  } catch (error) {
    console.error('[Store] Get packs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get packs'
    });
  }
};

// Purchase a coin pack
export const handlePurchase: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { pack_id, payment_token } = req.body;

    if (!pack_id) {
      return res.status(400).json({
        success: false,
        error: 'Pack ID required'
      });
    }

    // Get pack details
    const packResult = await query(
      'SELECT * FROM store_packs WHERE id = $1 AND enabled = true',
      [pack_id]
    );

    if (packResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pack not found'
      });
    }

    const pack = packResult.rows[0];

    // In a real implementation, you would:
    // 1. Create a Stripe/Square payment intent
    // 2. Verify the payment_token
    // 3. Process the payment
    // 4. Only proceed if payment is confirmed
    
    // For now, we'll simulate successful payment
    // In production, replace this with actual payment processing
    
    // Record the purchase
    const purchaseResult = await dbQueries.recordPurchase(
      req.user.playerId,
      pack_id,
      pack.price_usd,
      pack.gold_coins,
      pack.sweeps_coins,
      `demo-payment-${Date.now()}`
    );

    // Add coins to wallet
    const totalGc = pack.gold_coins;
    const totalSc = pack.sweeps_coins || 0;
    
    await dbQueries.recordWalletTransaction(
      req.user.playerId,
      'purchase',
      totalGc,
      totalSc,
      `Purchased ${pack.title}`
    );

    // Get updated wallet
    const player = await dbQueries.getPlayerById(req.user.playerId);
    const updatedWallet = player.rows[0];

    res.json({
      success: true,
      data: {
        message: `Successfully purchased ${pack.title}!`,
        purchase_id: purchaseResult.rows[0].id,
        wallet: {
          goldCoins: updatedWallet.gc_balance,
          sweepsCoins: updatedWallet.sc_balance
        }
      }
    });
  } catch (error) {
    console.error('[Store] Purchase error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process purchase'
    });
  }
};

// Get purchase history for player
export const handleGetPurchaseHistory: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await dbQueries.getPurchaseHistory(req.user.playerId, limit);

    const history = result.rows.map(row => ({
      id: row.id,
      pack_title: row.pack_title,
      amount_usd: row.amount_usd,
      gold_coins: row.gold_coins,
      sweeps_coins: row.sweeps_coins,
      status: row.status,
      created_at: row.created_at
    }));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('[Store] Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get purchase history'
    });
  }
};

// ===== ADMIN ROUTES =====

// Update pack (admin)
export const handleUpdatePack: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { pack_id, title, description, price_usd, gold_coins, sweeps_coins, bonus_percentage, is_popular, is_best_value } = req.body;

    if (!pack_id) {
      return res.status(400).json({
        success: false,
        error: 'Pack ID required'
      });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (price_usd !== undefined) {
      updates.push(`price_usd = $${paramIndex++}`);
      values.push(price_usd);
    }
    if (gold_coins !== undefined) {
      updates.push(`gold_coins = $${paramIndex++}`);
      values.push(gold_coins);
    }
    if (sweeps_coins !== undefined) {
      updates.push(`sweeps_coins = $${paramIndex++}`);
      values.push(sweeps_coins);
    }
    if (bonus_percentage !== undefined) {
      updates.push(`bonus_percentage = $${paramIndex++}`);
      values.push(bonus_percentage);
    }
    if (is_popular !== undefined) {
      updates.push(`is_popular = $${paramIndex++}`);
      values.push(is_popular);
    }
    if (is_best_value !== undefined) {
      updates.push(`is_best_value = $${paramIndex++}`);
      values.push(is_best_value);
    }

    updates.push(`updated_at = NOW()`);
    values.push(pack_id);

    if (updates.length <= 1) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    const result = await query(
      `UPDATE store_packs SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pack not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Store] Update pack error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pack'
    });
  }
};

// Add new pack (admin)
export const handleAddPack: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { title, description, price_usd, gold_coins, sweeps_coins, bonus_percentage, is_popular, is_best_value, position } = req.body;

    if (!title || price_usd === undefined || gold_coins === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, price_usd, gold_coins'
      });
    }

    const result = await query(
      `INSERT INTO store_packs (title, description, price_usd, gold_coins, sweeps_coins, bonus_percentage, is_popular, is_best_value, enabled, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
       RETURNING *`,
      [title, description || null, price_usd, gold_coins, sweeps_coins || 0, bonus_percentage || 0, is_popular || false, is_best_value || false, position || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Store] Add pack error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add pack'
    });
  }
};

// Delete pack (admin)
export const handleDeletePack: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { pack_id } = req.body;

    if (!pack_id) {
      return res.status(400).json({
        success: false,
        error: 'Pack ID required'
      });
    }

    const result = await query(
      'UPDATE store_packs SET enabled = false WHERE id = $1 RETURNING *',
      [pack_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pack not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Store] Delete pack error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete pack'
    });
  }
};

// Square webhook handler
export const handleSquareWebhook: RequestHandler = async (req, res) => {
  try {
    // In production, verify HMAC signature here
    // const signature = req.headers['x-square-hmac-sha256'];
    // Verify signature with your Square API key...

    console.log('[Store] Square webhook received:', req.body.type);

    // Handle different event types
    const eventType = req.body.type;

    // For now, just acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('[Store] Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
};
