import { useEffect, useRef, useReducer } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'

function validateChartData(data) {
  if (!data || data.length === 0) return false
  return data.every(item =>
    item && (item.date || item.time) && item.open != null && item.high != null && item.low != null && item.close != null
  )
}

function chartReducer(state, action) {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, hasError: action.payload }
    default:
      return state
  }
}

export default function CandlestickChart({ data, symbol }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const dataRef = useRef(data)
  const [state, dispatch] = useReducer(chartReducer, { hasError: !validateChartData(data) })

  useEffect(() => {
    dataRef.current = data
    dispatch({ type: 'SET_ERROR', payload: !validateChartData(data) })
  }, [data])

  useEffect(() => {
    if (state.hasError) return
    if (!chartContainerRef.current || !dataRef.current || dataRef.current.length === 0) return

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

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      })

      const formattedData = dataRef.current.map((item) => ({
        time: item.date || item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))

      candleSeries.setData(formattedData)
      chart.timeScale().fitContent()

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
