import { RequestHandler } from 'express';
import { AuthService } from '../services/auth-service';

// User registration
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and username required'
      });
    }

    const user = await AuthService.registerUser(email, password, username);

    res.json({
      success: true,
      data: {
        message: 'Registration successful',
        user
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

// User login
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    const result = await AuthService.loginUser(email, password);

    // Set secure cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
};

// User logout
export const handleLogout: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token;

    if (token) {
      AuthService.logout(token);
    }

    res.clearCookie('auth_token');

    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// Get current user profile
export const handleGetProfile: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const profile = await AuthService.getUserProfile(req.user.userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get profile'
    });
  }
};

// Update user settings
export const handleUpdateSettings: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const updated = await AuthService.updateUserSettings(req.user.userId, req.body);

    res.json({
      success: true,
      data: {
        message: 'Settings updated',
        user: updated
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update settings'
    });
  }
};

// Admin login
export const handleAdminLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    const result = await AuthService.loginAdmin(email, password);

    // Set secure cookie
    res.cookie('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Admin login failed'
    });
  }
};

// Admin logout
export const handleAdminLogout: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.admin_token;

    if (token) {
      AuthService.logout(token);
    }

    res.clearCookie('admin_token');

    res.json({
      success: true,
      data: { message: 'Admin logged out successfully' }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};
