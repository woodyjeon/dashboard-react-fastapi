import { useEffect, useState } from 'react'
import { generateSmkItems, smkPdfDownloadUrl, smkWordDownloadUrl } from '../../services/api'
import MarketChart from './MarketChart'

const sections = [
  { no: '01', title: '기술개요', key: 'item_01' },
  { no: '02', title: '기술의 차별성', key: 'item_02' },
  { no: '03', title: '주요 키워드', key: 'item_03' },
  { no: '04', title: 'TRL 단계', key: 'item_04' },
  { no: '05', title: '사업화 포인트', key: 'item_05' },
  { no: '06', title: '활용분야', key: 'item_06' },
  { no: '07', title: '시장규모', chart: true },
  { no: '08', title: '지식재산권 현황', key: 'item_08' },
]

function IpTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="smkapp__smk-item-body">—</p>
  }
  return (
    <div className="smkapp__table-scroll">
      <table className="smkapp__ip-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>특허명</th>
            <th>등록/공개</th>
            <th>공보/등록번호</th>
            <th>출원번호</th>
            <th>출원인</th>
            <th>출원일</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>{row.category || '—'}</td>
              <td>{row.title || '—'}</td>
              <td>{row.doc_type || '—'}</td>
              <td>{row.doc_no || '—'}</td>
              <td>{row.app_no || '—'}</td>
              <td>{row.applicant || '—'}</td>
              <td>{row.apply_date || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SmkResultPanel({
  fileId,
  resultId,
  patent,
  items,
  onGenerated,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 선택된 특허가 바뀌면 이전 에러를 초기화.
  useEffect(() => {
    setError('')
  }, [fileId, resultId])

  const handleGenerate = async () => {
    const generateKey = fileId || resultId
    if (!generateKey || !patent) {
      setError('먼저 PDF를 업로드하고 특허 정보를 추출해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await generateSmkItems(generateKey)
      onGenerated?.(data)
    } catch (err) {
      setError(err.message || 'SMK 작성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const hasResult = items != null

  const handleWordDownload = () => {
    const downloadKey = resultId || fileId
    if (!hasResult || !downloadKey) return
    window.open(smkWordDownloadUrl(downloadKey), '_blank')
  }

  const handlePdfDownload = () => {
    const downloadKey = resultId || fileId
    if (!hasResult || !downloadKey) return
    window.open(smkPdfDownloadUrl(downloadKey), '_blank')
  }

  return (
    <section className="smkapp__panel smkapp__panel--right">
      <div className="smkapp__panel-fill">
        <div className="smkapp__panel-head">
          <h2 className="smkapp__panel-title">SMK 항목 결과</h2>
          <button
            type="button"
            className="smkapp__btn smkapp__btn--primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'SMK 작성 중…' : 'SMK 작성 시작'}
          </button>
        </div>

        <div className="smkapp__panel-scroll">
          {error ? <p className="smkapp__error">{error}</p> : null}
          {!hasResult && !error ? (
            <p className="smkapp__hint">SMK 작성 결과가 여기에 표시됩니다</p>
          ) : null}

          {sections.map((section) => (
            <div className="smkapp__smk-item" key={section.no}>
              <h3 className="smkapp__smk-item-title">
                {section.no}. {section.title}
              </h3>
              {section.chart ? (
                <MarketChart market={items?.item_07} loading={loading && !items?.item_07} />
              ) : section.key === 'item_08' ? (
                <IpTable rows={items?.item_08} />
              ) : (
                <p className="smkapp__smk-item-body">
                  {items?.[section.key] || '—'}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="smkapp__panel-footer">
          <button
            type="button"
            className="smkapp__btn smkapp__btn--outline"
            onClick={handleWordDownload}
            disabled={!hasResult}
          >
            Word 다운로드
          </button>
          <button
            type="button"
            className="smkapp__btn smkapp__btn--outline"
            onClick={handlePdfDownload}
            disabled={!hasResult}
          >
            PDF 다운로드
          </button>
        </div>
      </div>
    </section>
  )
}
