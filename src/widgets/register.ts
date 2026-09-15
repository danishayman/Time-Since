import { WIDGETS_SUPPORTED } from '@/widgets/platform';

/**
 * Hooks the app up to the home screen, from the root `index.js`.
 *
 * Both registrations inside have to happen before React renders: the task
 * handler is what Android calls when a widget is added, updated, resized, tapped
 * or removed — which can happen with the app closed, on a headless JavaScript
 * runtime that starts at that entry file — and the configuration screen is the
 * activity the launcher opens when a widget is placed. Neither can wait for a
 * component to mount.
 */
if (WIDGETS_SUPPORTED) {
  // Required, not imported: see `platform.ts`.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@/widgets/register-android');
}
