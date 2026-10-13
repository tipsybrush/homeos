import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/tokens';
import { Divider, Glass, Text } from '@/ui';

import type { RecipeSummary } from '../types';

/** "Try this week": the week's delicacy and new dish, each opening its recipe. */
export function WeeklyPicks({ picks }: { picks: RecipeSummary[] }) {
  if (picks.length === 0) return null;
  return (
    <Glass tint={colors.accent} style={styles.card}>
      {picks.map((r, i) => (
        <View key={r.id}>
          {i > 0 && <Divider />}
          <Pressable
            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={`Try this week: ${r.name}`}>
            <View style={styles.icon}>
              <Ionicons name={r.tags.includes('try-new') ? 'compass' : 'star'} size={18} color="#000" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="accent">
                {r.tags.includes('try-new') ? 'NEW TO TRY' : 'THIS WEEK’S SPECIAL'}
              </Text>
              <Text variant="headline" numberOfLines={1}>
                {r.name}
              </Text>
              <Text variant="footnote" tone="secondary" numberOfLines={1}>
                {r.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      ))}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
