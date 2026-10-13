import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { formatLongDate, greetingFor, localHour } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, spacing } from '@/core/theme/tokens';
import { DeviceTile } from '@/features/homeassistant/components/DeviceTile';
import { SceneButton } from '@/features/homeassistant/components/SceneButton';
import { friendlyName, isOn, isScene, isToggleable, isUnavailable } from '@/features/homeassistant/entities';
import { connectionSummary, useHomeAssistant } from '@/features/homeassistant/HomeAssistantProvider';
import { MealRow } from '@/features/meals/components/MealCard';
import { useMealsForDate } from '@/features/meals/hooks';
import { mealTitle, upcomingToday } from '@/features/meals/logic';
import { setMealStatus } from '@/features/meals/repository';
import { useRoomsAndRefs } from '@/features/rooms/hooks';
import { useToday } from '@/hooks/useToday';
import { Button, Divider, EmptyState, Glass, Row, Screen, Section, StatusPill, Text } from '@/ui';

export default function HomeScreen() {
  const db = useDb();
  const { bump } = useDataVersion();
  const { today, nowMinutes, now } = useToday();
  const ha = useHomeAssistant();
  const meals = useMealsForDate(today);
  const { rooms, refs } = useRoomsAndRefs();
  const conn = connectionSummary(ha.mode, ha.status);

  const all = useMemo(() => Object.values(ha.entities), [ha.entities]);
  const scenes = all.filter(isScene);
  const pinnedIds = refs.filter((r) => r.pinned).map((r) => r.entityId);
  const pinned = pinnedIds.map((id) => ha.entities[id]).filter((e) => !!e);
  const quickDevices = pinned.length ? pinned : all.filter(isToggleable).slice(0, 4);
  const upcoming = upcomingToday(meals.data, nowMinutes);

  const unavailable = all.filter((e) => isUnavailable(e) && !isScene(e));
  const alerts: { key: string; icon: 'warning' | 'cloud-offline'; title: string; body?: string; onPress?: () => void }[] = [];
  if (ha.status.kind === 'error') {
    alerts.push({ key: 'conn', icon: 'cloud-offline', title: conn.label, body: ha.status.message, onPress: () => router.push('/settings/home-assistant') });
  }
  for (const e of unavailable) {
    alerts.push({ key: e.entity_id, icon: 'warning', title: `${friendlyName(e)} is unavailable`, body: 'Check its power and Wi-Fi.' });
  }

  const roomSummary = rooms
    .map((room) => {
      const ids = refs.filter((r) => r.roomId === room.id).map((r) => r.entityId);
      const ents = ids.map((id) => ha.entities[id]).filter((e) => !!e);
      return { room, total: ents.length, on: ents.filter(isOn).length };
    })
    .filter((r) => r.total > 0);

  const toggleDone = async (id: string, done: boolean) => {
    await setMealStatus(db, id, done ? 'planned' : 'completed');
    bump();
  };

  return (
    <Screen
      title={greetingFor(localHour(now))}
      subtitle={formatLongDate(today)}
      onRefresh={ha.refresh}
      refreshing={ha.status.kind === 'loading'}>
      <Pressable onPress={() => router.push('/settings/home-assistant')} accessibilityRole="button" accessibilityHint="Opens smart-home connection settings">
        <StatusPill label={conn.label} tone={conn.tone} />
      </Pressable>

      {alerts.length > 0 && (
        <Glass tint={colors.red} style={styles.card}>
          {alerts.map((a, i) => (
            <View key={a.key}>
              {i > 0 && <Divider />}
              <Row icon={a.icon} iconColor={colors.yellow} title={a.title} subtitle={a.body} onPress={a.onPress} showChevron={!!a.onPress} />
            </View>
          ))}
        </Glass>
      )}

      {scenes.length > 0 && (
        <Section title="Scenes">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenes} style={styles.bleed}>
            {scenes.map((s) => (
              <SceneButton key={s.entity_id} scene={s} />
            ))}
          </ScrollView>
        </Section>
      )}

      <Section title="Today’s meals" actionLabel="Plan" onAction={() => router.push('/meals')}>
        {meals.data.length === 0 && !meals.loading ? (
          <EmptyState icon="restaurant-outline" title="Nothing planned yet" body="Add breakfast, lunch or dinner for today.">
            <Button label="Add a meal" kind="primary" onPress={() => router.push({ pathname: '/meal/[id]', params: { id: 'new', date: today } })} />
          </EmptyState>
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

      {upcoming.length > 0 && (
        <Section title="Up next">
          <Glass style={styles.card}>
            {upcoming.slice(0, 3).map((m, i) => (
              <View key={m.id}>
                {i > 0 && <Divider />}
                <Row icon="alarm-outline" iconColor={colors.teal} title={mealTitle(m)} subtitle={`${m.scheduledTime} · ${m.mealCategory}`} />
              </View>
            ))}
          </Glass>
        </Section>
      )}

      {quickDevices.length > 0 && (
        <Section title="Devices" actionLabel="Rooms" onAction={() => router.push('/rooms')}>
          <View style={styles.grid}>
            {quickDevices.map((e) => (
              <DeviceTile key={e.entity_id} entity={e} />
            ))}
          </View>
        </Section>
      )}

      {roomSummary.length > 0 && (
        <Section title="Rooms">
          <Glass style={styles.card}>
            {roomSummary.map(({ room, total, on }, i) => (
              <View key={room.id}>
                {i > 0 && <Divider />}
                <Row
                  icon={room.icon as never}
                  iconColor={on > 0 ? colors.yellow : colors.textSecondary}
                  title={room.name}
                  subtitle={on > 0 ? `${on} of ${total} on` : `All ${total} off`}
                  onPress={() => router.push('/rooms')}
                  showChevron
                />
              </View>
            ))}
          </Glass>
        </Section>
      )}

      <Section title="Energy">
        <Glass style={[styles.card, styles.energy]}>
          <Ionicons name="flash-outline" size={22} color={colors.textSecondary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">No energy monitoring yet</Text>
            <Text variant="footnote" tone="secondary">
              HomeOS only shows real readings. Add an energy-monitoring plug or a supported inverter integration and it will appear here.
            </Text>
          </View>
        </Glass>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24 },
  scenes: { gap: spacing.xs, paddingHorizontal: spacing.md },
  bleed: { marginHorizontal: -spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, justifyContent: 'space-between' },
  energy: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, alignItems: 'flex-start' },
});
