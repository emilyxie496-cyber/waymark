/*
  HS-CHAPTER suggestions (2 digits only).

  The reference list (hs_code_list.txt) only contains the 2-digit HS chapters and
  their descriptions, so this module can only ever suggest a CHAPTER — never a
  6-digit HS code or a 10-digit Canadian tariff item. A chapter is a starting
  point to confirm with a customs broker or CBSA guidance, not a classification.

  Matching is deterministic and transparent (no model, no network):
    1. normalise + tokenise the product description
    2. score each chapter by word overlap with its official description
       (rarer words count more), plus a bonus for matching two-word phrases
    3. add points for a small keyword list of everyday product words
    4. add points when the chapter fits the selected product category
  Pure functions only, so they can be tested outside the browser.
*/
import { CLASSIFICATION_HINTS } from '../data/demoData.js'

/** Parse "Chapter 85 | Electrical machinery …" lines into { chapter, description }. */
export function parseHsChapters(text) {
  const chapters = []
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*Chapter\s+(\d{2})\s*\|\s*(.*?)\s*$/)
    if (!m || !m[2]) continue
    // The source file has a few find/replace artefacts such as "eartHS"; fix the casing only.
    const description = m[2].replace(/([a-z])HS\b/g, '$1hs').replace(/,(?=\S)/g, ', ')
    chapters.push({ chapter: m[1], description, reserved: /reserved for possible future use/i.test(description) })
  }
  return chapters
}

const STOPWORDS = new Set(
  `and or of the a an for with without from into to in on by not other others thereof such like kind similar certain
  elsewhere specified included articles article parts part accessories products product whether their than its
  goods item items made use used etc any type types set sets my our your we i it this that these those very some
  only also more most new old general various misc miscellaneous`.split(/\s+/),
)

export function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Very light English stemmer: plurals only (enough for "cables" → "cable"). */
export function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y'
  if (word.length > 4 && /(sses|xes|ches|shes)$/.test(word)) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !/(ss|us|is)$/.test(word)) return word.slice(0, -1)
  return word
}

export function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
    .map(stem)
}

/*
  Everyday product words → chapter numbers. Only points at chapters; every
  description shown to the user still comes from hs_code_list.txt.
  Reuses the existing illustrative CLASSIFICATION_HINTS, plus a few more.
*/
const EXTRA_KEYWORDS = {
  '84': ['laptop', 'computer', 'printer', 'server', 'machinery', 'mechanical', 'boiler', 'turbine', 'dishwasher', 'refrigerator', 'fridge'],
  '85': ['electrical', 'electric', 'phone', 'smartphone', 'television', 'headphone', 'earbud', 'microphone', 'wire', 'semiconductor', 'chip', 'transformer', 'electronics'],
  '64': ['shoe', 'sneaker', 'boot', 'footwear', 'sandal'],
  '65': ['hat', 'cap', 'helmet', 'headgear'],
  '42': ['handbag', 'bag', 'luggage', 'wallet', 'leather', 'suitcase', 'backpack'],
  '22': ['wine', 'beer', 'juice', 'beverage', 'drink', 'spirit', 'liquor', 'vinegar'],
  '18': ['chocolate', 'cocoa'],
  '17': ['candy', 'sugar', 'confectionery'],
  '04': ['cheese', 'milk', 'yogurt', 'honey', 'egg', 'dairy', 'butter'],
  '03': ['fish', 'seafood', 'shrimp', 'salmon', 'tuna', 'lobster'],
  '02': ['meat', 'beef', 'pork', 'chicken', 'lamb'],
  '08': ['fruit', 'apple', 'banana', 'nut', 'almond', 'berry', 'citrus'],
  '07': ['vegetable', 'potato', 'onion', 'tomato', 'carrot'],
  '10': ['rice', 'wheat', 'corn', 'grain', 'barley', 'oat'],
  '19': ['pasta', 'bread', 'biscuit', 'cookie', 'cereal', 'noodle', 'pastry'],
  '21': ['sauce', 'soup', 'supplement', 'condiment'],
  '30': ['medicine', 'drug', 'vitamin', 'pharmaceutical', 'bandage'],
  '34': ['soap', 'detergent', 'candle', 'cleaner'],
  '70': ['glass', 'glassware'],
  '71': ['jewelry', 'jewellery', 'gold', 'silver', 'diamond', 'necklace', 'ring'],
  '76': ['aluminum', 'aluminium'],
  '74': ['copper'],
  '82': ['tool', 'drill', 'knife', 'scissors', 'blade', 'wrench', 'hammer'],
  '83': ['lock', 'hinge', 'padlock'],
  '87': ['car', 'auto', 'vehicle', 'bicycle', 'bike', 'truck', 'motorcycle', 'scooter'],
  '40': ['rubber', 'tyre', 'tire'],
  '44': ['wood', 'wooden', 'lumber', 'plywood', 'timber'],
  '48': ['paper', 'cardboard', 'paperboard', 'carton'],
  '49': ['book', 'printed', 'magazine', 'poster'],
  '91': ['watch', 'clock'],
  '90': ['camera', 'lens', 'optical', 'sensor', 'thermometer', 'microscope', 'medical', 'surgical'],
  '94': ['lamp', 'lighting', 'luminaire', 'bedding', 'cushion', 'pillow'],
  '57': ['carpet', 'rug'],
  '63': ['towel', 'bedsheet', 'linen', 'curtain', 'blanket', 'tablecloth'],
  '23': ['petfood', 'fodder', 'feed'],
  '31': ['fertilizer', 'fertiliser'],
  '32': ['paint', 'ink', 'dye', 'varnish', 'pigment'],
  '95': ['sport', 'sporting', 'fitness'],
}

