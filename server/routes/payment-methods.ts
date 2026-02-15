import { RequestHandler } from 'express';
import { db } from '../db/connection';

interface PaymentMethodRequest {
  method_type: 'bank' | 'paypal' | 'cashapp';
  is_primary?: boolean;
  bank_account_holder?: string;
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  account_type?: string;
  paypal_email?: string;
  cashapp_handle?: string;
}

/**
 * Add a payment method for player
 */
export const handleAddPaymentMethod: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { method_type, is_primary, ...details } = req.body as PaymentMethodRequest;

  if (!playerId || !method_type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // If marking as primary, unset other primaries
    if (is_primary) {
      await db.query(
        `UPDATE player_payment_methods 
         SET is_primary = FALSE
         WHERE player_id = $1`,
        [playerId]
      );
    }

    const result = await db.query(
      `INSERT INTO player_payment_methods (
        player_id, method_type, is_primary,
        bank_account_holder, bank_name, account_number, routing_number, account_type,
        paypal_email, cashapp_handle
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, player_id, method_type, is_primary, paypal_email, cashapp_handle, account_type, created_at`,
      [
        playerId,
        method_type,
        is_primary || false,
        details.bank_account_holder || null,
        details.bank_name || null,
        details.account_number ? encryptValue(details.account_number) : null,
        details.routing_number ? encryptValue(details.routing_number) : null,
        details.account_type || null,
        details.paypal_email || null,
        details.cashapp_handle || null,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Payment method added successfully',
    });
  } catch (error: any) {
    console.error('Failed to add payment method:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update payment method
 */
export const handleUpdatePaymentMethod: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { methodId } = req.params;
  const { is_primary, ...updates } = req.body;

  if (!playerId || !methodId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // Verify ownership
    const methodResult = await db.query(
      `SELECT * FROM player_payment_methods WHERE id = $1 AND player_id = $2`,
      [methodId, playerId]
    );

    if (methodResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }

    if (is_primary) {
      await db.query(
        `UPDATE player_payment_methods SET is_primary = FALSE WHERE player_id = $1`,
        [playerId]
      );
    }

    const result = await db.query(
      `UPDATE player_payment_methods 
       SET is_primary = COALESCE($1, is_primary),
           paypal_email = COALESCE($2, paypal_email),
           cashapp_handle = COALESCE($3, cashapp_handle),
           updated_at = NOW()
       WHERE id = $4 AND player_id = $5
       RETURNING id, player_id, method_type, is_primary, paypal_email, cashapp_handle, updated_at`,
      [
        is_primary !== undefined ? is_primary : null,
        updates.paypal_email || null,
        updates.cashapp_handle || null,
        methodId,
        playerId,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to update payment method:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete payment method
 */
export const handleDeletePaymentMethod: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { methodId } = req.params;

  if (!playerId || !methodId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      `DELETE FROM player_payment_methods 
       WHERE id = $1 AND player_id = $2
       RETURNING id`,
      [methodId, playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }

    res.json({
      success: true,
      message: 'Payment method deleted',
    });
  } catch (error: any) {
    console.error('Failed to delete payment method:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get player's payment methods
 */
export const handleGetPaymentMethods: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const result = await db.query(
      `SELECT 
        id, player_id, method_type, is_primary, 
        bank_name, account_type, paypal_email, cashapp_handle,
        is_verified, verified_at, last_used_at, created_at
       FROM player_payment_methods 
       WHERE player_id = $1
       ORDER BY is_primary DESC, created_at DESC`,
      [playerId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Failed to fetch payment methods:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get primary payment method
 */
export const handleGetPrimaryPaymentMethod: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const result = await db.query(
      `SELECT 
        id, player_id, method_type, is_primary,
        bank_name, account_type, paypal_email, cashapp_handle,
        is_verified, verified_at, last_used_at, created_at
       FROM player_payment_methods 
       WHERE player_id = $1 AND is_primary = TRUE
       LIMIT 1`,
      [playerId]
    );

    res.json({
      success: true,
      data: result.rows.length > 0 ? result.rows[0] : null,
    });
  } catch (error: any) {
    console.error('Failed to fetch primary payment method:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Verify payment method (microdeposit, etc)
 */
export const handleVerifyPaymentMethod: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { methodId } = req.params;
  const { verification_code } = req.body;

  if (!playerId || !methodId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // TODO: Integrate with payment processor to verify
    // For now, just mark as verified
    
    const result = await db.query(
      `UPDATE player_payment_methods 
       SET is_verified = TRUE, verified_at = NOW()
       WHERE id = $1 AND player_id = $2
       RETURNING id, is_verified, verified_at`,
      [methodId, playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Payment method not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to verify payment method:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Helper function to encrypt sensitive data
 */
function encryptValue(value: string): string {
  // TODO: Implement proper encryption using crypto module
  // For now, return as-is (should be implemented with proper encryption)
  return value;
}
