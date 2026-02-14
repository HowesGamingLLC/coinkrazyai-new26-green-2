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

// ===== PLAYER AUTH =====
export const getPlayerByUsername = async (username: string) => {
  return query(
    `SELECT * FROM players WHERE username = $1`,
    [username]
  );
};

export const getPlayerByEmail = async (email: string) => {
  return query(
    `SELECT * FROM players WHERE email = $1`,
    [email]
  );
};

export const createPlayer = async (username: string, name: string, email: string, passwordHash: string) => {
  return query(
    `INSERT INTO players (username, name, email, password_hash, gc_balance, sc_balance, status)
     VALUES ($1, $2, $3, $4, 10000, 5, 'Active')
     RETURNING id, username, name, email, gc_balance, sc_balance, status, created_at`,
    [username, name, email, passwordHash]
  );
};

export const createPlayerSession = async (playerId: number, token: string, expiresAt: Date) => {
  return query(
    `INSERT INTO player_sessions (player_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [playerId, token, expiresAt]
  );
};

export const getPlayerSession = async (token: string) => {
  return query(
    `SELECT ps.*, p.* FROM player_sessions ps
     JOIN players p ON ps.player_id = p.id
     WHERE ps.token = $1 AND ps.expires_at > NOW()`,
    [token]
  );
};

export const updatePlayerLastLogin = async (playerId: number) => {
  return query(
    `UPDATE players SET last_login = NOW() WHERE id = $1 RETURNING *`,
    [playerId]
  );
};

// ===== GAME RESULTS =====
export const recordSlotsResult = async (playerId: number, gameId: number, betAmount: number, winnings: number, symbols: string) => {
  return query(
    `INSERT INTO slots_results (player_id, game_id, bet_amount, winnings, symbols)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [playerId, gameId, betAmount, winnings, symbols]
  );
};

export const recordPokerResult = async (playerId: number, tableId: number, buyIn: number, cashOut: number, handsPlayed: number, duration: number) => {
  return query(
    `INSERT INTO poker_results (player_id, table_id, buy_in, cash_out, hands_played, duration_minutes, profit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [playerId, tableId, buyIn, cashOut, handsPlayed, duration, cashOut - buyIn]
  );
};

export const recordBingoResult = async (playerId: number, gameId: number, ticketPrice: number, winnings: number, pattern: string) => {
  return query(
    `INSERT INTO bingo_results (player_id, game_id, ticket_price, winnings, pattern_matched)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [playerId, gameId, ticketPrice, winnings, pattern]
  );
};

// ===== STORE & PURCHASES =====
export const getStorePacks = async () => {
  return query(
    `SELECT * FROM store_packs WHERE enabled = true ORDER BY position ASC`
  );
};

export const recordPurchase = async (playerId: number, packId: number, amountUsd: number, goldCoins: number, sweepsCoins: number, paymentId: string) => {
  return query(
    `INSERT INTO purchases (player_id, pack_id, amount_usd, gold_coins, sweeps_coins, payment_method, payment_id, status)
     VALUES ($1, $2, $3, $4, $5, 'stripe', $6, 'Completed')
     RETURNING *`,
    [playerId, packId, amountUsd, goldCoins, sweepsCoins, paymentId]
  );
};

export const getPurchaseHistory = async (playerId: number, limit = 20) => {
  return query(
    `SELECT p.*, sp.title as pack_title
     FROM purchases p
     LEFT JOIN store_packs sp ON p.pack_id = sp.id
     WHERE p.player_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [playerId, limit]
  );
};

// ===== WALLET LEDGER =====
export const recordWalletTransaction = async (playerId: number, type: string, gcAmount: number, scAmount: number, description: string) => {
  // Get current balance first
  const playerResult = await query(`SELECT gc_balance, sc_balance FROM players WHERE id = $1`, [playerId]);

  if (playerResult.rows.length === 0) throw new Error('Player not found');

  const currentGc = parseFloat(playerResult.rows[0].gc_balance);
  const currentSc = parseFloat(playerResult.rows[0].sc_balance);

  const newGc = currentGc + gcAmount;
  const newSc = currentSc + scAmount;

  // Update player balance
  await query(
    `UPDATE players SET gc_balance = $1, sc_balance = $2 WHERE id = $3`,
    [newGc, newSc, playerId]
  );

  // Record in ledger
  return query(
    `INSERT INTO wallet_ledger (player_id, transaction_type, gc_amount, sc_amount, gc_balance_after, sc_balance_after, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [playerId, type, gcAmount, scAmount, newGc, newSc, description]
  );
};

export const getWalletHistory = async (playerId: number, limit = 50) => {
  return query(
    `SELECT * FROM wallet_ledger
     WHERE player_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [playerId, limit]
  );
};

// ===== SPORTS BETTING =====
export const recordSportsBet = async (playerId: number, eventId: number, betType: string, amount: number, odds: number, potentialWinnings: number) => {
  return query(
    `INSERT INTO sports_bets (player_id, event_id, bet_type, amount, odds, potential_winnings, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
     RETURNING *`,
    [playerId, eventId, betType, amount, odds, potentialWinnings]
  );
};

export const updateBetStatus = async (betId: number, status: string, actualWinnings: number = 0) => {
  return query(
    `UPDATE sports_bets SET status = $1, actual_winnings = $2, settled_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, actualWinnings, betId]
  );
};

export const getPlayerBets = async (playerId: number, limit = 20) => {
  return query(
    `SELECT sb.*, se.event_name, se.sport
     FROM sports_bets sb
     JOIN sports_events se ON sb.event_id = se.id
     WHERE sb.player_id = $1
     ORDER BY sb.created_at DESC
     LIMIT $2`,
    [playerId, limit]
  );
};

// ===== ACHIEVEMENTS & STATS =====
export const getPlayerAchievements = async (playerId: number) => {
  return query(
    `SELECT a.* FROM player_achievements pa
     JOIN achievements a ON pa.achievement_id = a.id
     WHERE pa.player_id = $1
     ORDER BY pa.earned_at DESC`,
    [playerId]
  );
};

export const awardAchievement = async (playerId: number, achievementId: number) => {
  return query(
    `INSERT INTO player_achievements (player_id, achievement_id)
     VALUES ($1, $2)
     ON CONFLICT (player_id, achievement_id) DO NOTHING
     RETURNING *`,
    [playerId, achievementId]
  );
};

export const getLeaderboard = async (type: string, period: string, limit = 50) => {
  return query(
    `SELECT le.*, p.username, p.name, p.gc_balance
     FROM leaderboard_entries le
     JOIN players p ON le.player_id = p.id
     WHERE le.leaderboard_type = $1 AND le.period = $2
     ORDER BY le.rank ASC
     LIMIT $3`,
    [type, period, limit]
  );
};

export const updateLeaderboardEntries = async () => {
  // This would be called periodically to update leaderboard rankings
  return query(`
    -- Update all-time leaderboards
    WITH daily_wins AS (
      SELECT player_id, COUNT(*) as win_count
      FROM slots_results WHERE winnings > bet_amount
      GROUP BY player_id
    )
    INSERT INTO leaderboard_entries (player_id, leaderboard_type, rank, score, period)
    SELECT player_id, 'wins', ROW_NUMBER() OVER (ORDER BY win_count DESC), win_count, 'all_time'
    FROM daily_wins
    ON CONFLICT (player_id, leaderboard_type, period) DO UPDATE SET score = EXCLUDED.score
  `);
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
