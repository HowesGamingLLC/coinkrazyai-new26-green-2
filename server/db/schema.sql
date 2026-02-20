-- Core Tables
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    gc_balance DECIMAL(15, 2) DEFAULT 10000,
    sc_balance DECIMAL(15, 2) DEFAULT 5,
    status VARCHAR(50) DEFAULT 'Active',
    kyc_level VARCHAR(50) DEFAULT 'Basic',
    kyc_verified BOOLEAN DEFAULT FALSE,
    kyc_verified_date TIMESTAMP,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_sessions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games & Providers
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(100),
    type VARCHAR(100),
    provider VARCHAR(100),
    rtp DECIMAL(5, 2),
    volatility VARCHAR(50),
    description TEXT,
    image_url VARCHAR(500),
    thumbnail VARCHAR(500),
    embed_url VARCHAR(500),
    enabled BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet & Transactions
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    transaction_type VARCHAR(100) NOT NULL,
    gc_amount DECIMAL(15, 2) DEFAULT 0,
    sc_amount DECIMAL(15, 2) DEFAULT 0,
    gc_balance_after DECIMAL(15, 2),
    sc_balance_after DECIMAL(15, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store
CREATE TABLE IF NOT EXISTS store_packs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_usd DECIMAL(10, 2) NOT NULL,
    gold_coins DECIMAL(15, 2) NOT NULL,
    sweeps_coins DECIMAL(15, 2) NOT NULL,
    bonus_percentage INTEGER DEFAULT 0,
    bonus_sc DECIMAL(15, 2) DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_best_value BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    pack_id INTEGER REFERENCES store_packs(id) ON DELETE SET NULL,
    amount_usd DECIMAL(10, 2) NOT NULL,
    gold_coins DECIMAL(15, 2) NOT NULL,
    sweeps_coins DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(100),
    payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bonuses & Jackpots
CREATE TABLE IF NOT EXISTS bonuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    amount VARCHAR(100),
    percentage INTEGER,
    min_deposit DECIMAL(10, 2),
    max_claims INTEGER,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jackpots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jackpot_wins (
    id SERIAL PRIMARY KEY,
    jackpot_id INTEGER REFERENCES jackpots(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    amount_won DECIMAL(15, 2) NOT NULL,
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Specific Tables
CREATE TABLE IF NOT EXISTS poker_tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stakes VARCHAR(100),
    max_players INTEGER DEFAULT 8,
    current_players INTEGER DEFAULT 0,
    buy_in_min DECIMAL(15, 2),
    buy_in_max DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bingo_games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pattern VARCHAR(100),
    players INTEGER DEFAULT 0,
    ticket_price DECIMAL(10, 2),
    jackpot DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sports_events (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(100),
    event_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Upcoming',
    total_bets INTEGER DEFAULT 0,
    line_movement VARCHAR(100),
    event_date TIMESTAMP,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Results
CREATE TABLE IF NOT EXISTS slots_results (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    bet_amount DECIMAL(15, 2) NOT NULL,
    winnings DECIMAL(15, 2) NOT NULL,
    symbols TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poker_results (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    table_id INTEGER REFERENCES poker_tables(id) ON DELETE CASCADE,
    buy_in DECIMAL(15, 2) NOT NULL,
    cash_out DECIMAL(15, 2) NOT NULL,
    hands_played INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    profit DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bingo_results (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES bingo_games(id) ON DELETE CASCADE,
    ticket_price DECIMAL(10, 2) NOT NULL,
    winnings DECIMAL(15, 2) NOT NULL,
    pattern_matched VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI & Settings
CREATE TABLE IF NOT EXISTS ai_employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    duties TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS casino_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security & KYC
CREATE TABLE IF NOT EXISTS security_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(100),
    severity VARCHAR(50) DEFAULT 'info',
    title VARCHAR(255),
    message TEXT,
    description TEXT,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_documents (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements & Stats
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    badge_name VARCHAR(100),
    requirement_type VARCHAR(100),
    requirement_value INTEGER,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_achievements (
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS player_stats (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    total_wagered DECIMAL(15, 2) DEFAULT 0,
    total_won DECIMAL(15, 2) DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    favorite_game VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    leaderboard_type VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL,
    rank INTEGER NOT NULL,
    score DECIMAL(15, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, leaderboard_type, period)
);

-- Scratch Tickets
CREATE TABLE IF NOT EXISTS scratch_ticket_designs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_sc DECIMAL(10, 2) NOT NULL,
    slot_count INTEGER NOT NULL,
    win_probability DECIMAL(5, 2) NOT NULL,
    prize_min_sc DECIMAL(10, 2),
    prize_max_sc DECIMAL(10, 2),
    image_url VARCHAR(500),
    background_color VARCHAR(50),
    enabled BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scratch_tickets (
    id SERIAL PRIMARY KEY,
    design_id INTEGER REFERENCES scratch_ticket_designs(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    slots JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    revealed_slots INTEGER[],
    claim_status VARCHAR(50) DEFAULT 'unclaimed',
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scratch_ticket_results (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES scratch_tickets(id) ON DELETE CASCADE,
    design_id INTEGER REFERENCES scratch_ticket_designs(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    won BOOLEAN NOT NULL,
    prize_amount DECIMAL(15, 2),
    winning_slot_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scratch_ticket_transactions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES scratch_tickets(id) ON DELETE SET NULL,
    transaction_type VARCHAR(100) NOT NULL,
    amount_sc DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pull Tabs
CREATE TABLE IF NOT EXISTS pull_tab_designs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_sc DECIMAL(10, 2) NOT NULL,
    tab_count INTEGER NOT NULL,
    win_probability DECIMAL(5, 2) NOT NULL,
    prize_min_sc DECIMAL(10, 2),
    prize_max_sc DECIMAL(10, 2),
    image_url VARCHAR(500),
    background_color VARCHAR(50),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pull_tab_tickets (
    id SERIAL PRIMARY KEY,
    design_id INTEGER REFERENCES pull_tab_designs(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pull_tab_results (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES pull_tab_tickets(id) ON DELETE CASCADE,
    design_id INTEGER REFERENCES pull_tab_designs(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    won BOOLEAN NOT NULL,
    prize_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pull_tab_transactions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES pull_tab_tickets(id) ON DELETE SET NULL,
    transaction_type VARCHAR(100) NOT NULL,
    amount_sc DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals
CREATE TABLE IF NOT EXISTS referral_links (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    unique_code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_claims (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    referred_player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    referral_code VARCHAR(100) NOT NULL,
    referral_bonus_sc DECIMAL(15, 2) DEFAULT 0,
    referral_bonus_gc DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    claimed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social & Messaging
CREATE TABLE IF NOT EXISTS social_shares (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    game_id INTEGER,
    win_amount DECIMAL(15, 2),
    game_name VARCHAR(255),
    platform VARCHAR(100),
    message TEXT,
    share_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_share_responses (
    id SERIAL PRIMARY KEY,
    social_share_id INTEGER REFERENCES social_shares(id) ON DELETE CASCADE,
    response_type VARCHAR(100),
    response_data JSONB,
    respondent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER,
    recipient_id INTEGER,
    admin_id INTEGER,
    subject VARCHAR(255),
    message TEXT,
    message_type VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_payment_methods (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    method_type VARCHAR(100),
    bank_account_holder VARCHAR(255),
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    routing_number VARCHAR(100),
    account_type VARCHAR(100),
    paypal_email VARCHAR(255),
    cashapp_handle VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Tracking & Compliance
CREATE TABLE IF NOT EXISTS sales_transactions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    game_type VARCHAR(100),
    design_id INTEGER,
    purchase_cost_sc DECIMAL(15, 2),
    win_amount_sc DECIMAL(15, 2),
    net_amount_sc DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER,
    ai_employee_id VARCHAR(50),
    message_type VARCHAR(100),
    subject VARCHAR(255),
    message TEXT,
    related_player_id INTEGER,
    related_game_id INTEGER,
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_actions (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER REFERENCES admin_notifications(id) ON DELETE CASCADE,
    action_type VARCHAR(100),
    action_data JSONB,
    taken_by_admin_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Config & Limits
CREATE TABLE IF NOT EXISTS betting_limits_config (
    id SERIAL PRIMARY KEY,
    game_type VARCHAR(100) UNIQUE NOT NULL,
    min_bet_sc DECIMAL(15, 2) DEFAULT 0,
    max_bet_sc DECIMAL(15, 2) DEFAULT 100,
    max_win_per_spin_sc DECIMAL(15, 2) DEFAULT 1000,
    min_redemption_sc DECIMAL(15, 2) DEFAULT 50,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_onboarding_progress (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 1,
    identity_verified BOOLEAN DEFAULT FALSE,
    address_verified BOOLEAN DEFAULT FALSE,
    payment_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_prompted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bonus system
CREATE TABLE IF NOT EXISTS daily_login_bonuses (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    bonus_day INTEGER DEFAULT 1,
    amount_sc DECIMAL(15, 2) DEFAULT 0,
    amount_gc DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    claimed_at TIMESTAMP,
    next_available_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- External Games / Aggregation
CREATE TABLE IF NOT EXISTS game_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    config JSONB,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_compliance (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    jurisdiction VARCHAR(100),
    is_compliant BOOLEAN DEFAULT TRUE,
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
