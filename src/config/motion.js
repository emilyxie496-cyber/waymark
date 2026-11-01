/*
  Cinematic-effects switch.
  - Set CINEMATIC_EFFECTS = false to turn off the animated globe, scroll story
    motion and count-up numbers everywhere (static fallbacks are shown instead).
  - Or add ?lite to the URL (e.g. http://localhost:5173/?lite) for one session.
  Users with "reduce motion" enabled in their OS always get the static versions.
*/
export const CINEMATIC_EFFECTS = true

export function cinematicEnabled() {
  if (!CINEMATIC_EFFECTS || typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).has('lite')) return false
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Globe tuning
export const GLOBE = {
  rotationDegPerSec: 6, // spin speed
  shipSpeed: 0.02, // fraction of a sea/rail lane travelled per second (× route speed)
  planeSpeed: 0.03, // fraction of an air lane travelled per second (× route speed)
  initialRotation: [150, -28], // [longitude, latitude] facing the viewer
}
