import { Component, Suspense, lazy } from 'react'
import { useCinematic } from '../../hooks/useMotion.js'

// Code-split: d3-geo + map data load after the page renders.
const TradeGlobe = lazy(() => import('./TradeGlobe.jsx'))

/** Static, dependency-free globe used while loading or if the canvas globe fails. */
export function StaticGlobe() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#8b6cf0,#5b2fc4_55%,#2a0f6b)] shadow-[0_0_80px_10px_rgba(124,58,237,0.22)]" />
      <svg viewBox="0 0 100 100" className="absolute inset-[8%] h-[84%] w-[84%] opacity-50">
        <ellipse cx="50" cy="50" rx="49" ry="49" fill="none" stroke="rgba(245,250,252,.15)" />
        <ellipse cx="50" cy="50" rx="22" ry="49" fill="none" stroke="rgba(245,250,252,.1)" />
        <line x1="1" y1="50" x2="99" y2="50" stroke="rgba(245,250,252,.1)" />
        <path d="M18 40 Q50 18 82 38" fill="none" stroke="#c4b5fd" strokeWidth=".8" />
        <path d="M22 62 Q50 44 78 58" fill="none" stroke="#f5b94a" strokeWidth=".7" strokeDasharray="2 2" />
      </svg>
    </div>
  )
}

class GlobeErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <StaticGlobe /> : this.props.children
  }
}

/** The hero globe with safe fallbacks: the page works even if this fails to load. */
export default function GlobeStage({ className = '' }) {
  const animate = useCinematic()
  return (
    <div className={`relative ${className}`}>
      <GlobeErrorBoundary>
        <Suspense fallback={<StaticGlobe />}>
          <TradeGlobe animate={animate} />
        </Suspense>
      </GlobeErrorBoundary>
    </div>
  )
}
