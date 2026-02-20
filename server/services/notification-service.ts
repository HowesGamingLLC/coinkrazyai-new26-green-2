import { query, createSecurityAlert } from '../db/queries';
import { emailService } from './email-service';

export class NotificationService {
  /**
   * Send an email notification to a player
   */
  static async sendEmail(to: string, subject: string, content: string) {
    return await emailService.sendEmail({
      to,
      subject,
      html: `<div style="font-family: sans-serif; padding: 20px;">${content.replace(/\n/g, '<br>')}</div>`,
      text: content
    });
  }

  /**
   * Notify a player of a purchase
   */
  static async notifyPurchase(playerId: number, email: string, amount: number, currency: string, item: string) {
    const subject = `Purchase Confirmation - CoinKrazy`;
    const content = `
      Hello!
      
      This is a confirmation of your purchase on CoinKrazy.
      
      Item: ${item}
      Amount: ${amount} ${currency}
      Date: ${new Date().toLocaleString()}
      
      Thank you for playing with us!
    `;
    
    await this.sendEmail(email, subject, content);

    // Also create an admin alert if it's SC spending
    if (currency === 'SC') {
      await createSecurityAlert(
        'PURCHASE',
        'low',
        'SC Purchase Notification',
        `Player ID ${playerId} spent ${amount} SC on ${item}`
      );
    }
  }
}
