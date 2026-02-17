import { RequestHandler } from "express";
import * as db from "../db/queries";

// DEBUG: Get ALL games in DB
export const handleDebugGetGames: RequestHandler = async (req, res) => {
  try {
    const result = await db.getGames();
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

// Get all enabled games
export const handleGetGames: RequestHandler = async (req, res) => {
  try {
    const result = await db.getGames();
    const allGamesFromDb = result.rows;
    console.log(`[Games] DB has ${allGamesFromDb.length} total games:`, allGamesFromDb.map(g => ({ name: g.name, category: g.category, enabled: g.enabled })));

    // Filter to only enabled games and ensure they have a 'type' field for the frontend
    const enabledGames = result.rows
      .filter(game => game.enabled !== false)
      .map(game => {
        const type = game.type || (game.category ? game.category.toLowerCase() : 'other');
        return {
          ...game,
          type: type
        };
      });

    console.log(`[Games] Returning ${enabledGames.length} enabled games. Games:`, enabledGames.map(g => ({ name: g.name, type: g.type, enabled: g.enabled })));

    res.json({
      success: true,
      data: enabledGames,
      count: enabledGames.length
    });
  } catch (error) {
    console.error("[Games] Error fetching games:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch games"
    });
  }
};

// Get single game by ID
export const handleGetGameById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const gameId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);

    const result = await db.getGameById(gameId);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Game not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("[Games] Error fetching game:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch game"
    });
  }
};
