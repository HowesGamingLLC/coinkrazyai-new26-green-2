import { RequestHandler } from "express";

const ADMIN_EMAIL = "coinkrazy26@gmail.com";
const ADMIN_PASSWORD = "admin123";

export const handleAdminLogin: RequestHandler = (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // In production, use JWT or sessions. For now, simple success.
    res.json({ 
      success: true, 
      data: { 
        token: "mock-admin-token",
        user: { email: ADMIN_EMAIL, role: 'admin' }
      } 
    });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
};

export const handleGetAdminStats: RequestHandler = (req, res) => {
  // Mock statistics
  res.json({
    success: true,
    data: {
      totalPlayers: 1542,
      activeTables: 8,
      totalGCVolume: 2500000,
      totalSCVolume: 12500,
      systemHealth: "Optimal",
      aiStatus: [
        { name: "LuckyAI", status: "Active" },
        { name: "SecurityAI", status: "Monitoring" },
        { name: "SlotsAI", status: "Active" }
      ]
    }
  });
};
