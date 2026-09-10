import { Link, useLocation, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

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
            <span className="text-xl font-bold text-base-content">S&P 500 AI</span>
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link
                to="/"
                className={`rounded-lg ${isActive('/') ? 'bg-emerald-500/20 text-emerald-600' : 'text-base-content hover:bg-base-300'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/stocks"
                className={`rounded-lg ${isActive('/stocks') ? 'bg-emerald-500/20 text-emerald-600' : 'text-base-content hover:bg-base-300'}`}
              >
                Stocks
              </Link>
            </li>
            {token && (
              <li>
                <Link
                  to="/watchlist"
                  className={`rounded-lg ${isActive('/watchlist') ? 'bg-emerald-500/20 text-emerald-600' : 'text-base-content hover:bg-base-300'}`}
                >
                  Watchlist
                </Link>
              </li>
            )}
            {token ? (
              <li className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </label>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                  <li className="px-3 py-2">
                    <span className="text-base-content/60 text-sm">{user?.email}</span>
                  </li>
                  <div className="divider my-0" />
                  <li>
                    <Link to="/profile" className="text-base-content">Profile</Link>
                  </li>
                  <li>
                    <Link to="/watchlist" className="text-base-content">Watchlist</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="text-red-500">Logout</button>
                  </li>
                </ul>
              </li>
            ) : (
              <li>
                <Link
                  to="/login"
                  className={`rounded-lg ${
                    isActive('/login')
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : 'text-base-content hover:bg-base-300'
                  }`}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

