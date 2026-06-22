# Woody Dashboard

모던 스타일의 개인용 대시보드입니다. 뉴스 자동 스크롤링, 포트폴리오 캐러셀, RAG 기반 챗봇, SMK Agent 연동을 한 화면에서 제공합니다.

## 기술 스택

| 영역      | 사용 기술                          |
| --------- | ---------------------------------- |
| Frontend  | React 19, Vite 8, 커스텀 CSS       |
| 아이콘    | lucide-react                       |
| Backend   | FastAPI (Python 3.13)              |
| 배포      | Vercel (프론트엔드)                |

## 프로젝트 구조

```
woody_dashboard/
├─ frontend/                 # React + Vite SPA
│  ├─ src/
│  │  ├─ components/         # Header, Footer, Hero, News, Portfolio, SmkAgent, Chat
│  │  ├─ data/               # 프로젝트/사이트 설정/뉴스
│  │  ├─ services/api.js     # 백엔드 API 클라이언트
│  │  └─ styles/             # 디자인 토큰 & 전역 CSS
│  ├─ vercel.json
│  └─ vite.config.js         # /api → FastAPI 프록시
└─ backend/                  # FastAPI 서버
   └─ app/
      ├─ main.py             # 앱 + CORS + 라우터
      ├─ routers/            # news, chat
      ├─ services/           # news_service, rag_service, llm_service
      └─ data/mock_news.py
```

## 주요 기능

1. **뉴스 자동 스크롤링** — 카드형 뉴스가 가로로 자동 스크롤됩니다(마우스 오버 시 일시정지, 수동 이동/일시정지 버튼 제공). 데이터는 `GET /api/news`에서 받아오며 RSS 피드를 제공합니다.
2. **포트폴리오 캐러셀** — 중앙 대형 카드 + 양옆 미리보기, 좌우 화살표, `1/N` 인디케이터. 프로젝트는 `frontend/src/data/projects.js`에서 편집합니다.
3. **RAG 기반 챗봇** — 우측 하단 플로팅 위젯. `POST /api/chat`이 지식 베이스에서 관련 문서를 검색(`rag_service`)해 LLM(`llm_service`)으로 답변합니다.
4. **SMK Agent** — 외부 에이전트 앱을 링크 카드 또는 iframe 임베드로 연결합니다. `frontend/src/data/siteConfig.js`의 `smkAgent`에서 설정합니다.

## 로컬 실행

### 1. 백엔드 (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows (PowerShell: .venv\Scripts\Activate.ps1)
# source .venv/bin/activate       # macOS / Linux
pip install -r requirements.txt
copy .env.example .env            # (macOS/Linux: cp .env.example .env)
uvicorn app.main:app --reload --port 8000
```

API 문서: http://127.0.0.1:8000/docs

### 2. 프론트엔드 (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

개발 서버: http://localhost:5173 (`/api` 요청은 자동으로 8000번 백엔드로 프록시됩니다.)

### 3. 같은 Wi‑Fi / LAN에서 다른 기기로 보기

1. **내 PC IP 확인** (PowerShell):
   ```powershell
   ipconfig
   ```
   `IPv4 주소` 예: `192.168.0.23`

2. **백엔드** (이 PC에서 실행, 다른 기기는 직접 접속하지 않음):
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

3. **프론트엔드** — 포트 **8080**으로 LAN 공개:
   ```bash
   cd frontend
   npm run dev:lan
   ```
   터미널에 `Network: http://192.168.x.x:8080/` 가 표시됩니다.

4. **다른 사람 PC/폰** 브라우저에서:
   ```
   http://192.168.0.23:8080
   ```
   (본인 IP로 바꿔서 접속)

포트를 바꾸려면:
```bash
# 예: 3000번 포트
npx vite --port 3000
```
또는 `frontend/.env`에 `VITE_DEV_PORT=3000` 설정 후 `npm run dev`.

> Windows 방화벽에서 해당 포트(8080 등) 허용 팝업이 뜨면 **허용**을 눌러야 다른 기기에서 접속됩니다.

> 백엔드를 실행하지 않아도 프론트엔드는 뉴스 / 챗봇 응답으로 동작합니다.

## 환경 변수

### backend/.env

| 변수             | 설명                                                   |
| ---------------- | ------------------------------------------------------ |
| `OPENAI_API_KEY` | OpenAI API 키 (챗봇 RAG + gpt-5-nano) |
| `OPENAI_MODEL`   | 사용할 모델 (기본 `gpt-5-nano`)         |
| `OPENAI_TEMPERATURE` | LLM temperature (기본 `0.1`)        |
| `NEWS_RSS_FEEDS` | 쉼표로 구분한 RSS 피드 URL. 뉴스 사용.     |
| `CORS_ORIGINS`   | 허용할 프론트엔드 오리진 목록                          |

### frontend/.env

| 변수                | 설명                                                            |
| ------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL` | 배포된 백엔드 주소. 로컬에서는 비워 두면 Vite 프록시를 사용함.   |

## 배포 (Vercel)

프론트엔드는 `frontend/` 디렉터리를 루트로 Vercel에 배포합니다.

1. Vercel에서 새 프로젝트 생성 → Root Directory를 `frontend`로 설정
2. Framework Preset: Vite (자동 감지, `vercel.json` 포함)
3. 환경 변수 `VITE_API_BASE_URL`에 배포된 FastAPI 백엔드 URL 입력
4. 백엔드(FastAPI)는 Railway/Render/Fly.io 등에 별도 배포

## 커스터마이징 포인트

- 프로젝트 카드: `frontend/src/data/projects.js`
- 네비/푸터/SMK Agent 링크: `frontend/src/data/siteConfig.js`
- 디자인 색상/토큰: `frontend/src/styles/tokens.css`
- 챗봇 지식 베이스: `backend/app/services/rag_service.py`의 `KNOWLEDGE_BASE`
- 실제 뉴스 소스: `backend/.env`의 `NEWS_RSS_FEEDS` 또는 `news_service.py`
