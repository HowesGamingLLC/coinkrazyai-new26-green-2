import { RequestHandler } from "express";
import * as db from "../db/queries";

// Get all enabled games
export const handleGetGames: RequestHandler = async (req, res) => {
  try {
    const result = await db.getGames();
    
    // Filter to only enabled games
    const enabledGames = result.rows.filter(game => game.enabled !== false);

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
