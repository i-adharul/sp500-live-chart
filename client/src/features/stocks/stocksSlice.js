import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    items: [],
    detail: null,
    history: [],
    news: [],
    insight: null,
    movers: { gainers: [], losers: [] },
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    getAllStocks: (state, action) => {
      state.items = action.payload;
    },
    getStockDetail: (state, action) => {
      state.detail = action.payload;
    },
    getStockHistory: (state, action) => {
      state.history = action.payload;
    },
    getStockNews: (state, action) => {
      state.news = action.payload;
    },
    getStockInsight: (state, action) => {
      state.insight = action.payload;
    },
    getMovers: (state, action) => {
      state.movers = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  getAllStocks,
  getStockDetail,
  getStockHistory,
  getStockNews,
  getStockInsight,
  getMovers,
} = stocksSlice.actions;

export default stocksSlice.reducer;

// Async Thunks
export function fetchStocks(sector = '') {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const params = sector && sector !== 'All' ? { sector } : {};
        const { data } = await axios.get(`${baseUrl}/stocks`, { params });
        dispatch(getAllStocks(data.stocks));
      } catch (err) {
        console.error('fetchStocks error:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to fetch stocks'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}

export function fetchStockDetail(symbol) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${baseUrl}/stocks/${symbol}`);
        dispatch(getStockDetail(data));
      } catch (err) {
        console.error('fetchStockDetail error:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to fetch stock detail'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}

export function fetchStockHistory(symbol, range = '1m') {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${baseUrl}/stocks/${symbol}/history`, {
          params: { range },
        });
        dispatch(getStockHistory(data.data));
      } catch (err) {
        console.error('fetchStockHistory error:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to fetch history'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}

export function fetchStockNews(symbol) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${baseUrl}/stocks/${symbol}/news`);
        dispatch(getStockNews(data.articles));
      } catch (err) {
        console.error('fetchStockNews error:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to fetch news'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}

export function fetchStockInsight(symbol) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${baseUrl}/stocks/${symbol}/insight`);
        dispatch(getStockInsight(data));
      } catch (err) {
        console.error('fetchStockInsight error:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to fetch insight'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}

export function fetchMovers() {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${baseUrl}/market/movers`);
        dispatch(getMovers(data));
      } catch (err) {
        console.error('fetchMovers error:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to fetch movers'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}
