import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, type as typeScale } from '@/core/theme/tokens';

import { Glass } from './Glass';
import { Text } from './Text';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
};

export function TextField({ label, error, hint, style, ...rest }: Props) {
  return (
    <View style={styles.root}>
      <Text variant="footnote" tone="secondary" style={styles.label}>
        {label}
      </Text>
      <Glass style={[styles.box, error ? { borderColor: colors.red, borderWidth: 1 } : null]}>
        <TextInput
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.selection}
          keyboardAppearance="dark"
          accessibilityLabel={label}
          {...rest}
          style={[styles.input, style]}
        />
      </Glass>
      {error ? (
        <Text variant="footnote" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" tone="tertiary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 6 },
  label: { paddingHorizontal: spacing.xxs },
  box: { borderRadius: radius.sm },
  input: {
    ...typeScale.body,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
});
