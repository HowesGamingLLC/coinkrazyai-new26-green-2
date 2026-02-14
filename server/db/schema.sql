-- Create ENUM types
CREATE TYPE user_status AS ENUM ('Active', 'Suspended', 'Banned', 'Inactive');
CREATE TYPE admin_role AS ENUM ('admin', 'moderator', 'support');
CREATE TYPE kyc_level AS ENUM ('None', 'Basic', 'Intermediate', 'Full');
CREATE TYPE transaction_type AS ENUM ('Deposit', 'Withdrawal', 'Win', 'Loss', 'Bonus', 'Transfer', 'Refund');
CREATE TYPE game_category AS ENUM ('Slots', 'Poker', 'Bingo', 'Sportsbook', 'Other');
CREATE TYPE game_provider AS ENUM ('Internal', 'External');
CREATE TYPE bonus_type AS ENUM ('Deposit', 'Reload', 'Free Spins', 'Free Bet', 'Cashback');
CREATE TYPE bingo_pattern AS ENUM ('5-line', 'Full Card', 'Corner', 'Other');
CREATE TYPE sport_type AS ENUM ('NFL', 'NBA', 'Soccer', 'Tennis', 'Other');
CREATE TYPE event_status AS ENUM ('Upcoming', 'Live', 'Closed', 'Settled');
CREATE TYPE achievement_requirement_type AS ENUM ('wins', 'wagered', 'streak', 'games_played', 'balance', 'referrals', 'level');
CREATE TYPE security_alert_type AS ENUM ('Login', 'Withdrawal', 'Unusual Activity', 'Chargeback', 'Fraud', 'Other');

-- ===== ADMIN USERS TABLE =====
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role admin_role DEFAULT 'moderator',
  status user_status DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ===== PLAYERS TABLE =====
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  gc_balance DECIMAL(15, 2) DEFAULT 0,
  sc_balance DECIMAL(15, 2) DEFAULT 0,
  status user_status DEFAULT 'Active',
  kyc_level kyc_level DEFAULT 'None',
  kyc_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  country VARCHAR(100),
  date_of_birth DATE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  total_deposits DECIMAL(15, 2) DEFAULT 0,
  total_withdrawals DECIMAL(15, 2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);

-- ===== WALLET TRANSACTIONS TABLE =====
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  balance_before DECIMAL(15, 2),
  balance_after DECIMAL(15, 2),
  game_session_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_player_id ON wallet_transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- ===== GAMES TABLE =====
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category game_category NOT NULL,
  provider game_provider NOT NULL,
  rtp DECIMAL(5, 2) DEFAULT 95.0,
  volatility VARCHAR(50),
  enabled BOOLEAN DEFAULT TRUE,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_enabled ON games(enabled);

-- ===== PLAYER STATS TABLE =====
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  total_wagered DECIMAL(15, 2) DEFAULT 0,
  total_won DECIMAL(15, 2) DEFAULT 0,
  total_lost DECIMAL(15, 2) DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  favorite_game VARCHAR(255),
  last_game_played TIMESTAMP,
  weekly_wagered DECIMAL(15, 2) DEFAULT 0,
  monthly_wagered DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== BONUSES TABLE =====
CREATE TABLE IF NOT EXISTS bonuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type bonus_type NOT NULL,
  amount VARCHAR(100),
  percentage DECIMAL(5, 2),
  min_deposit DECIMAL(15, 2) DEFAULT 0,
  max_claims INTEGER DEFAULT 1,
  wagering_multiplier DECIMAL(5, 2) DEFAULT 35.0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== STORE PACKS TABLE =====
CREATE TABLE IF NOT EXISTS store_packs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd DECIMAL(8, 2) NOT NULL,
  gold_coins INTEGER NOT NULL,
  sweeps_coins INTEGER DEFAULT 0,
  bonus_percentage DECIMAL(5, 2) DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  is_best_value BOOLEAN DEFAULT FALSE,
  enabled BOOLEAN DEFAULT TRUE,
  position INTEGER,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PURCHASE HISTORY TABLE =====
