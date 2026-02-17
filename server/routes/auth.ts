import { RequestHandler } from 'express';
import { AuthService } from '../services/auth-service';
import { RegisterRequest, LoginRequest } from '@shared/api';
import * as bcrypt from 'bcrypt';

// Register new player
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { username, name, email, password } = req.body as RegisterRequest;

    // Validate inputs
    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const result = await AuthService.registerPlayer(username, name, email, password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Set auth cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      token: result.token,
      player: result.player
    });
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Registration failed');
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Login player
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body as LoginRequest;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password required'
      });
    }

    const result = await AuthService.loginPlayer(username, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set auth cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      token: result.token,
      player: result.player
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Login failed');
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Admin login - with sitewide admin recognition
export const handleAdminLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    const result = await AuthService.loginAdmin(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set admin cookie
    res.cookie('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Try to find a player account with the same email (sitewide admin recognition)
    let playerProfile = null;
    let playerToken = null;

    try {
      const dbQueries = await import('../db/queries');
      const playerResult = await dbQueries.getPlayerByEmail(email);

      if (playerResult.rows.length > 0) {
        const player = playerResult.rows[0];
        // Generate a player token for sitewide access
        playerToken = AuthService.generateJWT({ playerId: player.id, role: 'player' }, false);
        playerProfile = {
          id: player.id,
          username: player.username,
          name: player.name,
          email: player.email,
          gc_balance: player.gc_balance,
          sc_balance: player.sc_balance,
          status: player.status,
          kyc_level: player.kyc_level,
          kyc_verified: player.kyc_verified,
          created_at: player.created_at,
          last_login: player.last_login
        };
      }
    } catch (e) {
      console.warn('[Auth] Could not find associated player account for admin');
    }

    res.json({
      success: true,
      adminToken: result.token,
      playerToken: playerToken || null,
      admin: result.admin,
      playerProfile: playerProfile || null,
      isSitewideAdmin: !!playerProfile
    });
  } catch (error) {
    console.error('[Auth] Admin login error:', error);
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Admin login failed');
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Get current player profile
export const handleGetProfile: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const profile = await AuthService.getPlayerProfile(req.user.playerId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('[Auth] Get profile error:', error);
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to get profile');
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Update player profile
export const handleUpdateProfile: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const { name, email, password } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    const updated = await AuthService.updatePlayerProfile(req.user.playerId, updates);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('[Auth] Update profile error:', error);
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to update profile');
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Logout player
export const handleLogout: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Clear cookies
    res.clearCookie('auth_token');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Logout failed');
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// DEBUG: Check if test users exist (for debugging login issues)
export const handleDebugCheckUsers: RequestHandler = async (req, res) => {
  try {
    const testUsers = ['johndoe', 'janesmith', 'mikejohnson', 'sarahwilson', 'tombrown'];
    const results: any[] = [];

    for (const username of testUsers) {
      try {
        const userResult = await (await import('../db/queries')).getPlayerByUsername(username);
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          results.push({
            username: user.username,
            name: user.name,
            email: user.email,
            status: user.status,
            hasPasswordHash: !!user.password_hash,
            createdAt: user.created_at
          });
        } else {
          results.push({
            username,
            found: false
          });
        }
      } catch (err) {
        results.push({
          username,
          error: (err as Error).message
        });
      }
    }

    res.json({
      success: true,
      message: 'Test user check complete',
      testUsersAvailable: results,
      hint: 'Test credentials - username: johndoe, password: testpass123'
    });
  } catch (error) {
    console.error('[Auth Debug] Error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
};

// DEBUG: Re-seed test users (for fixing login issues)
export const handleDebugReseedUsers: RequestHandler = async (req, res) => {
  try {
    const dbQueries = await import('../db/queries');
    const { query: dbQuery } = await import('../db/connection');

    // Hash password for test users
    const playerPassword = await bcrypt.hash('testpass123', 10);

    const testPlayers: any[] = [
      ['johndoe', 'John Doe', 'john@example.com', playerPassword, 5250, 125, 'Active', 'Full', true],
      ['janesmith', 'Jane Smith', 'jane@example.com', playerPassword, 12000, 340, 'Active', 'Full', true],
      ['mikejohnson', 'Mike Johnson', 'mike@example.com', playerPassword, 2100, 89, 'Active', 'Intermediate', true],
      ['sarahwilson', 'Sarah Wilson', 'sarah@example.com', playerPassword, 8500, 215, 'Active', 'Full', true],
    ];

    let created = 0;
    let updated = 0;

    for (const playerData of testPlayers) {
      try {
        // Check if player exists
        const existingResult = await dbQueries.getPlayerByUsername(playerData[0]);

        if (existingResult.rows.length > 0) {
          // Update existing player with password hash
          await dbQuery(
            `UPDATE players SET password_hash = $1, status = $2 WHERE username = $3`,
            [playerData[3], playerData[6], playerData[0]]
          );
          updated++;
          console.log(`[Auth] Updated user: ${playerData[0]}`);
        } else {
          // Insert new player
          await dbQuery(
            `INSERT INTO players (username, name, email, password_hash, gc_balance, sc_balance, status, kyc_level, kyc_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            playerData
          );
          created++;
          console.log(`[Auth] Created user: ${playerData[0]}`);
        }
      } catch (err: any) {
        console.error(`[Auth] Error processing user ${playerData[0]}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Reseeded test users - Created: ${created}, Updated: ${updated}`,
      testCredentials: {
        username: 'johndoe',
        password: 'testpass123'
      }
    });
  } catch (error) {
    console.error('[Auth Debug Reseed] Error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
};
