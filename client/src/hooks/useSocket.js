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

export const useStockPrice = (symbol, onPriceUpdate) => {
  const onPriceUpdateRef = useRef(onPriceUpdate)

  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate
  }, [onPriceUpdate])

  useEffect(() => {
    if (!symbol) return

    const socket = getSocket()

    const handlePriceUpdate = (data) => {
      if (data.symbol === symbol || data.symbols?.includes(symbol)) {
        onPriceUpdateRef.current?.(data)
      }
    }

    socket.on('price-update', handlePriceUpdate)

    return () => {
      socket.off('price-update', handlePriceUpdate)
    }
  }, [symbol])
}

export default useSocket
