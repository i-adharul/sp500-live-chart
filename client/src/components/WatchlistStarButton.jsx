import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router'
import { addWatchlist, removeWatchlist } from '../features/watchlist/watchlistSlice'

// Tombol bintang watchlist yang reusable (dipakai di StockCard, Home, dan halaman Detail).
// - Belum login -> diarahkan ke /login
// - Sudah ada di watchlist -> bintang kuning solid, klik lagi untuk hapus
export default function WatchlistStarButton({ stockId, symbol = '', size = 'h-5 w-5', className = '' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useSelector((state) => state.auth.token)
  const watchlistItems = useSelector((state) => state.watchlist.items)
  const isSaved = watchlistItems.some((item) => item.stock_id === stockId)
  const [pending, setPending] = useState(false)

  const handleClick = async (event) => {
    // cegah navigasi kalau tombol dipasang di dalam <Link> (StockCard)
    event.preventDefault()
    event.stopPropagation()
    if (!stockId || pending) return

    if (!token) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    setPending(true)
    try {
      if (isSaved) {
        await dispatch(removeWatchlist(stockId))
      } else {
        await dispatch(addWatchlist(stockId))
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSaved ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
      title={isSaved ? 'Hapus dari watchlist' : 'Tambah ke watchlist'}
      className={`btn btn-ghost btn-circle btn-sm shrink-0 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`${size} transition-colors ${pending ? 'animate-pulse ' : ''}${
          isSaved ? 'text-amber-400' : 'text-base-content/40 hover:text-amber-300'
        }`}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  )
}
