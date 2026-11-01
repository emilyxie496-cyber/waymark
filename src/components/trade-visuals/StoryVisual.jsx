/*
  Lightweight SVG scenes for the scroll story. Pure SVG + CSS: no images,
  no 3D assets. `scene` selects what is emphasised:
  0 = ocean freight, 1 = transport network, 2 = uncertainty, 3 = business clarity.
*/
import { useId } from 'react'
import { DashboardPreview } from '../Hero.jsx'

export default function StoryVisual({ scene }) {
  // Unique SVG ids per instance (mobile + desktop copies exist at once)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = { sea: 'sea' + uid, sky: 'sky' + uid, frame: 'frame' + uid }
  return (
    <div className="relative aspect-[10/8] w-full">
      <div className={`absolute inset-0 transition-opacity duration-700 ${scene <= 2 ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <svg viewBox="0 0 600 480" className="h-full w-full drop-shadow-[0_20px_40px_rgba(46,16,101,0.18)]" aria-hidden="true">
          <defs>
            <linearGradient id={ids.sea} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5b21b6" stopOpacity=".55" />
              <stop offset="1" stopColor="#150a2e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={ids.sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e1538" stopOpacity="0" />
              <stop offset="1" stopColor="#5b21b6" stopOpacity=".25" />
            </linearGradient>
            <clipPath id={ids.frame}>
              <rect x="0" y="0" width="600" height="480" rx="28" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${ids.frame})`}>
            <rect width="600" height="480" fill="#1f0d47" />
            <rect width="600" height="300" fill={`url(#${ids.sky})`} />
            <OceanScene active={scene === 0} seaFill={`url(#${ids.sea})`} />
            <NetworkScene active={scene >= 1} disrupted={scene === 2} />
          </g>
          <rect x=".5" y=".5" width="599" height="479" rx="28" fill="none" stroke="rgba(196,181,253,.18)" />
        </svg>
      </div>
      <div className={`absolute inset-0 flex items-center transition-all duration-700 ${scene === 3 ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
        <DashboardPreview />
      </div>
    </div>
  )
}

function OceanScene({ active, seaFill }) {
  return (
    <g className={`transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}>
      {/* horizon & far coast */}
      <path d="M0 250 L600 250 L600 480 L0 480Z" fill={seaFill} />
      <path d="M430 250 q30 -22 60 -10 q25 -18 55 -4 q25 -10 55 2 V250Z" fill="#321575" />
      {/* wave bands */}
      {[290, 330, 375, 420].map((y, i) => (
        <path
          key={y}
          d={`M-60 ${y} q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`}
          fill="none"
          stroke="rgba(196,181,253,.22)"
          strokeWidth={1.2 + i * 0.3}
          className="route-flow"
          style={{ animationDuration: `${4 + i}s` }}
        />
      ))}
      {/* container ship */}
      <g className={active ? 'bob' : ''} style={{ transformOrigin: '260px 300px' }}>
        <g transform="translate(120 222)">
          <path d="M0 62 L300 62 L278 98 L22 98 Z" fill="#ece9f7" />
          <path d="M8 74 L292 74" stroke="#5b21b6" strokeWidth="5" />
          <rect x="240" y="18" width="34" height="44" rx="3" fill="#fbfaff" />
          <rect x="246" y="26" width="22" height="6" rx="1" fill="#1e1538" />
          <rect x="258" y="2" width="8" height="16" fill="#f5b94a" />
          {[
            ['#5b21b6', '#8b5cf6', '#f5b94a', '#1e1538', '#5b21b6', '#c4b5fd', '#8b5cf6'],
            ['#8b5cf6', '#1e1538', '#5b21b6', '#f5b94a', '#8b5cf6', '#5b21b6'],
            ['#f5b94a', '#5b21b6', '#c4b5fd', '#5b21b6', '#1e1538'],
          ].map((row, r) =>
            row.map((c, i) => <rect key={`${r}-${i}`} x={18 + i * 31} y={44 - r * 17} width="29" height="15" rx="1.5" fill={c} />),
          )}
        </g>
        {/* wake */}
        <path d="M100 322 q40 10 90 6 M96 332 q60 12 120 4" stroke="rgba(245,250,252,.35)" fill="none" strokeWidth="1.4" />
      </g>
    </g>
  )
}

function NetworkScene({ active, disrupted }) {
  const lane = disrupted ? '#f5b94a' : '#c4b5fd'
  return (
    <g className={`transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}>
      {/* stylised coastline */}
      <path d="M0 330 C120 300 170 360 260 330 S420 280 600 310 V480 H0Z" fill="#2a1260" />
      <path d="M0 330 C120 300 170 360 260 330 S420 280 600 310" fill="none" stroke="rgba(196,181,253,.25)" />

      {/* sea lane into port */}
      <path d="M-10 430 C80 420 140 380 200 348" fill="none" stroke={lane} strokeWidth="3" className="route-flow transition-colors duration-500" />
      {/* rail line port -> distribution */}
      <path d="M200 340 C280 300 360 300 470 250" fill="none" stroke="#fbfaff" strokeOpacity=".75" strokeWidth="2.5" strokeDasharray="10 6" className="route-flow" />
      {/* air arc airport -> distribution */}
      <path d="M90 170 Q290 40 470 236" fill="none" stroke="#f5b94a" strokeOpacity=".8" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" className="route-flow" />

      {/* alternate route appears during "uncertainty" */}
      <g className={`transition-opacity duration-700 ${disrupted ? 'opacity-100' : 'opacity-0'}`}>
        <path d="M-10 250 C110 250 220 230 330 250 S430 262 470 252" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeDasharray="8 8" className="route-flow" />
        <g transform="translate(118 395)">
          <circle r="13" fill="#f5b94a" />
          <path d="M-4 -5 V5 M4 -5 V5" stroke="#150a2e" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      <Node x={200} y={344} label="Port" />
      <Node x={90} y={170} label="Air" small />
      <Node x={330} y={300} label="Rail" small />
      <Node x={470} y={244} label="Distribution" home />
    </g>
  )
}

function Node({ x, y, label, home, small }) {
  const r = small ? 7 : 10
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 6} fill={home ? '#f5b94a' : '#c4b5fd'} className="node-pulse" />
      <circle r={r} fill={home ? '#f5b94a' : '#ece9f7'} stroke="#150a2e" strokeWidth="2" />
      <text y={-r - 10} textAnchor="middle" fill="#fbfaff" fontSize="15" fontWeight="600" fontFamily="Inter Variable, sans-serif">
        {label}
      </text>
    </g>
  )
}
