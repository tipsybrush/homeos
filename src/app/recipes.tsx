import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { useRecipes } from '@/features/meals/hooks';
import { AmbientBackground, Divider, Glass, Row } from '@/ui';

export default function RecipesScreen() {
  const recipes = useRecipes();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AmbientBackground />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Glass style={{ borderRadius: 24 }}>
          {recipes.data.map((r, i) => (
            <View key={r.id}>
              {i > 0 && <Divider />}
              <Row
                icon="book-outline"
                iconColor={colors.accent}
                title={r.name}
                subtitle={`${r.cuisine} · ${r.prepMinutes + r.cookMinutes} min · serves ${r.baseServings}`}
                onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}
                showChevron
              />
            </View>
          ))}
        </Glass>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.md } });
