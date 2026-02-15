import { RequestHandler } from 'express';
import { db } from '../db/connection';
import { verifyPlayer } from '../middleware/auth';

interface ShareWinRequest {
  game_id?: number;
  game_name: string;
  win_amount: number;
  platform: 'facebook' | 'twitter' | 'instagram';
  message: string;
}

/**
 * Share a win to social media
 */
export const handleShareWin: RequestHandler = async (req, res) => {
  const { game_id, game_name, win_amount, platform, message } = req.body as ShareWinRequest;
  const playerId = (req as any).playerId;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (!game_name || win_amount <= 0 || !platform || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      `INSERT INTO social_shares (player_id, game_id, game_name, win_amount, platform, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')
       RETURNING *`,
      [playerId, game_id || null, game_name, win_amount, platform, message]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to record share:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Log social share response (like, comment, etc)
 */
export const handleLogShareResponse: RequestHandler = async (req, res) => {
  const { social_share_id, response_type, respondent_id, response_data } = req.body;

  if (!social_share_id || !response_type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      `INSERT INTO social_share_responses (social_share_id, response_type, respondent_id, response_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [social_share_id, response_type, respondent_id || null, JSON.stringify(response_data || {})]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to log share response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get player's share history
 */
export const handleGetShareHistory: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM social_shares 
       WHERE player_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [playerId, limit, offset]
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) FROM social_shares WHERE player_id = $1`,
      [playerId]
    );

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(totalResult.rows[0].count),
    });
  } catch (error: any) {
    console.error('Failed to fetch share history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get share responses for a specific share
 */
export const handleGetShareResponses: RequestHandler = async (req, res) => {
  const { shareId } = req.params;

  if (!shareId) {
    return res.status(400).json({ success: false, error: 'Missing share ID' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM social_share_responses 
       WHERE social_share_id = $1
       ORDER BY created_at DESC`,
      [shareId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Failed to fetch share responses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get social share statistics (admin)
 */
export const handleGetShareStats: RequestHandler = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        platform,
        COUNT(*) as total_shares,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_shares,
        AVG(win_amount) as avg_win_amount,
        MAX(win_amount) as max_win_amount
       FROM social_shares
       GROUP BY platform`
    );

    // Get response stats
    const responseStats = await db.query(
      `SELECT 
        response_type,
        COUNT(*) as response_count
       FROM social_share_responses
       GROUP BY response_type`
    );

    res.json({
      success: true,
      data: {
        shares_by_platform: result.rows,
        responses: responseStats.rows,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch share stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
