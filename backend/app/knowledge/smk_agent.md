# SMK Agent

## 개요

SMK Agent는 여러 도구를 연결해 사용자를 대신해 작업을 수행하는 에이전트 앱입니다. 대시보드 하단 "SMK Agent" 섹션에서 바로 실행할 수 있습니다.

## 연결 방법

- `frontend/src/data/siteConfig.js`의 `smkAgent` 설정에서 URL을 지정합니다.
- `embed: false` — 링크 카드로 외부 앱 열기
- `embed: true` — iframe으로 페이지 내 임베드

## 현재 설정

- 이름: SMK Agent
- 기본 URL: siteConfig에서 설정 (배포 시 실제 URL로 교체)
