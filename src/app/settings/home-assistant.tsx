import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, webTopInset } from '@/core/theme/tokens';
import { connectionSummary, useHomeAssistant, type HAMode } from '@/features/homeassistant/HomeAssistantProvider';
import { insecureRemoteWarning, normalizeBaseUrl } from '@/features/homeassistant/url';
import { Button, Chip, confirmAsync, Glass, Section, StatusPill, Text, TextField } from '@/ui';

const STEPS = [
  'On a computer at home, open Home Assistant in a browser.',
  'Click your name (bottom left) → Security → Long-lived access tokens → Create token. Name it “HomeOS”.',
  'Copy the token and paste it below with your Home Assistant address (for example http://homeassistant.local:8123).',
  'Keep your phone on the home Wi-Fi while connecting.',
];

export default function HomeAssistantSettings() {
  const ha = useHomeAssistant();
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState<HAMode>(ha.mode);
  const [url, setUrl] = useState(ha.baseUrl ?? '');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conn = connectionSummary(ha.mode, ha.status);

  let warning: string | null = null;
  try {
    warning = url ? insecureRemoteWarning(normalizeBaseUrl(url)) : null;
  } catch {
    warning = null;
  }

  const connect = async () => {
    setBusy(true);
    setError(null);
    const res = await ha.connectLive(url, token);
    setBusy(false);
    if (res.ok) {
      setToken('');
      router.back();
    } else setError(res.message);
  };

  const useDemo = async () => {
    await ha.switchToDemo();
    router.back();
  };

  const disconnect = async () => {
    const ok = await confirmAsync(
      'Disconnect Home Assistant?',
      'HomeOS will forget the address and delete the saved token from this phone. Meals and rooms are kept.',
      'Disconnect',
      true,
    );
    if (!ok) return;
    await ha.disconnect();
    setChoice('off');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <View style={{ gap: spacing.xs }}>
          <StatusPill label={conn.label} tone={conn.tone} />
          {ha.status.kind === 'error' && (
            <Text variant="footnote" tone="danger">
              {ha.status.message}
            </Text>
          )}
        </View>

        <Text variant="subhead" tone="secondary">
          HomeOS controls lights, plugs and sensors through Home Assistant, which runs on a computer in your home. Your meals and plans
          work without it.
        </Text>

        <View style={styles.chips}>
          <Chip label="Demo home" selected={choice === 'demo'} onPress={() => setChoice('demo')} />
          <Chip label="My Home Assistant" selected={choice === 'live'} onPress={() => setChoice('live')} />
          <Chip label="Off" selected={choice === 'off'} onPress={() => setChoice('off')} />
        </View>

        {choice === 'demo' && (
          <Section title="Demo home">
            <Text variant="subhead" tone="secondary">
              A pretend apartment with lights, plugs, a door sensor and scenes, so you can try HomeOS before buying any hardware. Nothing
              real is switched on or off.
            </Text>
            {ha.mode !== 'demo' && <Button label="Use the demo home" kind="primary" onPress={useDemo} />}
          </Section>
        )}

        {choice === 'live' && (
          <Section title="Connect">
            <Glass style={styles.steps}>
              {STEPS.map((s, i) => (
                <View key={i} style={styles.step}>
                  <Text variant="headline" tone="accent" style={{ width: 20 }}>
                    {i + 1}
                  </Text>
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {s}
                  </Text>
                </View>
              ))}
            </Glass>
            <TextField
              label="Home Assistant address"
              placeholder="http://homeassistant.local:8123"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              textContentType="URL"
              hint={warning ?? undefined}
            />
            <TextField
              label="Long-lived access token"
              placeholder={ha.mode === 'live' ? 'Saved. Paste a new one to replace it.' : 'Paste token'}
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              hint="Stored in the iPhone keychain only. Never shown again or sent anywhere except your Home Assistant."
            />
            {error && (
              <Text variant="footnote" tone="danger" accessibilityLiveRegion="assertive">
                {error}
              </Text>
            )}
            <Button label="Test and connect" kind="primary" onPress={connect} loading={busy} disabled={!url.trim() || !token.trim()} />
          </Section>
        )}

        {choice === 'off' && ha.mode !== 'off' && (
          <Text variant="subhead" tone="secondary">
            Turning the smart home off hides devices and scenes. Your meal plan is unaffected.
          </Text>
        )}

        {ha.mode !== 'off' && (
          <Button label={ha.mode === 'live' ? 'Disconnect and forget token' : 'Turn off smart home'} kind="destructive" onPress={disconnect} />
        )}

        <Text variant="footnote" tone="tertiary" style={{ color: colors.textTertiary }}>
          Don’t expose Home Assistant directly to the internet. For access away from home, set up a secure option such as Home Assistant
          Cloud or a VPN first.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  steps: { padding: spacing.md, gap: spacing.sm, borderRadius: 20 },
  step: { flexDirection: 'row', gap: spacing.xs },
});
