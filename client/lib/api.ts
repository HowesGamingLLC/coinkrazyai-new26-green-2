import { PlayerProfile, AuthResponse, StorePack, Wallet, Transaction, GameInfo, PokerTable, BingoGame, SportsEvent, Achievement, LeaderboardEntry, AIEmployee } from '@shared/api';

const API_BASE = '/api';

// Helper function to make API calls (player)
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Helper function for admin API calls
async function adminApiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('admin_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// ===== AUTHENTICATION =====
export const auth = {
  register: async (username: string, name: string, email: string, password: string) => {
    const data = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, name, email, password }),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  login: async (username: string, password: string) => {
    const data = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  adminLogin: async (email: string, password: string) => {
    const data = await apiCall<any>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_token');
    return { success: true };
  },

  getProfile: async () => {
    return apiCall<{ success: boolean; data: PlayerProfile }>('/auth/profile');
  },

  updateProfile: async (updates: Partial<PlayerProfile>) => {
    return apiCall<{ success: boolean; data: PlayerProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ===== WALLET =====
export const wallet = {
  getBalance: async () => {
    return apiCall<{ success: boolean; data: Wallet }>('/wallet');
  },

  getTransactions: async () => {
    return apiCall<{ success: boolean; data: Transaction[] }>('/wallet/transactions');
  },

  updateBalance: async (gcAmount: number, scAmount: number) => {
    return apiCall<{ success: boolean }>('/wallet/update', {
      method: 'POST',
      body: JSON.stringify({ gc_amount: gcAmount, sc_amount: scAmount }),
    });
  },
};

// ===== STORE =====
export const store = {
  getPacks: async () => {
    return apiCall<{ success: boolean; data: StorePack[] }>('/store/packs');
  },

  purchase: async (packId: number, paymentMethod: string, paymentToken?: string) => {
    return apiCall<{ success: boolean; data: any }>('/store/purchase', {
      method: 'POST',
      body: JSON.stringify({ pack_id: packId, payment_method: paymentMethod, payment_token: paymentToken }),
    });
  },

  getPurchaseHistory: async () => {
    return apiCall<{ success: boolean; data: any[] }>('/store/history');
  },
};

// ===== GAMES =====
export const games = {
  getGames: async () => {
    return apiCall<{ success: boolean; data: GameInfo[] }>('/games');
  },

  getGameById: async (id: number) => {
    return apiCall<{ success: boolean; data: GameInfo }>(`/games/${id}`);
  },
};

// ===== SLOTS =====
export const slots = {
  spin: async (gameId: number, betAmount: number) => {
    return apiCall<any>('/slots/spin', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, bet_amount: betAmount }),
    });
  },

  getConfig: async () => {
    return apiCall<any>('/slots/config');
  },

  updateConfig: async (config: any) => {
    return apiCall<any>('/slots/config/update', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ===== POKER =====
export const poker = {
  getTables: async () => {
    return apiCall<{ success: boolean; data: PokerTable[] }>('/poker/tables');
  },

  joinTable: async (tableId: number, buyIn: number) => {
    return apiCall<{ success: boolean; data: any }>('/poker/join', {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId, buy_in: buyIn }),
    });
  },

  fold: async (sessionId: number) => {
    return apiCall<{ success: boolean }>('/poker/fold', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  cashOut: async (sessionId: number) => {
    return apiCall<{ success: boolean; data: any }>('/poker/cash-out', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  getConfig: async () => {
    return apiCall<any>('/poker/config');
  },

  updateConfig: async (config: any) => {
    return apiCall<any>('/poker/config/update', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ===== BINGO =====
export const bingo = {
  getRooms: async () => {
    return apiCall<{ success: boolean; data: BingoGame[] }>('/bingo/rooms');
  },

  buyTicket: async (gameId: number) => {
    return apiCall<{ success: boolean; data: any }>('/bingo/buy', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId }),
    });
  },

  markNumber: async (ticketId: number, number: number) => {
    return apiCall<{ success: boolean }>('/bingo/mark', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId, number }),
    });
  },

  win: async (ticketId: number) => {
    return apiCall<{ success: boolean; data: any }>('/bingo/win', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId }),
    });
  },

  getConfig: async () => {
    return apiCall<any>('/bingo/config');
  },

  updateConfig: async (config: any) => {
    return apiCall<any>('/bingo/config/update', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ===== SPORTSBOOK =====
export const sportsbook = {
  getLiveGames: async () => {
    return apiCall<{ success: boolean; data: SportsEvent[] }>('/sportsbook/games');
  },

  placeParlay: async (eventIds: number[], amounts: number[], odds: number[]) => {
    return apiCall<{ success: boolean; data: any }>('/sportsbook/parlay', {
      method: 'POST',
      body: JSON.stringify({ event_ids: eventIds, amounts, odds }),
    });
  },

  placeBet: async (eventId: number, amount: number, odds: number) => {
    return apiCall<{ success: boolean; data: any }>('/sportsbook/bet', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, amount, odds }),
    });
  },

  getConfig: async () => {
    return apiCall<any>('/sportsbook/config');
  },

  updateConfig: async (config: any) => {
    return apiCall<any>('/sportsbook/config/update', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ===== LEADERBOARDS =====
export const leaderboards = {
  getLeaderboard: async () => {
    return apiCall<{ success: boolean; data: LeaderboardEntry[] }>('/leaderboards');
  },

  getMyRank: async () => {
    return apiCall<{ success: boolean; data: LeaderboardEntry }>('/leaderboards/my-rank');
  },

  update: async () => {
    return apiCall<{ success: boolean }>('/leaderboards/update', {
      method: 'POST',
    });
  },
};

// ===== ACHIEVEMENTS =====
export const achievements = {
  getAll: async () => {
    return apiCall<{ success: boolean; data: Achievement[] }>('/achievements');
  },

  getMyAchievements: async () => {
    return apiCall<{ success: boolean; data: Achievement[] }>('/achievements/my-achievements');
  },

  check: async () => {
    return apiCall<{ success: boolean; data: any }>('/achievements/check', {
      method: 'POST',
    });
  },

  award: async (playerId: number, achievementId: number) => {
    return apiCall<{ success: boolean }>('/achievements/award', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, achievement_id: achievementId }),
    });
  },

  getStats: async () => {
    return apiCall<{ success: boolean; data: any }>('/achievements/stats');
  },
};

