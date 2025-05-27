import { Telegraf, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import axios from 'axios';
import { config } from './config';
import { StopsListResponse, RoutesListResponse, ForecastResponse } from './types';
import { FileCache } from './cache';

// Create bot instance
const bot = new Telegraf(config.TELEGRAM_TOKEN);

// Initialize caches
const stopsCache = new FileCache<StopsListResponse['data']>('stops.json', 1);
const routesCache = new FileCache<RoutesListResponse['data']>('routes.json', 1);

// Store for all data
let allStops: StopsListResponse['data'] = [];
let allRoutes: RoutesListResponse['data'] = [];

// Function to load all stops
async function loadAllStops() {
  try {
    const cachedStops = stopsCache.load();
    if (cachedStops) {
      allStops = cachedStops;
      console.log('Loaded stops from cache');
      return;
    }

    const response = await axios.get<StopsListResponse>(
      config.STOPS_LIST_ENDPOINT,
      {
        params: {
          v: '0.3',
          key: config.NSKGORTRANS_API_TOKEN,
          format: 'json'
        }
      }
    );
    allStops = response.data.data;
    stopsCache.save(allStops);
    console.log(`Loaded ${allStops.length} stops from API and cached`);
  } catch (error) {
    console.error('Error loading stops:', error);
  }
}

// Function to load all routes
async function loadAllRoutes() {
  try {
    const cachedRoutes = routesCache.load();
    if (cachedRoutes) {
      allRoutes = cachedRoutes;
      console.log('Loaded routes from cache');
      return;
    }

    const response = await axios.get<RoutesListResponse>(
      config.ROUTES_LIST_ENDPOINT,
      {
        params: {
          v: '0.3',
          key: config.NSKGORTRANS_API_TOKEN,
          format: 'json'
        }
      }
    );
    allRoutes = response.data.data;
    routesCache.save(allRoutes);
    console.log(`Loaded ${allRoutes.length} routes from API and cached`);
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

// Function to search stops by name
function searchStops(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  return allStops.filter(stop => {
    const stopTitle = stop.title.toLowerCase();
    // Check if all words from the query are present in the stop title
    return words.every(word => stopTitle.includes(word));
  });
}

// Function to get route info
function getRouteInfo(routeId: string): string {
  const route = allRoutes.find(r => r.id === routeId);
  if (!route) return '';
  
  const transportTypes: Record<string, string> = {
    '1': '🚌',
    '2': '🚎',
    '3': '🚊',
    '8': '🚐'
  };

  const emoji = transportTypes[route.type_transport] || '🚍';
  return `${emoji} ${route.title} (${route.name_begin} - ${route.name_end})`;
}

// Format stops list message
function formatStopsList(stops: StopsListResponse['data'], showPlatforms: boolean = false): string {
  if (stops.length === 0) {
    return 'Остановки не найдены. Попробуйте другой поисковый запрос.';
  }

  let message = `Найдено остановок: ${stops.length}\n\n`;
  
  stops.slice(0, 10).forEach((stop, index) => {
    message += `${index + 1}. 🚏 ${stop.title} (ID: ${stop.id})\n`;
    if (showPlatforms) {
      stop.platforms.forEach((platform, pIndex) => {
        message += `   ${String.fromCharCode(97 + pIndex)}) Платформа ${platform.id}\n`;
      });
    }
    message += '\n';
  });

  if (stops.length > 10) {
    message += '\n...и ещё ' + (stops.length - 10) + ' остановок';
  }

  return message;
}

// Start command handler
bot.command('start', async (ctx) => {
  await ctx.reply(
    'Привет! Я бот для получения прогноза прибытия транспорта.\n\n' +
    'Доступные команды:\n' +
    '/search <название> - поиск остановок по названию\n' +
    '/stop <id> - получить прогноз по ID остановки\n' +
    '/routes - список типов маршрутов\n' +
    '/route <номер> - информация о конкретном маршруте\n' +
    '/refresh - обновить данные\n' +
    'или просто отправьте название остановки для поиска.'
  );
});

// Help command handler
bot.command('help', async (ctx) => {
  await ctx.reply(
    'Как пользоваться ботом:\n\n' +
    '1. Поиск остановок:\n' +
    '   /search <название> - поиск остановок по названию\n' +
    '   Пример: /search площадь ленина\n\n' +
    '2. Получение прогноза:\n' +
    '   /stop <id> - прогноз по ID остановки\n' +
    '   Пример: /stop 142\n\n' +
    '3. Просмотр маршрутов:\n' +
    '   /routes - список всех маршрутов\n\n' +
    '4. Обновление данных:\n' +
    '   /refresh - обновить список остановок и маршрутов'
  );
});

// Routes command handler - show summary
bot.command('routes', async (ctx) => {
  const transportTypes = ['1', '2', '3', '8'] as const;
  const typeNames: Record<typeof transportTypes[number], string> = {
    '1': 'Автобусы',
    '2': 'Троллейбусы',
    '3': 'Трамваи',
    '8': 'Маршрутки'
  };

  let message = 'Типы маршрутов:\n\n';

  for (const type of transportTypes) {
    const routes = allRoutes.filter(r => r.type_transport === type);
    if (routes.length > 0) {
      const routeNumbers = routes
        .map(r => r.title)
        .sort((a, b) => Number(a) - Number(b))
        .join(', ');
      
      message += `${typeNames[type]}: ${routes.length} маршрутов\n`;
      message += `Номера: ${routeNumbers}\n\n`;
    }
  }

  message += '\nДля получения информации о конкретном маршруте используйте команду:\n/route <номер>';
  await ctx.reply(message);
});

// Single route command handler
bot.command('route', async (ctx) => {
  const routeNumber = ctx.message.text.replace('/route', '').trim();
  
  if (!routeNumber) {
    await ctx.reply(
      'Пожалуйста, укажите номер маршрута.\n' +
      'Пример: /route 13'
    );
    return;
  }

  const matchingRoutes = allRoutes.filter(r => r.title === routeNumber);

  if (matchingRoutes.length === 0) {
    await ctx.reply('Маршрут с таким номером не найден.');
    return;
  }

  let message = `Найдено маршрутов с номером ${routeNumber}:\n\n`;

  matchingRoutes.forEach(route => {
    const transportTypes: Record<string, string> = {
      '1': '🚌 Автобус',
      '2': '🚎 Троллейбус',
      '3': '🚊 Трамвай',
      '8': '🚐 Маршрутка'
    };

    const transportType = transportTypes[route.type_transport] || '🚍 Транспорт';
    message += `${transportType}\n`;
    message += `Маршрут: ${route.title}\n`;
    message += `Направление: ${route.name_begin} - ${route.name_end}\n`;
    message += `Стоимость проезда: ${route.fare} ₽\n\n`;
  });

  await ctx.reply(message);
});

// Stop command handler
bot.command('stop', async (ctx) => {
  const stopId = ctx.message.text.replace('/stop', '').trim();
  
  if (!stopId) {
    await ctx.reply(
      'Пожалуйста, укажите ID остановки.\n' +
      'Пример: /stop 142'
    );
    return;
  }

  const stop = allStops.find(s => s.id === stopId);
  if (!stop) {
    await ctx.reply('Остановка с таким ID не найдена.');
    return;
  }

  try {
    let fullResponse = `🚏 ${stop.title} (ID: ${stop.id})\n\n`;
    
    // Get forecast for each platform
    for (const platform of stop.platforms) {
      const forecastResponse = await axios.get<ForecastResponse>(
        `${config.FORECAST_ENDPOINT}/${platform.id}`,
        {
          params: {
            v: '0.5',
            key: config.NSKGORTRANS_API_TOKEN,
            format: 'json'
          }
        }
      );

      if (forecastResponse.data.data && forecastResponse.data.data.length > 0) {
        fullResponse += `Платформа ${platform.id}:\n`;
        for (const transport of forecastResponse.data.data) {
          const route = allRoutes.find(r => r.id === transport.id_alias.toString());
          const emoji = getTransportTypeEmoji(transport.transport_type);
          for (const marker of transport.marker) {
            const minutes = Math.round(marker.predict / 60);
            fullResponse += `${emoji} ${route ? route.title : transport.id_alias}: через ${minutes} мин.\n`;
          }
        }
        fullResponse += '\n';
      }
    }

    await ctx.reply(fullResponse);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    await ctx.reply('Произошла ошибка при получении данных. Попробуйте позже.');
  }
});

// Search command handler
bot.command('search', async (ctx) => {
  const searchQuery = ctx.message.text.replace('/search', '').trim();
  
  if (!searchQuery) {
    await ctx.reply(
      'Пожалуйста, укажите название остановки для поиска.\n' +
      'Пример: /search площадь ленина'
    );
    return;
  }

  const matchingStops = searchStops(searchQuery);
  const response = formatStopsList(matchingStops, true);
  await ctx.reply(response);
});

// Refresh command handler
bot.command('refresh', async (ctx) => {
  await ctx.reply('Обновляю данные об остановках и маршрутах...');
  stopsCache.clear();
  routesCache.clear();
  await Promise.all([loadAllStops(), loadAllRoutes()]);
  await ctx.reply(
    `Данные обновлены:\n` +
    `- Загружено остановок: ${allStops.length}\n` +
    `- Загружено маршрутов: ${allRoutes.length}`
  );
});

// Helper function to get transport type emoji
function getTransportTypeEmoji(type: number): string {
  switch (type) {
    case 1:
      return '🚌'; // Bus
    case 2:
      return '🚎'; // Trolleybus
    case 3:
      return '🚊'; // Tram
    case 8:
      return '🚐'; // Minibus
    default:
      return '🚍'; // Default transport
  }
}

// Message handler for stop names
bot.on('text', async (ctx) => {
  const stopName = ctx.message.text;

  // Ignore if it looks like a command
  if (stopName.startsWith('/')) {
    return;
  }

  try {
    const matchingStops = searchStops(stopName);

    if (matchingStops.length === 0) {
      await ctx.reply(
        'Остановка не найдена. Попробуйте другое название.\n' +
        'Подсказка: можно ввести часть названия, например:\n' +
        '- "ленина"\n' +
        '- "площадь маркса"\n' +
        '- "студенческая"\n\n' +
        'Для точного поиска используйте команду /search <название>'
      );
      return;
    }

    if (matchingStops.length > 10) {
      await ctx.reply(
        `Найдено слишком много остановок (${matchingStops.length}). Уточните запрос.\n\n` +
        'Примеры:\n' +
        '- Добавьте больше слов из названия\n' +
        '- Используйте номер дома или название улицы\n' +
        '- Добавьте район или ориентир'
      );
      return;
    }

    if (matchingStops.length > 1) {
      const response = formatStopsList(matchingStops, true);
      await ctx.reply(
        'Найдено несколько остановок:\n\n' + 
        response + '\n\n' +
        'Выберите нужную остановку и используйте команду /stop <id> для получения прогноза.\n' +
        'Например: /stop ' + matchingStops[0].id
      );
      return;
    }

    // If only one stop found, show its forecast
    const stop = matchingStops[0];
    await ctx.reply(`Найдена остановка: ${stop.title} (ID: ${stop.id})`);
    
    // Show forecast
    await ctx.reply(await handleStopForecast(stop));

  } catch (error) {
    console.error('Error fetching data:', error);
    await ctx.reply('Произошла ошибка при получении данных. Попробуйте позже.');
  }
});

// Helper function to handle stop forecast
async function handleStopForecast(stop: StopsListResponse['data'][0]): Promise<string> {
  try {
    let response = `🚏 ${stop.title} (ID: ${stop.id})\n\n`;
    
    for (const platform of stop.platforms) {
      const forecastResponse = await axios.get<ForecastResponse>(
        `${config.FORECAST_ENDPOINT}/${platform.id}`,
        {
          params: {
            v: '0.5',
            key: config.NSKGORTRANS_API_TOKEN,
            format: 'json'
          }
        }
      );

      if (forecastResponse.data.data && forecastResponse.data.data.length > 0) {
        response += `Платформа ${platform.id}:\n`;
        for (const transport of forecastResponse.data.data) {
          const route = allRoutes.find(r => r.id === transport.id_alias.toString());
          const emoji = getTransportTypeEmoji(transport.transport_type);
          for (const marker of transport.marker) {
            const minutes = Math.round(marker.predict / 60);
            response += `${emoji} ${route ? route.title : transport.id_alias}: через ${minutes} мин.\n`;
          }
        }
        response += '\n';
      }
    }

    return response || 'Нет данных о прибытии транспорта на эту остановку.';
  } catch (error) {
    console.error('Error in handleStopForecast:', error);
    throw error;
  }
}

// Error handler
bot.catch(async (err: unknown, ctx: Context<Update>) => {
  console.error('Bot error:', err);
  await ctx.reply('Произошла внутренняя ошибка бота. Попробуйте позже.');
});

// Load data and start the bot
Promise.all([loadAllStops(), loadAllRoutes()])
  .then(() => {
    return bot.launch();
  })
  .then(() => {
    console.log('Bot started successfully');
  })
  .catch((err) => {
    console.error('Error starting bot:', err);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 