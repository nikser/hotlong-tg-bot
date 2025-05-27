import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN must be provided in environment variables');
}

if (!process.env.NSKGORTRANS_API_TOKEN) {
  throw new Error('NSKGORTRANS_API_TOKEN must be provided in environment variables');
}

export const config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  NSKGORTRANS_API_TOKEN: process.env.NSKGORTRANS_API_TOKEN,
  NSKGORTRANS_BASE_URL: 'https://api.nskgortrans.ru',
  STOPS_LIST_ENDPOINT: 'https://api.nskgortrans.ru/stop/list/all',
  ROUTES_LIST_ENDPOINT: 'https://api.nskgortrans.ru/route/list/all',
  FORECAST_ENDPOINT: 'https://api.nskgortrans.ru/forecast/platform/id'
} as const; 