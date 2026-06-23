import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import ChatWidget from './components/Chat/ChatWidget'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import NewsPage from './pages/NewsPage'
import PortfolioPage from './pages/PortfolioPage'
import PortfolioDetailPage from './pages/PortfolioDetailPage'
import SmkAgentPage from './pages/SmkAgentPage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
        <Route path="/smk" element={<SmkAgentPage />} />
      </Route>
    </Routes>
      <ChatWidget />
    </>
  )
}
