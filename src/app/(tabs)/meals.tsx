import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { addDays, dayOfMonth, relativeDayLabel, shortWeekday, weekOf, type DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing } from '@/core/theme/tokens';
import { MealRow } from '@/features/meals/components/MealCard';
import { useMealsInRange } from '@/features/meals/hooks';
import { buildWeek, categoryLabel, mealTitle } from '@/features/meals/logic';
import { setMealStatus } from '@/features/meals/repository';
import { MEAL_CATEGORIES } from '@/features/meals/types';
import { useToday } from '@/hooks/useToday';
import { Chip, Divider, Glass, Screen, Section, Text } from '@/ui';

type View_ = 'day' | 'week';

export default function MealsScreen() {
  const db = useDb();
  const { bump } = useDataVersion();
  const { today } = useToday();
  const [selected, setSelected] = useState<DateKey>(today);
  const [view, setView] = useState<View_>('day');
  const days = weekOf(selected);
  const range = useMealsInRange(days[0]!, days[6]!);
  const week = buildWeek(days, range.data);
  const dayMeals = week.find((d) => d.date === selected)?.meals ?? [];

  const add = (category?: string, date: DateKey = selected) =>
    router.push({ pathname: '/meal/[id]', params: { id: 'new', date, ...(category ? { category } : {}) } });

  const toggleDone = async (id: string, completed: boolean) => {
    await setMealStatus(db, id, completed ? 'planned' : 'completed');
    bump();
  };

  const categories = [...MEAL_CATEGORIES, ...new Set(dayMeals.map((m) => m.mealCategory).filter((c) => !(MEAL_CATEGORIES as readonly string[]).includes(c)))];

  return (
    <Screen
      title="Meals"
      subtitle={relativeDayLabel(selected, today)}
      onRefresh={range.reload}
      accessory={
        <Pressable onPress={() => add()} accessibilityRole="button" accessibilityLabel="Add a meal" hitSlop={8}>
          <Glass interactive style={styles.addBtn}>
            <Ionicons name="add" size={26} color={colors.text} />
          </Glass>
        </Pressable>
      }>
      <View style={styles.toggleRow}>
        <Chip label="Day" selected={view === 'day'} onPress={() => setView('day')} />
        <Chip label="Week" selected={view === 'week'} onPress={() => setView('week')} />
        <View style={{ flex: 1 }} />
        <Chip label="Recipes" onPress={() => router.push('/recipes')} />
      </View>

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
              <Text variant="headline" style={{ color: isSel ? '#000' : isToday ? colors.accent : colors.text }}>
                {dayOfMonth(date)}
              </Text>
              <View style={[styles.dot, { opacity: meals.length ? 1 : 0, backgroundColor: isSel ? '#000' : colors.accent }]} />
            </Pressable>
          );
        })}
        <Pressable onPress={() => setSelected(addDays(selected, 7))} hitSlop={8} accessibilityLabel="Next week" accessibilityRole="button" style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      </Glass>
      {selected !== today && (
        <Pressable onPress={() => setSelected(today)} accessibilityRole="button" style={{ alignSelf: 'center' }}>
          <Text variant="subhead" tone="accent">
            Jump to today
          </Text>
        </Pressable>
      )}

      {view === 'day'
        ? categories.map((cat) => {
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
          })
        : week.map(({ date, meals }) => (
            <Section key={date} title={relativeDayLabel(date, today)} actionLabel="Add" onAction={() => add(undefined, date)}>
              <Glass style={styles.card}>
                {meals.length === 0 ? (
                  <Text variant="subhead" tone="tertiary" style={{ padding: spacing.md }}>
                    No meals planned
                  </Text>
                ) : (
                  meals.map((m, i) => (
                    <View key={m.id}>
                      {i > 0 && <Divider />}
                      <Pressable
                        onPress={() => router.push({ pathname: '/meal/[id]', params: { id: m.id } })}
                        style={styles.weekRow}
                        accessibilityRole="button"
                        accessibilityLabel={`${categoryLabel(m.mealCategory)}: ${mealTitle(m)}`}>
                        <Text variant="footnote" tone="secondary" style={styles.weekCat}>
                          {categoryLabel(m.mealCategory)}
                        </Text>
                        <Text variant="body" numberOfLines={1} style={{ flex: 1 }}>
                          {mealTitle(m)}
                        </Text>
                        {m.status === 'completed' && <Ionicons name="checkmark-circle" size={18} color={colors.green} />}
                      </Pressable>
                    </View>
                  ))
                )}
              </Glass>
            </Section>
          ))}
      {range.error && (
        <Text variant="footnote" tone="danger">
          {range.error}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  strip: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: 2, borderRadius: radius.lg },
  arrow: { paddingHorizontal: 4, height: 44, justifyContent: 'center' },
  day: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs, borderRadius: radius.sm, gap: 2 },
  daySelected: { backgroundColor: colors.selection },
  dot: { width: 5, height: 5, borderRadius: 3 },
  card: { borderRadius: 24 },
  emptySlot: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.md, borderRadius: 24 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 48 },
  weekCat: { width: 74 },
});
