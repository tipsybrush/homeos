import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { HeadlineList, LoadState, WeatherCard } from '@/features/news/components';
import { TOPICS, type TopicId } from '@/features/news/feeds';
import { useNews, useWeather } from '@/features/news/useNews';
import { Chip } from '@/ui';

/** Daily briefing: Lagos weather, then headlines by topic. Pull down to refresh. */
export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const [topic, setTopic] = useState<TopicId>('top');
  const weather = useWeather();
  const news = useNews(topic);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {weather.data ? <WeatherCard weather={weather.data} /> : <LoadState loading={weather.loading} error={weather.error} onRetry={weather.refresh} />}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {TOPICS.map((t) => (
            <Chip key={t.id} label={t.label} selected={t.id === topic} onPress={() => setTopic(t.id)} />
          ))}
        </ScrollView>
        {news.data && !news.loading ? <HeadlineList items={news.data.slice(0, 20)} /> : <LoadState loading={news.loading} error={news.error} onRetry={news.refresh} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.md },
  chips: { gap: spacing.xs },
});
