import { ArrowRight } from 'lucide-react'
import './NewsCard.css'

export default function NewsCard({ item }) {
  return (
    <article className="news-card">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="news-card__media"
      >
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" />
        ) : (
          <div className="news-card__placeholder" />
        )}
        <span className="news-card__tag">{item.category}</span>
      </a>
      <div className="news-card__body">
        <div className="news-card__meta">{item.source}</div>
        <h3 className="news-card__title">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h3>
        <p className="news-card__summary">{item.summary}</p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card__more"
          aria-label={`${item.title} 자세히 보기`}
        >
          <ArrowRight size={18} />
        </a>
      </div>
    </article>
  )
}
