import { Context } from 'telegraf';
import { config } from '@ngtbot/config';

export class AdminUtils {
  /**
   * Check if user is admin
   */
  static isAdmin(userId: number): boolean {
    return config.ADMIN_USER_IDS.includes(userId);
  }

  /**
   * Check if user has admin access and send error message if not
   */
  static async checkAdminAccess(ctx: Context): Promise<boolean> {
    if (!ctx.from) {
      await ctx.reply('Ошибка: не удалось определить пользователя');
      return false;
    }

    if (!this.isAdmin(ctx.from.id)) {
      await ctx.reply('⛔ У вас нет доступа к этой команде.');
      return false;
    }

    return true;
  }

  /**
   * Get admin user IDs for debugging
   */
  static getAdminIds(): number[] {
    return config.ADMIN_USER_IDS;
  }

  /**
   * Check if admin system is configured
   */
  static isAdminSystemEnabled(): boolean {
    return config.ADMIN_USER_IDS.length > 0;
  }
} 