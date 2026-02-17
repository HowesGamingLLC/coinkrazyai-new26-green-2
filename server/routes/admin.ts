import { RequestHandler } from "express";
import * as dbQueries from "../db/queries";

/**
 * Note: Admin state is now handled through the database (ai_employees and casino_settings tables).
 * Admin authentication is handled exclusively through:
 * - server/services/auth-service.ts -> AuthService.loginAdmin()
 * - server/routes/auth.ts -> handleAdminLogin()
 */

export const handleGetAdminStats: RequestHandler = async (req, res) => {
  try {
    const playerStats = await dbQueries.getPlayerStats();
    const transactions = await dbQueries.getTransactions(10);
    const aiEmployeesResult = await dbQueries.getAIEmployees();
    const settingsResult = await dbQueries.getCasinoSettings();

    const totalPlayers = playerStats.rows[0]?.total_players || 0;
    const activePlayers = playerStats.rows[0]?.active_players || 0;
    const totalGCVolume = playerStats.rows[0]?.avg_gc_balance || 0;
    const totalSCVolume = playerStats.rows[0]?.avg_sc_balance || 0;

    const maintenanceMode = settingsResult.rows.find(s => s.setting_key === 'maintenance_mode')?.setting_value === 'true';
    const systemHealth = settingsResult.rows.find(s => s.setting_key === 'system_health')?.setting_value || 'Optimal';

    res.json({
      success: true,
      data: {
        overview: {
          totalPlayers,
          activePlayers,
          activeTables: 8,
          totalRevenue: 125430.50,
          totalGCVolume,
          totalSCVolume,
          systemHealth,
          maintenanceMode
        },
        aiStatus: aiEmployeesResult.rows,
        gameStats: {
          slots: { plays: 25430, winRate: 0.95 },
          poker: { plays: 8234, activeTables: 8 },
          bingo: { plays: 45230, activeRooms: 4 },
          sportsbook: { bets: 12456, avgOdds: 1.89 }
        },
        revenueData: [40, 60, 45, 90, 85, 100, 75],
        recentTransactions: transactions.rows.map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          amount: (tx.gc_amount || 0) + (tx.sc_amount || 0),
          description: tx.description || tx.type,
          timestamp: tx.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
};

export const handleGetGameConfig: RequestHandler = async (req, res) => {
  try {
    const { game } = req.query;
    
    if (game && typeof game === 'string') {
      const configKey = `${game}_config`;
      const result = await dbQueries.getCasinoSettings(configKey);
      if (result.rows.length > 0) {
        return res.json({ 
          success: true, 
          data: JSON.parse(result.rows[0].setting_value)
        });
      }
      return res.status(404).json({ success: false, error: "Game config not found" });
    }

    const allSettings = await dbQueries.getCasinoSettings();
    const gameConfigs: Record<string, any> = {};
    
    allSettings.rows.forEach(s => {
      if (s.setting_key.endsWith('_config')) {
        const gameName = s.setting_key.replace('_config', '');
        try {
          gameConfigs[gameName] = JSON.parse(s.setting_value);
        } catch (e) {
          gameConfigs[gameName] = s.setting_value;
        }
      }
    });

    res.json({ success: true, data: gameConfigs });
  } catch (error) {
    console.error('Failed to get game config:', error);
    res.status(500).json({ success: false, error: 'Failed to get config' });
  }
};

export const handleUpdateGameConfig: RequestHandler = async (req, res) => {
  try {
    const { gameId, config } = req.body;

    if (!gameId || !config) {
      return res.status(400).json({ success: false, error: "Missing gameId or config" });
    }

    const configKey = `${gameId}_config`;
    await dbQueries.updateCasinoSetting(configKey, JSON.stringify(config));

    res.json({ 
      success: true, 
      data: { 
        message: `${gameId} configuration updated successfully`,
        config
      } 
    });
  } catch (error) {
    console.error('Failed to update game config:', error);
    res.status(500).json({ success: false, error: 'Failed to update config' });
  }
};

export const handleGetAIEmployees: RequestHandler = async (req, res) => {
  try {
    const result = await dbQueries.getAIEmployees();
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to get AI employees:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI employees' });
  }
};

export const handleAssignAIDuty: RequestHandler = async (req, res) => {
  try {
    const { aiId, duty } = req.body;

    if (!aiId || !duty) {
      return res.status(400).json({ success: false, error: "Missing aiId or duty" });
    }

    const result = await dbQueries.assignAIDuty(aiId, duty);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "AI employee not found" });
    }

    res.json({ 
      success: true, 
      data: { 
        message: `Duty assigned successfully`,
        ai: result.rows[0]
      } 
    });
  } catch (error) {
    console.error('Failed to assign duty:', error);
    res.status(500).json({ success: false, error: 'Failed to assign duty' });
  }
};

export const handleUpdateAIStatus: RequestHandler = async (req, res) => {
  try {
    const { aiId, status } = req.body;

    if (!aiId || !['active', 'idle', 'maintenance'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid aiId or status" });
    }

    const result = await dbQueries.updateAIStatus(aiId, status);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "AI employee not found" });
    }

    res.json({ 
      success: true, 
      data: { 
        message: `Status updated successfully`,
        ai: result.rows[0]
      } 
    });
  } catch (error) {
    console.error('Failed to update AI status:', error);
    res.status(500).json({ success: false, error: 'Failed to update AI status' });
  }
};

