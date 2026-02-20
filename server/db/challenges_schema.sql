-- Challenges System Schema
CREATE TABLE IF NOT EXISTS challenge_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES challenge_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirement_type VARCHAR(100) NOT NULL,
    requirement_value DECIMAL(15, 2) NOT NULL,
    reward_sc DECIMAL(15, 2) DEFAULT 0,
    reward_gc DECIMAL(15, 2) DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    is_daily BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_challenges (
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    current_progress DECIMAL(15, 2) DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, challenge_id)
);

-- Seed Categories
INSERT INTO challenge_categories (name, description, icon, display_order)
VALUES 
('Daily Grinders', 'Complete these every day for quick rewards', 'Zap', 1),
('Slots Master', 'Master the reels and win big', 'Gamepad2', 2),
('Social Butterfly', 'Interact with the community', 'Users', 3)
ON CONFLICT DO NOTHING;

-- Seed some challenges
INSERT INTO challenges (category_id, title, description, requirement_type, requirement_value, reward_sc, reward_gc, is_daily)
VALUES
(1, 'Daily Spin', 'Spin any slot 50 times', 'spins', 50, 0.50, 1000, TRUE),
(1, 'Big Win Hunt', 'Win over 10.00 SC in a single spin', 'win_amount', 10, 1.00, 2000, TRUE),
(2, 'Slot Legend', 'Spin any slot 5000 times', 'spins', 5000, 10.00, 50000, FALSE),
(3, 'Friend Maker', 'Refer 3 friends who complete KYC', 'referrals', 3, 15.00, 30000, FALSE)
ON CONFLICT DO NOTHING;
