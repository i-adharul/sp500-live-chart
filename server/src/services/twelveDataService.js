const axios = require('axios');

const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

const twelveDataClient = axios.create({
  baseURL: TWELVE_DATA_BASE_URL,
  timeout: 15000,
});

const TIME_SERIES_INTERVAL_MAP = {
  '1m': { interval: '1day', outputsize: 30 },
  '3m': { interval: '1day', outputsize: 90 },
  '1y': { interval: '1day', outputsize: 365 },
};

const getTimeSeries = async (symbol, range = '1m') => {
  try {
    const { interval, outputsize } = TIME_SERIES_INTERVAL_MAP[range] || TIME_SERIES_INTERVAL_MAP['1m'];

    const { data } = await twelveDataClient.get('/time_series', {
      params: {
        symbol,
        interval,
        outputsize,
        apikey: TWELVE_DATA_API_KEY,
      },
    });

    if (data.status === 'error') {
      throw new Error(data.message || 'Twelve Data API error');
    }

    if (!data.values || !Array.isArray(data.values)) {
      return [];
    }

    return data.values.map((item) => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: item.volume ? parseInt(item.volume, 10) : null,
      interval,
    }));
  } catch (error) {
    console.error(`Twelve Data getTimeSeries error for ${symbol}:`, error.message);
    throw error;
  }
};

module.exports = {
  getTimeSeries,
};
