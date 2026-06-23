# RAG 챗봇

## 개요

우측 하단 플로팅 버튼을 누르면 챗봇 패널이 열립니다. 대시보드 관련 질문에 답변합니다.

## 동작 방식

1. 대시보드 관련 질문은 지식 베이스 문서를 검색해 답변에 활용합니다.
2. 일반 질문은 LLM이 질문에 맞게 바로 답변합니다.
3. 대시보드 관련 답변일 때만 하단에 참고 문서 제목이 표시됩니다.

## 제한 사항

- 최근 대화 6턴만 맥락으로 사용합니다.

## API

- `POST /api/chat`
- 요청 본문: `{ "message": "질문", "history": [{ "role": "user"|"assistant", "content": "..." }] }`
- 응답: `{ "reply": "답변", "sources": [{ "title": "...", "snippet": "..." }] }`

## 설정

- Render 환경 변수 `OPENAI_API_KEY`가 필요합니다 (로컬은 `backend/.env`).
- 모델: `OPENAI_MODEL` (기본 gpt-5-nano)
- temperature: `OPENAI_TEMPERATURE` (기본 0.1)
- Vercel 프론트는 `VITE_API_BASE_URL`로 Render 백엔드 `/api/chat`을 호출합니다.

## 제한 사항

- 최근 대화 6턴만 맥락으로 사용합니다.
