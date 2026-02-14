import { Wallet, Transaction } from "@shared/api";
import { emitWalletUpdate } from "../socket";

// In-memory wallet storage for demo (in production, this would be in a database)
const userWallets: Record<string, Wallet> = {
  'default-user': {
    goldCoins: 10000,
    sweepsCoins: 5000
  }
};

// Transaction history
const transactions: Transaction[] = [];

export class WalletService {
  static getWallet(userId: string = 'default-user'): Wallet {
    if (!userWallets[userId]) {
      userWallets[userId] = { goldCoins: 10000, sweepsCoins: 0 };
    }
    return { ...userWallets[userId] };
  }

  static async updateBalance(
    userId: string = 'default-user',
    currency: 'GC' | 'SC',
    amount: number,
    type: 'bet' | 'win' | 'purchase' | 'bonus' | 'refund' = 'win'
  ): Promise<{ success: boolean; wallet: Wallet; error?: string }> {
    const wallet = userWallets[userId];
    
    if (!wallet) {
      return { success: false, wallet: this.getWallet(userId), error: 'Wallet not found' };
    }

    const currentBalance = currency === 'GC' ? wallet.goldCoins : wallet.sweepsCoins;
    
    // Check if user has enough balance for bets/purchases
    if ((type === 'bet' || type === 'purchase') && currentBalance + amount < 0) {
      return { 
        success: false, 
        wallet: { ...wallet }, 
        error: `Insufficient ${currency === 'GC' ? 'Gold Coins' : 'Sweeps Coins'}` 
      };
    }

    // Update balance
    if (currency === 'GC') {
      wallet.goldCoins += amount;
    } else {
      wallet.sweepsCoins += amount;
    }

    // Record transaction
    transactions.push({
      id: Math.random().toString(36).substring(7),
      type,
      currency,
      amount,
      timestamp: new Date().toISOString()
    });

    // Emit real-time update via Socket.IO
    emitWalletUpdate(userId, { ...wallet });
    
    return { success: true, wallet: { ...wallet } };
  }

  static getTransactions(limit: number = 50): Transaction[] {
    return transactions.slice(-limit).reverse();
  }

  static setWallet(userId: string = 'default-user', wallet: Wallet): void {
    userWallets[userId] = { ...wallet };
    emitWalletUpdate(userId, wallet);
  }
}
