import { Telegraf, Context } from 'telegraf';
import { config } from '@ngtbot/config';
import { DataService } from '@ngtbot/services/dataService';
import { CommandHandlers } from '@ngtbot/handlers/commandHandlers';
import { MessageHandler } from '@ngtbot/handlers/messageHandler';
import { AdminUtils } from '@ngtbot/utils/adminUtils';

// Create bot instance
const bot = new Telegraf(config.TELEGRAM_TOKEN);

// Initialize data service
const dataService = DataService.getInstance();

// Command handlers
bot.command('start', CommandHandlers.handleStart);
bot.command('help', CommandHandlers.handleHelp);
bot.command('routes', CommandHandlers.handleRoutes);
bot.command('route', CommandHandlers.handleRoute);
bot.command('search', CommandHandlers.handleSearch);
bot.command('stop', CommandHandlers.handleStop);

// Admin-only commands
if (AdminUtils.isAdminSystemEnabled()) {
  bot.command('refresh', CommandHandlers.handleRefresh);
  console.log(`Admin system enabled. Admin IDs: ${AdminUtils.getAdminIds().join(', ')}`);
} else {
  console.log('Admin system disabled. No admin IDs configured.');
}

// Message handler for stop names
bot.on('text', MessageHandler.handleTextMessage);

// Error handler
bot.catch(async (err: unknown, ctx: Context) => {
  console.error('Bot error:', err);
  await ctx.reply('Произошла внутренняя ошибка бота. Попробуйте позже.');
});

// Load data and start the bot
async function startBot() {
  try {
    console.log('Loading initial data...');
    await Promise.all([
      dataService.loadAllStops(),
      dataService.loadAllRoutes()
    ]);
    
    console.log('Starting bot...');
    await bot.launch();
  } catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1);
  }
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Start the bot
startBot();
