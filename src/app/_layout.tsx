import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useResolvedScheme, useTheme } from '@/hooks/use-theme';
import { CategoriesProvider, useCategories } from '@/store/categories-context';
import { SettingsProvider, useSettings } from '@/store/settings-context';
import { TimersProvider, useTimers } from '@/store/timers-context';
import { setTickMs } from '@/utils/ticker';

SplashScreen.preventAutoHideAsync();

// `react-native-reorderable-list` still calls `InteractionManager`, which React
// Native 0.86 deprecated, so every list mount raises a warning we cannot act on
// from here — 0.18.1 is the latest release and the call is in its own source.
// This hides the notice, not the problem: drop the line once the library moves
// off it, and check before assuming any other InteractionManager warning is the
// same one.
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

/** A minute is plenty when nothing on screen counts in seconds, and far cheaper. */
const TICK_WITH_SECONDS_MS = 1000;
const TICK_WITHOUT_SECONDS_MS = 60_000;

/**
 * Runs the clock only as fast as the timers actually need: a second while any
 * of them counts in hours, minutes and seconds, a minute when none does.
 *
 * Kept out of `RootNavigator` on purpose — reading the timers there would
 * re-render the whole navigation tree on every edit, reorder and restart.
 */
function TickerRate() {
  const { timers } = useTimers();
  const needsSeconds = timers.some((timer) => timer.format.includes('time'));

  useEffect(() => {
    setTickMs(needsSeconds ? TICK_WITH_SECONDS_MS : TICK_WITHOUT_SECONDS_MS);
  }, [needsSeconds]);

  return null;
}

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
  const theme = useTheme();

  // The stock navigation themes hard-code their own greys, which would leave
  // the header a different shade from the screen under it. Overriding the four
  // colours the header actually paints with keeps the two in step, whatever the
  // palette is. `card` matches `background` so the header reads as part of the
  // screen, separated only by the hairline the flat lists already use.
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <SplashGate />
      <TickerRate />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Time Since' }} />
        <Stack.Screen name="new" options={{ title: 'New timer' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="settings/appearance" options={{ title: 'Appearance' }} />
        <Stack.Screen name="settings/categories" options={{ title: 'Categories' }} />
        <Stack.Screen name="settings/category" options={{ title: 'Category' }} />
        <Stack.Screen name="settings/widgets" options={{ title: 'Widgets' }} />
        <Stack.Screen name="settings/data" options={{ title: 'Data' }} />
        <Stack.Screen name="settings/about" options={{ title: 'About' }} />
        <Stack.Screen name="timer/[id]" options={{ title: 'Timer' }} />
        <Stack.Screen name="timer/[id]/edit" options={{ title: 'Edit timer' }} />
        <Stack.Screen name="timer/[id]/category" options={{ title: 'Category' }} />
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
