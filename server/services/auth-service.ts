import { query } from '../db/connection';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as dbQueries from '../db/queries';

interface JWTPayload {
  playerId: number;
  username: string;
  email: string;
  role: 'player' | 'admin';
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days for players
const ADMIN_JWT_EXPIRY = '1d'; // 1 day for admins

export class AuthService {
  // Hash password using bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateJWT(payload: JWTPayload, isAdmin: boolean = false): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: isAdmin ? ADMIN_JWT_EXPIRY : JWT_EXPIRY
    });
  }

  // Verify and decode JWT token
  static verifyJWT(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Register new player
  static async registerPlayer(username: string, name: string, email: string, password: string) {
    try {
      // Check if username or email already exists
      const existingUser = await dbQueries.getPlayerByUsername(username);
      if (existingUser.rows.length > 0) {
        throw new Error('Username already exists');
      }

      const existingEmail = await dbQueries.getPlayerByEmail(email);
      if (existingEmail.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create player in database
      const result = await dbQueries.createPlayer(username, name, email, passwordHash);

      const player = result.rows[0];

      // Generate JWT token
      const token = this.generateJWT({
        playerId: player.id,
        username: player.username,
        email: player.email,
        role: 'player'
      });

      // Create session in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await dbQueries.createPlayerSession(player.id, token, expiresAt);

      return {
        success: true,
        token,
        player: {
          id: player.id,
          username: player.username,
          name: player.name,
          email: player.email,
          gc_balance: player.gc_balance,
          sc_balance: player.sc_balance,
          status: player.status
        }
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Registration failed');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Login player
  static async loginPlayer(username: string, password: string) {
    try {
      console.log(`[Auth] Attempting login for username: ${username}`);

      // Get player by username
      const result = await dbQueries.getPlayerByUsername(username);

      if (result.rows.length === 0) {
        console.error(`[Auth] Username not found: ${username}`);
        throw new Error('Invalid username or password');
      }

      const player = result.rows[0];
      console.log(`[Auth] Found player: ${player.username} with status: ${player.status}`);

      // Check account status
      if (player.status !== 'Active') {
        console.warn(`[Auth] Player ${username} account status is: ${player.status}`);
        throw new Error('Account is suspended or inactive');
      }

      // Verify password
      if (!player.password_hash) {
        console.error(`[Auth] Player ${username} has no password hash set`);
        throw new Error('Invalid username or password');
      }

      const isValid = await this.verifyPassword(password, player.password_hash);
      console.log(`[Auth] Password verification for ${username}: ${isValid ? 'SUCCESS' : 'FAILED'}`);

      if (!isValid) {
        throw new Error('Invalid username or password');
      }

      // Generate JWT token
      const token = this.generateJWT({
        playerId: player.id,
        username: player.username,
        email: player.email,
        role: 'player'
      });

      // Create session in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await dbQueries.createPlayerSession(player.id, token, expiresAt);

      // Update last login
      await dbQueries.updatePlayerLastLogin(player.id);

      return {
        success: true,
        token,
        player: {
          id: player.id,
          username: player.username,
          name: player.name,
          email: player.email,
          gc_balance: player.gc_balance,
          sc_balance: player.sc_balance,
          status: player.status,
          kyc_level: player.kyc_level,
          kyc_verified: player.kyc_verified
        }
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Login failed');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Login admin
  static async loginAdmin(email: string, password: string) {
    try {
      // Get admin by email
      const result = await query(
        'SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const admin = result.rows[0];

      // Check account status
      if (admin.status !== 'Active') {
        throw new Error('Admin account is inactive');
      }

      // Verify password
      const isValid = await this.verifyPassword(password, admin.password_hash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateJWT({
        playerId: admin.id,
        username: admin.email,
        email: admin.email,
        role: 'admin'
      }, true);

      // Update last login
      await query(
        'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
        [admin.id]
      );

      return {
        success: true,
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Admin login failed');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get player profile
  static async getPlayerProfile(playerId: number) {
    try {
      const result = await dbQueries.getPlayerById(playerId);
      
      if (result.rows.length === 0) {
        return null;
      }

      const player = result.rows[0];
      return {
        id: player.id,
        username: player.username,
        name: player.name,
        email: player.email,
        gc_balance: player.gc_balance,
        sc_balance: player.sc_balance,
        status: player.status,
        kyc_level: player.kyc_level,
        kyc_verified: player.kyc_verified,
        join_date: player.join_date,
        last_login: player.last_login
      };
    } catch (error) {
      throw error;
    }
  }

  // Update player profile
  static async updatePlayerProfile(playerId: number, updates: any) {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }

      if (updates.email) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }

      if (updates.password) {
        const hash = await this.hashPassword(updates.password);
        updateFields.push(`password_hash = $${paramIndex++}`);
        values.push(hash);
      }

      if (updateFields.length === 0) {
        return await this.getPlayerProfile(playerId);
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(playerId);

      await query(
        `UPDATE players SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        values
      );

      return await this.getPlayerProfile(playerId);
    } catch (error) {
      throw error;
    }
  }

  // Logout player (invalidate session)
  static async logoutPlayer(token: string) {
    try {
      // Decode to get expiry
      const decoded = this.verifyJWT(token);
      const expiresAt = decoded && (decoded as any).exp
        ? new Date((decoded as any).exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Add to blacklist
      await query(
        'INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING',
        [token, expiresAt]
      );

      // Also remove from player_sessions
      await query(
        'DELETE FROM player_sessions WHERE token = $1',
        [token]
      );

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
