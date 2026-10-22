import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';

import { Text } from './Text';

type Props = {
  title?: string;
  subtitle?: string;
  /** Rendered to the right of the large title. */
  accessory?: ReactNode;
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
};

/** A scrolling tab screen with an iOS-style large title over the ambient background. */
export function Screen({ title, subtitle, accessory, children, onRefresh, refreshing = false }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md + webTopInset, paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} /> : undefined
        }>
        {title ? (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {subtitle ? (
                <Text variant="footnote" tone="secondary" style={styles.subtitle}>
                  {subtitle.toUpperCase()}
                </Text>
              ) : null}
              <Text variant="largeTitle" accessibilityRole="header">
                {title}
              </Text>
            </View>
            {accessory}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  headerText: { flex: 1 },
  subtitle: { letterSpacing: 0.6, marginBottom: 2 },
});
