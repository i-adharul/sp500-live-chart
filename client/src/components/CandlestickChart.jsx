import { useEffect, useRef, useReducer } from 'react'
import { createChart, CrosshairMode, CandlestickSeries } from 'lightweight-charts'

function normalizeItem(item) {
  const rawTime = item?.date || item?.time || item?.datetime
  if (!rawTime) return null
  let time
  if (typeof rawTime === 'number') {
    time = rawTime
  } else {
    const str = String(rawTime).replace('T', ' ')
    const hasTimePart = / \d{2}:\d{2}/.test(str)
    if (hasTimePart) {
      // Intraday: pakai unix timestamp (detik) supaya candle
      // dalam hari yang sama tidak saling menimpa
      const parsed = new Date(str.includes('Z') || str.includes('+') ? str : `${str.replace(' ', 'T')}Z`)
      time = Math.floor(parsed.getTime() / 1000)
    } else {
      time = str.slice(0, 10)
    }
  }
  const open = Number(item.open)
  const high = Number(item.high)
  const low = Number(item.low)
  const close = Number(item.close)
  if ([open, high, low, close].some((v) => v == null || Number.isNaN(v))) return null
  return { time, open, high, low, close }
}

function validateChartData(data) {
  if (!data || data.length === 0) return false
  return data.every((item) => {
    const normalized = normalizeItem(item)
    return normalized !== null
  })
}

function chartReducer(state, action) {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, hasError: action.payload }
    default:
      return state
  }
}

function toBars(data) {
  return (data || [])
    .map(normalizeItem)
    .filter(Boolean)
    .sort((a, b) =>
      typeof a.time === 'number' && typeof b.time === 'number'
        ? a.time - b.time
        : new Date(a.time) - new Date(b.time)
    )
}

export default function CandlestickChart({ data, symbol, liveCandle }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const barsRef = useRef([])
  const [state, dispatch] = useReducer(chartReducer, { hasError: !validateChartData(data) })

  useEffect(() => {
    dispatch({ type: 'SET_ERROR', payload: !validateChartData(data) })
  }, [data])

  useEffect(() => {
    if (state.hasError) return
    if (!chartContainerRef.current) return

    try {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#9ca3af',
          fontSize: 12,
        },
        grid: {
          vertLines: { color: 'rgba(55, 65, 81, 0.3)' },
          horzLines: { color: 'rgba(55, 65, 81, 0.3)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: 'rgba(34, 197, 94, 0.3)',
            labelBackgroundColor: '#22c55e',
          },
          horzLine: {
            color: 'rgba(34, 197, 94, 0.3)',
            labelBackgroundColor: '#22c55e',
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(55, 65, 81, 0.5)',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: 'rgba(55, 65, 81, 0.5)',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          vertTouchDrag: false,
        },
      })

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })

      chartRef.current = chart
      seriesRef.current = candleSeries

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          })
        }
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        if (chartRef.current) {
          chartRef.current.remove()
          chartRef.current = null
          seriesRef.current = null
        }
      }
    } catch (err) {
      console.error('Chart error:', err)
    }
  }, [symbol, state.hasError])

  // setData setiap kali data berubah (ganti range/interval)
  useEffect(() => {
    if (state.hasError || !seriesRef.current) return
    const bars = toBars(data)
    barsRef.current = bars
    seriesRef.current.setData(bars)
    chartRef.current?.timeScale().fitContent()
  }, [data, state.hasError])

  // live candle: merge data realtime dari Socket.io ke candle terakhir
  useEffect(() => {
    if (!liveCandle || !seriesRef.current) return
    const bars = barsRef.current
    if (!bars || bars.length === 0) return

    const close = Number(liveCandle.close)
    if (!Number.isFinite(close)) return
    const open = Number(liveCandle.open)
    const high = Number(liveCandle.high)
    const low = Number(liveCandle.low)

    const last = bars[bars.length - 1]
    let barTime
    if (typeof last.time === 'number') {
      // periode bar = jarak 2 candle terakhir (fallback 60 detik)
      const period = bars.length > 1 ? Math.max(1, last.time - bars[bars.length - 2].time) : 60
      const nowSec = Math.floor(Date.now() / 1000)
      // masih dalam periode bar terakhir -> update bar itu,
      // sudah lewat -> buat bar baru di tepi kanan chart
      barTime = nowSec < last.time + period
        ? last.time
        : Math.max(last.time, Math.floor(nowSec / period) * period)
    } else {
      const today = new Date().toISOString().slice(0, 10)
      barTime = today > last.time ? today : last.time
    }

    const target = barTime === last.time
      ? last
      : { open: Number.isFinite(open) ? open : close, high: close, low: close }

    seriesRef.current.update({
      time: barTime,
      open: target.open,
      close,
      high: Math.max(target.high, Number.isFinite(high) ? high : 0, close),
      low: Math.min(target.low, Number.isFinite(low) ? low : close, close),
    })
  }, [liveCandle])

  if (state.hasError) {
    return (
      <div className="h-80 flex items-center justify-center bg-base-200 rounded-xl border border-base-300">
        <div className="text-center">
          <p className="text-base-content/50">Chart could not be loaded</p>
          <p className="text-xs text-base-content/30 mt-1">Data format may be incompatible</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={chartContainerRef}
      className="h-80 w-full"
    />
  )
}