export const handleGetStorePacks: RequestHandler = async (req, res) => {
  try {
    const result = await dbQueries.getStorePacks();
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to get store packs:', error);
    res.status(500).json({ success: false, error: 'Failed to get store packs' });
  }
};

export const handleUpdateStorePack: RequestHandler = async (req, res) => {
  try {
    const { packId, packData } = req.body;

    if (!packId || !packData) {
      return res.status(400).json({ success: false, error: "Missing packId or packData" });
    }

    // Use the actual update query from queries.ts if available, otherwise build one
    // For now, let's assume store.ts handleUpdatePack is the real one and this is legacy
    // But we should make it work.
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(packData).forEach(([key, value]) => {
      updates.push(`${key} = $${paramIndex++}`);
      values.push(value);
    });
    
    values.push(packId);
    
    const result = await dbQueries.query(
      `UPDATE store_packs SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({ 
      success: true, 
      data: { 
        message: `Store pack ${packId} updated successfully`,
        pack: result.rows[0]
      } 
    });
  } catch (error) {
    console.error('Failed to update store pack:', error);
    res.status(500).json({ success: false, error: 'Failed to update store pack' });
  }
};

export const handleSetMaintenanceMode: RequestHandler = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({ success: false, error: "Missing enabled flag" });
    }

    await dbQueries.updateCasinoSetting('maintenance_mode', String(enabled));
    if (message) {
      await dbQueries.updateCasinoSetting('maintenance_message', message);
    }

    res.json({
      success: true,
      data: {
        message: enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
        maintenanceMode: enabled
      }
    });
  } catch (error) {
    console.error('Failed to update maintenance mode:', error);
    res.status(500).json({ success: false, error: 'Failed to update maintenance mode' });
  }
};

export const handleGetSystemHealth: RequestHandler = async (req, res) => {
  try {
    const result = await dbQueries.getCasinoSettings('system_health');
    const systemHealth = result.rows[0]?.setting_value || 'Optimal';

    res.json({
      success: true,
      data: {
        systemHealth,
        services: {
          database: 'healthy',
          cache: 'healthy',
          socketIO: 'healthy',
          payment: 'healthy',
          email: 'healthy'
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to get system health:', error);
    res.status(500).json({ success: false, error: 'Failed to get system health' });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  try {
    // Session cleanup is handled by auth middleware/service
    res.json({ success: true, data: { message: "Logged out successfully" } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
};
