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

export const fetchStockHistory = async (symbol, range = '1m') => {
  const { data } = await apiClient.get(`/stocks/${symbol}/history`, {
    params: { range },
  })
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

export const fetchMarketMovers = async () => {
  const { data } = await apiClient.get('/market/movers')
  return data
}
