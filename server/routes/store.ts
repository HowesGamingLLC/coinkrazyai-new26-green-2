import { RequestHandler } from "express";
import { GCPack } from "@shared/api";

const GC_PACKS: GCPack[] = [
  { id: "pack-1", title: "Starter Pack", price: 4.99, goldCoins: 5000, sweepsCoinsBonus: 5 },
  { id: "pack-2", title: "Pro Pack", price: 9.99, goldCoins: 12000, sweepsCoinsBonus: 12 },
  { id: "pack-3", title: "High Roller Pack", price: 49.99, goldCoins: 65000, sweepsCoinsBonus: 65 },
  { id: "pack-4", title: "Whale Pack", price: 99.99, goldCoins: 150000, sweepsCoinsBonus: 150 },
];

export const handleGetPacks: RequestHandler = (req, res) => {
  res.json({ success: true, data: GC_PACKS });
};

export const handlePurchase: RequestHandler = (req, res) => {
  const { packId } = req.body;
  const pack = GC_PACKS.find(p => p.id === packId);

  if (!pack) {
    return res.status(404).json({ success: false, error: "Pack not found" });
  }

  // Simulate Square checkout session
  const checkoutUrl = `https://square.link/mock-checkout/${packId}`;
  
  res.json({ 
    success: true, 
    data: { 
      checkoutUrl,
      message: "Redirect to Square checkout"
    } 
  });
};

export const handleSquareWebhook: RequestHandler = (req, res) => {
  // In production, verify HMAC signature here
  // For demo, we'll just acknowledge
  console.log("Square Webhook Received:", req.body);
  res.status(200).send("OK");
};
