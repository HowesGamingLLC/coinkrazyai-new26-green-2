import { RequestHandler } from 'express';
import { db } from '../db/connection';

interface AdminNotificationRequest {
  ai_employee_id: string;
  message_type: string;
  subject: string;
  message: string;
  related_player_id?: number;
  related_game_id?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationActionRequest {
  action_type: 'approve' | 'deny' | 'assign' | 'answer' | 'resolve';
  action_data?: Record<string, any>;
}

/**
 * Create a new admin notification (from AI)
 */
export const handleCreateAdminNotification: RequestHandler = async (req, res) => {
  const { ai_employee_id, message_type, subject, message, related_player_id, related_game_id, priority } = req.body as AdminNotificationRequest;

  if (!ai_employee_id || !message_type || !subject || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // Get first admin user (or specify admin_id in request)
    const adminResult = await db.query(
      `SELECT id FROM admin_users WHERE role = 'admin' LIMIT 1`
    );

    const admin_id = adminResult.rows.length > 0 ? adminResult.rows[0].id : null;

    const result = await db.query(
      `INSERT INTO admin_notifications 
       (admin_id, ai_employee_id, message_type, subject, message, related_player_id, related_game_id, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [admin_id, ai_employee_id, message_type, subject, message, related_player_id || null, related_game_id || null, priority || 'medium']
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get admin notifications
 */
export const handleGetAdminNotifications: RequestHandler = async (req, res) => {
  const adminId = (req as any).adminId;
  const { status = 'pending', limit = '50', offset = '0' } = req.query;

  if (!adminId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const query = `
      SELECT 
        an.*,
        p.username as player_username,
        g.name as game_name
      FROM admin_notifications an
      LEFT JOIN players p ON an.related_player_id = p.id
      LEFT JOIN games g ON an.related_game_id = g.id
      WHERE (an.admin_id = $1 OR an.admin_id IS NULL)
      ${status !== 'all' ? `AND an.status = $2` : ''}
      ORDER BY an.created_at DESC
      LIMIT $${status !== 'all' ? '3' : '2'} OFFSET $${status !== 'all' ? '4' : '3'}
    `;

    const params: any[] = [adminId];
    if (status !== 'all') params.push(status);
    params.push(limit);
    params.push(offset);

    const result = await db.query(query, params);

    const totalResult = await db.query(
      `SELECT COUNT(*) FROM admin_notifications WHERE admin_id = $1 ${status !== 'all' ? 'AND status = $2' : ''}`,
      status !== 'all' ? [adminId, status] : [adminId]
    );

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(totalResult.rows[0].count),
    });
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Mark notification as read
 */
export const handleMarkNotificationAsRead: RequestHandler = async (req, res) => {
  const adminId = (req as any).adminId;
  const { notificationId } = req.params;

  if (!adminId || !notificationId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      `UPDATE admin_notifications 
       SET read_at = NOW()
       WHERE id = $1 AND (admin_id = $2 OR admin_id IS NULL)
       RETURNING *`,
      [notificationId, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Take action on notification
 */
export const handleTakeNotificationAction: RequestHandler = async (req, res) => {
  const adminId = (req as any).adminId;
  const { notificationId } = req.params;
  const { action_type, action_data } = req.body as NotificationActionRequest;

  if (!adminId || !notificationId || !action_type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // Get notification
    const notifResult = await db.query(
      `SELECT * FROM admin_notifications WHERE id = $1`,
      [notificationId]
    );

    if (notifResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    const notification = notifResult.rows[0];

    // Determine new status based on action
    let newStatus = notification.status;
    if (action_type === 'approve') {
      newStatus = 'approved';
    } else if (action_type === 'deny') {
      newStatus = 'denied';
    } else if (action_type === 'assign' || action_type === 'answer') {
      newStatus = 'in_progress';
    } else if (action_type === 'resolve') {
      newStatus = 'completed';
    }

    // Update notification status
    await db.query(
      `UPDATE admin_notifications 
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [newStatus, notificationId]
    );

    // Record the action
    const actionResult = await db.query(
      `INSERT INTO notification_actions (notification_id, action_type, action_data, taken_by_admin_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [notificationId, action_type, JSON.stringify(action_data || {}), adminId]
    );

    res.json({
      success: true,
      data: {
        action: actionResult.rows[0],
        new_status: newStatus,
      },
    });
  } catch (error: any) {
    console.error('Failed to take action:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get notification actions history
 */
export const handleGetNotificationActions: RequestHandler = async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ success: false, error: 'Missing notification ID' });
  }

  try {
    const result = await db.query(
      `SELECT 
        na.*,
        au.name as admin_name, au.email as admin_email
       FROM notification_actions na
       LEFT JOIN admin_users au ON na.taken_by_admin_id = au.id
       WHERE na.notification_id = $1
       ORDER BY na.created_at DESC`,
      [notificationId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Failed to fetch notification actions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Send message to admin
 */
export const handleSendAdminMessage: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { message, subject = 'Player Message' } = req.body;

  if (!playerId || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
      `INSERT INTO user_messages (sender_id, subject, message, message_type)
       VALUES ($1, $2, $3, 'support')
       RETURNING *`,
      [playerId, subject, message]
    );

    // Create notification for admin
    await db.query(
      `INSERT INTO admin_notifications 
       (ai_employee_id, message_type, subject, message, related_player_id, priority, status)
       VALUES ('System', 'message', $1, $2, $3, 'medium', 'pending')`,
      [subject, message, playerId]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to send message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get player messages
 */
export const handleGetPlayerMessages: RequestHandler = async (req, res) => {
  const playerId = (req as any).playerId;
  const { unread_only = 'false' } = req.query;

  if (!playerId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    let query = `
      SELECT * FROM user_messages 
      WHERE recipient_id = $1 OR sender_id = $1
    `;

    const params: any[] = [playerId];

    if (unread_only === 'true') {
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
