import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, radius, spacing } from '@/core/theme/tokens';
import { buyNext, CATEGORY_LABEL, suggestOutfits, WARDROBE_CATEGORIES, type WardrobeItem } from '@/features/wardrobe/logic';
import { deleteWardrobeItem, listWardrobe } from '@/features/wardrobe/repository';
import { confirmAsync, Divider, EmptyState, Glass, Screen, Section, Text } from '@/ui';

export default function WardrobeScreen() {
  const db = useDb();
  const { version, bump } = useDataVersion();
  const [items, setItems] = useState<WardrobeItem[]>([]);

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
      <Section title="Outfits for today">
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

const styles = StyleSheet.create({
  roundBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  outfit: { borderRadius: radius.lg, padding: spacing.md, gap: 4, marginBottom: spacing.xs },
  card: { borderRadius: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48 },
});
