import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, minTouch, radius, spacing } from '@/core/theme/tokens';

import { Glass } from './Glass';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'glass' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({ label, onPress, kind = 'glass', disabled, loading, style, accessibilityHint }: Props) {
  const handlePress = () => {
    void Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };
  const inert = disabled || loading;
  const content = loading ? (
    <ActivityIndicator color={kind === 'primary' ? '#000' : colors.text} />
  ) : (
    <Text variant="headline" style={{ color: kind === 'primary' ? '#000' : kind === 'destructive' ? colors.red : colors.text }}>
      {label}
    </Text>
  );
  return (
    <Pressable
      onPress={handlePress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      style={({ pressed }) => [{ opacity: inert ? 0.45 : pressed ? 0.8 : 1 }, style]}>
      {kind === 'primary' ? (
        <View style={[styles.base, { backgroundColor: colors.accent }]}>{content}</View>
      ) : (
        <Glass interactive style={styles.base}>
          {content}
        </Glass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouch + 6,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
