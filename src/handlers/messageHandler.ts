import { Context } from 'telegraf';
import { DataService } from '@ngtbot/services/dataService';
import { ForecastService } from '@ngtbot/services/forecastService';
import { Formatters } from '@ngtbot/utils/formatters';
import { MESSAGES, LIMITS } from '@ngtbot/constants';

export class MessageHandler {
  private static dataService = DataService.getInstance();
  private static forecastService = ForecastService.getInstance();

  static async handleTextMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }
    const text = ctx.message.text;

    // Ignore if it looks like a command
    if (text?.startsWith('/')) {
      return;
    }

    try {
      // Ensure data is loaded first
      const isDataLoaded = await MessageHandler.dataService.ensureDataLoaded();
      if (!isDataLoaded) {
        await ctx.reply(MESSAGES.DATA_LOAD_ERROR);
        return;
      }

      // Check if message starts with # followed by numbers
      const stopIdMatch = text?.match(/^#(\d+)/);
      if (stopIdMatch) {
        await MessageHandler.handleStopIdSearch(ctx, stopIdMatch[1]);
        return;
      }

      // Regular stop name search
      if (!text) {
        await ctx.reply('Пожалуйста, введите название остановки для поиска.');
        return;
      }

      await MessageHandler.handleStopNameSearch(ctx, text);

    } catch (error) {
      console.error('Error fetching data:', error);
      await ctx.reply(MESSAGES.GENERAL_ERROR);
    }
  }

    private static async handleStopIdSearch(ctx: Context, stopId: string): Promise<void> {
    const allStops = MessageHandler.dataService.getAllStops();
    const stop = allStops.find(s => s.id === stopId);
    
    if (!stop) {
      await ctx.reply(
        `Остановка #${stopId} не найдена.\n` +
        'Проверьте номер остановки или воспользуйтесь поиском по названию.'
      );
      return;
    }

    // Show forecast
    const forecast = await MessageHandler.forecastService.getStopForecast(stop);
    await ctx.reply(forecast);
  }

  private static async handleStopNameSearch(ctx: Context, searchText: string): Promise<void> {
    const matchingStops = MessageHandler.dataService.searchStops(searchText);

    if (matchingStops.length === 0) {
      await ctx.reply(MESSAGES.SEARCH_TIPS);
      return;
    }

    if (matchingStops.length > LIMITS.MAX_SEARCH_RESULTS) {
      await ctx.reply(
        MESSAGES.TOO_MANY_RESULTS.replace('{count}', matchingStops.length.toString()) + '\n\n' +
        'Примеры:\n' +
        '- Добавьте больше слов из названия\n' +
        '- Используйте номер дома или название улицы\n' +
        '- Добавьте район или ориентир'
      );
      return;
    }

    if (matchingStops.length > 1) {
      const response = Formatters.formatStopsList(matchingStops, true);
      await ctx.reply(
        MESSAGES.MULTIPLE_STOPS
          .replace('{stops}', response)
          .replace('{exampleId}', matchingStops[0].id)
      );
      return;
    }

    // If only one stop found, show its forecast
    const stop = matchingStops[0];
    const forecast = await MessageHandler.forecastService.getStopForecast(stop);
    await ctx.reply(forecast);
  }
} 