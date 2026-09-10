import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { fetchStockDetail, fetchStockHistory, fetchStockInsight, fetchStockNews } from '../api/stocks'
import { formatPrice, formatMarketCap, formatNumber } from '../utils/formatters'
import { useSocket } from '../hooks/useSocket'
import PriceChange from '../components/PriceChange'
import WatchlistStarButton from '../components/WatchlistStarButton'
import CandlestickChart from '../components/CandlestickChart'
import AIInsightCard from '../components/AIInsightCard'
import NewsListItem from '../components/NewsListItem'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorState from '../components/ErrorState'

const RANGE_OPTIONS = [
  { value: '1m', label: '1 Bulan' },
  { value: '3m', label: '3 Bulan' },
  { value: '1y', label: '1 Tahun' },
]

// Interval candle: per berapa lama 1 candle dibentuk.
// 5m/15m/30m/1h/4h = intraday, 1d/1w/1M = harian/mingguan/bulanan.
const INTERVAL_OPTIONS = [
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
  { value: '1w', label: '1w' },
  { value: '1M', label: '1M' },
]

// Keterangan tiap metric fundamental: artinya & hubungannya dengan metric lain
const FUNDAMENTAL_INFO = {
  'Market Cap': 'Kapitalisasi pasar: harga saham × jumlah saham beredar = nilai total perusahaan di bursa. Acuan utama ukuran perusahaan (large/mid/small cap) — makin besar biasanya makin stabil & likuid.',
  'P/E Ratio': 'Price-to-Earnings: harga saham dibagi laba bersih per saham. Mengukur "mahal/murah"-nya saham relatif ke profitnya: tinggi = pasar menaruh ekspektasi pertumbuhan tinggi, rendah = valuasi murah. Paling adil dibandingkan dengan rata-rata sektor yang sama.',
  '52W High': 'Harga tertinggi 12 bulan terakhir. Dipakai bersama 52W Low: posisi harga sekarang di antara keduanya menunjukkan seberapa "panas" saham ini dalam setahun. Dekat 52W High = momentum kuat; jauh di bawahnya = sedang tertekan.',
  '52W Low': 'Harga terendah 12 bulan terakhir. Pasangan dari 52W High untuk mengukur rentang pergerakan setahun — jarak harga sekarang dari 52W Low menunjukkan seberapa jauh saham sudah naik/pulih.',
  'Beta': 'Sensitivitas harga saham terhadap pergerakan pasar (S&P 500). Beta 1 = bergerak seiring pasar; > 1 = lebih agresif/volatile (naik lebih tinggi saat pasar naik, turun lebih dalam saat pasar jatuh); < 1 = lebih defensif. Dipakai untuk mengukur risiko.',
  'Volume': 'Jumlah lembar saham yang diperdagangkan hari ini. Volume tinggi = likuid dan memberi konfirmasi arah harga; pergerakan harga dengan volume rendah lebih mudah berbalik.',
  'Open': 'Harga pembukaan sesi perdagangan hari ini. Dibandingkan dengan harga sekarang & Prev Close untuk melihat arah intraday (gap naik/turun dibanding penutupan kemarin).',
  'Prev Close': 'Harga penutupan sesi sebelumnya — dasar resmi perhitungan perubahan hari ini: (harga sekarang − prev close) ÷ prev close = % change yang tampil di header.',
}

