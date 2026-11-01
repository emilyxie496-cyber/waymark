import { Button, Icon, Logo } from './ui.jsx'

/** Top bar for full-page views (Company, Customer): logo + "Back to site". */
export default function PageHeader({ onExit }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <button type="button" onClick={onExit} className="rounded-lg" aria-label="Back to Waymark home page">
          <Logo />
        </button>
        <Button variant="secondary" size="sm" onClick={onExit}>
          <Icon name="arrowLeft" className="h-4 w-4" /> Back to site
        </Button>
      </div>
    </header>
  )
}
