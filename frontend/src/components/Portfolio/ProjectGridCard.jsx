import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getProjectPath } from '../../data/projectUtils'
import './ProjectGridCard.css'

export default function ProjectGridCard({ project }) {
  return (
    <Link
      className="pcard"
      to={getProjectPath(project.slug)}
      aria-label={`${project.title} 자세히 보기`}
    >
      <div className="pcard__media">
        <img src={project.image} alt="" loading="lazy" />
        <span className="pcard__tag">{project.category}</span>
      </div>
      <div className="pcard__body">
        <h3 className="pcard__title">{project.title}</h3>
        <p className="pcard__summary">{project.description}</p>
        {project.tags?.length ? (
          <ul className="pcard__tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
        <span className="pcard__more" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
      </div>
    </Link>
  )
}
