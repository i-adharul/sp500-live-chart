import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import {
  fetchWatchlist,
  removeWatchlist,
} from "../features/watchlist/watchlistSlice";
import { useSocket } from "../hooks/useSocket";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PriceChange from "../components/PriceChange";
import { formatPrice } from "../utils/formatters";

export default function Watchlist() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.watchlist);
  const [realtimePrices, setRealtimePrices] = useState({});

  // ProtectedRoute sudah menjamin halaman ini hanya bisa dibuka saat login,
  // jadi tidak perlu lagi cek token / tampilan "Login Required" di sini.
  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  // Harga live (broadcast global 'price-update' dari server) untuk tiap baris watchlist.
  useSocket(
    "price-update",
    useCallback((data) => {
      if (data && data.symbol && data.price !== undefined) {
        setRealtimePrices((prev) => ({
          ...prev,
          [data.symbol]: data.price,
        }));
      }
    }, []),
  );

  const handleRemove = (stockId) => {
    dispatch(removeWatchlist(stockId));
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-base-content/60">Track your favorite stocks</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton type="line" count={5} />
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-base-content/30"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No stocks in watchlist
            </h2>
            <p className="text-base-content/60 mb-6">
              Start adding stocks to track them here.
            </p>
            <Link
              to="/stocks"
              className="btn btn-primary bg-linear-to-r from-emerald-500 to-cyan-500 border-0"
            >
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const livePrice = realtimePrices[item.symbol];
              const prevClose =
                item.price != null && item.change_percent != null
                  ? item.price / (1 + item.change_percent / 100)
                  : null;
              const liveChange =
                livePrice != null && prevClose
                  ? ((livePrice - prevClose) / prevClose) * 100
                  : item.change_percent;
              return (
                <div
                  key={item.id}
                  className="bg-base-200 rounded-xl p-4 border border-base-300 flex items-center justify-between"
                >
                  <Link
                    to={`/stocks/${item.symbol}`}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-base-300 to-base-100 flex items-center justify-center text-sm font-bold text-base-content/70">
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.symbol}</p>
                      <p className="text-sm text-base-content/60">
                        {item.name}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono font-semibold text-white">
                        {formatPrice(livePrice ?? item.price)}
                      </p>
                      <PriceChange value={liveChange} />
                    </div>
                    <button
                      onClick={() => handleRemove(item.stock_id)}
                      className="btn btn-ghost btn-sm text-red-400 hover:bg-red-400/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
