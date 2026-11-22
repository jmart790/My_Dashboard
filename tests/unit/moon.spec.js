import { describe, it, expect } from 'vitest';
import { moonPhase, litPath } from '@/features/moon';
import { rng, shuffle, hashString } from '@/seeded';

describe('moonPhase', () => {
  it('knows full and new moons', () => {
    // full moon 2026-11-24 ~14:53 UTC, new moon 2026-11-09 ~07:02 UTC
    expect(moonPhase(new Date('2026-11-24T15:00:00Z')).name).toBe('Full Moon');
    expect(moonPhase(new Date('2026-11-24T15:00:00Z')).illumination).toBeGreaterThan(0.99);
    expect(moonPhase(new Date('2026-11-09T07:00:00Z')).name).toBe('New Moon');
    expect(moonPhase(new Date('2026-11-17T00:00:00Z')).name).toBe('First Quarter');
  });

  it('draws a path for any phase', () => {
    expect(litPath(0.25)).toMatch(/^M 20 0 A 20 20 0 0 1 20 40 A 0 20/);
    expect(litPath(0.75)).toMatch(/0 0 0 20 40/);
  });
});

describe('seeded', () => {
  it('is repeatable per seed', () => {
    expect(rng('2026-11-21')()).toBe(rng('2026-11-21')());
    expect(rng('2026-11-21')()).not.toBe(rng('2026-11-22')());
    expect(hashString('a')).not.toBe(hashString('b'));
  });

  it('shuffles without losing items', () => {
    const out = shuffle([1, 2, 3, 4, 5], rng(1));
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
