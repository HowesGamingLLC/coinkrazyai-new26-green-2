import { RequestHandler } from "express";
import { Wallet, Transaction } from "@shared/api";

// Simple in-memory state for demo purposes
// In production, this would be in a database (Sequelize/TypeORM as requested)
let walletState: Wallet = {
  goldCoins: 10000,
  sweepsCoins: 5.0
};

const transactions: Transaction[] = [];

export const handleGetWallet: RequestHandler = (req, res) => {
  res.json({ success: true, data: walletState });
};

export const handleUpdateWallet: RequestHandler = (req, res) => {
  const { goldCoins, sweepsCoins, type, amount, currency } = req.body;
  
  if (goldCoins !== undefined) walletState.goldCoins = goldCoins;
  if (sweepsCoins !== undefined) walletState.sweepsCoins = sweepsCoins;

  if (type && amount && currency) {
    transactions.push({
      id: Math.random().toString(36).substring(7),
      type,
      currency,
      amount,
      timestamp: new Date().toISOString()
    });
  }

  res.json({ success: true, data: walletState });
};