// ===== ADMIN =====
export const admin = {
  getDashboardStats: async () => {
    return adminApiCall<{ success: boolean; data: any }>('/admin/dashboard/stats');
  },

  getPlayers: async (page = 1, limit = 20) => {
    return adminApiCall<{ success: boolean; data: any }>(`/admin/players?page=${page}&limit=${limit}`);
  },

  getPlayer: async (playerId: number) => {
    return adminApiCall<{ success: boolean; data: any }>(`/admin/players/${playerId}`);
  },

  updatePlayerBalance: async (playerId: number, gc: number, sc: number) => {
    return adminApiCall<{ success: boolean }>('/admin/players/balance', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, gc_balance: gc, sc_balance: sc }),
    });
  },

  updatePlayerStatus: async (playerId: number, status: string) => {
    return adminApiCall<{ success: boolean }>('/admin/players/status', {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId, status }),
    });
  },

  getGames: async () => {
    return adminApiCall<{ success: boolean; data: any }>('/admin/games');
  },

  updateGameRTP: async (gameId: number, rtp: number) => {
    return adminApiCall<{ success: boolean }>('/admin/games/rtp', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, rtp }),
    });
  },

  toggleGame: async (gameId: number, enabled: boolean) => {
    return adminApiCall<{ success: boolean }>('/admin/games/toggle', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, enabled }),
    });
  },

  getBonuses: async () => {
    return adminApiCall<{ success: boolean; data: any }>('/admin/bonuses');
  },

  createBonus: async (bonusData: any) => {
    return adminApiCall<{ success: boolean }>('/admin/bonuses/create', {
      method: 'POST',
      body: JSON.stringify(bonusData),
    });
  },

  getTransactions: async () => {
    return adminApiCall<{ success: boolean; data: any }>('/admin/transactions');
  },

  getAlerts: async () => {
    return adminApiCall<{ success: boolean; data: any }>('/admin/alerts');
  },

  getAIEmployees: async () => {
    return adminApiCall<{ success: boolean; data: AIEmployee[] }>('/admin/ai-employees');
  },

  assignAIDuty: async (aiId: string, duty: string) => {
    return adminApiCall<{ success: boolean }>('/admin/ai-duty', {
      method: 'POST',
      body: JSON.stringify({ ai_id: aiId, duty }),
    });
  },

  updateAIStatus: async (aiId: string, status: string) => {
    return adminApiCall<{ success: boolean }>('/admin/ai-status', {
      method: 'POST',
      body: JSON.stringify({ ai_id: aiId, status }),
    });
  },

  setMaintenanceMode: async (enabled: boolean) => {
    return adminApiCall<{ success: boolean }>('/admin/maintenance', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  getSystemHealth: async () => {
    return adminApiCall<{ success: boolean; data: any }>('/admin/health');
  },
};
