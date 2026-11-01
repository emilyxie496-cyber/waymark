import { useEffect, useRef } from 'react'
import { COMPANY_STORY } from '../data/content.js'
import PageHeader from './PageHeader.jsx'
import { Button, Icon } from './ui.jsx'

/** Full-page "Our Story" view opened from the Company links. */
export default function CompanyPage({ onExit, onOpenDemo }) {
  const { hero, mission, vision } = COMPANY_STORY
  const headingRef = useRef(null)

  // Move focus to the page heading so screen readers announce the new view
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <>
      <PageHeader onExit={onExit} />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden" aria-labelledby="story-title">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[38rem] bg-[radial-gradient(60%_60%_at_70%_20%,var(--color-brand-100),transparent_70%),radial-gradient(40%_50%_at_10%_10%,#e0f2fe,transparent_70%)]"
          />
          <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
            <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{hero.eyebrow}</p>
            <h1
              id="story-title"
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 text-4xl font-extrabold tracking-tight text-balance text-slate-900 focus:outline-none sm:text-5xl lg:text-6xl"
            >
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600 sm:text-xl">
              {hero.subheading}
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">{hero.scope}</p>
          </div>
        </section>

        {/* Mission */}
        <section className="border-y border-slate-200 bg-slate-50" aria-label="Mission">
          <figure className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
            <blockquote className="text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl lg:text-5xl">
              “{mission.quote}”
            </blockquote>
            <figcaption className="mt-8 text-lg font-semibold text-brand-700">{mission.closing}</figcaption>
          </figure>
        </section>

        {/* Vision */}
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28" aria-labelledby="vision-title">
          <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{vision.eyebrow}</p>
          <h2 id="vision-title" className="mt-3 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
            {vision.heading}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-pretty text-slate-600">{vision.paragraph}</p>
          <p className="mt-8 border-l-4 border-brand-600 pl-5 text-xl font-semibold text-pretty text-slate-900">
            {vision.punchline}
          </p>
          <div className="mt-12">
            <Button size="lg" onClick={() => onOpenDemo('sample')}>
              See it with a sample company <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
