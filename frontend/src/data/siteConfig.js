// Central place to configure links / external apps.
export const siteConfig = {
  brand: 'Woody',
  nav: [
    { label: '홈', href: '#top' },
    { label: '뉴스', href: '#news' },
    { label: '포트폴리오', href: '#portfolio' },
    { label: 'SMK Agent', href: '#smk-agent' },
  ],
  // SMK_Agent external app. Replace `url` with your deployed agent URL.
  smkAgent: {
    name: 'SMK Agent',
    description:
      '여러 도구를 연결해 사용자를 대신해 작업을 수행하는 에이전트 앱입니다. 대시보드에서 바로 실행해 보세요.',
    url: 'https://example.com/smk-agent',
    // Set to true to embed the app inline via iframe instead of a link card.
    embed: false,
  },
}
