import { describe, it, expect } from 'vitest';
import { editionFor, paperAge } from '@/edition';

const PDX = 'America/Los_Angeles';
// 2026-11-21 is PST (UTC-8)
const at = (hhmm, day = 21) => new Date(`2026-11-${day}T${hhmm}:00-08:00`);

describe('editionFor', () => {
  it('is the morning edition from 5 AM', () => {
    expect(editionFor(at('05:00'), PDX)).toMatchObject({ id: '2026-11-21-am', evening: false, name: 'Morning Edition' });
    expect(editionFor(at('15:59'), PDX).id).toBe('2026-11-21-am');
  });

  it('is the evening edition from 4 PM', () => {
    expect(editionFor(at('16:00'), PDX)).toMatchObject({ id: '2026-11-21-pm', evening: true, press: '4 PM' });
  });

  it("is still yesterday's evening edition before 5 AM", () => {
    expect(editionFor(at('04:59', 22), PDX)).toMatchObject({ id: '2026-11-21-pm', date: '2026-11-21' });
  });

  it('crosses month boundaries', () => {
    expect(editionFor(new Date('2026-12-01T02:00:00-08:00'), PDX).id).toBe('2026-11-30-pm');
  });

  it('uses the location timezone, not the browser', () => {
    // 2:30 AM Portland is 5:30 AM in New York: Portland still reads last night's paper
    expect(editionFor(at('02:30', 22), PDX).id).toBe('2026-11-21-pm');
    expect(editionFor(at('02:30', 22), 'America/New_York').id).toBe('2026-11-22-am');
  });

  it('survives an unknown timezone', () => {
    expect(editionFor(at('10:00'), 'Not/AZone').id).toMatch(/^\d{4}-\d\d-\d\d-(am|pm)$/);
  });
});

describe('paperAge', () => {
  it('is fresh at dawn and fully aged late at night', () => {
    expect(paperAge(at('05:00'), PDX)).toBe(0);
    expect(paperAge(at('14:00'), PDX)).toBeCloseTo(0.5);
    expect(paperAge(at('23:30'), PDX)).toBe(1);
    expect(paperAge(at('03:00', 22), PDX)).toBe(1);
  });
});
