import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_SCENARIO,
  DEFAULT_STRATEGY,
  EMPTY_ANSWERS,
  SAMPLE_COMPANY,
  SAMPLE_SCENARIO,
} from '../../data/demoData.js'
import { assessProfile, computeStrategies, resolveInputs } from '../../utils/calculations.js'
import { isQuestionnaireComplete } from '../../utils/validation.js'
import { Badge, Button, Icon, Logo } from '../ui.jsx'
import ProfileStep from './ProfileStep.jsx'
import Questionnaire from './Questionnaire.jsx'
import ReportStep from './ReportStep.jsx'
import ScenarioStep from './ScenarioStep.jsx'
import StrategyStep from './StrategyStep.jsx'

const STEPS = ['Questionnaire', 'Company profile', 'Scenario', 'Compare responses', 'Report']

/*
  The whole demo session lives in this component's state (memory only).
  Nothing is persisted or sent anywhere; "Reset demo" restores the start state.
*/
export default function DemoWorkspace({ initialMode, onExit }) {
  const startSample = initialMode === 'sample'
  const [answers, setAnswers] = useState(startSample ? SAMPLE_COMPANY.answers : EMPTY_ANSWERS)
  const [isSample, setIsSample] = useState(startSample)
  const [step, setStep] = useState(0)
  const [qStep, setQStep] = useState(0)
  const [scenario, setScenario] = useState(startSample ? SAMPLE_SCENARIO : DEFAULT_SCENARIO)
  const [strategy, setStrategy] = useState(DEFAULT_STRATEGY)
  const headingRef = useRef(null)
  const firstRender = useRef(true)

  const complete = isQuestionnaireComplete(answers)

  // Every view derives from the same inputs, so profile, scenario,
  // comparison and report always agree.
  const model = useMemo(() => {
    if (!complete) return null
    const resolved = resolveInputs(answers)
    const profile = assessProfile(answers, resolved)
    const comparison = computeStrategies(answers, resolved, scenario, strategy)
    return { resolved, profile, ...comparison }
  }, [answers, scenario, strategy, complete])

  // Move focus to the new step's heading for keyboard and screen-reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [step, qStep])

  const updateAnswers = (patch) => {
    setAnswers((a) => ({ ...a, ...patch }))
    setIsSample(false)
  }

  const loadSample = () => {
    setAnswers(SAMPLE_COMPANY.answers)
    setScenario(SAMPLE_SCENARIO)
    setStrategy(DEFAULT_STRATEGY)
    setIsSample(true)
  }

  const resetAll = () => {
    setAnswers(EMPTY_ANSWERS)
    setScenario(DEFAULT_SCENARIO)
    setStrategy(DEFAULT_STRATEGY)
    setIsSample(false)
    setQStep(0)
    setStep(0)
  }

  const resetScenario = () => {
    setScenario(isSample ? SAMPLE_SCENARIO : DEFAULT_SCENARIO)
    setStrategy(DEFAULT_STRATEGY)
  }

  const go = (i) => {
    if (i === 0 || complete) setStep(i)
  }

  const shared = {
    answers,
    model,
    scenario,
    setScenario,
    strategy,
    setStrategy,
    resetScenario,
    isSample,
    headingRef,
    onBack: () => go(step - 1),
    onNext: () => go(step + 1),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={onExit} className="rounded-lg" aria-label="Back to Waymark home page">
              <Logo />
            </button>
            <Badge tone="slate" className="hidden sm:inline-flex">
              Interactive demo
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={resetAll} aria-label="Reset demo and clear all inputs">
              <Icon name="refresh" className="h-4 w-4" /> <span className="hidden sm:inline">Reset demo</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={onExit}>
              <Icon name="arrowLeft" className="h-4 w-4" /> <span className="hidden sm:inline">Back to site</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
        <nav aria-label="Demo steps" className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3 sm:px-6">
          <ol className="flex min-w-max gap-1.5">
            {STEPS.map((label, i) => {
              const active = i === step
              const reachable = i === 0 || complete
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    disabled={!reachable}
                    aria-current={active ? 'step' : undefined}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-700 text-white'
                        : reachable
                          ? 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-800'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        active ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {label}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </header>

      {isSample && (
        <div className="border-b border-amber-200 bg-amber-50 print:hidden">
          <p className="mx-auto max-w-6xl px-4 py-2 text-sm text-amber-900 sm:px-6">
            <strong>{SAMPLE_COMPANY.name}</strong> · {SAMPLE_COMPANY.tagline}. All figures are illustrative.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {step === 0 && (
          <Questionnaire
            answers={answers}
            onChange={updateAnswers}
            qStep={qStep}
            setQStep={setQStep}
            onLoadSample={loadSample}
            onReset={resetAll}
            onComplete={() => setStep(1)}
            headingRef={headingRef}
            isSample={isSample}
          />
        )}
        {step === 1 && model && <ProfileStep {...shared} onEdit={() => (setQStep(0), setStep(0))} />}
        {step === 2 && model && <ScenarioStep {...shared} />}
        {step === 3 && model && <StrategyStep {...shared} />}
        {step === 4 && model && <ReportStep {...shared} />}
      </main>
    </div>
  )
}

/** Shared heading + Back/Next footer used by steps 2–5. */
export function StepHeading({ headingRef, kicker, title, children }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-semibold text-brand-700">{kicker}</p>
      <h1 ref={headingRef} tabIndex={-1} className="focus:outline-none mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {children && <p className="mt-2 max-w-3xl text-slate-600">{children}</p>}
    </div>
  )
}

export function StepNav({ onBack, onNext, nextLabel = 'Next', extra }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <Button variant="secondary" onClick={onBack}>
        <Icon name="arrowLeft" className="h-4 w-4" /> Back
      </Button>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {extra}
        {onNext && (
          <Button onClick={onNext}>
            {nextLabel} <Icon name="arrowRight" className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function Panel({ title, children, className = '', aside }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print-avoid-break ${className}`}>
      {(title || aside) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-bold text-slate-900">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}
