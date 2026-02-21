import { RequestHandler } from 'express';

export const getStoreConfig: RequestHandler = async (req, res) => {
  try {
    const stripePublicKey = process.env.STRIPE_PUBLIC_KEY || 'pk_live_placeholder';
    const googlePayMerchantId = process.env.GOOGLE_PAY_MERCHANT_ID || 'BCR2DN6T7X7X7X7X';
    
    res.json({
      success: true,
      data: {
        stripePublicKey,
        googlePayMerchantId,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error: any) {
    console.error('Get store config error:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to fetch store config' });
  }
};
