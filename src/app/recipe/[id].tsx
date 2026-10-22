import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatLongDate } from '@/core/dates';
import { useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing, webTopInset } from '@/core/theme/tokens';
import { formatAmount } from '@/features/kitchen/logic';
import { RecipeVideo } from '@/features/meals/components/RecipeVideo';
import { DETAILED_STEPS } from '@/features/meals/guides/steps';
import { SWAPS } from '@/features/meals/guides/swaps';
import { photoCreditUrl, recipePhoto, recipeVideo } from '@/features/meals/images';
import { categoryLabel } from '@/features/meals/logic';
import { getMeal, getRecipe } from '@/features/meals/repository';
import type { MealPlanEntryView, Recipe } from '@/features/meals/types';
import { useToday } from '@/hooks/useToday';
import { Button, Divider, Glass, Section, Text } from '@/ui';

/** A recipe to cook from: photo, video, ingredients with swaps, and a step-by-step method. Opened from a planned meal or the recipe list. */
export default function RecipeDetail() {
  const { id, mealId } = useLocalSearchParams<{ id: string; mealId?: string }>();
  const db = useDb();
  const { today } = useToday();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [meal, setMeal] = useState<MealPlanEntryView | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    getRecipe(db, id).then(setRecipe);
    if (mealId) getMeal(db, mealId).then(setMeal);
  }, [db, id, mealId]);

  if (!recipe) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const photo = photoFailed ? null : recipePhoto(recipe.id, 960);
  const credit = photoCreditUrl(recipe.id);
  const video = recipeVideo(recipe.id);
  const guide = DETAILED_STEPS[recipe.id];
  const steps = guide?.steps ?? recipe.instructions;
  const servings = meal?.servings ?? recipe.baseServings;
  const scale = servings / recipe.baseServings;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {photo ? (
          <View style={{ gap: 6 }}>
            <Image source={photo} style={styles.hero} onError={() => setPhotoFailed(true)} accessibilityLabel={`Photo of ${recipe.name}`} />
            {credit ? (
              <Text variant="caption" tone="tertiary" onPress={() => Linking.openURL(credit)} accessibilityRole="link">
                Photo: Wikimedia Commons (photographer and licence)
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={{ gap: 6 }}>
          {meal ? (
            <Text variant="caption" tone="secondary" style={styles.kicker}>
              {`${categoryLabel(meal.mealCategory)} · ${formatLongDate(meal.date)}`.toUpperCase()}
            </Text>
          ) : null}
          <Text variant="largeTitle">{recipe.name}</Text>
          <Text variant="subhead" tone="secondary">
            {recipe.description}
          </Text>
          <View style={styles.facts}>
            <Fact icon="time-outline" label={`${recipe.prepMinutes + recipe.cookMinutes} min`} />
            <Fact icon="people-outline" label={`Serves ${servings}`} />
            <Fact icon="earth-outline" label={recipe.cuisine} />
          </View>
        </View>

        {meal ? (
          <Button label="Change this meal" kind="glass" onPress={() => router.push({ pathname: '/meal/[id]', params: { id: meal.id } })} />
        ) : (
          <Button
            label="Plan this for today"
            kind="primary"
            onPress={() => router.push({ pathname: '/meal/[id]', params: { id: 'new', date: today, recipeId: recipe.id } })}
          />
        )}

        {video ? (
          <Section title="Watch how it’s made">
            <RecipeVideo id={video.id} title={video.title} />
          </Section>
        ) : null}

        <Section title="Ingredients">
          <Glass style={styles.card}>
            {recipe.ingredients.map((ing, i) => {
              const swap = SWAPS[ing.name];
              return (
                <View key={`${ing.ingredientId}-${i}`}>
                  {i > 0 && <Divider />}
                  <View style={styles.ingRow}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="body">
                        {ing.name}
                        {ing.optional ? <Text variant="footnote" tone="tertiary"> (optional)</Text> : null}
                      </Text>
                      {swap ? (
                        <Text variant="footnote" tone="tertiary">
                          No {ing.name.toLowerCase().replace(/ \(.*\)$/, '')}? Use {swap}
                        </Text>
                      ) : null}
                    </View>
                    <Text variant="body" tone="secondary">
                      {formatAmount(Math.round(ing.quantity * scale * 10) / 10, ing.unit)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Glass>
        </Section>

        <Section title="Method">
          <View style={{ gap: spacing.sm }}>
            {steps.map((step, i) => (
              <Glass key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text variant="headline" style={{ color: colors.onSelection }}>
                    {i + 1}
                  </Text>
                </View>
                <Text variant="body" style={{ flex: 1 }}>
                  {step}
                </Text>
              </Glass>
            ))}
            {guide?.tip ? (
              <View style={styles.tip}>
                <Ionicons name="bulb-outline" size={18} color={colors.textSecondary} />
                <Text variant="subhead" tone="secondary" style={{ flex: 1 }}>
                  {guide.tip}
                </Text>
              </View>
            ) : null}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Fact({ icon, label }: { icon: 'time-outline' | 'people-outline' | 'earth-outline'; label: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={15} color={colors.textSecondary} />
      <Text variant="footnote" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.lg },
  hero: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: colors.backgroundElevated },
  kicker: { letterSpacing: 0.6 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: 4 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  card: { borderRadius: 24 },
  ingRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, minHeight: 44, alignItems: 'center' },
  step: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: 20, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.selection, alignItems: 'center', justifyContent: 'center' },
  tip: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.xs, alignItems: 'flex-start' },
});
