export default function AIInsightCard({ insight, loading, error }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-violet-500/30 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20" />
          <div className="h-5 w-32 bg-violet-500/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-violet-500/10 rounded" />
          <div className="h-4 w-3/4 bg-violet-500/10 rounded" />
          <div className="h-4 w-5/6 bg-violet-500/10 rounded" />
        </div>
      </div>
    )
  }

  if (error && !insight) {
    return (
      <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-violet-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Insight</h3>
            <p className="text-xs text-base-content/50">Powered by AI Analysis</p>
          </div>
        </div>
        <p className="text-sm text-amber-400/90">{error}</p>
        <p className="text-xs text-base-content/50 mt-2">
          Insight akan muncul otomatis setelah service AI dikonfigurasi di server.
        </p>
      </div>
    )
  }

  if (!insight) return null

  const { summary, sentiment, confidence, keyPoints } = insight

  const sentimentColor = {
    bullish: 'text-emerald-400 bg-emerald-400/10',
    bearish: 'text-red-400 bg-red-400/10',
    neutral: 'text-amber-400 bg-amber-400/10',
  }

  const sentimentLabel = {
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Neutral',
  }

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-xl p-6 border border-violet-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Insight</h3>
            <p className="text-xs text-base-content/50">Powered by AI Analysis</p>
          </div>
        </div>
        {sentiment && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${sentimentColor[sentiment] || sentimentColor.neutral}`}>
            {sentimentLabel[sentiment] || sentiment}
          </span>
        )}
      </div>

      {summary && (
        <p className="text-sm text-base-content/80 leading-relaxed mb-4">{summary}</p>
      )}

      {keyPoints && keyPoints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider">Key Points</p>
          <ul className="space-y-1.5">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-base-content/70">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {confidence !== undefined && (
        <div className="mt-4 pt-4 border-t border-violet-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/50">Confidence</span>
            <span className="text-violet-400 font-mono">{confidence}%</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
