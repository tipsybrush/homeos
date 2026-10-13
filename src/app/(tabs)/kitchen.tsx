import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/core/theme/tokens';
import { EmptyState, Glass, Row, Screen, Divider } from '@/ui';

const COMING = [
  { icon: 'cube-outline', title: 'Kitchen inventory', subtitle: 'What you have, where it is, when it expires' },
  { icon: 'search-outline', title: 'What can I cook with what I have?', subtitle: 'Matches recipes to your inventory, no AI needed' },
  { icon: 'cart-outline', title: 'Shopping list', subtitle: 'Built from your meal plan, minus what you already have' },
  { icon: 'wallet-outline', title: 'Naira budget', subtitle: 'Weekly and monthly grocery spend, prices you enter' },
] as const;

export default function KitchenScreen() {
  return (
    <Screen title="Kitchen">
      <EmptyState icon="basket-outline" title="Coming in the next build" body="Your meal plan is ready. Inventory and groceries plug into it next." />
      <Glass style={styles.card}>
        {COMING.map((c, i) => (
          <View key={c.title}>
            {i > 0 && <Divider />}
            <Row icon={c.icon} iconColor={colors.green} title={c.title} subtitle={c.subtitle} />
          </View>
        ))}
      </Glass>
    </Screen>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: 24, marginTop: spacing.xs } });
