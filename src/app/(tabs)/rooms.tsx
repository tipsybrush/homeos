import { router } from 'expo-router';
import { ActionSheetIOS, Alert, Platform, StyleSheet, View } from 'react-native';

import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { spacing } from '@/core/theme/tokens';
import { DeviceTile } from '@/features/homeassistant/components/DeviceTile';
import { friendlyName, isScene } from '@/features/homeassistant/entities';
import { connectionSummary, useHomeAssistant } from '@/features/homeassistant/HomeAssistantProvider';
import type { HassEntity } from '@/features/homeassistant/types';
import { useRoomsAndRefs } from '@/features/rooms/hooks';
import { assignRoom, setPinned } from '@/features/rooms/repository';
import { Button, EmptyState, Screen, Section, StatusPill, Text } from '@/ui';

/** Domains worth showing in rooms. Everything else HA exposes (zones, updates…) is noise here. */
const ROOM_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'binary_sensor', 'sensor', 'climate', 'cover', 'media_player'];

export default function RoomsScreen() {
  const db = useDb();
  const { bump } = useDataVersion();
  const ha = useHomeAssistant();
  const { rooms, refs } = useRoomsAndRefs();
  const conn = connectionSummary(ha.mode, ha.status);

  const devices = Object.values(ha.entities).filter((e) => !isScene(e) && ROOM_DOMAINS.includes(e.entity_id.split('.')[0]!));
  const refByEntity = new Map(refs.map((r) => [r.entityId, r]));

  const manage = (e: HassEntity) => {
    const ref = refByEntity.get(e.entity_id);
    const options = [...rooms.map((r) => r.name), 'No room', ref?.pinned ? 'Remove from Home' : 'Show on Home', 'Cancel'];
    const handle = async (i: number) => {
      if (i < rooms.length) await assignRoom(db, e.entity_id, rooms[i]!.id);
      else if (i === rooms.length) await assignRoom(db, e.entity_id, null);
      else if (i === rooms.length + 1) await setPinned(db, e.entity_id, !ref?.pinned);
      else return;
      bump();
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: friendlyName(e), message: 'Move to a room', options, cancelButtonIndex: options.length - 1, userInterfaceStyle: 'dark' },
        (i) => void handle(i),
      );
    } else {
      Alert.alert(friendlyName(e), 'Move to a room', [
        ...options.slice(0, -1).map((o, i) => ({ text: o, onPress: () => void handle(i) })),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  if (ha.mode === 'off') {
    return (
      <Screen title="Rooms">
        <EmptyState icon="home-outline" title="Connect your smart home" body="Rooms show the lights, plugs and sensors from Home Assistant. You can also try the demo home.">
          <Button label="Set up" kind="primary" onPress={() => router.push('/settings/home-assistant')} />
        </EmptyState>
      </Screen>
    );
  }

  const unassigned = devices.filter((d) => !refByEntity.get(d.entity_id)?.roomId);

  return (
    <Screen title="Rooms" onRefresh={ha.refresh} refreshing={ha.status.kind === 'loading'}>
      <StatusPill label={conn.label} tone={conn.tone} />
      {rooms.map((room) => {
        const inRoom = devices.filter((d) => refByEntity.get(d.entity_id)?.roomId === room.id);
        if (inRoom.length === 0) return null;
        return (
          <Section key={room.id} title={room.name}>
            <View style={styles.grid}>
              {inRoom.map((e) => (
                <DeviceTile key={e.entity_id} entity={e} label={refByEntity.get(e.entity_id)?.displayName} onLongPress={() => manage(e)} />
              ))}
            </View>
          </Section>
        );
      })}
      {unassigned.length > 0 && (
        <Section title="Not in a room yet">
          <View style={styles.grid}>
            {unassigned.map((e) => (
              <DeviceTile key={e.entity_id} entity={e} onLongPress={() => manage(e)} />
            ))}
          </View>
        </Section>
      )}
      {devices.length === 0 && ha.status.kind === 'connected' && (
        <EmptyState icon="bulb-outline" title="No devices found" body="Home Assistant is connected but has no lights, plugs or sensors yet." />
      )}
      {devices.length > 0 && <StatusHint />}
    </Screen>
  );
}

function StatusHint() {
  return (
    <Text variant="footnote" tone="tertiary" style={{ textAlign: 'center' }}>
      Touch and hold a device to move it to another room or show it on Home.
    </Text>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, justifyContent: 'space-between' },
});
