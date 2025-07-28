import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { DataService } from '@ngtbot/services/dataService';
import { ForecastService } from '@ngtbot/services/forecastService';
import { Formatters } from '@ngtbot/utils/formatters';
import { MESSAGES, ADMIN_MESSAGES } from '@ngtbot/constants';
import { AdminUtils } from '@ngtbot/utils/adminUtils';

export class CommandHandlers {
  private static get dataService() {
    return DataService.getInstance();
  }
  
  private static get forecastService() {
    return ForecastService.getInstance();
  }

  static async handleStart(ctx: Context): Promise<void> {
    await ctx.reply(MESSAGES.START);
  }

  static async handleHelp(ctx: Context): Promise<void> {
    await ctx.reply(MESSAGES.HELP);
  }

  static async handleRoutes(ctx: Context): Promise<void> {
    const allRoutes = CommandHandlers.dataService.getAllRoutes();
    console.log(`[DEBUG] /routes command. Retrieved ${allRoutes.length} routes`);
    
    if (!allRoutes || allRoutes.length === 0) {
      console.log('[DEBUG] No routes found, checking if data is loaded...');
      const isDataLoaded = await CommandHandlers.dataService.ensureDataLoaded();
      console.log(`[DEBUG] Data loaded: ${isDataLoaded}`);
      
      if (isDataLoaded) {
        const reloadedRoutes = CommandHandlers.dataService.getAllRoutes();
        console.log(`[DEBUG] After reload: ${reloadedRoutes.length} routes`);
      }
    }
    
    const message = Formatters.formatRoutesSummary(allRoutes);
    await ctx.reply(message);
  }

  static async handleRoute(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Ошибка: неверный тип сообщения');
      return;
    }
    const routeNumber = ctx.message.text.replace('/route', '').replace('#', '').trim();
    
    if (!routeNumber) {
      await ctx.reply(
        'Пожалуйста, укажите номер маршрута.\n' +
        'Пример: /route 13'
      );
      return;
    }

    const allRoutes = CommandHandlers.dataService.getAllRoutes();
    const matchingRoutes = allRoutes.filter(r => r.title.toString() === routeNumber);

    if (matchingRoutes.length === 0) {
      await ctx.reply(MESSAGES.NO_ROUTE_FOUND);
      return;
    }

    let message = `Найдено маршрутов с номером ${routeNumber}:\n\n`;

    matchingRoutes.forEach(route => {
      message += Formatters.formatRouteInfo(route) + '\n\n';
    });

    await ctx.reply(message);
  }

  static async handleStop(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Ошибка: неверный тип сообщения');
      return;
    }
    const stopId = ctx.message.text.replace('/stop', '').replace('#', '').trim();
    
    if (!stopId) {
      await ctx.reply(
        'Пожалуйста, укажите ID остановки.\n' +
        'Пример: /stop 142'
      );
      return;
    }

    const allStops = CommandHandlers.dataService.getAllStops();
    const stop = allStops.find(s => s.id.toString() === stopId);
    
    if (!stop) {
      await ctx.reply(MESSAGES.NO_STOP_FOUND);
      return;
    }

    const forecast = await CommandHandlers.forecastService.getStopForecast(stop);
    await ctx.reply(forecast);
  }

  static async handleSearch(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Ошибка: неверный тип сообщения');
      return;
    }
    const searchQuery = ctx.message.text.replace('/search', '').replace('#', '').trim();
    
    if (!searchQuery) {
      await ctx.reply(
        'Пожалуйста, укажите название остановки для поиска.\n' +
        'Пример: /search площадь ленина'
      );
      return;
    }

    const matchingStops = CommandHandlers.dataService.searchStops(searchQuery);
    const response = Formatters.formatStopsList(matchingStops, true);
    await ctx.reply(response);
  }

  static async handleRefresh(ctx: Context): Promise<void> {
    // Check admin access
    if (!await AdminUtils.checkAdminAccess(ctx)) {
      return;
    }

    await ctx.reply('Обновляю данные об остановках и маршрутах...');
    
    try {
      CommandHandlers.dataService.clearCache();
      await Promise.all([
        CommandHandlers.dataService.loadAllStops(),
        CommandHandlers.dataService.loadAllRoutes()
      ]);
      
      const allStops = CommandHandlers.dataService.getAllStops();
      const allRoutes = CommandHandlers.dataService.getAllRoutes();
      
      await ctx.reply(
        `${ADMIN_MESSAGES.REFRESH_SUCCESS}\n` +
        `- Загружено остановок: ${allStops.length}\n` +
        `- Загружено маршрутов: ${allRoutes.length}`
      );
      console.log(`[DEBUG] Routes list response: ${JSON.stringify(allRoutes)}`);
    } catch (error) {
      console.error('Error refreshing data:', error);
      await ctx.reply(ADMIN_MESSAGES.REFRESH_ERROR);
    }
  }
} 