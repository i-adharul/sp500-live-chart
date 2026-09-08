import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="navbar bg-base-200/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-300">
      <div className="container mx-auto px-4">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">S&P 500 AI</span>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link
                to="/"
                className={`rounded-lg ${isActive('/') ? 'bg-emerald-500/20 text-emerald-400' : 'text-base-content hover:bg-base-300'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/stocks"
                className={`rounded-lg ${isActive('/stocks') ? 'bg-emerald-500/20 text-emerald-400' : 'text-base-content hover:bg-base-300'}`}
              >
                Stocks
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
