/*
  Canvas trade globe (d3-geo orthographic projection).
  Land shapes: Natural Earth 1:110m via the `world-atlas` package (public domain
  data, ISC-licensed package) — no image or 3D-model assets are used.

  Scene (back to front): sparkles → atmosphere → far half of the satellite orbit →
  ocean sphere + shimmer → land → night-side shading → flowing sea lanes + ships
  with wakes → rail → air arcs raised above the surface with planes and contrails →
  hubs → near half of the orbit.
  This module is lazy-loaded; see GlobeStage.jsx for the fallback.
*/
import { useEffect, useRef } from 'react'
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import land110m from 'world-atlas/land-110m.json'
import { GLOBE } from '../../config/motion.js'
import { TRADE_ROUTES, HUBS } from './routes.js'

const land = feature(land110m, land110m.objects.land)
const graticule = geoGraticule10()

const COLORS = {
  glow: 'rgba(139, 92, 246, 0.32)',
  oceanLight: '#8b6cf0',
  oceanMid: '#5b2fc4',
  oceanDeep: '#22096a',
  land: '#f4f0ff',
  landEdge: 'rgba(76, 29, 149, 0.45)',
  seaLane: 'rgba(221, 214, 254, 0.55)',
  air: 'rgba(245, 185, 74, 0.75)',
  rail: 'rgba(255, 255, 255, 0.5)',
  gold: '#f5b94a',
  containers: ['#f5b94a', '#f0abfc', '#c4b5fd', '#ffffff'],
  orbit: 'rgba(124, 58, 237, 0.32)',
  sparkle: '167, 139, 250',
}

const HALF_PI = Math.PI / 2
const clamp01 = (v) => Math.max(0, Math.min(1, v))
// Fade objects in/out at the start and end of a lane so loops never "pop".
const endFade = (p) => clamp01(Math.min(p, 1 - p) / 0.05)

// Plane silhouette pointing along +x (half outline, mirrored below).
const PLANE_HALF = [
  [7, 0], [5.5, -0.9], [1.2, -1], [-2.2, -6.2], [-3.6, -6.2], [-1.8, -1], [-4.6, -1], [-6, -3], [-7, -3], [-6.2, 0],
]
const PLANE = [...PLANE_HALF, ...PLANE_HALF.slice(1, -1).reverse().map(([x, y]) => [x, -y])]

// Deterministic pseudo-random so the sparkle field is stable between renders.
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
  angle: rand(i) * Math.PI * 2,
  dist: 1.08 + rand(i + 50) * 0.32,
  size: 1.6 + rand(i + 100) * 2.6,
  speed: 0.6 + rand(i + 150) * 1.4,
  phase: rand(i + 200) * Math.PI * 2,
}))

