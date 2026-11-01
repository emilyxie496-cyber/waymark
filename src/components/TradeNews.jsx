import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cinematicEnabled } from '../config/motion.js'
import { PRODUCT_CATEGORIES, labelOf } from '../data/demoData.js'
import { NEWS_SOURCES, fetchTradeNews } from '../utils/newsApi.js'
import { GENERAL_CONSIDERATIONS, planningConsiderations, rankArticles } from '../utils/tradeNews.js'
import NewsArt from './trade-visuals/NewsArt.jsx'
import { Badge, Icon } from './ui.jsx'

const dateFmt = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit' })

/*
  Related trade news (GDELT) + rule-based planning considerations.
  Context only: never changes the tariff calculator and is not an official tariff-rate source.
  Starts loading when the page opens (results are cached for 30 min), so headlines are
  usually ready by the time someone scrolls to this section.
*/
export default function TradeNews() {
  const forceRef = useRef(false)
  const resultsRef = useRef(null)
  const selectId = useId()
  const [category, setCategory] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState({ status: 'idle', articles: [], source: null, fetchedAt: null, error: '' })

  useEffect(() => {
    let cancelled = false
    const force = forceRef.current
    forceRef.current = false
    setState((s) => ({ ...s, status: 'loading', error: '' }))
    fetchTradeNews(category, { force })
      .then((res) => !cancelled && setState({ status: 'ready', articles: res.articles, source: res.source, fetchedAt: res.fetchedAt, error: '' }))
      .catch((err) => !cancelled && setState({ status: 'error', articles: [], source: null, fetchedAt: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [category, reloadKey])

  const ranked = useMemo(() => rankArticles(state.articles, { category }), [state.articles, category])
  const considerations = useMemo(() => planningConsiderations(ranked), [ranked])
  const loading = state.status === 'idle' || state.status === 'loading'
  const source = state.status === 'ready' ? NEWS_SOURCES[state.source] : null
  // Entrance motion plays once the feed reaches the viewport (content is never hidden before that)
  const animate = useSeenOnce(resultsRef)

  const refresh = () => {
    forceRef.current = true
    setReloadKey((k) => k + 1)
  }

  const shownConsiderations = considerations.length ? considerations : GENERAL_CONSIDERATIONS

  return (
    <div className="mt-6">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#ebe7f7] bg-ice/80 p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
        <div className="min-w-0">
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
            Tailor headlines to a product category
          </label>
          <select
            id={selectId}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 block h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-[0_1px_2px_rgba(46,16,101,.04)] transition-[border-color,box-shadow] duration-200 hover:border-brand-300 focus:border-brand-700 focus:ring-2 focus:ring-brand-200 focus:outline-none sm:w-96"
          >
            <option value="">All products — Canadian import &amp; trade news</option>
            {PRODUCT_CATEGORIES.filter((c) => c.value !== 'other').map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 text-sm font-semibold text-brand-700 shadow-[0_1px_2px_rgba(46,16,101,.04)] ring-1 ring-brand-200 transition-all duration-200 ring-inset hover:-translate-y-px hover:bg-brand-50 hover:shadow-md active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-500 disabled:shadow-none disabled:ring-slate-200 sm:self-auto"
        >
          <Icon name="refresh" className={`h-4 w-4 ${loading ? 'motion-safe:animate-spin' : ''}`} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Thin progress line while loading (fixed height, so nothing shifts) */}
      <div aria-hidden="true" className={`mt-3 h-0.5 rounded-full ${loading ? 'news-progress bg-brand-100' : 'bg-transparent'}`} />

      <div ref={resultsRef} aria-live="polite" aria-busy={loading} className="mt-3">
        {loading && <LoadingState />}

        {state.status === 'error' && (
          <div role="status" className="animate-fade-in rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <p className="font-semibold text-amber-900">Live trade news is temporarily unavailable.</p>
            <p className="mt-1 text-sm text-amber-800">
              {state.error}. The rest of the page works normally — you can try again in a moment.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-300 transition-colors ring-inset hover:bg-amber-100"
            >
              <Icon name="refresh" className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {state.status === 'ready' && ranked.length === 0 && (
          <div className="animate-fade-in rounded-2xl border border-[#ebe7f7] bg-ice p-4 sm:p-5">
            <p className="font-semibold text-slate-800">No closely related headlines in the past 7 days.</p>
            <p className="mt-1 text-sm text-slate-600">
              Only headlines that mention a trade topic (tariffs, shipping, suppliers, transport) are shown.
            </p>
            {category && (
              <button type="button" onClick={() => setCategory('')} className="mt-3 text-sm font-semibold text-brand-700 hover:underline">
                Show general Canadian trade news
              </button>
            )}
          </div>
        )}

        {state.status === 'ready' && ranked.length > 0 && (
          // Keyed by category + fetch time so a new result set fades in instead of jumping
          <NewsFeed key={`${category}-${state.fetchedAt}`} articles={ranked} animate={animate} />
        )}
      </div>

      {state.status !== 'idle' && state.status !== 'loading' && (
        <>
          {/* Visual link: headlines above → considerations below (decorative only) */}
          {state.status === 'ready' && ranked.length > 0 ? (
            <div aria-hidden="true" className="flex flex-col items-center py-1">
              <span className="h-6 w-px bg-gradient-to-b from-transparent to-teal/60" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal shadow-sm ring-1 ring-teal/30">
                <Icon name="arrowRight" className="h-4 w-4 rotate-90" strokeWidth={2.2} />
              </span>
              <span className="h-4 w-px bg-teal/40" />
            </div>
          ) : (
            <div className="h-6" aria-hidden="true" />
          )}

          <div className="relative overflow-hidden rounded-3xl border border-teal/20 bg-gradient-to-br from-[#f1ecff] via-[#faf8ff] to-[#f3efff] p-5 sm:p-7">
            <Icon
              name="compass"
              strokeWidth={1}
              className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 text-teal opacity-[0.07]"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm ring-1 ring-teal/25">
                  <Icon name="compass" className="h-5 w-5" />
                </span>
                <h4 className="font-display text-lg font-bold text-navy">Suggested Planning Considerations</h4>
              </div>
              <Badge tone="slate" className="bg-white/80">
                Rule-based · for further assessment
              </Badge>
            </div>

            <ul key={shownConsiderations.map((c) => c.id).join('|')} className="relative mt-5 grid gap-3">
              {shownConsiderations.map((c, i) => {
                const style = TOPIC_STYLE[c.id] ?? TOPIC_STYLE.tariff
                return (
                  <li
                    key={c.id}
                    className={animate ? 'animate-fade-up' : ''}
                    style={animate ? { animationDelay: `${120 + i * 80}ms` } : undefined}
                  >
                    <div className="relative flex items-start gap-4 overflow-hidden rounded-2xl bg-white p-4 pl-5 shadow-[0_1px_2px_rgba(46,16,101,.04),0_10px_24px_-18px_rgba(46,16,101,.25)] ring-1 ring-[#ebe7f7] sm:p-5 sm:pl-6">
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 w-1 ${style.bar} ${animate ? 'accent-grow' : ''}`}
                        style={animate ? { '--accent-delay': `${200 + i * 80}ms` } : undefined}
                      />
                      <span className={`mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:inline-flex ${style.tile}`}>
                        <Icon name={c.icon} className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="leading-snug font-semibold text-navy sm:text-[1.05rem]">{c.text}</p>
                        {c.count ? (
                          <p className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset sm:rounded-full ${style.chip}`}>
                            <Icon name="newspaper" className="h-3.5 w-3.5" />
                            Prompted by {c.count} {c.label.toLowerCase()} headline{c.count === 1 ? '' : 's'} above
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <p className="relative mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-600">
              <Icon name="info" className="mt-px h-4 w-4 shrink-0 text-teal-700" />
              <span>
                {considerations.length
                  ? 'Generated from keywords in the headlines above. These are prompts for your own assessment, not predictions or business advice — a headline does not mean your costs will change.'
                  : 'General considerations — not based on current news.'}{' '}
                The tariff calculator above stays hypothetical and is never changed by news.
              </span>
            </p>
          </div>
        </>
      )}

      <p className="mt-5 flex items-start gap-2 border-t border-[#ebe7f7] pt-4 text-xs leading-relaxed text-slate-500">
        <Icon name="newspaper" className="mt-px h-4 w-4 shrink-0 text-slate-400" />
        <span>
          {source ? (
            <>
              Headlines via{' '}
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-brand-700">
                {source.name}
              </a>{' '}
              (past 7 days), matched by simple keyword rules. {source.dateNote}
            </>
          ) : (
            'Headlines come from the public GDELT news index, with Google News search as a backup (past 7 days), matched by simple keyword rules.'
          )}{' '}
          Context only — not official tariff-rate updates.
          {state.status === 'ready' && state.fetchedAt
            ? ` Updated ${timeFmt.format(state.fetchedAt)}${category ? ` · ${labelOf(PRODUCT_CATEGORIES, category)}` : ''}`.replace(/\.?$/, '.')
            : ''}
        </span>
      </p>
    </div>
  )
}

/** Accent colours per news topic — shared by article badges and the matching planning considerations. */
const TOPIC_STYLE = {
  tariff: { chip: 'bg-violet-50 text-violet-800 ring-violet-200', bar: 'bg-violet-600', tile: 'bg-violet-50 text-violet-700' },
  freight: { chip: 'bg-amber-50 text-amber-800 ring-amber-200', bar: 'bg-amber-400', tile: 'bg-amber-50 text-amber-700' },
  logistics: { chip: 'bg-indigo-50 text-indigo-800 ring-indigo-200', bar: 'bg-indigo-500', tile: 'bg-indigo-50 text-indigo-700' },
  supplier: { chip: 'bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200', bar: 'bg-fuchsia-500', tile: 'bg-fuchsia-50 text-fuchsia-700' },
  transport: { chip: 'bg-slate-100 text-slate-700 ring-slate-300', bar: 'bg-slate-500', tile: 'bg-slate-100 text-slate-700' },
}

/** True once `ref` has (nearly) reached the viewport; true immediately when motion is off. */
function useSeenOnce(ref) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (seen) return
    const el = ref.current
    if (!el || !cinematicEnabled() || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px 80px 0px' }, // start just before it scrolls in, so there's no flash
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, ref])
  return seen
}

function NewsFeed({ articles, animate }) {
  const [featured, ...rest] = articles
  const enter = (i) => (animate ? { className: 'animate-fade-up', style: { animationDelay: `${i * 70}ms` } } : {})
  return (
    <div className="grid gap-3 sm:gap-4">
      <div {...enter(0)}>
        <FeaturedCard article={featured} />
      </div>
      {rest.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {rest.map((a, i) => (
            <li key={a.id} {...enter(i + 1)}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TopicChip({ topic }) {
  const style = TOPIC_STYLE[topic.id] ?? TOPIC_STYLE.tariff
  return (
    <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.chip}`}>
      <Icon name={topic.icon} className="h-3.5 w-3.5" />
      {topic.label}
    </span>
  )
}

function ArticleMeta({ article, large = false }) {
  return (
    <span className={`flex items-center gap-2 text-slate-500 ${large ? 'text-sm' : 'text-xs'}`}>
      <span className="min-w-0 truncate font-semibold text-slate-700">{article.source}</span>
      {article.date && (
        <>
          <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
          <time dateTime={article.date.toISOString()} className="shrink-0">
            {dateFmt.format(article.date)}
          </time>
        </>
      )}
      <span
        aria-hidden="true"
        className={`ml-auto inline-flex shrink-0 items-center justify-center rounded-full bg-ice text-slate-400 ring-1 ring-[#ebe7f7] transition-all duration-300 group-hover:bg-brand-700 group-hover:text-white group-hover:ring-brand-700 ${large ? 'h-9 w-9' : 'h-7 w-7'}`}
      >
        <Icon name="arrowRight" className={`-rotate-45 ${large ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
      </span>
      <span className="sr-only">(opens original article in a new tab)</span>
    </span>
  )
}

const cardBase =
  'group relative flex h-full overflow-hidden border border-[#ebe7f7] bg-white shadow-[0_1px_2px_rgba(46,16,101,.04),0_12px_30px_-22px_rgba(46,16,101,.3)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[3px] hover:border-brand-200 hover:shadow-[0_22px_44px_-24px_rgba(46,16,101,.38)] motion-reduce:hover:translate-y-0'

function FeaturedCard({ article }) {
  const [primary] = article.topics
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className={`${cardBase} flex-col rounded-3xl md:grid md:grid-cols-[1.05fr_1fr]`}>
      {/* Decorative topic illustration — not a photo of the event */}
      <span className="relative block aspect-[16/9] overflow-hidden bg-ice md:aspect-auto md:min-h-[17rem]">
        <NewsArt
          topic={primary.id}
          className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
      </span>
      <span className="flex flex-col p-5 sm:p-7">
        <TopicChip topic={primary} />
        <span className="font-display mt-4 mb-6 block text-xl leading-snug font-bold text-balance text-navy transition-colors duration-300 group-hover:text-brand-800 sm:text-2xl">
          {article.title}
        </span>
        <span className="mt-auto block border-t border-[#ebe7f7] pt-4">
          <ArticleMeta article={article} large />
        </span>
      </span>
    </a>
  )
}

function ArticleCard({ article }) {
  const [primary] = article.topics
  const style = TOPIC_STYLE[primary.id] ?? TOPIC_STYLE.tariff
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className={`${cardBase} gap-4 rounded-2xl p-4 pl-5 sm:p-5 sm:pl-6`}>
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${style.bar} opacity-60 transition-[opacity,width] duration-300 group-hover:w-1.5 group-hover:opacity-100`}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <TopicChip topic={primary} />
        <span className="mt-2.5 mb-4 block leading-snug font-semibold text-slate-900 transition-colors duration-300 group-hover:text-brand-800">
          {article.title}
        </span>
        <span className="mt-auto block border-t border-[#ebe7f7] pt-3">
          <ArticleMeta article={article} />
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 sm:flex ${style.tile}`}
      >
        <Icon name={primary.icon} className="h-5 w-5" />
      </span>
    </a>
  )
}

function LoadingState() {
  const bar = 'block rounded bg-slate-200 motion-safe:animate-pulse'
  return (
    <div>
      <div aria-hidden="true" className="grid gap-3 sm:gap-4">
        <div className="overflow-hidden rounded-3xl border border-[#ebe7f7] bg-white md:grid md:grid-cols-[1.05fr_1fr]">
          <span className="block aspect-[16/9] bg-ice motion-safe:animate-pulse md:aspect-auto md:min-h-[17rem]" />
          <span className="block p-5 sm:p-7">
            <span className={`${bar} h-5 w-28 rounded-full`} />
            <span className={`${bar} mt-5 h-6 w-full`} />
            <span className={`${bar} mt-2 h-6 w-4/5`} />
            <span className={`${bar} mt-10 h-4 w-40 bg-slate-100`} />
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {[0, 1].map((i) => (
            <span key={i} className="block rounded-2xl border border-[#ebe7f7] bg-white p-5">
              <span className={`${bar} h-5 w-24 rounded-full`} />
              <span className={`${bar} mt-4 h-4 w-full`} />
              <span className={`${bar} mt-2 h-4 w-3/4`} />
              <span className={`${bar} mt-6 h-3 w-32 bg-slate-100`} />
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">Fetching recent trade headlines — this can take up to 15 seconds…</p>
    </div>
  )
}
