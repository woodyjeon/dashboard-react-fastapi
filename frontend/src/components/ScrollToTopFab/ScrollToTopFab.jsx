import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import './ScrollToTopFab.css'

const SCROLL_THRESHOLD = 240

export default function ScrollToTopFab() {
  const { pathname } = useLocation()
  const isSmkRoute = pathname.startsWith('/smk')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return createPortal(
    <button
      type="button"
      className={`scroll-top-fab ${visible ? 'is-visible' : ''} ${isSmkRoute ? 'scroll-top-fab--smk' : ''}`}
      onClick={handleClick}
      aria-label="맨 위로 이동"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>,
    document.body,
  )
}
