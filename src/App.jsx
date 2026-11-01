import { useEffect, useState } from 'react'
import CompanyPage from './components/CompanyPage.jsx'
import CustomerPage from './components/CustomerPage.jsx'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'
import Hero from './components/Hero.jsx'
import InfoDialog from './components/InfoDialog.jsx'
import { Audience, Faq, Newsletter, Personas } from './components/LandingSections.jsx'
import Navbar from './components/Navbar.jsx'
import SignupPage from './components/SignupPage.jsx'
import TariffPage from './components/TariffPage.jsx'
import StorySection from './components/trade-visuals/StorySection.jsx'
import DemoWorkspace from './components/demo/DemoWorkspace.jsx'

/*
  No router: the app switches between the landing page, the demo workspace and
  full-page views. A URL hash ("#demo", "#company", "#signup", …) is pushed so the browser
  Back button returns to the site.
*/
const VIEWS = ['demo', 'company', 'customer', 'signup', 'tariffs']
const viewFromHash = () => {
  const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
  return VIEWS.includes(hash) ? hash : 'landing'
}

export default function App() {
  const [view, setView] = useState(viewFromHash)
  const [demoMode, setDemoMode] = useState('blank')
  const [demoKey, setDemoKey] = useState(0) // remounts the demo for a fresh session
  const [dialogKey, setDialogKey] = useState(null)

  useEffect(() => {
    const onPop = () => setView(viewFromHash())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openView = (next) => {
    setView(next)
    if (window.location.hash !== `#${next}`) window.history.pushState(null, '', `#${next}`)
    window.scrollTo({ top: 0 })
  }

  const openDemo = (mode) => {
    setDemoMode(mode)
    setDemoKey((k) => k + 1)
    openView('demo')
  }

  const exitView = () => {
    setView('landing')
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    window.scrollTo({ top: 0 })
  }

  if (view === 'demo') {
    return <DemoWorkspace key={demoKey} initialMode={demoMode} onExit={exitView} />
  }

  if (view === 'company') {
    return <CompanyPage onExit={exitView} onOpenDemo={openDemo} />
  }

  const dialog = <InfoDialog dialogKey={dialogKey} onClose={() => setDialogKey(null)} onOpenDemo={openDemo} />

  if (view === 'signup') {
    return (
      <>
        <SignupPage onExit={exitView} onOpenDemo={openDemo} onOpenDialog={setDialogKey} />
        {dialog}
      </>
    )
  }

  if (view === 'tariffs') {
    return <TariffPage onExit={exitView} />
  }

  if (view === 'customer') {
    return <CustomerPage onExit={exitView} onOpenDemo={openDemo} />
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-800 shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar onOpenDialog={setDialogKey} onOpenPage={openView} />
      <main id="main">
        <Hero onOpenDemo={openDemo} />
        <StorySection onOpenDemo={openDemo} />
        <Features onOpenDemo={openDemo} />
        <Audience />
        <Personas />
        <Faq />
        <Newsletter />
      </main>
      <Footer onOpenDialog={setDialogKey} onOpenDemo={openDemo} onOpenPage={openView} />
      {dialog}
    </>
  )
}
