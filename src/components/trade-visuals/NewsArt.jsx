/*
  Decorative, stylised trade illustrations for news cards — original inline SVG
  (no photos, no external images, nothing to license or load). They illustrate the
  article's TOPIC only and never depict the specific event in a headline.
  Topics match TOPICS in utils/tradeNews.js.
*/
import { useId } from 'react'

const C = { ocean: '#5b21b6', teal: '#8b5cf6', aqua: '#c4b5fd', sun: '#f5b94a', navy: '#1e1538', mist: '#ece9f7', white: '#ffffff' }

export default function NewsArt({ topic = 'tariff', className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = { sky: `sky${uid}`, sea: `sea${uid}`, glow: `glow${uid}` }
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={ids.sky} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfaff" />
          <stop offset=".55" stopColor="#f3efff" />
          <stop offset="1" stopColor="#f1ecff" />
        </linearGradient>
        <linearGradient id={ids.sea} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" stopOpacity=".55" />
          <stop offset="1" stopColor="#5b21b6" stopOpacity=".35" />
        </linearGradient>
        <radialGradient id={ids.glow} cx=".78" cy=".22" r=".55">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="250" fill={`url(#${ids.sky})`} />
      <rect width="400" height="250" fill={`url(#${ids.glow})`} />
      {/* faint globe arcs + an animated trade route */}
      <g fill="none" stroke={C.ocean} strokeOpacity=".08">
        <ellipse cx="330" cy="70" rx="120" ry="120" />
        <ellipse cx="330" cy="70" rx="55" ry="120" />
        <path d="M210 70h240M222 20h216M222 120h216" />
      </g>
      <path d="M28 96 Q170 4 352 74" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" className="route-flow" strokeOpacity=".7" />
      <circle cx="28" cy="96" r="5" fill={C.white} stroke={C.teal} strokeWidth="2.5" />
      <circle cx="352" cy="74" r="5" fill={C.sun} stroke={C.white} strokeWidth="2" />

      {topic === 'logistics' && <Ship />}
      {topic === 'tariff' && <Tariff />}
      {topic === 'freight' && <Freight />}
      {topic === 'supplier' && <Supplier />}
      {topic === 'transport' && <Transport />}

      {/* water / ground line */}
      {topic === 'logistics' || topic === 'tariff' ? (
        <>
          <path d="M0 205 Q50 198 100 205 T200 205 T300 205 T400 205 V250 H0Z" fill={`url(#${ids.sea})`} />
          <path d="M0 222 Q50 216 100 222 T200 222 T300 222 T400 222" fill="none" stroke={C.white} strokeOpacity=".6" strokeWidth="1.5" />
        </>
      ) : (
        <rect y="208" width="400" height="42" fill={C.ocean} fillOpacity=".1" />
      )}
    </svg>
  )
}

function Containers({ x, y, rows, w = 26, h = 14 }) {
  return rows.map((row, r) =>
    row.map((fill, i) => <rect key={`${r}-${i}`} x={x + i * (w + 2)} y={y - r * (h + 2)} width={w} height={h} rx="1.5" fill={fill} />),
  )
}

function Ship() {
  return (
    <g>
      {/* port crane */}
      <g stroke={C.navy} strokeOpacity=".55" strokeWidth="3" fill="none">
        <path d="M330 205V112M352 205V112M322 112h96M330 132l22-20" />
        <path d="M384 112v34" strokeWidth="1.5" />
      </g>
      <rect x="378" y="146" width="14" height="9" rx="1" fill={C.sun} />
      {/* container ship */}
      <path d="M60 182h224l-18 26H82z" fill={C.navy} />
      <path d="M66 190h212" stroke={C.ocean} strokeWidth="4" />
      <rect x="244" y="146" width="26" height="36" rx="2" fill={C.white} />
      <rect x="249" y="152" width="16" height="5" rx="1" fill={C.navy} />
      <Containers
        x={78}
        y={168}
        rows={[
          [C.ocean, C.teal, C.sun, C.ocean, C.aqua, C.teal],
          [C.teal, C.ocean, C.ocean, C.sun, C.teal],
          [C.sun, C.aqua, C.ocean],
        ]}
      />
    </g>
  )
}

