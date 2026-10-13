import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, type as typeScale, type TextVariant } from '@/core/theme/tokens';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'danger' | 'success';

const toneColor: Record<Tone, string> = {
  primary: colors.text,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  accent: colors.accent,
  danger: colors.red,
  success: colors.green,
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: Tone;
};

export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  return <RNText {...rest} style={[typeScale[variant], { color: toneColor[tone] }, style]} />;
}
