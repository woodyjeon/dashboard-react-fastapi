import { useState } from 'react'
import { Menu, X, Github } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import './Header.css'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__main">
        <div className="container header__main-inner">
          <a href="#top" className="header__logo" aria-label={siteConfig.brand}>
            <img
              src="/wj_logo.svg"
              alt={siteConfig.brand}
              className="header__logo-img"
            />
          </a>

          <nav
            className={`header__nav ${open ? 'is-open' : ''}`}
            aria-label="주요 메뉴"
          >
            <ul className="header__nav-list">
              {siteConfig.nav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="header__nav-link"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <a
              href="https://github.com/woodyjeon"
              className="btn btn--primary header__cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub 보기 <Github size={16} />
            </a>
            <button
              className="header__hamburger"
              aria-label="메뉴 열기"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
