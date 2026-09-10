import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from '../auth/authSlice';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    items: [],
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
    setWatchlist: (state, action) => {
      state.items = action.payload;
    },
    addToWatchlist: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromWatchlist: (state, action) => {
      state.items = state.items.filter((item) => item.stock_id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
});

// Async Thunks
export function fetchWatchlist() {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${baseUrl}/watchlist`, authHeader());
        dispatch(setWatchlist(data.watchlist));
      } catch (err) {
        console.error('fetchWatchlist error:', err);
        // Token invalid/kadaluarsa -> bersihkan sesi supaya halaman menampilkan Login Required
        if (err.response?.status === 401) {
          dispatch(logout());
        }
        dispatch(setError(err.response?.data?.message || 'Failed to fetch watchlist'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetch();
  };
}

export function addWatchlist(stockId) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.post(
          `${baseUrl}/watchlist`,
          { stock_id: stockId },
          authHeader(),
        );
        dispatch(addToWatchlist(data.data));
        return { success: true };
      } catch (err) {
        console.error('addWatchlist error:', err);
        if (err.response?.status === 401) {
          dispatch(logout());
        }
        const message = err.response?.data?.message || 'Failed to add to watchlist';
        dispatch(setError(message));
        return { success: false, message };
      } finally {
        dispatch(setLoading(false));
      }
    }
    return fetch();
  };
}

export function removeWatchlist(stockId) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        await axios.delete(`${baseUrl}/watchlist/${stockId}`, authHeader());
        dispatch(removeFromWatchlist(stockId));
        return { success: true };
      } catch (err) {
        console.error('removeWatchlist error:', err);
        if (err.response?.status === 401) {
          dispatch(logout());
        }
        const message = err.response?.data?.message || 'Failed to remove from watchlist';
        dispatch(setError(message));
        return { success: false, message };
      } finally {
        dispatch(setLoading(false));
      }
    }
    return fetch();
  };
}
