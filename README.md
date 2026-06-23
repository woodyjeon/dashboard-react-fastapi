# wjeon Dashboard

모던 스타일의 개인용 대시보드입니다. 네이버 IT 뉴스 크롤링, 포트폴리오 캐러셀, RAG 기반 챗봇, SMK Agent 연동을 한 화면에서 제공합니다.

**Live Demo:** https://dashboard-react-fastapi.vercel.app/

## 배포 구조

| 영역 | 호스팅 | 저장소 경로 |
| ---- | ------ | ----------- |
| 프론트엔드 | [Vercel](https://vercel.com) | `frontend/` |
| 백엔드 API | [Render](https://render.com) | `backend/` |

```
브라우저 → Vercel (React SPA)
              ↓ /api/* 프록시 (vercel.json) 또는 VITE_API_BASE_URL
           Render (FastAPI) → OpenAI / 네이버 뉴스 크롤링
```

- **GitHub**: https://github.com/woodyjeon/dashboard-react-fastapi
- 로컬 개발: Vite가 `/api`를 `http://127.0.0.1:8000`으로 프록시
- 프로덕션(기본): `vercel.json`이 `/api/*`를 Render로 프록시 (`VITE_API_BASE_URL` 없어도 동작)
- 프로덕션(선택): `VITE_API_BASE_URL`을 Render URL로 직접 지정 (대용량 SMK PDF 업로드 시 권장)

## 기술 스택

| 영역 | 사용 기술 |
| ---- | --------- |
| Frontend | React 19, Vite 8, 커스텀 CSS, lucide-react |
| Backend | FastAPI, LangChain, OpenAI, FAISS |
| 배포 | Vercel (프론트), Render (백엔드) |

## 프로젝트 구조

```
wjeon_dashboard/
├─ frontend/                 # React + Vite SPA (Vercel)
│  ├─ src/components/        # Header, Footer, Hero, News, Portfolio, Chat, SmkAgent
│  ├─ src/data/              # projects, siteConfig, newsSources
│  ├─ src/services/api.js    # API 클라이언트 (VITE_API_BASE_URL)
│  ├─ vercel.json
│  └─ vite.config.js         # 로컬 /api → FastAPI 프록시
├─ backend/                  # FastAPI (Render)
│  └─ app/
│     ├─ main.py
│     ├─ routers/            # news, chat
│     ├─ services/           # naver_news, rag, llm
│     └─ knowledge/          # RAG 지식 베이스 (markdown)
├─ vercel.json               # 루트 배포 시 frontend 빌드 설정
└─ render.yaml               # Render Web Service 설정
```

## 주요 기능

1. **실시간 뉴스 피드** — 네이버 IT·경제, Investing.com 경제 뉴스, 소스 전환 및 카드 자동 스크롤
2. **포트폴리오 캐러셀** — 중앙 대형 카드 + 좌우 미리보기, `1/N` 인디케이터
3. **RAG 챗봇** — LangChain + OpenAI, FAISS 지식 베이스 검색 후 답변
4. **SMK Agent** — 외부 에이전트 앱 링크/iframe 연동

## 로컬 실행

### 1. 백엔드 (FastAPI)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API: http://127.0.0.1:8000
- 문서: http://127.0.0.1:8000/docs

Windows에서 `--reload` 포트 오류 시:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. 프론트엔드 (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

- 접속: http://localhost:5173
- `/api` 요청은 Vite 프록시로 8000번 백엔드에 전달

### 3. LAN에서 다른 기기로 보기

```powershell
# 터미널 1 — 백엔드
uvicorn app.main:app --host 127.0.0.1 --port 8000

# 터미널 2 — 프론트 (8080)
cd frontend
npm run dev:lan
```

터미널에 표시되는 `Network: http://192.168.x.x:8080/` 주소로 접속합니다.

> 백엔드를 실행하지 않으면 뉴스·챗봇 API가 동작하지 않습니다.

## 환경 변수

### Render (백엔드)

Render 대시보드 → Web Service → **Environment** 에서 설정합니다.

| 변수 | 설명 |
| ---- | ---- |
| `OPENAI_API_KEY` | OpenAI API 키 (챗봇 RAG) |
| `OPENAI_MODEL` | LLM 모델 (기본 `gpt-5-nano`) |
| `OPENAI_TEMPERATURE` | temperature (기본 `0.1`) |
| `CORS_ORIGINS` | Vercel 프론트 URL + 로컬 개발 URL (쉼표 구분) |

`CORS_ORIGINS` 예시:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-app.vercel.app
```

### Vercel (프론트엔드)

Vercel → Project → **Settings → Environment Variables**

| 변수 | 설명 |
| ---- | ---- |
| `VITE_API_BASE_URL` | (선택) Render URL 직접 연결. 비워 두면 `vercel.json` `/api` 프록시 사용 |

`vercel.json`에 `/api` → Render 프록시가 있으면 **환경 변수 없이도** 뉴스·챗봇이 동작합니다. SMK 대용량 PDF(4.5MB+)는 `VITE_API_BASE_URL` 직접 설정을 권장합니다.

변경 후 **Redeploy**해야 빌드에 반영됩니다.

### 로컬 (`backend/.env`, `frontend/.env`)

| 파일 | 변수 | 설명 |
| ---- | ---- | ---- |
| `backend/.env` | 위 Render 변수와 동일 | `.env.example` 참고 |
| `frontend/.env` | `VITE_API_BASE_URL` | 로컬에서는 비워 두면 Vite 프록시 사용 |

## 배포

### 백엔드 — Render

1. [Render](https://render.com) → **New → Web Service**
2. GitHub 저장소 `woodyjeon/dashboard-react-fastapi` 연결
3. **Root Directory**: `backend`
4. **Runtime**: Python 3
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. 환경 변수 설정 (`OPENAI_API_KEY`, `CORS_ORIGINS` 등)
8. 배포 후 URL 확인 (예: `https://woody-dashboard-api.onrender.com`)

저장소 루트의 `render.yaml`을 사용하면 위 설정을 자동으로 적용할 수 있습니다.

**헬스 체크**: `GET /api/health` → `{"status":"ok"}`

> Render 무료 플랜은 유휴 후 cold start로 첫 요청이 느릴 수 있습니다.

### 프론트엔드 — Vercel

1. [Vercel](https://vercel.com) → **Add New Project**
2. 같은 GitHub 저장소 연결
3. **Root Directory**: `frontend` (또는 루트 + 루트 `vercel.json`)
4. **Framework**: Vite
5. 환경 변수 `VITE_API_BASE_URL` = Render 백엔드 URL
6. **Deploy**

CLI 배포 (선택):

```bash
cd frontend
npx vercel --prod
```

### 배포 후 연결 확인

배포 직후 아래 순서로 확인하세요.

### 1. 환경 변수 (필수)

| 위치 | 변수 | 확인 |
| ---- | ---- | ---- |
| **Vercel** | `vercel.json` `/api` 프록시 | `https://dashboard-react-fastapi.onrender.com` 로 연결 |
| **Vercel** | `VITE_API_BASE_URL` | (선택) Render URL 직접 연결 |
| **Render** | `OPENAI_API_KEY` | 챗봇·SMK AI 기능 |
| **Render** | `CORS_ORIGINS` | `https://dashboard-react-fastapi.vercel.app` + 로컬 URL |

> `VITE_API_BASE_URL`을 Render로 직접 설정할 때만 Render `CORS_ORIGINS`에 Vercel 도메인이 필요합니다. 프록시만 쓰면 CORS는 동일 출처라 불필요합니다.

### 2. API 스모크 테스트 (로컬 또는 Render)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python scripts/verify_api.py
python scripts/verify_api.py --base-url https://your-service.onrender.com
```

확인 항목: `/api/health`, 뉴스 3소스, `/api/smk/results`, `/api/chat`

### 3. 브라우저 기능 체크

| 페이지 | 데이터 소스 | 배포 시 주의 |
| ------ | ----------- | ------------ |
| `/` 뉴스 캐러셀 | Render `/api/news` | CORS + `VITE_API_BASE_URL` |
| `/news` | 동일 + 페이지네이션 | 새로고침 시 재크롤링 |
| `/portfolio` | `projects.js` (정적) | 백엔드 불필요 |
| 챗봇 FAB | `/api/chat` + `knowledge/*.md` | `OPENAI_API_KEY` |
| `/smk` | Render SMK API | PDF·결과는 **Render 디스크** (재배포 시 초기화 가능) |

### 4. SMK·PDF 배포 주의

- `backend/app/assets/fonts/malgun.ttf` — **Git에 포함**해야 Render에서 PDF 한글 출력 가능
- `uploads/`, `outputs/` — `.gitignore` 처리 (서버 로컬 저장). Render 무료 플랜은 **재시작·재배포 시 SMK 업로드·작성 이력이 사라질 수 있음** (로컬과 동일 UX, 영구 저장은 아님)

### 5. 수동 URL 확인

1. Render: `https://your-service.onrender.com/api/health` → `{"status":"ok"}`
2. Render: `https://your-service.onrender.com/api/news?source=naver_it&page=1&page_size=3`
3. Vercel 사이트에서 뉴스·챗봇·SMK 업로드 테스트
4. CORS 오류 시 Render `CORS_ORIGINS`에 Vercel 도메인 추가 후 재배포

## 커스터마이징

| 항목 | 파일 |
| ---- | ---- |
| 프로젝트 카드 | `frontend/src/data/projects.js` |
| 네비/푸터/SMK Agent | `frontend/src/data/siteConfig.js` |
| 디자인 토큰 | `frontend/src/styles/tokens.css` |
| 챗봇 지식 베이스 | `backend/app/knowledge/*.md` |
| 뉴스 크롤러 | `backend/app/services/naver_news_service.py` |
