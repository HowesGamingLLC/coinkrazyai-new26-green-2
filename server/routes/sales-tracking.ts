import { RequestHandler } from 'express';
import { db } from '../db/connection';

interface SalesTransactionRequest {
  game_type: 'scratch_ticket' | 'pull_tab';
  design_id: number;
  purchase_cost_sc: number;
  win_amount_sc?: number;
}

/**
 * Record a sales transaction
 */
export const handleRecordSalesTransaction: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { game_type, design_id, purchase_cost_sc, win_amount_sc = 0 } = req.body as SalesTransactionRequest;

  if (!playerId || !game_type || purchase_cost_sc <= 0) {
    return res.status(400).json({ success: false, error: 'Missing or invalid required fields' });
  }

  try {
    // Check betting limits
    const limitsResult = await db.query(
      `SELECT * FROM betting_limits_config WHERE game_type = $1`,
      [game_type]
    );

    if (limitsResult.rows.length > 0) {
      const limits = limitsResult.rows[0];
      
      if (purchase_cost_sc < limits.min_bet_sc || purchase_cost_sc > limits.max_bet_sc) {
        return res.status(400).json({
          success: false,
          error: `Bet must be between ${limits.min_bet_sc} and ${limits.max_bet_sc} SC`,
        });
      }

      if (win_amount_sc > limits.max_win_per_spin_sc) {
        return res.status(400).json({
          success: false,
          error: `Win cannot exceed ${limits.max_win_per_spin_sc} SC per spin`,
        });
      }
    }

    const net_amount_sc = purchase_cost_sc - win_amount_sc;

    const result = await db.query(
      `INSERT INTO sales_transactions 
       (player_id, game_type, design_id, purchase_cost_sc, win_amount_sc, net_amount_sc, transaction_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')
       RETURNING *`,
      [playerId, game_type, design_id || null, purchase_cost_sc, win_amount_sc, net_amount_sc]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to record sales transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get sales summary for admin
 */
export const handleGetSalesSummary: RequestHandler = async (req, res) => {
  const { start_date, end_date, game_type } = req.query;

  try {
    let query = `
      SELECT 
        DATE(created_at) as sale_date,
        game_type,
        COUNT(*) as total_sales,
        SUM(purchase_cost_sc) as total_revenue_sc,
        SUM(win_amount_sc) as total_payouts_sc,
        SUM(net_amount_sc) as net_profit_sc,
        AVG(purchase_cost_sc) as avg_purchase_cost,
        AVG(win_amount_sc) as avg_win_amount
      FROM sales_transactions
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    if (game_type) {
      query += ` AND game_type = $${paramIndex}`;
      params.push(game_type);
      paramIndex++;
    }

    query += ` GROUP BY DATE(created_at), game_type ORDER BY sale_date DESC`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Failed to fetch sales summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get detailed sales transactions for admin
 */
export const handleGetSalesTransactions: RequestHandler = async (req, res) => {
  const { limit = '100', offset = '0', game_type, player_id } = req.query;

  try {
    let query = `SELECT * FROM sales_transactions WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (game_type) {
      query += ` AND game_type = $${paramIndex}`;
      params.push(game_type);
      paramIndex++;
    }

    if (player_id) {
      query += ` AND player_id = $${paramIndex}`;
      params.push(player_id);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit);
    params.push(offset);

    const result = await db.query(query, params);

    const totalResult = await db.query(
      `SELECT COUNT(*) FROM sales_transactions WHERE game_type = $1`,
      [game_type || '%']
    );

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(totalResult.rows[0].count),
    });
  } catch (error: any) {
    console.error('Failed to fetch sales transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get sales statistics
 */
export const handleGetSalesStats: RequestHandler = async (req, res) => {
  try {
    // Overall stats
    const overallStats = await db.query(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(purchase_cost_sc) as total_revenue_sc,
        SUM(win_amount_sc) as total_payouts_sc,
        SUM(net_amount_sc) as net_profit_sc,
        AVG(purchase_cost_sc) as avg_purchase_cost,
        MAX(win_amount_sc) as max_win,
        MIN(win_amount_sc) as min_win
      FROM sales_transactions
    `);

    // By game type
    const byGameType = await db.query(`
      SELECT 
        game_type,
        COUNT(*) as total_sales,
        SUM(purchase_cost_sc) as total_revenue_sc,
        SUM(win_amount_sc) as total_payouts_sc,
        SUM(net_amount_sc) as net_profit_sc
      FROM sales_transactions
      GROUP BY game_type
    `);

    // Daily trend (last 30 days)
    const dailyTrend = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales_count,
        SUM(purchase_cost_sc) as revenue_sc,
        SUM(win_amount_sc) as payouts_sc
      FROM sales_transactions
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Top winning players
    const topWinners = await db.query(`
      SELECT 
        p.id,
        p.username,
        p.name,
        COUNT(*) as total_plays,
        SUM(st.win_amount_sc) as total_winnings,
        SUM(st.purchase_cost_sc) as total_spent,
        SUM(st.net_amount_sc) as net_loss
      FROM sales_transactions st
      JOIN players p ON st.player_id = p.id
      WHERE st.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.username, p.name
      ORDER BY total_winnings DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: {
        overall: overallStats.rows[0],
        by_game_type: byGameType.rows,
        daily_trend: dailyTrend.rows,
        top_winners: topWinners.rows,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch sales stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
