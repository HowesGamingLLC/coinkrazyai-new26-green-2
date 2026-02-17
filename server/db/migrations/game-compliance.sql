-- ===== GAME COMPLIANCE & CONFIGURATION TABLE =====
-- Stores compliance info, max_win settings, and game-specific configurations
CREATE TABLE IF NOT EXISTS game_compliance (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL UNIQUE REFERENCES games(id) ON DELETE CASCADE,
  is_external BOOLEAN DEFAULT FALSE,
  is_sweepstake BOOLEAN DEFAULT TRUE,
  is_social_casino BOOLEAN DEFAULT TRUE,
  max_win_amount DECIMAL(15, 2) DEFAULT 20.00,
  currency VARCHAR(10) DEFAULT 'SC',
  min_bet DECIMAL(15, 2) DEFAULT 0.01,
  max_bet DECIMAL(15, 2) DEFAULT 5.00,
  bet_increments DECIMAL(15, 2) DEFAULT 0.01,
  compliance_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_compliance_game_id ON game_compliance(game_id);
CREATE INDEX IF NOT EXISTS idx_game_compliance_is_external ON game_compliance(is_external);
CREATE INDEX IF NOT EXISTS idx_game_compliance_is_sweepstake ON game_compliance(is_sweepstake);

-- ===== SPIN RESULTS TABLE =====
-- Logs every spin result for sweepstake compliance and auditing
CREATE TABLE IF NOT EXISTS spin_results (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_name VARCHAR(255),
  bet_amount DECIMAL(15, 2) NOT NULL,
  win_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  net_result DECIMAL(15, 2) NOT NULL,
  balance_before DECIMAL(15, 2),
  balance_after DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'SC',
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  metadata JSONB, -- Extra data like symbols, multipliers, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spin_results_player_id ON spin_results(player_id);
CREATE INDEX IF NOT EXISTS idx_spin_results_game_id ON spin_results(game_id);
CREATE INDEX IF NOT EXISTS idx_spin_results_created_at ON spin_results(created_at);
CREATE INDEX IF NOT EXISTS idx_spin_results_player_created ON spin_results(player_id, created_at);

-- ===== SPIN HISTORY VIEW =====
-- Easy access to player's spin history
CREATE OR REPLACE VIEW player_spin_history AS
SELECT 
  sr.id,
  sr.player_id,
  sr.game_id,
  sr.game_name,
  sr.bet_amount,
  sr.win_amount,
  sr.net_result,
  sr.balance_before,
  sr.balance_after,
  sr.status,
  sr.created_at,
  g.name as game_title,
  p.username
FROM spin_results sr
LEFT JOIN games g ON sr.game_id = g.id
LEFT JOIN players p ON sr.player_id = p.id
ORDER BY sr.created_at DESC;
