import { useEffect, useMemo, useRef } from 'react'
import { CUSTOMER_PAGE } from '../data/content.js'
import { DEFAULT_STRATEGY, SAMPLE_COMPANY, SAMPLE_SCENARIO } from '../data/demoData.js'
import { assessProfile, computeStrategies, resolveInputs } from '../utils/calculations.js'
import { QUESTIONNAIRE_STEPS } from '../utils/validation.js'
import { DashboardPreview } from './Hero.jsx'
import PageHeader from './PageHeader.jsx'
import StrategyChart from './demo/StrategyChart.jsx'
import { Icon, Button, LevelChip } from './ui.jsx'

/** Full-page "Customer" view opened from the Customer tab. */
export default function CustomerPage({ onExit, onOpenDemo }) {
  const { hero, stats, benefits, differentiator: diff } = CUSTOMER_PAGE
  const headingRef = useRef(null)

  // Move focus to the page heading so screen readers announce the new view
  useEffect(() => headingRef.current?.focus(), [])

  // Benefit visuals use the same fictional sample company as the landing-page preview
  const sample = useMemo(() => {
    const resolved = resolveInputs(SAMPLE_COMPANY.answers)
    return {
      profile: assessProfile(SAMPLE_COMPANY.answers, resolved),
      ...computeStrategies(SAMPLE_COMPANY.answers, resolved, SAMPLE_SCENARIO, DEFAULT_STRATEGY),
    }
  }, [])

  const visuals = {
    speed: (
      <ol className="space-y-2">
        {QUESTIONNAIRE_STEPS.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white">
              <Icon name="check" className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-800">
              Step {i + 1} · {s.title}
            </span>
          </li>
        ))}
      </ol>
    ),
    cost: (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold text-slate-700">Est. extra cost / yr · freight +30% · 45-day delay</p>
        <StrategyChart strategies={sample.strategies} lowestCostId={sample.lowestCostId} compact />
      </div>
    ),
    risk: (
      <ul className="space-y-2">
        {sample.profile.indicators.slice(0, 3).map((i) => (
          <li key={i.title} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <span className="text-sm font-medium text-slate-700">{i.title}</span>
            <LevelChip level={i.level} />
          </li>
        ))}
      </ul>
    ),
  }

  return (
    <>
      <PageHeader onExit={onExit} />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden" aria-labelledby="customer-title">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[38rem] bg-[radial-gradient(60%_60%_at_70%_20%,var(--color-brand-100),transparent_70%),radial-gradient(40%_50%_at_10%_10%,#e0f2fe,transparent_70%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pt-20 lg:pb-24">
            <div>
              <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{hero.eyebrow}</p>
              <h1
                id="customer-title"
                ref={headingRef}
                tabIndex={-1}
                className="mt-4 text-4xl font-extrabold tracking-tight text-balance text-slate-900 focus:outline-none sm:text-5xl"
              >
                {hero.headline}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-slate-600">{hero.subheading}</p>
              <div className="mt-8">
                <Button size="lg" onClick={() => onOpenDemo('blank')}>
                  {hero.cta} <Icon name="arrowRight" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* Proof strip */}
        <section className="border-y border-slate-200 bg-slate-50" aria-label="Waymark at a glance">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-4xl font-extrabold tracking-tight text-brand-700 tabular-nums">{s.value}</dd>
                <dd className="mt-1 text-sm text-slate-600">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Benefits, alternating sides */}
        <section className="mx-auto max-w-6xl space-y-20 px-4 py-20 sm:px-6 lg:py-28" aria-label="Benefits">
          {benefits.map((b, i) => (
            <div key={b.key} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name={b.icon} className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-balance text-slate-900 sm:text-3xl">{b.heading}</h2>
                <p className="mt-4 text-lg leading-relaxed text-pretty text-slate-600">{b.body}</p>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
                  <Icon name="check" className="h-4 w-4" /> {b.proof}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">{visuals[b.key]}</div>
            </div>
          ))}
        </section>

        {/* Differentiator */}
        <section className="border-t border-slate-200 bg-slate-50" aria-labelledby="diff-title">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
            <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{diff.eyebrow}</p>
            <h2 id="diff-title" className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
              {diff.heading}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pretty text-slate-600">{diff.paragraph}</p>

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-[10rem_1fr_1fr] border-b border-slate-200 bg-slate-50 text-sm font-semibold sm:grid">
                <span className="p-4" />
                <span className="p-4 text-slate-500">{diff.themLabel}</span>
                <span className="p-4 text-brand-800">{diff.usLabel}</span>
              </div>
              {diff.rows.map((r) => (
                <div
                  key={r.topic}
                  className="grid gap-2 border-b border-slate-200 p-4 last:border-b-0 sm:grid-cols-[10rem_1fr_1fr] sm:gap-0 sm:p-0"
                >
                  <span className="text-sm font-semibold text-slate-900 sm:p-4">{r.topic}</span>
                  <span className="flex gap-2 text-sm text-slate-500 sm:p-4">
                    <Icon name="close" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      <span className="sr-only sm:hidden">{diff.themLabel}: </span>
                      {r.them}
                    </span>
                  </span>
                  <span className="flex gap-2 text-sm font-medium text-slate-800 sm:p-4">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span>
                      <span className="sr-only sm:hidden">{diff.usLabel}: </span>
                      {r.us}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
