-- ===== Extend GAMES TABLE with additional fields =====
ALTER TABLE games ADD COLUMN IF NOT EXISTS max_paylines INTEGER DEFAULT 1;
ALTER TABLE games ADD COLUMN IF NOT EXISTS theme VARCHAR(100);
ALTER TABLE games ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS provider_game_id VARCHAR(255);
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS min_bet DECIMAL(10, 2);
ALTER TABLE games ADD COLUMN IF NOT EXISTS max_bet DECIMAL(10, 2);

-- ===== GAME FEATURES TABLE =====
CREATE TABLE IF NOT EXISTS game_features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== GAME FEATURES MAPPING TABLE =====
CREATE TABLE IF NOT EXISTS game_feature_mappings (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  feature_id INTEGER NOT NULL REFERENCES game_features(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_game_feature_mappings_game_id ON game_feature_mappings(game_id);

-- ===== GAME THEMES TABLE =====
CREATE TABLE IF NOT EXISTS game_themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== GAME THEMES MAPPING TABLE =====
CREATE TABLE IF NOT EXISTS game_theme_mappings (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  theme_id INTEGER NOT NULL REFERENCES game_themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_game_theme_mappings_game_id ON game_theme_mappings(game_id);

-- ===== GAME STATISTICS TABLE =====
CREATE TABLE IF NOT EXISTS game_statistics (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL UNIQUE REFERENCES games(id) ON DELETE CASCADE,
  total_plays INTEGER DEFAULT 0,
  total_wagered DECIMAL(15, 2) DEFAULT 0,
  total_winnings DECIMAL(15, 2) DEFAULT 0,
  average_win DECIMAL(15, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_statistics_game_id ON game_statistics(game_id);

-- ===== GAME RATINGS TABLE =====
CREATE TABLE IF NOT EXISTS game_ratings (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_ratings_game_id ON game_ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_game_ratings_player_id ON game_ratings(player_id);
CREATE INDEX IF NOT EXISTS idx_game_ratings_created_at ON game_ratings(created_at);

-- ===== GAME IMPORT HISTORY TABLE =====
CREATE TABLE IF NOT EXISTS game_import_history (
  id SERIAL PRIMARY KEY,
  import_type VARCHAR(50) NOT NULL,
  provider VARCHAR(100),
  games_imported INTEGER NOT NULL,
  games_updated INTEGER DEFAULT 0,
  games_failed INTEGER DEFAULT 0,
  source_url VARCHAR(500),
  import_log JSONB,
  status VARCHAR(50) DEFAULT 'completed',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  imported_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_import_history_provider ON game_import_history(provider);
CREATE INDEX IF NOT EXISTS idx_game_import_history_status ON game_import_history(status);
CREATE INDEX IF NOT EXISTS idx_game_import_history_created_at ON game_import_history(created_at);

-- ===== GAME CATEGORY ENUM Extension =====
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Pragmatic Play';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Microgaming';
ALTER TYPE game_provider ADD VALUE EXISTS 'NetEnt';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'IGT';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'WMS';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Playtech';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Betsoft';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Play\'n GO';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Red Tiger';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Quickspin';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Yggdrasil';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'ELK Studios';
ALTER TYPE game_provider ADD VALUE IF NOT EXISTS 'Push Gaming';

-- Add indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_games_theme ON games(theme);
CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date);
CREATE INDEX IF NOT EXISTS idx_games_is_featured ON games(is_featured);
CREATE INDEX IF NOT EXISTS idx_games_is_new ON games(is_new);
CREATE INDEX IF NOT EXISTS idx_games_rating ON games(game_rating);
