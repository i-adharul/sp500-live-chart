import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const token = localStorage.getItem('access_token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user || null,
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
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
  },
});

export const { setLoading, setError, setAuth, logout } = authSlice.actions;

export default authSlice.reducer;

// Async Thunks
export function login(email, password) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.post(`${baseUrl}/auth/login`, { email, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch(setAuth({ token: data.access_token, user: data.user }));
        return { success: true };
      } catch (err) {
        console.error('login error:', err);
        const message = err.response?.data?.message || 'Login failed';
        dispatch(setError(message));
        return { success: false, message };
      } finally {
        dispatch(setLoading(false));
      }
    }
    return fetch();
  };
}

export function register(name, email, password) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.post(`${baseUrl}/auth/register`, {
          name,
          email,
          password,
        });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch(setAuth({ token: data.access_token, user: data.user }));
        return { success: true };
      } catch (err) {
        console.error('register error:', err);
        const message = err.response?.data?.message || 'Registration failed';
        dispatch(setError(message));
        return { success: false, message };
      } finally {
        dispatch(setLoading(false));
      }
    }
    return fetch();
  };
}

export function googleLogin(idToken) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.post(`${baseUrl}/auth/google`, {
          id_token: idToken,
        });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch(setAuth({ token: data.access_token, user: data.user }));
        return { success: true };
      } catch (err) {
        console.error('googleLogin error:', err);
        const message = err.response?.data?.message || 'Google Sign In failed';
        dispatch(setError(message));
        return { success: false, message };
      } finally {
        dispatch(setLoading(false));
      }
    }
    return fetch();
  };
}
