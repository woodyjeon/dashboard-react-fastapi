import { Link } from 'react-router-dom'
import { ArrowUp, Linkedin, Instagram, Github } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import './Footer.css'

const socials = [
  {
    Icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/',
    // href: 'https://www.linkedin.com/in/woodyjeon/',
  },
  {
    Icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/',
  },
  {
    Icon: Github,
    label: 'GitHub',
    href: 'https://github.com/',
    // href: 'https://github.com/woodyjeon',
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__main">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="wjeon">
              <img src="/wj_logo.svg" alt="wjeon" />
            </Link>
            <p className="footer__tagline">
              뉴스, 포트폴리오, 그리고 SMK 에이전트를 한곳에서.
            </p>
            <ul className="footer__socials">
              {socials.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="footer__social"
                    target="_blank"
                    rel="noopener noreferrer"
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
                  <Link to={item.href} className="footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} wjeon Dashboard. All rights
            reserved.
          </p>
          <button
            type="button"
            className="footer__totop-link"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            맨 위로 이동 <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  )
}
