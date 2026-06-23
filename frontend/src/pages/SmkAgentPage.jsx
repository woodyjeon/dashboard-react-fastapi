import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bot } from 'lucide-react'
import ResultsTable from '../components/SmkAgentApp/ResultsTable'
import UploadPanel from '../components/SmkAgentApp/UploadPanel'
import PatentInfoPanel from '../components/SmkAgentApp/PatentInfoPanel'
import SmkResultPanel from '../components/SmkAgentApp/SmkResultPanel'
import {
  fetchSmkResults,
  fetchSmkResult,
  deleteSmkResult,
} from '../services/api'
import '../components/SmkAgentApp/SmkAgentApp.css'

function listIdFrom(patent, fileId) {
  return patent?.app_no?.trim() || fileId
}

function itemsFromSmkData(data) {
  if (!data?.items && !data?.market) return null
  return {
    ...(data.items || {}),
    item_07: data.market || null,
    item_08: data.ip_table || [],
  }
}

function sessionFromEntry(entry) {
  const data = entry.smk_data || {}
  return {
    fileId: data.upload_file_id || entry.id,
    listId: entry.id,
    patent: data.patent || {},
    items: itemsFromSmkData(data),
  }
}

export default function SmkAgentPage() {
  const [results, setResults] = useState([])
  // fileId / app_no 양쪽 키로 같은 세션을 가리킴.
  const [sessions, setSessions] = useState({})
  const [current, setCurrent] = useState(null)

  const saveSession = useCallback((session) => {
    setSessions((prev) => {
      const next = { ...prev, [session.fileId]: session, [session.listId]: session }
      return next
    })
    return session
  }, [])

  const refreshResults = useCallback(async () => {
    try {
      setResults(await fetchSmkResults())
    } catch {
      // 목록 로드 실패는 조용히 무시.
    }
  }, [])

  useEffect(() => {
    refreshResults()
  }, [refreshResults])

  // 추출만 된 PDF도 목록에 보이도록 백엔드 목록과 로컬 세션 병합.
  const displayResults = useMemo(() => {
    const backendIds = new Set(results.map((r) => r.id))
    const seenFileIds = new Set()
    const localRows = []

    for (const session of Object.values(sessions)) {
      if (seenFileIds.has(session.fileId)) continue
      seenFileIds.add(session.fileId)
      if (backendIds.has(session.listId)) continue
      localRows.push({
        id: session.listId,
        doc_type: session.patent?.doc_type || '',
        doc_no: session.patent?.doc_no || '',
        app_no: session.patent?.app_no || '',
        title: session.patent?.title || '',
        applicant: session.patent?.applicant || '',
        created_at: session.created_at || '—',
      })
    }

    return [...results, ...localRows]
  }, [results, sessions])

  const handleExtracted = (patentInfo, fileId) => {
    const session = saveSession({
      fileId,
      listId: listIdFrom(patentInfo, fileId),
      patent: patentInfo,
      items: null,
      created_at: '—',
    })
    setCurrent(session)
    refreshResults()
  }

  const handleGenerated = (items) => {
    setCurrent((cur) => {
      if (!cur) return cur
      const session = saveSession({
        ...cur,
        items: {
          ...items,
          item_07: items.item_07 ?? null,
          item_08: items.item_08 ?? [],
        },
        created_at: new Date().toLocaleString('ko-KR', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      return session
    })
    refreshResults()
  }

  const handleSelect = async (id) => {
    const cached = sessions[id]
    if (cached) {
      setCurrent(cached)
    }

    try {
      const entry = await fetchSmkResult(id)
      const session = saveSession(sessionFromEntry(entry))
      setCurrent(session)
    } catch {
      if (!cached) {
        setCurrent(null)
      }
    }
  }

  const handleDelete = async (id) => {
    const target = sessions[id]
    const deleteId = target?.listId ?? id

    try {
      await deleteSmkResult(deleteId)
    } catch {
      // smk_list에 없는 추출-only 항목은 무시.
    }

    setSessions((prev) => {
      const next = { ...prev }
      const session = prev[id] || prev[deleteId]
      if (session) {
        delete next[session.fileId]
        delete next[session.listId]
      } else {
        delete next[id]
        delete next[deleteId]
      }
      return next
    })

    setCurrent((cur) => {
      if (!cur) return null
      if (cur.listId === deleteId || cur.fileId === id) return null
      return cur
    })
    refreshResults()
  }

  const activeId = current?.listId ?? null
  const patent = current?.patent ?? null

  return (
    <section className="section section--muted smk" id="smk">
      <div className="container">
        <div className="smk__head">
          <span className="smk__eyebrow">
            <Bot size={16} /> SMK 자동화
          </span>
          <h2 className="section__title">SMK 자동화 Agent</h2>
          <p className="section__subtitle">
            특허 PDF를 업로드하면 핵심 정보를 추출하고 SMK 항목을 자동으로
            작성합니다.
          </p>
        </div>

        <div className="smkapp">
          <div className="smkapp__top-row">
            <ResultsTable
              results={displayResults}
              activeId={activeId}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
            <UploadPanel onExtracted={handleExtracted} />
          </div>

          <div className="smkapp__bottom">
            <PatentInfoPanel patent={patent} />
            <SmkResultPanel
              fileId={current?.fileId ?? null}
              resultId={current?.listId ?? null}
              patent={patent}
              items={current?.items ?? null}
              onGenerated={handleGenerated}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
