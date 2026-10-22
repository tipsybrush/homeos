import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { formatLongDate, greetingFor, localHour } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, spacing } from '@/core/theme/tokens';
import { routineForDate } from '@/features/exercise/logic';
import { SceneButton } from '@/features/homeassistant/components/SceneButton';
import { friendlyName, isScene, isUnavailable } from '@/features/homeassistant/entities';
import { connectionSummary, useHomeAssistant } from '@/features/homeassistant/HomeAssistantProvider';
import { MealRow } from '@/features/meals/components/MealCard';
import { useMealsForDate } from '@/features/meals/hooks';
import { HeadlineList, LoadState, WeatherCard } from '@/features/news/components';
import { useNews, useWeather } from '@/features/news/useNews';
import { setMealStatus } from '@/features/meals/repository';
import { useToday } from '@/hooks/useToday';
import { Divider, EmptyState, Glass, Row, Screen, Section } from '@/ui';

/** Home answers one question: what does today look like? Everything else lives in its own tab. */
export default function HomeScreen() {
  const db = useDb();
  const { bump } = useDataVersion();
  const { today, now } = useToday();
  const ha = useHomeAssistant();
  const meals = useMealsForDate(today);
  const conn = connectionSummary(ha.mode, ha.status);
  const routine = routineForDate(today);
  const weather = useWeather();
  const news = useNews('top');

  const all = useMemo(() => Object.values(ha.entities), [ha.entities]);
  const scenes = all.filter(isScene);
  // The demo home includes an unavailable device on purpose; only warn about real ones.
  const offline = ha.mode === 'live' ? all.filter((e) => isUnavailable(e) && !isScene(e)) : [];

  const toggleDone = async (id: string, done: boolean) => {
    await setMealStatus(db, id, done ? 'planned' : 'completed');
    bump();
  };

  return (
    <Screen title={greetingFor(localHour(now))} subtitle={formatLongDate(today)} onRefresh={ha.refresh} refreshing={ha.status.kind === 'loading'}>
      {(ha.status.kind === 'error' || offline.length > 0) && (
        <Glass tint={colors.red} style={styles.card}>
          {ha.status.kind === 'error' ? (
            <Row icon="cloud-offline" iconColor={colors.yellow} title={conn.label} subtitle="Tap to check the connection" onPress={() => router.push('/settings/home-assistant')} showChevron />
          ) : (
            <Row
              icon="warning"
              iconColor={colors.yellow}
              title={offline.length === 1 ? `${friendlyName(offline[0]!)} is offline` : `${offline.length} devices are offline`}
              subtitle={offline.length === 1 ? 'Check its power and Wi-Fi' : 'Check their power and Wi-Fi'}
              onPress={() => router.push('/rooms')}
              showChevron
            />
          )}
        </Glass>
      )}

      <Section title="Your briefing" actionLabel="All news" onAction={() => router.push('/news')}>
        <View style={{ gap: spacing.sm }}>
          {weather.data ? <WeatherCard weather={weather.data} compact /> : null}
          {news.data ? <HeadlineList items={news.data.slice(0, 3)} /> : <LoadState loading={news.loading} error={news.error} onRetry={news.refresh} />}
        </View>
      </Section>

      <Section title="Today’s meals" actionLabel="See week" onAction={() => router.push('/meals')}>
        {meals.data.length === 0 && !meals.loading ? (
          <EmptyState icon="restaurant-outline" title="Nothing planned yet" body="Open Meals and your week fills itself." />
        ) : (
          <Glass style={styles.card}>
            {meals.data.map((m, i) => (
              <View key={m.id}>
                {i > 0 && <Divider />}
                <MealRow meal={m} onToggleDone={() => toggleDone(m.id, m.status === 'completed')} />
              </View>
            ))}
          </Glass>
        )}
      </Section>

      <Section title="Today">
        <Glass style={styles.card}>
          <Row
            icon="barbell"
            iconColor={colors.red}
            title={routine ? routine.name : 'Rest day'}
            subtitle={routine ? `${routine.focus} · about ${routine.minutes} min` : 'A walk and a stretch is plenty'}
            onPress={() => router.push('/exercise')}
            showChevron
          />
          <Divider />
          <Row icon="cart" iconColor={colors.green} title="Shopping list" subtitle="What to buy for this week’s meals" onPress={() => router.push('/kitchen')} showChevron />
        </Glass>
      </Section>

      {scenes.length > 0 && (
        <Section title="Scenes" actionLabel="Rooms" onAction={() => router.push('/rooms')}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenes} style={styles.bleed}>
            {scenes.map((s) => (
              <SceneButton key={s.entity_id} scene={s} />
            ))}
          </ScrollView>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24 },
  scenes: { gap: spacing.xs, paddingHorizontal: spacing.md },
  bleed: { marginHorizontal: -spacing.md },
});
