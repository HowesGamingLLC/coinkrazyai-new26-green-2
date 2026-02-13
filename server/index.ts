import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetWallet, handleUpdateWallet } from "./routes/wallet";
import { handleGetPacks, handlePurchase, handleSquareWebhook } from "./routes/store";

export function createServer() {
  const app = express();

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

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
