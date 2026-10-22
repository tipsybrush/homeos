import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { relativeDayLabel, shortWeekday, weekOf, type DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing } from '@/core/theme/tokens';
import { routineForDate, weekProgress } from '@/features/exercise/logic';
import { listWorkoutDates, markWorkoutDone, unmarkWorkout } from '@/features/exercise/repository';
import { HEAT_TIP, PROGRESSION } from '@/features/exercise/routines';
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
      <Glass style={styles.hero}>
        <Text variant="caption" tone="secondary" style={styles.kicker}>
          {routine ? `TODAY · ${routine.focus.toUpperCase()} · ${routine.minutes} MIN` : 'TODAY'}
        </Text>
        <Text variant="title2">{routine ? routine.name : 'Rest day'}</Text>
        <Text variant="subhead" tone="secondary">
          {routine ? routine.goal : 'Rest is when you get stronger. A gentle walk and a stretch are plenty.'}
        </Text>
        {routine && (
          <View style={styles.actions}>
            <Button label="Start workout" kind="primary" onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: routine.id, date: today } })} />
            <Button label={doneToday ? 'Done today ✓ (tap to undo)' : 'Mark today done'} kind="glass" onPress={() => toggle(today)} />
          </View>
        )}
      </Glass>

      <Section title="This week">
        <Glass style={styles.card}>
          {days.map((d, i) => {
            const r = routineForDate(d);
            const isDone = done.has(d);
            return (
              <View key={d}>
                {i > 0 && <Divider />}
                <View style={styles.row}>
                  <Text variant="subhead" tone={d === today ? 'accent' : 'secondary'} style={styles.weekday}>
                    {shortWeekday(d)}
                  </Text>
                  <Pressable
                    style={{ flex: 1, paddingVertical: spacing.sm }}
                    disabled={!r}
                    onPress={() => r && router.push({ pathname: '/exercise/[id]', params: { id: r.id, date: d } })}
                    accessibilityRole="button"
                    accessibilityLabel={`${relativeDayLabel(d, today)}: ${r ? r.name : 'Rest'}`}>
                    <Text variant="body" tone={r ? 'primary' : 'tertiary'}>
                      {r ? r.name : 'Rest'}
                    </Text>
                    {r && (
                      <Text variant="footnote" tone="secondary">
                        {r.focus} · {r.minutes} min
                      </Text>
                    )}
                  </Pressable>
                  {r && (
                    <Pressable
                      onPress={() => toggle(d)}
                      disabled={d > today}
                      hitSlop={10}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isDone, disabled: d > today }}
                      accessibilityLabel={`Mark ${r.name} done`}>
                      <Ionicons name={isDone ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={isDone ? colors.green : colors.textTertiary} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </Glass>
      </Section>

      <View style={{ gap: spacing.xs }}>
        <Text variant="footnote" tone="secondary">
          {PROGRESSION}
        </Text>
        <Text variant="footnote" tone="secondary">
          {HEAT_TIP}
        </Text>
        <Text variant="footnote" tone="tertiary">
          General fitness guidance, not medical advice. Stop if anything hurts.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  kicker: { letterSpacing: 0.6 },
  actions: { gap: spacing.xs, marginTop: spacing.sm },
  card: { borderRadius: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 56 },
  weekday: { width: 40 },
});
