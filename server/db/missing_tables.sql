-- Migration to add missing tables and columns identified from route implementations

-- 1. Support & Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed', 'pending', 'resolved'
    priority VARCHAR(50) DEFAULT 'normal',
    category VARCHAR(100),
    assigned_admin_id INTEGER REFERENCES admin_users(id),
    assigned_to INTEGER REFERENCES admin_users(id), -- Alias for assigned_admin_id
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id INTEGER, -- player_id or admin_id depending on sender_type
    sender_type VARCHAR(20) NOT NULL, -- 'player', 'admin'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alias for ticket_messages if used in code
CREATE OR REPLACE VIEW ticket_messages AS SELECT * FROM support_ticket_messages;

-- 2. Analytics & Usage
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_code INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Casino Spins (if not already handled by spin_results)
CREATE TABLE IF NOT EXISTS casino_game_spins (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    game_name VARCHAR(255),
    provider VARCHAR(100),
    bet_amount DECIMAL(15, 2) NOT NULL,
    winnings DECIMAL(15, 2) NOT NULL DEFAULT 0,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    result VARCHAR(50), -- 'win', 'loss', 'push'
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Redemptions (Withdrawals)
CREATE TABLE IF NOT EXISTS redemption_requests (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'SC',
    method VARCHAR(100),
    method_details JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
    rejected_reason TEXT,
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CMS & Content
CREATE TABLE IF NOT EXISTS cms_pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    page_type VARCHAR(50), -- 'page', 'post', 'notice'
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published'
    meta_description TEXT,
    featured_image VARCHAR(500),
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    placement VARCHAR(100), -- 'home', 'sidebar', 'top'
    display_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Social Groups
CREATE TABLE IF NOT EXISTS social_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_private BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES players(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_group_members (
    group_id INTEGER REFERENCES social_groups(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'member', 'admin', 'moderator'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, player_id)
);

-- 7. Marketing & Retention
CREATE TABLE IF NOT EXISTS retention_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100), -- 'email', 'push', 'bonus'
    trigger_event VARCHAR(100),
    reward_type VARCHAR(100),
    reward_amount DECIMAL(15, 2),
    target_criteria JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    enabled BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS make_it_rain_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(15, 2) NOT NULL,
    amount_distributed DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'SC',
    target_players VARCHAR(100), -- 'all', 'vip', 'active'
    min_players INTEGER DEFAULT 1,
    max_players INTEGER,
    players_participating INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_at TIMESTAMP,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS make_it_rain_rewards (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES make_it_rain_campaigns(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Advanced Admin & Security
CREATE TABLE IF NOT EXISTS player_vip (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    vip_tier_id INTEGER,
    vip_points INTEGER DEFAULT 0,
    month_wagered DECIMAL(15, 2) DEFAULT 0,
    promoted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS vip_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER UNIQUE NOT NULL,
    min_wagered DECIMAL(15, 2) DEFAULT 0,
    reload_bonus_percentage DECIMAL(5, 2) DEFAULT 0,
    birthday_bonus DECIMAL(15, 2) DEFAULT 0,
    exclusive_games JSONB DEFAULT '[]',
    priority_support BOOLEAN DEFAULT FALSE,
    requirements JSONB,
    benefits JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100), -- 'wager_amount', 'login_frequency', 'ip_mismatch'
    threshold_value DECIMAL(15, 2),
    action VARCHAR(100), -- 'flag', 'suspend', 'block'
    severity VARCHAR(50) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_flags (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    pattern_id INTEGER REFERENCES fraud_patterns(id) ON DELETE SET NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(id),
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100), -- 'player', 'game', 'setting'
    resource_id VARCHAR(100),
    details TEXT,
    new_values JSONB,
    ip_address VARCHAR(45),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_logs (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aml_checks (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    check_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    result TEXT,
    risk_level VARCHAR(50), -- 'low', 'medium', 'high'
    verified_by INTEGER REFERENCES admin_users(id),
    verified_at TIMESTAMP,
    check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    admin_id INTEGER REFERENCES admin_users(id),
    permissions JSONB,
    rate_limit INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'revoked', 'expired'
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'email', 'sms', 'push'
    subject VARCHAR(255),
    template TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Affiliate Management
CREATE TABLE IF NOT EXISTS affiliate_partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    commission_percentage DECIMAL(5, 2) DEFAULT 10.0,
    approved_by INTEGER REFERENCES admin_users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_links (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    unique_code VARCHAR(100) UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    total_wagered DECIMAL(15, 2) DEFAULT 0,
    commission_earned DECIMAL(15, 2) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Game Configuration & Providers
CREATE TABLE IF NOT EXISTS game_config (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, config_key)
);

CREATE TABLE IF NOT EXISTS provider_games (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER, -- Link to game_providers if needed
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    external_game_id VARCHAR(255) NOT NULL,
    provider_name VARCHAR(100),
    sync_status VARCHAR(50) DEFAULT 'synced',
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_name, external_game_id)
);

-- 10. Missing columns in existing tables
DO $$
BEGIN
    -- Players table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='vip_status') THEN
        ALTER TABLE players ADD COLUMN vip_status VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='players' AND column_name='country') THEN
        ALTER TABLE players ADD COLUMN country VARCHAR(100);
    END IF;

    -- Referral links table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_links' AND column_name='clicks') THEN
        ALTER TABLE referral_links ADD COLUMN clicks INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_links' AND column_name='conversions') THEN
        ALTER TABLE referral_links ADD COLUMN conversions INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_links' AND column_name='total_referral_bonus') THEN
        ALTER TABLE referral_links ADD COLUMN total_referral_bonus DECIMAL(15, 2) DEFAULT 0;
    END IF;

    -- Bonuses table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bonuses' AND column_name='wagering_multiplier') THEN
        ALTER TABLE bonuses ADD COLUMN wagering_multiplier DECIMAL(5, 2) DEFAULT 35.0;
    END IF;

    -- Casino settings table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='casino_settings' AND column_name='updated_by') THEN
        ALTER TABLE casino_settings ADD COLUMN updated_by INTEGER REFERENCES admin_users(id);
    END IF;
END $$;
