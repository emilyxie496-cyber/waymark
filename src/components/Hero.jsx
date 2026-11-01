import { useMemo } from 'react'
import { DEFAULT_STRATEGY, SAMPLE_COMPANY, SAMPLE_SCENARIO } from '../data/demoData.js'
import { assessProfile, computeStrategies, resolveInputs } from '../utils/calculations.js'
import { moneyCompact } from '../utils/format.js'
import StrategyChart from './demo/StrategyChart.jsx'
import { Badge, Button, Icon, LevelChip } from './ui.jsx'

export default function Hero({ onOpenDemo }) {
  return (
    <section id="top" className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Subtle decorative gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[38rem] bg-[radial-gradient(60%_60%_at_70%_20%,var(--color-brand-100),transparent_70%),radial-gradient(40%_50%_at_10%_10%,#e0f2fe,transparent_70%)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pt-20 lg:pb-28">
        <div>
          <Badge className="py-1">
            <Icon name="sparkles" className="h-3.5 w-3.5" /> AI-assisted trade planning for SMEs
          </Badge>
          <h1
            id="hero-title"
            className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          >
            Plan. <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">Pivot.</span>{' '}
            Progress.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-slate-600 sm:text-xl">
            Understand your supply-chain exposure, explore tariff and freight-cost scenarios, and compare practical
            responses—all starting with a short business questionnaire.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => onOpenDemo('blank')}>
              Get started for free <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onOpenDemo('sample')}>
              Get a Demo
            </Button>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Lower-data onboarding: approximate ranges first, no CSV upload to get started.
          </p>
        </div>
        <DashboardPreview />
      </div>
    </section>
  )
}

/** Polished preview built from the same calculations as the demo, using the fictional sample company. */
export function DashboardPreview() {
  const data = useMemo(() => {
    const resolved = resolveInputs(SAMPLE_COMPANY.answers)
    const profile = assessProfile(SAMPLE_COMPANY.answers, resolved)
    const result = computeStrategies(SAMPLE_COMPANY.answers, resolved, SAMPLE_SCENARIO, DEFAULT_STRATEGY)
    return { profile, ...result }
  }, [])

  const reviewCount = data.profile.indicators.filter((i) => i.level === 'review').length

  return (
    <figure
      className="relative rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-2xl shadow-brand-900/10 ring-1 ring-slate-900/5"
      aria-label="Illustrative dashboard preview for a fictional sample company"
    >
      <div className="rounded-xl bg-slate-50/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </span>
            <span className="text-sm font-semibold text-slate-800">{SAMPLE_COMPANY.name}</span>
          </div>
          <Badge tone="amber">Fictional sample</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <Kpi label="Baseline landed cost / yr" value={moneyCompact(data.scenario.baseline)} />
          <Kpi
            label="Scenario impact / yr"
            value={`+${moneyCompact(data.scenario.total)}`}
            accent
          />
          <Kpi label="Indicators to review" value={reviewCount} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-700">Responses compared</p>
            <p className="mb-3 text-[11px] text-slate-500">Freight +30% · 45-day delay · est. extra cost / yr</p>
            <StrategyChart strategies={data.strategies} lowestCostId={data.lowestCostId} compact />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-700">Preliminary indicators</p>
            <ul className="mt-2 space-y-2">
              {data.profile.indicators.slice(0, 3).map((i) => (
                <li key={i.title} className="flex items-start justify-between gap-2 text-[11px] leading-snug text-slate-600">
                  <span>{i.title}</span>
                  <LevelChip level={i.level} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <figcaption className="px-2 pt-2 pb-1 text-center text-[11px] text-slate-500">
        Illustrative data for a fictional company · preliminary estimates, not a forecast
      </figcaption>
    </figure>
  )
}

function Kpi({ label, value, accent = false }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
      <p className="text-[10px] leading-tight font-medium text-slate-500 sm:text-[11px]">{label}</p>
      <p className={`mt-1 text-base font-bold tabular-nums sm:text-xl ${accent ? 'text-brand-700' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}
