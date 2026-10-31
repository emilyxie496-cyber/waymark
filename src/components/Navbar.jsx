import { useEffect, useState } from 'react'
import { NAV_LINKS } from '../data/content.js'
import { Button, Icon, Logo } from './ui.jsx'

export default function Navbar({ onOpenDialog }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Slightly more solid bar once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass =
    'relative rounded-md px-2.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-aqua after:transition-transform after:duration-300 hover:after:scale-x-100'

  const renderLink = (item, mobile = false) => {
    const cls = mobile
      ? 'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white'
      : linkClass
    const planned = item.planned && mobile && (
      <span className="rounded-full bg-sun/15 px-2 py-0.5 text-xs font-medium text-sun">Planned</span>
    )
    if (item.type === 'link') {
      return (
        <a href={item.target} className={cls} onClick={() => setOpen(false)}>
          {item.label}
        </a>
      )
    }
    return (
      <button
        type="button"
        className={cls}
        onClick={() => {
          setOpen(false)
          onOpenDialog(item.target)
        }}
      >
        {item.label}
        {planned}
      </button>
    )
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled || open ? 'border-white/10 bg-midnight/90 backdrop-blur-md' : 'border-transparent bg-midnight'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main">
        <a href="#top" className="rounded-lg" aria-label="Waymark home">
          <Logo tone="light" />
        </a>

        <ul className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((item) => (
            <li key={item.label}>{renderLink(item)}</li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          {/* Wrapper controls visibility so it doesn't fight the Button's own display class */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button variant="ghostDark" size="sm" onClick={() => onOpenDialog('signIn')}>
              Sign in
            </Button>
            <Button variant="ghostDark" size="sm" onClick={() => onOpenDialog('signUp')}>
              Sign up
            </Button>
            <Button variant="glow" size="sm" onClick={() => onOpenDialog('discovery')}>
              Discovery Call
            </Button>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="animate-fade-in border-t border-white/10 bg-midnight xl:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((item) => (
              <li key={item.label}>{renderLink(item, true)}</li>
            ))}
          </ul>
          <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 border-t border-white/10 px-4 py-3 sm:hidden">
            <Button variant="glass" size="sm" onClick={() => (setOpen(false), onOpenDialog('signIn'))}>
              Sign in
            </Button>
            <Button variant="glass" size="sm" onClick={() => (setOpen(false), onOpenDialog('signUp'))}>
              Sign up
            </Button>
            <Button variant="glow" size="sm" onClick={() => (setOpen(false), onOpenDialog('discovery'))}>
              Discovery
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
