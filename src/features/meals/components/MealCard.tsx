import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatNaira } from '@/core/money';
import { colors, spacing } from '@/core/theme/tokens';
import { Text } from '@/ui';

import { categoryLabel, mealTitle } from '../logic';
import type { MealPlanEntryView, MealStatus } from '../types';

const STATUS: Record<MealStatus, { label: string; icon: 'ellipse-outline' | 'flame' | 'checkmark-circle' | 'remove-circle-outline'; color: string }> = {
  planned: { label: 'Planned', icon: 'ellipse-outline', color: colors.textSecondary },
  preparing: { label: 'Preparing', icon: 'flame', color: colors.accent },
  completed: { label: 'Done', icon: 'checkmark-circle', color: colors.green },
  skipped: { label: 'Skipped', icon: 'remove-circle-outline', color: colors.textTertiary },
};

export function statusMeta(status: MealStatus) {
  return STATUS[status];
}

type Props = {
  meal: MealPlanEntryView;
  showCategory?: boolean;
  onToggleDone?: () => void;
};

/** One meal as a row inside a Glass card. Tap opens the editor; the circle marks it done. */
export function MealRow({ meal, showCategory = true, onToggleDone }: Props) {
  const s = STATUS[meal.status];
  const title = mealTitle(meal);
  const meta = [
    showCategory ? categoryLabel(meal.mealCategory) : null,
    meal.scheduledTime,
    `${meal.servings} serving${meal.servings === 1 ? '' : 's'}`,
    meal.estimatedCostKobo != null ? formatNaira(meal.estimatedCostKobo) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggleDone}
        disabled={!onToggleDone}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: meal.status === 'completed' }}
        accessibilityLabel={`Mark ${title} ${meal.status === 'completed' ? 'not done' : 'done'}`}>
        <Ionicons name={s.icon} size={26} color={s.color} />
      </Pressable>
      <Pressable
        style={styles.body}
        onPress={() => router.push({ pathname: '/meal/[id]', params: { id: meal.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${meta}, ${s.label}`}
        accessibilityHint="Opens the meal to edit">
        <Text
          variant="body"
          numberOfLines={1}
          style={meal.status === 'skipped' || meal.status === 'completed' ? { color: colors.textSecondary, textDecorationLine: meal.status === 'skipped' ? 'line-through' : 'none' } : undefined}>
          {title}
        </Text>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {meta}
          {meal.status === 'preparing' ? ' · Preparing' : ''}
        </Text>
      </Pressable>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 56 },
  body: { flex: 1, gap: 2 },
});
