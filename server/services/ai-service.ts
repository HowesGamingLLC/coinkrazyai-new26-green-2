import { emitGameUpdate } from "../socket";

export class AIService {
  private static intervals: NodeJS.Timeout[] = [];

  static startAIProcesses() {
    // LuckyAI: General manager, periodic health check
    this.intervals.push(setInterval(() => {
      console.log("[LuckyAI] Running platform health check...");
    }, 60000));

    // SlotsAI: Adjusting RTP
    this.intervals.push(setInterval(() => {
      const newRTP = (94 + Math.random() * 4).toFixed(1);
      emitGameUpdate("slots", { rtp: newRTP, message: "SlotsAI updated RTP for fairness" });
    }, 30000));

    // SocialAI: Moderating chat
    this.intervals.push(setInterval(() => {
      const messages = ["Good luck!", "Krazy wins today!", "Play responsibly!"];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      emitGameUpdate("chat", { user: "SocialAI", message: msg });
    }, 45000));

    // PromotionsAI: Bonus assignment
    this.intervals.push(setInterval(() => {
      console.log("[PromotionsAI] Analyzing player activity for bonuses...");
    }, 120000));
  }

  static stopAIProcesses() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }
}
