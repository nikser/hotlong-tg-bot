interface Platform {
  id: number;
  lat: number;
  lng: number;
}

interface Stop {
  id: string;
  title: string;
  platforms: Platform[];
}

export interface StopsListResponse {
  apiVersion: string;
  data: Stop[];
}

interface Route {
  id: number;
  transport_type: number;
  title: string;
  name_begin: string;
  name_end: string;
  begin_stop_id: number;
  end_stop_id: number;
  fare: number;
}

export interface RoutesListResponse {
  apiVersion: string;
  data: Route[];
}

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  azimuth: number;
  predict: number;
}

interface TransportData {
  id_alias: number;
  transport_type: number;
  direction: number;
  marker: MarkerData[];
}

export interface ForecastResponse {
  apiVersion: number;
  data: TransportData[];
}

interface TrassaPoint {
  id_stop?: number;
  name_stop?: string;
  id_platform?: number;
  order: number;
  lat: number;
  lng: number;
}

interface RouteTrassa {
  id_route: number;
  title: string;
  direction: number;
  trassa: TrassaPoint[];
}

export interface TrassaResponse {
  apiVersion: string;
  data: RouteTrassa[];
} 