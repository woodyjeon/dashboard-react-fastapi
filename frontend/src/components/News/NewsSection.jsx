import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Newspaper, Pause, Play } from 'lucide-react'
import NewsCard from './NewsCard'
import { fetchNews } from '../../services/api'
import { NEWS_SOURCES } from '../../data/newsSources'
import './NewsSection.css'

export default function NewsSection() {
  const [source, setSource] = useState('naver_it')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setItems([])

    fetchNews(source, 24)
      .then((data) => {
        if (active) {
          setItems(data)
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
  }, [source])

  useEffect(() => {
    if (paused || loading || items.length === 0) return
    const el = trackRef.current
    if (!el) return

    const id = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 1, behavior: 'auto' })
      }
    }, 20)
    return () => clearInterval(id)
  }, [paused, loading, items])

  const scrollByCards = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  const handleSourceChange = (nextSource, enabled) => {
    if (!enabled || nextSource === source) return
    setSource(nextSource)
    if (trackRef.current) trackRef.current.scrollLeft = 0
  }

  return (
    <section className="section section--light news" id="news">
      <div className="container">
        <div className="news__head">
          <div>
            <span className="news__eyebrow">
              <Newspaper size={16} /> 뉴스
            </span>
            <h2 className="section__title">실시간 뉴스 피드</h2>
            <p className="section__subtitle">
              소스별 최신 IT 뉴스를 카드 형식으로 자동 스크롤합니다. 카드 위에
              마우스를 올리면 잠시 멈춥니다.
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
              className="news__ctrl"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? '자동 스크롤 재생' : '자동 스크롤 일시정지'}
            >
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button
              className="news__ctrl"
              onClick={() => scrollByCards(-1)}
              aria-label="이전 뉴스"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="news__ctrl"
              onClick={() => scrollByCards(1)}
              aria-label="다음 뉴스"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="news__track" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="news__item news__skeleton" />
            ))}
          </div>
        ) : error ? (
          <p className="news__error" role="alert">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="news__empty">표시할 뉴스가 없습니다.</p>
        ) : (
          <div
            className="news__track"
            ref={trackRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
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
