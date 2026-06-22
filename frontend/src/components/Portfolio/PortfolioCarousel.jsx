import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, FolderGit2 } from 'lucide-react'
import ProjectCard from './ProjectCard'
import { projects } from '../../data/projects'
import './PortfolioCarousel.css'

const GAP = 24

export default function PortfolioCarousel() {
  const [active, setActive] = useState(0)
  const [metrics, setMetrics] = useState({ slideW: 0, offset: 0 })
  const viewportRef = useRef(null)

  const recalc = useCallback(
    (index = active) => {
      const vp = viewportRef.current
      if (!vp) return
      const vw = vp.clientWidth
      const slideW = Math.min(Math.round(vw * 0.64), 760)
      const step = slideW + GAP
      const offset = vw / 2 - slideW / 2 - index * step
      setMetrics({ slideW, offset })
    },
    [active],
  )

  useLayoutEffect(() => {
    recalc(active)
  }, [active, recalc])

  useEffect(() => {
    const onResize = () => recalc(active)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active, recalc])

  const go = (dir) => {
    setActive((prev) => {
      const next = prev + dir
      if (next < 0) return projects.length - 1
      if (next > projects.length - 1) return 0
      return next
    })
  }

  return (
    <section className="section section--muted portfolio" id="portfolio">
      <div className="container portfolio__head">
        <div>
          <span className="portfolio__eyebrow">
            <FolderGit2 size={16} /> 포트폴리오
          </span>
          <h2 className="section__title">프로젝트 모음</h2>
          <p className="section__subtitle">
            대표 프로젝트를 캐러셀로 둘러보세요. 카드를 클릭하면 자세한 내용으로
            이동합니다.
          </p>
        </div>
      </div>

      <div className="portfolio__viewport" ref={viewportRef}>
        <div
          className="portfolio__track"
          style={{ transform: `translateX(${metrics.offset}px)` }}
        >
          {projects.map((project, i) => (
            <div
              className={`portfolio__slide ${i === active ? 'is-active' : ''}`}
              key={project.id}
              style={{ width: `${metrics.slideW}px` }}
              onClick={() => i !== active && setActive(i)}
            >
              <ProjectCard project={project} active={i === active} />
            </div>
          ))}
        </div>

        <button
          className="portfolio__arrow portfolio__arrow--prev"
          onClick={() => go(-1)}
          aria-label="이전 프로젝트"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="portfolio__arrow portfolio__arrow--next"
          onClick={() => go(1)}
          aria-label="다음 프로젝트"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="portfolio__footer">
        <div className="portfolio__indicator">
          <button
            className="portfolio__indicator-btn"
            onClick={() => go(-1)}
            aria-label="이전"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="portfolio__count">
            {active + 1} / {projects.length}
          </span>
          <button
            className="portfolio__indicator-btn"
            onClick={() => go(1)}
            aria-label="다음"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="portfolio__dots">
          {projects.map((p, i) => (
            <button
              key={p.id}
              className={`portfolio__dot ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`${i + 1}번째 프로젝트로 이동`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
