// src/components/landing/LandingPage.tsx
import 'bootstrap-icons/font/bootstrap-icons.css'
import Navbar from './Navbar'
import Hero from './Hero'
import Features from './Features'
import Stats from './Stats'
import Sectors from './Sectors'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Sectors />
      <Footer />
    </main>
  )
}