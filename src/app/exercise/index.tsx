import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { relativeDayLabel, shortWeekday, weekOf, type DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing } from '@/core/theme/tokens';
import { routineForDate, weekProgress } from '@/features/exercise/logic';
import { listWorkoutDates, markWorkoutDone, unmarkWorkout } from '@/features/exercise/repository';
import { HEAT_TIP } from '@/features/exercise/routines';
import { useToday } from '@/hooks/useToday';
import { Button, Divider, Glass, Screen, Section, Text } from '@/ui';

export default function ExerciseScreen() {
  const db = useDb();
  const { version, bump } = useDataVersion();
  const { today } = useToday();
  const days = weekOf(today);
  const [done, setDone] = useState<Set<DateKey>>(new Set());

  useEffect(() => {
    let live = true;
    listWorkoutDates(db, days[0]!, days[6]!)
      .then((d) => live && setDone(new Set(d)))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [db, days[0], days[6], version]); // eslint-disable-line react-hooks/exhaustive-deps

  const routine = routineForDate(today);
  const doneToday = done.has(today);
  const progress = weekProgress(days, done);

  const toggle = async (date: DateKey) => {
    const r = routineForDate(date);
    if (!r) return;
    if (done.has(date)) await unmarkWorkout(db, date);
    else await markWorkoutDone(db, date, r.id);
    bump();
  };

  return (
    <Screen title="Exercise" subtitle={`${progress.done} of ${progress.planned} sessions done this week`}>
      <Glass tint={routine ? colors.red : undefined} style={styles.hero}>
        <Text variant="caption" tone="secondary">
          TODAY
        </Text>
        <Text variant="title2">{routine ? routine.name : 'Rest day'}</Text>
        <Text variant="subhead" tone="secondary">
          {routine ? `${routine.focus} · about ${routine.minutes} min` : 'Take a walk if you feel like it, and stretch.'}
        </Text>
        {routine && (
          <View style={styles.list}>
            {routine.exercises.map((e) => (
              <View key={e.name} style={styles.exercise}>
                <Text variant="body" style={{ flex: 1 }}>
                  {e.name}
                </Text>
                <Text variant="subhead" tone="secondary">
                  {e.amount}
                </Text>
              </View>
            ))}
          </View>
        )}
        {routine && <Button label={doneToday ? 'Done today ✓ (tap to undo)' : 'Mark today done'} kind={doneToday ? 'glass' : 'primary'} onPress={() => toggle(today)} />}
      </Glass>
      <Text variant="footnote" tone="secondary">
        {HEAT_TIP}
      </Text>

      <Section title="This week">
        <Glass style={styles.card}>
          {days.map((d, i) => {
            const r = routineForDate(d);
            const isDone = done.has(d);
            return (
              <View key={d}>
                {i > 0 && <Divider />}
                <Pressable
                  onPress={() => toggle(d)}
                  disabled={!r || d > today}
                  style={styles.row}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone, disabled: !r || d > today }}
                  accessibilityLabel={`${relativeDayLabel(d, today)}: ${r ? r.name : 'Rest'}`}>
                  <Text variant="subhead" tone={d === today ? 'accent' : 'secondary'} style={styles.weekday}>
                    {shortWeekday(d)}
                  </Text>
                  <Text variant="body" tone={r ? 'primary' : 'tertiary'} style={{ flex: 1 }}>
                    {r ? r.name : 'Rest'}
                  </Text>
                  {r && <Ionicons name={isDone ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={isDone ? colors.green : colors.textTertiary} />}
                </Pressable>
              </View>
            );
          })}
        </Glass>
      </Section>
      <Text variant="footnote" tone="tertiary">
        General fitness guidance, not medical advice. Stop if anything hurts.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  list: { marginVertical: spacing.sm, gap: spacing.xs },
  exercise: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  card: { borderRadius: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 48 },
  weekday: { width: 40 },
});
