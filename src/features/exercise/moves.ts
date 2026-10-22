/**
 * Exercise library: how to do each move, what to feel, and how to make it easier or harder.
 * Bodyweight only, sized for a flat. Video ids are YouTube form tutorials, played in the app.
 * General fitness guidance, not medical advice.
 */
export type Move = {
  name: string;
  /** What it trains, shown under the name. */
  works: string;
  steps: string[];
  /** The one thing to get right. */
  cue: string;
  easier: string;
  harder: string;
};

export const MOVES: Record<string, Move> = {
  // ── Strength ───────────────────────────────────────────────────────
  squat: {
    name: 'Squat',
    works: 'Thighs, glutes, core',
    steps: [
      'Stand with feet shoulder-width apart, toes turned out slightly.',
      'Brace your stomach, then sit your hips back and down as if onto a low chair.',
      'Go down until your thighs are at least parallel to the floor, knees following your toes.',
      'Drive through your whole foot to stand tall, squeezing your glutes at the top.',
    ],
    cue: 'Keep your chest up and heels flat on the floor the whole time.',
    easier: 'Squat to a chair and stand back up.',
    harder: 'Pause for 2 seconds at the bottom, or hold a full water bottle or bag at your chest.',
  },
  'push-up': {
    name: 'Push-up',
    works: 'Chest, shoulders, triceps, core',
    steps: [
      'Hands slightly wider than your shoulders, body in a straight line from head to heels.',
      'Squeeze your glutes and stomach so your hips don’t sag.',
      'Lower your chest to a fist’s height from the floor, elbows at about 45° from your body.',
      'Push the floor away until your arms are straight.',
    ],
    cue: 'Move as one solid plank: chest and hips rise together.',
    easier: 'Hands on a table or wall, or knees down.',
    harder: 'Feet on a chair, or take 3 seconds to lower.',
  },
  'reverse-lunge': {
    name: 'Reverse lunge',
    works: 'Thighs, glutes, balance',
    steps: [
      'Stand tall with feet hip-width apart.',
      'Step one foot back and lower until both knees are bent at about 90°.',
      'Keep your front knee over your ankle and your back knee just above the floor.',
      'Push through the front heel to return to standing. Finish all reps on one side, then switch.',
    ],
    cue: 'Most of your weight stays on the front foot.',
    easier: 'Hold a wall or chair for balance and go less deep.',
    harder: 'Pause at the bottom, or hold a full bag in each hand.',
  },
  'pike-push-up': {
    name: 'Pike push-up',
    works: 'Shoulders, triceps',
    steps: [
      'Start in a push-up position, then walk your feet in and lift your hips high into an upside-down V.',
      'Hands shoulder-width apart, head between your arms.',
      'Bend your elbows to lower the top of your head towards the floor between your hands.',
      'Press back up until your arms are straight.',
    ],
    cue: 'Keep your hips high so the push is straight down through your shoulders.',
    easier: 'Hands on a low step or sofa edge.',
    harder: 'Feet raised on a chair.',
  },
  plank: {
    name: 'Plank',
    works: 'Core, shoulders',
    steps: [
      'Forearms on the floor, elbows under your shoulders.',
      'Step your feet back so your body is a straight line from head to heels.',
      'Squeeze your glutes, pull your belly button in, and breathe steadily.',
      'Hold for the time given. Stop when your hips start to drop.',
    ],
    cue: 'Imagine pulling your elbows towards your toes to switch on your stomach.',
    easier: 'Knees down, or hands on a table.',
    harder: 'Lift one foot for a few seconds at a time, alternating.',
  },
  'glute-bridge': {
    name: 'Glute bridge',
    works: 'Glutes, hamstrings, lower back',
    steps: [
      'Lie on your back, knees bent, feet flat and hip-width apart near your bottom.',
      'Press your lower back gently into the floor.',
      'Push through your heels to lift your hips until your body is straight from shoulders to knees.',
      'Squeeze your glutes for a second at the top, then lower slowly.',
    ],
    cue: 'Lift with your glutes, not by arching your back.',
    easier: 'Smaller range, with a pause at the top.',
    harder: 'Single-leg: one foot in the air, 8–10 each side.',
  },
  'bulgarian-split-squat': {
    name: 'Bulgarian split squat',
    works: 'Thighs, glutes, balance',
    steps: [
      'Stand about two steps in front of a chair or bed, facing away from it.',
      'Rest the top of one foot on the seat behind you.',
      'Lower straight down until your front thigh is nearly parallel to the floor.',
      'Drive through your front heel to stand. Finish all reps, then switch legs.',
    ],
    cue: 'Front knee tracks over your toes; your torso leans forward a little.',
    easier: 'Back foot on the floor (a split squat).',
    harder: 'Hold a full bag or bottles in each hand.',
  },
  superman: {
    name: 'Superman',
    works: 'Lower back, glutes, upper back',
    steps: [
      'Lie face down with arms stretched forward.',
      'Lift your arms, chest and legs a few centimetres off the floor at the same time.',
      'Look at the floor to keep your neck long, and squeeze your glutes and shoulder blades.',
      'Hold for 2 seconds, then lower with control.',
    ],
    cue: 'Reach long rather than high.',
    easier: 'Lift opposite arm and leg only, alternating.',
    harder: 'Hold the top position for the full set time.',
  },
  'inverted-row': {
    name: 'Table row',
    works: 'Upper back, biceps',
    steps: [
      'Lie on your back under a sturdy table, chest under its edge.',
      'Grip the edge with hands shoulder-width apart, arms straight.',
      'Keep your body straight from shoulders to heels and pull your chest up to the table.',
      'Lower slowly until your arms are straight again.',
    ],
    cue: 'Squeeze your shoulder blades together at the top. Test that the table is solid first.',
    easier: 'Bend your knees with feet flat on the floor.',
    harder: 'Straight legs, with a 2-second hold at the top.',
  },
  'side-plank': {
    name: 'Side plank',
    works: 'Obliques, hips, shoulders',
    steps: [
      'Lie on your side with your elbow under your shoulder and legs stacked.',
      'Lift your hips so your body is straight from head to feet.',
      'Keep your hips pushed forward, not sagging back.',
      'Hold for the time given, then switch sides.',
    ],
    cue: 'Push the floor away with your elbow.',
    easier: 'Bottom knee on the floor.',
    harder: 'Raise your top leg.',
  },
  'dead-bug': {
    name: 'Dead bug',
    works: 'Deep core',
    steps: [
      'Lie on your back with arms pointing to the ceiling and knees bent at 90° over your hips.',
      'Press your lower back into the floor.',
      'Slowly lower your opposite arm and leg towards the floor without your back lifting.',
      'Return to the start and switch sides.',
    ],
    cue: 'Breathe out as you reach; your lower back never leaves the floor.',
    easier: 'Move only the legs, or only the arms.',
    harder: 'Go slower, with a 2-second pause at full reach.',
  },
  'chair-dip': {
    name: 'Chair dip',
    works: 'Triceps, chest, shoulders',
    steps: [
      'Sit on the edge of a sturdy chair, hands gripping the edge beside your hips.',
      'Slide your bottom off the chair, knees bent and feet flat.',
      'Bend your elbows straight back to lower until your upper arms are about parallel to the floor.',
      'Press back up until your arms are straight.',
    ],
    cue: 'Keep your back close to the chair and your shoulders down away from your ears.',
    easier: 'Feet closer to the chair, smaller range.',
    harder: 'Straighten your legs.',
  },
  // ── Endurance and conditioning ─────────────────────────────────────
  'jumping-jack': {
    name: 'Jumping jacks',
    works: 'Whole body, heart rate',
    steps: [
      'Stand with feet together and arms by your sides.',
      'Jump your feet out wide while swinging your arms overhead.',
      'Jump back to the start.',
      'Keep a steady, springy rhythm on the balls of your feet.',
    ],
    cue: 'Land softly with slightly bent knees.',
    easier: 'Step out one foot at a time instead of jumping.',
    harder: 'Go faster, or add a squat each time your feet land wide.',
  },
  'high-knees': {
    name: 'High knees',
    works: 'Hips, legs, heart rate',
    steps: [
      'Stand tall with your arms bent at 90°.',
      'Run on the spot, driving each knee up to hip height.',
      'Pump your arms in time with your legs.',
      'Stay light and quick on the balls of your feet.',
    ],
    cue: 'Stand tall: don’t lean back as your knees come up.',
    easier: 'March with high knees instead of running.',
    harder: 'Go as fast as you can for the work period.',
  },
  'mountain-climber': {
    name: 'Mountain climbers',
    works: 'Core, shoulders, heart rate',
    steps: [
      'Start in a high plank with your hands under your shoulders.',
      'Drive one knee towards your chest, then switch legs quickly.',
      'Keep your hips level with your shoulders.',
      'Keep a steady, running rhythm.',
    ],
    cue: 'Shoulders stay over your hands the whole time.',
    easier: 'Hands on a sofa or step, and step the feet in slowly.',
    harder: 'Go faster, or bring each knee across to the opposite elbow.',
  },
  burpee: {
    name: 'Burpee',
    works: 'Whole body, power, heart rate',
    steps: [
      'From standing, squat down and put your hands on the floor.',
      'Jump or step your feet back into a plank.',
      'Jump or step your feet back in towards your hands.',
      'Stand up and jump, reaching your arms overhead.',
    ],
    cue: 'Keep your core tight in the plank so your hips don’t sag.',
    easier: 'Step back and in, and skip the jump.',
    harder: 'Add a push-up in the plank.',
  },
  'skater-jump': {
    name: 'Skater jumps',
    works: 'Legs, balance, agility',
    steps: [
      'Stand on your right leg with a slight bend in the knee.',
      'Jump sideways to the left, landing softly on your left foot.',
      'Let your right foot swing behind you and your arms swing across, like a speed skater.',
      'Jump back to the right and keep going side to side.',
    ],
    cue: 'Land softly and hold each landing for a moment before the next jump.',
    easier: 'Step side to side instead of jumping.',
    harder: 'Jump wider and lower.',
  },
  'jump-squat': {
    name: 'Jump squat',
    works: 'Legs, glutes, power',
    steps: [
      'Stand with feet shoulder-width apart.',
      'Squat down to about parallel.',
      'Drive up explosively and jump, straightening your body.',
      'Land softly on the balls of your feet and sink straight into the next squat.',
    ],
    cue: 'Quiet landings: if it’s loud, slow down.',
    easier: 'Fast bodyweight squats rising onto your toes, without the jump.',
    harder: 'Pause in the bottom for 1 second before each jump.',
  },
  'walking-lunge': {
    name: 'Walking lunge',
    works: 'Legs, glutes, balance',
    steps: [
      'Stand tall, then take a long step forward.',
      'Lower until both knees are bent at about 90°.',
      'Push through the front foot and bring your back foot forward into the next step.',
      'Keep going, alternating legs. Turn around if you run out of space.',
    ],
    cue: 'Keep your torso upright and your front knee over your ankle.',
    easier: 'Reverse lunges in place, holding a wall.',
    harder: 'Add a knee drive at the top of each step.',
  },
  'bicycle-crunch': {
    name: 'Bicycle crunch',
    works: 'Abs, obliques',
    steps: [
      'Lie on your back with hands lightly behind your head and legs lifted, knees bent.',
      'Curl your shoulders off the floor.',
      'Bring one elbow towards the opposite knee while straightening the other leg.',
      'Switch sides in a slow pedalling motion.',
    ],
    cue: 'Turn from your ribs; don’t pull on your neck.',
    easier: 'Keep both feet on the floor and twist the upper body only.',
    harder: 'Go slower, with a 1-second hold on each side.',
  },
  'jump-rope': {
    name: 'Skipping rope',
    works: 'Calves, coordination, heart rate',
    steps: [
      'Hold the handles at hip height with elbows close to your sides.',
      'Turn the rope with your wrists, not your arms.',
      'Jump just high enough to clear the rope, landing on the balls of your feet.',
      'Keep a steady rhythm and breathe.',
    ],
    cue: 'Small jumps: a couple of centimetres is enough.',
    easier: 'Jump without a rope, turning your wrists as if holding one.',
    harder: 'Alternate feet like jogging, or go faster.',
  },
  'brisk-walk': {
    name: 'Brisk walk',
    works: 'Heart, lungs, legs',
    steps: [
      'Walk tall with your eyes ahead and shoulders relaxed.',
      'Bend your arms to about 90° and swing them from the shoulders.',
      'Land on your heel and roll through to push off from your toes.',
      'Walk fast enough that you can talk but not sing.',
    ],
    cue: 'Quicker, shorter steps beat long strides.',
    easier: 'Slow down, and take short breaks if needed.',
    harder: 'Add hills or stairs, or 1-minute fast bursts.',
  },
  'easy-run': {
    name: 'Easy run (or run–walk)',
    works: 'Heart, lungs, legs: aerobic endurance',
    steps: [
      'Warm up with 5 minutes of brisk walking.',
      'Jog at a pace where you can still speak in full sentences.',
      'Land under your hips with quick, light steps, arms relaxed at your sides.',
      'If you get out of breath, walk for 1 minute, then jog again.',
    ],
    cue: 'Easy means easy: most of your endurance comes from this conversational pace.',
    easier: 'Run 1 minute, walk 2 minutes, and repeat.',
    harder: 'Run the whole time, adding 5 minutes each week.',
  },
  // ── Mobility ───────────────────────────────────────────────────────
  'hip-circles': {
    name: 'Hip circles',
    works: 'Hip mobility',
    steps: [
      'Stand with your hands on your hips and feet hip-width apart.',
      'Draw big, slow circles with your hips.',
      'Do the reps one way, then the other.',
    ],
    cue: 'Make the circles as big as is comfortable.',
    easier: 'Smaller circles.',
    harder: 'Stand on one leg and circle the other knee.',
  },
  'cat-cow': {
    name: 'Cat–cow',
    works: 'Spine mobility',
    steps: [
      'Kneel on all fours, hands under shoulders and knees under hips.',
      'Breathe in as you drop your belly and lift your chest and tailbone (cow).',
      'Breathe out as you round your back up towards the ceiling and tuck your chin (cat).',
      'Move slowly with your breath.',
    ],
    cue: 'Move one vertebra at a time.',
    easier: 'Smaller range.',
    harder: 'Hold each end position for 3 seconds.',
  },
  'worlds-greatest-stretch': {
    name: 'World’s greatest stretch',
    works: 'Hips, hamstrings, upper back',
    steps: [
      'Step into a deep lunge with your right foot forward and both hands on the floor.',
      'Drop your right elbow towards the inside of your right foot.',
      'Rotate and reach your right arm up to the ceiling, following it with your eyes.',
      'Return, step back, and repeat on the other side.',
    ],
    cue: 'Keep your back leg straight and strong.',
    easier: 'Back knee down on the floor.',
    harder: 'Hold each position for 3 slow breaths.',
  },
  'hamstring-stretch': {
    name: 'Hamstring stretch',
    works: 'Back of the thighs',
    steps: [
      'Put one heel on a low step or chair, leg straight.',
      'Keep your back flat and hinge forward from your hips until you feel a stretch.',
      'Breathe slowly and hold, then switch legs.',
    ],
    cue: 'Hinge from the hips; don’t round your back to reach further.',
    easier: 'Lower step, or a slight bend in the knee.',
    harder: 'Point your toes up towards you.',
  },
};
