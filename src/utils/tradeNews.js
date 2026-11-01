/*
  Related trade news — transparent, rule-based helpers (no model, no training).
  - buildNewsQuery: GDELT DOC 2.0 query for trade topics, scoped to Canada or a product category
  - rankArticles: keeps headlines that mention a trade topic, scores them by keyword
    relevance, Canada/category relevance and recency
  - planningConsiderations: maps the topics found in the shown headlines to suggestions
    for further assessment (never predictions, never changes to any calculator)
  Pure functions so they can be tested without a network.
*/

export const TOPICS = [
  {
    id: 'tariff',
    label: 'Tariff-related',
    icon: 'tag',
    terms: ['tariff', 'tariffs', 'duty', 'duties', 'trade war', 'trade deal', 'trade restriction', 'trade restrictions', 'trade policy', 'customs', 'countervailing', 'anti dumping', 'antidumping', 'quota', 'quotas', 'sanction', 'sanctions', 'import tax', 'export ban', 'export controls', 'cusma', 'usmca'],
  },
  {
    id: 'freight',
    label: 'Freight-cost-related',
    icon: 'ship',
    terms: ['freight rate', 'freight rates', 'freight cost', 'freight costs', 'shipping cost', 'shipping costs', 'shipping rates', 'container rate', 'container rates', 'fuel surcharge'],
  },
  {
    id: 'logistics',
    label: 'Logistics-related',
    icon: 'ship',
    terms: ['port', 'ports', 'shipping', 'freight', 'container', 'containers', 'cargo', 'vessel', 'vessels', 'canal', 'congestion', 'logistics', 'supply chain', 'supply chains'],
  },
  {
    id: 'supplier',
    label: 'Supplier-related',
    icon: 'layers',
    terms: ['supplier', 'suppliers', 'factory', 'factories', 'production', 'manufacturing', 'manufacturer', 'manufacturers', 'shortage', 'shortages', 'plant closure', 'mine'],
  },
  {
    id: 'transport',
    label: 'Transportation-related',
    icon: 'globe',
    terms: ['rail', 'railway', 'railways', 'trucking', 'truckers', 'transportation', 'strike', 'strikes', 'lockout', 'border crossing', 'air cargo'],
  },
]

const CANADA_TERMS = ['canada', 'canadian', 'canadians', 'ottawa', 'cbsa', 'ontario', 'quebec', 'british columbia', 'alberta', 'vancouver', 'montreal', 'toronto', 'halifax', 'prince rupert']

/** News keywords per questionnaire product category (values match PRODUCT_CATEGORIES). */
export const CATEGORY_NEWS_TERMS = {
  home: ['steel', 'aluminum', 'aluminium', 'cookware', 'appliances', 'housewares', 'kitchenware'],
  electronics: ['electronics', 'semiconductor', 'semiconductors', 'chips', 'batteries', 'smartphones'],
  apparel: ['apparel', 'textile', 'textiles', 'clothing', 'garment', 'footwear'],
  industrial: ['machinery', 'steel', 'aluminum', 'auto parts', 'industrial equipment'],
  food: ['food', 'agriculture', 'agricultural', 'grocery', 'farmers', 'canola'],
  beauty: ['cosmetics', 'pharmaceutical', 'pharmaceuticals', 'personal care'],
  furniture: ['furniture', 'lumber', 'softwood', 'timber'],
  other: [],
}

const QUERY_TOPICS = ['tariff', 'tariffs', '"trade war"', '"import duties"', '"port congestion"', '"freight rates"', '"supply chain"', '"shipping disruption"']

const quote = (t) => (t.includes(' ') ? `"${t}"` : t)

/** GDELT DOC 2.0 query string. General Canadian trade news unless a category with keywords is given. */
export function buildNewsQuery(category = '') {
  const categoryTerms = CATEGORY_NEWS_TERMS[category] ?? []
  const scope = categoryTerms.length ? categoryTerms.map(quote) : ['Canada', 'Canadian']
  return `(${QUERY_TOPICS.join(' OR ')}) (${scope.join(' OR ')}) sourcelang:english`
}

// Google News ignores `when:7d` on long queries, so its query stays short (5 topics, ≤ 3 category words).
const GOOGLE_TOPICS = ['tariff', 'tariffs', '"supply chain"', 'shipping', 'freight']

/** Google News RSS search query (fallback source): trade topics, past 7 days. */
export function buildGoogleNewsQuery(category = '') {
  const categoryTerms = (CATEGORY_NEWS_TERMS[category] ?? []).slice(0, 3)
  const scope = categoryTerms.length ? `(${categoryTerms.map(quote).join(' OR ')})` : 'Canada'
  return `(${GOOGLE_TOPICS.join(' OR ')}) ${scope} when:7d`
}

