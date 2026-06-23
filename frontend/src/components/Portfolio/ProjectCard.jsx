import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getProjectPath } from '../../data/projectUtils'
import './ProjectCard.css'

function ProjectCardContent({ project, active }) {
  return (
    <div className="project-card__media">
      <img src={project.image} alt={project.title} loading="lazy" draggable={false} />
      <span className="project-card__badge">{project.category}</span>
      <div className="project-card__overlay">
        <div className="project-card__overlay-inner">
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__desc">{project.description}</p>
          <div className="project-card__footer">
            <ul className="project-card__tags">
              {project.tags?.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <span className="project-card__link">
              {active ? (
                <>
                  자세히 보기 <ArrowUpRight size={16} />
                </>
              ) : (
                '탭하여 보기'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectCard({ project, active, onActivate }) {
  if (active) {
    return (
      <Link
        to={getProjectPath(project.slug)}
        className="project-card is-active"
        tabIndex={0}
        aria-label={`${project.title} 상세 페이지`}
        draggable={false}
      >
        <ProjectCardContent project={project} active />
      </Link>
    )
  }

  return (
    <button
      type="button"
      className="project-card"
      onClick={onActivate}
      aria-label={`${project.title} 선택`}
      draggable={false}
    >
      <ProjectCardContent project={project} active={false} />
    </button>
  )
}
