import { Trash2 } from 'lucide-react'

export default function ResultsTable({
  results = [],
  activeId = null,
  onSelect,
  onDelete,
}) {
  return (
    <div className="smkapp__results">
      <table className="smkapp__table">
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
    </div>
  )
}
