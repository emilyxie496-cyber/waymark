/*
  Trade-news client. Two free, key-less sources:

  1. GDELT DOC 2.0 (primary) — https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
     Called directly from the browser (it sends `Access-Control-Allow-Origin: *`).
     GDELT enforces ≤ 1 request / 5 s per IP and often answers 429 for long periods;
     its 429 replies carry no CORS header, so browsers only see a network error.
  2. Google News RSS search (fallback) — reached through the small `/api/google-news`
     proxy in vite.config.js (dev + preview servers), because RSS has no CORS headers.

  Both are requested together; GDELT's result is used when it succeeds with articles,
  otherwise the RSS result. After a GDELT failure it is skipped for 10 minutes so
  visitors aren't kept waiting on a source that is currently refusing requests.

  Reliability: per-source timeouts, 30-min cache (memory + sessionStorage) per
  category, ≥ 6 s between GDELT calls, shared in-flight requests.
*/
import { buildGoogleNewsQuery, buildNewsQuery } from './tradeNews.js'

const GDELT_ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc'
const RSS_ENDPOINT = '/api/google-news'
const GDELT_TIMEOUT_MS = 15_000
const RSS_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 30 * 60 * 1000
const GDELT_MIN_GAP_MS = 6_000
const GDELT_COOLDOWN_MS = 10 * 60 * 1000
// More than we display: headlines are filtered client-side to ones that mention a trade topic.
const GDELT_MAX_RECORDS = 75

export const NEWS_SOURCES = {
  gdelt: { name: 'GDELT', url: 'https://www.gdeltproject.org/', dateNote: 'Dates show when GDELT indexed each article.' },
  google: { name: 'Google News', url: 'https://news.google.com/', dateNote: 'Dates are publication dates.' },
}

const memoryCache = new Map()
const inFlight = new Map()
let lastGdeltAt = 0

const storage = {
  get(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key) ?? 'null')
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable or full — memory cache still works
    }
  },
}

const cacheKey = (category) => `waymark:news:v2:${category || 'all'}`
const COOLDOWN_KEY = 'waymark:news:gdelt-cooldown-until'

function readCache(category) {
  const key = cacheKey(category)
  const entry = memoryCache.get(key) ?? storage.get(key)
  return entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS ? entry : null
}
function writeCache(category, entry) {
  memoryCache.set(cacheKey(category), entry)
  storage.set(cacheKey(category), entry)
}

const gdeltCoolingDown = () => Date.now() < (storage.get(COOLDOWN_KEY) ?? 0)
const startGdeltCooldown = () => storage.set(COOLDOWN_KEY, Date.now() + GDELT_COOLDOWN_MS)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`responded with ${res.status}`)
    return await res.text()
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('took too long to respond')
    // e.g. GDELT's 429 replies have no CORS header, so the browser reports a generic network error
    if (err instanceof TypeError) throw new Error('could not be reached')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function gdeltUrl(query) {
  const params = new URLSearchParams({
    query,
    mode: 'ArtList',
    format: 'json',
    maxrecords: String(GDELT_MAX_RECORDS),
    sort: 'DateDesc',
    timespan: '7d',
  })
  return `${GDELT_ENDPOINT}?${params}`
}

export function googleNewsUrl(category) {
  const params = new URLSearchParams({ q: buildGoogleNewsQuery(category), hl: 'en-CA', gl: 'CA', ceid: 'CA:en' })
  return `${RSS_ENDPOINT}?${params}`
}

async function fetchGdelt(category) {
  const wait = lastGdeltAt + GDELT_MIN_GAP_MS - Date.now()
  if (wait > 0) await sleep(wait)
  lastGdeltAt = Date.now()
  const text = await fetchWithTimeout(gdeltUrl(buildNewsQuery(category)), GDELT_TIMEOUT_MS)
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('returned an unexpected response') // rate-limit/query errors come back as plain text
  }
  return Array.isArray(data?.articles) ? data.articles : []
}

/** Parse Google News RSS into the same shape as GDELT articles: { url, title, published, domain }. */
export function parseGoogleNewsRss(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
  if (doc.querySelector('parsererror')) throw new Error('returned an unexpected response')
  return [...doc.querySelectorAll('channel > item')].map((item) => {
    const source = item.querySelector('source')?.textContent?.trim() ?? ''
    let title = item.querySelector('title')?.textContent?.trim() ?? ''
    // RSS titles end with " - Publisher" (sometimes also " | Publisher"); the publisher is shown separately
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3)).trim()
    if (source && title.endsWith(` | ${source}`)) title = title.slice(0, -(source.length + 3)).trim()
    const pub = new Date(item.querySelector('pubDate')?.textContent ?? '')
    return {
      url: item.querySelector('link')?.textContent?.trim() ?? '',
      title,
      published: Number.isNaN(pub.getTime()) ? null : pub.toISOString(),
      domain: source,
    }
  })
}

async function fetchGoogleNews(category) {
  return parseGoogleNewsRss(await fetchWithTimeout(googleNewsUrl(category), RSS_TIMEOUT_MS))
}

/**
 * Raw articles for a product category ('' = general Canadian trade news).
 * Resolves to { articles, source: 'gdelt' | 'google', fetchedAt, fromCache };
 * rejects only when both sources fail.
 */
export function fetchTradeNews(category = '', { force = false } = {}) {
  if (!force) {
    const cached = readCache(category)
    if (cached) return Promise.resolve({ ...cached, fromCache: true })
  }
  const key = category || 'all'
  if (inFlight.has(key)) return inFlight.get(key)

  const request = (async () => {
    const rss = fetchGoogleNews(category)
    rss.catch(() => {}) // handled below; avoid an unhandled rejection if GDELT wins

    let gdeltError = 'is pausing requests from this network'
    if (!gdeltCoolingDown()) {
      try {
        const articles = await fetchGdelt(category)
        if (articles.length) {
          const entry = { articles, source: 'gdelt', fetchedAt: Date.now() }
          writeCache(category, entry)
          return { ...entry, fromCache: false }
        }
        gdeltError = 'returned no articles'
      } catch (err) {
        gdeltError = err.message
        startGdeltCooldown()
      }
    }

    try {
      const articles = await rss
      const entry = { articles, source: 'google', fetchedAt: Date.now() }
      writeCache(category, entry)
      return { ...entry, fromCache: false }
    } catch (err) {
      throw new Error(`GDELT ${gdeltError}, and the backup news feed ${err.message}`)
    }
  })()

  inFlight.set(key, request)
  const clear = () => inFlight.delete(key)
  request.then(clear, clear)
  return request
}
