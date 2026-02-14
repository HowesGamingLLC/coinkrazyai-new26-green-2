-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gc_balance DECIMAL(15, 2) DEFAULT 0,
  sc_balance DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  kyc_level VARCHAR(50) DEFAULT 'None',
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_date TIMESTAMP,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin accounts
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  status VARCHAR(50) DEFAULT 'Active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  provider VARCHAR(255),
  rtp DECIMAL(5, 2),
  volatility VARCHAR(50),
  enabled BOOLEAN DEFAULT TRUE,
  active_users INT DEFAULT 0,
  daily_revenue DECIMAL(15, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bonus campaigns
CREATE TABLE IF NOT EXISTS bonuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount VARCHAR(100),
  percentage DECIMAL(5, 2),
  min_deposit DECIMAL(10, 2),
  max_claims INT,
  claims_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10),
  status VARCHAR(50) DEFAULT 'Completed',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poker tables
CREATE TABLE IF NOT EXISTS poker_tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stakes VARCHAR(50),
  max_players INT DEFAULT 8,
  current_players INT DEFAULT 0,
  buy_in_min DECIMAL(10, 2),
  buy_in_max DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'Active',
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bingo games
CREATE TABLE IF NOT EXISTS bingo_games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pattern VARCHAR(50) NOT NULL,
  players INT DEFAULT 0,
  ticket_price DECIMAL(10, 2),
  jackpot DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sports events
CREATE TABLE IF NOT EXISTS sports_events (
  id SERIAL PRIMARY KEY,
  sport VARCHAR(50),
  event_name VARCHAR(255) NOT NULL,
  event_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Upcoming',
  total_bets DECIMAL(15, 2) DEFAULT 0,
  line_movement VARCHAR(50),
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security alerts
CREATE TABLE IF NOT EXISTS security_alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(100),
  severity VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  environment VARCHAR(50),
  permissions TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  request_count INT DEFAULT 0
);

-- KYC documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id),
  doc_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Pending',
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);

-- Player sessions
CREATE TABLE IF NOT EXISTS player_sessions (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slots game results
CREATE TABLE IF NOT EXISTS slots_results (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  game_id INT REFERENCES games(id),
  bet_amount DECIMAL(10, 2) NOT NULL,
  winnings DECIMAL(10, 2) NOT NULL,
  rtp_contribution DECIMAL(5, 2),
  symbols VARCHAR(100),
  result_type VARCHAR(50), -- 'win', 'loss', 'bonus'
  multiplier DECIMAL(5, 2) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poker game results
CREATE TABLE IF NOT EXISTS poker_results (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  table_id INT REFERENCES poker_tables(id),
  buy_in DECIMAL(10, 2) NOT NULL,
  cash_out DECIMAL(10, 2) NOT NULL,
  hands_played INT DEFAULT 0,
  duration_minutes INT,
  profit DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bingo game results
CREATE TABLE IF NOT EXISTS bingo_results (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  game_id INT REFERENCES bingo_games(id),
  ticket_price DECIMAL(10, 2) NOT NULL,
  winnings DECIMAL(10, 2) DEFAULT 0,
  pattern_matched VARCHAR(50),
  position INT, -- 1st, 2nd, 3rd etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sports bets/parlays
CREATE TABLE IF NOT EXISTS sports_bets (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  event_id INT REFERENCES sports_events(id),
  bet_type VARCHAR(50), -- 'single', 'parlay'
  amount DECIMAL(10, 2) NOT NULL,
  odds DECIMAL(5, 3) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Won', 'Lost', 'Voided'
  potential_winnings DECIMAL(10, 2),
  actual_winnings DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP
);

-- Store packs (coin packs available for purchase)
CREATE TABLE IF NOT EXISTS store_packs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  gold_coins INT NOT NULL,
  sweeps_coins INT,
  bonus_percentage DECIMAL(5, 2),
  is_popular BOOLEAN DEFAULT FALSE,
  is_best_value BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase history
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  pack_id INT REFERENCES store_packs(id),
  amount_usd DECIMAL(10, 2) NOT NULL,
  gold_coins INT NOT NULL,
  sweeps_coins INT,
  payment_method VARCHAR(50), -- 'stripe', 'square', etc
  payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Completed', -- 'Pending', 'Completed', 'Failed', 'Refunded'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet ledger (detailed transaction audit trail)
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  transaction_type VARCHAR(100) NOT NULL, -- 'purchase', 'game_win', 'game_loss', 'bonus', 'refund', etc
  gc_amount DECIMAL(15, 2) DEFAULT 0,
  sc_amount DECIMAL(15, 2) DEFAULT 0,
  gc_balance_after DECIMAL(15, 2),
  sc_balance_after DECIMAL(15, 2),
  related_game_result_id INT,
  related_bet_id INT,
  related_purchase_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player statistics
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player_id INT UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  total_wagered DECIMAL(15, 2) DEFAULT 0,
  total_won DECIMAL(15, 2) DEFAULT 0,
  total_spent DECIMAL(15, 2) DEFAULT 0,
  games_played INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_win DECIMAL(15, 2) DEFAULT 0,
  max_loss DECIMAL(15, 2) DEFAULT 0,
  favorite_game VARCHAR(255),
  last_played_game VARCHAR(255),
  total_playtime_hours INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  badge_name VARCHAR(255),
  requirement_type VARCHAR(50), -- 'wins', 'wagered', 'games_played', 'streak', etc
  requirement_value INT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player achievements (earned)
CREATE TABLE IF NOT EXISTS player_achievements (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, achievement_id)
);

-- Leaderboard entries (denormalized for performance)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  leaderboard_type VARCHAR(50), -- 'wins', 'wagered', 'streak', etc
  rank INT,
  score DECIMAL(15, 2),
  period VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'all_time'
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_player_sessions_token ON player_sessions(token);
CREATE INDEX IF NOT EXISTS idx_player_sessions_player ON player_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_bonuses_status ON bonuses(status);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_player ON kyc_documents(player_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_slots_results_player ON slots_results(player_id);
CREATE INDEX IF NOT EXISTS idx_slots_results_created ON slots_results(created_at);
CREATE INDEX IF NOT EXISTS idx_poker_results_player ON poker_results(player_id);
CREATE INDEX IF NOT EXISTS idx_bingo_results_player ON bingo_results(player_id);
CREATE INDEX IF NOT EXISTS idx_sports_bets_player ON sports_bets(player_id);
CREATE INDEX IF NOT EXISTS idx_sports_bets_status ON sports_bets(status);
CREATE INDEX IF NOT EXISTS idx_purchases_player ON purchases(player_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_player ON wallet_ledger(player_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_created ON wallet_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_type_period ON leaderboard_entries(leaderboard_type, period);
