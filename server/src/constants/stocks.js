const STOCKS = [
  // Technology (5)
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },

  // Healthcare (5)
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co., Inc.', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare' },

  // Financials (5)
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financials' },
  { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financials' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financials' },

  // Consumer Discretionary (5)
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'HD', name: 'The Home Depot, Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Discretionary' },
  { symbol: 'NKE', name: 'NIKE, Inc.', sector: 'Consumer Discretionary' },

  // Consumer Staples (5)
  { symbol: 'PG', name: 'The Procter & Gamble Company', sector: 'Consumer Staples' },
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Staples' },
  { symbol: 'PEP', name: 'PepsiCo, Inc.', sector: 'Consumer Staples' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples' },

  // Communication Services (5)
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Communication Services' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication Services' },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services' },

  // Industrials (5)
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
  { symbol: 'BA', name: 'The Boeing Company', sector: 'Industrials' },
  { symbol: 'HON', name: 'Honeywell International Inc.', sector: 'Industrials' },
  { symbol: 'UPS', name: 'United Parcel Service, Inc.', sector: 'Industrials' },
  { symbol: 'RTX', name: 'RTX Corporation', sector: 'Industrials' },

  // Energy (5)
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger Limited', sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources, Inc.', sector: 'Energy' },

  // Utilities (5)
  { symbol: 'NEE', name: 'NextEra Energy, Inc.', sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', sector: 'Utilities' },
  { symbol: 'SO', name: 'The Southern Company', sector: 'Utilities' },
  { symbol: 'D', name: 'Dominion Energy, Inc.', sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power Company, Inc.', sector: 'Utilities' },

  // Real Estate (5)
  { symbol: 'PLD', name: 'Prologis, Inc.', sector: 'Real Estate' },
  { symbol: 'AMT', name: 'American Tower Corporation', sector: 'Real Estate' },
  { symbol: 'CCI', name: 'Crown Castle Inc.', sector: 'Real Estate' },
  { symbol: 'EQIX', name: 'Equinix, Inc.', sector: 'Real Estate' },
  { symbol: 'SPG', name: 'Simon Property Group, Inc.', sector: 'Real Estate' },

  // Materials (5)
  { symbol: 'LIN', name: 'Linde plc', sector: 'Materials' },
  { symbol: 'APD', name: 'Air Products and Chemicals, Inc.', sector: 'Materials' },
  { symbol: 'SHW', name: 'The Sherwin-Williams Company', sector: 'Materials' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', sector: 'Materials' },
  { symbol: 'NEM', name: 'Newmont Corporation', sector: 'Materials' },
];

module.exports = { STOCKS };
