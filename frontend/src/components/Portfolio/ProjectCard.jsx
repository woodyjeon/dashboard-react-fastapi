import { ArrowUpRight } from 'lucide-react'
import './ProjectCard.css'

export default function ProjectCard({ project, active }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`project-card ${active ? 'is-active' : ''}`}
      tabIndex={active ? 0 : -1}
    >
      <div className="project-card__media">
        <img src={project.image} alt={project.title} loading="lazy" />
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
                자세히 보기 <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}
