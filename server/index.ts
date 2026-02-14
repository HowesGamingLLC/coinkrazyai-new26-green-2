import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./db/init";
import { handleDemo } from "./routes/demo";
import { handleGetWallet, handleUpdateWallet, handleGetTransactions } from "./routes/wallet";
import { 
  handleGetPacks, 
  handlePurchase, 
  handleSquareWebhook, 
  handleGetPurchaseHistory,
  handleUpdatePack,
  handleAddPack,
  handleDeletePack
} from "./routes/store";
import { 
  handleAdminLogin, 
  handleGetAdminStats, 
  handleUpdateGameConfig,
  handleUpdateStorePack, 
  handleAssignAIDuty,
  handleGetGameConfig,
  handleGetAIEmployees,
  handleUpdateAIStatus,
  handleGetStorePacks,
  handleSetMaintenanceMode,
  handleGetSystemHealth,
  handleLogout
} from "./routes/admin";
import { handleSpin, handleGetConfig as getSlotsConfig, handleUpdateConfig as updateSlotsConfig } from "./routes/slots";
import { 
  handleGetPokerTables, 
  handleJoinTable,
  handleFold,
  handleGetConfig as getPokerConfig,
  handleUpdateConfig as updatePokerConfig
} from "./routes/poker";
import { 
  handleGetBingoRooms, 
  handleBuyBingoTicket,
  handleMarkNumber,
  handleBingoWin,
  handleGetConfig as getBingoConfig,
  handleUpdateConfig as updateBingoConfig
} from "./routes/bingo";
import {
  handleGetLiveGames,
  handlePlaceParlay,
  handleSingleBet,
  handleGetConfig as getSportsbookConfig,
  handleUpdateConfig as updateSportsbookConfig
} from "./routes/sportsbook";
import * as adminDb from "./routes/admin-db";
import { AIService } from "./services/ai-service";

export function createServer() {
  const app = express();

  // Initialize database
  initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    // Continue anyway, some features will fail but the app will still run
  });

  // Start AI processes
  AIService.startAIProcesses();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ===== WALLET ROUTES =====
  app.get("/api/wallet", handleGetWallet);
  app.post("/api/wallet/update", handleUpdateWallet);
  app.get("/api/wallet/transactions", handleGetTransactions);

  // ===== STORE ROUTES =====
  app.get("/api/store/packs", handleGetPacks);
  app.post("/api/store/purchase", handlePurchase);
  app.post("/api/store/webhook", handleSquareWebhook);
  app.get("/api/store/history", handleGetPurchaseHistory);
  app.post("/api/store/pack/update", handleUpdatePack);
  app.post("/api/store/pack/add", handleAddPack);
  app.post("/api/store/pack/delete", handleDeletePack);

  // ===== SLOTS ROUTES =====
  app.post("/api/slots/spin", handleSpin);
  app.get("/api/slots/config", getSlotsConfig);
  app.post("/api/slots/config/update", updateSlotsConfig);

  // ===== POKER ROUTES =====
  app.get("/api/poker/tables", handleGetPokerTables);
  app.post("/api/poker/join", handleJoinTable);
  app.post("/api/poker/fold", handleFold);
  app.get("/api/poker/config", getPokerConfig);
  app.post("/api/poker/config/update", updatePokerConfig);

  // ===== BINGO ROUTES =====
  app.get("/api/bingo/rooms", handleGetBingoRooms);
  app.post("/api/bingo/buy", handleBuyBingoTicket);
  app.post("/api/bingo/mark", handleMarkNumber);
  app.post("/api/bingo/win", handleBingoWin);
  app.get("/api/bingo/config", getBingoConfig);
  app.post("/api/bingo/config/update", updateBingoConfig);

  // ===== SPORTSBOOK ROUTES =====
  app.get("/api/sportsbook/games", handleGetLiveGames);
  app.post("/api/sportsbook/parlay", handlePlaceParlay);
  app.post("/api/sportsbook/bet", handleSingleBet);
  app.get("/api/sportsbook/config", getSportsbookConfig);
  app.post("/api/sportsbook/config/update", updateSportsbookConfig);

  // ===== ADMIN ROUTES =====
  app.post("/api/admin/login", handleAdminLogin);
  app.get("/api/admin/stats", handleGetAdminStats);
  app.get("/api/admin/game-config", handleGetGameConfig);
  app.post("/api/admin/game-config", handleUpdateGameConfig);
  app.get("/api/admin/ai-employees", handleGetAIEmployees);
  app.post("/api/admin/ai-duty", handleAssignAIDuty);
  app.post("/api/admin/ai-status", handleUpdateAIStatus);
  app.get("/api/admin/store-packs", handleGetStorePacks);
  app.post("/api/admin/store-pack", handleUpdateStorePack);
  app.post("/api/admin/maintenance", handleSetMaintenanceMode);
  app.get("/api/admin/health", handleGetSystemHealth);
  app.post("/api/admin/logout", handleLogout);

  // ===== DATABASE-DRIVEN ADMIN ROUTES =====
  // Dashboard
  app.get("/api/admin/dashboard/stats", adminDb.getAdminDashboardStats);

  // Players
  app.get("/api/admin/players", adminDb.getPlayersList);
  app.get("/api/admin/players/:id", adminDb.getPlayer);
  app.post("/api/admin/players/balance", adminDb.updatePlayerBalance);
  app.post("/api/admin/players/status", adminDb.updatePlayerStatus);

  // Games
  app.get("/api/admin/games", adminDb.getGamesList);
  app.post("/api/admin/games/rtp", adminDb.updateGameRTP);
  app.post("/api/admin/games/toggle", adminDb.toggleGame);

  // Bonuses
  app.get("/api/admin/bonuses", adminDb.getBonusesList);
  app.post("/api/admin/bonuses/create", adminDb.createBonus);

  // Transactions
  app.get("/api/admin/transactions", adminDb.getTransactionsList);

  // Security
  app.get("/api/admin/alerts", adminDb.getSecurityAlerts);

  // KYC
  app.get("/api/admin/kyc/:playerId", adminDb.getKYCDocs);
  app.post("/api/admin/kyc/approve", adminDb.approveKYC);

  // Poker
  app.get("/api/admin/poker/tables", adminDb.getPokerTablesList);

  // Bingo
  app.get("/api/admin/bingo/games", adminDb.getBingoGamesList);

  // Sports
  app.get("/api/admin/sports/events", adminDb.getSportsEventsList);

  // ===== EXAMPLE ROUTES =====
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
