import { StopsListResponse, RoutesListResponse, TrassaResponse, ForecastResponse } from '@ngtbot/types';
import { TransportApiService } from '@ngtbot/services/api';
import { DataService } from '@ngtbot/services/dataService';
import { Formatters } from '@ngtbot/utils/formatters';
import { MESSAGES } from '@ngtbot/constants';

interface GroupedForecast {
  emoji: string;
  routeTitle: string;
  minutes: number[];
}

interface PlatformGroup {
  [nextStop: string]: {
    [routeId: string]: GroupedForecast;
  };
}

export class ForecastService {
  private static instance: ForecastService;
  private apiService: TransportApiService;
  private dataService: DataService;

  private constructor() {
    this.apiService = TransportApiService.getInstance();
    this.dataService = DataService.getInstance();
  }

  static getInstance(): ForecastService {
    if (!ForecastService.instance) {
      ForecastService.instance = new ForecastService();
    }
    return ForecastService.instance;
  }

  private findNextStopName(trassa: TrassaResponse['data'][0], currentPlatformId: number): string {
    const currentPoint = trassa.trassa.find(p => p.id_platform == currentPlatformId);
    if (!currentPoint) return '';

    // Find next point with a stop name
    const nextStop = trassa.trassa
      .filter(p => p.order > currentPoint.order && p.name_stop)
      .sort((a, b) => a.order - b.order)[0];

    return nextStop?.name_stop || '';
  }

  async getStopForecast(stop: StopsListResponse['data'][0]): Promise<string> {
    try {
      // Ensure data is loaded
      const isDataLoaded = await this.dataService.ensureDataLoaded();
      if (!isDataLoaded) {
        return MESSAGES.DATA_LOAD_ERROR;
      }

      const allRoutes = this.dataService.getAllRoutes();
      if (!Array.isArray(allRoutes)) {
        console.error('Error: allRoutes is not an array', { type: typeof allRoutes, value: allRoutes });
        return MESSAGES.DATA_LOAD_ERROR;
      }

      const title = `🚏 ${stop.title} #${stop.id}\n\n`;
      let response = '';
      
      for (const platform of stop.platforms) {
        try {
          const forecastData = await this.apiService.getForecast(platform.id);

          if (forecastData && forecastData.length > 0) {
            // Group by next stop and route
            const platformGroups: PlatformGroup = {};

            for (const transport of forecastData) {
              try {
                const route = allRoutes.find(r => r.id === transport.id_alias);
                const emoji = Formatters.getTransportTypeEmoji(transport.transport_type);
                const trassa = await this.dataService.getRouteTrassa(transport.id_alias.toString(), transport.direction);
                
                if (!trassa) continue;

                const nextStop = this.findNextStopName(trassa, platform.id) || MESSAGES.UNKNOWN_STOP;
                const routeId = transport.id_alias.toString();
                const routeTitle = route ? route.title : routeId;

                if (!platformGroups[nextStop]) {
                  platformGroups[nextStop] = {};
                }

                if (!platformGroups[nextStop][routeId]) {
                  platformGroups[nextStop][routeId] = {
                    emoji,
                    routeTitle,
                    minutes: []
                  };
                }

                transport.marker.forEach(marker => {
                  const minutes = Math.round(marker.predict / 60);
                  platformGroups[nextStop][routeId].minutes.push(minutes);
                });
              } catch (transportError) {
                console.error('Error processing transport:', transportError, { transport });
                continue;
              }
            }

            // Format the grouped data
            if (Object.keys(platformGroups).length > 0) {
              const sortedStops = Object.keys(platformGroups).sort();
              
              for (const nextStop of sortedStops) {
                response += ` → ${nextStop} (#${platform.id}):\n`;
                
                const routes = Object.values(platformGroups[nextStop]);
                routes.sort((a, b) => {
                  const minA = Math.min(...a.minutes);
                  const minB = Math.min(...b.minutes);
                  return minA - minB;
                });

                for (const route of routes) {
                  const timeStr = Formatters.formatTimeArray(route.minutes);
                  response += `   ${route.emoji} ${route.routeTitle}: ${timeStr}\n`;
                }
                response += '\n';
              }
            }
          }
        } catch (platformError) {
          console.error('Error processing platform:', platformError, { platformId: platform.id });
          response += MESSAGES.PLATFORM_ERROR.replace('{platformId}', platform.id.toString()) + '\n\n';
        }
      }

      return title + (response || MESSAGES.NO_FORECAST_DATA);
    } catch (error) {
      console.error('Error in getStopForecast:', error);
      return MESSAGES.GENERAL_ERROR;
    }
  }

  async getPlatformForecast(platformId: number): Promise<string> {
    try {
      const forecastData = await this.apiService.getForecast(platformId);
      const allRoutes = this.dataService.getAllRoutes();

      if (!forecastData || forecastData.length === 0) {
        return MESSAGES.NO_FORECAST_DATA;
      }

      let response = `Платформа #${platformId}:\n\n`;

      for (const transport of forecastData) {
        const route = allRoutes.find(r => r.id === transport.id_alias);
        const emoji = Formatters.getTransportTypeEmoji(transport.transport_type);
        
        for (const marker of transport.marker) {
          const minutes = Math.round(marker.predict / 60);
          const timeStr = Formatters.formatTimeString(minutes);
          response += `${emoji} ${route ? route.title : transport.id_alias}: через ${timeStr}\n`;
        }
      }

      return response;
    } catch (error) {
      console.error('Error fetching platform forecast:', error);
      return MESSAGES.GENERAL_ERROR;
    }
  }
} 