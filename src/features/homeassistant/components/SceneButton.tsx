import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/core/theme/tokens';
import { Glass, notify, Text } from '@/ui';

import { friendlyName } from '../entities';
import { useHomeAssistant } from '../HomeAssistantProvider';
import type { HassEntity } from '../types';

const ICON_BY_NAME: [RegExp, 'laptop-outline' | 'cafe-outline' | 'moon-outline' | 'walk-outline' | 'leaf-outline'][] = [
  [/work/i, 'laptop-outline'],
  [/relax|chill/i, 'cafe-outline'],
  [/bed|night|sleep/i, 'moon-outline'],
  [/away|leave/i, 'walk-outline'],
  [/sav/i, 'leaf-outline'],
];

export function SceneButton({ scene }: { scene: HassEntity }) {
  const { activateScene, pending } = useHomeAssistant();
  const [done, setDone] = useState(false);
  const name = friendlyName(scene);
  const icon = ICON_BY_NAME.find(([re]) => re.test(name))?.[1] ?? 'sparkles-outline';
  const busy = pending.has(scene.entity_id);

  const onPress = async () => {
    const res = await activateScene(scene.entity_id);
    if (res.ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } else {
      notify(`${name} didn’t run`, res.message);
    }
  };

  return (
    <Pressable onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityLabel={`Activate ${name}`} accessibilityState={{ busy }}>
      <Glass interactive tint={done ? colors.green : undefined} style={styles.btn}>
        {busy ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Ionicons name={done ? 'checkmark' : icon} size={20} color={done ? colors.green : colors.text} />
        )}
        <Text variant="subhead" style={{ fontWeight: '600' }}>
          {name}
        </Text>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, height: 44, borderRadius: radius.pill },
});
