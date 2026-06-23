import { ArrowRight, Sparkles } from 'lucide-react'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__badge">
            <Sparkles size={15} /> wjeon 대시보드
          </span>
          <h1 className="hero__title">
            한곳에서 보는
            <br />
            뉴스, 프로젝트, 그리고 SMK 에이전트
          </h1>
          <p className="hero__subtitle">
            최신 뉴스, 포트폴리오, RAG 기반 챗봇과 SMK Agent까지.
            필요한 모든 것을 하나의 화면에서 빠르게 확인하세요.
          </p>
          <div className="hero__actions">
            <a href="#portfolio" className="btn btn--primary">
              포트폴리오 보기 <ArrowRight size={16} />
            </a>
            <a href="#news" className="btn btn--outline hero__btn-dark">
              최신 뉴스
            </a>
          </div>
        </div>
      </div>
      <div className="hero__glow" aria-hidden="true" />
    </section>
  )
}
