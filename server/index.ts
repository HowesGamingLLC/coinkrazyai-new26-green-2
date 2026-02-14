import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./db/init";
import { handleDemo } from "./routes/demo";
import {
  handleRegister,
  handleLogin,
  handleGetProfile,
  handleUpdateProfile,
  handleLogout,
  handleAdminLogin
} from "./routes/auth";
import { verifyPlayer, verifyAdmin } from "./middleware/auth";
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
  handleCashOut,
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
import {
  handleGetLeaderboard,
  handleGetPlayerRank,
  handleUpdateLeaderboards
} from "./routes/leaderboards";
import {
  handleGetAchievements,
  handleGetPlayerAchievements,
  handleAwardAchievement,
  handleCheckAchievements,
  handleGetAchievementStats
} from "./routes/achievements";
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

  // ===== AUTH ROUTES =====
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/admin/login", handleAdminLogin);
  app.get("/api/auth/profile", verifyPlayer, handleGetProfile);
  app.put("/api/auth/profile", verifyPlayer, handleUpdateProfile);
  app.post("/api/auth/logout", verifyPlayer, handleLogout);

  // ===== WALLET ROUTES =====
  app.get("/api/wallet", verifyPlayer, handleGetWallet);
  app.post("/api/wallet/update", verifyPlayer, handleUpdateWallet);
  app.get("/api/wallet/transactions", verifyPlayer, handleGetTransactions);

  // ===== STORE ROUTES =====
  app.get("/api/store/packs", handleGetPacks);
  app.post("/api/store/purchase", verifyPlayer, handlePurchase);
  app.post("/api/store/webhook", handleSquareWebhook);
  app.get("/api/store/history", verifyPlayer, handleGetPurchaseHistory);
  app.post("/api/store/pack/update", verifyAdmin, handleUpdatePack);
  app.post("/api/store/pack/add", verifyAdmin, handleAddPack);
  app.post("/api/store/pack/delete", verifyAdmin, handleDeletePack);

  // ===== SLOTS ROUTES =====
  app.post("/api/slots/spin", verifyPlayer, handleSpin);
  app.get("/api/slots/config", getSlotsConfig);
  app.post("/api/slots/config/update", verifyAdmin, updateSlotsConfig);

  // ===== POKER ROUTES =====
  app.get("/api/poker/tables", handleGetPokerTables);
  app.post("/api/poker/join", verifyPlayer, handleJoinTable);
  app.post("/api/poker/fold", verifyPlayer, handleFold);
  app.post("/api/poker/cash-out", verifyPlayer, handleCashOut);
  app.get("/api/poker/config", getPokerConfig);
  app.post("/api/poker/config/update", verifyAdmin, updatePokerConfig);

  // ===== BINGO ROUTES =====
  app.get("/api/bingo/rooms", handleGetBingoRooms);
  app.post("/api/bingo/buy", verifyPlayer, handleBuyBingoTicket);
  app.post("/api/bingo/mark", verifyPlayer, handleMarkNumber);
  app.post("/api/bingo/win", verifyPlayer, handleBingoWin);
  app.get("/api/bingo/config", getBingoConfig);
  app.post("/api/bingo/config/update", verifyAdmin, updateBingoConfig);

  // ===== SPORTSBOOK ROUTES =====
  app.get("/api/sportsbook/games", handleGetLiveGames);
  app.post("/api/sportsbook/parlay", verifyPlayer, handlePlaceParlay);
  app.post("/api/sportsbook/bet", verifyPlayer, handleSingleBet);
  app.get("/api/sportsbook/config", getSportsbookConfig);
  app.post("/api/sportsbook/config/update", verifyAdmin, updateSportsbookConfig);

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

  // ===== LEADERBOARD ROUTES =====
  app.get("/api/leaderboards", handleGetLeaderboard);
  app.get("/api/leaderboards/my-rank", verifyPlayer, handleGetPlayerRank);
  app.post("/api/leaderboards/update", verifyAdmin, handleUpdateLeaderboards);

  // ===== ACHIEVEMENTS ROUTES =====
  app.get("/api/achievements", handleGetAchievements);
  app.get("/api/achievements/my-achievements", verifyPlayer, handleGetPlayerAchievements);
  app.post("/api/achievements/award", verifyAdmin, handleAwardAchievement);
  app.post("/api/achievements/check", verifyPlayer, handleCheckAchievements);
  app.get("/api/achievements/stats", handleGetAchievementStats);

  // ===== EXAMPLE ROUTES =====
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
