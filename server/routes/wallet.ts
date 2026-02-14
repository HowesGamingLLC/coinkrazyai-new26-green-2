import { RequestHandler } from "express";
import * as dbQueries from "../db/queries";

// Get player's wallet
export const handleGetWallet: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const player = await dbQueries.getPlayerById(req.user.playerId);

    if (player.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const wallet = player.rows[0];

    res.json({
      success: true,
      data: {
        goldCoins: wallet.gc_balance,
        sweepsCoins: wallet.sc_balance,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Wallet] Get wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet'
    });
  }
};

// Update wallet balance (internal use - updates GC or SC)
export const handleUpdateWallet: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { currency, amount, type = 'transfer', description } = req.body;

    if (!currency || amount === undefined || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate amount
    if (amount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount cannot be zero'
      });
    }

    const player = await dbQueries.getPlayerById(req.user.playerId);
    if (player.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const current = player.rows[0];
    const gcAmount = currency.toUpperCase() === 'GC' ? amount : 0;
    const scAmount = currency.toUpperCase() === 'SC' ? amount : 0;

    // Check for insufficient balance on losses/bets
    if (amount < 0) {
      if (currency.toUpperCase() === 'GC' && current.gc_balance + amount < 0) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient gold coins'
        });
      }
      if (currency.toUpperCase() === 'SC' && current.sc_balance + amount < 0) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient sweeps coins'
        });
      }
    }

    // Record transaction in wallet ledger
    const transactionDesc = description || `${type} - ${currency} ${amount > 0 ? '+' : ''}${amount}`;
    const ledger = await dbQueries.recordWalletTransaction(
      req.user.playerId,
      type,
      gcAmount,
      scAmount,
      transactionDesc
    );

    // Get updated wallet
    const updated = await dbQueries.getPlayerById(req.user.playerId);
    const updatedWallet = updated.rows[0];

    res.json({
      success: true,
      data: {
        goldCoins: updatedWallet.gc_balance,
        sweepsCoins: updatedWallet.sc_balance,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Wallet] Update wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wallet'
    });
  }
};

// Get transaction history
export const handleGetTransactions: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const result = await dbQueries.getWalletHistory(req.user.playerId, limit);

    const transactions = result.rows.map(row => ({
      id: row.id,
      type: row.transaction_type,
      gc_amount: row.gc_amount,
      sc_amount: row.sc_amount,
      gc_balance_after: row.gc_balance_after,
      sc_balance_after: row.sc_balance_after,
      description: row.description,
      created_at: row.created_at
    }));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('[Wallet] Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
};

// Get wallet statistics
export const handleGetWalletStats: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const stats = await dbQueries.getPlayerStats();

    res.json({
      success: true,
      data: {
        totalWagered: stats.rows[0]?.total_wagered || 0,
        totalWon: stats.rows[0]?.total_won || 0,
        totalSpent: stats.rows[0]?.total_spent || 0,
        gamesPlayed: stats.rows[0]?.games_played || 0
      }
    });
  } catch (error) {
    console.error('[Wallet] Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet stats'
    });
  }
};
