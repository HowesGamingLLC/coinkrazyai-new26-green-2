import { emitGameUpdate } from "../socket";
import { query } from "../db/connection";
import { updateCasinoSetting } from "../db/queries";

export class AIService {
  private static intervals: NodeJS.Timeout[] = [];

  static startAIProcesses() {
    // Clear existing processes first to avoid duplicates on hot-reload
    this.stopAIProcesses();

    // LuckyAI: General manager, periodic health check and settings update
    this.intervals.push(setInterval(async () => {
      try {
        console.log("[LuckyAI] Running platform health check...");
        const dbCheck = await query('SELECT 1');
        const status = dbCheck.rows.length > 0 ? 'Optimal' : 'Degraded';
        await updateCasinoSetting('system_health', status);
        console.log(`[LuckyAI] Platform health: ${status}`);
      } catch (err) {
        console.error("[LuckyAI] Health check failed:", err);
      }
    }, 60000));

    // SlotsAI: Adjusting RTP (simulated dynamic RTP)
    this.intervals.push(setInterval(async () => {
      try {
        const newRTP = (94 + Math.random() * 4).toFixed(1);
        // Update a random game's RTP or global config
        await updateCasinoSetting('slots_dynamic_rtp', newRTP);
        emitGameUpdate("slots", { rtp: newRTP, message: "SlotsAI optimized payout rates" });
      } catch (err) {
        console.error("[SlotsAI] RTP update failed:", err);
      }
    }, 120000));

    // SocialAI: Moderating chat and simulated activity
    this.intervals.push(setInterval(() => {
      const messages = [
        "Good luck everyone! 🍀", 
        "Someone just hit a big win on Emerald King!", 
        "Welcome to our new players! 🕶️",
        "Don't forget to claim your daily bonus!",
        "Play responsibly and have fun! 💎"
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      emitGameUpdate("chat", { user: "SocialAI", message: msg });
    }, 45000));

    // PromotionsAI: Analyzing activity (simulated)
    this.intervals.push(setInterval(() => {
      console.log("[PromotionsAI] Analyzing player activity for custom bonuses...");
      // In a real system, this would query player_stats and create make_it_rain_rewards
    }, 180000));
  }

  static stopAIProcesses() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }
}
