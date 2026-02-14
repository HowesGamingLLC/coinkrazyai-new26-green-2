import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeService {
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    playerId: number,
    metadata: Record<string, string> = {}
  ) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
        metadata: {
          playerId: String(playerId),
          ...metadata,
        },
      });
      return { success: true, clientSecret: intent.client_secret, intentId: intent.id };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      return { success: false, error: String(error) };
    }
  }

  static async retrievePaymentIntent(intentId: string) {
    try {
      const intent = await stripe.paymentIntents.retrieve(intentId);
      return intent;
    } catch (error) {
      console.error('Stripe retrieve intent error:', error);
      throw error;
    }
  }

  static async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return { success: true, refundId: refund.id };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return { success: false, error: String(error) };
    }
  }

  static async createCustomer(email: string, name: string, playerId: number) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { playerId: String(playerId) },
      });
      return { success: true, customerId: customer.id };
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return { success: false, error: String(error) };
    }
  }

  static async createCharge(
    customerId: string,
    amount: number,
    currency: string = 'usd'
  ) {
    try {
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100),
        currency,
        customer: customerId,
      });
      return { success: true, chargeId: charge.id };
    } catch (error) {
      console.error('Stripe charge error:', error);
      return { success: false, error: String(error) };
    }
  }

  static async getBalance() {
    try {
      const balance = await stripe.balance.retrieve();
      return balance;
    } catch (error) {
      console.error('Stripe balance error:', error);
      throw error;
    }
  }

  static async verifyWebhookSignature(body: string, signature: string, secret: string) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
}