CREATE TABLE IF NOT EXISTS purchase_history (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  store_pack_id INTEGER REFERENCES store_packs(id),
  amount_usd DECIMAL(8, 2) NOT NULL,
  gold_coins INTEGER,
  sweeps_coins INTEGER,
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchase_history_player_id ON purchase_history(player_id);

-- ===== POKER TABLES TABLE =====
CREATE TABLE IF NOT EXISTS poker_tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stakes VARCHAR(50) NOT NULL,
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  buy_in_min DECIMAL(15, 2) NOT NULL,
  buy_in_max DECIMAL(15, 2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== POKER SESSIONS TABLE =====
CREATE TABLE IF NOT EXISTS poker_sessions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  table_id INTEGER NOT NULL REFERENCES poker_tables(id),
  buy_in DECIMAL(15, 2) NOT NULL,
  cash_out DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- ===== BINGO GAMES TABLE =====
CREATE TABLE IF NOT EXISTS bingo_games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pattern bingo_pattern NOT NULL,
  players INTEGER DEFAULT 0,
  ticket_price DECIMAL(8, 2) NOT NULL,
  jackpot DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== BINGO TICKETS TABLE =====
CREATE TABLE IF NOT EXISTS bingo_tickets (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES bingo_games(id),
  ticket_number VARCHAR(100) UNIQUE,
  numbers INTEGER[],
  marked_numbers INTEGER[],
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== SPORTS EVENTS TABLE =====
CREATE TABLE IF NOT EXISTS sports_events (
  id SERIAL PRIMARY KEY,
  sport sport_type NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  status event_status DEFAULT 'Upcoming',
  total_bets DECIMAL(15, 2) DEFAULT 0,
  line_movement VARCHAR(50),
  odds_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== BETS TABLE =====
CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES sports_events(id),
  bet_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  odds DECIMAL(8, 4),
  potential_win DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP
);

-- ===== ACHIEVEMENTS TABLE =====
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  badge_name VARCHAR(100) UNIQUE,
  requirement_type achievement_requirement_type NOT NULL,
  requirement_value INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PLAYER ACHIEVEMENTS TABLE =====
CREATE TABLE IF NOT EXISTS player_achievements (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_player_id ON player_achievements(player_id);

-- ===== KYC DOCUMENTS TABLE =====
CREATE TABLE IF NOT EXISTS kyc_documents (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== SECURITY ALERTS TABLE =====
CREATE TABLE IF NOT EXISTS security_alerts (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  alert_type security_alert_type NOT NULL,
  description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- ===== LEADERBOARD TABLE =====
CREATE TABLE IF NOT EXISTS leaderboards (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  rank INTEGER,
  score DECIMAL(15, 2) NOT NULL,
  period VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_player_id ON leaderboards(player_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);

-- ===== GAME CONFIG TABLE =====
CREATE TABLE IF NOT EXISTS game_config (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id),
  config_key VARCHAR(255) NOT NULL,
  config_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create views for common queries
CREATE OR REPLACE VIEW player_summary AS
SELECT 
  p.id,
  p.username,
  p.email,
  p.gc_balance,
  p.sc_balance,
  p.status,
  ps.total_wagered,
  ps.total_won,
  ps.games_played,
  p.created_at,
  p.last_login
FROM players p
LEFT JOIN player_stats ps ON p.id = ps.player_id;

CREATE OR REPLACE VIEW active_games AS
SELECT * FROM games WHERE enabled = TRUE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_bets_player_id ON bets(player_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_player_id ON kyc_documents(player_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_player_id ON security_alerts(player_id);
CREATE INDEX IF NOT EXISTS idx_bingo_tickets_player_id ON bingo_tickets(player_id);
CREATE INDEX IF NOT EXISTS idx_poker_sessions_player_id ON poker_sessions(player_id);
