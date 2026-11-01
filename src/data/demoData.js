/*
  Demo data & assumptions.
  EVERYTHING in this file is fictional or illustrative. Edit freely:
  - questionnaire options and the midpoints used for calculations
  - the sample company
  - scenario defaults
  - fictional strategy assumptions (alternative supplier, expedited shipping)
  - illustrative classification hints
*/

// ---------- Questionnaire options ----------

export const PRODUCT_CATEGORIES = [
  { value: 'home', label: 'Home & kitchen goods' },
  { value: 'electronics', label: 'Electronics & components' },
  { value: 'apparel', label: 'Apparel & textiles' },
  { value: 'industrial', label: 'Industrial parts & machinery' },
  { value: 'food', label: 'Food & beverage' },
  { value: 'beauty', label: 'Health & beauty' },
  { value: 'furniture', label: 'Furniture & furnishings' },
  { value: 'other', label: 'Other' },
]

export const REGIONS = [
  { value: 'china', label: 'China' },
  { value: 'vietnam', label: 'Vietnam' },
  { value: 'india', label: 'India' },
  { value: 'other-asia', label: 'Other Asia' },
  { value: 'eu', label: 'European Union' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'usa', label: 'United States' },
  { value: 'other', label: 'Other region' },
]

// `mid` = the share used in calculations (disclosed to the user as an assumption)
export const REGION_SHARES = [
  { value: 'lt50', label: 'Under 50%', mid: 0.35 },
  { value: '50-80', label: '50–80%', mid: 0.65 },
  { value: 'gt80', label: 'Over 80%', mid: 0.9 },
]

export const CONCENTRATION = [
  { value: 'single', label: 'One main supplier', hint: 'Roughly 80%+ of volume from one supplier' },
  { value: 'few', label: '2–3 key suppliers', hint: 'A small group carries most volume' },
  { value: 'diversified', label: '4 or more suppliers', hint: 'No single supplier above ~40%' },
]

// Annual amounts in CAD. `mid` is the midpoint used for calculations.
export const IMPORT_SPEND = [
  { value: 'lt250k', label: 'Under $250K', mid: 125_000 },
  { value: '250k-1m', label: '$250K – $1M', mid: 625_000 },
  { value: '1m-5m', label: '$1M – $5M', mid: 3_000_000 },
  { value: '5m-20m', label: '$5M – $20M', mid: 12_500_000 },
]

export const FREIGHT_SPEND = [
  { value: 'lt25k', label: 'Under $25K', mid: 12_500 },
  { value: '25k-100k', label: '$25K – $100K', mid: 62_500 },
  { value: '100k-500k', label: '$100K – $500K', mid: 300_000 },
  { value: '500k-2m', label: '$500K – $2M', mid: 1_250_000 },
]

export const LEAD_TIMES = [
  { value: 'lt30', label: 'Under 30 days', mid: 21 },
  { value: '30-60', label: '30–60 days', mid: 45 },
  { value: '60-90', label: '60–90 days', mid: 75 },
  { value: 'gt90', label: 'Over 90 days', mid: 105 },
]

// Optional: days of stock typically on hand. `mid: null` = unknown.
export const BUFFERS = [
  { value: 'lt15', label: 'Under 15 days', mid: 10 },
  { value: '15-30', label: '15–30 days', mid: 22 },
  { value: '30-60', label: '30–60 days', mid: 45 },
  { value: 'gt60', label: 'Over 60 days', mid: 75 },
  { value: 'unknown', label: 'Not sure', mid: null },
]

export const EMPTY_ANSWERS = {
  productCategory: '',
  productDescription: '',
  hsCode: '',
  hsCodeAuto: false, // true while hsCode holds a chapter auto-filled from the description
  hsChapter: '', // 2-digit HS chapter the user picked manually (auto suggestion is derived, not stored)
  hsChapterManual: false,
  sourcingRegion: '',
  regionShare: '',
  supplierConcentration: '',
  leadTime: '',
  inventoryBuffer: '',
  importSpend: '',
  freightSpend: '',
}

// ---------- Fictional sample company ----------

export const SAMPLE_COMPANY = {
  name: 'Maple Trail Home Goods',
  tagline: 'Fictional Ontario importer of kitchenware',
  answers: {
    productCategory: 'home',
    productDescription: 'Stainless-steel cookware and kitchen utensils',
    hsCode: '', // left blank: the HS chapter is auto-filled from the description, so it's flagged as unconfirmed
    hsCodeAuto: false,
    hsChapter: '',
    hsChapterManual: false,
    sourcingRegion: 'vietnam',
    regionShare: 'gt80',
    supplierConcentration: 'single',
    leadTime: '60-90',
    inventoryBuffer: '15-30',
    importSpend: '1m-5m',
    freightSpend: '100k-500k',
  },
}

