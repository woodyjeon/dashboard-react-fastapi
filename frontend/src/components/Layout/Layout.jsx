import { Outlet } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

export default function Layout() {
  return (
    <div className="app" id="top">
      <Header />
      <main className="app__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
