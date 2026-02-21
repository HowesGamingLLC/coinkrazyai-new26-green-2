import { RequestHandler } from 'express';
import { query } from '../db/connection';

export const listPlayerTickets: RequestHandler = async (req, res) => {
  try {
    const playerId = req.user?.id;
    if (!playerId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await query(
      `SELECT * FROM support_tickets 
       WHERE player_id = $1 
       ORDER BY created_at DESC`,
      [playerId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('List player tickets error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
  }
};

export const createPlayerTicket: RequestHandler = async (req, res) => {
  try {
    const playerId = req.user?.id;
    const { subject, message, category, priority } = req.body;

    if (!playerId) return res.status(401).json({ error: 'Unauthorized' });
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Start a transaction
    await query('BEGIN');

    try {
      // Create ticket
      const ticketResult = await query(
        `INSERT INTO support_tickets (player_id, subject, description, category, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [playerId, subject, message, category || 'General', priority || 'Low', 'Open']
      );

      const ticketId = ticketResult.rows[0].id;

      // Create initial message
      await query(
        `INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_type, message)
         VALUES ($1, $2, $3, $4)`,
        [ticketId, playerId, 'player', message]
      );

      await query('COMMIT');
      res.json({ success: true, data: ticketResult.rows[0] });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (error: any) {
    console.error('Create player ticket error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to create ticket' });
  }
};

export const getTicketDetails: RequestHandler = async (req, res) => {
  try {
    const playerId = req.user?.id;
    const { ticketId } = req.params;

    if (!playerId) return res.status(401).json({ error: 'Unauthorized' });

    const ticketResult = await query(
      'SELECT * FROM support_tickets WHERE id = $1 AND player_id = $2',
      [ticketId, playerId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const messagesResult = await query(
      'SELECT * FROM support_ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticketId]
    );

    res.json({
      success: true,
      data: {
        ...ticketResult.rows[0],
        messages: messagesResult.rows
      }
    });
  } catch (error: any) {
    console.error('Get ticket details error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket details' });
  }
};

export const addTicketMessage: RequestHandler = async (req, res) => {
  try {
    const playerId = req.user?.id;
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!playerId) return res.status(401).json({ error: 'Unauthorized' });
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Verify ownership
    const ticketCheck = await query(
      'SELECT status FROM support_tickets WHERE id = $1 AND player_id = $2',
      [ticketId, playerId]
    );

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticketCheck.rows[0].status === 'Closed') {
      return res.status(400).json({ error: 'Cannot reply to a closed ticket' });
    }

    const result = await query(
      `INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_type, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticketId, playerId, 'player', message]
    );

    // Update last_message_at and status if it was resolved
    await query(
      `UPDATE support_tickets 
       SET last_message_at = CURRENT_TIMESTAMP, 
           status = CASE WHEN status = 'Resolved' THEN 'Open' ELSE status END,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [ticketId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Add ticket message error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to add message' });
  }
};
