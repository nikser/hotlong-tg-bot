import { StopsListResponse, RoutesListResponse, TrassaResponse } from '@ngtbot/types';
import { TRANSPORT_TYPE_EMOJIS, TRANSPORT_TYPE_NAMES, TRANSPORT_TYPE_FULL_NAMES, LIMITS, MESSAGES } from '@ngtbot/constants';

export class Formatters {
  static getTransportTypeEmoji(type: number): string {
    const typeStr = type.toString();
    return TRANSPORT_TYPE_EMOJIS[typeStr] || '🚍'; // Default transport
  }

  static getTransportTypeName(type: number): string {
    return TRANSPORT_TYPE_NAMES[type] || 'Транспорт';
  }

  static getTransportTypeFullName(type: number): string {
    return TRANSPORT_TYPE_FULL_NAMES[type] || '🚍 Транспорт';
  }

  static formatStopsList(stops: StopsListResponse['data'], showPlatforms: boolean = false): string {
    if (stops.length === 0) {
      return MESSAGES.NO_STOPS_FOUND;
    }

    let message = `Найдено остановок: ${stops.length}\n\n`;

    stops.slice(0, LIMITS.MAX_STOPS_DISPLAY).forEach((stop, index) => {
      message += `${index + 1}. 🚏 ${stop.title} #${stop.id}\n`;
      if (showPlatforms) {
        stop.platforms.forEach((platform, pIndex) => {
          message += `   ${String.fromCharCode(97 + pIndex)}) Платформа #${platform.id}\n`;
        });
      }
      message += '\n';
    });

    if (stops.length > LIMITS.MAX_STOPS_DISPLAY) {
      message += '\n...и ещё ' + (stops.length - LIMITS.MAX_STOPS_DISPLAY) + ' остановок';
    }

    return message;
  }

  static formatRouteInfo(route: RoutesListResponse['data'][0]): string {
    const transportType = this.getTransportTypeFullName(route.transport_type);
    return `${transportType}\n` +
      `Маршрут: ${route.title}\n` +
      `Направление: ${route.name_begin} - ${route.name_end}\n` +
      `Стоимость проезда: ${route.fare} ₽`;
  }

  static formatRoutesSummary(routes: RoutesListResponse['data']): string {
    console.log(`[DEBUG] Formatting routes summary. Total routes: ${routes.length}`);

    if (!routes || routes.length === 0) {
      return 'Нет данных о маршрутах. Попробуйте использовать команду /refresh для обновления данных.';
    }

    // Debug: show first few routes to understand data structure
    console.log('[DEBUG] First 3 routes:', routes.slice(0, 3).map(r => ({
      id: r.id,
      title: r.title,
      type_transport: r.transport_type,
      type_transport_type: typeof r.transport_type
    })));

    const transportTypes = [1, 2, 3, 8] as const;
    let message = 'Типы маршрутов:\n\n';
    let hasAnyRoutes = false;

    for (const type of transportTypes) {
      // Filter by transport type
      const typeRoutes = routes.filter(r => r.transport_type === type);
      console.log(`[DEBUG] Type ${type}: ${typeRoutes.length} routes`);

      if (typeRoutes.length > 0) {
        hasAnyRoutes = true;
        const routeNumbers = typeRoutes
          .map(r => r.title)
          .sort((a, b) => Number(a) - Number(b))
          .join(', ');

        message += `${this.getTransportTypeFullName(type)}: ${typeRoutes.length} маршрутов\n`;
        message += `Номера: ${routeNumbers}\n\n`;
      }
    }

    if (!hasAnyRoutes) {
      return 'Нет данных о маршрутах. Попробуйте использовать команду /refresh для обновления данных.';
    }

    message += '\nДля получения информации о конкретном маршруте используйте команду:\n/route <номер>';
    return message;
  }

  static formatTimeString(minutes: number): string {
    return minutes === 0 ? 'сейчас' : `${minutes} мин`;
  }

  static formatTimeArray(minutes: number[]): string {
    const sortedMinutes = minutes.sort((a, b) => a - b);
    const uniqueMinutes = [...new Set(sortedMinutes)].slice(0, LIMITS.MAX_FORECAST_TIMES);
    let timeStr = uniqueMinutes.map(m => this.formatTimeString(m)).join(', ');

    // Remove redundant "мин" if "сейчас" is present
    if (timeStr.includes('сейчас') && timeStr.includes('мин')) {
      timeStr = timeStr.replace('сейчас, ', 'сейчас, ').replace(', сейчас', '');
    }

    return timeStr;
  }
}
