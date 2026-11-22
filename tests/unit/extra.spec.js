import { describe, it, expect } from 'vitest';
import { extrasFrom, isWarning, isBreaking } from '@/extra';

describe('EXTRA rule', () => {
  it('counts warnings, not watches or advisories', () => {
    expect(isWarning({ title: 'Winter Storm Warning' })).toBe(true);
    expect(isWarning({ title: 'Flood Watch' })).toBe(false);
    expect(isWarning({ title: 'Wind Advisory' })).toBe(false);
  });

  it('spots breaking language', () => {
    expect(isBreaking('Crews order evacuations near Estacada')).toBe(true);
    expect(isBreaking('I-84 closed after crash')).toBe(true);
    expect(isBreaking('Zoo names baby otter')).toBe(false);
  });

  it('only flags breaking stories that were not in the edition, minus dismissed ones', () => {
    const articles = [
      { _id: '1', title: 'BREAKING: Bridge closed', link: 'a' },
      { _id: '2', title: 'Wildfire forces evacuations', link: 'b' },
      { _id: '3', title: 'Explosion reported downtown', link: 'c' },
      { _id: '4', title: 'Farmers market opens', link: 'd' },
    ];
    const out = extrasFrom({
      alerts: [{ id: 'x1', title: 'Ice Storm Warning', headline: 'Ice Storm Warning until 10 AM' }, { title: 'Flood Watch' }],
      articles,
      editionTitles: ['BREAKING: Bridge closed'],
      dismissed: ['news:c'],
    });
    expect(out).toEqual([
      { id: 'nws:x1', kind: 'weather', title: 'Ice Storm Warning until 10 AM' },
      { id: 'news:b', kind: 'news', title: 'Wildfire forces evacuations', link: 'b' },
    ]);
  });
});
