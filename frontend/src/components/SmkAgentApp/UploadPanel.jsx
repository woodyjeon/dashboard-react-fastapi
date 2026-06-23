import { useRef, useState } from 'react'
import { FileSearch, Upload } from 'lucide-react'
import { uploadSmkPdf, extractSmkPatent } from '../../services/api'

export default function UploadPanel({ onExtracted }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected)
    setError('')
    setStatus('')
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('PDF 파일을 먼저 선택해주세요.')
      return
    }
    setLoading(true)
    setError('')

    const failed = []
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]
      const progress = files.length > 1 ? ` (${i + 1}/${files.length})` : ''
      try {
        setStatus(`${file.name} 분석 중...${progress}`)
        const uploaded = await uploadSmkPdf(file)
        const patent = await extractSmkPatent(uploaded.id)
        onExtracted?.(patent, uploaded.id, uploaded.filename || file.name)
      } catch (err) {
        failed.push(`${file.name}: ${err.message || '분석 실패'}`)
      }
    }

    if (failed.length > 0) {
      setError(failed.join('\n'))
      setStatus(failed.length === files.length ? '' : '일부 완료')
    } else {
      setStatus('완료')
    }
    setLoading(false)
  }

  return (
    <div className="smkapp__upload">
      <div className="smkapp__upload-head">
        <p className="smkapp__upload-title">특허 PDF 업로드</p>
        <p className="smkapp__upload-desc">공개·등록 공보 PDF를 선택한 뒤 분석을 시작하세요.</p>
      </div>

      <div className="smkapp__upload-actions">
        <label className="smkapp__btn smkapp__btn--outline smkapp__btn--block smkapp__file">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            hidden
            onChange={handleSelect}
          />
          <Upload size={16} aria-hidden="true" />
          <span>PDF 선택</span>
        </label>
        <button
          type="button"
          className="smkapp__btn smkapp__btn--primary smkapp__btn--block"
          onClick={handleAnalyze}
          disabled={loading || files.length === 0}
        >
          <FileSearch size={16} aria-hidden="true" />
          {loading ? '특허 문서 분석 중...' : '특허 정보 보기'}
        </button>
      </div>

      {files.length > 0 ? (
        <p className="smkapp__file-name" title={files.length === 1 ? files[0].name : undefined}>
          {files.length === 1
            ? files[0].name
            : `${files.length}개 파일 선택됨`}
        </p>
      ) : (
        <p className="smkapp__file-placeholder">선택된 파일 없음</p>
      )}

      {loading || status ? (
        <div className="smkapp__status">
          {loading ? <span className="smkapp__spinner" aria-hidden="true" /> : null}
          <span className="smkapp__status-text">{status}</span>
        </div>
      ) : null}

      {error ? (
        <p className="smkapp__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
