import { useEffect } from "react";
import {
  FacultyGlyphic_400Regular,
  useFonts,
} from "@expo-google-fonts/faculty-glyphic";
import { SplashScreen, Stack } from "expo-router";
import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";

import { DatabaseProvider } from "@/core/db/DatabaseProvider";
import { colors, headingFont } from "@/core/theme/tokens";
import { HomeAssistantProvider } from "@/features/homeassistant/HomeAssistantProvider";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
  presentation: "formSheet",
  sheetAllowedDetents: [0.92] as number[],
  sheetGrabberVisible: true,
  headerShown: true,
  headerTransparent: true,
  headerTintColor: colors.accent,
  headerTitleStyle: { color: colors.text, fontFamily: headingFont },
  contentStyle: { backgroundColor: colors.backgroundElevated },
} as const;

const header = {
  headerShown: true,
  headerTransparent: true,
  headerBlurEffect: "dark",
  title: "",
  headerTintColor: colors.accent,
  headerTitleStyle: { fontFamily: headingFont },
  headerLargeTitleStyle: { fontFamily: headingFont },
} as const;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ FacultyGlyphic_400Regular });
  const ready = fontsLoaded || fontError != null;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  if (!ready) return null;

  return (
    <ThemeProvider value={theme}>
      <DatabaseProvider>
        <HomeAssistantProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="meal/[id]"
              options={{ ...sheet, title: "Meal" }}
            />
            <Stack.Screen
              name="settings/home-assistant"
              options={{ ...sheet, title: "Home Assistant" }}
            />
            <Stack.Screen
              name="news"
              options={{ ...header, title: "News", headerLargeTitle: true }}
            />
            <Stack.Screen
              name="recipes"
              options={{ ...header, title: "Recipes", headerLargeTitle: true }}
            />
            <Stack.Screen name="exercise/index" options={header} />
            <Stack.Screen name="exercise/[id]" options={header} />
            <Stack.Screen name="exercise/move/[id]" options={header} />
            <Stack.Screen name="wardrobe/index" options={header} />
            <Stack.Screen name="wardrobe/styles" options={{ ...header, title: "Styles", headerLargeTitle: true }} />
            <Stack.Screen name="wardrobe/look/[id]" options={header} />
            <Stack.Screen
              name="wardrobe/add"
              options={{ ...sheet, title: "Add clothing" }}
            />
            <Stack.Screen name="recipe/[id]" options={header} />
          </Stack>
        </HomeAssistantProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
