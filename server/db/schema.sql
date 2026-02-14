-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_bonuses_status ON bonuses(status);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_player ON kyc_documents(player_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
