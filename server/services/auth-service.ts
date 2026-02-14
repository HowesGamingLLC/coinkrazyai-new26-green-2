import { query } from '../db/connection';
import crypto from 'crypto';

interface Session {
  userId: number;
  email: string;
  role: 'user' | 'admin';
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const sessions = new Map<string, Session>();

export class AuthService {
  // Hash password (basic - in production use bcrypt)
  static hashPassword(password: string): string {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }

  // Generate session token
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Register new user
  static async registerUser(email: string, password: string, username: string) {
    try {
      const hashedPassword = this.hashPassword(password);
      const result = await query(
        `INSERT INTO players (username, email, password, gc_balance, sc_balance, kyc_level, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, email, username`,
        [username, email, hashedPassword, 10000, 100, 'Basic', 'Active']
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  // Login user
  static async loginUser(email: string, password: string) {
    try {
      const hashedPassword = this.hashPassword(password);
      const result = await query(
        `SELECT id, email, username, gc_balance, sc_balance, status FROM players
         WHERE email = $1 AND password = $2`,
        [email, hashedPassword]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];
      if (user.status !== 'Active') {
        throw new Error('Account is not active');
      }

      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 day session

      const session: Session = {
        userId: user.id,
        email: user.email,
        role: 'user',
        token,
        createdAt: new Date(),
        expiresAt
      };

      sessions.set(token, session);

      // Update last login
      await query(
        `UPDATE players SET last_login = NOW() WHERE id = $1`,
        [user.id]
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          gcBalance: user.gc_balance,
          scBalance: user.sc_balance
        },
        expiresAt
      };
    } catch (error) {
      throw error;
    }
  }

  // Login admin
  static async loginAdmin(email: string, password: string) {
    try {
      const hashedPassword = this.hashPassword(password);
      const result = await query(
        `SELECT id, email, username, role, status FROM admin_users
         WHERE email = $1 AND password = $2`,
        [email, hashedPassword]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const admin = result.rows[0];
      if (admin.status !== 'Active') {
        throw new Error('Admin account is not active');
      }

      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // 1 day session

      const session: Session = {
        userId: admin.id,
        email: admin.email,
        role: 'admin',
        token,
        createdAt: new Date(),
        expiresAt
      };

      sessions.set(token, session);

      // Update last login
      await query(
        `UPDATE admin_users SET last_login = NOW() WHERE id = $1`,
        [admin.id]
      );

      return {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          role: admin.role
        },
        expiresAt
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify session token
  static verifyToken(token: string): Session | null {
    const session = sessions.get(token);
    if (!session) {
      return null;
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      sessions.delete(token);
      return null;
    }

    return session;
  }

  // Logout user
  static logout(token: string) {
    sessions.delete(token);
  }

  // Get user profile
  static async getUserProfile(userId: number) {
    try {
      const result = await query(
        `SELECT id, username, email, gc_balance, sc_balance, kyc_level, status, 
                created_at, last_login, total_wins, total_losses, vip_level
         FROM players WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update user settings
  static async updateUserSettings(userId: number, settings: any) {
    try {
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (settings.password) {
        updates.push(`password = $${paramIndex++}`);
        params.push(this.hashPassword(settings.password));
      }

      if (settings.email) {
        updates.push(`email = $${paramIndex++}`);
        params.push(settings.email);
      }

      if (!updates.length) {
        return await this.getUserProfile(userId);
      }

      updates.push(`updated_at = NOW()`);
      params.push(userId);

      await query(
        `UPDATE players SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
      );

      return await this.getUserProfile(userId);
    } catch (error) {
      throw error;
    }
  }
}
