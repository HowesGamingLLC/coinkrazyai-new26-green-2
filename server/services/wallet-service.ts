import { Wallet } from "@shared/api";
import { emitWalletUpdate } from "../socket";

// In-memory wallet storage for demo
const userWallets: Record<string, Wallet> = {
  'default-user': {
    goldCoins: 10000,
    sweepsCoins: 50.0
  }
};

export class WalletService {
  static getWallet(userId: string): Wallet {
    if (!userWallets[userId]) {
      userWallets[userId] = { goldCoins: 1000, sweepsCoins: 0 };
    }
    return userWallets[userId];
  }

  static async updateBalance(userId: string, currency: 'GC' | 'SC', amount: number): Promise<Wallet> {
    const wallet = this.getWallet(userId);
    
    if (currency === 'GC') {
      wallet.goldCoins += amount;
    } else {
      wallet.sweepsCoins += amount;
    }

    // Emit real-time update via Socket.IO
    emitWalletUpdate(userId, wallet);
    
    return wallet;
  }
}
