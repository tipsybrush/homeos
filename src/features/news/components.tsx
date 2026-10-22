import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/core/theme/tokens';
import { Divider, Glass, Text } from '@/ui';

import { timeAgo, type NewsItem } from './rss';
import type { Weather } from './weather';

export const openArticle = (url: string) =>
  WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, controlsColor: colors.text }).catch(
    () => undefined,
  );

export function WeatherCard({ weather, compact = false }: { weather: Weather; compact?: boolean }) {
  return (
    <Glass style={styles.weather}>
      <Ionicons name={weather.icon} size={compact ? 30 : 40} color={colors.text} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant={compact ? 'headline' : 'title3'}>
          {weather.place} · {weather.now}°
        </Text>
        <Text variant="footnote" tone="secondary">
          {weather.summary} · H {weather.high}° L {weather.low}° · {weather.rainChance}% rain
        </Text>
        {!compact && (
          <Text variant="footnote" tone="tertiary">
            {weather.advice}
          </Text>
        )}
      </View>
    </Glass>
  );
}

export function HeadlineList({ items }: { items: NewsItem[] }) {
  return (
    <Glass style={styles.card}>
      {items.map((n, i) => (
        <View key={n.link}>
          {i > 0 && <Divider />}
          <Pressable onPress={() => openArticle(n.link)} style={styles.row} accessibilityRole="link" accessibilityHint="Opens the article">
            <Text variant="body" numberOfLines={3}>
              {n.title}
            </Text>
            <Text variant="footnote" tone="tertiary" numberOfLines={1}>
              {[n.source, timeAgo(n.published)].filter(Boolean).join(' · ')}
            </Text>
          </Pressable>
        </View>
      ))}
    </Glass>
  );
}

export function LoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading) return <ActivityIndicator color={colors.textSecondary} style={{ padding: spacing.lg }} />;
  if (!error) return null;
  return (
    <Pressable onPress={onRetry} style={styles.error} accessibilityRole="button">
      <Text variant="subhead" tone="secondary">
        {error}
      </Text>
      <Text variant="subhead">Try again</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  weather: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 24 },
  card: { borderRadius: 24 },
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, gap: 4 },
  error: { alignItems: 'center', gap: 6, padding: spacing.lg },
});
