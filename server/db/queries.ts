import { query } from './connection';

// ===== PLAYERS =====
export const getPlayers = async (limit = 20, offset = 0) => {
  return query(
    `SELECT id, name, email, gc_balance, sc_balance, status, kyc_level, 
            kyc_verified, join_date, last_login 
     FROM players 
     ORDER BY join_date DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
};

export const getPlayerById = async (id: number) => {
  return query(
    `SELECT * FROM players WHERE id = $1`,
    [id]
  );
};

export const updatePlayerBalance = async (playerId: number, gc: number, sc: number) => {
  return query(
    `UPDATE players SET gc_balance = $1, sc_balance = $2, updated_at = NOW() 
     WHERE id = $3 RETURNING *`,
    [gc, sc, playerId]
  );
};

export const updatePlayerStatus = async (playerId: number, status: string) => {
  return query(
    `UPDATE players SET status = $1, updated_at = NOW() 
     WHERE id = $2 RETURNING *`,
    [status, playerId]
  );
};

export const getPlayerStats = async () => {
  return query(
    `SELECT 
      COUNT(*) as total_players,
      SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_players,
      SUM(CASE WHEN kyc_verified = true THEN 1 ELSE 0 END) as verified_players,
      AVG(gc_balance) as avg_gc_balance,
      AVG(sc_balance) as avg_sc_balance
     FROM players`
  );
};

// ===== GAMES =====
export const getGames = async () => {
  return query(
    `SELECT * FROM games ORDER BY name ASC`
  );
};

export const getGameById = async (id: number) => {
  return query(
    `SELECT * FROM games WHERE id = $1`,
    [id]
  );
};

export const updateGameRTP = async (gameId: number, rtp: number) => {
  return query(
    `UPDATE games SET rtp = $1, last_updated = NOW() 
     WHERE id = $2 RETURNING *`,
    [rtp, gameId]
  );
};

export const toggleGameStatus = async (gameId: number, enabled: boolean) => {
  return query(
    `UPDATE games SET enabled = $1, last_updated = NOW() 
     WHERE id = $2 RETURNING *`,
    [enabled, gameId]
  );
};

// ===== BONUSES =====
export const getBonuses = async () => {
  return query(
    `SELECT * FROM bonuses WHERE status = 'Active' ORDER BY name ASC`
  );
};

export const createBonus = async (bonusData: any) => {
  const { name, type, amount, percentage, min_deposit, max_claims, start_date, end_date } = bonusData;
  return query(
    `INSERT INTO bonuses (name, type, amount, percentage, min_deposit, max_claims, start_date, end_date, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active') 
     RETURNING *`,
    [name, type, amount, percentage, min_deposit, max_claims, start_date, end_date]
  );
};

// ===== TRANSACTIONS =====
export const getTransactions = async (limit = 50) => {
  return query(
    `SELECT t.*, p.name as player_name 
     FROM transactions t 
     JOIN players p ON t.player_id = p.id 
     ORDER BY t.created_at DESC 
     LIMIT $1`,
    [limit]
  );
};

export const createTransaction = async (playerId: number, type: string, amount: number, currency: string) => {
  return query(
    `INSERT INTO transactions (player_id, type, amount, currency, status) 
     VALUES ($1, $2, $3, $4, 'Completed') 
     RETURNING *`,
    [playerId, type, amount, currency]
  );
};

// ===== POKER =====
export const getPokerTables = async () => {
  return query(
    `SELECT * FROM poker_tables ORDER BY name ASC`
  );
};

export const updatePokerTablePlayers = async (tableId: number, players: number) => {
  return query(
    `UPDATE poker_tables SET current_players = $1 WHERE id = $2 RETURNING *`,
    [players, tableId]
  );
};

// ===== BINGO =====
export const getBingoGames = async () => {
  return query(
    `SELECT * FROM bingo_games ORDER BY created_at DESC`
  );
};

export const updateBingoGameStatus = async (gameId: number, status: string) => {
  return query(
    `UPDATE bingo_games SET status = $1 WHERE id = $2 RETURNING *`,
    [status, gameId]
  );
};

// ===== SPORTS =====
export const getSportsEvents = async () => {
  return query(
    `SELECT * FROM sports_events ORDER BY event_date DESC`
  );
};

export const lockSportsEvent = async (eventId: number, locked: boolean) => {
  return query(
    `UPDATE sports_events SET locked = $1 WHERE id = $2 RETURNING *`,
    [locked, eventId]
  );
};

// ===== SECURITY ALERTS =====
export const getSecurityAlerts = async (limit = 20) => {
  return query(
    `SELECT * FROM security_alerts 
     ORDER BY timestamp DESC 
     LIMIT $1`,
    [limit]
  );
};

export const createSecurityAlert = async (alertType: string, severity: string, title: string, description: string) => {
  return query(
    `INSERT INTO security_alerts (alert_type, severity, title, description) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [alertType, severity, title, description]
  );
};

// ===== KYC =====
export const getKYCDocuments = async (playerId: number) => {
  return query(
    `SELECT * FROM kyc_documents WHERE player_id = $1 ORDER BY created_at DESC`,
    [playerId]
  );
};

export const updateKYCStatus = async (playerId: number, level: string, verified: boolean) => {
  return query(
    `UPDATE players 
     SET kyc_level = $1, kyc_verified = $2, kyc_verified_date = NOW(), updated_at = NOW() 
     WHERE id = $3 
     RETURNING *`,
    [level, verified, playerId]
  );
};

// ===== ADMIN STATS =====
export const getAdminStats = async () => {
  const playerStats = await getPlayerStats();
  const gameStats = await query(`SELECT COUNT(*) as total FROM games`);
  const bonusStats = await query(`SELECT COUNT(*) as total FROM bonuses WHERE status = 'Active'`);
  const transactionStats = await query(
    `SELECT COUNT(*) as total, SUM(amount) as volume FROM transactions WHERE DATE(created_at) = CURRENT_DATE`
  );

  return {
    players: playerStats.rows[0],
    games: gameStats.rows[0],
    bonuses: bonusStats.rows[0],
    transactions: transactionStats.rows[0],
  };
};
