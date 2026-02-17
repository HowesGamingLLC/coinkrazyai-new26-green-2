-- ===== CHALLENGES CONFIGURATION TABLE =====
CREATE TABLE IF NOT EXISTS challenge_definitions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'daily_login', 'purchase', 'spins', 'streak'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  requirement_count INTEGER NOT NULL, -- Number of purchases, spins, or days required
  reward_sc DECIMAL(15, 2) DEFAULT 0,
  reward_gc INTEGER DEFAULT 0,
  reward_badge VARCHAR(100), -- Badge name to award
  reward_vip_status VARCHAR(50), -- VIP status to award
  period VARCHAR(50) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly', 'all_time'
  target_game_id INTEGER REFERENCES games(id), -- For spin challenges on specific games
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PLAYER CHALLENGE PROGRESS TABLE =====
CREATE TABLE IF NOT EXISTS player_challenges (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenge_definitions(id) ON DELETE CASCADE,
  current_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_player_challenges_player_id ON player_challenges(player_id);
CREATE INDEX IF NOT EXISTS idx_player_challenges_completed ON player_challenges(player_id, is_completed);

-- ===== INSERT DEFAULT CHALLENGES =====

-- 1. Free Daily GC/SC (Handled by existing daily_login_bonuses but listed here for UI)
INSERT INTO challenge_definitions (type, name, description, requirement_count, reward_sc, reward_gc, period)
VALUES ('daily_login', 'Daily Gift', 'Claim your free daily sweeps coins and gold coins just for logging in!', 1, 1.00, 1000, 'daily')
ON CONFLICT DO NOTHING;

-- 2. VIP Status by Purchases
INSERT INTO challenge_definitions (type, name, description, requirement_count, reward_vip_status, reward_badge, period)
VALUES 
  ('purchase', 'Daily VIP Bronze', 'Purchase 1 GC/SC pack today to earn Bronze status!', 1, 'Bronze', 'Bronze Badge', 'daily'),
  ('purchase', 'Weekly VIP Silver', 'Purchase 5 GC/SC packs this week to earn Silver status!', 5, 'Silver', 'Silver Badge', 'weekly'),
  ('purchase', 'Monthly VIP Gold', 'Purchase 20 GC/SC packs this month to earn Gold status!', 20, 'Gold', 'Gold Badge', 'monthly')
ON CONFLICT DO NOTHING;

-- 3. Spin Challenges
INSERT INTO challenge_definitions (type, name, description, requirement_count, reward_sc, reward_gc, period)
VALUES 
  ('spins', 'Slot Starter', 'Spin any slot game 50 times to earn a bonus!', 50, 2.00, 2000, 'daily'),
  ('spins', 'Mega Spinner', 'Spin any slot game 500 times this week!', 500, 10.00, 10000, 'weekly')
ON CONFLICT DO NOTHING;

-- 4. Activity Streaks
INSERT INTO challenge_definitions (type, name, description, requirement_count, reward_sc, reward_badge, period)
VALUES 
  ('streak', 'Week Warrior', 'Log in every day for 7 days straight!', 7, 5.00, 'Week Warrior Badge', 'all_time'),
  ('streak', 'Fortnight Fighter', 'Log in every day for 14 days straight!', 14, 15.00, 'Fortnight Fighter Badge', 'all_time'),
  ('streak', 'Monthly Master', 'Log in every day for 30 days straight!', 30, 50.00, 'Monthly Master Badge', 'all_time')
ON CONFLICT DO NOTHING;
