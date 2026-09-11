import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchStocks } from "../api/stocks";
import { useSocket } from "../hooks/useSocket";
import { SECTORS } from "../utils/formatters";
import StockCard from "../components/StockCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorState from "../components/ErrorState";

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSector, setSelectedSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimePrices, setRealtimePrices] = useState({});

  const loadStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sector = selectedSector === "All" ? "" : selectedSector;
      const data = await fetchStocks(sector);
      setStocks(data.stocks || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSector]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const sector = selectedSector === "All" ? "" : selectedSector;
        const data = await fetchStocks(sector);
        if (!cancelled) setStocks(data.stocks || data || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedSector]);

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

  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;
    const query = searchQuery.toLowerCase();
    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name?.toLowerCase().includes(query),
    );
  }, [stocks, searchQuery]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Stock Screener</h1>
          <p className="text-base-content/60">
            Browse and track S&P 500 stocks &amp; crypto by sector
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 bg-base-200 border-base-300 text-white placeholder:text-base-content/40 focus:border-emerald-500"
            />
          </div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="select select-bordered bg-base-200 border-base-300 text-white focus:border-emerald-500 min-w-50"
          >
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedSector === sector ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-base-200 text-base-content/60 border border-base-300 hover:border-base-300/80"}`}
            >
              {sector}
            </button>
          ))}
        </div>
        {error ? (
          <ErrorState message={error} onRetry={loadStocks} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} type="card" />
            ))}
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base-content/50">No stocks found</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-base-content/50">
                Showing {filteredStocks.length} stock
                {filteredStocks.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2 text-xs text-base-content/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live prices
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  realtimePrice={realtimePrices[stock.symbol]}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
