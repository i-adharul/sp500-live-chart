import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchStockDetail, fetchStockHistory, fetchStockInsight, fetchStockNews } from '../api/stocks'
import { formatPrice, formatMarketCap, formatNumber } from '../utils/formatters'
import { useSocket } from '../hooks/useSocket'
import PriceChange from '../components/PriceChange'
import CandlestickChart from '../components/CandlestickChart'
import AIInsightCard from '../components/AIInsightCard'
import NewsListItem from '../components/NewsListItem'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorState from '../components/ErrorState'

const RANGE_OPTIONS = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '1y', label: '1 Year' },
]

export default function StockDetail() {
  const { symbol } = useParams()
  const [stock, setStock] = useState(null)
  const [history, setHistory] = useState([])
  const [insight, setInsight] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRange, setSelectedRange] = useState('1m')
  const [realtimePrice, setRealtimePrice] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [insightError, setInsightError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Insight & news boleh gagal tanpa merusak halaman utama
        // (mis. GEMINI_API_KEY belum diisi di server -> 503)
        const [stockRes, historyRes, insightRes, newsRes] = await Promise.allSettled([
          fetchStockDetail(symbol),
          fetchStockHistory(symbol, selectedRange),
          fetchStockInsight(symbol),
          fetchStockNews(symbol),
        ])

        // Detail saham wajib berhasil, kalau gagal baru tampilkan error page
        if (stockRes.status === 'rejected') {
          throw stockRes.reason
        }

        setStock(stockRes.value)
        setHistory(
          historyRes.status === 'fulfilled'
            ? (historyRes.value.data || historyRes.value || [])
            : []
        )

        if (insightRes.status === 'fulfilled') {
          setInsight(insightRes.value)
          setInsightError(null)
        } else {
          setInsight(null)
          setInsightError(insightRes.reason?.message || 'AI insight not available.')
        }

        setNews(
          newsRes.status === 'fulfilled'
            ? (newsRes.value.articles || newsRes.value || [])
            : []
        )
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [symbol, selectedRange])

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true)
      try {
        const historyData = await fetchStockHistory(symbol, selectedRange)
        setHistory(historyData.data || historyData || [])
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    if (symbol) loadHistory()
  }, [symbol, selectedRange])

  useSocket('price-update', (data) => {
    if (data && data.symbol === symbol && data.price !== undefined) {
      setRealtimePrice(data.price)
    }
  })

  const displayPrice = realtimePrice ?? stock?.price
  const displayChange = realtimePrice && stock?.previousClose
    ? ((realtimePrice - stock.previousClose) / stock.previousClose) * 100
    : stock?.change

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/stocks" className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-white mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Stocks
          </Link>
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/stocks" className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-white mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Stocks
          </Link>
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  const fundamentals = [
    { label: 'Market Cap', value: formatMarketCap(stock?.marketCap) },
    { label: 'P/E Ratio', value: formatNumber(stock?.peRatio, 2) },
    { label: '52W High', value: formatPrice(stock?.weekHigh52) },
    { label: '52W Low', value: formatPrice(stock?.weekLow52) },
    { label: 'Beta', value: formatNumber(stock?.beta, 2) },
    { label: 'Volume', value: stock?.volume ? stock.volume.toLocaleString() : '--' },
    { label: 'Avg Volume', value: stock?.avgVolume ? stock.avgVolume.toLocaleString() : '--' },
    { label: 'Dividend Yield', value: stock?.dividendYield ? `${stock.dividendYield}%` : '--' },
  ]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/stocks" className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-white mb-6 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Stocks
        </Link>
        <div className="bg-base-200 rounded-xl p-6 border border-base-300 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {stock?.logo ? (
              <img src={stock.logo} alt={symbol} className="w-16 h-16 rounded-xl bg-base-100 p-2" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-base-300 to-base-100 flex items-center justify-center text-lg font-bold text-base-content/70">
                {symbol.slice(0, 2)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{stock?.name || symbol}</h1>
                <span className="px-2 py-0.5 rounded bg-base-300 text-xs text-base-content/60">{stock?.exchange || 'NYSE'}</span>
              </div>
              <p className="text-base-content/50">{symbol} • {stock?.sector}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-mono font-bold text-white">{formatPrice(displayPrice)}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <PriceChange value={displayChange} />
                {realtimePrice && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-200 rounded-xl p-6 border border-base-300 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Price Chart</h2>
            <div className="flex gap-1 bg-base-300 rounded-lg p-1">
              {RANGE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSelectedRange(opt.value)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedRange === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'text-base-content/50 hover:text-white'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {historyLoading ? (
            <div className="h-80 bg-base-300 rounded-lg animate-pulse" />
          ) : (
            <CandlestickChart data={history} symbol={symbol} />
          )}
        </div>
        <div className="mb-6">
          <AIInsightCard insight={insight} loading={loading} error={insightError} />
        </div>
        <div className="bg-base-200 rounded-xl p-6 border border-base-300 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Fundamentals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fundamentals.map((item) => (
              <div key={item.label} className="bg-base-300/50 rounded-lg p-3">
                <p className="text-xs text-base-content/50 mb-1">{item.label}</p>
                <p className="text-sm font-mono font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-base-200 rounded-xl p-6 border border-base-300">
          <h2 className="text-lg font-semibold text-white mb-4">Related News</h2>
          {news.length === 0 ? (
            <p className="text-sm text-base-content/50 text-center py-8">No news available</p>
          ) : (
            <div className="divide-y divide-base-300">
              {news.slice(0, 5).map((article, index) => (
                <NewsListItem key={index} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

