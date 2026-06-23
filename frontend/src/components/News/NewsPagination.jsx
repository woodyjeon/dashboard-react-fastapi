import { ChevronLeft, ChevronRight } from 'lucide-react'
import './NewsPagination.css'

function buildPageRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result = []

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i]
    const prev = sorted[i - 1]
    if (i > 0 && page - prev > 1) {
      result.push('ellipsis')
    }
    result.push(page)
  }

  return result
}

export default function NewsPagination({
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(page, totalPages)

  return (
    <nav className="news-pagination" aria-label="뉴스 페이지">
      <p className="news-pagination__summary">
        총 <strong>{total}</strong>건 · {page} / {totalPages} 페이지
      </p>

      <div className="news-pagination__controls">
        <button
          type="button"
          className="news-pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="news-pagination__pages">
          {pages.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="news-pagination__ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`news-pagination__page ${
                  item === page ? 'is-active' : ''
                }`}
                onClick={() => onPageChange(item)}
                disabled={loading || item === page}
                aria-label={`${item}페이지`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="news-pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          aria-label="다음 페이지"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  )
}
