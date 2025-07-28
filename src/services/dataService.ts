import { StopsListResponse, RoutesListResponse, TrassaResponse } from '@ngtbot/types';
import { FileCache, TrassaCache } from '@ngtbot/cache';
import { TransportApiService } from '@ngtbot/services/api';
import { CACHE_TTL } from '@ngtbot/constants';

export class DataService {
  private static instance: DataService;
  private apiService: TransportApiService;
  private stopsCache: FileCache<StopsListResponse['data']>;
  private routesCache: FileCache<RoutesListResponse['data']>;
  private trassaCache: TrassaCache;

  private allStops: StopsListResponse['data'] = [];
  private allRoutes: RoutesListResponse['data'] = [];

  private constructor() {
    this.apiService = TransportApiService.getInstance();
    this.stopsCache = new FileCache<StopsListResponse['data']>('stops.json', CACHE_TTL.STOPS);
    this.routesCache = new FileCache<RoutesListResponse['data']>('routes.json', CACHE_TTL.ROUTES);
    this.trassaCache = new TrassaCache(CACHE_TTL.TRASSA);
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async loadAllStops(): Promise<void> {
    try {
      const cachedStops = this.stopsCache.load();
      if (cachedStops) {
        this.allStops = cachedStops;
        console.log('Loaded stops from cache');
        return;
      }

      this.allStops = await this.apiService.getStopsList();
      this.stopsCache.save(this.allStops);
      console.log(`Loaded ${this.allStops.length} stops from API and cached`);
    } catch (error) {
      console.error('Error loading stops:', error);
      throw error;
    }
  }

  async loadAllRoutes(): Promise<void> {
    try {
      const cachedRoutes = this.routesCache.load();
      if (cachedRoutes) {
        this.allRoutes = cachedRoutes;
        console.log('Loaded routes from cache');
        return;
      }

      this.allRoutes = await this.apiService.getRoutesList();
      this.routesCache.save(this.allRoutes);
      console.log(`Loaded ${this.allRoutes.length} routes from API and cached`);
    } catch (error) {
      console.error('Error loading routes:', error);
      throw error;
    }
  }

  async getRouteTrassa(routeId: string, direction: number): Promise<TrassaResponse['data'][0] | null> {
    try {
      // Check cache first
      const cachedTrassa = this.trassaCache.load(routeId, direction);
      if (cachedTrassa) {
        return cachedTrassa;
      }

      const trassa = await this.apiService.getRouteTrassa(routeId, direction);
      if (trassa) {
        this.trassaCache.save(routeId, direction, trassa);
      }
      return trassa;
    } catch (error) {
      console.error('Error fetching route trassa:', error);
      return null;
    }
  }

  searchStops(query: string): StopsListResponse['data'] {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    
    return this.allStops.filter(stop => {
      const stopTitle = stop.title.toLowerCase();
      // Check if all words from the query are present in the stop title
      return words.every(word => stopTitle.includes(word));
    });
  }

  getRouteInfo(routeId: number): RoutesListResponse['data'][0] | undefined {
    return this.allRoutes.find(r => r.id === routeId);
  }

  getAllStops(): StopsListResponse['data'] {
    return this.allStops;
  }

  getAllRoutes(): RoutesListResponse['data'] {
    return this.allRoutes;
  }

  async ensureDataLoaded(): Promise<boolean> {
    try {
      if (!this.allStops || this.allStops.length === 0) {
        await this.loadAllStops();
      }
      if (!this.allRoutes || this.allRoutes.length === 0) {
        await this.loadAllRoutes();
      }
      return (this.allStops && this.allStops.length > 0 && this.allRoutes && this.allRoutes.length > 0);
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  }

  clearCache(): void {
    this.stopsCache.clear();
    this.routesCache.clear();
    this.trassaCache.clearAll();
  }
} 