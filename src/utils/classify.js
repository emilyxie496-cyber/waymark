// Illustrative keyword lookup for a product-classification STARTING POINT.
// This is not a classification and must be verified (e.g. with a licensed
// customs broker or official CBSA guidance) before any business use.
import { HS_CHAPTERS } from '../data/hsChapters.js'
import { isValidHsCode, normalizeHsCode } from './validation.js'

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// One whole-word pattern per keyword, allowing a simple plural ("pan" → "pans").
const PATTERNS = HS_CHAPTERS.flatMap((h) =>
  h.keywords.map((k) => ({ hint: h, re: new RegExp(`\\b${escape(k)}(?:s|es)?\\b`, 'g') })),
)

/**
 * HS chapters matching a description, best first: [{ hint, score, keywords }].
 * Longer phrases claim their words first ("olive oil" beats "oil"), the chapter
 * with the most matches wins, and ties go to the later chapter, which tends to
 * be the finished article rather than its material ("cotton" 52 vs "t-shirt" 61).
 */
export function rankChapters(description) {
  const text = description.toLowerCase()
  const found = PATTERNS.flatMap(({ hint, re }) =>
    [...text.matchAll(re)].map((m) => ({ hint, word: m[0], start: m.index, end: m.index + m[0].length })),
  ).sort((a, b) => b.end - b.start - (a.end - a.start))

  const claimed = []
  const byChapter = new Map()
  for (const m of found) {
    if (claimed.some((c) => m.start < c.end && c.start < m.end)) continue
    claimed.push(m)
    const entry = byChapter.get(m.hint) ?? { hint: m.hint, score: 0, keywords: [] }
    entry.score += 1
    entry.keywords.push(m.word)
    byChapter.set(m.hint, entry)
  }

  return [...byChapter.values()].sort((a, b) => b.score - a.score || b.hint.chapter.localeCompare(a.hint.chapter))
}

const matchChapter = (description) => rankChapters(description)[0]?.hint ?? null

export function suggestChapter(description, hsCode = '') {
  const hint = matchChapter(description)
  const userCode = hsCode && isValidHsCode(hsCode) ? normalizeHsCode(hsCode) : ''
  const userChapter = userCode ? userCode.slice(0, 2) : ''
  return {
    hint,
    userCode,
    userChapter,
    // Only meaningful when both a hint and a user code exist
    matches: Boolean(hint && userChapter && hint.chapter === userChapter),
  }
}

/** HS chapter to pre-fill the "Known HS code" field from a description ('' if none). */
export function suggestHsCode(description) {
  return matchChapter(description)?.chapter ?? ''
}
