import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MODULES } from '@/core/modules/registry';
import { colors } from '@/core/theme/tokens';
import { connectionSummary, useHomeAssistant } from '@/features/homeassistant/HomeAssistantProvider';
import { Divider, Glass, isNativeLiquidGlass, Row, Screen, Section, StatusPill } from '@/ui';

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

      <Section title="Modules">
        <Glass style={styles.card}>
          {MODULES.map((m, i) => (
            <View key={m.id}>
              {i > 0 && <Divider />}
              <Row
                icon={m.icon as never}
                iconColor={m.color}
                title={m.title}
                subtitle={m.status === 'planned' ? `${m.description} · ${m.phase ?? 'Coming next'}` : m.description}
                onPress={m.href ? () => router.push(m.href as never) : undefined}
                showChevron={!!m.href}
                trailing={m.status === 'planned' ? <StatusPill label="Coming" tone="neutral" /> : undefined}
              />
            </View>
          ))}
        </Glass>
      </Section>

      <Section title="About">
        <Glass style={styles.card}>
          <Row icon="information-circle-outline" iconColor={colors.gray} title="HomeOS" subtitle={`Version ${Constants.expoConfig?.version ?? '–'}`} />
          <Divider />
          <Row
            icon="sparkles-outline"
            iconColor={colors.gray}
            title="Liquid Glass"
            subtitle={isNativeLiquidGlass ? 'Native (iOS 26)' : 'Fallback blur (older iOS, Android or web)'}
          />
          <Divider />
          <Row icon="lock-closed-outline" iconColor={colors.gray} title="Your data" subtitle="Meals and rooms are stored on this phone only. No AI or cloud services are used." />
        </Glass>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: 24 } });
