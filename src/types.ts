interface Platform {
  id: string;
  lat: string;
  lng: string;
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
  id: string;
  type_transport: string;
  title: string;
  name_begin: string;
  name_end: string;
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
  id_stop?: string;
  name_stop?: string;
  id_platform?: string;
  order: number;
  lat: string;
  lng: string;
}

interface RouteTrassa {
  id_route: string;
  title: string;
  direction: number;
  trassa: TrassaPoint[];
}

export interface TrassaResponse {
  apiVersion: string;
  data: RouteTrassa[];
} 