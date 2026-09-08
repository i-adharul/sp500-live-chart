import { formatPercentage } from '../utils/formatters'

export default function PriceChange({ value, className = '' }) {
  if (value === null || value === undefined) {
    return <span className="text-base-content/50">--</span>
  }

  const isPositive = value >= 0
  const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400'
  const bgClass = isPositive ? 'bg-emerald-400/10' : 'bg-red-400/10'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm font-mono font-medium ${colorClass} ${bgClass} ${className}`}>
      {isPositive ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {formatPercentage(value)}
    </span>
  )
}
