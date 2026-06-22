import { ArrowUp, Linkedin, Instagram, Github } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import './Footer.css'

const socials = [
  {
    Icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/woodyjeon/',
  },
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Github, label: 'GitHub', href: 'https://github.com/woodyjeon' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__main">
          <div className="footer__brand">
            <a href="#top" className="footer__logo" aria-label="Woody Jeon">
              <img src="/wj_logo.svg" alt="Woody Jeon" />
            </a>
            <p className="footer__tagline">
              뉴스, 포트폴리오, 그리고 에이전트를 한곳에서.
            </p>
            <ul className="footer__socials">
              {socials.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="footer__social"
                    target={href === '#' ? undefined : '_blank'}
                    rel={href === '#' ? undefined : 'noopener noreferrer'}
                  >
                    <Icon size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="footer__nav" aria-label="푸터 메뉴">
            <h3 className="footer__nav-title">바로가기</h3>
            <ul className="footer__nav-list">
              {siteConfig.nav.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="footer__link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Woody Jeon Dashboard. All rights
            reserved.
          </p>
          <a href="#top" className="footer__totop-link">
            맨 위로 이동 <ArrowUp size={15} />
          </a>
        </div>
      </div>
    </footer>
  )
}
