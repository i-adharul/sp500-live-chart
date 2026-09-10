import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socketInstance = null

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
  }
  return socketInstance
}

export const useSocket = (eventName, callback) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const socket = getSocket()

    const handler = (data) => {
      callbackRef.current?.(data)
    }

    socket.on(eventName, handler)

    return () => {
      socket.off(eventName, handler)
    }
  }, [eventName])
}

// Hook untuk live candle di halaman Detail (satu-satu fitur yang pakai Socket.io).
// - emit 'subscribe' { symbol } saat mount -> server join room + subscribe ke Finnhub WS
// - emit 'unsubscribe' saat unmount -> server hapus room kalau tidak ada penonton lagi
// - listen 'candle-update' (server throttle 1x/detik)
// Emit diulang pada event 'connect' supaya tetap subscribe setelah reconnect/server restart.
export const useLiveCandle = (symbol, onCandle) => {
  const onCandleRef = useRef(onCandle)

  useEffect(() => {
    onCandleRef.current = onCandle
  }, [onCandle])

  useEffect(() => {
    if (!symbol) return

    const socket = getSocket()
    const upper = symbol.toUpperCase()

    const handleCandle = (data) => {
      if (data && data.symbol === upper) {
        onCandleRef.current?.(data)
      }
    }

    const resubscribe = () => {
      socket.emit('subscribe', { symbol: upper })
    }

    socket.on('candle-update', handleCandle)
    if (socket.connected) {
      resubscribe()
    }
    socket.on('connect', resubscribe)

    return () => {
      socket.off('candle-update', handleCandle)
      socket.off('connect', resubscribe)
      socket.emit('unsubscribe', { symbol: upper })
    }
  }, [symbol])
}

export default useSocket
