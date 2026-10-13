import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/tokens';
import { Glass, notify, Text } from '@/ui';

import { friendlyName, iconFor, isOn, isToggleable, isUnavailable, stateLabel } from '../entities';
import { useHomeAssistant } from '../HomeAssistantProvider';
import type { HassEntity } from '../types';

const ICONS = {
  bulb: 'bulb',
  'bulb-outline': 'bulb-outline',
  power: 'power',
  toggle: 'toggle',
  sparkles: 'sparkles',
  door: 'enter-outline',
  pulse: 'pulse',
  'hardware-chip-outline': 'hardware-chip-outline',
} as const;

type Props = { entity: HassEntity; label?: string | null; onLongPress?: () => void };

/** A square-ish glass tile for a light, plug or sensor. Only HA-confirmed state is shown. */
export function DeviceTile({ entity, label, onLongPress }: Props) {
  const { toggle, pending } = useHomeAssistant();
  const busy = pending.has(entity.entity_id);
  const on = isOn(entity);
  const down = isUnavailable(entity);
  const controllable = isToggleable(entity) && !down;
  const name = label || friendlyName(entity);
  const state = stateLabel(entity);

  const onPress = async () => {
    if (!controllable || busy) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const result = await toggle(entity.entity_id);
    if (!result.ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      notify(`${name} didn’t respond`, result.message);
    }
  };

  const tint = on ? (entity.entity_id.startsWith('light.') ? colors.yellow : colors.accent) : undefined;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!controllable && !onLongPress}
      style={styles.wrap}
      accessibilityRole={controllable ? 'switch' : 'text'}
      accessibilityState={{ checked: controllable ? on : undefined, disabled: !controllable, busy }}
      accessibilityLabel={`${name}, ${state}`}
      accessibilityHint={controllable ? 'Double tap to toggle' : undefined}>
      <Glass interactive={controllable} tint={tint} style={styles.tile}>
        <View style={styles.top}>
          <View style={[styles.icon, { backgroundColor: on ? (tint ?? colors.accent) : colors.glassFillStrong }]}>
            <Ionicons name={ICONS[iconFor(entity)]} size={20} color={on ? '#000' : down ? colors.textTertiary : colors.text} />
          </View>
          {busy ? <ActivityIndicator color={colors.textSecondary} /> : down ? <Ionicons name="warning" size={18} color={colors.yellow} /> : null}
        </View>
        <View>
          <Text variant="headline" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="footnote" tone={down ? 'danger' : 'secondary'} numberOfLines={1}>
            {state}
          </Text>
        </View>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '48.3%' },
  tile: { borderRadius: radius.md, padding: spacing.md, gap: spacing.md, minHeight: 112, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
