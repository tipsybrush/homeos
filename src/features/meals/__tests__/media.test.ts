import { recipePhoto, recipeVideo } from '../images';
import { MEDIA } from '../guides/media';
import { DETAILED_STEPS } from '../guides/steps';

describe('recipe media', () => {
  it('builds Commons photo URLs and YouTube ids', () => {
    expect(recipePhoto('rcp_jollof', 240)?.uri).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/Jollof_rice_with_dodo.jpg?width=250');
    expect(recipePhoto('rcp_jollof', 960)?.uri).toMatch(/width=960$/);
    expect(recipePhoto(null)).toBeNull();
    expect(recipeVideo('rcp_jollof')?.id).toMatch(/^[\w-]{11}$/);
  });

  it('has a video and detailed steps for every recipe', () => {
    for (const [id, m] of Object.entries(MEDIA)) {
      expect(m.videoId).toMatch(/^[\w-]{11}$/);
      expect(DETAILED_STEPS[id]?.steps.length ?? 0).toBeGreaterThanOrEqual(6);
    }
  });
});
