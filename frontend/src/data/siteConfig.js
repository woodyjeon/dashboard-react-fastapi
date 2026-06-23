// Central place to configure links / external apps.
export const siteConfig = {
  brand: 'wjeon',
  nav: [
    { label: '홈', href: '/' },
    { label: '뉴스', href: '/news' },
    { label: '포트폴리오', href: '/portfolio' },
    { label: 'SMK', href: '/smk' },
  ],
  smkAgent: {
    name: 'SMK 자동화 Agent',
    description:
      '기술홍보자료(SMK)는 기술이전·사업화를 위해 특허의 핵심 내용을 정리한 마케팅 문서입니다. 특허 PDF만 업로드하면 출원 정보 추출부터 SMK 항목 작성, 시장규모 조사, Word·PDF 출력까지 자동으로 진행합니다.',
    url: 'https://example.com/smk-agent',
    // Set to true to embed the app inline via iframe instead of a link card.
    embed: false,
  },
}
