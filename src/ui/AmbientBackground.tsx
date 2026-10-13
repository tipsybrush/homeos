import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/core/theme/tokens';

/**
 * Soft colour fields behind the content. Liquid Glass is a lens: on a flat
 * black canvas it has nothing to bend, so we paint a few dim glows and blur
 * them into a gentle wash.
 */
export function AmbientBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.glow, { backgroundColor: colors.glowCool, top: -120, left: -120 }]} />
      <View style={[styles.glow, { backgroundColor: colors.glowWarm, top: 280, right: -170, opacity: 0.18 }]} />
      <View style={[styles.glow, { backgroundColor: colors.glowTeal, bottom: -170, left: -80, opacity: 0.14 }]} />
      <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    opacity: 0.26,
  },
});
