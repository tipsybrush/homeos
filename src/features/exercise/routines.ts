/**
 * Weekly programme for fitness, strength and endurance (Timi, 2026-10-22).
 * Bodyweight only, sized for a flat: three strength days, two endurance days, one recovery day, one rest day.
 * Minutes are the whole session, warm-up and cool-down included. General fitness guidance, not medical advice.
 */
import { MOVES } from './moves';

export type Item = { move: keyof typeof MOVES & string; amount: string };
export type Block = { title: string; note?: string; items: Item[] };
export type Focus = 'Strength' | 'Endurance' | 'Fitness' | 'Recovery';
export type Routine = { id: string; name: string; focus: Focus; minutes: number; goal: string; blocks: Block[] };

const WARM_UP: Block = {
  title: 'Warm-up',
  note: '5 minutes, no rest between moves',
  items: [
    { move: 'jumping-jack', amount: '1 min' },
    { move: 'hip-circles', amount: '10 each way' },
    { move: 'worlds-greatest-stretch', amount: '3 each side' },
    { move: 'squat', amount: '10 slow' },
  ],
};

const COOL_DOWN: Block = {
  title: 'Cool-down',
  note: '5 minutes, breathe slowly',
  items: [
    { move: 'hamstring-stretch', amount: '30 s each leg' },
    { move: 'cat-cow', amount: '10 slow' },
  ],
};

export const ROUTINES: Routine[] = [
  {
    id: 'strength-a',
    name: 'Strength A: legs and push',
    focus: 'Strength',
    minutes: 40,
    goal: 'Build leg and upper-body pushing strength with controlled reps.',
    blocks: [
      WARM_UP,
      {
        title: 'Main sets',
        note: 'Rest 60–90 s between sets. Stop each set 1–2 reps before you can’t do another.',
        items: [
          { move: 'squat', amount: '4 × 12–15' },
          { move: 'push-up', amount: '4 × 8–12' },
          { move: 'reverse-lunge', amount: '3 × 10 each leg' },
          { move: 'pike-push-up', amount: '3 × 6–10' },
          { move: 'plank', amount: '3 × 30–45 s' },
        ],
      },
      COOL_DOWN,
    ],
  },
  {
    id: 'intervals',
    name: 'Interval cardio',
    focus: 'Endurance',
    minutes: 30,
    goal: 'Raise your fitness ceiling with short, hard bursts.',
    blocks: [
      WARM_UP,
      {
        title: 'Intervals',
        note: '40 s hard, 20 s rest, straight through the list. 4 rounds, with 1 min rest between rounds.',
        items: [
          { move: 'high-knees', amount: '40 s' },
          { move: 'mountain-climber', amount: '40 s' },
          { move: 'skater-jump', amount: '40 s' },
          { move: 'burpee', amount: '40 s' },
          { move: 'jumping-jack', amount: '40 s' },
        ],
      },
      COOL_DOWN,
    ],
  },
  {
    id: 'strength-b',
    name: 'Strength B: back and core',
    focus: 'Strength',
    minutes: 40,
    goal: 'Strengthen your back, glutes and core for posture and power.',
    blocks: [
      WARM_UP,
      {
        title: 'Main sets',
        note: 'Rest 60–90 s between sets.',
        items: [
          { move: 'bulgarian-split-squat', amount: '3 × 8–10 each leg' },
          { move: 'inverted-row', amount: '4 × 8–12' },
          { move: 'glute-bridge', amount: '3 × 15' },
          { move: 'superman', amount: '3 × 10' },
          { move: 'side-plank', amount: '3 × 25 s each side' },
          { move: 'dead-bug', amount: '3 × 8 each side' },
        ],
      },
      COOL_DOWN,
    ],
  },
  {
    id: 'recovery',
    name: 'Active recovery',
    focus: 'Recovery',
    minutes: 35,
    goal: 'Move gently so you recover faster for the next hard day.',
    blocks: [
      { title: 'Walk', items: [{ move: 'brisk-walk', amount: '25 min' }] },
      {
        title: 'Mobility',
        note: 'Slow and easy',
        items: [
          { move: 'hip-circles', amount: '2 × 10 each way' },
          { move: 'cat-cow', amount: '2 × 10' },
          { move: 'worlds-greatest-stretch', amount: '2 × 3 each side' },
          { move: 'hamstring-stretch', amount: '2 × 30 s each leg' },
        ],
      },
    ],
  },
  {
    id: 'circuit',
    name: 'Full-body circuit',
    focus: 'Fitness',
    minutes: 35,
    goal: 'Strength and stamina together: keep moving and keep your form.',
    blocks: [
      WARM_UP,
      {
        title: 'Circuit',
        note: 'One move after another with 15 s to switch. 4 rounds, with 90 s rest between rounds.',
        items: [
          { move: 'jump-squat', amount: '12' },
          { move: 'push-up', amount: '10' },
          { move: 'walking-lunge', amount: '10 each leg' },
          { move: 'chair-dip', amount: '12' },
          { move: 'bicycle-crunch', amount: '20' },
          { move: 'jump-rope', amount: '1 min' },
        ],
      },
      COOL_DOWN,
    ],
  },
  {
    id: 'long-endurance',
    name: 'Long easy run',
    focus: 'Endurance',
    minutes: 45,
    goal: 'Build your aerobic base: long, steady and conversational.',
    blocks: [
      {
        title: 'Run',
        note: 'Easy pace the whole way. Run–walk is fine, and adding 5 minutes each week is enough.',
        items: [{ move: 'easy-run', amount: '30–40 min' }],
      },
      COOL_DOWN,
    ],
  },
];

/** Routine id per weekday, 0 = Sunday. null = rest day. */
export const WEEK_PLAN: (string | null)[] = [null, 'strength-a', 'intervals', 'strength-b', 'recovery', 'circuit', 'long-endurance'];

export const PROGRESSION =
  'Weeks 1–2: use the lower numbers. Weeks 3–4: aim for the top of each range. Then add a set, or move to the harder version.';

export const HEAT_TIP = 'Lagos heat: train early or after sunset, and drink water before and after.';

/** Every move in a routine, once, in order. */
export function movesIn(routine: Routine): string[] {
  return [...new Set(routine.blocks.flatMap((b) => b.items.map((i) => i.move)))];
}
