import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN must be provided in environment variables');
}

if (!process.env.NSKGORTRANS_API_TOKEN) {
  throw new Error('NSKGORTRANS_API_TOKEN must be provided in environment variables');
}

// Parse admin user IDs from environment variable
const parseAdminIds = (): number[] => {
  const adminIdsStr = process.env.ADMIN_USER_IDS;
  console.log(`Parsing admin IDs from ${adminIdsStr}`);
  if (!adminIdsStr) return [];
  
  return adminIdsStr
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
};

export const config = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  NSKGORTRANS_API_TOKEN: process.env.NSKGORTRANS_API_TOKEN,
  ADMIN_USER_IDS: parseAdminIds(),
  NSKGORTRANS_BASE_URL: 'https://api.nskgortrans.ru',
  STOPS_LIST_ENDPOINT: 'https://api.nskgortrans.ru/stop/list/all',
  ROUTES_LIST_ENDPOINT: 'https://api.nskgortrans.ru/route/list/all',
  FORECAST_ENDPOINT: 'https://api.nskgortrans.ru/forecast/platform/id'
} as const; 