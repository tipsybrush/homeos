import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { LookCard } from '@/features/wardrobe/LookCard';
import type { WardrobeItem } from '@/features/wardrobe/logic';
import { lookById } from '@/features/wardrobe/looks';
import { listWardrobe } from '@/features/wardrobe/repository';

export default function LookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const { version } = useDataVersion();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  useEffect(() => {
    listWardrobe(db).then(setItems).catch(() => undefined);
  }, [db, version]);
  const look = lookById(id);
  if (!look) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <LookCard look={look} items={items} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset },
});
