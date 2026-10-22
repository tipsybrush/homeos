import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { addDays, dayOfMonth, shortWeekday, weekOf, type DateKey } from '@/core/dates';

import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing } from '@/core/theme/tokens';
import { buyNext, CATEGORY_LABEL, suggestOutfits, WARDROBE_CATEGORIES, type WardrobeItem } from '@/features/wardrobe/logic';
import { deleteWardrobeItem, listWardrobe } from '@/features/wardrobe/repository';
import { LookCard } from '@/features/wardrobe/LookCard';
import { lookFor } from '@/features/wardrobe/looks';
import { useToday } from '@/hooks/useToday';
import { Chip, confirmAsync, Divider, EmptyState, Glass, Screen, Section, Text } from '@/ui';

export default function WardrobeScreen() {
  const db = useDb();
  const { version, bump } = useDataVersion();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const { today } = useToday();
  const [day, setDay] = useState<DateKey | null>(null);
  const [weekShift, setWeekShift] = useState(0);
  const selected = day ?? today;
  const shownWeek = weekOf(addDays(today, weekShift * 7));
  const moveWeek = (by: number) => {
    const next = weekShift + by;
    setWeekShift(next);
    setDay(next === 0 ? today : weekOf(addDays(today, next * 7))[0]!);
  };

  useEffect(() => {
    let live = true;
    listWardrobe(db)
      .then((d) => live && setItems(d))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [db, version]);

  const outfits = suggestOutfits(items);
  const gaps = buyNext(items);

  const remove = async (item: WardrobeItem) => {
    if (!(await confirmAsync('Remove item?', `${item.name} will be removed from your wardrobe.`, 'Remove', true))) return;
    await deleteWardrobeItem(db, item.id);
    bump();
  };

  return (
    <Screen
      title="Wardrobe"
      subtitle={`${items.length} item${items.length === 1 ? '' : 's'}`}
      accessory={
        <Pressable onPress={() => router.push('/wardrobe/add')} accessibilityRole="button" accessibilityLabel="Add clothing" hitSlop={8}>
          <Glass interactive style={styles.roundBtn}>
            <Ionicons name="add" size={26} color={colors.text} />
          </Glass>
        </Pressable>
      }>
      <Section title="Style of the day" actionLabel="More styles" onAction={() => router.push('/wardrobe/styles')}>
        <View style={{ gap: spacing.sm }}>
          <View style={styles.weekNav}>
            <Pressable onPress={() => moveWeek(-1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous week">
              <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
            </Pressable>
            <Text variant="subhead" tone="secondary">
              {weekShift === 0 ? 'This week' : weekShift === -1 ? 'Last week' : weekShift === 1 ? 'Next week' : `Week of ${dayOfMonth(shownWeek[0]!)} ${shortMonth(shownWeek[0]!)}`}
            </Text>
            <Pressable onPress={() => moveWeek(1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Next week">
              <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            {shownWeek.map((d) => (
              <Chip key={d} label={d === today ? 'Today' : `${shortWeekday(d)} ${dayOfMonth(d)}`} selected={d === selected} onPress={() => setDay(d)} />
            ))}
          </ScrollView>
          <LookCard look={lookFor(selected)} items={items} />
        </View>
      </Section>

      <Section title="From your wardrobe today">
        {outfits.length === 0 ? (
          <EmptyState icon="shirt-outline" title="Add a top, trousers and shoes" body="Outfits are built only from clothes you own." />
        ) : (
          outfits.map((o, i) => (
            <Glass key={o.top.id} style={styles.outfit}>
              <Text variant="caption" tone="secondary">
                {i === 0 ? 'BEST FOR THE HEAT' : `OPTION ${i + 1}`}
              </Text>
              {[o.headwear, o.top, o.bottom, o.shoes].filter(Boolean).map((p) => (
                <Text key={p!.id} variant="body">
                  {p!.name}
                  {p!.colour ? <Text variant="subhead" tone="secondary">{`  ${p!.colour}`}</Text> : null}
                </Text>
              ))}
            </Glass>
          ))
        )}
      </Section>

      {gaps.length > 0 && (
        <Section title="What to buy next">
          <Glass style={styles.card}>
            {gaps.map((g, i) => (
              <View key={g.category}>
                {i > 0 && <Divider />}
                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="body">{g.idea}</Text>
                    <Text variant="footnote" tone="secondary">
                      {CATEGORY_LABEL[g.category]}: you have {g.have} of {g.want}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Glass>
        </Section>
      )}

      {WARDROBE_CATEGORIES.map((c) => {
        const list = items.filter((i) => i.category === c);
        if (!list.length) return null;
        return (
          <Section key={c} title={CATEGORY_LABEL[c]}>
            <Glass style={styles.card}>
              {list.map((item, i) => (
                <View key={item.id}>
                  {i > 0 && <Divider />}
                  <Pressable onLongPress={() => remove(item)} style={styles.row} accessibilityHint="Touch and hold to remove">
                    <Text variant="body" style={{ flex: 1 }}>
                      {item.name}
                    </Text>
                    <Text variant="subhead" tone="secondary">
                      {[item.colour, item.lightFabric ? 'light' : null].filter(Boolean).join(' · ')}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </Glass>
          </Section>
        );
      })}
    </Screen>
  );
}

const shortMonth = (d: DateKey) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });

const styles = StyleSheet.create({
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  roundBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  outfit: { borderRadius: radius.lg, padding: spacing.md, gap: 4, marginBottom: spacing.xs },
  card: { borderRadius: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48 },
});
