import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TimersProvider, useTimers } from '@/store/timers-context';

SplashScreen.preventAutoHideAsync();

/** Holds the splash screen until the stored timers have been read back. */
function SplashGate() {
  const { hydrated } = useTimers();

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync();
    }
  }, [hydrated]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <TimersProvider>
          <SplashGate />
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Time Since' }} />
            <Stack.Screen name="new" options={{ title: 'New timer' }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="timer/[id]" options={{ title: 'Timer' }} />
            <Stack.Screen name="timer/[id]/edit" options={{ title: 'Edit timer' }} />
            <Stack.Screen name="timer/[id]/restarts" options={{ title: 'Restarts' }} />
            <Stack.Screen name="timer/[id]/notifications" options={{ title: 'Notifications' }} />
          </Stack>
        </TimersProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
