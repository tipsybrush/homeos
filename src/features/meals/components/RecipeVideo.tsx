import Ionicons from '@expo/vector-icons/Ionicons';
import { createElement } from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, spacing } from '@/core/theme/tokens';
import { Text } from '@/ui';

const ORIGIN = 'https://homeos.local';

/** The YouTube player page. YouTube needs a referring origin, so we host the iframe in a tiny page. */
function playerHtml(id: string) {
  const src = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1&origin=${encodeURIComponent(ORIGIN)}`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;background:#000}iframe{border:0;width:100%;height:100%}</style></head><body><iframe src="${src}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></body></html>`;
}

/** A how-to video playing right inside the recipe, with a link out to the YouTube app. */
export function RecipeVideo({ id, title }: { id: string; title: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.frame}>
        {Platform.OS === 'web' ? (
          createElement('iframe', {
            src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
            style: { border: 0, width: '100%', height: '100%' },
            allow: 'encrypted-media; picture-in-picture; fullscreen',
            allowFullScreen: true,
            title,
          })
        ) : (
          <WebView
            source={{ html: playerHtml(id), baseUrl: ORIGIN }}
            style={styles.web}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction
            scrollEnabled={false}
            originWhitelist={['*']}
          />
        )}
      </View>
      <Pressable
        onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${id}`)}
        style={styles.link}
        accessibilityRole="link"
        accessibilityLabel={`Open ${title} in YouTube`}>
        <Ionicons name="logo-youtube" size={16} color={colors.textSecondary} />
        <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
        <Ionicons name="open-outline" size={14} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
});
