import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/** Nothing to listen for: the value only differs between server and client. */
function subscribe() {
  return () => {};
}

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 *
 * The server has no device to ask, so it renders light; `useSyncExternalStore`
 * is how React is told the two snapshots differ, and it re-renders with the real
 * scheme once the page has hydrated — without an effect that sets state.
 */
export function useColorScheme() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  return hydrated ? colorScheme : 'light';
}
