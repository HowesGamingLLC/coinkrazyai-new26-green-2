import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./db/init";
import { verifyUser, verifyAdmin } from "./middleware/auth";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetProfile,
  handleUpdateSettings,
  handleAdminLogin,
  handleAdminLogout
} from "./routes/auth";
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
  handleGetAdminStats,
  handleUpdateGameConfig,
  handleUpdateStorePack,
  handleAssignAIDuty,
  handleGetGameConfig,
  handleGetAIEmployees,
  handleUpdateAIStatus,
  handleGetStorePacks,
  handleSetMaintenanceMode,
  handleGetSystemHealth
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
  app.use(cookieParser());

  // ===== AUTHENTICATION ROUTES =====
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/user/profile", verifyUser, handleGetProfile);
  app.post("/api/user/settings", verifyUser, handleUpdateSettings);
  app.post("/api/admin/login", handleAdminLogin);
  app.post("/api/admin/logout", verifyAdmin, handleAdminLogout);

  // ===== WALLET ROUTES =====
  app.get("/api/wallet", verifyUser, handleGetWallet);
  app.post("/api/wallet/update", verifyUser, handleUpdateWallet);
  app.get("/api/wallet/transactions", verifyUser, handleGetTransactions);

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
  app.get("/api/admin/stats", verifyAdmin, handleGetAdminStats);
  app.get("/api/admin/game-config", verifyAdmin, handleGetGameConfig);
  app.post("/api/admin/game-config", verifyAdmin, handleUpdateGameConfig);
  app.get("/api/admin/ai-employees", verifyAdmin, handleGetAIEmployees);
  app.post("/api/admin/ai-duty", verifyAdmin, handleAssignAIDuty);
  app.post("/api/admin/ai-status", verifyAdmin, handleUpdateAIStatus);
  app.get("/api/admin/store-packs", verifyAdmin, handleGetStorePacks);
  app.post("/api/admin/store-pack", verifyAdmin, handleUpdateStorePack);
  app.post("/api/admin/maintenance", verifyAdmin, handleSetMaintenanceMode);
  app.get("/api/admin/health", verifyAdmin, handleGetSystemHealth);
  app.post("/api/admin/logout", verifyAdmin, handleAdminLogout);

  // ===== DATABASE-DRIVEN ADMIN ROUTES =====
  // Dashboard
  app.get("/api/admin/dashboard/stats", verifyAdmin, adminDb.getAdminDashboardStats);

  // Players
  app.get("/api/admin/players", verifyAdmin, adminDb.getPlayersList);
  app.get("/api/admin/players/:id", verifyAdmin, adminDb.getPlayer);
  app.post("/api/admin/players/balance", verifyAdmin, adminDb.updatePlayerBalance);
  app.post("/api/admin/players/status", verifyAdmin, adminDb.updatePlayerStatus);

  // Games
  app.get("/api/admin/games", verifyAdmin, adminDb.getGamesList);
  app.post("/api/admin/games/rtp", verifyAdmin, adminDb.updateGameRTP);
  app.post("/api/admin/games/toggle", verifyAdmin, adminDb.toggleGame);

  // Bonuses
  app.get("/api/admin/bonuses", verifyAdmin, adminDb.getBonusesList);
  app.post("/api/admin/bonuses/create", verifyAdmin, adminDb.createBonus);

  // Transactions
  app.get("/api/admin/transactions", verifyAdmin, adminDb.getTransactionsList);

  // Security
  app.get("/api/admin/alerts", verifyAdmin, adminDb.getSecurityAlerts);

  // KYC
  app.get("/api/admin/kyc/:playerId", verifyAdmin, adminDb.getKYCDocs);
  app.post("/api/admin/kyc/approve", verifyAdmin, adminDb.approveKYC);

  // Poker
  app.get("/api/admin/poker/tables", verifyAdmin, adminDb.getPokerTablesList);

  // Bingo
  app.get("/api/admin/bingo/games", verifyAdmin, adminDb.getBingoGamesList);

  // Sports
  app.get("/api/admin/sports/events", verifyAdmin, adminDb.getSportsEventsList);

  // ===== EXAMPLE ROUTES =====
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
