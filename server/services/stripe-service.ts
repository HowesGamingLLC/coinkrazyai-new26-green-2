import Stripe from 'stripe';
import * as dbQueries from '../db/queries';
import { query } from '../db/connection';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export class StripeService {
  /**
   * Create a Stripe Checkout session for purchasing coins
   */
  static async createCheckoutSession(
    playerId: number,
    packId: number,
    packData: {
      title: string;
      price_usd: number;
      gold_coins: number;
      sweeps_coins: number;
    },
    baseUrl: string
  ) {
    try {
      const player = await dbQueries.getPlayerById(playerId);
      if (player.rows.length === 0) {
        throw new Error('Player not found');
      }

      const playerEmail = player.rows[0].email;
      const playerName = player.rows[0].name;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        client_reference_id: `player_${playerId}`,
        customer_email: playerEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: packData.title,
                description: `${packData.gold_coins} Gold Coins + ${packData.sweeps_coins} Sweeps Coins Bonus`,
                images: ['https://placeholder.com/200x200']
              },
              unit_amount: Math.round(packData.price_usd * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&pack_id=${packId}`,
        cancel_url: `${baseUrl}/store`,
        metadata: {
          playerId: playerId.toString(),
          packId: packId.toString(),
          goldCoins: packData.gold_coins.toString(),
          sweepsCoins: packData.sweeps_coins.toString()
        }
      });

      // Store pending purchase for webhook processing
      await this.recordPendingPurchase(playerId, packId, session.id, packData);

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url
      };
    } catch (error: any) {
      console.error('[Stripe] Create checkout session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create checkout session'
      };
    }
  }

  /**
   * Record a pending purchase before payment is confirmed
   */
  static async recordPendingPurchase(
    playerId: number,
    packId: number,
    sessionId: string,
    packData: { price_usd: number; gold_coins: number; sweeps_coins: number }
  ) {
    try {
      await query(
        `INSERT INTO purchases (player_id, pack_id, amount_usd, gold_coins, sweeps_coins, payment_method, payment_id, status)
         VALUES ($1, $2, $3, $4, $5, 'stripe', $6, 'Pending')`,
        [playerId, packId, packData.price_usd, packData.gold_coins, packData.sweeps_coins, sessionId]
      );
    } catch (error) {
      console.error('[Stripe] Record pending purchase error:', error);
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  static verifyWebhookSignature(body: string, signature: string): any | null {
    try {
      return stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
      console.error('[Stripe] Webhook signature verification failed:', error.message);
      return null;
    }
  }

  /**
   * Handle successful payment from Stripe webhook
   */
  static async handlePaymentSuccess(sessionId: string) {
    try {
      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      const playerId = parseInt(session.client_reference_id?.replace('player_', '') || '0');
      const metadata = session.metadata;

      if (!playerId || !metadata) {
        throw new Error('Invalid session metadata');
      }

      const packId = parseInt(metadata.packId);
      const goldCoins = parseInt(metadata.goldCoins);
      const sweepsCoins = parseInt(metadata.sweepsCoins);

      // Update purchase status to completed
      await query(
        `UPDATE purchases
         SET status = 'Completed',
             stripe_session_id = $1,
             completed_at = NOW()
         WHERE payment_id = $2 AND player_id = $3`,
        [sessionId, sessionId, playerId]
      );

      // Credit player's account
      await dbQueries.recordWalletTransaction(
        playerId,
        'purchase',
        goldCoins,
        sweepsCoins,
        `Coin pack purchase completed`
      );

      return { success: true, playerId, packId };
    } catch (error: any) {
      console.error('[Stripe] Handle payment success error:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure from Stripe webhook
   */
  static async handlePaymentFailure(sessionId: string) {
    try {
      // Update purchase status to failed
      await query(
        `UPDATE purchases
         SET status = 'Failed',
             completed_at = NOW()
         WHERE payment_id = $1`,
        [sessionId]
      );

      return { success: true };
    } catch (error: any) {
      console.error('[Stripe] Handle payment failure error:', error);
      throw error;
    }
  }

  /**
   * Retrieve checkout session details
   */
  static async getSessionStatus(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        success: true,
        status: session.payment_status,
        sessionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0
      };
    } catch (error: any) {
      console.error('[Stripe] Get session status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if in test/demo mode
   */
  static isTestMode(): boolean {
    return STRIPE_SECRET_KEY.includes('test');
  }
}
