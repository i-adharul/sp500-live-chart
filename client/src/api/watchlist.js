import apiClient from './client'

export const fetchWatchlistApi = async () => {
  const { data } = await apiClient.get('/watchlist')
  return data
}

export const addWatchlistApi = async (stockId) => {
  const { data } = await apiClient.post('/watchlist', { stock_id: stockId })
  return data
}

export const removeWatchlistApi = async (stockId) => {
  await apiClient.delete(`/watchlist/${stockId}`)
}
