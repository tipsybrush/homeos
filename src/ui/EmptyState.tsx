import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/core/theme/tokens';

import { Glass } from './Glass';
import { Text } from './Text';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body?: string;
  children?: React.ReactNode;
};

export function EmptyState({ icon, title, body, children }: Props) {
  return (
    <Glass style={styles.root}>
      <Ionicons name={icon} size={28} color={colors.textSecondary} accessibilityElementsHidden />
      <View style={styles.text}>
        <Text variant="headline" style={styles.center}>
          {title}
        </Text>
        {body ? (
          <Text variant="subhead" tone="secondary" style={styles.center}>
            {body}
          </Text>
        ) : null}
      </View>
      {children}
    </Glass>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  text: { gap: 4 },
  center: { textAlign: 'center' },
});
