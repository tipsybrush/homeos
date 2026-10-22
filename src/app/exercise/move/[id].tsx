import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { MOVES } from '@/features/exercise/moves';
import { MOVE_VIDEOS } from '@/features/exercise/videos';
import { RecipeVideo } from '@/features/meals/components/RecipeVideo';
import { Glass, Section, Text } from '@/ui';

/** How to do one move: video, steps, the key cue, and easier/harder versions. */
export default function MoveScreen() {
  const { id, amount } = useLocalSearchParams<{ id: string; amount?: string }>();
  const insets = useSafeAreaInsets();
  const move = MOVES[id];
  if (!move) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  const video = MOVE_VIDEOS[id];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={{ gap: 6 }}>
          <Text variant="largeTitle">{move.name}</Text>
          <Text variant="subhead" tone="secondary">
            {amount ? `${amount} · ${move.works}` : move.works}
          </Text>
        </View>

        {video ? <RecipeVideo id={video.id} title={video.title} /> : null}

        <Section title="How to do it">
          <View style={{ gap: spacing.sm }}>
            {move.steps.map((s, i) => (
              <Glass key={i} style={styles.step}>
                <View style={styles.num}>
                  <Text variant="headline" style={{ color: colors.onSelection }}>
                    {i + 1}
                  </Text>
                </View>
                <Text variant="body" style={{ flex: 1 }}>
                  {s}
                </Text>
              </Glass>
            ))}
          </View>
        </Section>

        <Glass style={styles.cue}>
          <Ionicons name="checkmark-done" size={20} color={colors.green} />
          <Text variant="body" style={{ flex: 1 }}>
            {move.cue}
          </Text>
        </Glass>

        <Section title="Make it fit you">
          <Glass style={styles.card}>
            <Variant icon="trending-down" label="Easier" text={move.easier} />
            <Variant icon="trending-up" label="Harder" text={move.harder} />
          </Glass>
        </Section>
      </ScrollView>
    </View>
  );
}

function Variant({ icon, label, text }: { icon: 'trending-down' | 'trending-up'; label: string; text: string }) {
  return (
    <View style={styles.variant}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline">{label}</Text>
        <Text variant="subhead" tone="secondary">
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.lg },
  step: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: 20, alignItems: 'flex-start' },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.selection, alignItems: 'center', justifyContent: 'center' },
  cue: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: 20, alignItems: 'flex-start' },
  card: { borderRadius: 24, paddingVertical: spacing.xs },
  variant: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'flex-start' },
});
