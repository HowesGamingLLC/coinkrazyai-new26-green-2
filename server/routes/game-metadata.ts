import { RequestHandler } from 'express';
import { query } from '../db/connection';

// ===== GAME FEATURES =====
export const listGameFeatures: RequestHandler = async (req, res) => {
  try {
    const result = await query('SELECT * FROM game_features ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('List game features error:', error);
    res.status(500).json({ error: 'Failed to fetch game features' });
  }
};

export const createGameFeature: RequestHandler = async (req, res) => {
  try {
    const { name, description, icon_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Feature name is required' });
    }

    const result = await query(
      `INSERT INTO game_features (name, description, icon_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description || null, icon_url || null]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Create game feature error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Feature with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create game feature' });
  }
};

// ===== GAME FEATURE MAPPINGS =====
export const addFeatureToGame: RequestHandler = async (req, res) => {
  try {
    const { gameId, featureId } = req.body;

    if (!gameId || !featureId) {
      return res.status(400).json({ error: 'Game ID and Feature ID are required' });
    }

    // Check if game exists
    const gameCheck = await query('SELECT id FROM games WHERE id = $1', [gameId]);
    if (gameCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if feature exists
    const featureCheck = await query('SELECT id FROM game_features WHERE id = $1', [featureId]);
    if (featureCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const result = await query(
      `INSERT INTO game_feature_mappings (game_id, feature_id)
       VALUES ($1, $2)
       ON CONFLICT (game_id, feature_id) DO UPDATE SET created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [gameId, featureId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Add feature to game error:', error);
    res.status(500).json({ error: 'Failed to add feature to game' });
  }
};

export const removeFeatureFromGame: RequestHandler = async (req, res) => {
  try {
    const { gameId, featureId } = req.params;

    const result = await query(
      'DELETE FROM game_feature_mappings WHERE game_id = $1 AND feature_id = $2 RETURNING id',
      [gameId, featureId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feature mapping not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Remove feature from game error:', error);
    res.status(500).json({ error: 'Failed to remove feature from game' });
  }
};

export const getGameFeatures: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await query(
      `SELECT gf.* FROM game_features gf
       JOIN game_feature_mappings gfm ON gf.id = gfm.feature_id
       WHERE gfm.game_id = $1
       ORDER BY gf.name`,
      [gameId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get game features error:', error);
    res.status(500).json({ error: 'Failed to fetch game features' });
  }
};

// ===== GAME THEMES =====
export const listGameThemes: RequestHandler = async (req, res) => {
  try {
    const result = await query('SELECT * FROM game_themes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('List game themes error:', error);
    res.status(500).json({ error: 'Failed to fetch game themes' });
  }
};

export const createGameTheme: RequestHandler = async (req, res) => {
  try {
    const { name, description, icon_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    const result = await query(
      `INSERT INTO game_themes (name, description, icon_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description || null, icon_url || null]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Create game theme error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Theme with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create game theme' });
  }
};

export const addThemeToGame: RequestHandler = async (req, res) => {
  try {
    const { gameId, themeId } = req.body;

    if (!gameId || !themeId) {
      return res.status(400).json({ error: 'Game ID and Theme ID are required' });
    }

    // Check if game exists
    const gameCheck = await query('SELECT id FROM games WHERE id = $1', [gameId]);
    if (gameCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if theme exists
    const themeCheck = await query('SELECT id FROM game_themes WHERE id = $1', [themeId]);
    if (themeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const result = await query(
      `INSERT INTO game_theme_mappings (game_id, theme_id)
       VALUES ($1, $2)
       ON CONFLICT (game_id, theme_id) DO UPDATE SET created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [gameId, themeId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Add theme to game error:', error);
    res.status(500).json({ error: 'Failed to add theme to game' });
  }
};

export const getGameThemes: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await query(
      `SELECT gt.* FROM game_themes gt
       JOIN game_theme_mappings gtm ON gt.id = gtm.theme_id
       WHERE gtm.game_id = $1
       ORDER BY gt.name`,
      [gameId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get game themes error:', error);
    res.status(500).json({ error: 'Failed to fetch game themes' });
  }
};

// ===== GAME RATINGS =====
export const rateGame: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { rating, comment } = req.body;
    const playerId = req.user?.id;

    if (!playerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if game exists
    const gameCheck = await query('SELECT id FROM games WHERE id = $1', [gameId]);
    if (gameCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Insert or update rating
    const result = await query(
      `INSERT INTO game_ratings (game_id, player_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (game_id, player_id) DO UPDATE SET rating = $3, comment = $4
       RETURNING *`,
      [gameId, playerId, rating, comment || null]
    );

    // Update average rating in games table
    const avgResult = await query(
      `SELECT AVG(rating::DECIMAL) as avg_rating, COUNT(*) as total_ratings
       FROM game_ratings
       WHERE game_id = $1`,
      [gameId]
    );

    const avgRating = parseFloat(avgResult.rows[0]?.avg_rating || 0);
    const totalRatings = parseInt(avgResult.rows[0]?.total_ratings || 0);

    await query(
      'UPDATE games SET game_rating = $1, total_ratings = $2 WHERE id = $3',
      [Math.round(avgRating * 100) / 100, totalRatings, gameId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      game_stats: { avg_rating: avgRating, total_ratings: totalRatings }
    });
  } catch (error) {
    console.error('Rate game error:', error);
    res.status(500).json({ error: 'Failed to rate game' });
  }
};

export const getGameRatings: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(
      `SELECT gr.*, p.username FROM game_ratings gr
       LEFT JOIN players p ON gr.player_id = p.id
       WHERE gr.game_id = $1
       ORDER BY gr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [gameId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM game_ratings WHERE game_id = $1',
      [gameId]
    );

    res.json({
      ratings: result.rows,
      total: parseInt(countResult.rows[0]?.total || 0),
      limit: parseInt(String(limit)),
      offset: parseInt(String(offset)),
    });
  } catch (error) {
    console.error('Get game ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch game ratings' });
  }
};

// ===== GAME STATISTICS =====
export const getGameStatistics: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await query(
      'SELECT * FROM game_statistics WHERE game_id = $1',
      [gameId]
    );

    if (result.rows.length === 0) {
      // Return default statistics if not found
      return res.json({
        game_id: gameId,
        total_plays: 0,
        total_wagered: 0,
        total_winnings: 0,
        average_win: 0,
        updated_at: new Date().toISOString(),
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get game statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch game statistics' });
  }
};

// ===== GET FULL GAME METADATA =====
export const getGameMetadata: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Get game info
    const gameResult = await query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = gameResult.rows[0];

    // Get features
    const featuresResult = await query(
      `SELECT gf.* FROM game_features gf
       JOIN game_feature_mappings gfm ON gf.id = gfm.feature_id
       WHERE gfm.game_id = $1`,
      [gameId]
    );

    // Get themes
    const themesResult = await query(
      `SELECT gt.* FROM game_themes gt
       JOIN game_theme_mappings gtm ON gt.id = gtm.theme_id
       WHERE gtm.game_id = $1`,
      [gameId]
    );

    // Get statistics
    const statsResult = await query(
      'SELECT * FROM game_statistics WHERE game_id = $1',
      [gameId]
    );

    // Get game config data (if any additional metadata stored there)
    const configResult = await query(
      'SELECT config_key, config_value FROM game_config WHERE game_id = $1',
      [gameId]
    );

    const configData: Record<string, any> = {};
    configResult.rows.forEach(row => {
      try {
        configData[row.config_key] = JSON.parse(row.config_value);
      } catch {
        configData[row.config_key] = row.config_value;
      }
    });

    res.json({
      ...game,
      features: featuresResult.rows,
      themes: themesResult.rows,
      statistics: statsResult.rows[0] || null,
      config: configData,
    });
  } catch (error) {
    console.error('Get game metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch game metadata' });
  }
};

// ===== UPDATE GAME METADATA =====
export const updateGameMetadata: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Allowed fields to update
    const allowedFields = [
      'max_paylines',
      'theme',
      'release_date',
      'provider_game_id',
      'game_rating',
      'total_ratings',
      'download_count',
      'is_featured',
      'is_new',
      'min_bet',
      'max_bet',
    ];

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(gameId);

    const sql = `UPDATE games SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(sql, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update game metadata error:', error);
    res.status(500).json({ error: 'Failed to update game metadata' });
  }
};
