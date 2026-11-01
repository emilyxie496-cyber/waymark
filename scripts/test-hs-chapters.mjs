// Run: node scripts/test-hs-chapters.mjs  (checks the HS-chapter matcher against hs_code_list.txt)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { buildHsIndex, parseHsChapters, suggestHsChapters } from '../src/utils/hsChapters.js'

const text = readFileSync(fileURLToPath(new URL('../hs_code_list.txt', import.meta.url)), 'utf8')
const chapters = parseHsChapters(text)
const index = buildHsIndex(chapters)
let passed = 0
const check = (name, fn) => {
  fn()
  passed++
  console.log('  ok -', name)
}
const run = (category, description) => suggestHsChapters({ category, description }, index)
const top = (r) => r.suggestions[0]?.chapter

check('parses all 98 chapters, 2 digits each, descriptions from the file', () => {
  assert.equal(chapters.length, 98)
  assert.ok(chapters.every((c) => /^\d{2}$/.test(c.chapter) && c.description.length > 0))
  assert.match(chapters.find((c) => c.chapter === '85').description, /^Electrical machinery and equipment/)
  assert.match(chapters.find((c) => c.chapter === '25').description, /earths/)
})

check('brief example: electronics + "Electrical equipment and components" → 85 (clear)', () => {
  const r = run('electronics', 'Electrical equipment and components')
  assert.equal(r.status, 'clear')
  assert.equal(top(r), '85')
})

check('sample company: home + stainless-steel cookware → 73', () => {
  const r = run('home', 'Stainless-steel cookware and kitchen utensils')
  assert.equal(r.status, 'clear')
  assert.equal(top(r), '73')
})

check('category alone gives suggestions (furniture → 94)', () => assert.equal(top(run('furniture', '')), '94'))
check('category alone can be ambiguous (apparel → 61/62 alternatives)', () => {
  const r = run('apparel', '')
  assert.equal(r.status, 'ambiguous')
  assert.deepEqual(r.suggestions.map((s) => s.chapter).slice(0, 2), ['61', '62'])
})
check('description alone works (laptop → 84)', () => assert.equal(top(run('', 'laptop computers')), '84'))
check('description words match chapter text (frozen fish fillets → 03)', () => assert.equal(top(run('food', 'frozen fish fillets')), '03'))
check('ambiguous description returns ≤3 alternatives', () => {
  const r = run('', 'bags')
  assert.equal(r.status, 'ambiguous')
  assert.ok(r.suggestions.length >= 2 && r.suggestions.length <= 3)
})
check('nonsense with no category → none', () => assert.equal(run('', 'qwerty zzz').status, 'none'))
check('"Other" category with no description → none', () => assert.equal(run('other', '').status, 'none'))
check('nothing entered → empty', () => assert.equal(run('', '').status, 'empty'))
check('unmatched description falls back to category list', () => assert.equal(top(run('furniture', 'qwerty')), '94'))
check('never suggests reserved chapter 77 or special-provisions 98', () => {
  for (const d of ['reserved future use', 'commodities special provisions'])
    assert.ok(!run('', d).suggestions.some((s) => ['77', '98'].includes(s.chapter)))
})
check('only ever returns 2-digit chapters', () => {
  for (const [c, d] of [['electronics', 'usb cable 8544.42'], ['', '7323.93.00 cookware']])
    assert.ok(run(c, d).suggestions.every((s) => /^\d{2}$/.test(s.chapter)))
})

console.log(`\n${passed} checks passed`)
