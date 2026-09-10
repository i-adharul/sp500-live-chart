import { useEffect } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovers } from '../features/stocks/stocksSlice';
import StockCard from '../components/StockCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

export default function Home() {
  const dispatch = useDispatch();
  const { movers, loading, error } = useSelector((state) => state.stocks);

  useEffect(() => {
    dispatch(fetchMovers());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Live Market Data</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            S&P 500 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI Dashboard</span>
          </h1>
          <p className="text-lg text-base-content/60 mb-8">
            Real-time stock insights powered by AI. Track 55 top stocks across 11 GICS sectors.
          </p>
          <Link to="/stocks" className="btn btn-primary bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 hover:from-emerald-600 hover:to-cyan-600 text-white px-8">
            Explore Stocks
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-6xl">
          {error ? (
            <ErrorState message={error} onRetry={() => dispatch(fetchMovers())} />
          ) : loading ? (
            <div className="space-y-8">
              <div>
                <div className="h-6 w-32 bg-base-300 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingSkeleton key={i} type="card" />
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 w-32 bg-base-300 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingSkeleton key={i} type="card" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Top Gainers</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movers.gainers?.slice(0, 5).map((stock) => (
                    <StockCard
                      key={stock.symbol}
                      stock={{
                        id: stock.id,
                        symbol: stock.symbol,
                        name: stock.name,
                        sector: stock.sector,
                        price: stock.price,
                        change: stock.change_percent,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <h2 className="text-lg font-semibold text-white">Top Losers</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movers.losers?.slice(0, 5).map((stock) => (
                    <StockCard
                      key={stock.symbol}
                      stock={{
                        id: stock.id,
                        symbol: stock.symbol,
                        name: stock.name,
                        sector: stock.sector,
                        price: stock.price,
                        change: stock.change_percent,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