// ---------- Scenario defaults (12-month period) ----------

export const SCENARIO_PERIOD_MONTHS = 12

export const DEFAULT_SCENARIO = {
  freightPct: 30, // hypothetical freight-cost increase, %
  delayDays: 45, // hypothetical one-off supplier delay, days
  tariffEnabled: false,
  tariffRate: 10, // explicitly hypothetical additional tariff, %
  dailyShortfallCost: 0, // user-supplied CAD per uncovered day; 0 = not costed
}

// The sample walkthrough uses a fictional shortfall-cost assumption so the
// delay can be costed. It is shown and editable in the UI.
export const SAMPLE_SCENARIO = { ...DEFAULT_SCENARIO, dailyShortfallCost: 4_000 }

export const SCENARIO_LIMITS = {
  freightPct: { min: 0, max: 100, step: 5 },
  delayDays: { min: 0, max: 120, step: 5 },
  tariffRate: { min: 0, max: 25, step: 1 },
  dailyShortfallCost: { min: 0, max: 50_000, step: 500 },
}

// ---------- Fictional strategy assumptions ----------

export const DEFAULT_STRATEGY = {
  altShare: 40, // % of primary-region volume moved to the alternative supplier
}

export const STRATEGY_ASSUMPTIONS = {
  alternative: {
    unitPricePremium: 0.08, // fictional: alternative supplier quoted 8% higher
    freightFactor: 0.6, // fictional: shorter lane costs 60% of current freight per unit
    onboardingCost: 15_000, // fictional one-time qualification, samples, audits
    qualificationWeeks: '8–12',
  },
  expedited: {
    costMultiplier: 4, // fictional: expedited/air freight ≈ 4× standard per unit
    leadTimeDays: 10,
  },
}

/*
  ---------- Where does "Supplier B" come from? ----------
  A transparent, rule-based shortlist (no ML): every candidate sourcing location
  is scored 1–5 on four criteria, weighted, and the top scorer that is NOT the
  current origin becomes Supplier B. Scores are illustrative judgements for a
  Canadian importer, not market data — edit them here.
*/
export const ALT_CRITERIA = [
  { key: 'access', label: 'Trade access to Canada', weight: 0.3 },
  { key: 'transit', label: 'Transit time to Canada', weight: 0.3 },
  { key: 'cost', label: 'Cost competitiveness', weight: 0.2 },
  { key: 'diversify', label: 'Diversification from current origin', weight: 0.2 },
]

const ASIA = ['china', 'vietnam', 'india', 'other-asia']
const NORTH_AMERICA = ['mexico', 'usa']

export const ALT_CANDIDATES = [
  {
    id: 'mexico',
    label: 'Mexico',
    leadTimeDays: 21,
    lane: 'Truck / rail via Laredo, or short-sea to Vancouver',
    scores: { access: 5, transit: 4, cost: 4 },
    accessNote: 'CUSMA: duty-free into Canada when goods meet the rules of origin',
    costNote: 'Labour and factory costs well below Canada and the US; a large export manufacturing base',
    sameBloc: NORTH_AMERICA,
  },
  {
    id: 'usa',
    label: 'United States',
    leadTimeDays: 14,
    lane: 'Cross-border truck or rail',
    scores: { access: 5, transit: 5, cost: 2 },
    accessNote: 'CUSMA: duty-free into Canada when goods meet the rules of origin',
    costNote: 'Higher unit costs than most offshore suppliers',
    sameBloc: NORTH_AMERICA,
  },
  {
    id: 'canada',
    label: 'Canada',
    leadTimeDays: 10,
    lane: 'Domestic truck — no border crossing',
    scores: { access: 5, transit: 5, cost: 1 },
    accessNote: 'Domestic: no customs, duty or border delays',
    costNote: 'Highest unit cost; smaller supplier base for many consumer goods',
    sameBloc: [],
  },
  {
    id: 'vietnam',
    label: 'Vietnam',
    leadTimeDays: 35,
    lane: 'Trans-Pacific ocean freight',
    scores: { access: 4, transit: 2, cost: 5 },
    accessNote: 'CPTPP: preferential rates into Canada',
    costNote: 'Very competitive unit costs',
    sameBloc: ASIA,
  },
  {
    id: 'india',
    label: 'India',
    leadTimeDays: 45,
    lane: 'Ocean freight via Suez or the Pacific',
    scores: { access: 2, transit: 1, cost: 5 },
    accessNote: 'No free-trade agreement with Canada in force',
    costNote: 'Very competitive unit costs',
    sameBloc: ASIA,
  },
]

