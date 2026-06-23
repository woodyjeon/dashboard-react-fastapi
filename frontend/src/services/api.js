// Base URL: in dev, Vite proxies `/api` to the FastAPI server.
// In production, set VITE_API_BASE_URL to your deployed backend.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      if (body.detail) detail = body.detail
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail)
  }
  return res.json()
}

export async function fetchNews(source = 'naver_it', options = {}) {
  const { page = 1, pageSize = 20, refresh = false } = options
  const params = new URLSearchParams({
    source,
    page: String(page),
    page_size: String(pageSize),
  })
  if (refresh) params.set('refresh', 'true')

  try {
    return await request(`/api/news?${params}`)
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('Unexpected token') || msg.includes('is not valid JSON')) {
      throw new Error(
        '뉴스 API에 연결하지 못했습니다. Vercel /api 프록시 또는 VITE_API_BASE_URL 설정을 확인해주세요.',
      )
    }
    throw new Error(msg || '뉴스를 불러오지 못했습니다.')
  }
}

export async function sendChat(message, history = []) {
  return await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  })
}

export async function uploadSmkPdf(file) {
  const form = new FormData()
  form.append('file', file)

  // Don't set Content-Type manually; the browser adds the multipart boundary.
  const res = await fetch(`${API_BASE}/api/smk/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    let detail = `업로드 실패: ${res.status}`
    try {
      const body = await res.json()
      if (body.detail) detail = body.detail
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail)
  }
  return res.json()
}

export async function extractSmkPatent(id) {
  return await request(`/api/smk/extract/${id}`, { method: 'POST' })
}

export async function generateSmkItems(id) {
  return await request(`/api/smk/generate/${id}`, { method: 'POST' })
}

export function smkWordDownloadUrl(id) {
  return `${API_BASE}/api/smk/download/word/${id}`
}

export function smkPdfDownloadUrl(id) {
  return `${API_BASE}/api/smk/download/pdf/${id}`
}

export async function fetchSmkResults() {
  return await request('/api/smk/results')
}

export async function fetchSmkResult(id) {
  return await request(`/api/smk/result/${encodeURIComponent(id)}`)
}

export async function deleteSmkResult(id) {
  return await request(`/api/smk/result/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
