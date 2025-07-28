# NSK Transport Bot

A Telegram bot that provides real-time public transport arrival forecasts for Novosibirsk using the NSK Gortrans API.

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Telegram bot token:
```
TELEGRAM_TOKEN=your_telegram_bot_token_here
NSKGORTRANS_API_TOKEN=your_nskgortrans_api_token
```

4. Build and run the bot:
```bash
# For development
npm run dev

# For production
npm run build
npm start
```

## Usage

1. Start a chat with the bot on Telegram
2. Send the `/start` command to get started
3. Send a bus stop name to get the arrival forecast
4. Use `/help` to see usage instructions

## Features

- Search for bus stops by name
- Get real-time arrival forecasts for all routes at a stop
- User-friendly interface with emoji indicators
- Error handling for invalid stops or API issues

## Requirements

- Node.js 16+
- npm or yarn
- A Telegram Bot Token (get it from @BotFather)