const norm = (s = '') => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `
const countTerms = (text, terms) => terms.filter((t) => text.includes(` ${t} `)).length

/** GDELT spaces out punctuation ("U . S .", "anti - Muslim"); tidy whitespace only, never the wording. */
export function cleanTitle(title = '') {
  return title
    .replace(/(\d) \. (\d)/g, '$1.$2')
    .replace(/(\w) - (\w)/g, '$1-$2')
    .replace(/\s+([.,:;!?%)\]])/g, '$1')
    .replace(/([([])\s+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s|:–—-]+/, '') // stray leading separators from source titles
    .trim()
}

/** "20261027T051500Z" → Date (the time GDELT first saw the article), or null. */
export function parseSeenDate(value = '') {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value)
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : null
}

/** Topics a headline mentions, strongest first. */
export function classifyTitle(title) {
  const text = norm(title)
  const found = TOPICS.map((t) => ({ topic: t, hits: countTerms(text, t.terms) })).filter((x) => x.hits > 0)
  // A specific freight-cost headline also mentions "freight"; keep only the more specific label first.
  return found.sort((a, b) => b.hits - a.hits || TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic))
}

/**
 * Filter + rank raw GDELT articles. Returns at most `limit` items:
 * { id, title, url, source, date, topics: [{id,label,icon}], score }
 */
export function rankArticles(rawArticles = [], { category = '', now = Date.now(), limit = 5, maxAgeDays = 7 } = {}) {
  const categoryTerms = CATEGORY_NEWS_TERMS[category] ?? []
  const seen = new Set()
  const ranked = []
  for (const a of rawArticles) {
    if (!a?.url || !a?.title || !/^https?:\/\//i.test(a.url)) continue
    const title = cleanTitle(a.title)
    // Dedupe key ignores spacing/punctuation so "U.S." and "US" copies of a story match
    const key = title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seen.has(key) || seen.has(a.url)) continue
    seen.add(key)
    seen.add(a.url)

    const topics = classifyTitle(title)
    if (!topics.length) continue // must mention a trade topic in the headline itself

    const text = norm(title)
    // GDELT gives the time it indexed the article; RSS gives the publication date.
    const published = a.published ? new Date(a.published) : null
    const date = published && !Number.isNaN(published.getTime()) ? published : parseSeenDate(a.seendate)
    const ageDays = date ? (now - date.getTime()) / 86_400_000 : Infinity
    if (date && ageDays > maxAgeDays) continue // sources don't always honour the 7-day window
    const score =
      topics.reduce((s, t) => s + 2 + (t.hits - 1), 0) +
      (countTerms(text, CANADA_TERMS) ? 2 : 0) +
      (countTerms(text, categoryTerms) ? 3 : 0) +
      (ageDays <= 1 ? 2 : ageDays <= 3 ? 1 : 0)

    ranked.push({
      id: a.url,
      title,
      url: a.url,
      source: a.domain || new URL(a.url).hostname.replace(/^www\./, ''),
      date,
      topics: topics.map(({ topic }) => ({ id: topic.id, label: topic.label, icon: topic.icon })),
      score,
    })
  }
  return ranked.sort((a, b) => b.score - a.score || (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)).slice(0, limit)
}

const CONSIDERATIONS = {
  tariff: 'Consider testing a higher tariff assumption in the Scenario Lab to understand potential cost exposure.',
  freight: 'Compare your estimated landed costs under different freight-cost assumptions.',
  logistics: 'Review your inventory buffer and simulate longer delivery times.',
  supplier: 'Consider evaluating alternative sourcing arrangements and supplier concentration.',
  transport: 'Check how a rail, trucking or port-labour disruption could affect delivery times, and consider simulating a longer delay.',
}

/** One suggestion per topic found in the shown headlines, ordered by how many headlines raised it. */
export function planningConsiderations(articles = []) {
  const counts = new Map()
  for (const a of articles) for (const t of a.topics) counts.set(t.id, (counts.get(t.id) ?? 0) + 1)
  return TOPICS.filter((t) => counts.has(t.id))
    .map((t) => ({ id: t.id, icon: t.icon, label: t.label, count: counts.get(t.id), text: CONSIDERATIONS[t.id] }))
    .sort((a, b) => b.count - a.count)
}

/** Shown when no live headlines are available — clearly not based on current news. */
export const GENERAL_CONSIDERATIONS = ['tariff', 'logistics', 'supplier'].map((id) => ({
  id,
  icon: TOPICS.find((t) => t.id === id).icon,
  text: CONSIDERATIONS[id],
}))
