import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';

import { DatabaseProvider } from '@/core/db/DatabaseProvider';
import { colors } from '@/core/theme/tokens';
import { HomeAssistantProvider } from '@/features/homeassistant/HomeAssistantProvider';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.text,
    border: colors.separator,
  },
};

const sheet = {
  presentation: 'formSheet',
  sheetAllowedDetents: [0.92] as number[],
  sheetGrabberVisible: true,
  headerShown: true,
  headerTransparent: true,
  headerTintColor: colors.accent,
  headerTitleStyle: { color: colors.text },
  contentStyle: { backgroundColor: colors.backgroundElevated },
} as const;

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <DatabaseProvider>
        <HomeAssistantProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="meal/[id]" options={{ ...sheet, title: 'Meal' }} />
            <Stack.Screen name="settings/home-assistant" options={{ ...sheet, title: 'Home Assistant' }} />
            <Stack.Screen
              name="recipes"
              options={{ headerShown: true, headerTransparent: true, headerBlurEffect: 'dark', title: 'Recipes', headerTintColor: colors.accent, headerLargeTitle: true }}
            />
            <Stack.Screen
              name="recipe/[id]"
              options={{ headerShown: true, headerTransparent: true, headerBlurEffect: 'dark', title: '', headerTintColor: colors.accent }}
            />
          </Stack>
        </HomeAssistantProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
