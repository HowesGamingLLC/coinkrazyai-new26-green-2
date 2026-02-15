import { RequestHandler } from 'express';
import { db } from '../db/connection';
import { verifyPlayer } from '../middleware/auth';

interface DailyBonusConfig {
  amounts_sc: number[];
  amounts_gc: number[];
  max_streak: number;
  reset_hour: number;
}

const BONUS_CONFIG: DailyBonusConfig = {
  amounts_sc: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0], // 7 days
  amounts_gc: [100, 200, 300, 400, 500, 600, 1000],
  max_streak: 7,
  reset_hour: 0, // Midnight UTC
};

/**
 * Check if player can claim daily login bonus
 */
export const handleCheckDailyBonus: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // Get or create onboarding progress
    let result = await db.query(
      `SELECT * FROM kyc_onboarding_progress WHERE player_id = $1`,
      [playerId]
    );

    if (result.rows.length === 0) {
      await db.query(
        `INSERT INTO kyc_onboarding_progress (player_id) VALUES ($1)`,
        [playerId]
      );
    }

    // Check for existing claim today
    const today = new Date().toISOString().split('T')[0];
    const claimResult = await db.query(
      `SELECT * FROM daily_login_bonuses 
       WHERE player_id = $1 
       AND DATE(claimed_at) = $2 
       AND status = 'claimed'`,
      [playerId, today]
    );

    if (claimResult.rows.length > 0) {
      return res.json({
        success: true,
        can_claim: false,
        message: 'Already claimed today',
        next_available: claimResult.rows[0].next_available_at,
      });
    }

    // Get player's streak
    const streakResult = await db.query(
      `SELECT streak_count, bonus_day FROM daily_login_bonuses 
       WHERE player_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [playerId]
    );

    let currentDay = 1;
    let currentStreak = 1;

    if (streakResult.rows.length > 0) {
      const lastBonus = streakResult.rows[0];
      const lastClaimDate = new Date(lastBonus.created_at);
      const today = new Date();
      
      // Check if it's been more than 24 hours
      const hoursDiff = (today.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        currentDay = Math.min(lastBonus.bonus_day + 1, BONUS_CONFIG.max_streak);
        currentStreak = lastBonus.streak_count + 1;
      } else {
        currentDay = lastBonus.bonus_day;
        currentStreak = lastBonus.streak_count;
      }
    }

    const bonusIndex = (currentDay - 1) % BONUS_CONFIG.amounts_sc.length;
    const amount_sc = BONUS_CONFIG.amounts_sc[bonusIndex];
    const amount_gc = BONUS_CONFIG.amounts_gc[bonusIndex];

    res.json({
      success: true,
      can_claim: true,
      bonus: {
        day: currentDay,
        amount_sc,
        amount_gc,
        streak: currentStreak,
      },
    });
  } catch (error: any) {
    console.error('Failed to check daily bonus:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Claim daily login bonus
 */
export const handleClaimDailyBonus: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // Check if already claimed today
    const today = new Date().toISOString().split('T')[0];
    const existingClaim = await db.query(
      `SELECT * FROM daily_login_bonuses 
       WHERE player_id = $1 
       AND DATE(claimed_at) = $2 
       AND status = 'claimed'`,
      [playerId, today]
    );

    if (existingClaim.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already claimed today',
      });
    }

    // Get player's streak
    const streakResult = await db.query(
      `SELECT streak_count, bonus_day FROM daily_login_bonuses 
       WHERE player_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [playerId]
    );

    let currentDay = 1;
    let currentStreak = 1;
    let lastBonusDate: Date | null = null;

    if (streakResult.rows.length > 0) {
      const lastBonus = streakResult.rows[0];
      lastBonusDate = new Date(lastBonus.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastBonusDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        currentDay = Math.min(lastBonus.bonus_day + 1, BONUS_CONFIG.max_streak);
        currentStreak = lastBonus.streak_count + 1;
      } else {
        currentDay = lastBonus.bonus_day;
        currentStreak = lastBonus.streak_count;
      }
    }

    const bonusIndex = (currentDay - 1) % BONUS_CONFIG.amounts_sc.length;
    const amount_sc = BONUS_CONFIG.amounts_sc[bonusIndex];
    const amount_gc = BONUS_CONFIG.amounts_gc[bonusIndex];
    const nextAvailableAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Insert bonus claim record
    const bonusResult = await db.query(
      `INSERT INTO daily_login_bonuses 
       (player_id, bonus_day, amount_sc, amount_gc, claimed_at, next_available_at, streak_count, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, 'claimed')
       RETURNING *`,
      [playerId, currentDay, amount_sc, amount_gc, nextAvailableAt, currentStreak]
    );

    // Update player wallet
    await db.query(
      `UPDATE players 
       SET sc_balance = sc_balance + $1, gc_balance = gc_balance + $2, updated_at = NOW()
       WHERE id = $3`,
      [amount_sc, amount_gc, playerId]
    );

    // Record transaction
    await db.query(
      `INSERT INTO wallet_transactions (player_id, type, amount, description)
       VALUES ($1, 'Bonus', $2, $3)`,
      [playerId, amount_sc, `Daily Login Bonus - Day ${currentDay}`]
    );

    res.json({
      success: true,
      data: {
        bonus_claimed: bonusResult.rows[0],
        new_wallet: {
          sc_balance: (await db.query('SELECT sc_balance FROM players WHERE id = $1', [playerId])).rows[0].sc_balance,
          gc_balance: (await db.query('SELECT gc_balance FROM players WHERE id = $1', [playerId])).rows[0].gc_balance,
        },
      },
    });
  } catch (error: any) {
    console.error('Failed to claim daily bonus:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get player's bonus history
 */
export const handleGetBonusHistory: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const limit = parseInt(req.query.limit as string) || 30;
  const offset = parseInt(req.query.offset as string) || 0;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM daily_login_bonuses 
       WHERE player_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [playerId, limit, offset]
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) FROM daily_login_bonuses WHERE player_id = $1`,
      [playerId]
    );

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(totalResult.rows[0].count),
    });
  } catch (error: any) {
    console.error('Failed to fetch bonus history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Send bonus reminder email/notification
 */
export const handleSendBonusReminder: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const playerResult = await db.query(
      `SELECT email, username FROM players WHERE id = $1`,
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // TODO: Integrate with email service (SendGrid, Mailgun, etc)
    // For now, just log it
    console.log(`Bonus reminder would be sent to ${player.email}`);

    // Create notification record
    await db.query(
      `INSERT INTO user_messages (sender_id, recipient_id, message_type, subject, message)
       VALUES (NULL, $1, 'notification', 'Daily Bonus Reminder', $2)`,
      [playerId, 'Your daily login bonus is waiting! Come back to claim it.']
    );

    res.json({
      success: true,
      message: 'Reminder sent',
    });
  } catch (error: any) {
    console.error('Failed to send reminder:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
