import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Login from './pages/Login';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import { fetchWatchlist } from './features/watchlist/watchlistSlice';

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  // Ambil watchlist sekali di level app supaya status bintang (isSaved)
  // akurat di semua halaman tanpa harus membuka halaman Watchlist dulu.
  useEffect(() => {
    if (token) {
      dispatch(fetchWatchlist());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
