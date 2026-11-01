import { ALT_CRITERIA } from '../../data/demoData.js'
import { Badge, Icon } from '../ui.jsx'

/*
  Explains where "Supplier B" comes from: the origin → alternative → Canada
  routes, plain-language reasons, and the weighted shortlist that picked it
  (see rankAltSuppliers in src/data/demoData.js). Rule-based, not a forecast.
*/
export default function SupplierRationale({ alt, currentLeadDays, altShare }) {
  const winner = alt.ranking[0]
  return (
    <section
      id="why-supplier-b"
      aria-labelledby="why-supplier-b-title"
      className="relative scroll-mt-36 overflow-hidden rounded-3xl border border-brand-200 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(46,16,101,.18)] sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Where does Supplier B come from?</p>
          <h2 id="why-supplier-b-title" className="mt-1 text-xl font-bold text-navy">
            Why {alt.country}, if you buy from {alt.origin} today?
          </h2>
        </div>
        <Badge tone="brand">Rule-based shortlist · illustrative</Badge>
      </div>

      <p className="relative mt-2 max-w-3xl text-sm text-slate-600">
        Moving {altShare}% of volume only helps if Supplier B doesn't share the same risks as your current supplier. Waymark
        scores candidate locations on trade access, transit time, cost and diversification. For goods from {alt.origin} shipped to
        Canada, <strong className="text-navy">{alt.country}</strong> scores highest.
      </p>

      {/* Route comparison */}
      <div className="relative mt-5 grid gap-3 rounded-2xl bg-ice p-4 ring-1 ring-mist sm:p-5">
        <RouteRow
          from={alt.origin}
          days={currentLeadDays}
          label="Today"
          tone="current"
          note="One supplier, one lane: a delay or a new tariff here hits all of your stock."
        />
        <RouteRow from={alt.country} days={alt.leadTimeDays} label="Supplier B" tone="alt" note={alt.lane} />
      </div>

      {/* Reasons */}
      <ul className="relative mt-5 grid gap-3 sm:grid-cols-2">
        {alt.reasons.map((r, i) => (
          <li
            key={r.title}
            style={{ animationDelay: `${i * 80}ms` }}
            className="flex animate-fade-up gap-3 rounded-2xl border border-mist bg-white p-4 transition-shadow duration-300 hover:shadow-[0_12px_28px_-16px_rgba(46,16,101,.3)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon name={r.icon} className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy">{r.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{r.text}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Scoring */}
      <details className="group relative mt-5 rounded-2xl border border-mist bg-white open:shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-navy hover:bg-brand-50/50 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Icon name="layers" className="h-4 w-4 text-brand-600" />
            How {alt.country} was picked: the weighted scorecard
          </span>
          <Icon name="chevronDown" className="h-4 w-4 text-slate-500 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="-mx-px overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Candidate locations for Supplier B, scored 1 to 5 per criterion</caption>
            <thead>
              <tr className="border-b border-mist text-left align-bottom text-xs text-slate-500">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Candidate
                </th>
                {ALT_CRITERIA.map((c) => (
                  <th key={c.key} scope="col" className="py-2 pr-3 font-semibold">
                    {c.label}
                    <span className="block font-normal">weight {Math.round(c.weight * 100)}%</span>
                  </th>
                ))}
                <th scope="col" className="py-2 font-semibold">
                  Score / 5
                </th>
              </tr>
            </thead>
            <tbody>
              {alt.ranking.map((c) => {
                const win = c.id === winner.id
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-mist/70 last:border-0 ${win ? 'bg-brand-50/70' : ''} ${c.excluded ? 'text-slate-400' : ''}`}
                  >
                    <th
                      scope="row"
                      className={`py-2.5 pr-3 text-left font-semibold ${win ? 'text-brand-800' : c.excluded ? '' : 'text-navy'}`}
                    >
                      {c.label}
                      {win && (
                        <span className="ml-1.5 align-middle">
                          <Badge tone="brand">Supplier B</Badge>
                        </span>
                      )}
                      {c.excluded && <span className="block text-xs font-normal">current origin, excluded</span>}
                    </th>
                    {ALT_CRITERIA.map((k) => (
                      <td key={k.key} className="py-2.5 pr-3">
                        <Dots value={c.scores[k.key]} muted={c.excluded} />
                      </td>
                    ))}
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist" aria-hidden="true">
                          <span
                            className={`block h-full rounded-full ${win ? 'bg-gradient-to-r from-brand-500 to-brand-700' : 'bg-slate-300'}`}
                            style={{ width: c.excluded ? 0 : `${(c.total / 5) * 100}%` }}
                          />
                        </span>
                        <span className={`font-bold tabular-nums ${win ? 'text-brand-700' : ''}`}>
                          {c.excluded ? '—' : c.total.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            Diversification scores 2 when a candidate is in the same region or trade bloc as your current origin (shared port,
            tariff and policy shocks) and 5 otherwise. Runner-up: {alt.runnerUp.label} ({alt.runnerUp.total.toFixed(2)}).
          </p>
        </div>
      </details>

      <p className="relative mt-4 text-xs text-slate-500">
        Scores are illustrative judgements, not market data or a supplier recommendation. Before acting, get real quotes and
        confirm that the goods would qualify under the trade agreement's rules of origin.
      </p>
    </section>
  )
}

function RouteRow({ from, days, label, tone, note }) {
  const alt = tone === 'alt'
  return (
    <div className="grid items-center gap-x-3 gap-y-1 sm:grid-cols-[7.5rem_1fr_6.5rem]">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${alt ? 'bg-brand-700 text-white shadow-md shadow-brand-700/30' : 'bg-white text-slate-500 ring-1 ring-slate-300'}`}
        >
          <Icon name="pin" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
          <p className="truncate text-sm font-bold text-navy">{from}</p>
        </div>
      </div>

      <div>
        <div className="relative">
          <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
            <line x1="4" y1="12" x2="290" y2="12" stroke={alt ? '#ddd6fe' : '#e2e8f0'} strokeWidth="4" strokeLinecap="round" />
            <line
              x1="4"
              y1="12"
              x2="290"
              y2="12"
              stroke={alt ? '#6d28d9' : '#94a3b8'}
              strokeWidth="2"
              strokeLinecap="round"
              className={alt ? 'route-flow' : ''}
              strokeDasharray={alt ? undefined : '3 6'}
            />
            <path
              d="M284 6 L294 12 L284 18"
              fill="none"
              stroke={alt ? '#6d28d9' : '#94a3b8'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap tabular-nums ring-1 ${alt ? 'bg-white text-brand-700 ring-brand-200' : 'bg-white text-slate-600 ring-slate-200'}`}
          >
            ~{days} days
          </span>
        </div>
        <p className="mt-1 text-center text-xs text-slate-500">{note}</p>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <span className="text-sm font-bold text-navy">Canada</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun/20 text-amber-700">
          <Icon name="pin" className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

function Dots({ value, muted }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-2 w-2 rounded-full ${n <= value ? (muted ? 'bg-slate-300' : 'bg-brand-600') : 'bg-mist'}`} />
      ))}
    </span>
  )
}
