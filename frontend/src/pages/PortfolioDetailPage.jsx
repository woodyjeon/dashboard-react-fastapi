import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, FolderGit2 } from 'lucide-react'
import { getProjectBySlug } from '../data/projectUtils'
import './PortfolioDetailPage.css'

export default function PortfolioDetailPage() {
  const { slug } = useParams()
  const project = getProjectBySlug(slug)

  if (!project) {
    return <Navigate to="/portfolio" replace />
  }

  const { detail } = project

  return (
    <article className="section section--muted project-detail">
      <div className="container">
        <Link to="/portfolio" className="project-detail__back">
          <ArrowLeft size={18} aria-hidden="true" />
          포트폴리오 목록
        </Link>

        <header className="project-detail__hero">
          <div className="project-detail__hero-media">
            <img src={project.image} alt="" />
            <span className="project-detail__badge">{project.category}</span>
          </div>

          <div className="project-detail__hero-body">
            <span className="project-detail__eyebrow">
              <FolderGit2 size={16} aria-hidden="true" />
              프로젝트 상세
            </span>
            <h1 className="project-detail__title">{project.title}</h1>
            <p className="project-detail__lead">{project.description}</p>

            {project.tags?.length ? (
              <ul className="project-detail__tags">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}

            <div className="project-detail__meta">
              {detail?.period ? (
                <div>
                  <span className="project-detail__meta-label">기간</span>
                  <span>{detail.period}</span>
                </div>
              ) : null}
              {detail?.role ? (
                <div>
                  <span className="project-detail__meta-label">역할</span>
                  <span>{detail.role}</span>
                </div>
              ) : null}
            </div>

            {project.url ? (
              <a
                className="btn btn--primary project-detail__external"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                외부 링크 열기 <ArrowUpRight size={16} />
              </a>
            ) : null}
          </div>
        </header>

        {detail ? (
          <div className="project-detail__content">
            <section className="project-detail__block">
              <h2>프로젝트 개요</h2>
              <p>{detail.overview}</p>
            </section>

            {detail.highlights?.length ? (
              <section className="project-detail__block">
                <h2>주요 성과</h2>
                <ul className="project-detail__highlights">
                  {detail.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
