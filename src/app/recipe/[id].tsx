import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDb } from '@/core/db/DatabaseProvider';
import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { categoryLabel } from '@/features/meals/logic';
import { getRecipe } from '@/features/meals/repository';
import type { Recipe } from '@/features/meals/types';
import { useToday } from '@/hooks/useToday';
import { AmbientBackground, Button, Divider, Glass, Section, Text } from '@/ui';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const { today } = useToday();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    getRecipe(db, id).then(setRecipe);
  }, [db, id]);

  if (!recipe) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AmbientBackground />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={{ gap: 4 }}>
          <Text variant="largeTitle">{recipe.name}</Text>
          <Text variant="subhead" tone="secondary">
            {recipe.description}
          </Text>
          <Text variant="footnote" tone="tertiary">
            {recipe.cuisine} · prep {recipe.prepMinutes} min · cook {recipe.cookMinutes} min · serves {recipe.baseServings}
            {recipe.mealCategories.length ? ` · ${recipe.mealCategories.map(categoryLabel).join(', ')}` : ''}
          </Text>
        </View>

        <Button
          label="Plan this for today"
          kind="primary"
          onPress={() => router.push({ pathname: '/meal/[id]', params: { id: 'new', date: today, recipeId: recipe.id } })}
        />

        <Section title="Ingredients">
          <Glass style={styles.card}>
            {recipe.ingredients.map((ing, i) => (
              <View key={`${ing.ingredientId}-${i}`}>
                {i > 0 && <Divider />}
                <View style={styles.ingRow}>
                  <Text variant="body" style={{ flex: 1 }}>
                    {ing.name}
                    {ing.optional ? <Text variant="footnote" tone="tertiary"> (optional)</Text> : null}
                  </Text>
                  <Text variant="body" tone="secondary">
                    {ing.quantity} {ing.unit}
                  </Text>
                </View>
              </View>
            ))}
          </Glass>
        </Section>

        <Section title="Method">
          <Glass style={[styles.card, { padding: spacing.md, gap: spacing.sm }]}>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.step}>
                <Text variant="headline" tone="accent" style={{ width: 22 }}>
                  {i + 1}
                </Text>
                <Text variant="body" style={{ flex: 1 }}>
                  {step}
                </Text>
              </View>
            ))}
          </Glass>
        </Section>
        {recipe.source ? (
          <Text variant="footnote" tone="tertiary">
            {recipe.source}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.lg },
  card: { borderRadius: 24 },
  ingRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, minHeight: 44, alignItems: 'center' },
  step: { flexDirection: 'row', gap: spacing.xs },
});
