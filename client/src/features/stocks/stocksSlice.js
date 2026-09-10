import { createSlice } from '@reduxjs/toolkit'
import {
  fetchStocks as fetchStocksApi,
  fetchStockDetail as fetchStockDetailApi,
  fetchStockHistory as fetchStockHistoryApi,
  fetchStockNews as fetchStockNewsApi,
  fetchStockInsight as fetchStockInsightApi,
  fetchMarketMovers as fetchMarketMoversApi,
} from '../../api/stocks'

// Satu-satunya sumber fetch data saham: fungsi di api/stocks.js (apiClient +
// interceptor token & normalisasi error). Thunk di bawah hanya mengatur
// loading/error + menyimpan hasil ke Redux store — tidak ada axios langsung.

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
    setLoadingStocks: (state, action) => {
      state.loading = action.payload
    },
    setErrorStocks: (state, action) => {
      state.error = action.payload
    },
    getAllStocks: (state, action) => {
      state.items = action.payload
    },
    getStockDetail: (state, action) => {
      state.detail = action.payload
    },
    getStockHistory: (state, action) => {
      state.history = action.payload
    },
    getStockNews: (state, action) => {
      state.news = action.payload
    },
    getStockInsight: (state, action) => {
      state.insight = action.payload
    },
    getMovers: (state, action) => {
      state.movers = action.payload
    },
  },
})

export const {
  setLoadingStocks,
  setErrorStocks,
  getAllStocks,
  getStockDetail,
  getStockHistory,
  getStockNews,
  getStockInsight,
  getMovers,
} = stocksSlice.actions

export default stocksSlice.reducer

// Async thunks (manual currying: return (dispatch) => {...})
export function fetchStocks(sector = '') {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingStocks(true))
        dispatch(setErrorStocks(null))
        const data = await fetchStocksApi(sector)
        dispatch(getAllStocks(data.stocks || data || []))
      } catch (err) {
        dispatch(setErrorStocks(err.message || 'Failed to fetch stocks'))
      } finally {
        dispatch(setLoadingStocks(false))
      }
    }
    fetch()
  }
}

export function fetchStockDetail(symbol) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingStocks(true))
        dispatch(setErrorStocks(null))
        const data = await fetchStockDetailApi(symbol)
        dispatch(getStockDetail(data))
      } catch (err) {
        dispatch(setErrorStocks(err.message || 'Failed to fetch stock detail'))
      } finally {
        dispatch(setLoadingStocks(false))
      }
    }
    fetch()
  }
}

export function fetchStockHistory(symbol, range = '1m', interval = null) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingStocks(true))
        dispatch(setErrorStocks(null))
        const data = await fetchStockHistoryApi(symbol, range, interval)
        dispatch(getStockHistory(data.data || data || []))
      } catch (err) {
        dispatch(setErrorStocks(err.message || 'Failed to fetch history'))
      } finally {
        dispatch(setLoadingStocks(false))
      }
    }
    fetch()
  }
}

export function fetchStockNews(symbol) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingStocks(true))
        dispatch(setErrorStocks(null))
        const data = await fetchStockNewsApi(symbol)
        dispatch(getStockNews(data.articles || data || []))
      } catch (err) {
        dispatch(setErrorStocks(err.message || 'Failed to fetch news'))
      } finally {
        dispatch(setLoadingStocks(false))
      }
    }
    fetch()
  }
}

export function fetchStockInsight(symbol) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingStocks(true))
        dispatch(setErrorStocks(null))
        const data = await fetchStockInsightApi(symbol)
        dispatch(getStockInsight(data))
      } catch (err) {
        dispatch(setErrorStocks(err.message || 'Failed to fetch insight'))
      } finally {
        dispatch(setLoadingStocks(false))
      }
    }
    fetch()
  }
}

export function fetchMovers() {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingStocks(true))
        dispatch(setErrorStocks(null))
        const data = await fetchMarketMoversApi()
        dispatch(getMovers(data))
      } catch (err) {
        dispatch(setErrorStocks(err.message || 'Failed to fetch movers'))
      } finally {
        dispatch(setLoadingStocks(false))
      }
    }
    fetch()
  }
}

