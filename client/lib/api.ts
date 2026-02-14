/**
 * Central API client for all backend requests
 * Handles authentication headers, error handling, and response parsing
 */

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export class ApiClient {
  private static baseURL = '/api';

  static async request<T>(
    endpoint: string,
    options: RequestInit & { authenticated?: boolean } = {}
  ): Promise<T> {
    const { authenticated = true, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: getHeaders(authenticated),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
        throw new Error('Session expired');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // ===== GAMES =====
  static async getGames() {
    return this.request('/games', { authenticated: false });
  }

  static async getGameById(id: string | number) {
    return this.request(`/games/${id}`, { authenticated: false });
  }

  // ===== SLOTS =====
  static async getSlotsConfig() {
    return this.request('/slots/config', { authenticated: false });
  }

  static async spinSlots(gameId: number, betAmount: number) {
    return this.request('/slots/spin', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, bet_amount: betAmount })
    });
  }

  // ===== POKER =====
  static async getPokerTables() {
    return this.request('/poker/tables', { authenticated: false });
  }

  static async joinPokerTable(tableId: number, buyIn: number) {
    return this.request('/poker/join', {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId, buy_in: buyIn })
    });
  }

  static async pokerFold(tableId: number) {
    return this.request('/poker/fold', {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId })
    });
  }

  static async pokerCashOut(tableId: number, cashOutAmount: number) {
    return this.request('/poker/cash-out', {
      method: 'POST',
      body: JSON.stringify({ table_id: tableId, cash_out_amount: cashOutAmount })
    });
  }

  // ===== BINGO =====
  static async getBingoRooms() {
    return this.request('/bingo/rooms', { authenticated: false });
  }

  static async buyBingoTicket(gameId: number) {
    return this.request('/bingo/buy', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, count: 1 })
    });
  }

  static async markBingoNumber(gameId: number, number: number) {
    return this.request('/bingo/mark', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, number })
    });
  }

  static async reportBingoWin(gameId: number, pattern: string) {
    return this.request('/bingo/win', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, pattern })
    });
  }

  // ===== SPORTSBOOK =====
  static async getLiveGames() {
    return this.request('/sportsbook/games', { authenticated: false });
  }

  static async placeSportsBet(eventId: number, betType: string, amount: number, odds: number) {
    return this.request('/sportsbook/bet', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, bet_type: betType, amount, odds })
    });
  }

  static async placeParlay(bets: Array<{ eventId: number; odds: number }>, amount: number) {
    return this.request('/sportsbook/parlay', {
      method: 'POST',
      body: JSON.stringify({ bets, amount })
    });
  }

  // ===== STORE =====
  static async getStorePacks() {
    return this.request('/store/packs', { authenticated: false });
  }

  static async purchasePack(packId: number, paymentMethod: string = 'stripe') {
    return this.request('/store/purchase', {
      method: 'POST',
      body: JSON.stringify({ packId, payment_method: paymentMethod })
    });
  }

  static async getPurchaseHistory(limit: number = 20) {
    return this.request(`/store/history?limit=${limit}`);
  }

  // ===== WALLET =====
  static async getWallet() {
    return this.request('/wallet');
  }

  static async getWalletTransactions(limit: number = 50) {
    return this.request(`/wallet/transactions?limit=${limit}`);
  }

  static async updateWallet(currency: string, amount: number, type: string, description: string) {
    return this.request('/wallet/update', {
      method: 'POST',
      body: JSON.stringify({ currency, amount, type, description })
    });
  }

  // ===== ACHIEVEMENTS =====
  static async getAchievements() {
    return this.request('/achievements', { authenticated: false });
  }

  static async getPlayerAchievements() {
    return this.request('/achievements/my-achievements');
  }

  static async checkAchievements() {
    return this.request('/achievements/check', {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  // ===== LEADERBOARD =====
  static async getLeaderboard(type: string = 'all_time', period: string = 'all') {
    return this.request(
      `/leaderboards?type=${type}&period=${period}`,
      { authenticated: false }
    );
  }

  static async getPlayerRank() {
    return this.request('/leaderboards/my-rank');
  }

  // ===== PROFILE & AUTH =====
  static async getProfile() {
    return this.request('/auth/profile');
  }

  static async updateProfile(updates: { name?: string; email?: string; password?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // ===== ADMIN =====
  static async getAdminStats() {
    return this.request('/admin/stats');
  }

  static async getAdminPlayers(limit: number = 20, offset: number = 0) {
    return this.request(`/admin/players?limit=${limit}&offset=${offset}`);
  }

  static async getAdminPlayer(playerId: number) {
    return this.request(`/admin/players/${playerId}`);
  }

  static async updateAdminPlayerBalance(playerId: number, gc: number, sc: number) {
    return this.request('/admin/players/balance', {
      method: 'POST',
      body: JSON.stringify({ playerId, gc, sc })
    });
  }

  static async getAdminGames() {
    return this.request('/admin/games');
  }

  static async updateGameRTP(gameId: number, rtp: number) {
    return this.request('/admin/games/rtp', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, rtp })
    });
  }

  static async toggleGame(gameId: number, enabled: boolean) {
    return this.request('/admin/games/toggle', {
      method: 'POST',
      body: JSON.stringify({ game_id: gameId, enabled })
    });
  }

  static async getAdminBonuses() {
    return this.request('/admin/bonuses');
  }

  static async createBonus(bonusData: any) {
    return this.request('/admin/bonuses/create', {
      method: 'POST',
      body: JSON.stringify(bonusData)
    });
  }

  static async getAdminTransactions(limit: number = 50) {
    return this.request(`/admin/transactions?limit=${limit}`);
  }

  static async getAdminSecurityAlerts(limit: number = 20) {
    return this.request(`/admin/alerts?limit=${limit}`);
  }

  static async getAdminKYC(playerId: number) {
    return this.request(`/admin/kyc/${playerId}`);
  }

  static async approveKYC(playerId: number, level: string) {
    return this.request('/admin/kyc/approve', {
      method: 'POST',
      body: JSON.stringify({ playerId, level })
    });
  }

  static async getAdminPokerTables() {
    return this.request('/admin/poker/tables');
  }

  static async getAdminBingoGames() {
    return this.request('/admin/bingo/games');
  }

  static async getAdminSportsEvents() {
    return this.request('/admin/sports/events');
  }
}

export default ApiClient;
