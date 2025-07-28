import axios from 'axios';
import { config } from '@ngtbot/config';
import { StopsListResponse, RoutesListResponse, ForecastResponse, TrassaResponse } from '@ngtbot/types';
import { API_PARAMS } from '@ngtbot/constants';

export class TransportApiService {
  private static instance: TransportApiService;

  private constructor() {}

  static getInstance(): TransportApiService {
    if (!TransportApiService.instance) {
      TransportApiService.instance = new TransportApiService();
    }
    return TransportApiService.instance;
  }

  async getStopsList(): Promise<StopsListResponse['data']> {
    const response = await axios.get<StopsListResponse>(
      config.STOPS_LIST_ENDPOINT,
      {
        params: {
          v: API_PARAMS.VERSION,
          key: config.NSKGORTRANS_API_TOKEN,
          format: API_PARAMS.FORMAT
        }
      }
    );
    return response.data.data;
  }

  async getRoutesList(): Promise<RoutesListResponse['data']> {
    const response = await axios.get<RoutesListResponse>(
      config.ROUTES_LIST_ENDPOINT,
      {
        params: {
          v: API_PARAMS.VERSION,
          key: config.NSKGORTRANS_API_TOKEN,
          format: API_PARAMS.FORMAT
        }
      }
    );
    return response.data.data;
  }

  async getForecast(platformId: number): Promise<ForecastResponse['data']> {
    const response = await axios.get<ForecastResponse>(
      `${config.FORECAST_ENDPOINT}/${platformId}`,
      {
        params: {
          v: API_PARAMS.VERSION,
          key: config.NSKGORTRANS_API_TOKEN,
          format: API_PARAMS.FORMAT
        }
      }
    );
    return response.data.data || [];
  }

  async getRouteTrassa(routeId: string, direction: number): Promise<TrassaResponse['data'][0] | null> {
    try {
      console.log(`[DEBUG] Fetching route trassa for routeId: ${routeId}, direction: ${direction}`);
      console.log(`${config.NSKGORTRANS_BASE_URL}/trassa/list/ids/[[${routeId},${direction}]]`);
      const response = await axios.get<TrassaResponse>(
        `${config.NSKGORTRANS_BASE_URL}/trassa/list/ids/[[${routeId},${direction}]]`,
        {
          params: {
            v: API_PARAMS.VERSION,
            key: config.NSKGORTRANS_API_TOKEN,
            format: API_PARAMS.FORMAT
          }
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching route trassa:', error);
      return null;
    }
  }
} 