export default function TradeGlobe({ animate = true, className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const projection = geoOrthographic().clipAngle(90).precision(0.6)
    const path = geoPath(projection, ctx)

    const routes = TRADE_ROUTES.map((r, i) => {
      const interp = geoInterpolate(r.from, r.to)
      const arc = geoDistance(r.from, r.to)
      return {
        ...r,
        interp,
        arc,
        // Long-haul flights climb higher; keeps short hops close to the surface
        altitude: 0.05 + 0.14 * (arc / Math.PI),
        line: { type: 'LineString', coordinates: Array.from({ length: 49 }, (_, k) => interp(k / 48)) },
        offset: (i * 0.37) % 1,
      }
    })

    let rotation = [...GLOBE.initialRotation]
    let cssW = 0
    let cssH = 0
    let unit = 1 // drawing scale for ships/planes, relative to a 600px globe
    let raf = 0
    let last = performance.now()
    let t = 6 // start mid-flight so the static frame already shows traffic
    let visible = true
    let dragging = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const size = Math.max(1, Math.min(rect.width, rect.height))
      cssW = rect.width
      cssH = rect.height
      unit = Math.max(0.7, Math.min(1.35, size / 600))
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      projection.translate([rect.width / 2, rect.height / 2]).scale(size * 0.38)
      draw()
    }

    // ---------- geometry helpers ----------

    /** Screen point for a lon/lat raised `h` (fraction of radius) above the surface. */
    const raised = (pos, h, cx, cy) => {
      const [x, y] = projection(pos)
      return [cx + (x - cx) * (1 + h), cy + (y - cy) * (1 + h)]
    }

    /** A raised point is visible if it's on the near side, or pokes out past the limb. */
    const raisedVisible = (pos, h, center, cx, cy, r) => {
      if (geoDistance(pos, center) < HALF_PI) return true
      const [x, y] = raised(pos, h, cx, cy)
      return Math.hypot(x - cx, y - cy) > r * 1.01
    }

    const surfaceAlpha = (pos, center) => clamp01((HALF_PI - geoDistance(pos, center)) / 0.22)

    // ---------- painters ----------

    const drawSparkles = (cx, cy, r) => {
      for (const s of SPARKLES) {
        const a = 0.15 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        const x = cx + Math.cos(s.angle) * r * s.dist
        const y = cy + Math.sin(s.angle) * r * s.dist
        if (x < 4 || y < 4 || x > cssW - 4 || y > cssH - 4) continue
        const k = s.size * unit
        ctx.fillStyle = `rgba(${COLORS.sparkle}, ${a})`
        ctx.beginPath()
        ctx.moveTo(x, y - k)
        ctx.quadraticCurveTo(x, y, x + k, y)
        ctx.quadraticCurveTo(x, y, x, y + k)
        ctx.quadraticCurveTo(x, y, x - k, y)
        ctx.quadraticCurveTo(x, y, x, y - k)
        ctx.fill()
      }
    }

    // Satellite orbit: a tilted ellipse; the half with sin(θ) < 0 sits behind the globe.
    const orbitPoint = (theta, cx, cy, r) => {
      const tilt = -0.32
      const ex = Math.cos(theta) * r * 1.2
      const ey = Math.sin(theta) * r * 0.28
      return [cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), cy + ex * Math.sin(tilt) + ey * Math.cos(tilt)]
    }
    const drawOrbit = (front, cx, cy, r) => {
      ctx.save()
      ctx.strokeStyle = COLORS.orbit
      ctx.lineWidth = 1
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      const from = front ? 0 : Math.PI
      for (let k = 0; k <= 60; k++) {
        const [x, y] = orbitPoint(from + (Math.PI * k) / 60, cx, cy, r)
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      const theta = (t * 0.32) % (Math.PI * 2)
      const isFront = Math.sin(theta) >= 0
      if (isFront !== front) return
      const [x, y] = orbitPoint(theta, cx, cy, r)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.32)
      ctx.shadowColor = COLORS.gold
      ctx.shadowBlur = 12
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-2.2 * unit, -2.2 * unit, 4.4 * unit, 4.4 * unit)
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(167, 139, 250, 0.9)'
      ctx.fillRect(-9 * unit, -1.4 * unit, 5.5 * unit, 2.8 * unit) // solar panels
      ctx.fillRect(3.5 * unit, -1.4 * unit, 5.5 * unit, 2.8 * unit)
      ctx.restore()
    }

    const drawShip = (x, y, angle, alpha, palette) => {
      const s = unit
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.globalAlpha = alpha
      // V-shaped wake fanning out behind the stern
      const wake = ctx.createLinearGradient(-4 * s, 0, -20 * s, 0)
      wake.addColorStop(0, 'rgba(255, 255, 255, 0.75)')
      wake.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.strokeStyle = wake
      ctx.lineWidth = 0.9
      ctx.beginPath()
      ctx.moveTo(-4.5 * s, -1.4 * s)
      ctx.lineTo(-20 * s, -5.5 * s)
      ctx.moveTo(-4.5 * s, 1.4 * s)
      ctx.lineTo(-20 * s, 5.5 * s)
      ctx.moveTo(-5 * s, 0)
      ctx.lineTo(-16 * s, 0)
      ctx.stroke()
      // Hull
      ctx.shadowColor = 'rgba(46, 16, 101, 0.6)'
      ctx.shadowBlur = 4
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(7 * s, 0)
      ctx.lineTo(3.5 * s, -2.3 * s)
      ctx.lineTo(-5 * s, -2.3 * s)
      ctx.lineTo(-5.6 * s, 0)
      ctx.lineTo(-5 * s, 2.3 * s)
      ctx.lineTo(3.5 * s, 2.3 * s)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      // Container stacks
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = palette[k % palette.length]
        ctx.fillRect((-3.6 + k * 2.2) * s, -1.5 * s, 1.8 * s, 3 * s)
      }
      // Bridge
      ctx.fillStyle = '#4c1d95'
      ctx.fillRect(-4.9 * s, -1.1 * s, 1 * s, 2.2 * s)
      ctx.restore()
    }

    const drawPlane = (x, y, angle, alpha) => {
      const s = unit * 0.95
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.globalAlpha = alpha
      ctx.shadowColor = COLORS.gold
      ctx.shadowBlur = 10
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      PLANE.forEach(([px, py], k) => (k ? ctx.lineTo(px * s, py * s) : ctx.moveTo(px * s, py * s)))
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = COLORS.gold
      ctx.fillRect(-1 * s, -0.5 * s, 4 * s, 1 * s) // gold stripe
      ctx.restore()
    }

    // ---------- frame ----------

    const draw = () => {
      const [cx, cy] = projection.translate()
      const r = projection.scale()
      ctx.clearRect(0, 0, cssW, cssH)
      projection.rotate([rotation[0], rotation[1], 0])
      const center = projection.invert([cx, cy])

      drawSparkles(cx, cy, r)

      // Atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.28)
      glow.addColorStop(0, COLORS.glow)
      glow.addColorStop(0.5, 'rgba(167, 139, 250, 0.12)')
      glow.addColorStop(1, 'rgba(167, 139, 250, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.28, 0, Math.PI * 2)
      ctx.fill()

      drawOrbit(false, cx, cy, r)

      // Ocean sphere, lit from the upper-left
      const ocean = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.1, cx, cy, r)
      ocean.addColorStop(0, COLORS.oceanLight)
      ocean.addColorStop(0.55, COLORS.oceanMid)
      ocean.addColorStop(1, COLORS.oceanDeep)
      ctx.fillStyle = ocean
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.fill()

      // Slow specular shimmer drifting across the water
      const sx = cx - r * 0.35 + Math.sin(t * 0.25) * r * 0.12
      const sy = cy - r * 0.4 + Math.cos(t * 0.2) * r * 0.06
      const shimmer = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.55)
      shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
      shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = shimmer
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.fill()

      // Graticule
      ctx.beginPath()
      path(graticule)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
      ctx.lineWidth = 0.6
      ctx.stroke()

      // Land
      ctx.beginPath()
      path(land)
      ctx.fillStyle = COLORS.land
      ctx.fill()
      ctx.strokeStyle = COLORS.landEdge
      ctx.lineWidth = 0.6
      ctx.stroke()

      // Night-side shading for depth
      const shade = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.2, cx, cy, r * 1.05)
      shade.addColorStop(0, 'rgba(30, 10, 80, 0)')
      shade.addColorStop(1, 'rgba(30, 10, 80, 0.45)')
      ctx.fillStyle = shade
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.fill()

      // Lilac rim light along the limb
      const rim = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r)
      rim.addColorStop(0, 'rgba(237, 233, 254, 0)')
      rim.addColorStop(1, 'rgba(221, 214, 254, 0.35)')
      ctx.fillStyle = rim
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.fill()

      // Sea lanes: flowing dashes
      ctx.save()
      ctx.setLineDash([3, 6])
      ctx.lineDashOffset = -t * 10
      ctx.strokeStyle = COLORS.seaLane
      ctx.lineWidth = 1.2
      for (const rt of routes) {
        if (rt.mode !== 'sea') continue
        ctx.beginPath()
        path(rt.line)
        ctx.stroke()
      }
      ctx.restore()

      // Ships, oriented along their lane
      routes.forEach((rt, ri) => {
        if (rt.mode !== 'sea') return
        const n = rt.ships ?? 1
        for (let k = 0; k < n; k++) {
          const p = (rt.offset + k / n + t * GLOBE.shipSpeed * rt.speed) % 1
          const pos = rt.interp(p)
          const alpha = surfaceAlpha(pos, center) * endFade(p)
          if (alpha <= 0.02) continue
          const [x, y] = projection(pos)
          const [ax, ay] = projection(rt.interp(p + 0.004))
          drawShip(x, y, Math.atan2(ay - y, ax - x), alpha, COLORS.containers.slice((ri + k) % 2))
        }
      })

      // Rail: dashed track + small train
      for (const rt of routes) {
        if (rt.mode !== 'rail') continue
        ctx.save()
        ctx.setLineDash([5, 3])
        ctx.strokeStyle = COLORS.rail
        ctx.lineWidth = 1
        ctx.beginPath()
        path(rt.line)
        ctx.stroke()
        ctx.restore()
        const p = (rt.offset + t * GLOBE.shipSpeed * rt.speed) % 1
        const pos = rt.interp(p)
        const alpha = surfaceAlpha(pos, center) * endFade(p)
        if (alpha <= 0.02) continue
        const [x, y] = projection(pos)
        const [ax, ay] = projection(rt.interp(p + 0.01))
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(x, y)
        ctx.rotate(Math.atan2(ay - y, ax - x))
        ctx.fillStyle = '#ffffff'
        for (let c = 0; c < 3; c++) ctx.fillRect((-c * 4.2 - 1.8) * unit, -1.2 * unit, 3.6 * unit, 2.4 * unit)
        ctx.restore()
      }

      // Air lanes: arcs raised above the surface, with planes and contrails
      for (const rt of routes) {
        if (rt.mode !== 'air') continue
        const h = (q) => rt.altitude * Math.sin(Math.PI * q)

        ctx.save()
        ctx.setLineDash([2, 5])
        ctx.lineDashOffset = -t * 14
        ctx.strokeStyle = 'rgba(245, 185, 74, 0.38)'
        ctx.lineWidth = 1
        ctx.beginPath()
        let open = false
        for (let k = 0; k <= 48; k++) {
          const q = k / 48
          const pos = rt.interp(q)
          if (!raisedVisible(pos, h(q), center, cx, cy, r)) {
            open = false
            continue
          }
          const [x, y] = raised(pos, h(q), cx, cy)
          open ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
          open = true
        }
        ctx.stroke()
        ctx.restore()

        const p = (rt.offset + t * GLOBE.planeSpeed * rt.speed) % 1
        const pos = rt.interp(p)
        if (!raisedVisible(pos, h(p), center, cx, cy, r)) continue
        const fade = endFade(p)
        const [x, y] = raised(pos, h(p), cx, cy)

        // Contrail: fading trail behind the plane
        ctx.save()
        ctx.lineCap = 'round'
        let prev = [x, y]
        for (let k = 1; k <= 12; k++) {
          const q = p - k * 0.006
          if (q <= 0) break
          const qp = rt.interp(q)
          if (!raisedVisible(qp, h(q), center, cx, cy, r)) break
          const pt = raised(qp, h(q), cx, cy)
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - k / 12) * fade})`
          ctx.lineWidth = 2.2 * unit * (1 - k / 14)
          ctx.beginPath()
          ctx.moveTo(prev[0], prev[1])
          ctx.lineTo(pt[0], pt[1])
          ctx.stroke()
          prev = pt
        }
        ctx.restore()

        const [ax, ay] = raised(rt.interp(p + 0.004), h(p + 0.004), cx, cy)
        drawPlane(x, y, Math.atan2(ay - y, ax - x), fade)
      }

      // Hubs
      for (const hub of HUBS) {
        if (geoDistance(hub.coords, center) > HALF_PI - 0.05) continue
        const [x, y] = projection(hub.coords)
        if (hub.home) {
          const pulse = (t * 0.6 + hub.coords[0] * 0.01) % 1
          ctx.strokeStyle = `rgba(245, 185, 74, ${0.7 * (1 - pulse)})`
          ctx.lineWidth = 1.3
          ctx.beginPath()
          ctx.arc(x, y, 3 + pulse * 12, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowColor = COLORS.gold
          ctx.shadowBlur = 8
        }
        ctx.fillStyle = hub.home ? COLORS.gold : 'rgba(255, 255, 255, 0.95)'
        ctx.beginPath()
        ctx.arc(x, y, hub.home ? 3.4 : 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      drawOrbit(true, cx, cy, r)
    }

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!dragging) rotation[0] += GLOBE.rotationDegPerSec * dt
      t += dt
      draw()
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!animate || raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    // Drag to rotate (horizontal touch drags only; vertical scrolling still works)
    const onDown = (e) => {
      dragging = { x: e.clientX, y: e.clientY, rot: [...rotation] }
      canvas.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e) => {
      if (!dragging) return
      const k = 75 / projection.scale()
      rotation = [dragging.rot[0] + (e.clientX - dragging.x) * k * 4, Math.max(-60, Math.min(60, dragging.rot[1] - (e.clientY - dragging.y) * k * 4))]
      if (!raf) draw()
    }
    const onUp = () => (dragging = null)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      visible ? start() : stop()
    })
    io.observe(canvas)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    resize()
    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full cursor-grab touch-pan-y active:cursor-grabbing ${className}`}
      role="img"
      aria-label="Animated globe with cargo ships, aircraft and rail on illustrative trade routes into Canada. Drag to rotate."
    />
  )
}
