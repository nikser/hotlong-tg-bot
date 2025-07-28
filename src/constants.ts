// Transport type constants
export const TRANSPORT_TYPES = {
  BUS: '1',
  TROLLEYBUS: '2',
  TRAM: '3',
  MINIBUS: '8'
} as const;

// Transport type names
export const TRANSPORT_TYPE_NAMES: Record<string, string> = {
  [TRANSPORT_TYPES.BUS]: 'Автобусы',
  [TRANSPORT_TYPES.TROLLEYBUS]: 'Троллейбусы',
  [TRANSPORT_TYPES.TRAM]: 'Трамваи',
  [TRANSPORT_TYPES.MINIBUS]: 'Маршрутки'
};

// Transport type emojis
export const TRANSPORT_TYPE_EMOJIS: Record<string, string> = {
  [TRANSPORT_TYPES.BUS]: '🚌',
  [TRANSPORT_TYPES.TROLLEYBUS]: '🚎',
  [TRANSPORT_TYPES.TRAM]: '🚊',
  [TRANSPORT_TYPES.MINIBUS]: '🚐'
};

// Transport type full names with emojis
export const TRANSPORT_TYPE_FULL_NAMES: Record<string, string> = {
  [TRANSPORT_TYPES.BUS]: '🚌 Автобус',
  [TRANSPORT_TYPES.TROLLEYBUS]: '🚎 Троллейбус',
  [TRANSPORT_TYPES.TRAM]: '🚊 Трамвай',
  [TRANSPORT_TYPES.MINIBUS]: '🚐 Маршрутка'
};

// Cache TTL constants (in hours)
export const CACHE_TTL = {
  STOPS: 1,
  ROUTES: 1,
  TRASSA: 24
} as const;

// Search and display limits
export const LIMITS = {
  MAX_SEARCH_RESULTS: 5,
  MAX_FORECAST_TIMES: 4,
  MAX_STOPS_DISPLAY: 5
} as const;

// Messages
export const MESSAGES = {
  START: 'Привет! Я бот для получения прогноза прибытия транспорта.\n\n' +
         'Доступные команды:\n' +
         '/search <название> - поиск остановок по названию\n' +
         '/stop <id> - получить прогноз по ID остановки\n' +
         '/routes - список типов маршрутов\n' +
         '/route <номер> - информация о конкретном маршруте\n\n' +
         'или просто отправьте название остановки для поиска.',

    HELP: 'Как пользоваться ботом:\n\n' +
         '1. Поиск остановок:\n' +
         '   /search <название> - поиск остановок по названию\n' +
         '   Пример: /search площадь ленина\n\n' +
         '2. Получение прогноза:\n' +
         '   /stop <id> - прогноз по ID остановки\n' +
         '   Пример: /stop 142\n\n' +
         '3. Просмотр маршрутов:\n' +
         '   /routes - список всех маршрутов',

  NO_STOPS_FOUND: 'Остановки не найдены. Попробуйте другой поисковый запрос.',
  NO_ROUTE_FOUND: 'Маршрут с таким номером не найден.',
  NO_STOP_FOUND: 'Остановка с таким ID не найдена.',
  NO_FORECAST_DATA: 'Нет данных о прибытии транспорта на эту остановку.',
  DATA_LOAD_ERROR: 'Ошибка: не удалось загрузить данные. Попробуйте позже или используйте команду /refresh',
  GENERAL_ERROR: 'Произошла ошибка при получении данных. Попробуйте позже.',
  BOT_ERROR: 'Произошла внутренняя ошибка бота. Попробуйте позже.',
  REFRESH_START: 'Обновляю данные об остановках и маршрутах...',
  REFRESH_SUCCESS: 'Данные обновлены:\n- Загружено остановок: {stops}\n- Загружено маршрутов: {routes}',
  REFRESH_ERROR: 'Произошла ошибка при обновлении данных. Попробуйте позже.',
  TOO_MANY_RESULTS: 'Найдено несколько ({count} шт.) остановок. Уточните запрос.',
  SEARCH_TIPS: 'Подсказка: можно ввести часть названия, например:\n' +
                '- "ленина"\n' +
                '- "площадь маркса"\n' +
                '- "студенческая"\n\n' +
                'Или используйте номер остановки: #142',
  MULTIPLE_STOPS: 'Найдено несколько остановок:\n\n{stops}\n\n' +
                   'Выберите нужную остановку и используйте команду /stop <id> для получения прогноза.\n' +
                   'Например: /stop {exampleId}',
  PLATFORM_ERROR: ' ⚠️ Ошибка получения данных для платформы #{platformId}',
  UNKNOWN_STOP: 'Неизвестная остановка'
} as const;

// API parameters
export const API_PARAMS = {
  VERSION: '0.5',
  FORMAT: 'json'
} as const;

// System commands (admin only)
export const SYSTEM_COMMANDS = {
  REFRESH: '/refresh'
} as const;

// Admin messages
export const ADMIN_MESSAGES = {
  ACCESS_DENIED: '⛔ У вас нет доступа к этой команде.',
  ADMIN_ONLY: 'Эта команда доступна только администраторам.',
  REFRESH_SUCCESS: '✅ Данные успешно обновлены',
  REFRESH_ERROR: '❌ Ошибка при обновлении данных'
} as const;
