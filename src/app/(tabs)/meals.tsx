import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { addDays, dayOfMonth, relativeDayLabel, shortWeekday, weekOf, type DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing } from '@/core/theme/tokens';
import { MealRow } from '@/features/meals/components/MealCard';
import { useAutoFillWeek, useMealsInRange } from '@/features/meals/hooks';
import { buildWeek, categoryLabel } from '@/features/meals/logic';
import { setMealStatus } from '@/features/meals/repository';
import { MEAL_CATEGORIES } from '@/features/meals/types';
import { useToday } from '@/hooks/useToday';
import { Divider, Glass, Screen, Section, Text } from '@/ui';

export default function MealsScreen() {
  const db = useDb();
  const { bump } = useDataVersion();
  const { today } = useToday();
  const [selected, setSelected] = useState<DateKey>(today);
  const days = weekOf(selected);
  const from = days[0]! < today ? today : days[0]!;
  useAutoFillWeek(days[0]!, from);
  const range = useMealsInRange(days[0]!, days[6]!);
  const week = buildWeek(days, range.data);
  const dayMeals = week.find((d) => d.date === selected)?.meals ?? [];
  const dayTotal = dayMeals.length;

  const add = (category?: string, date: DateKey = selected) =>
    router.push({ pathname: '/meal/[id]', params: { id: 'new', date, ...(category ? { category } : {}) } });

  const toggleDone = async (id: string, completed: boolean) => {
    await setMealStatus(db, id, completed ? 'planned' : 'completed');
    bump();
  };

  return (
    <Screen
      title="Meals"
      subtitle={relativeDayLabel(selected, today)}
      onRefresh={range.reload}
      accessory={
        <View style={styles.accessory}>
          <Pressable onPress={() => router.push('/recipes')} accessibilityRole="button" accessibilityLabel="Browse recipes" hitSlop={8}>
            <Glass interactive style={styles.roundBtn}>
              <Ionicons name="book-outline" size={20} color={colors.text} />
            </Glass>
          </Pressable>
          <Pressable onPress={() => add()} accessibilityRole="button" accessibilityLabel="Add a meal" hitSlop={8}>
            <Glass interactive style={styles.roundBtn}>
              <Ionicons name="add" size={26} color={colors.text} />
            </Glass>
          </Pressable>
        </View>
      }>
      <Glass style={styles.strip}>
        <Pressable onPress={() => setSelected(addDays(selected, -7))} hitSlop={8} accessibilityLabel="Previous week" accessibilityRole="button" style={styles.arrow}>
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </Pressable>
        {week.map(({ date, meals }) => {
          const isSel = date === selected;
          const isToday = date === today;
          return (
            <Pressable
              key={date}
              onPress={() => setSelected(date)}
              style={[styles.day, isSel && styles.daySelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={`${relativeDayLabel(date, today)}, ${meals.length} meal${meals.length === 1 ? '' : 's'}`}>
              <Text variant="caption" tone={isSel ? 'primary' : 'secondary'}>
                {shortWeekday(date)}
              </Text>
              <Text variant="headline" style={{ color: isSel ? colors.onSelection : isToday ? colors.accent : colors.text }}>
                {dayOfMonth(date)}
              </Text>
              <View style={[styles.dot, { opacity: meals.length ? 1 : 0, backgroundColor: isSel ? colors.onSelection : colors.accent }]} />
            </Pressable>
          );
        })}
        <Pressable onPress={() => setSelected(addDays(selected, 7))} hitSlop={8} accessibilityLabel="Next week" accessibilityRole="button" style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      </Glass>
      {selected !== today && (
        <Pressable onPress={() => setSelected(today)} accessibilityRole="button" style={styles.jump}>
          <Text variant="subhead" tone="accent">
            Jump to today
          </Text>
        </Pressable>
      )}

      <Text variant="footnote" tone="secondary" style={styles.summary}>
        {dayTotal === 0 ? 'Nothing planned yet' : `${dayTotal} meal${dayTotal === 1 ? '' : 's'} planned · tap a meal to change it`}
      </Text>

      {MEAL_CATEGORIES.map((cat) => {
        const items = dayMeals.filter((m) => m.mealCategory === cat);
        return (
          <Section key={cat} title={categoryLabel(cat)} actionLabel="Add" onAction={() => add(cat)}>
            {items.length === 0 ? (
              <Pressable onPress={() => add(cat)} accessibilityRole="button" accessibilityLabel={`Plan ${cat}`}>
                <Glass style={styles.emptySlot}>
                  <Ionicons name="add-circle-outline" size={20} color={colors.textTertiary} />
                  <Text variant="subhead" tone="tertiary">
                    Plan {cat}
                  </Text>
                </Glass>
              </Pressable>
            ) : (
              <Glass style={styles.card}>
                {items.map((m, i) => (
                  <View key={m.id}>
                    {i > 0 && <Divider />}
                    <MealRow meal={m} showCategory={false} onToggleDone={() => toggleDone(m.id, m.status === 'completed')} />
                  </View>
                ))}
              </Glass>
            )}
          </Section>
        );
      })}
      {range.error && (
        <Text variant="footnote" tone="danger">
          {range.error}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  accessory: { flexDirection: 'row', gap: spacing.xs },
  roundBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  strip: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: 2, borderRadius: radius.lg },
  arrow: { paddingHorizontal: 4, height: 44, justifyContent: 'center' },
  day: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs, borderRadius: radius.sm, gap: 2 },
  daySelected: { backgroundColor: colors.selection },
  dot: { width: 5, height: 5, borderRadius: 3 },
  jump: { alignSelf: 'center' },
  summary: { textAlign: 'center' },
  card: { borderRadius: 24 },
  emptySlot: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: 24 },
});
