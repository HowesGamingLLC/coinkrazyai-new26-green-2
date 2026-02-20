-- Initial migrations to ensure all columns exist
-- These are also handled in init.ts code, but good to have here for idempotency

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='description') THEN
        ALTER TABLE games ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='games' AND column_name='image_url') THEN
        ALTER TABLE games ADD COLUMN image_url VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_packs' AND column_name='bonus_sc') THEN
        ALTER TABLE store_packs ADD COLUMN bonus_sc DECIMAL(15, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='username') THEN
        ALTER TABLE players ADD COLUMN username VARCHAR(255) UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='password_hash') THEN
        ALTER TABLE players ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
END $$;

-- Add any new tables or adjustments below
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
