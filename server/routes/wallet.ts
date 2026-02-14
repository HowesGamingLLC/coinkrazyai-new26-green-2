import { RequestHandler } from "express";
import { WalletService } from "../services/wallet-service";

const DEFAULT_USER = 'default-user';

export const handleGetWallet: RequestHandler = (req, res) => {
  try {
    const wallet = WalletService.getWallet(DEFAULT_USER);
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get wallet' });
  }
};

export const handleUpdateWallet: RequestHandler = async (req, res) => {
  try {
    const { currency, amount, type = 'win' } = req.body;

    if (!currency || amount === undefined) {
      return res.status(400).json({ success: false, error: 'Missing currency or amount' });
    }

    const result = await WalletService.updateBalance(DEFAULT_USER, currency, amount, type);
    
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, data: result.wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update wallet' });
  }
};

export const handleGetTransactions: RequestHandler = (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const transactions = WalletService.getTransactions(limit);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get transactions' });
  }
};
