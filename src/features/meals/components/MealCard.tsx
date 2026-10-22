import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { formatNaira } from '@/core/money';
import { colors, spacing } from '@/core/theme/tokens';
import { Text } from '@/ui';

import { categoryLabel, mealTitle } from '../logic';
import { recipePhoto } from '../images';
import type { MealCategory, MealPlanEntryView, MealStatus } from '../types';

const CATEGORY_ICON: Record<string, 'sunny-outline' | 'restaurant-outline' | 'moon-outline' | 'cafe-outline'> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

/** Recipe photo when one exists, otherwise a tile with the meal's category icon. */
function MealThumb({ recipeId, category }: { recipeId: string | null; category: MealCategory }) {
  // One retry after a pause: the photo host can briefly refuse a burst of requests.
  const [tries, setTries] = useState(0);
  const photo = recipePhoto(recipeId, 180);
  const onError = () => (tries === 0 ? setTimeout(() => setTries(1), 1500) : setTries(2));
  if (photo && tries < 2) return <Image key={tries} source={photo} style={[styles.thumb, styles.thumbFallback]} onError={onError} accessible={false} />;
  return (
    <View style={[styles.thumb, styles.thumbFallback]} accessible={false}>
      <Ionicons name={CATEGORY_ICON[category] ?? 'restaurant-outline'} size={22} color={colors.textSecondary} />
    </View>
  );
}

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

/** One meal as a row inside a Glass card. Tap opens its recipe (or the editor for a custom meal); the circle marks it done. */
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
      <MealThumb recipeId={meal.recipeId} category={meal.mealCategory} />
      <Pressable
        style={styles.body}
        onPress={() =>
          meal.recipeId
            ? router.push({ pathname: '/recipe/[id]', params: { id: meal.recipeId, mealId: meal.id } })
            : router.push({ pathname: '/meal/[id]', params: { id: meal.id } })
        }
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${meta}, ${s.label}`}
        accessibilityHint={meal.recipeId ? "Opens the recipe" : "Opens the meal to edit"}>
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
  thumb: { width: 60, height: 60, borderRadius: 16 },
  thumbFallback: { backgroundColor: colors.glassFillStrong, alignItems: 'center', justifyContent: 'center' },
});
