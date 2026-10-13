import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius } from '@/core/theme/tokens';

const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

export type GlassProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
  /** Interactive glass reacts to touches (iOS 26). Use for tappable surfaces. */
  interactive?: boolean;
  /** Optional tint, e.g. an accent colour for a selected chip. */
  tint?: string;
  variant?: 'regular' | 'clear';
};

/**
 * A Liquid Glass surface. On iOS 26+ this is the native glass material;
 * elsewhere it falls back to a dark blur with a hairline highlight so the
 * layout and contrast stay the same.
 */
export function Glass({ style, interactive, tint, variant = 'regular', children, ...rest }: GlassProps) {
  const shape = [styles.base, style];
  if (liquidGlass) {
    return (
      <GlassView
        {...rest}
        style={shape}
        glassEffectStyle={variant}
        isInteractive={interactive}
        tintColor={tint}
        colorScheme="dark">
        {children}
      </GlassView>
    );
  }
  return (
    <View {...rest} style={[shape, styles.fallback, tint ? { backgroundColor: tint + '33' } : null]}>
      <BlurView tint="dark" intensity={40} style={[StyleSheet.absoluteFill, styles.behind]} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.highlight, styles.behind]} />
      {children}
    </View>
  );
}

export const isNativeLiquidGlass = liquidGlass;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  fallback: {
    // Own stacking context so the blur layers (zIndex -1) sit behind children on web too.
    zIndex: 0,
    backgroundColor: colors.glassFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  behind: { zIndex: -1 },
  highlight: {
    borderRadius: radius.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassHighlight,
  },
});
