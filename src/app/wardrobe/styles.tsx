import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { ALL_LOOKS, lookPhotos, type Look } from '@/features/wardrobe/looks';
import { Chip, Glass, Text } from '@/ui';

const FILTERS: (Look['occasion'] | 'All')[] = ['All', 'Office', 'Party', 'Church'];

/** Every look to browse, filtered by occasion. */
export default function StylesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const looks = ALL_LOOKS.filter((l) => filter === 'All' || l.occasion === filter);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
        <View style={styles.grid}>
          {looks.map((l) => (
            <Tile key={l.id} look={l} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Tile({ look }: { look: Look & { id: string } }) {
  const [failed, setFailed] = useState(false);
  const photo = lookPhotos(look.id)[0];
  return (
    <Pressable
      style={styles.tile}
      onPress={() => router.push({ pathname: '/wardrobe/look/[id]', params: { id: look.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${look.name}, ${look.occasion}`}>
      <Glass style={styles.tileCard}>
        {photo && !failed ? (
          <Image source={{ uri: photo.uri }} style={styles.tilePhoto} onError={() => setFailed(true)} />
        ) : (
          <View style={[styles.tilePhoto, styles.swatches]}>
            {look.pieces.map((p) => (
              <View key={p.item} style={{ flex: 1, backgroundColor: p.hex }} />
            ))}
          </View>
        )}
        <View style={styles.tileText}>
          <Text variant="caption" tone="secondary">
            {look.occasion.toUpperCase()}
          </Text>
          <Text variant="headline" numberOfLines={2}>
            {look.name}
          </Text>
        </View>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '48%', flexGrow: 1 },
  tileCard: { borderRadius: 20, overflow: 'hidden' },
  tilePhoto: { width: '100%', aspectRatio: 4 / 5, backgroundColor: colors.backgroundElevated },
  swatches: { flexDirection: 'row' },
  tileText: { padding: spacing.sm, gap: 2 },
});
