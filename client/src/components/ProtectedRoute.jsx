import { Navigate, Outlet, useLocation } from 'react-router'
import { useSelector } from 'react-redux'

// Pembatas route yang butuh login (pengganti cek `if (!token)` di tiap page).
// - Belum login -> dilempar ke /login sambil menitipkan `from` (halaman asal)
//   dan `reason` (alasan, mis. 'watchlist') untuk ditampilkan sebagai toast.
// - Layout kosong (Outlet doang, tanpa nav) — Navbar tetap dari App.jsx.
export default function ProtectedRoute() {
  const token = useSelector((state) => state.auth.token)
  const location = useLocation()

  if (!token) {
    const reason =
      location.pathname === '/watchlist'
        ? 'watchlist'
        : location.pathname === '/profile'
          ? 'profile'
          : 'auth'
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason }}
      />
    )
  }

  return <Outlet />
}
