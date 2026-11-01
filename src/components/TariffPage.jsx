import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { rankChapters, suggestHsCode } from '../utils/classify.js'
import { currency } from '../utils/format.js'
import {
  DESTINATIONS,
  EMPTY_ENTRY,
  ORIGINS,
  changedRecently,
  computeTotal,
  confidence,
  dutyLines,
  effectiveBeforeArrival,
  isValidRate,
} from '../utils/tariff.js'
import { isValidHsCode, normalizeHsCode } from '../utils/validation.js'
import PageHeader from './PageHeader.jsx'
import { Badge, Button, ErrorText, FieldLabel, Icon, inputBase, inputState } from './ui.jsx'

const EMPTY_INPUTS = { description: '', hsCode: '', hsAuto: false, origin: '', destination: '', arrival: '', value: '' }

const REQUIRED = {
  description: 'Describe the product: material, function, composition and intended use.',
  origin: 'Choose the country of origin.',
  destination: 'Choose the destination country.',
  arrival: 'Enter the expected arrival date.',
}

function validate(inputs) {
  const errors = {}
  for (const [field, message] of Object.entries(REQUIRED)) if (!inputs[field]) errors[field] = message
  if (!isValidHsCode(inputs.hsCode)) errors.hsCode = 'Use 2, 4 or 6–10 digits (dots allowed), or leave blank.'
  if (inputs.value !== '' && !(Number(inputs.value) >= 0)) errors.value = 'Enter a positive amount, or leave blank.'
  return errors
}

const pct = (n) => `${Number(n.toFixed(4))}%`

