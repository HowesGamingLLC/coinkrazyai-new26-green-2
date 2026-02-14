import { RequestHandler } from "express";
import * as dbQueries from "../db/queries";
import { query } from "../db/connection";

// Get all achievements
export const handleGetAchievements: RequestHandler = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM achievements WHERE enabled = true ORDER BY id'
    );

    const achievements = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon_url: row.icon_url,
      badge_name: row.badge_name,
      requirement_type: row.requirement_type,
      requirement_value: row.requirement_value
    }));

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('[Achievements] Get all error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievements'
    });
  }
};

// Get player's earned achievements
export const handleGetPlayerAchievements: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await dbQueries.getPlayerAchievements(req.user.playerId);

    const achievements = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon_url: row.icon_url,
      badge_name: row.badge_name,
      earned_at: row.earned_at
    }));

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('[Achievements] Get player achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievements'
    });
  }
};

// Award achievement to player (internal/admin endpoint)
export const handleAwardAchievement: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { player_id, achievement_id } = req.body;

    if (!player_id || !achievement_id) {
      return res.status(400).json({
        success: false,
        error: 'Player ID and achievement ID required'
      });
    }

    // Check if achievement exists
    const achievementResult = await query(
      'SELECT * FROM achievements WHERE id = $1',
      [achievement_id]
    );

    if (achievementResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    // Award achievement
    const result = await dbQueries.awardAchievement(player_id, achievement_id);

    if (result.rows.length === 0) {
      // Already awarded
      return res.json({
        success: true,
        message: 'Achievement already awarded'
      });
    }

    res.json({
      success: true,
      message: 'Achievement awarded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Achievements] Award error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award achievement'
    });
  }
};

// Check and award achievements for player (can be called after game events)
export const handleCheckAchievements: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get player stats
    const playerResult = await dbQueries.getPlayerById(req.user.playerId);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const player = playerResult.rows[0];

    // Get all achievements
    const achievementsResult = await query(
      'SELECT * FROM achievements WHERE enabled = true'
    );

    const earnedAchievements = [];
    const achievements = achievementsResult.rows;

    // Check each achievement criteria
    for (const achievement of achievements) {
      let shouldEarn = false;

      switch (achievement.requirement_type) {
        case 'balance':
          shouldEarn = player.gc_balance >= achievement.requirement_value;
          break;
        case 'games_played':
          // Would need to query stats table
          shouldEarn = false;
          break;
        case 'wins':
          // Would need to query game results
          shouldEarn = false;
          break;
      }

      if (shouldEarn) {
        const result = await dbQueries.awardAchievement(req.user.playerId, achievement.id);
        if (result.rows.length > 0) {
          earnedAchievements.push(achievement);
        }
      }
    }

    res.json({
      success: true,
      data: {
        newly_earned: earnedAchievements,
        count: earnedAchievements.length
      }
    });
  } catch (error) {
    console.error('[Achievements] Check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check achievements'
    });
  }
};

// Get achievement statistics
export const handleGetAchievementStats: RequestHandler = async (req, res) => {
  try {
    const totalResult = await query(
      'SELECT COUNT(*) as total FROM achievements WHERE enabled = true'
    );

    const platformResult = await query(
      'SELECT achievement_id, COUNT(*) as earned_by FROM player_achievements GROUP BY achievement_id'
    );

    const stats = {
      total_achievements: totalResult.rows[0]?.total || 0,
      most_earned: platformResult.rows.sort((a, b) => b.earned_by - a.earned_by).slice(0, 5)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[Achievements] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievement statistics'
    });
  }
};
