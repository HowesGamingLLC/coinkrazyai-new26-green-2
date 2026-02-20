import { RequestHandler } from 'express';
import { query } from '../db/connection';
import * as dbQueries from '../db/queries';
import { asyncHandler } from '../middleware/error-handler';

/**
 * Get all challenges and progress for the current player
 */
export const getChallenges: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const playerId = req.user.playerId;

  // Fetch all enabled challenges and join with player progress
  const result = await query(
    `SELECT
      cd.*,
      COALESCE(pc.current_count, 0) as current_count,
      COALESCE(pc.is_completed, FALSE) as is_completed
     FROM challenge_definitions cd
     LEFT JOIN player_challenges pc ON cd.id = pc.challenge_id AND pc.player_id = $1
     WHERE cd.enabled = TRUE
     ORDER BY cd.period ASC, cd.id ASC`,
    [playerId]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

/**
 * Claim reward for a completed challenge
 */
export const claimChallengeReward: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { challengeId } = req.body;
  const playerId = req.user.playerId;

  if (!challengeId) return res.status(400).json({ error: 'Challenge ID is required' });

  // Verify challenge exists and is completed
  const result = await query(
    `SELECT pc.*, cd.reward_sc, cd.reward_gc, cd.reward_badge, cd.reward_vip_status, cd.name, cd.requirement_count
     FROM player_challenges pc
     JOIN challenge_definitions cd ON pc.challenge_id = cd.id
     WHERE pc.player_id = $1 AND pc.challenge_id = $2`,
    [playerId, challengeId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Challenge progress not found' });
  }

  const progress = result.rows[0];

  if (progress.is_completed) {
    return res.status(400).json({ error: 'Reward already claimed' });
  }

  // Double check if actually completed
  if (progress.current_count < progress.requirement_count) {
    return res.status(400).json({ error: 'Challenge is not yet completed' });
  }

  // Mark as completed
  await query(
    `UPDATE player_challenges
     SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [progress.id]
  );

  // Grant rewards using unified recordWalletTransaction
  if (parseFloat(progress.reward_sc) > 0 || parseInt(progress.reward_gc) > 0) {
    await dbQueries.recordWalletTransaction(
      playerId,
      'Challenge Reward',
      parseInt(progress.reward_gc || 0),
      parseFloat(progress.reward_sc || 0),
      `Reward for challenge: ${progress.name}`
    );
  }

  // Grant VIP status if applicable
  if (progress.reward_vip_status) {
    await query(
      `UPDATE players SET vip_status = $1 WHERE id = $2`,
      [progress.reward_vip_status, playerId]
    );
  }

  res.json({
    success: true,
    message: `Congratulations! You've claimed your reward for: ${progress.name}`,
  });
});
