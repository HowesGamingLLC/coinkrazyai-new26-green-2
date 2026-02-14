import { RequestHandler } from "express";
import { GCPack } from "@shared/api";
import { WalletService } from "../services/wallet-service";

const DEFAULT_USER = 'default-user';

let GC_PACKS: GCPack[] = [
  { id: "pack-1", title: "Starter Pack", price: 4.99, goldCoins: 5000, sweepsCoinsBonus: 5 },
  { id: "pack-2", title: "Pro Pack", price: 9.99, goldCoins: 12000, sweepsCoinsBonus: 12 },
  { id: "pack-3", title: "High Roller Pack", price: 49.99, goldCoins: 65000, sweepsCoinsBonus: 65 },
  { id: "pack-4", title: "Whale Pack", price: 99.99, goldCoins: 150000, sweepsCoinsBonus: 150 },
];

// Simulate purchased packs (for admin analytics)
let purchaseHistory: Array<{
  id: string;
  packId: string;
  userId: string;
  amount: number;
  timestamp: string;
}> = [];

export const handleGetPacks: RequestHandler = (req, res) => {
  try {
    res.json({ success: true, data: GC_PACKS });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get packs' });
  }
};

export const handlePurchase: RequestHandler = async (req, res) => {
  try {
    const { packId, method = 'square' } = req.body;
    const pack = GC_PACKS.find(p => p.id === packId);

    if (!pack) {
      return res.status(404).json({ success: false, error: "Pack not found" });
    }

    // For demo purposes, we'll simulate the purchase directly
    // In a real system, you'd redirect to Square/Stripe checkout
    
    // Add coins to wallet
    const gcResult = await WalletService.updateBalance(DEFAULT_USER, 'GC', pack.goldCoins, 'purchase');
    if (!gcResult.success) {
      return res.status(400).json({ success: false, error: gcResult.error });
    }

    // Add bonus SC
    const scResult = await WalletService.updateBalance(DEFAULT_USER, 'SC', pack.sweepsCoinsBonus, 'bonus');

    // Record purchase
    purchaseHistory.push({
      id: Math.random().toString(36).substring(7),
      packId,
      userId: DEFAULT_USER,
      amount: pack.price,
      timestamp: new Date().toISOString()
    });

    // For demo, we can return the wallet directly
    // In production, you'd return a checkout URL
    res.json({ 
      success: true, 
      data: { 
        message: `Successfully purchased ${pack.title}!`,
        pack,
        wallet: scResult.wallet || gcResult.wallet,
        // Uncomment for real checkout:
        // checkoutUrl: `https://square.link/pay/${packId}-${Date.now()}`,
      } 
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ success: false, error: 'Failed to process purchase' });
  }
};

export const handleGetPurchaseHistory: RequestHandler = (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const history = purchaseHistory.slice(-limit).reverse();
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get purchase history' });
  }
};

export const handleSquareWebhook: RequestHandler = (req, res) => {
  try {
    // In production, verify HMAC signature here
    // For demo, we'll just acknowledge
    console.log("Square Webhook Received:", req.body);
    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
};

export const handleUpdatePack: RequestHandler = (req, res) => {
  try {
    const { packId, title, price, goldCoins, sweepsCoinsBonus } = req.body;
    
    const pack = GC_PACKS.find(p => p.id === packId);
    if (!pack) {
      return res.status(404).json({ success: false, error: "Pack not found" });
    }

    if (title !== undefined) pack.title = title;
    if (price !== undefined) pack.price = price;
    if (goldCoins !== undefined) pack.goldCoins = goldCoins;
    if (sweepsCoinsBonus !== undefined) pack.sweepsCoinsBonus = sweepsCoinsBonus;

    res.json({ success: true, data: { message: "Pack updated successfully", pack } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update pack' });
  }
};

export const handleAddPack: RequestHandler = (req, res) => {
  try {
    const { title, price, goldCoins, sweepsCoinsBonus } = req.body;
    
    if (!title || !price || !goldCoins) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const newPack: GCPack = {
      id: `pack-${Date.now()}`,
      title,
      price,
      goldCoins,
      sweepsCoinsBonus: sweepsCoinsBonus || 0
    };

    GC_PACKS.push(newPack);
    res.json({ success: true, data: { message: "Pack added successfully", pack: newPack } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add pack' });
  }
};

export const handleDeletePack: RequestHandler = (req, res) => {
  try {
    const { packId } = req.body;
    
    const index = GC_PACKS.findIndex(p => p.id === packId);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Pack not found" });
    }

    const deletedPack = GC_PACKS[index];
    GC_PACKS.splice(index, 1);
    
    res.json({ success: true, data: { message: "Pack deleted successfully", pack: deletedPack } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete pack' });
  }
};
