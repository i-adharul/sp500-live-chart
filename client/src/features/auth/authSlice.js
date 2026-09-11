import { createSlice } from '@reduxjs/toolkit'
import { loginApi, registerApi, googleLoginApi, updateProfileApi } from '../../api/auth'

// Thunk auth (manual currying) memanggil fungsi di api/auth.js
// (apiClient + interceptor). Hasil sukses dikembalikan sebagai { success, ... }
// supaya komponen (Login/Profile) tetap bisa membaca result.success seperti dulu.

const token = localStorage.getItem('access_token')
const user = JSON.parse(localStorage.getItem('user') || 'null')

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user || null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoadingAuth: (state, action) => {
      state.loading = action.payload
    },
    setErrorAuth: (state, action) => {
      state.error = action.payload
    },
    setAuth: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.error = null
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },
  },
})

export const { setLoadingAuth, setErrorAuth, setAuth, logout } = authSlice.actions

export default authSlice.reducer

// Async thunks (manual currying: return (dispatch) => {...})
export function login(email, password) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingAuth(true))
        dispatch(setErrorAuth(null))
        const data = await loginApi({ email, password })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        dispatch(setAuth({ token: data.access_token, user: data.user }))
        return { success: true }
      } catch (err) {
        const message = err.message || 'Login failed'
        dispatch(setErrorAuth(message))
        return { success: false, message }
      } finally {
        dispatch(setLoadingAuth(false))
      }
    }
    return fetch()
  }
}

export function register(name, email, password) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingAuth(true))
        dispatch(setErrorAuth(null))
        const data = await registerApi({ name, email, password })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        dispatch(setAuth({ token: data.access_token, user: data.user }))
        return { success: true }
      } catch (err) {
        const message = err.message || 'Registration failed'
        dispatch(setErrorAuth(message))
        return { success: false, message }
      } finally {
        dispatch(setLoadingAuth(false))
      }
    }
    return fetch()
  }
}

export function updateProfile(name, avatarUrl) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingAuth(true))
        dispatch(setErrorAuth(null))
        const data = await updateProfileApi({ name, avatar_url: avatarUrl })
        localStorage.setItem('user', JSON.stringify(data.user))
        dispatch(setAuth({ token: localStorage.getItem('access_token'), user: data.user }))
        return { success: true, user: data.user }
      } catch (err) {
        const message = err.message || 'Failed to update profile'
        dispatch(setErrorAuth(message))
        return { success: false, message }
      } finally {
        dispatch(setLoadingAuth(false))
      }
    }
    return fetch()
  }
}

export function googleLogin(idToken) {
  return (dispatch) => {
    async function fetch() {
      try {
        dispatch(setLoadingAuth(true))
        dispatch(setErrorAuth(null))
        const data = await googleLoginApi(idToken)
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        dispatch(setAuth({ token: data.access_token, user: data.user }))
        return { success: true }
      } catch (err) {
        const message = err.message || 'Google Sign In failed'
        dispatch(setErrorAuth(message))
        return { success: false, message }
      } finally {
        dispatch(setLoadingAuth(false))
      }
    }
    return fetch()
  }
}

