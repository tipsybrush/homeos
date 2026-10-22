import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MODULES } from '@/core/modules/registry';
import { colors } from '@/core/theme/tokens';
import { connectionSummary, useHomeAssistant } from '@/features/homeassistant/HomeAssistantProvider';
import { Divider, Glass, isNativeLiquidGlass, Row, Screen, Section, StatusPill } from '@/ui';

/** Modules that already have their own tab. */
const TAB_MODULES = ['meals', 'smart-home', 'kitchen'];

export default function MoreScreen() {
  const ha = useHomeAssistant();
  const conn = connectionSummary(ha.mode, ha.status);
  return (
    <Screen title="More">
      <Section title="Connections">
        <Glass style={styles.card}>
          <Row
            icon="home-outline"
            iconColor={colors.blue}
            title="Home Assistant"
            subtitle={ha.mode === 'live' ? (ha.baseUrl ?? undefined) : ha.mode === 'demo' ? 'Using the demo home' : 'Not set up'}
            trailing={<StatusPill label={conn.tone === 'ok' ? 'Connected' : conn.tone === 'error' ? 'Problem' : ha.mode === 'demo' ? 'Demo' : 'Off'} tone={conn.tone} />}
            onPress={() => router.push('/settings/home-assistant')}
            showChevron
          />
        </Glass>
      </Section>

      <Section title="More tools">
        <Glass style={styles.card}>
          {MODULES.filter((m) => m.status === 'available' && !TAB_MODULES.includes(m.id)).map((m, i) => (
            <View key={m.id}>
              {i > 0 && <Divider />}
              <Row
                icon={m.icon as never}
                iconColor={m.color}
                title={m.title}
                subtitle={m.description}
                onPress={() => router.push(m.href as never)}
                showChevron
              />
            </View>
          ))}
        </Glass>
      </Section>

      <Section title="About">
        <Glass style={styles.card}>
          <Row
            icon="information-circle-outline"
            iconColor={colors.gray}
            title={`HomeOS ${Constants.expoConfig?.version ?? ''}`.trim()}
            subtitle={`Your data stays on this phone · Liquid Glass: ${isNativeLiquidGlass ? 'native' : 'fallback'}`}
          />
        </Glass>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: 24 } });