/** Full-page duty-exposure worksheet opened from the Tariffs tab. */
export default function TariffPage({ onExit }) {
  const [inputs, setInputs] = useState(EMPTY_INPUTS)
  const [errors, setErrors] = useState({})
  const [checked, setChecked] = useState(false)
  const [entries, setEntries] = useState({})
  const [claimPreference, setClaimPreference] = useState(false)
  const [rumors, setRumors] = useState([])
  const headingRef = useRef(null)
  const resultsRef = useRef(null)

  // Move focus to the page heading so screen readers announce the new view
  useEffect(() => headingRef.current?.focus(), [])

  const set = (field) => (e) => {
    const value = e.target.value
    setInputs((prev) => {
      const next = { ...prev, [field]: value }
      // Same rule as the questionnaire: fill the HS chapter unless the user typed their own code
      if (field === 'description' && (!prev.hsCode || prev.hsAuto)) {
        const code = suggestHsCode(value)
        Object.assign(next, { hsCode: code, hsAuto: Boolean(code) })
      }
      if (field === 'hsCode') next.hsAuto = false
      return next
    })
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest)
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(inputs)
    setErrors(errs)
    const first = ['description', 'hsCode', 'origin', 'destination', 'arrival', 'value'].find((f) => errs[f])
    if (first) return document.querySelector(`[data-field="${first}"]`)?.focus()
    setChecked(true)
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const setEntry = (id, field, value) =>
    setEntries((prev) => ({ ...prev, [id]: { ...EMPTY_ENTRY, ...prev[id], [field]: value } }))

  const lines = useMemo(() => dutyLines(inputs.destination, inputs.origin), [inputs.destination, inputs.origin])
  const ranked = useMemo(() => rankChapters(inputs.description), [inputs.description])
  const hasPreference = lines.some((l) => l.kind === 'preferential' && l.applies !== 'no')
  const usePreference = claimPreference && hasPreference
  const ratesValid = lines.every((l) => isValidRate(entries[l.id]?.rate ?? ''))
  const total = computeTotal(lines, entries, { claimPreference: usePreference, value: inputs.value })
  const conf = confidence({ hsCode: inputs.hsAuto ? '' : inputs.hsCode, unverifiedCount: total.unverified.length })
  const money = (n) => currency(n, inputs.destination === 'US' ? 'USD' : 'CAD')

  const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? value
  const scheduled = lines.filter((l) => effectiveBeforeArrival(entries[l.id]?.effective, inputs.arrival))

  return (
    <>
      <PageHeader onExit={onExit} />

      <main id="main" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Tariffs</p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-slate-900 focus:outline-none sm:text-4xl"
          >
            Check the duty exposure for a product
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-pretty text-slate-600">
            Describe the product and the shipment. Waymark lays out every duty that could apply. You enter each rate
            after checking it against an official source. Rates you have not checked stay{' '}
            <strong className="text-rose-700">UNVERIFIED</strong> and are never guessed.
          </p>

          {/* Inputs */}
          <form onSubmit={submit} noValidate className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">Shipment details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field field="description" label="Product description" error={errors.description} className="md:col-span-2"
                hint="Material, function, composition and intended use, e.g. “stainless-steel saucepans for home kitchens”.">
                {(p) => <textarea {...p} rows={3} value={inputs.description} onChange={set('description')} className={`${p.className} h-auto py-2`} />}
              </Field>
              <Field field="hsCode" label="HS/HTS code" optional error={errors.hsCode}
                hint={inputs.hsAuto ? 'Chapter auto-filled from your description. Replace it with your full code if you have one.' : '6–10 digits if you have it, e.g. 7323.93.00.'}>
                {(p) => <input {...p} inputMode="decimal" placeholder="e.g. 7323.93.00" value={inputs.hsCode} onChange={set('hsCode')} />}
              </Field>
              <Field field="value" label="Declared customs value" optional error={errors.value}
                hint={`In ${inputs.destination === 'US' ? 'USD' : 'CAD'}. Needed for a dollar estimate.`}>
                {(p) => <input {...p} type="number" min="0" step="0.01" inputMode="decimal" placeholder="e.g. 25000" value={inputs.value} onChange={set('value')} />}
              </Field>
              <Field field="origin" label="Country of origin" error={errors.origin}
                hint="Where the goods were substantially transformed, not where they shipped from.">
                {(p) => <Select {...p} options={ORIGINS} value={inputs.origin} onChange={set('origin')} />}
              </Field>
              <Field field="destination" label="Destination country" error={errors.destination}>
                {(p) => <Select {...p} options={DESTINATIONS} value={inputs.destination} onChange={set('destination')} />}
              </Field>
              <Field field="arrival" label="Expected date of arrival" error={errors.arrival}>
                {(p) => <input {...p} type="date" value={inputs.arrival} onChange={set('arrival')} />}
              </Field>
            </div>
            <Button type="submit" size="lg" className="mt-6">
              Check duty exposure <Icon name="arrowRight" className="h-4 w-4" />
            </Button>
          </form>

          {checked && Object.keys(validate(inputs)).length === 0 && (
            <div ref={resultsRef} className="mt-8 scroll-mt-20 space-y-6">
              {/* 1. Classification */}
              <Section n={1} title="Classification">
                {inputs.hsCode && !inputs.hsAuto ? (
                  <p>
                    Using your code <strong>{inputs.hsCode}</strong>.
                    {normalizeHsCode(inputs.hsCode).length < 10 && ' A full 10-digit code is needed to pin down the exact rate.'}
                  </p>
                ) : ranked[0] ? (
                  <>
                    <p>
                      Most likely: <strong>HS chapter {ranked[0].hint.chapter}</strong> — {ranked[0].hint.label}. 10-digit code:{' '}
                      <Unverified />
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      <strong>GRI 1:</strong> classification follows the terms of the headings. Your description matched{' '}
                      {ranked[0].keywords.map((k) => `“${k}”`).join(', ')}. If the product is a set or made of mixed
                      materials, <strong>GRI 3</strong> (essential character) decides.
                    </p>
                  </>
                ) : (
                  <p>
                    No chapter matched this description. Code: <Unverified /> Add detail on material and use, or enter a
                    code you already use.
                  </p>
                )}
                {ranked.length > 1 && (
                  <p className="mt-2 text-sm text-slate-600">
                    Plausible alternatives:{' '}
                    {ranked.slice(1, 3).map((r) => `chapter ${r.hint.chapter} (${r.hint.label.split(';')[0]})`).join('; ')}.
                  </p>
                )}
              </Section>

              {/* 2–3. Duty table */}
              <Section n={2} title="Duties for this code and origin"
                aside={<span className="text-sm text-slate-500">{labelOf(ORIGINS, inputs.origin)} → {labelOf(DESTINATIONS, inputs.destination)}</span>}>
                <p className="text-sm text-slate-600">
                  Open each source, find the rate for your code and origin, and enter it with the date you checked. A
                  rate without a date verified stays UNVERIFIED. Use percent of customs value; convert any per-unit rate
                  first.
                </p>
                {hasPreference && (
                  <label className="mt-4 flex items-start gap-2 text-sm text-slate-800">
                    <input type="checkbox" checked={claimPreference} onChange={(e) => setClaimPreference(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
                    I will claim the preferential rate (the goods meet the rules of origin and I hold a certification of origin).
                  </label>
                )}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <div className="hidden grid-cols-[1.3fr_7rem_1.1fr_1.3fr_9.5rem] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 lg:grid">
                    <span>Duty type</span><span>Rate (%)</span><span>Legal basis</span><span>Source URL</span><span>Date verified</span>
                  </div>
                  {lines.map((l) => (
                    <DutyRow
                      key={l.id}
                      line={l}
                      entry={{ ...EMPTY_ENTRY, ...entries[l.id] }}
                      onChange={(field, value) => setEntry(l.id, field, value)}
                      inTotal={l.applies !== 'no' && (l.kind === 'base' ? !usePreference : l.kind === 'preferential' ? usePreference : true)}
                      arrival={inputs.arrival}
                    />
                  ))}
                </div>
              </Section>

              {/* 4. Date sensitivity */}
              <Section n={3} title={`Changes effective by ${inputs.arrival}`}>
                {scheduled.length ? (
                  <ul className="space-y-1 text-sm">
                    {scheduled.map((l) => (
                      <li key={l.id}>
                        <strong>{l.type}</strong>: change effective {entries[l.id].effective} — source: {entries[l.id].source || l.source}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-600">
                    No announced changes entered. For each row, check the source for any change taking effect on or before
                    the arrival date and enter its effective date.
                  </p>
                )}
              </Section>

              {/* 5. Rumored changes */}
              <Section n={4} title="Reported proposals" aside={<Badge tone="amber">UNCONFIRMED</Badge>}>
                <p className="text-sm text-slate-600">Credible reports of proposed changes. These are never included in the total.</p>
                <ul className="mt-3 space-y-2">
                  {rumors.map((r, i) => (
                    <li key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Badge tone="amber">UNCONFIRMED</Badge>
                      <input aria-label="Proposal" placeholder="What was reported, and where" value={r.text} autoFocus
                        onChange={(e) => setRumors((rs) => rs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                        className={`${inputBase} ${inputState()} mt-0 sm:flex-1`} />
                      <input aria-label="Reported rate (%)" placeholder="Rate %" inputMode="decimal" value={r.rate}
                        onChange={(e) => setRumors((rs) => rs.map((x, j) => (j === i ? { ...x, rate: e.target.value } : x)))}
                        className={`${inputBase} ${inputState()} mt-0 sm:w-28`} />
                      <Button variant="ghost" size="sm" onClick={() => setRumors((rs) => rs.filter((_, j) => j !== i))} aria-label="Remove proposal">
                        <Icon name="close" className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => setRumors((rs) => [...rs, { text: '', rate: '' }])}>
                  Add a reported proposal
                </Button>
              </Section>

              {/* 6. Total */}
              <Section n={5} title="Effective duty">
                {!ratesValid ? (
                  <p className="text-rose-700">Fix the highlighted rates (0–1000%) to see a total.</p>
                ) : total.complete ? (
                  <>
                    <p className="text-3xl font-extrabold text-brand-700 tabular-nums">{pct(total.total)}</p>
                    <p className="mt-2 font-mono text-sm text-slate-700">
                      {total.verified.map((p) => `${pct(p.rate)} (${p.type})`).join(' + ')} = {pct(total.total)}
                    </p>
                    {total.amount !== null && (
                      <p className="mt-1 font-mono text-sm text-slate-700">
                        {money(total.customsValue)} × {pct(total.total)} = <strong>{money(total.amount)}</strong>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-extrabold text-rose-700">UNVERIFIED</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Still needed: {total.unverified.join(', ')}.
                      {total.verified.length > 0 && (
                        <span className="mt-1 block font-mono">
                          Verified so far: {total.verified.map((p) => `${pct(p.rate)} (${p.type})`).join(' + ')} = {pct(total.total)} — not a total.
                        </span>
                      )}
                    </p>
                  </>
                )}
              </Section>

              {/* Confidence + risks */}
              <div className="grid gap-6 md:grid-cols-2">
                <Section title="Confidence" aside={<Badge tone={{ high: 'emerald', medium: 'amber', low: 'rose' }[conf.level]}>{conf.level}</Badge>}>
                  <p className="text-sm text-slate-700">{conf.reason}</p>
                </Section>
                <Section title="Risks">
                  {ranked.length > 1 ? (
                    <ul className="space-y-1 text-sm text-slate-700">
                      {ranked.slice(1, 3).map((r) => (
                        <li key={r.hint.chapter}>
                          If classified in chapter {r.hint.chapter} ({r.hint.label.split(';')[0]}), every rate above changes. Cost: <Unverified />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-700">
                      No alternative chapter matched the description. Classification is still the main risk until a broker
                      confirms the 10-digit code.
                    </p>
                  )}
                </Section>
              </div>

              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900">
                Verify with a licensed customs broker before filing.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function Unverified() {
  return <span className="font-semibold text-rose-700">UNVERIFIED</span>
}

function Section({ n, title, aside, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">
          {n && <span className="mr-2 text-brand-700">{n}.</span>}
          {title}
        </h2>
        {aside}
      </div>
      <div className="text-slate-700">{children}</div>
    </section>
  )
}

/** Label + hint + error around any control; children receives the control props. */
function Field({ field, label, optional, hint, error, className = '', children }) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} optional={optional} />
      {children({
        id,
        'data-field': field,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
        className: `${inputBase} ${inputState(error)}`,
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      <ErrorText id={`${id}-err`} error={error} />
    </div>
  )
}

function Select({ options, value, className, ...rest }) {
  return (
    <select value={value} className={`${className} ${value ? '' : 'text-slate-500'}`} {...rest}>
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function DutyRow({ line, entry, onChange, inTotal, arrival }) {
  const off = line.applies === 'no'
  const rateError = !isValidRate(entry.rate)
  const cell = `${inputBase} mt-0 h-9 text-sm`
  return (
    <div className={`grid gap-3 border-b border-slate-200 p-4 last:border-b-0 lg:grid-cols-[1.3fr_7rem_1.1fr_1.3fr_9.5rem] ${off ? 'bg-slate-50/70' : ''}`}>
      <div>
        <p className={`text-sm font-semibold ${off ? 'text-slate-400' : 'text-slate-900'}`}>{line.type}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {off ? <Badge tone="slate">Does not apply</Badge> : inTotal ? <Badge>In total</Badge> : <Badge tone="slate">Not in total</Badge>}
          {changedRecently(entry.effective) && <Badge tone="amber">Changed in last 90 days</Badge>}
          {effectiveBeforeArrival(entry.effective, arrival) && <Badge tone="sky">Changes before arrival</Badge>}
        </div>
        {line.note && <p className="mt-1.5 text-xs text-slate-500">{line.note}</p>}
        {!off && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <label className="flex items-center gap-1.5">
              Effective from
              <input type="date" value={entry.effective} onChange={(e) => onChange('effective', e.target.value)} className="rounded border border-slate-300 px-1.5 py-0.5" />
            </label>
            {line.kind === 'additional' && (
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={entry.stacks} onChange={(e) => onChange('stacks', e.target.checked)} className="accent-brand-600" />
                Stacks on base rate
              </label>
            )}
          </div>
        )}
      </div>
      {off ? (
        <p className="text-sm text-slate-400 lg:col-span-4">—</p>
      ) : (
        <>
          <label className="text-xs text-slate-500 lg:text-sm">
            <span className="lg:sr-only">Rate (%)</span>
            <input value={entry.rate} onChange={(e) => onChange('rate', e.target.value.trim())} inputMode="decimal" placeholder="UNVERIFIED"
              aria-invalid={rateError} className={`${cell} ${inputState(rateError)} placeholder:font-semibold placeholder:text-rose-600`} />
          </label>
          <p className="text-sm text-slate-600"><span className="text-xs text-slate-500 lg:hidden">Legal basis: </span>{line.basis}</p>
          <label className="text-xs text-slate-500 lg:text-sm">
            <span className="lg:sr-only">Source URL</span>
            <input value={entry.source} onChange={(e) => onChange('source', e.target.value)} placeholder={line.source}
              className={`${cell} ${inputState()}`} />
            {!entry.source && (
              <a href={line.source} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-brand-700 hover:underline">
                Open official source ↗
              </a>
            )}
          </label>
          <label className="text-xs text-slate-500 lg:text-sm">
            <span className="lg:sr-only">Date verified</span>
            <input type="date" value={entry.verified} onChange={(e) => onChange('verified', e.target.value)} className={`${cell} ${inputState()}`} />
          </label>
        </>
      )}
    </div>
  )
}
