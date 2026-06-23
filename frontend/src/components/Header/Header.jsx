import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Github } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import './Header.css'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__main">
        <div className="container header__main-inner">
          <Link to="/" className="header__logo" aria-label={siteConfig.brand}>
            <img
              src="/wj_logo.svg"
              alt={siteConfig.brand}
              className="header__logo-img"
            />
          </Link>

          <nav
            className={`header__nav ${open ? 'is-open' : ''}`}
            aria-label="주요 메뉴"
          >
            <ul className="header__nav-list">
              {siteConfig.nav.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      `header__nav-link ${isActive ? 'is-active' : ''}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            {/* 개인 프로필: https://github.com/woodyjeon */}
            <a
              href="https://github.com/"
              className="btn btn--primary header__cta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 보기"
            >
              <span className="header__cta-label">GitHub 보기</span>
              <Github size={16} aria-hidden="true" />
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
