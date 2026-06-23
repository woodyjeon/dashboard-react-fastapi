import { ArrowRight } from 'lucide-react'
import './NewsCard.css'

export default function NewsCard({ item }) {
  return (
    <a
      className="news-card"
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} 자세히 보기`}
    >
      <div className="news-card__media">
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" />
        ) : (
          <div className="news-card__placeholder" />
        )}
        <span className="news-card__tag">{item.category}</span>
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">{item.source}</div>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__summary">{item.summary}</p>
        <span className="news-card__more" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      </div>
    </a>
  )
}