function buildKeywordIndex() {
  const index = new Map() // stemmed keyword → Set(chapter)
  const add = (word, chapter) => {
    for (const t of tokenize(word)) {
      if (!index.has(t)) index.set(t, new Set())
      index.get(t).add(chapter)
    }
  }
  for (const h of CLASSIFICATION_HINTS) h.keywords.forEach((k) => add(k, h.chapter))
  for (const [chapter, words] of Object.entries(EXTRA_KEYWORDS)) words.forEach((w) => add(w, chapter))
  return index
}
const KEYWORD_INDEX = buildKeywordIndex()

/*
  Chapters that fit each questionnaire category, most typical first.
  Values match PRODUCT_CATEGORIES in demoData.js.
*/
export const CATEGORY_CHAPTERS = {
  home: ['73', '39', '69', '70', '76', '82'],
  electronics: ['85', '84', '90'],
  apparel: ['61', '62', '63', '64', '42'],
  industrial: ['84', '73', '85', '40', '39'],
  food: ['21', '19', '20', '22', '09', '04', '08', '16', '17', '18'],
  beauty: ['33', '34', '30'],
  furniture: ['94', '44'],
  other: [],
}
const CATEGORY_WEIGHTS = [5, 3, 2, 1]

const W = { keyword: 4, phrase: 3, categoryFit: 2 }

/** Pre-compute tokens and word rarity for a parsed chapter list. */
export function buildHsIndex(chapters) {
  const usable = chapters.filter((c) => !c.reserved && c.chapter !== '98') // 98 = national special provisions
  const docs = usable.map((c) => {
    const tokens = tokenize(c.description)
    const bigrams = new Set(tokens.slice(1).map((t, i) => `${tokens[i]} ${t}`))
    return { ...c, tokenSet: new Set(tokens), bigrams }
  })
  const df = new Map()
  for (const d of docs) for (const t of d.tokenSet) df.set(t, (df.get(t) ?? 0) + 1)
  return { chapters, docs, df, byChapter: new Map(chapters.map((c) => [c.chapter, c])) }
}

const rarity = (n) => (n <= 1 ? 3 : n <= 3 ? 2 : 1)

/**
 * Rank HS chapters for a category and/or description.
 * Returns { status: 'empty' | 'none' | 'clear' | 'ambiguous', suggestions: [{ chapter, description, score, reasons }] }
 */
export function suggestHsChapters({ category = '', description = '' }, index) {
  const tokens = [...new Set(tokenize(description))]
  const prior = CATEGORY_CHAPTERS[category] ?? []
  if (!tokens.length && !prior.length) return { status: category || description.trim() ? 'none' : 'empty', suggestions: [] }

  const allTokens = tokenize(description)
  const inputBigrams = allTokens.slice(1).map((t, i) => `${allTokens[i]} ${t}`)

  const scored = index.docs.map((d) => {
    let score = 0
    const reasons = new Set()
    for (const t of tokens) {
      if (d.tokenSet.has(t)) {
        score += rarity(index.df.get(t))
        reasons.add('description words')
      }
      if (KEYWORD_INDEX.get(t)?.has(d.chapter)) {
        score += W.keyword
        reasons.add('product keywords')
      }
    }
    for (const b of inputBigrams) if (d.bigrams.has(b)) score += W.phrase
    return { chapter: d.chapter, description: d.description, score, reasons }
  })

  // Category alone gives a ranked starting list; once the description matches something,
  // the category only acts as a tie-breaker.
  const descriptionMatched = scored.some((s) => s.score > 0)
  for (const s of scored) {
    const p = prior.indexOf(s.chapter)
    if (p === -1) continue
    s.score += descriptionMatched ? W.categoryFit : CATEGORY_WEIGHTS[Math.min(p, CATEGORY_WEIGHTS.length - 1)]
    s.reasons.add('category')
  }
  for (const s of scored) s.reasons = [...s.reasons]

  const ranked = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || a.chapter.localeCompare(b.chapter))
  const [top, second] = ranked
  if (!top || top.score < 3) return { status: 'none', suggestions: [] }

  const clear = top.score >= 4 && (!second || top.score >= second.score * 1.5 + 1)
  if (clear) return { status: 'clear', suggestions: [top] }

  const floor = Math.max(3, top.score * 0.4)
  return { status: 'ambiguous', suggestions: ranked.filter((s) => s.score >= floor).slice(0, 3) }
}
