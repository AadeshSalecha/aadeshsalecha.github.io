// Single source of truth for scroll progress ranges (0..1 of total scroll height).
// Shared between main.js (DOM panel reveal) and experience.js (camera + world state).

export const SECTIONS = [
  { key: 'hero',        start: 0.00, end: 0.10 },
  { key: 'problem',     start: 0.10, end: 0.22 },
  { key: 'hyfin-a',     start: 0.22, end: 0.34 },
  { key: 'hyfin-b',     start: 0.34, end: 0.48 },
  { key: 'hyfin-c',     start: 0.48, end: 0.58 },
  { key: 'credentials', start: 0.58, end: 0.74 },
  { key: 'research',    start: 0.74, end: 0.86 },
  { key: 'contact',     start: 0.86, end: 1.00 },
];

// The Hyfin/GAIA arc (a-b-c combined) is where the world "lights up" — solar, turbines,
// EV, village lights all ramp on across this span.
export const HYFIN_RANGE = { start: 0.20, end: 0.60 };

export function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// Maps progress p from [a,b] to [0,1], clamped.
export function mapRange(p, a, b) {
  if (b === a) return 0;
  return clamp01((p - a) / (b - a));
}

// Smootherstep easing for nicer interpolation than linear.
export function smoothstep(t) {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}
