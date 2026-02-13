import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetWallet, handleUpdateWallet } from "./routes/wallet";
import { handleGetPacks, handlePurchase, handleSquareWebhook } from "./routes/store";
import { handleAdminLogin, handleGetAdminStats } from "./routes/admin";
import { handleSpin } from "./routes/slots";
import { handleGetPokerTables, handleJoinTable } from "./routes/poker";
import { handleGetBingoRooms, handleBuyBingoTicket } from "./routes/bingo";
import { handleGetLiveGames, handlePlaceParlay } from "./routes/sportsbook";
import { AIService } from "./services/ai-service";

export function createServer() {
  const app = express();

  // Start AI processes
  AIService.startAIProcesses();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Wallet routes
  app.get("/api/wallet", handleGetWallet);
  app.post("/api/wallet/update", handleUpdateWallet);

  // Store routes
  app.get("/api/store/packs", handleGetPacks);
  app.post("/api/store/purchase", handlePurchase);
  app.post("/api/store/webhook", handleSquareWebhook);

  // Slots routes
  app.post("/api/slots/spin", handleSpin);

  // Poker routes
  app.get("/api/poker/tables", handleGetPokerTables);
  app.post("/api/poker/join", handleJoinTable);

  // Bingo routes
  app.get("/api/bingo/rooms", handleGetBingoRooms);
  app.post("/api/bingo/buy", handleBuyBingoTicket);

  // Sportsbook routes
  app.get("/api/sportsbook/games", handleGetLiveGames);
  app.post("/api/sportsbook/parlay", handlePlaceParlay);

  // Admin routes
  app.post("/api/admin/login", handleAdminLogin);
  app.get("/api/admin/stats", handleGetAdminStats);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
