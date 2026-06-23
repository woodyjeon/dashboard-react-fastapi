import Hero from '../components/Hero/Hero'
import NewsSection from '../components/News/NewsSection'
import PortfolioCarousel from '../components/Portfolio/PortfolioCarousel'
import SmkAgentSection from '../components/SmkAgent/SmkAgentSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <NewsSection />
      <PortfolioCarousel />
      <SmkAgentSection />
    </>
  )
}
