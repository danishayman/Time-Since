import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useResolvedScheme } from '@/hooks/use-theme';
import { CategoriesProvider, useCategories } from '@/store/categories-context';
import { SettingsProvider, useSettings } from '@/store/settings-context';
import { TimersProvider, useTimers } from '@/store/timers-context';
import { setTickMs } from '@/utils/ticker';

SplashScreen.preventAutoHideAsync();

/** A minute is plenty once the seconds are hidden, and much cheaper. */
const TICK_WITH_SECONDS_MS = 1000;
const TICK_WITHOUT_SECONDS_MS = 60_000;

/**
 * Holds the splash screen until all three stores have been read back. Waiting
 * on the timers alone would paint a frame in the device theme before a saved
 * override had a chance to apply, or show timers as uncategorised before their
 * categories arrived.
 */
function SplashGate() {
  const timers = useTimers();
  const settings = useSettings();
  const categories = useCategories();
  const ready = timers.hydrated && settings.hydrated && categories.hydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  return null;
}

function RootNavigator() {
  const scheme = useResolvedScheme();
  const { settings } = useSettings();

  useEffect(() => {
    setTickMs(settings.showSeconds ? TICK_WITH_SECONDS_MS : TICK_WITHOUT_SECONDS_MS);
  }, [settings.showSeconds]);

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SplashGate />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Time Since' }} />
        <Stack.Screen name="new" options={{ title: 'New timer' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="settings/appearance" options={{ title: 'Appearance' }} />
        <Stack.Screen name="settings/categories" options={{ title: 'Categories' }} />
        <Stack.Screen name="settings/category" options={{ title: 'Category' }} />
        <Stack.Screen name="settings/timers" options={{ title: 'Timer defaults' }} />
        <Stack.Screen name="settings/format" options={{ title: 'Display format' }} />
        <Stack.Screen name="settings/data" options={{ title: 'Data' }} />
        <Stack.Screen name="settings/about" options={{ title: 'About' }} />
        <Stack.Screen name="timer/[id]" options={{ title: 'Timer' }} />
        <Stack.Screen name="timer/[id]/edit" options={{ title: 'Edit timer' }} />
        <Stack.Screen name="timer/[id]/format" options={{ title: 'Format' }} />
        <Stack.Screen name="timer/[id]/restarts" options={{ title: 'Restarts' }} />
        <Stack.Screen name="timer/[id]/notifications" options={{ title: 'Notifications' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <CategoriesProvider>
          <TimersProvider>
            <RootNavigator />
          </TimersProvider>
        </CategoriesProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