const REGION_NAMES = {
  china: 'China',
  vietnam: 'Vietnam',
  india: 'India',
  'other-asia': 'Asia',
  eu: 'the EU',
  mexico: 'Mexico',
  usa: 'the United States',
  other: 'your current region',
}

/** Score every candidate for an origin region, best first. The current origin is excluded. */
export function rankAltSuppliers(region) {
  return ALT_CANDIDATES.map((c) => {
    const excluded = c.id === region
    // Same region or trade bloc as today's supplier → shares its port, tariff and policy shocks
    const diversify = excluded ? 0 : c.sameBloc.includes(region) ? 2 : 5
    const scores = { ...c.scores, diversify }
    const total = ALT_CRITERIA.reduce((sum, k) => sum + scores[k.key] * k.weight, 0)
    return { ...c, scores, total: Math.round(total * 100) / 100, excluded }
  }).sort((a, b) => Number(a.excluded) - Number(b.excluded) || b.total - a.total)
}

/** Fictional alternative supplier: the top-ranked candidate for the primary sourcing region. */
export function getAltSupplier(region) {
  const ranking = rankAltSuppliers(region)
  const best = ranking[0]
  const runnerUp = ranking[1]
  const origin = REGION_NAMES[region] ?? 'your current region'
  const reasons = [
    { icon: 'scale', title: 'Trade access', text: `${best.accessNote}.` },
    {
      icon: 'clock',
      title: 'Shorter lead time',
      text: `About ${best.leadTimeDays} days door to door (${best.lane[0].toLowerCase() + best.lane.slice(1)}), so stock can be replenished faster than from ${origin}.`,
    },
    {
      icon: 'globe',
      title: 'Spreads the risk',
      text: `A different country and lane from ${origin}, so a port closure, tariff or delay there doesn't hit both suppliers at once.`,
    },
    {
      icon: 'tag',
      title: 'Cost trade-off',
      text: `${best.costNote}. The model still charges a ${Math.round(STRATEGY_ASSUMPTIONS.alternative.unitPricePremium * 100)}% unit-price premium on shifted volume.`,
    },
  ]
  return {
    id: best.id,
    country: best.label,
    name: `Supplier B — ${best.label}`,
    leadTimeDays: best.leadTimeDays,
    lane: best.lane,
    origin,
    reasons,
    ranking,
    runnerUp,
  }
}

// ---------- Illustrative classification hints ----------
// Starting points only — NOT a classification. Chapters are HS chapter numbers.

export const CLASSIFICATION_HINTS = [
  { keywords: ['cookware', 'pot', 'pan', 'utensil', 'stainless', 'steel', 'cutlery', 'kitchen'], chapter: '73', label: 'Articles of iron or steel' },
  { keywords: ['shirt', 't-shirt', 'sweater', 'hoodie', 'knit'], chapter: '61', label: 'Knitted or crocheted apparel' },
  { keywords: ['jacket', 'coat', 'dress', 'trousers', 'woven', 'apparel', 'clothing'], chapter: '62', label: 'Apparel, not knitted' },
  { keywords: ['cable', 'charger', 'battery', 'led', 'circuit', 'electronic', 'speaker', 'adapter'], chapter: '85', label: 'Electrical machinery and equipment' },
  { keywords: ['pump', 'valve', 'bearing', 'machine', 'engine', 'compressor', 'motor', 'gear'], chapter: '84', label: 'Machinery and mechanical appliances' },
  { keywords: ['shampoo', 'cosmetic', 'lotion', 'makeup', 'skincare', 'perfume'], chapter: '33', label: 'Essential oils, cosmetics and toiletries' },
  { keywords: ['furniture', 'chair', 'sofa', 'desk', 'mattress', 'shelf'], chapter: '94', label: 'Furniture and bedding' },
  { keywords: ['toy', 'game', 'puzzle', 'doll'], chapter: '95', label: 'Toys, games and sports requisites' },
  { keywords: ['plastic', 'container', 'bottle', 'bag'], chapter: '39', label: 'Plastics and articles thereof' },
  { keywords: ['ceramic', 'porcelain', 'mug', 'tile'], chapter: '69', label: 'Ceramic products' },
  { keywords: ['coffee', 'tea', 'spice'], chapter: '09', label: 'Coffee, tea and spices' },
]

// ---------- Helpers ----------

export function findOption(options, value) {
  return options.find((o) => o.value === value) ?? null
}

export function labelOf(options, value, fallback = '—') {
  return findOption(options, value)?.label ?? fallback
}
