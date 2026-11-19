# sp500-live-chart

A stock dashboard with live candlestick charts, built on free-tier market data APIs. It tracks a curated sample of **55 S&P 500 stocks** (5 per sector across all 11 GICS sectors) plus **Bitcoin**, and adds Gemini-generated insights, news, and a personal watchlist.

Individual project for the Hacktiv8 Full Stack JavaScript Immersive program.

> **Why only 55 stocks?** The data providers' free tiers are heavily rate limited (see [Rate limits](#rate-limits)). A sample covering every sector keeps the app fully working without paid plans. The stock list lives in one place, so extending it is a small change.

<!-- Add a screenshot or GIF of the stock detail page here:
![Live candlestick chart](images/live-chart.gif)
-->

## Features

- **Live candlestick chart.** The detail page subscribes to a Socket.IO room for the stock. The server relays Finnhub trades and the chart's latest candle updates in real time (details below).
- **Historical charts.** Ranges of 1 month, 3 months, 1 year, and 5 years, with candle intervals from 5 minutes to 1 month. The UI only enables the intervals that make sense for the selected range.
- **Live prices everywhere.** Home, Stocks, and Watchlist cards also update through a global `price-update` event.
- **Home.** Top 5 gainers and losers by daily change.
- **Stocks.** Browse all symbols, filter by sector, search by symbol or name.
- **Stock detail.** Price, daily change, fundamentals (market cap, P/E, 52-week range, beta, open, previous close) with short explanations in Indonesian, AI insight, and recent news.
- **AI insight.** Gemini receives the quote, fundamentals, the last 5 headlines, and 7 days of closing prices. It returns a short Indonesian summary, a sentiment (bullish, bearish, or neutral), a confidence score, highlights, and one risk note. The prompt forbids buy or sell recommendations. The result is stored and reused for 24 hours.
- **Auth and profile.** Register and log in with email and password, or use Google sign-in. Signed-in users can edit their name and avatar URL.
- **Watchlist** per user.

## Tech stack

| Layer | Tools |
| --- | --- |
| Client | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS 4 + DaisyUI, lightweight-charts, socket.io-client, axios, `@react-oauth/google` |
| Server | Node.js, Express 5, Sequelize, PostgreSQL, Socket.IO, `ws`, node-cron, JWT, bcryptjs, google-auth-library |
| External APIs | Finnhub (quotes, company news, crypto news, company metrics, live trades), Twelve Data (candles, crypto quotes), Google Gemini (insights), Google OAuth |
| Testing | Jest, Supertest |

## How it works

### Data pipeline

The app does not call the market APIs on every page view. Data is stored in PostgreSQL and refreshed in the background, and the REST API reads from the database.

| Job (node-cron) | Schedule | What it does |
| --- | --- | --- |
| Quotes | every 4 minutes | Finnhub `/quote` for each symbol (Twelve Data `/quote` for Bitcoin), upserted into `Quotes` |
| News | every 4 hours | Last 7 days of company news per symbol (general crypto news for Bitcoin) |
| Candles | daily at 21:00 | Latest daily candle per symbol from Twelve Data |
| Cleanup | daily at 02:00 | Deletes intraday candles older than 7 days |

Some data also fills in on demand, so a fresh database is still usable:
- History is fetched from Twelve Data and saved the first time a range and interval is requested.
- News is refreshed when the stored articles are older than 6 hours.
- Fundamentals (market cap, P/E, 52-week range, beta) are fetched from Finnhub the first time a stock detail is opened.
- Insights are generated when none exists or the last one is older than 24 hours. The server tries several Gemini models in order, so a retired or overloaded model does not break the feature.

### Live candle

1. When a user opens a stock page, the client emits `subscribe` and joins a room named after the symbol. Leaving the page emits `unsubscribe`, and the client resubscribes automatically after a reconnect.
2. The server keeps one connection to Finnhub's trade WebSocket and subscribes to a symbol only while at least one viewer is in its room. If the connection drops, it reconnects after 5 seconds.
3. For each trade, the server updates a running open, high, low, and close for that symbol, starting from the first trade after the first viewer joined. It emits `candle-update` to the room at most once per second per symbol.
4. The chart merges each update into its latest bar. If a new period has started, it starts a new bar.

