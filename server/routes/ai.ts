import { RequestHandler } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dbQueries from "../db/queries";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = (req as any).user?.playerId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn('[AI Chat] Gemini API Key missing, falling back to rule-based responses');
      return fallbackResponse(message, res);
    }

    console.log(`[AI Chat] Message from user ${userId}: ${message}`);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are LuckyAI, the advanced platform assistant for CoinKrazy, a premier sweepstakes and social casino platform.
      Your goal is to assist players with platform questions, optimize their experience, and maintain a high-energy, positive atmosphere.

      Platform Context:
      - Name: CoinKrazy
      - Currency: Gold Coins (GC) for fun, Sweeps Coins (SC) for promotional play.
      - Key Features: Slots, Live Casino, Poker, Bingo, Sportsbook, Sweepstakes, Social Store.
      - Core AI Agents:
        - LuckyAI (General Assistant - that's you!)
        - SecurityAI (Handles security and transaction safety)
        - PromotionsAI (Calculates and offers custom bonuses)
        - SlotsAI (Optimizes game performance and RTP)

      User Message: "${message}"

      Response Guidelines:
      - Be helpful, enthusiastic, and professional.
      - Use emojis where appropriate (🍀, 🎰, 💎, 🕶️).
      - If the message is about winning or luck, you can mention that you've "optimized the RNG pathways" as a playful way to encourage them.
      - If it's about security or withdrawals, refer to yourself or SecurityAI.
      - Keep responses relatively concise but thorough.

      Respond as LuckyAI:
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      success: true,
      data: {
        message: responseText,
        agent: "LuckyAI",
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    res.status(500).json({ error: 'AI Assistant is currently recalibrating. Please try again in a moment.' });
  }
};

export const handleGetAIStatus: RequestHandler = async (req, res) => {
  try {
    const result = await dbQueries.getAIEmployees();
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to get AI employees:', error);
    res.status(500).json({ success: false, error: 'Failed to get AI status' });
  }
};

function fallbackResponse(message: string, res: any) {
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

    return res.json({
      success: true,
      data: {
        message: response,
        agent,
        timestamp: new Date()
      }
    });
}
