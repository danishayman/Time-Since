import { useIsFocused, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';

import { HeaderButton } from '@/components/header-button';

/**
 * Stops a half-filled form being thrown away by a stray back gesture.
 *
 * While `dirty`, the three ways out that do not go through Save are each turned
 * into a question: the back button becomes Cancel (a close mark on Android), the
 * iOS edge swipe is switched off, and Android's system Back asks first. Saving
 * is untouched — it leaves through the router, which none of this intercepts.
 *
 * Returns the header options to spread into the screen's `Stack.Screen`. With a
 * clean form they are the defaults, so an untouched screen backs out as usual.
 */
export function useDiscardGuard(dirty: boolean) {
  const router = useRouter();
  const focused = useIsFocused();

  const confirm = () => {
    // The web build has no native alert to ask with.
    if (Platform.OS === 'web') {
      router.back();
      return;
    }
    Alert.alert('Discard changes?', 'What you have entered here will not be saved.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  useEffect(() => {
    // Only while this screen is the one on top: the form can push another
    // screen over itself, and Back there has nothing to do with this draft.
    if (!dirty || !focused || Platform.OS !== 'android') {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      confirm();
      return true;
    });
    return () => subscription.remove();
  });

  if (!dirty) {
    return { gestureEnabled: true, headerLeft: undefined };
  }

  return {
    gestureEnabled: false,
    headerLeft: () =>
      Platform.OS === 'ios' ? (
        <HeaderButton title="Cancel" subdued accessibilityLabel="Cancel" onPress={confirm} />
      ) : (
        <HeaderButton icon="close" accessibilityLabel="Discard changes" onPress={confirm} />
      ),
  };
}
