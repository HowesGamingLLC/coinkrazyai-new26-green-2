import { query } from './connection';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

export const initializeDatabase = async () => {
  try {
    console.log('[DB] Initializing database...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (err: any) {
          // Log but don't fail on schema errors - the table might already exist with different schema
          if (err.code === '42703' || err.code === '42701' || err.code === '42P07') {
            console.log('[DB] Skipping schema statement (table/index/column exists):', err.message?.substring(0, 80));
          } else {
            throw err;
          }
        }
      }
    }

    console.log('[DB] Schema initialized successfully');

    // Seed data if tables are empty
    await seedDatabase();
  } catch (error) {
    console.error('[DB] Initialization failed:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    // Always ensure admin user exists
    console.log('[DB] Ensuring admin user exists...');
    const adminPassword = await bcrypt.hash('admin123', 10);

    try {
      await query(
        `INSERT INTO admin_users (email, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
        ['coinkrazy26@gmail.com', adminPassword, 'CoinKrazy Admin', 'admin', 'Active']
      );
      console.log('[DB] Admin user coinkrazy26@gmail.com ensured');
    } catch (err: any) {
      console.log('[DB] Admin user setup:', err.message?.substring(0, 100));
    }

    // Check if players table has data
    const result = await query('SELECT COUNT(*) as count FROM players');

    if (result.rows[0].count === 0) {
      console.log('[DB] Seeding database with sample data...');

      // Seed players with proper bcrypt hashes (password: testpass123)
      const playerPassword = await bcrypt.hash('testpass123', 10);
      const players = [
        ['johndoe', 'John Doe', 'john@example.com', playerPassword, 5250, 125, 'Active', 'Full', true],
        ['janesmith', 'Jane Smith', 'jane@example.com', playerPassword, 12000, 340, 'Active', 'Full', true],
        ['mikejohnson', 'Mike Johnson', 'mike@example.com', playerPassword, 2100, 89, 'Active', 'Intermediate', true],
        ['sarahwilson', 'Sarah Wilson', 'sarah@example.com', playerPassword, 8500, 215, 'Active', 'Full', true],
        ['tombrown', 'Tom Brown', 'tom@example.com', playerPassword, 3200, 95, 'Suspended', 'Basic', false],
      ];

      for (const player of players) {
        try {
          await query(
            `INSERT INTO players (username, name, email, password_hash, gc_balance, sc_balance, status, kyc_level, kyc_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            player
          );
        } catch (err: any) {
          // Player might already exist, that's okay
          if (err.code !== '23505') {
            throw err;
          }
        }
      }

      // Seed games
      const games = [
        ['Mega Spin Slots', 'Slots', 'Internal', 96.5, 'Medium', true],
        ['Diamond Poker Pro', 'Poker', 'Internal', 98.2, 'Low', true],
        ['Bingo Bonanza', 'Bingo', 'Internal', 94.8, 'High', true],
        ['Fruit Frenzy', 'Slots', 'Internal', 95.0, 'Medium', false],
      ];

      for (const game of games) {
        await query(
          `INSERT INTO games (name, category, provider, rtp, volatility, enabled) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          game
        );
      }

      // Seed bonuses
      const bonuses = [
        ['Welcome Bonus 100%', 'Deposit', '$100', 100, 10, 1200],
        ['VIP Reload Bonus', 'Reload', '$50', 50, 50, 500],
        ['Free Spins 50', 'Free Spins', '50 Spins', null, 0, 2000],
      ];

      for (const bonus of bonuses) {
        await query(
          `INSERT INTO bonuses (name, type, amount, percentage, min_deposit, max_claims) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          bonus
        );
      }

      // Seed poker tables
      const pokerTables = [
        ['Diamond Table 1', '$1/$2', 8, 6, 20, 200],
        ['Ruby Table 2', '$5/$10', 8, 5, 100, 1000],
        ['Gold Table 1', '$10/$20', 6, 0, 200, 2000],
        ['Platinum VIP', '$50/$100', 6, 4, 1000, 10000],
      ];

      for (const table of pokerTables) {
        await query(
          `INSERT INTO poker_tables (name, stakes, max_players, current_players, buy_in_min, buy_in_max) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          table
        );
      }

      // Seed bingo games
      const bingoGames = [
        ['Morning Bonanza', '5-line', 42, 1, 500],
        ['Afternoon Special', 'Full Card', 28, 2, 1200],
        ['Evening Rush', '5-line', 0, 1.5, 750],
        ['Night Party', 'Corner', 0, 3, 2000],
      ];

      for (const game of bingoGames) {
        await query(
          `INSERT INTO bingo_games (name, pattern, players, ticket_price, jackpot) 
           VALUES ($1, $2, $3, $4, $5)`,
          game
        );
      }

      // Seed sports events
      const sportsEvents = [
        ['NFL', 'Chiefs vs 49ers', 'Live', 124500, '+2.5'],
        ['NBA', 'Lakers vs Celtics', 'Live', 89200, '-1.5'],
        ['Soccer', 'Manchester United vs Liverpool', 'Upcoming', 234100, '+0.5'],
        ['Tennis', 'Australian Open Final', 'Upcoming', 56800, null],
      ];

      for (const event of sportsEvents) {
        await query(
          `INSERT INTO sports_events (sport, event_name, status, total_bets, line_movement)
           VALUES ($1, $2, $3, $4, $5)`,
          event
        );
      }

      // Seed store packs
      const storePacks = [
        ['Starter Pack', 'Perfect for new players', 9.99, 1000, 0, 0, false, false, true, 1],
        ['Gold Bundle', 'Popular choice', 24.99, 3000, 500, 10, true, false, true, 2],
        ['Platinum Pack', 'Best value offer', 49.99, 7000, 2000, 20, false, true, true, 3],
        ['VIP Elite', 'Premium experience', 99.99, 15000, 5000, 30, false, false, true, 4],
        ['Mega Bonus', 'Limited time offer', 14.99, 2000, 200, 15, false, false, true, 5],
      ];

      for (const pack of storePacks) {
        await query(
          `INSERT INTO store_packs (title, description, price_usd, gold_coins, sweeps_coins, bonus_percentage, is_popular, is_best_value, enabled, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          pack
        );
      }

      // Seed achievements
      const achievements = [
        ['First Win', 'Win your first game', 'trophy', 'first_win', 'wins', 1, true],
        ['Big Winner', 'Win 100 times', 'crown', 'big_winner', 'wins', 100, true],
        ['High Roller', 'Wager 10,000 gold coins', 'gem', 'high_roller', 'wagered', 10000, true],
        ['Streaker', 'Get a 10 game winning streak', 'fire', 'streaker', 'streak', 10, true],
        ['Rich Player', 'Accumulate 50,000 gold coins', 'diamond', 'rich_player', 'balance', 50000, true],
        ['Slots Master', 'Play slots 500 times', 'star', 'slots_master', 'games_played', 500, true],
        ['Poker Pro', 'Play 100 poker hands', 'spade', 'poker_pro', 'games_played', 100, true],
      ];

      for (const achievement of achievements) {
        await query(
          `INSERT INTO achievements (name, description, icon_url, badge_name, requirement_type, requirement_value, enabled)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          achievement
        );
      }

      // Seed player stats (for seeded players)
      const playerIds = [1, 2, 3, 4];
      for (const playerId of playerIds) {
        await query(
          `INSERT INTO player_stats (player_id, total_wagered, total_won, games_played, favorite_game)
           VALUES ($1, $2, $3, $4, $5)`,
          [playerId, Math.random() * 50000, Math.random() * 25000, Math.floor(Math.random() * 500), 'Slots']
        );
      }

      console.log('[DB] Sample data seeded successfully');
    } else {
      console.log('[DB] Database already contains data, skipping seed');
    }
  } catch (error) {
    console.error('[DB] Seeding failed:', error);
    throw error;
  }
};

// Export initialization for manual run if needed
export default initializeDatabase;
