import { createSlice } from '@reduxjs/toolkit'
import {
  fetchWatchlistApi,
  addWatchlistApi,
  removeWatchlistApi,
} from '../../api/watchlist'
import { logout } from '../auth/authSlice'

// Thunk watchlist (manual currying) memanggil fungsi di api/watchlist.js
// (apiClient + interceptor token otomatis).
// 401 (token invalid) -> logout supaya UI menampilkan Login Required.

export const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoadingWatchlist: (state, action) => {
      state.loading = action.payload
    },
    setErrorWatchlist: (state, action) => {
      state.error = action.payload
    },
    setWatchlist: (state, action) => {
      state.items = action.payload
    },
    addToWatchlist: (state, action) => {
      state.items.push(action.payload)
    },
    removeFromWatchlist: (state, action) => {
      state.items = state.items.filter((item) => item.stock_id !== action.payload)
    },
  },
})

export const {
  setLoadingWatchlist,
  setErrorWatchlist,
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = watchlistSlice.actions

export default watchlistSlice.reducer

// Async thunks (manual currying: return (dispatch) => {...})
export function fetchWatchlist() {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingWatchlist(true))
        dispatch(setErrorWatchlist(null))
        const data = await fetchWatchlistApi()
        dispatch(setWatchlist(data.watchlist || data || []))
      } catch (err) {
        if (err?.response?.status === 401 || err?.status === 401) dispatch(logout())
        dispatch(setErrorWatchlist(err.message || 'Failed to fetch watchlist'))
      } finally {
        dispatch(setLoadingWatchlist(false))
      }
    }
    fetch()
  }
}

export function addWatchlist(stockId) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingWatchlist(true))
        dispatch(setErrorWatchlist(null))
        const data = await addWatchlistApi(stockId)
        dispatch(addToWatchlist(data.data || data))
        return { success: true }
      } catch (err) {
        if (err?.response?.status === 401 || err?.status === 401) dispatch(logout())
        const message = err.message || 'Failed to add to watchlist'
        dispatch(setErrorWatchlist(message))
        return { success: false, message }
      } finally {
        dispatch(setLoadingWatchlist(false))
      }
    }
    return fetch()
  }
}

export function removeWatchlist(stockId) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingWatchlist(true))
        dispatch(setErrorWatchlist(null))
        await removeWatchlistApi(stockId)
        dispatch(removeFromWatchlist(stockId))
        return { success: true }
      } catch (err) {
        if (err?.response?.status === 401 || err?.status === 401) dispatch(logout())
        const message = err.message || 'Failed to remove from watchlist'
        dispatch(setErrorWatchlist(message))
        return { success: false, message }
      } finally {
        dispatch(setLoadingWatchlist(false))
      }
    }
    return fetch()
  }
}

