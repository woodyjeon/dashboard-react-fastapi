import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Hero from './components/Hero/Hero'
import NewsSection from './components/News/NewsSection'
import PortfolioCarousel from './components/Portfolio/PortfolioCarousel'
import SmkAgentSection from './components/SmkAgent/SmkAgentSection'
import ChatWidget from './components/Chat/ChatWidget'

export default function App() {
  return (
    <div className="app" id="top">
      <Header />
      <main className="app__main">
        <Hero />
        <NewsSection />
        <PortfolioCarousel />
        <SmkAgentSection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
