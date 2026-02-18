import { RequestHandler } from 'express';

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = (req as any).user?.playerId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`[AI Chat] Message from user ${userId}: ${message}`);

    // Basic logic for AI responses
    let response = "I'm analyzing the platform data for you. Everything looks optimal!";
    let agent = "LuckyAI";

    const msg = message.toLowerCase();

    if (msg.includes('win') || msg.includes('luck') || msg.includes('odds')) {
      response = "I've just optimized the RNG pathways for your next session. The momentum is in your favor! 🍀";
    } else if (msg.includes('security') || msg.includes('safe') || msg.includes('withdraw')) {
      response = "SecurityAI here. Your funds are protected by our advanced AI security layer. All transactions are monitored for your safety.";
      agent = "SecurityAI";
    } else if (msg.includes('bonus') || msg.includes('free') || msg.includes('promo')) {
      response = "PromotionsAI is currently calculating a custom reward for your account. Keep an eye on your notifications! 🎁";
      agent = "PromotionsAI";
    } else if (msg.includes('game') || msg.includes('slots') || msg.includes('poker')) {
      response = "Our games are running at peak performance. SlotsAI suggests trying Emerald King for its current high volatility! 🎰";
      agent = "SlotsAI";
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      response = "Hello! I'm LuckyAI, your platform assistant. How can I optimize your experience today? 🕶️";
    }

    res.json({
      success: true,
      data: {
        message: response,
        agent,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    res.status(500).json({ error: 'AI Assistant is currently recalibrating. Please try again in a moment.' });
  }
};
