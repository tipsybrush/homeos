/** @jest-environment node */
import { migrate } from '@/core/db/migrations';
import { createTestDb } from '@/test/nodeDb';

import { buyNext, suggestOutfits, type WardrobeItem } from '../logic';
import { addWardrobeItem, deleteWardrobeItem, listWardrobe } from '../repository';

const item = (id: string, category: WardrobeItem['category'], colour: string | null, lightFabric = false): WardrobeItem => ({
  id,
  name: id,
  category,
  colour,
  lightFabric,
});

describe('wardrobe', () => {
  it('needs a top, bottom and shoes before suggesting outfits', () => {
    expect(suggestOutfits([item('t', 'top', 'olive')])).toEqual([]);
  });

  it('leads with light, earthy pieces and varies tops', () => {
    const items = [item('heavy-red', 'top', 'red'), item('linen-cream', 'top', 'cream', true), item('khakis', 'bottom', 'khaki'), item('loafers', 'shoes', 'brown')];
    const outfits = suggestOutfits(items);
    expect(outfits).toHaveLength(2);
    expect(outfits[0]!.top.id).toBe('linen-cream');
    expect(outfits[1]!.top.id).toBe('heavy-red');
  });

  it('suggests missing core pieces first and never prices', () => {
    const gaps = buyNext([item('a', 'top', 'olive'), item('b', 'top', 'cream')]);
    expect(gaps[0]!.have).toBe(0);
    expect(gaps.map((g) => g.category)).toContain('top');
    expect(JSON.stringify(gaps)).not.toMatch(/₦|naira|price/i);
  });

  it('stores and removes items', async () => {
    const db = createTestDb();
    await migrate(db);
    const id = await addWardrobeItem(db, { name: ' Linen shirt ', category: 'top', colour: 'Olive', lightFabric: true });
    expect(await listWardrobe(db)).toEqual([{ id, name: 'Linen shirt', category: 'top', colour: 'Olive', lightFabric: true }]);
    await deleteWardrobeItem(db, id);
    expect(await listWardrobe(db)).toEqual([]);
    db.close();
  });
});
