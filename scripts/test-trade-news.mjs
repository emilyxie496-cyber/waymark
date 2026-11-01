// Run: node scripts/test-trade-news.mjs [path/to/saved-gdelt-response.json]
// Checks the rule-based news ranking and planning considerations (no network needed).
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { buildGoogleNewsQuery, buildNewsQuery, cleanTitle, parseSeenDate, planningConsiderations, rankArticles } from '../src/utils/tradeNews.js'
import { gdeltUrl } from '../src/utils/newsApi.js'

let passed = 0
const check = (name, fn) => {
  fn()
  passed++
  console.log('  ok -', name)
}
const NOW = Date.UTC(2026, 9, 31, 12)
const art = (title, seendate = '20261030T120000Z', url = `https://example.com/${encodeURIComponent(title)}`) => ({
  url,
  title,
  seendate,
  domain: 'example.com',
})

check('general query targets Canada; category query uses category words', () => {
  assert.match(buildNewsQuery(''), /\(Canada OR Canadian\) sourcelang:english$/)
  assert.match(buildNewsQuery('electronics'), /semiconductors/)
  assert.match(buildNewsQuery('other'), /Canada/)
})

check('Google News query stays short so its 7-day filter applies', () => {
  for (const c of ['', 'electronics', 'food', 'home']) {
    const q = buildGoogleNewsQuery(c)
    assert.match(q, / when:7d$/)
    assert.ok((q.match(/ OR /g) ?? []).length <= 6, q)
  }
})

check('request URL is safely encoded with the expected parameters', () => {
  const u = new URL(gdeltUrl(buildNewsQuery('')))
  assert.equal(u.origin + u.pathname, 'https://api.gdeltproject.org/api/v2/doc/doc')
  assert.equal(u.searchParams.get('mode'), 'ArtList')
  assert.equal(u.searchParams.get('format'), 'json')
  assert.equal(u.searchParams.get('sort'), 'DateDesc')
  assert.equal(u.searchParams.get('timespan'), '7d')
  assert.equal(u.searchParams.get('query'), buildNewsQuery(''))
})

check('title cleanup only fixes GDELT spacing', () => {
  assert.equal(cleanTitle('Copper Falls 1 . 23 % as Chile Mine Strike Ends'), 'Copper Falls 1.23% as Chile Mine Strike Ends')
  assert.equal(cleanTitle('anti - dumping duties : what next ?'), 'anti-dumping duties: what next?')
})

check('seendate parses to a real date; junk gives null', () => {
  assert.equal(parseSeenDate('20261027T051500Z').toISOString(), '2026-10-27T05:15:00.000Z')
  assert.equal(parseSeenDate('nope'), null)
})

check('drops headlines without a trade topic, keeps ones with one', () => {
  const r = rankArticles([art('Celebrity wedding photos'), art('Canada raises tariffs on steel imports')], { now: NOW })
  assert.deepEqual(r.map((a) => a.title), ['Canada raises tariffs on steel imports'])
  assert.equal(r[0].topics[0].id, 'tariff')
})

check('word boundaries: "report"/"support" are not "port"', () => {
  assert.equal(rankArticles([art('New report shows support for policy')], { now: NOW }).length, 0)
})

check('topic labels: port → logistics, factory → supplier, rail strike → transport', () => {
  const r = rankArticles(
    [art('Port of Vancouver congestion worsens'), art('Factory fire halts production'), art('Rail strike looms in Canada')],
    { now: NOW },
  )
  const byTitle = Object.fromEntries(r.map((a) => [a.title, a.topics[0].id]))
  assert.equal(byTitle['Port of Vancouver congestion worsens'], 'logistics')
  assert.equal(byTitle['Factory fire halts production'], 'supplier')
  assert.equal(byTitle['Rail strike looms in Canada'], 'transport')
})

check('Canada, category and recency raise the ranking', () => {
  const r = rankArticles(
    [art('Tariffs hit European exporters', '20261025T000000Z'), art('Canada tariffs on electronics imports', '20261031T000000Z')],
    { category: 'electronics', now: NOW },
  )
  assert.equal(r[0].title, 'Canada tariffs on electronics imports')
})

check('deduplicates syndicated copies and caps at 5', () => {
  const many = Array.from({ length: 9 }, (_, i) => art(`Tariff update number ${i}`))
  many.push(art('Tariff update number 1', undefined, 'https://other.example/copy'))
  assert.equal(rankArticles(many, { now: NOW }).length, 5)
  const dup = rankArticles([art('Same tariff story'), art('Same tariff story', undefined, 'https://b.example/x')], { now: NOW })
  assert.equal(dup.length, 1)
})

check('dedupes "U.S." vs "US" copies of the same headline', () => {
  const r = rankArticles(
    [art('Canada to impose retaliatory tariffs on US steel'), art('Canada to impose retaliatory tariffs on U.S. steel', undefined, 'https://b.example/y')],
    { now: NOW },
  )
  assert.equal(r.length, 1)
})

check('drops articles older than 7 days; RSS publication dates are used when present', () => {
  const r = rankArticles(
    [
      { url: 'https://a.example/old', title: 'Old tariff story', published: '2026-09-08T12:00:00Z', domain: 'Old' },
      { url: 'https://a.example/new', title: 'New tariff story', published: '2026-10-30T12:00:00Z', domain: 'CBC' },
    ],
    { now: NOW },
  )
  assert.deepEqual(r.map((a) => a.title), ['New tariff story'])
  assert.equal(r[0].source, 'CBC')
  assert.equal(r[0].date.toISOString(), '2026-10-30T12:00:00.000Z')
})

check('ignores items without a usable http(s) URL', () => {
  assert.equal(rankArticles([{ title: 'Tariffs rise', url: 'javascript:alert(1)' }, { title: 'Tariffs rise' }], { now: NOW }).length, 0)
})

check('planning considerations follow the topics of shown headlines', () => {
  const r = rankArticles([art('Canada tariffs rise'), art('New tariff on steel'), art('Port congestion in Halifax')], { now: NOW })
  const c = planningConsiderations(r)
  assert.equal(c[0].id, 'tariff')
  assert.equal(c[0].count, 2)
  assert.match(c[0].text, /Consider testing a higher tariff assumption in the Scenario Lab/)
  assert.ok(c.some((x) => x.id === 'logistics' && /inventory buffer/.test(x.text)))
  assert.ok(!c.some((x) => x.id === 'supplier'))
})

check('no headlines → no news-derived considerations', () => assert.deepEqual(planningConsiderations([]), []))

const saved = process.argv[2]
if (saved) {
  check(`real GDELT response (${saved}) ranks to ≤5 trade headlines`, () => {
    const raw = JSON.parse(readFileSync(saved, 'utf8')).articles ?? []
    // the saved response is a snapshot, so rank it relative to its newest article
    const newest = Math.max(...raw.map((x) => parseSeenDate(x.seendate)?.getTime() ?? 0))
    const r = rankArticles(raw, { now: newest })
    assert.ok(r.length > 0 && r.length <= 5)
    for (const a of r) {
      assert.ok(a.topics.length > 0)
      console.log(`      [${a.topics[0].label}] ${a.title} — ${a.source}`)
    }
  })
}

console.log(`\n${passed} checks passed`)
