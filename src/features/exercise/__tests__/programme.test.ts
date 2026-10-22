import { MOVES } from '../moves';
import { movesIn, ROUTINES, WEEK_PLAN } from '../routines';
import { MOVE_VIDEOS } from '../videos';

describe('exercise programme', () => {
  it('trains strength, endurance and recovery each week with one rest day', () => {
    const focus = WEEK_PLAN.map((id) => ROUTINES.find((r) => r.id === id)?.focus ?? 'Rest');
    expect(focus.filter((f) => f === 'Strength')).toHaveLength(2);
    expect(focus.filter((f) => f === 'Endurance')).toHaveLength(2);
    expect(focus).toContain('Fitness');
    expect(focus).toContain('Recovery');
    expect(focus.filter((f) => f === 'Rest')).toHaveLength(1);
  });

  it('has steps and a form video for every move it uses', () => {
    for (const r of ROUTINES) {
      for (const id of movesIn(r)) {
        expect(MOVES[id]?.steps.length).toBeGreaterThanOrEqual(3);
        expect(MOVE_VIDEOS[id]?.id).toMatch(/^[\w-]{11}$/);
      }
    }
  });
});
