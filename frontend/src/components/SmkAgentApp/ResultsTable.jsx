import { Trash2 } from 'lucide-react'

function ResultCard({ row, activeId, onSelect, onDelete }) {
  const isActive = row.id === activeId

  return (
    <article
      className={`smkapp__result-card ${isActive ? 'is-active' : ''}`}
      onClick={() => onSelect?.(row.id)}
    >
      <h3 className="smkapp__result-card-title" title={row.title}>
        {row.title || '—'}
      </h3>

      <div className="smkapp__result-card-meta">
        <div className="smkapp__result-card-field">
          <span className="smkapp__result-card-label">등록/공개</span>
          <span className="smkapp__result-card-value">{row.doc_type || '—'}</span>
        </div>
        <div className="smkapp__result-card-field">
          <span className="smkapp__result-card-label">공보/등록번호</span>
          <span className="smkapp__result-card-value">{row.doc_no || '—'}</span>
        </div>
        <div className="smkapp__result-card-field">
          <span className="smkapp__result-card-label">출원번호</span>
          <span className="smkapp__result-card-value">{row.app_no || '—'}</span>
        </div>
        <div className="smkapp__result-card-field">
          <span className="smkapp__result-card-label">출원인</span>
          <span className="smkapp__result-card-value">{row.applicant || '—'}</span>
        </div>
        <div className="smkapp__result-card-field smkapp__result-card-field--full">
          <span className="smkapp__result-card-label">작성일시</span>
          <span className="smkapp__result-card-value">{row.created_at || '—'}</span>
        </div>
      </div>

      <div className="smkapp__result-card-actions">
        <button
          type="button"
          className="smkapp__row-btn"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(row.id)
          }}
        >
          상세보기
        </button>
        <button
          type="button"
          className="smkapp__row-btn smkapp__row-btn--icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(row.id)
          }}
          aria-label="삭제"
          title="삭제"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  )
}

export default function ResultsTable({
  results = [],
  activeId = null,
  onSelect,
  onDelete,
}) {
  return (
    <div className="smkapp__results">
      <table className="smkapp__table smkapp__table--desktop">
        <thead>
          <tr>
            <th>등록/공개</th>
            <th>공보/등록번호</th>
            <th>출원번호</th>
            <th>발명의 명칭</th>
            <th>출원인</th>
            <th>작성일시</th>
            <th className="smkapp__table-action">상세보기</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={7} className="smkapp__table-empty">
                아직 작성된 SMK가 없습니다
              </td>
            </tr>
          ) : (
            results.map((row) => (
              <tr
                key={row.id}
                className={`smkapp__row ${row.id === activeId ? 'is-active' : ''}`}
                onClick={() => onSelect?.(row.id)}
              >
                <td>{row.doc_type || '—'}</td>
                <td>{row.doc_no || '—'}</td>
                <td>{row.app_no || '—'}</td>
                <td title={row.title}>{row.title || '—'}</td>
                <td>{row.applicant || '—'}</td>
                <td>{row.created_at || '—'}</td>
                <td className="smkapp__table-action">
                  <div className="smkapp__row-actions">
                    <button
                      type="button"
                      className="smkapp__row-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect?.(row.id)
                      }}
                    >
                      상세보기
                    </button>
                    <button
                      type="button"
                      className="smkapp__row-btn smkapp__row-btn--icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(row.id)
                      }}
                      aria-label="삭제"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="smkapp__result-cards">
        {results.length === 0 ? (
          <p className="smkapp__result-cards-empty">아직 작성된 SMK가 없습니다</p>
        ) : (
          results.map((row) => (
            <ResultCard
              key={row.id}
              row={row}
              activeId={activeId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
