import { Pressable, StyleSheet } from 'react-native';

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
      <Glass interactive tint={selected ? colors.selection : undefined} style={[styles.chip, selected && styles.selected]}>
        <Text variant="subhead" style={{ color: selected ? colors.text : colors.textSecondary, fontWeight: selected ? '600' : '400' }}>
          {label}
        </Text>
      </Glass>
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
    borderColor: colors.selection,
  },
});
