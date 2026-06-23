// Portfolio projects — wjeon Dashboard 저장소에서 실제 개발·운영 중인 모듈 기준.
export const projects = [
  {
    id: 'p1',
    slug: 'project1',
    title: 'wjeon Dashboard',
    category: 'Full-Stack',
    description:
      'React SPA와 FastAPI를 분리 배포한 개인 대시보드. 뉴스·포트폴리오·챗봇·SMK Agent를 단일 UX로 통합합니다.',
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
    url: 'https://github.com/woodyjeon/dashboard-react-fastapi',
    tags: ['React 19', 'Vite 8', 'FastAPI', 'Vercel', 'Render'],
    detail: {
      period: '2024 — 현재',
      role: '풀스택 설계 · 구현 · 배포',
      overview:
        'wjeon Dashboard는 woody_dashboard 모노레포의 메인 프론트엔드입니다. 홈 Hero, 뉴스 캐러셀, 포트폴리오, SMK Agent 진입점, 플로팅 RAG 챗봇을 하나의 레이아웃으로 묶었습니다. Vite dev proxy로 로컬 `/api`를 FastAPI에 연결하고, 프로덕션에서는 Vercel → Render 구조로 운영합니다.',
      highlights: [
        'react-router-dom 기반 페이지 라우팅 (`/`, `/news`, `/portfolio`, `/smk`)',
        '공통 Layout(Header · Footer · ChatWidget)과 ScrollToTop 처리',
        'Vite `VITE_API_BASE_URL` / Render `CORS_ORIGINS` 환경 분리',
        'GitHub Actions 없이 Vercel·Render 각각 Git 연동 배포',
      ],
    },
  },
  {
    id: 'p2',
    slug: 'project2',
    title: '사이트 가이드 RAG 챗봇',
    category: 'AI / RAG',
    description:
      '대시보드 지식 문서를 FAISS에 임베딩해, 방문자가 사이트 기능을 자연어로 질문할 수 있는 위젯 챗봇입니다.',
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
    url: '/',
    tags: ['LangChain', 'FAISS', 'OpenAI', 'RAG'],
    detail: {
      period: '2024 — 현재',
      role: '백엔드 · AI 파이프라인',
      overview:
        '`backend/app/knowledge/*.md`에 정리된 뉴스·포트폴리오·SMK·대시보드 안내 문서를 RecursiveCharacterTextSplitter로 청킹한 뒤, OpenAI Embedding + FAISS 벡터스토어로 검색합니다. 사용자 질문과 유사한 청크를 찾아 LLM이 답변하며, 프론트엔드 ChatWidget에서 대화 이력을 유지합니다.',
      highlights: [
        '`POST /api/chat` — 유사 문서 검색 후 OpenAI 답변 생성',
        '청크 크기 500 / overlap 80, 마크다운 헤더 단위 분할',
        '응답에 참고한 knowledge 파일 출처(`ChatSource`) 포함',
        '모든 페이지 우하단 플로팅 위젯으로 동일 API 재사용',
      ],
    },
  },
  {
    id: 'p3',
    slug: 'project3',
    title: '멀티소스 뉴스 크롤링 API',
    category: 'Data / Backend',
    description:
      '네이버 IT·경제 섹션 HTML 크롤링과 Investing.com RSS를 통합해, 페이지네이션 가능한 뉴스 API를 제공합니다.',
    image:
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
    url: '/news',
    tags: ['httpx', 'BeautifulSoup', 'feedparser', 'FastAPI'],
    detail: {
      period: '2024 — 현재',
      role: '백엔드 · 크롤러 · API',
      overview:
        '뉴스 모듈은 정적 목업이 아니라 요청 시마다 외부 소스에서 기사를 수집합니다. 네이버는 `news.naver.com/section` HTML의 `.sa_item` 블록을 파싱하고, Investing 경제는 공식 RSS(`news_14.rss`)를 사용합니다. 90초 TTL 메모리 캐시 후 `page` / `page_size`로 슬라이스해 `/news` 그리드 페이지네이션과 홈 캐러셀에 공급합니다.',
      highlights: [
        '소스: `naver_it`, `naver_economy`, `investing_economy`',
        '`GET /api/news?page=1&page_size=12&refresh=true` 페이지네이션 API',
        '제목·요약·언론사·이미지·게시 시각 정규화 및 URL 기반 중복 제거',
        '프론트: 소스 탭 전환, 스켈레톤 로딩, 새로고침·자동 스크롤 캐러셀',
      ],
    },
  },
  {
    id: 'p4',
    slug: 'project4',
    title: 'SMK 자동화 Agent',
    category: 'IP / Automation',
    description:
      '특허 PDF 업로드부터 SMK 01~08 항목 생성, 시장규모 조사, Word·PDF 출력까지 자동화하는 기술이전 마케팅 도구입니다.',
    image:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
    url: '/smk',
    tags: ['OpenAI Vision', 'PyMuPDF', 'python-docx', 'fpdf2'],
    detail: {
      period: '2025 — 현재',
      role: '풀스택 · AI 워크플로',
      overview:
        'SMK Agent는 `/smk` 전용 워크스페이스입니다. PDF를 업로드하면 PyMuPDF로 페이지 이미지·대표 도면을 추출하고, OpenAI Vision으로 출원번호·명칭·출원인·기술요약을 구조화합니다. 이후 LLM이 SMK 01~06 개조식 항목을 작성하고, 웹 검색으로 07 시장규모·Chart.js 차트 데이터를 수집하며, 08 지식재산권 표를 자동 구성합니다. 결과는 `smk_list.json`에 저장되어 목록에서 복원할 수 있습니다.',
      highlights: [
        'API: upload → extract → generate → download(word/pdf)',
        '다중 PDF 업로드·세션 캐시·결과 테이블 CRUD',
        'OpenAI `web_search_preview` + 폴백 JSON으로 시장규모(07) 생성',
        'Word(docx) / PDF(fpdf2 + 맑은 고딕) 다운로드 지원',
      ],
    },
  },
  {
    id: 'p5',
    slug: 'project5',
    title: 'wjeon UI 컴포넌트 시스템',
    category: 'Frontend / UI',
    description:
      'tokens.css 디자인 토큰과 섹션·카드·캐러셀 패턴으로 뉴스·포트폴리오·SMK 화면의 시각 언어를 통일한 프론트엔드 UI 레이어입니다.',
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
    url: '/portfolio',
    tags: ['CSS Variables', 'lucide-react', 'Responsive'],
    detail: {
      period: '2024 — 현재',
      role: '프론트엔드 · UI 설계',
      overview:
        'UI 프레임워크 없이 CSS 변수(`tokens.css`)와 컴포넌트별 CSS 모듈로 구성했습니다. `.section` / `.section--light` / `.section--muted` 스캐폴딩, eyebrow + `section__title` + `section__subtitle` 타이포 패턴, `btn` 변형을 뉴스·포트폴리오·SMK·상세 페이지에 공통 적용합니다. 포트폴리오 캐러셀 드래그 스와이프, 뉴스 가로 스크롤, SMK 2단 패널 레이아웃도 이 시스템 위에 구현됩니다.',
      highlights: [
        '브랜드 컬러 `#aa1c41` · 네이비 헤더/푸터 · pill 버튼 토큰',
        'NewsCard / ProjectCard / ProjectGridCard 재사용 카드 패턴',
        '포트폴리오 캐러셀·그리드·`/portfolio/:slug` 상세 페이지 레이아웃',
        '모바일 브레이크포인트(560 / 768 / 900px) 반응형 그리드',
      ],
    },
  },
]
