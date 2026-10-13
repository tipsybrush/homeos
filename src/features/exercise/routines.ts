/**
 * Built-in routines: no equipment, sized for a flat. Times are total session
 * length. This is general fitness guidance, not medical advice.
 */
export type Exercise = { name: string; amount: string };
export type Routine = { id: string; name: string; focus: string; minutes: number; exercises: Exercise[] };

export const ROUTINES: Routine[] = [
  {
    id: 'strength-a',
    name: 'Full body A',
    focus: 'Strength',
    minutes: 30,
    exercises: [
      { name: 'Squats', amount: '3 × 12' },
      { name: 'Push-ups (knees if needed)', amount: '3 × 8–12' },
      { name: 'Glute bridges', amount: '3 × 15' },
      { name: 'Plank', amount: '3 × 30 s' },
    ],
  },
  {
    id: 'cardio',
    name: 'Brisk walk and mobility',
    focus: 'Cardio',
    minutes: 35,
    exercises: [
      { name: 'Brisk walk', amount: '25 min' },
      { name: 'Hip circles', amount: '2 × 10 each way' },
      { name: 'Cat–cow stretch', amount: '2 × 10' },
      { name: 'Hamstring stretch', amount: '2 × 30 s each leg' },
    ],
  },
  {
    id: 'strength-b',
    name: 'Full body B',
    focus: 'Strength',
    minutes: 30,
    exercises: [
      { name: 'Reverse lunges', amount: '3 × 10 each leg' },
      { name: 'Shoulder taps', amount: '3 × 20' },
      { name: 'Superman hold', amount: '3 × 20 s' },
      { name: 'Dead bug', amount: '3 × 8 each side' },
    ],
  },
];

/** Routine id per weekday, 0 = Sunday. null = rest day. */
export const WEEK_PLAN: (string | null)[] = [null, 'strength-a', 'cardio', 'strength-b', null, 'strength-a', 'cardio'];

export const HEAT_TIP = 'Lagos heat: train early or after sunset, and drink water before and after.';
