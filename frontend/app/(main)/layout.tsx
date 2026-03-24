import type { Metadata } from 'next'
import '../globals.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Carggo GM | Global Freight & Logistics',
  description: 'Indigenous-owned freight and logistics company with 50+ years of combined management experience. Providing air, ocean, road, and rail transport solutions across 200+ countries.',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  )
}
