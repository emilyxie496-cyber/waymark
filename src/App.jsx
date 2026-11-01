import { Suspense, lazy, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ErrorBoundary, Skeleton } from './components/app/kit.jsx'
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
import { DemoPicker, Pricing, SignIn, SignUp } from './pages/Public.jsx'
import { WorkspaceProvider } from './state/WorkspaceContext.jsx'

// The application is split from the marketing site: maps, charts and PDF export are large.
const AppShell = lazy(() => import('./components/app/AppShell.jsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const Overview = lazy(() => import('./pages/app/Overview.jsx'))
const MapPage = lazy(() => import('./pages/app/MapPage.jsx'))
const Shipments = lazy(() => import('./pages/app/Shipments.jsx'))
const Simulator = lazy(() => import('./pages/app/Simulator.jsx'))
const CanadianAlternatives = lazy(() => import('./pages/app/Alternatives.jsx').then((m) => ({ default: m.CanadianAlternatives })))
const GlobalAlternatives = lazy(() => import('./pages/app/Alternatives.jsx').then((m) => ({ default: m.GlobalAlternatives })))
const Sustainability = lazy(() => import('./pages/app/Sustainability.jsx'))
const Reports = lazy(() => import('./pages/app/Reports.jsx'))
const Settings = lazy(() => import('./pages/app/Settings.jsx'))

const ROUTED_DIALOGS = { signIn: '/signin', signUp: '/signup', pricing: '/pricing' }

/** Navigation shared by the marketing pages, which take callbacks rather than links. */
function useSiteNav() {
  const navigate = useNavigate()
  const [dialogKey, setDialogKey] = useState(null)

  const go = (path) => {
    navigate(path)
    window.scrollTo({ top: 0 })
  }
  const openDemo = (mode) => go(mode === 'sample' ? '/demo' : '/signup')
  const openDialog = (key) => (ROUTED_DIALOGS[key] ? go(ROUTED_DIALOGS[key]) : setDialogKey(key))
  const dialog = <InfoDialog dialogKey={dialogKey} onClose={() => setDialogKey(null)} onOpenDemo={openDemo} />

  return { openDemo, openDialog, openPage: (page) => go(`/${page}`), exit: () => go('/'), dialog }
}

function Landing() {
  const { openDemo, openDialog, openPage, dialog } = useSiteNav()

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-800 shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar onOpenDialog={openDialog} onOpenPage={openPage} />
      <main id="main">
        <Hero onOpenDemo={openDemo} />
        <StorySection onOpenDemo={openDemo} />
        <Features onOpenDemo={openDemo} />
        <Audience />
        <Personas />
        <Faq />
        <Newsletter />
      </main>
      <Footer onOpenDialog={openDialog} onOpenDemo={openDemo} onOpenPage={openPage} />
      {dialog}
    </>
  )
}

function Company() {
  const { openDemo, exit } = useSiteNav()
  return <CompanyPage onExit={exit} onOpenDemo={openDemo} />
}

function Customer() {
  const { openDemo, exit } = useSiteNav()
  return <CustomerPage onExit={exit} onOpenDemo={openDemo} />
}

function Tariffs() {
  const { exit } = useSiteNav()
  return <TariffPage onExit={exit} />
}

function Trial() {
  const { openDemo, openDialog, exit, dialog } = useSiteNav()
  return (
    <>
      <SignupPage onExit={exit} onOpenDemo={openDemo} onOpenDialog={openDialog} />
      {dialog}
    </>
  )
}

function QuickEstimate() {
  const navigate = useNavigate()
  return <DemoWorkspace initialMode="sample" onExit={() => navigate('/')} />
}

function NotFound() {
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <WorkspaceProvider>
      <ErrorBoundary>
        <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/company" element={<Company />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/tariffs" element={<Tariffs />} />
            <Route path="/trial" element={<Trial />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/demo" element={<DemoPicker />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/quick-estimate" element={<QuickEstimate />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Overview />} />
              <Route path="map" element={<MapPage />} />
              <Route path="shipments" element={<Shipments />} />
              <Route path="simulator" element={<Simulator />} />
              <Route path="canadian" element={<CanadianAlternatives />} />
              <Route path="global" element={<GlobalAlternatives />} />
              <Route path="sustainability" element={<Sustainability />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </WorkspaceProvider>
  )
}
