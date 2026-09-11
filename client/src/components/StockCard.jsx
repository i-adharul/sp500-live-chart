import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { formatPrice } from "../utils/formatters";
import PriceChange from "./PriceChange";
import WatchlistStarButton from "./WatchlistStarButton";

export default function StockCard({ stock, realtimePrice }) {
  const [flash, setFlash] = useState(null);
  const prevPriceRef = useRef(realtimePrice);
  const price = realtimePrice ?? stock.price;
  const change =
    realtimePrice && stock.previousClose
      ? ((realtimePrice - stock.previousClose) / stock.previousClose) * 100
      : stock.change;

  useEffect(() => {
    if (
      realtimePrice &&
      realtimePrice !== prevPriceRef.current &&
      prevPriceRef.current !== undefined
    ) {
      const direction = realtimePrice > prevPriceRef.current ? "up" : "down";
      setFlash(direction);
      const timer = setTimeout(() => setFlash(null), 600);
      prevPriceRef.current = realtimePrice;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = realtimePrice;
  }, [realtimePrice]);

  return (
    <Link
      to={`/stocks/${stock.symbol}`}
      className={`block bg-base-200 rounded-xl p-4 border border-base-300 hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/5 ${
        flash === "up" ? "ring-2 ring-emerald-400/50 bg-emerald-400/5" : ""
      } ${flash === "down" ? "ring-2 ring-red-400/50 bg-red-400/5" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {stock.logo ? (
            <img
              src={stock.logo}
              alt={stock.symbol}
              className="w-10 h-10 rounded-lg bg-base-100 p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-base-300 to-base-100 flex items-center justify-center text-sm font-bold text-base-content/70">
              {stock.symbol.slice(0, 2)}
            </div>
          )}
          <div className="text-left">
            <p className="font-bold text-white text-sm">{stock.symbol}</p>
            <p className="text-xs text-base-content/60 truncate max-w-30">
              {stock.name}
            </p>
          </div>
        </div>
        <WatchlistStarButton stockId={stock.id} symbol={stock.symbol} />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-left">
          <p className="text-lg font-mono font-semibold text-white tracking-tight">
            {formatPrice(price)}
          </p>
          <p className="text-xs text-base-content/50 mt-0.5">{stock.sector}</p>
        </div>
        <PriceChange value={change} />
      </div>
      <p className="text-[10px] text-base-content/40 mt-2 text-right">
        {realtimePrice != null ? "live vs prev. close" : "vs prev. close"}
      </p>
    </Link>
  );
}
