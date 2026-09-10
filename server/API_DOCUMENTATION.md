# S&P 500 AI Dashboard API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful.",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Email, password, and name are required."
}
```

---

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful.",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password."
}
```

---

### POST /auth/google
Login with Google OAuth.

**Request Body:**
```json
{
  "id_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "message": "Google Sign In successful.",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatar_url": "https://..."
  }
}
```

---

### GET /auth/me
Get current user profile. **Requires Auth**

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /auth/me
Update user profile. **Requires Auth**

**Request Body:**
```json
{
  "name": "New Name",
  "avatar_url": "https://..."
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "New Name",
    "avatar_url": "https://..."
  }
}
```---

## Stock Endpoints

### GET /stocks
Get all stocks.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sector | string | Filter by sector (optional) |

**Success Response (200):**
```json
{
  "stocks": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "price": 150.00,
      "change": 2.50,
      "change_percent": 1.69
    }
  ]
}
```

---

### GET /stocks/:symbol
Get stock details by symbol.

**Success Response (200):**
```json
{
  "id": 1,
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "sector": "Technology",
  "exchange": "NASDAQ",
  "country": "US",
  "logo_url": "https://...",
  "market_cap": 2500000000000,
  "pe_ratio": 25.5,
  "week52_high": 200.00,
  "week52_low": 120.00,
  "beta": 1.2,
  "quote": {
    "current_price": 150.00,
    "change": 2.50,
    "change_percent": 1.69,
    "high": 152.00,
    "low": 148.00,
    "open": 149.00,
    "previous_close": 147.50
  }
}
```

**Error Response (404):**
```json
{
  "message": "Stock not found."
}
```

---

### GET /stocks/:symbol/history
Get stock price history (candlestick data).

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| range | string | Time range: `1m`, `3m`, `1y`, `5y` | `1m` |
| interval | string | Candle interval: `5m`, `15m`, `30m`, `1h`, `4h`, `1d`, `1w`, `1M` | `1day` |

**Success Response (200):**
```json
{
  "data": [
    {
      "datetime": "2024-01-01T00:00:00.000Z",
      "open": 150.00,
      "high": 155.00,
      "low": 148.00,
      "close": 152.00,
      "volume": 1000000
    }
  ]
}
```

**Range to Date Mapping:**
| Range | Start Date |
|-------|------------|
| `1m` | 1 month ago |
| `3m` | 3 months ago |
| `1y` | 1 year ago |
| `5y` | 5 years ago |

---

### GET /stocks/:symbol/news
Get related news for a stock.

**Success Response (200):**
```json
{
  "articles": [
    {
      "headline": "Apple announces new product",
      "summary": "...",
      "source": "Reuters",
      "url": "https://...",
      "image_url": "https://...",
      "published_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /stocks/:symbol/insight
Get AI-generated insight for a stock.

**Success Response (200):**
```json
{
  "summary": "Apple shows strong growth potential...",
  "sentiment": "bullish",
  "confidence": 85,
  "keyPoints": [
    "Strong Q4 earnings",
    "New product pipeline"
  ],
  "risk_note": "Market volatility may affect short-term performance"
}
```

---

## Watchlist Endpoints (Require Auth)

### GET /watchlist
Get user's watchlist.

**Success Response (200):**
```json
{
  "watchlist": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 150.00,
      "added_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /watchlist/:symbol
Add stock to watchlist.

**Success Response (201):**
```json
{
  "message": "Stock added to watchlist."
}
```

**Error Response (409):**
```json
{
  "message": "Stock already in watchlist."
}
```

---

### DELETE /watchlist/:symbol
Remove stock from watchlist.

**Success Response (200):**
```json
{
  "message": "Stock removed from watchlist."
}
```

---

## Health Check

### GET /health
Check API health status.

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __test__/auth.test.js

# Run with coverage
npm test -- --coverage
```