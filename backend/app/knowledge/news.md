# 뉴스 섹션

## 개요

뉴스 섹션은 홈 화면에서 "실시간 뉴스 피드"로 표시됩니다. IT 관련 최신 기사를 카드 형태로 보여주며 자동으로 가로 스크롤됩니다.

## 데이터 소스

- **네이버 IT**: IT/과학 섹션(https://news.naver.com/section/105) 크롤링
- **네이버 경제**: 경제 섹션(https://news.naver.com/section/101) 크롤링
- **Investing**: 경제 섹션(https://www.investing.com/news/economy) HTML 페이지네이션 크롤링 (스크롤 추가 로드 시뮬레이션, 실패 시 RSS 폴백)

## API

- `GET /api/news?source=naver_it&limit=24`
- `GET /api/news?source=naver_economy&limit=24`
- `GET /api/news?source=investing_economy&limit=24`
- 응답: 기사 제목, 요약, 언론사, 이미지, 원문 URL

## UI 동작

- 카드 위에 마우스를 올리면 자동 스크롤이 일시정지됩니다.
- 일시정지/재생, 이전/다음 버튼으로 수동 제어가 가능합니다.
- 소스 전환 버튼: naver IT / naver 경제 / Investing
