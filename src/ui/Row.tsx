import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, minTouch, spacing } from '@/core/theme/tokens';

import { Text } from './Text';

type Props = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  accessibilityHint?: string;
};

/** A grouped-list row for use inside a Glass card. */
export function Row({ icon, iconColor = colors.text, title, subtitle, trailing, onPress, showChevron, accessibilityHint }: Props) {
  const body = (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: iconColor + '2A' }]}>
          <Ionicons name={icon} size={18} color={iconColor} accessibilityElementsHidden />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text variant="body" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouch + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: spacing.md },
});
