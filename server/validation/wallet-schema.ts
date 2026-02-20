import { z } from 'zod';

export const updateWalletSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01, 'Amount must be positive'),
    currency: z.enum(['GC', 'SC']),
    transaction_type: z.enum(['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'referral', 'achievement', 'purchase', 'redemption']),
    description: z.string().max(255).optional(),
    metadata: z.record(z.any()).optional(),
  })
});
