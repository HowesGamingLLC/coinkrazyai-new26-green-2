import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
}

export class StripeService {
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    playerId: number,
    metadata: Record<string, string> = {}
  ) {
    try {
      const stripeClient = getStripe();
      const intent = await stripeClient.paymentIntents.create({
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
      const stripeClient = getStripe();
      const intent = await stripeClient.paymentIntents.retrieve(intentId);
      return intent;
    } catch (error) {
      console.error('Stripe retrieve intent error:', error);
      throw error;
    }
  }

  static async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const stripeClient = getStripe();
      const refund = await stripeClient.refunds.create({
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
      const stripeClient = getStripe();
      const customer = await stripeClient.customers.create({
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
      const stripeClient = getStripe();
      const charge = await stripeClient.charges.create({
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
      const stripeClient = getStripe();
      const balance = await stripeClient.balance.retrieve();
      return balance;
    } catch (error) {
      console.error('Stripe balance error:', error);
      throw error;
    }
  }

  static async verifyWebhookSignature(body: string, signature: string, secret: string) {
    try {
      const stripeClient = getStripe();
      return stripeClient.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
}
