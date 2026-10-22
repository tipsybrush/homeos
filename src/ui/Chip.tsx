import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/tokens';

import { Glass } from './Glass';
import { Text } from './Text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Chip({ label, selected, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={4}>
      {selected ? (
        <View style={[styles.chip, styles.selected]}>
          <Text variant="subhead" style={{ color: colors.onSelection, fontWeight: '600' }}>
            {label}
          </Text>
        </View>
      ) : (
        <Glass interactive style={styles.chip}>
          <Text variant="subhead" style={{ color: colors.textSecondary }}>
            {label}
          </Text>
        </Glass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.selection,
  },
});
