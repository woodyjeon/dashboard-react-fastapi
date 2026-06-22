# RAG 챗봇

## 개요

우측 하단 플로팅 버튼을 누르면 챗봇 패널이 열립니다. 대시보드 관련 질문에 답변합니다.

## 동작 방식 (RAG)

1. 사용자 질문을 OpenAI 임베딩으로 벡터화합니다.
2. FAISS 벡터 스토어에서 관련 지식 문서를 검색합니다.
3. 검색된 문서를 컨텍스트로 LangChain ChatOpenAI(gpt-5-nano)가 답변을 생성합니다.
4. 답변 하단에 참고한 문서 제목이 표시됩니다.

## API

- `POST /api/chat`
- 요청 본문: `{ "message": "질문", "history": [{ "role": "user"|"assistant", "content": "..." }] }`
- 응답: `{ "reply": "답변", "sources": [{ "title": "...", "snippet": "..." }] }`

## 설정

- `backend/.env`의 `OPENAI_API_KEY`가 필요합니다.
- 모델: `OPENAI_MODEL` (기본 gpt-5-nano)
- temperature: `OPENAI_TEMPERATURE` (기본 0.1)

## 제한 사항

- 지식 베이스에 없는 내용은 모른다고 답합니다.
- 최근 대화 6턴만 맥락으로 사용합니다.
