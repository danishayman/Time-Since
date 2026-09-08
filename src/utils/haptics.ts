import * as Haptics from 'expo-haptics';

/**
 * Every haptic in the app goes through here so the user's preference is
 * honoured in one place rather than at each call site. The setting is passed in
 * rather than read from the store, keeping these callable outside React.
 *
 * Failures are swallowed: a device with no Taptic Engine, or one in Low Power
 * Mode, rejects the call, and a missing buzz is never worth an error.
 */

export function tapFeedback(enabled: boolean): void {
  if (!enabled) {
    return;
  }
  Haptics.selectionAsync().catch(() => {});
}

export function successFeedback(enabled: boolean): void {
  if (!enabled) {
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warningFeedback(enabled: boolean): void {
  if (!enabled) {
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
