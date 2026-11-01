// Duty-exposure worksheet logic. No rates are built in: nothing here is a
// verified rate. The user enters rates they have checked against an official
// source, and anything not entered stays UNVERIFIED and is never guessed.

export const DESTINATIONS = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
]

export const ORIGINS = [
  { value: 'CN', label: 'China' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'IN', label: 'India' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'JP', label: 'Japan' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'TR', label: 'Türkiye' },
  { value: 'MX', label: 'Mexico' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'other', label: 'Other' },
]

// Free-trade agreements that can give a preferential rate, by destination → origin.
const AGREEMENTS = {
  CA: { US: 'CUSMA', MX: 'CUSMA', VN: 'CPTPP', JP: 'CPTPP', DE: 'CETA', IT: 'CETA', KR: 'CKFTA' },
  US: { CA: 'USMCA', MX: 'USMCA', KR: 'KORUS' },
}

// Official starting points (home pages, so links stay valid).
const SOURCES = {
  usHts: 'https://hts.usitc.gov/',
  cbp: 'https://www.cbp.gov/',
  ustr: 'https://ustr.gov/',
  bis: 'https://www.bis.gov/',
  usitc: 'https://www.usitc.gov/',
  ita: 'https://www.trade.gov/',
  cbsa: 'https://www.cbsa-asfc.gc.ca/',
  fin: 'https://www.canada.ca/en/department-finance.html',
}

/**
 * Duty lines to check for a destination and origin.
 * kind: 'base' (MFN) | 'preferential' | 'additional'.
 * applies: 'check' (may apply — verify) | 'no' (does not apply to this origin).
 */
export function dutyLines(destination, origin) {
  if (!destination || !origin) return []
  const agreement = AGREEMENTS[destination]?.[origin]
  const preferential = {
    id: 'pref',
    kind: 'preferential',
    type: agreement ? `Preferential rate (${agreement})` : 'Preferential rate',
    applies: agreement ? 'check' : 'no',
    note: agreement
      ? `Only if the goods meet the ${agreement} rules of origin and you hold a certification of origin. Origin is where the goods were substantially transformed, not where they shipped from.`
      : 'No free-trade agreement on file for this origin. Other preference programs may still apply — check eligibility.',
  }

  if (destination === 'US') {
    return [
      { id: 'mfn', kind: 'base', type: 'General (MFN) rate', basis: 'HTSUS, column 1 General', source: SOURCES.usHts, applies: 'check' },
      { ...preferential, basis: agreement ? `${agreement} rules of origin` : '—', source: SOURCES.cbp },
      { id: 's232', kind: 'additional', type: 'Section 232', basis: 'Trade Expansion Act of 1962, s. 232', source: SOURCES.bis, applies: 'check' },
      {
        id: 's301',
        kind: 'additional',
        type: 'Section 301',
        basis: 'Trade Act of 1974, s. 301',
        source: SOURCES.ustr,
        applies: origin === 'CN' ? 'check' : 'no',
        note: origin === 'CN' ? undefined : 'Section 301 lists apply to goods of Chinese origin.',
      },
      { id: 's201', kind: 'additional', type: 'Section 201 (safeguard)', basis: 'Trade Act of 1974, s. 201', source: SOURCES.usitc, applies: 'check' },
      { id: 'ieepa', kind: 'additional', type: 'IEEPA-based tariffs', basis: 'International Emergency Economic Powers Act orders', source: SOURCES.cbp, applies: 'check' },
      { id: 'adcvd', kind: 'additional', type: 'Antidumping / countervailing', basis: 'Tariff Act of 1930, Title VII', source: SOURCES.ita, applies: 'check' },
    ]
  }

  return [
    { id: 'mfn', kind: 'base', type: 'Most-Favoured-Nation (MFN) rate', basis: 'Customs Tariff, Schedule', source: SOURCES.cbsa, applies: 'check' },
    { ...preferential, basis: agreement ? `${agreement} rules of origin` : '—', source: SOURCES.cbsa },
    { id: 'surtax', kind: 'additional', type: 'Surtaxes (e.g. countermeasures)', basis: 'Customs Tariff surtax orders', source: SOURCES.fin, applies: 'check' },
    { id: 'sima', kind: 'additional', type: 'Anti-dumping / countervailing (SIMA)', basis: 'Special Import Measures Act', source: SOURCES.cbsa, applies: 'check' },
  ]
}

export const EMPTY_ENTRY = { rate: '', source: '', verified: '', effective: '', stacks: true }

export function isValidRate(value) {
  if (value === '') return true
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 && n <= 1000
}

const DAY = 24 * 60 * 60 * 1000
const parseDate = (s) => (s ? new Date(`${s}T00:00:00`) : null)

/** Rate changed within the last 90 days → most likely to be wrong in secondary sources. */
export function changedRecently(effective, today = new Date()) {
  const d = parseDate(effective)
  return Boolean(d && d <= today && today - d <= 90 * DAY)
}

/** Officially announced change that takes effect after today but on or before arrival. */
export function effectiveBeforeArrival(effective, arrival, today = new Date()) {
  const d = parseDate(effective)
  const a = parseDate(arrival)
  return Boolean(d && a && d > today && d <= a)
}

/**
 * Effective duty from the rates the user has verified.
 * Base = preferential rate when claimed, otherwise MFN. Additional duties are
 * added only when marked as stacking. Any applicable line without a rate and a
 * date verified makes
 * the total UNVERIFIED — it is never filled in with a guess.
 */
export function computeTotal(lines, entries, { claimPreference, value }) {
  const included = lines.filter((l) => {
    if (l.applies === 'no') return false
    if (l.kind === 'base') return !claimPreference
    if (l.kind === 'preferential') return claimPreference
    return entries[l.id]?.stacks !== false
  })
  // A rate counts only once the date it was verified is recorded
  const isVerified = (l) => (entries[l.id]?.rate ?? '') !== '' && Boolean(entries[l.id]?.verified)
  const unverified = included.filter((l) => !isVerified(l)).map((l) => l.type)
  const verified = included.filter(isVerified).map((l) => ({ id: l.id, type: l.type, rate: Number(entries[l.id].rate) }))
  const total = verified.reduce((sum, p) => sum + p.rate, 0)
  const customsValue = value === '' ? null : Number(value)
  return {
    complete: unverified.length === 0 && verified.length > 0,
    verified,
    unverified,
    total,
    amount: customsValue === null ? null : (customsValue * total) / 100,
    customsValue,
  }
}

/** Confidence and its main source of uncertainty. */
export function confidence({ hsCode, unverifiedCount }) {
  const digits = hsCode.replace(/\D/g, '').length
  if (unverifiedCount > 0) {
    return { level: 'low', reason: `${unverifiedCount} applicable rate${unverifiedCount === 1 ? ' is' : 's are'} UNVERIFIED.` }
  }
  if (digits < 10) {
    return {
      level: 'medium',
      reason: digits ? `Classification is only known to ${digits} digits, so the rate may not match the full code.` : 'No HS/HTS code given; classification is a chapter-level suggestion.',
    }
  }
  return { level: 'high', reason: 'Main remaining risk is classification — confirm the 10-digit code with a broker.' }
}
