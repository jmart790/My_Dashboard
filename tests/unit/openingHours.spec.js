import { isOpenNow } from '@/openingHours';

const NY = { timezone: 'America/New_York', lat: 40.71, lon: -74.0 };
const DENVER = { timezone: 'America/Denver', lat: 39.75, lon: -104.99 };
const WEEKDAYS = 'Mo-Fr 09:00-17:00';

describe('isOpenNow', () => {
  it('evaluates hours in the place timezone, not the browser timezone', () => {
    // Wed 2026-11-18 23:30 UTC = 6:30pm in New York, 4:30pm in Denver
    const instant = new Date('2026-11-18T23:30:00Z');
    expect(isOpenNow(WEEKDAYS, NY, instant)).toBe(false);
    expect(isOpenNow(WEEKDAYS, DENVER, instant)).toBe(true);
  });

  it('handles the morning side too', () => {
    // Wed 15:00 UTC = 10am New York, 8am Denver
    const instant = new Date('2026-11-18T15:00:00Z');
    expect(isOpenNow(WEEKDAYS, NY, instant)).toBe(true);
    expect(isOpenNow(WEEKDAYS, DENVER, instant)).toBe(false);
  });

  it('is closed on days not listed', () => {
    // Sat 2026-11-21 18:00 UTC = 1pm New York
    expect(isOpenNow(WEEKDAYS, NY, new Date('2026-11-21T18:00:00Z'))).toBe(false);
  });

  it('knows US public holidays from the coordinates', () => {
    // Thanksgiving, Thu 2026-11-26 15:00 UTC = 10am New York
    expect(isOpenNow('Mo-Su 09:00-17:00; PH off', NY, new Date('2026-11-26T15:00:00Z'))).toBe(false);
  });

  it('returns null for empty or unparseable hours', () => {
    const instant = new Date('2026-11-18T15:00:00Z');
    expect(isOpenNow('', NY, instant)).toBeNull();
    expect(isOpenNow('garbage!!', NY, instant)).toBeNull();
  });

  it('falls back to the browser timezone when none is given', () => {
    expect(isOpenNow('24/7', {}, new Date())).toBe(true);
  });
});
