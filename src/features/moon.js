// Moon phase from a known new moon and the synodic month. Good to within a few
// hours, which is plenty for an almanac box.
const SYNODIC = 29.530588853; // days
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14); // 2000-01-06 18:14 UTC

const NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
];

/**
 * @returns {{ phase: number, illumination: number, name: string, age: number }}
 *   phase 0..1 (0 new, 0.5 full), illumination 0..1, age in days since new moon
 */
export function moonPhase(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW) / 86400000;
  const phase = (((days / SYNODIC) % 1) + 1) % 1;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  return {
    phase,
    illumination,
    name: NAMES[Math.round(phase * 8) % 8],
    age: phase * SYNODIC,
  };
}

/**
 * SVG path for the lit part of a moon of radius r centered at (r, r).
 * The terminator is an ellipse whose x-radius shrinks to 0 at the quarters.
 */
export function litPath(phase, r = 20) {
  const waxing = phase < 0.5;
  const k = Math.cos(2 * Math.PI * phase); // 1 new, 0 quarter, -1 full
  const rx = Number((Math.abs(k) * r).toFixed(2));
  const outer = waxing ? 1 : 0; // lit limb: right side while waxing
  // terminator bulges toward the lit side once past the quarter
  const inner = (k < 0) === waxing ? 1 : 0;
  return `M ${r} 0 A ${r} ${r} 0 0 ${outer} ${r} ${2 * r} A ${rx} ${r} 0 0 ${inner} ${r} 0 Z`;
}
