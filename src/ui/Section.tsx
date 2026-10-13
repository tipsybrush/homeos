import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/core/theme/tokens';

import { Text } from './Text';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
};

export function Section({ title, actionLabel, onAction, children }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text variant="title3" accessibilityRole="header">
          {title}
        </Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button">
            <Text variant="subhead" tone="accent">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: spacing.xxs },
});
