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

export async function fetchNews(source = 'naver_it', limit = 20) {
  try {
    const data = await request(`/api/news?source=${source}&limit=${limit}`)
    return data.items ?? []
  } catch (err) {
    throw new Error(err.message || '뉴스를 불러오지 못했습니다.')
  }
}

export async function sendChat(message, history = []) {
  return await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  })
}
