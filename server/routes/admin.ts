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
        { name: "SlotsAI", status: "Active" },
        { name: "JoseyAI", status: "Idle" },
        { name: "SocialAI", status: "Active" },
        { name: "PromotionsAI", status: "Active" }
      ],
      revenueData: [40, 60, 45, 90, 85, 100, 75],
      recentTransactions: [
        { id: 'tx-1', user: 'Sharky99', type: 'Purchase', amount: '$49.99', currency: 'GC', time: '2m ago' },
        { id: 'tx-2', user: 'AceHigh', type: 'Win', amount: '210 SC', currency: 'SC', time: '5m ago' },
        { id: 'tx-3', user: 'Lucky_7', type: 'Bet', amount: '50 SC', currency: 'SC', time: '12m ago' },
      ]
    }
  });
};

export const handleUpdateGameConfig: RequestHandler = (req, res) => {
  const { gameId, config } = req.body;
  console.log(`Updating config for ${gameId}:`, config);
  // In production, save to DB
  res.json({ success: true, message: `${gameId} configuration updated successfully` });
};

export const handleUpdateStorePack: RequestHandler = (req, res) => {
  const { packId, packData } = req.body;
  console.log(`Updating store pack ${packId}:`, packData);
  // In production, save to DB
  res.json({ success: true, message: `Store pack ${packId} updated successfully` });
};

export const handleAssignAIDuty: RequestHandler = (req, res) => {
  const { aiName, duty } = req.body;
  console.log(`Assigning duty to ${aiName}:`, duty);
  res.json({ success: true, message: `${aiName} has been assigned a new duty: ${duty}` });
};
