import { formatRelativeTime } from '../utils/formatters'

export default function NewsListItem({ article }) {
  const { title, source, url, publishedAt, image } = article

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-base-300/50 transition-colors group"
    >
      {image ? (
        <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover bg-base-300 shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-base-300 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
          {title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-base-content/50">{source}</span>
          <span className="text-xs text-base-content/30">•</span>
          <span className="text-xs text-base-content/50">{formatRelativeTime(publishedAt)}</span>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-base-content/30 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </a>
  )
}
