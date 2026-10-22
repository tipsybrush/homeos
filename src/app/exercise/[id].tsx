import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { MOVES } from '@/features/exercise/moves';
import { HEAT_TIP, ROUTINES } from '@/features/exercise/routines';
import { Divider, Glass, Row, Section, Text } from '@/ui';

/** One session, block by block. Each move opens its how-to with a video. */
export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const routine = ROUTINES.find((r) => r.id === id);
  if (!routine) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={{ gap: 6 }}>
          <Text variant="caption" tone="secondary" style={styles.kicker}>
            {`${routine.focus} · ${routine.minutes} min`.toUpperCase()}
          </Text>
          <Text variant="largeTitle">{routine.name}</Text>
          <Text variant="subhead" tone="secondary">
            {routine.goal}
          </Text>
        </View>

        {routine.blocks.map((b) => (
          <Section key={b.title} title={b.title}>
            <View style={{ gap: spacing.xs }}>
              {b.note ? (
                <View style={styles.note}>
                  <Ionicons name="timer-outline" size={16} color={colors.textSecondary} />
                  <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
                    {b.note}
                  </Text>
                </View>
              ) : null}
              <Glass style={styles.card}>
                {b.items.map((it, i) => {
                  const m = MOVES[it.move]!;
                  return (
                    <View key={`${it.move}-${i}`}>
                      {i > 0 && <Divider />}
                      <Row
                        icon="play-circle"
                        iconColor={colors.red}
                        title={m.name}
                        subtitle={`${it.amount} · ${m.works}`}
                        onPress={() => router.push({ pathname: '/exercise/move/[id]', params: { id: it.move, amount: it.amount } })}
                        showChevron
                      />
                    </View>
                  );
                })}
              </Glass>
            </View>
          </Section>
        ))}
        <Text variant="footnote" tone="tertiary">
          {HEAT_TIP} Tap any move to see how to do it.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.lg },
  kicker: { letterSpacing: 0.6 },
  note: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingHorizontal: 4 },
  card: { borderRadius: 24 },
});
