import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/tokens';

import { Text } from './Text';

export type StatusTone = 'ok' | 'warn' | 'error' | 'neutral' | 'info';

const toneColor: Record<StatusTone, string> = {
  ok: colors.green,
  warn: colors.yellow,
  error: colors.red,
  neutral: colors.gray,
  info: colors.blue,
};

/** Status is never colour-only: the label always carries the meaning. */
export function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const c = toneColor[tone];
  return (
    <View style={[styles.pill, { backgroundColor: c + '26', borderColor: c + '66' }]} accessibilityLabel={`Status: ${label}`}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text variant="caption" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
