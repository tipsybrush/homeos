import { weekOf } from '@/core/dates';

import { lookFor, ownedMatch } from '../looks';
import type { WardrobeItem } from '../logic';

describe('daily looks', () => {
  it('gives office looks on weekdays, a party look on Saturday and church on Sunday', () => {
    for (const start of ['2026-10-19', '2026-10-26']) {
      const week = weekOf(start as never);
      const occasions = week.map((d) => lookFor(d).occasion);
      expect(occasions).toEqual(['Office', 'Office', 'Office', 'Office', 'Office', 'Party', 'Church']);
    }
    expect(lookFor('2026-10-19').name).not.toBe(lookFor('2026-10-26').name);
  });

  it('spots a similar piece you already own', () => {
    const loafers = { id: 'w1', name: 'Suede loafers', category: 'shoes', colour: 'Tan' } as WardrobeItem;
    expect(ownedMatch({ category: 'shoes', item: 'Loafers', colour: 'tan', hex: '#A47148' }, [loafers])?.id).toBe('w1');
    expect(ownedMatch({ category: 'top', item: 'Shirt', colour: 'tan', hex: '#A47148' }, [loafers])).toBeNull();
  });
});

describe('look photos', () => {
  it('every look has at least one real photo', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ALL_LOOKS, lookPhotos } = require('../looks');
    for (const l of ALL_LOOKS) expect(lookPhotos(l.id).length).toBeGreaterThan(0);
  });
});