Bitcoin is mapped to the right formats for each provider (`BTC` to `BTC/USD` on Twelve Data and `BINANCE:BTCUSDT` on Finnhub), so it also works as a 24/7 way to see the live chart.

### Rate limits

Calls inside the cron jobs are spaced out (about 1.1 seconds per symbol for Finnhub, about 8.5 seconds per symbol for Twelve Data) to stay within free-tier limits. This is the reason the app tracks a sample instead of the full index.

## Project structure

```
client/
  src/
    pages/        Home, Stocks, StockDetail, Watchlist, Profile, Login
    components/   CandlestickChart, AIInsightCard, StockCard, ...
    features/     Redux slices (auth, stocks, watchlist)
    hooks/        useSocket, useLiveCandle
    api/          axios client and API calls
server/
  controllers/  routes/  middlewares/  helpers/
  models/  migrations/  seeders/
  services/     finnhubService, twelveDataService, geminiService
  socket/       Socket.IO server and Finnhub WebSocket relay
  jobs/         cron jobs
  constants/    tracked symbols and crypto symbol mapping
  __test__/     Jest tests
  API_DOCUMENTATION.md
```

## API

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/google` | no | Sign up and sign in |
| GET, PUT | `/auth/me` | yes | Read or update the profile |
| GET | `/stocks` | no | All stocks, optional `?sector=` |
| GET | `/stocks/:symbol` | no | Details, fundamentals, and latest quote |
| GET | `/stocks/:symbol/history` | no | Candles, with `?range=` and `?interval=` |
| GET | `/stocks/:symbol/news` | no | Recent news |
| GET | `/stocks/:symbol/insight` | no | AI insight |
| GET | `/market/movers` | no | Top gainers and losers |
| GET, POST, DELETE | `/watchlist`, `/watchlist/:stock_id` | yes | Manage the watchlist |
| GET | `/health` | no | Health check |

Request and response examples and error codes are in [`server/API_DOCUMENTATION.md`](server/API_DOCUMENTATION.md).

## Run locally

You need Node.js, PostgreSQL, API keys for Finnhub, Twelve Data, and Gemini, and a Google OAuth client ID.

**1. Server**

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`. Use port 3000 so it matches the client:

```
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
FINNHUB_API_KEY=
TWELVE_DATA_API_KEY=
GEMINI_API_KEY=
JWT_SECRET=
GOOGLE_CLIENT_ID=
```

Create a PostgreSQL database named `snp_500_ai` (the credentials are in `server/config/config.json`, change them if yours differ), then:

```bash
npm run db:setup   # runs migrations and seeders
npm run dev
```

The seeders add the 55 stocks, Bitcoin, and a default admin user for local development.

**2. Client**

```bash
cd client
npm install
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=
```

```bash
npm run dev
```

Open http://localhost:5173. Add that address to the authorized JavaScript origins of your Google OAuth client.

On a fresh database, quotes fill in after the first quote job runs (within 4 minutes), and history, news, fundamentals, and insights load the first time you open a stock.

## Tests

```bash
cd server
npm test
```

There are about 190 test cases:
- **Integration tests** (Supertest) cover auth, stocks, market movers, watchlist, middleware, and error handling. They run against a real PostgreSQL test database, `snp_500_ai_test`, which Jest selects automatically. Create it and run `NODE_ENV=test npx sequelize-cli db:migrate` first.
- **Unit tests** cover the Finnhub, Twelve Data, and Gemini services, the controllers, and the crypto symbol helpers. External APIs and models are mocked, so these run without network access.

## Notes

- Live ticks come in only while the US market is open (09:30 to 16:00 Eastern, weekdays), except for Bitcoin, which trades around the clock. Outside market hours the chart simply shows the last known data until a trade arrives.
- Free-tier data can be delayed or incomplete. This is a portfolio project, not financial advice.
- The seeded admin account is for local development only. Remove or change it before deploying.
