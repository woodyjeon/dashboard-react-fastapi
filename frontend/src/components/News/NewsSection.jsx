import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Newspaper, Pause, Play, RefreshCw } from 'lucide-react'
import NewsCard from './NewsCard'
import NewsPagination from './NewsPagination'
import { fetchNews } from '../../services/api'
import { NEWS_SOURCES } from '../../data/newsSources'
import { useDragScroll } from '../../hooks/useHorizontalDrag'
import './NewsSection.css'

const GRID_PAGE_SIZE = 12
const CAROUSEL_PAGE_SIZE = 24

export default function NewsSection({ layout = 'carousel' }) {
  const isGrid = layout === 'grid'
  const [source, setSource] = useState('naver_it')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paused, setPaused] = useState(false)
  const wasPausedRef = useRef(false)
  const pausedRef = useRef(paused)
  const sectionRef = useRef(null)
  pausedRef.current = paused

  const {
    ref: trackRef,
    isDragging,
    handlers: dragHandlers,
  } = useDragScroll({
    disabled: isGrid || loading || items.length === 0,
    onDragStart: () => {
      wasPausedRef.current = pausedRef.current
      pausedRef.current = true
      setPaused(true)
    },
    onDragEnd: () => {
      if (!wasPausedRef.current) {
        pausedRef.current = false
        setPaused(false)
      }
    },
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setItems([])

    const pageSize = isGrid ? GRID_PAGE_SIZE : CAROUSEL_PAGE_SIZE
    const requestPage = isGrid ? page : 1

    fetchNews(source, { page: requestPage, pageSize })
      .then((data) => {
        if (active) {
          setItems(data.items ?? [])
          setTotal(data.total ?? 0)
          setTotalPages(data.total_pages ?? 1)
          if (isGrid && data.page && data.page !== page) {
            setPage(data.page)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [source, page, isGrid])

  const handleRefresh = useCallback(() => {
    setLoading(true)
    setError('')

    const pageSize = isGrid ? GRID_PAGE_SIZE : CAROUSEL_PAGE_SIZE
    const requestPage = isGrid ? page : 1

    fetchNews(source, { page: requestPage, pageSize, refresh: true })
      .then((data) => {
        setItems(data.items ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.total_pages ?? 1)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [source, page, isGrid])

  useEffect(() => {
    if (isGrid || pausedRef.current || loading || items.length === 0) return
    const el = trackRef.current
    if (!el) return

    const id = setInterval(() => {
      if (pausedRef.current) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 1, behavior: 'auto' })
      }
    }, 20)
    return () => clearInterval(id)
  }, [paused, loading, items, isGrid])

  const scrollByCards = (dir) => {
    const el = trackRef.current
    if (!el || items.length === 0) return

    pausedRef.current = true
    setPaused(true)

    const cards = el.querySelectorAll('.news__item')
    if (cards.length === 0) return

    const gap =
      Number.parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 20
    const step = cards[0].offsetWidth + gap
    if (step <= 0) return

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
    const currentIndex = Math.round(el.scrollLeft / step)
    const nextIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + dir))
    const targetLeft = Math.min(nextIndex * step, maxScroll)

    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }

  const handleSourceChange = (nextSource, enabled) => {
    if (!enabled || nextSource === source) return
    setSource(nextSource)
    setPage(1)
    if (trackRef.current) trackRef.current.scrollLeft = 0
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    setPage(nextPage)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      className={`section ${isGrid ? 'section--muted' : 'section--light'} news`}
      id="news"
      ref={sectionRef}
    >
      <div className="container">
        <div className="news__head">
          <div>
            <span className="news__eyebrow">
              <Newspaper size={16} /> 뉴스
            </span>
            <h2 className="section__title">실시간 뉴스 피드</h2>
            <p className="section__subtitle">
              최신 뉴스를 빠르게 확인하세요. 카드를 클릭하면 상세 페이지로 이동합니다.
            </p>
            <div className="news__sources" role="tablist" aria-label="뉴스 소스">
              {NEWS_SOURCES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={source === item.id}
                  disabled={!item.enabled}
                  className={`news__source-btn ${
                    source === item.id ? 'is-active' : ''
                  } ${!item.enabled ? 'is-disabled' : ''}`}
                  onClick={() => handleSourceChange(item.id, item.enabled)}
                  title={item.description}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="news__controls">
            <button
              type="button"
              className="news__ctrl"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="뉴스 새로고침"
              title="최신 뉴스 다시 불러오기"
            >
              <RefreshCw size={18} className={loading ? 'news__spin' : ''} />
            </button>
            {!isGrid && (
              <>
                <button
                type="button"
                className="news__ctrl"
                onClick={() => {
                  setPaused((p) => {
                    pausedRef.current = !p
                    return !p
                  })
                }}
                aria-label={paused ? '자동 스크롤 재생' : '자동 스크롤 일시정지'}
              >
                {paused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button
                type="button"
                className="news__ctrl"
                onClick={() => scrollByCards(-1)}
                disabled={loading || items.length === 0}
                aria-label="이전 뉴스"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="news__ctrl"
                onClick={() => scrollByCards(1)}
                disabled={loading || items.length === 0}
                aria-label="다음 뉴스"
              >
                <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className={isGrid ? 'news__grid' : 'news__track'} aria-hidden="true">
            {Array.from({ length: isGrid ? 6 : 4 }).map((_, i) => (
              <div key={i} className="news__item news__skeleton" />
            ))}
          </div>
        ) : error ? (
          <p className="news__error" role="alert">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="news__empty">표시할 뉴스가 없습니다.</p>
        ) : isGrid ? (
          <>
            <div className="news__grid">
              {items.map((item) => (
                <div className="news__item" key={item.id}>
                  <NewsCard item={item} />
                </div>
              ))}
            </div>
            <NewsPagination
              page={page}
              totalPages={totalPages}
              total={total}
              loading={loading}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div
            className={`news__track ${isDragging ? 'is-dragging' : ''}`}
            ref={trackRef}
            {...dragHandlers}
            onMouseEnter={() => {
              pausedRef.current = true
              setPaused(true)
            }}
            onMouseLeave={(e) => {
              if (isDragging) return
              const related = e.relatedTarget
              const newsRoot = e.currentTarget.closest('.news')
              if (related instanceof Node && newsRoot?.contains(related)) return
              pausedRef.current = false
              setPaused(false)
            }}
          >
            {items.map((item) => (
              <div className="news__item" key={item.id}>
                <NewsCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