function Tariff() {
  return (
    <g>
      <Containers
        x={52}
        y={191}
        rows={[
          [C.ocean, C.teal, C.sun, C.ocean],
          [C.teal, C.ocean, C.aqua],
          [C.sun, C.teal],
        ]}
        w={30}
        h={16}
      />
      {/* price tag + customs stamp ring */}
      <g transform="translate(232 112) rotate(-12)">
        <path d="M0 0h86l26 32-26 32H0z" fill={C.white} stroke={C.ocean} strokeWidth="2.5" />
        <circle cx="88" cy="32" r="6" fill="none" stroke={C.ocean} strokeWidth="2.5" />
        <path d="M18 22h46M18 34h34M18 46h40" stroke={C.ocean} strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx="210" cy="176" r="24" fill="none" stroke={C.teal} strokeWidth="3" strokeDasharray="5 4" />
      <circle cx="210" cy="176" r="15" fill={C.teal} fillOpacity=".15" />
    </g>
  )
}

function Freight() {
  return (
    <g>
      <Containers x={40} y={192} rows={[[C.ocean, C.teal, C.sun, C.ocean, C.teal], [C.teal, C.ocean, C.aqua]]} w={30} h={16} />
      {/* rising cost trend */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M222 192V120M222 192h150" stroke={C.navy} strokeOpacity=".25" strokeWidth="2" />
        <path d="M232 178l30-14 26 8 30-30 34-16" stroke={C.ocean} strokeWidth="4" />
        <path d="M338 120h16v16" stroke={C.ocean} strokeWidth="4" />
      </g>
      {[[262, 164], [288, 172], [318, 142]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="4.5" fill={C.white} stroke={C.teal} strokeWidth="2.5" />
      ))}
    </g>
  )
}

function Supplier() {
  return (
    <g>
      {/* factory with sawtooth roof */}
      <path d="M70 208V150l34 18v-18l34 18v-18l34 18v-30h26v70z" fill={C.ocean} />
      <rect x="176" y="112" width="16" height="32" fill={C.navy} />
      <g fill={C.white} fillOpacity=".85">
        {[86, 116, 146].map((x) => (
          <rect key={x} x={x} y="178" width="16" height="12" rx="1.5" />
        ))}
      </g>
      {/* gear */}
      <g transform="translate(290 160)">
        <circle r="30" fill="none" stroke={C.teal} strokeWidth="12" strokeDasharray="9 6.7" />
        <circle r="24" fill={C.white} stroke={C.teal} strokeWidth="5" />
        <circle r="8" fill={C.teal} />
      </g>
      <Containers x={232} y={192} rows={[[C.sun, C.ocean]]} w={26} h={14} />
    </g>
  )
}

function Transport() {
  return (
    <g>
      {/* rail line */}
      <path d="M20 200h360" stroke={C.navy} strokeOpacity=".5" strokeWidth="3" />
      <path d="M30 206h340" stroke={C.navy} strokeOpacity=".3" strokeWidth="2" strokeDasharray="4 8" />
      {/* locomotive + wagons */}
      <path d="M44 196v-38h46l16 18v20z" fill={C.ocean} />
      <rect x="54" y="166" width="20" height="12" rx="2" fill={C.white} />
      <Containers x={112} y={178} rows={[[C.teal, C.sun, C.ocean, C.teal]]} w={34} h={18} />
      {[60, 92, 128, 162, 198, 232, 268].map((x) => (
        <circle key={x} cx={x} cy="198" r="4" fill={C.navy} />
      ))}
      {/* truck */}
      <g transform="translate(296 150)">
        <rect width="48" height="30" rx="3" fill={C.white} stroke={C.ocean} strokeWidth="2.5" />
        <path d="M48 10h16l10 12v8H48z" fill={C.ocean} />
        <circle cx="14" cy="34" r="6" fill={C.navy} />
        <circle cx="60" cy="34" r="6" fill={C.navy} />
      </g>
    </g>
  )
}
