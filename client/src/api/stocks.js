import apiClient from './client'

export const fetchStocks = async (sector = '') => {
  const params = sector && sector !== 'All' ? { sector } : {}
  const { data } = await apiClient.get('/stocks', { params })
  return data
}

export const fetchStockDetail = async (symbol) => {
  const { data } = await apiClient.get(`/stocks/${symbol}`)
  return data
}

export const fetchStockHistory = async (symbol, range = '1m', interval = null) => {
  const params = { range }
  if (interval) params.interval = interval
  const { data } = await apiClient.get(`/stocks/${symbol}/history`, { params })
  return data
}

export const fetchStockInsight = async (symbol) => {
  const { data } = await apiClient.get(`/stocks/${symbol}/insight`)
  return data
}

export const fetchStockNews = async (symbol) => {
  const { data } = await apiClient.get(`/stocks/${symbol}/news`)
  return data
}

export const updateProfile = async ({ name, avatar_url }) => {
  const { data } = await apiClient.put('/auth/me', { name, avatar_url })
  return data
}

export const fetchMarketMovers = async () => {
  const { data } = await apiClient.get('/market/movers')
  return data
}
