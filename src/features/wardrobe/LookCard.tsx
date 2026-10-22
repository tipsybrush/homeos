import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/tokens';
import { openArticle } from '@/features/news/components';
import { Button, Glass, Text } from '@/ui';

import { inspirationUrl, lookPhotos, ownedMatch, type Look } from './looks';
import type { WardrobeItem } from './logic';

/** One day's look: colour strip, the pieces (marked when you already own something like it), the fun twist and real-photo inspiration. */
export function LookCard({ look, items }: { look: Look & { id: string }; items: WardrobeItem[] }) {
  return (
    <Glass style={styles.card}>
      <LookPhotos id={look.id} />
      <View style={styles.strip}>
        {look.pieces.map((p) => (
          <View key={p.item} style={[styles.swatch, { backgroundColor: p.hex }]} />
        ))}
      </View>
      <View style={{ gap: 4 }}>
        <Text variant="caption" tone="secondary" style={styles.kicker}>
          {look.occasion.toUpperCase()}
        </Text>
        <Text variant="title2">{look.name}</Text>
        <Text variant="subhead" tone="secondary">
          {look.vibe}
        </Text>
      </View>
      <View style={{ gap: spacing.xs }}>
        {look.pieces.map((p) => {
          const own = ownedMatch(p, items);
          return (
            <View key={p.item} style={styles.piece}>
              <View style={[styles.dot, { backgroundColor: p.hex }]} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.item}</Text>
                <Text variant="footnote" tone={own ? 'success' : 'tertiary'}>
                  {own ? `You have: ${own.name}` : p.colour}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.twist}>
        <Ionicons name="sparkles-outline" size={18} color={colors.textSecondary} />
        <Text variant="subhead" style={{ flex: 1 }}>
          {look.twist}
        </Text>
      </View>
      <Button label="See real outfits like this" kind="glass" onPress={() => openArticle(inspirationUrl(look))} />
    </Glass>
  );
}

/** Swipeable real photos for a look. Photos that fail to load are dropped. */
export function LookPhotos({ id, height = 360 }: { id: string; height?: number }) {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const photos = lookPhotos(id).filter((p) => !failed.has(p.uri));
  if (photos.length === 0) return null;
  return (
    <View style={{ gap: 4 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
        {photos.map((p) => (
          <Pressable key={p.uri} onPress={() => openArticle(p.page)} accessibilityRole="imagebutton" accessibilityLabel="Outfit photo on Pexels">
            <Image
              source={{ uri: p.uri }}
              style={[styles.photo, { height, width: photos.length === 1 ? undefined : height * 0.75, aspectRatio: photos.length === 1 ? 4 / 5 : undefined }]}
              onError={() => setFailed((f) => new Set(f).add(p.uri))}
            />
          </Pressable>
        ))}
      </ScrollView>
      <Text variant="caption" tone="tertiary">
        Photos: Pexels. Tap a photo to see who took it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { borderRadius: 18, backgroundColor: colors.backgroundElevated },
  card: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  strip: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' },
  swatch: { flex: 1 },
  kicker: { letterSpacing: 0.6 },
  piece: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder },
  twist: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
});