export default function StockDetail() {
  const { symbol } = useParams()
  const [stock, setStock] = useState(null)
  const [history, setHistory] = useState([])
  const [insight, setInsight] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRange, setSelectedRange] = useState('1m')
  const [selectedInterval, setSelectedInterval] = useState(null) // null = pakai range preset
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
        const historyData = await fetchStockHistory(symbol, selectedRange, selectedInterval)
        setHistory(historyData.data || historyData || [])
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    if (symbol) loadHistory()
  }, [symbol, selectedRange, selectedInterval])

  const handleRangeChange = (value) => {
    setSelectedRange(value)
    setSelectedInterval(null) // kembali ke preset harian saat ganti range
  }

  useSocket('price-update', (data) => {
    if (data && data.symbol === symbol && data.price !== undefined) {
      setRealtimePrice(data.price)
    }
  })

  const quote = stock?.quote
  const displayPrice = realtimePrice ?? quote?.current_price ?? stock?.price
  const displayChange = realtimePrice && quote?.previous_close
    ? ((realtimePrice - quote.previous_close) / quote.previous_close) * 100
    : quote?.change_percent ?? stock?.change
  // perubahan absolut (dalam $) harga sekarang vs penutupan sebelumnya
  const displayChangeAmount = realtimePrice && quote?.previous_close
    ? realtimePrice - quote.previous_close
    : quote?.change ?? stock?.change

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
    {
      label: 'Market Cap',
      value: formatMarketCap(stock?.market_cap),
      hint: 'Nilai total pasar semua saham perusahaan (harga × jumlah saham beredar). Mengukur UKURAN perusahaan — makin besar umumnya makin stabil & likuid. Beda dengan P/E yang mengukur harga relatif terhadap laba.',
    },
    {
      label: 'P/E Ratio',
      value: formatNumber(stock?.pe_ratio, 2),
      hint: 'Harga saham ÷ laba per saham (EPS). Makin tinggi = investor membayar mahal untuk tiap unit laba (ekspektasi pertumbuhan tinggi); makin rendah = relatif murah. Bandingkan dengan rata-rata sektor yang sama.',
    },
    {
      label: '52W High',
      value: formatPrice(stock?.week52_high),
      hint: 'Harga tertinggi 12 bulan terakhir. Harga sekarang mendekati 52W High = momentum kuat / rawan overbought. Bersama 52W Low membentuk rentang pergerakan setahun.',
    },
    {
      label: '52W Low',
      value: formatPrice(stock?.week52_low),
      hint: 'Harga terendah 12 bulan terakhir. Posisi harga sekarang di antara 52W Low–High menunjukkan posisi siklus: dekat low = area value, dekat high = area puncak.',
    },
    {
      label: 'Beta',
      value: formatNumber(stock?.beta, 2),
      hint: 'Sensitivitas saham terhadap pergerakan pasar (S&P 500 = 1). Beta 1.2 = biasanya bergerak 20% lebih agresif dari pasar; di bawah 1 = lebih tenang/defensif. Makin tinggi beta, makin besar fluktuasi.',
    },
    {
      label: 'Volume',
      value: quote?.volume ? Number(quote.volume).toLocaleString() : '--',
      hint: 'Jumlah lembar saham yang diperdagangkan hari ini. Volume tinggi = likuid & mengonfirmasi arah pergerakan harga; volume rendah = harga mudah berbalik arah.',
    },
    {
      label: 'Open',
      value: formatPrice(quote?.open),
      hint: 'Harga transaksi pertama saat bursa dibuka hari ini. Dibanding Prev Close = gap naik/turun pembukaan; dibanding harga sekarang = arah pergerakan intraday.',
    },
    {
      label: 'Prev Close',
      value: formatPrice(quote?.previous_close),
      hint: 'Harga penutupan bursa sebelumnya — acuan resmi perhitungan perubahan harga hari ini. Semua angka +/-% dan "vs prev. close" di halaman ini dihitung dari nilai ini.',
    },
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
            {stock?.logo_url || stock?.logo ? (
              <img src={stock.logo_url || stock.logo} alt={symbol} className="w-16 h-16 rounded-xl bg-base-100 p-2" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-base-300 to-base-100 flex items-center justify-center text-lg font-bold text-base-content/70">
                {symbol.slice(0, 2)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{stock?.name || symbol}</h1>
                <span className="px-2 py-0.5 rounded bg-base-300 text-xs text-base-content/60">{stock?.exchange || 'NYSE'}</span>
                <WatchlistStarButton stockId={stock?.id} symbol={symbol} size="h-6 w-6" />
              </div>
              <p className="text-base-content/50">{symbol} • {stock?.sector}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-mono font-bold text-white">{formatPrice(displayPrice)}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <PriceChange value={displayChange} />
                {realtimePrice && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <p className="text-[11px] text-base-content/40 mt-1 text-right font-mono">
                {displayChangeAmount !== null && displayChangeAmount !== undefined && !Number.isNaN(displayChangeAmount) && (
                  <span className={displayChangeAmount >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}>
                    {displayChangeAmount >= 0 ? '+' : ''}{Number(displayChangeAmount).toFixed(2)}
                  </span>
                )}
                {quote?.previous_close ? ` vs prev. close ${formatPrice(quote.previous_close)}` : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-base-200 rounded-xl p-6 border border-base-300 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Price Chart</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 bg-base-300 rounded-lg p-1">
                {RANGE_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => handleRangeChange(opt.value)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedRange === opt.value && !selectedInterval ? 'bg-emerald-500/20 text-emerald-400' : 'text-base-content/50 hover:text-white'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-base-content/40">Candle:</span>
              <div className="flex gap-1 bg-base-300 rounded-lg p-1">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setSelectedInterval(opt.value)} className={`px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors ${selectedInterval === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'text-base-content/50 hover:text-white'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
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
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-xs text-base-content/50">{item.label}</p>
                  {FUNDAMENTAL_INFO[item.label] && (
                    <div className="relative group/info flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-base-content/40 group-hover/info:text-emerald-400 cursor-help transition-colors" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden w-60 -translate-x-1/2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-left text-[11px] leading-snug text-base-content/80 shadow-lg group-hover/info:block">
                        {FUNDAMENTAL_INFO[item.label]}
                      </span>
                    </div>
                  )}
                </div>
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

