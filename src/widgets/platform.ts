import { Platform } from 'react-native';

/**
 * Whether this build can talk to the home screen at all.
 *
 * Home screen widgets are an Android feature, and `react-native-android-widget`
 * resolves its native module with `TurboModuleRegistry.getEnforcing` at module
 * scope — which throws rather than returning null when the module is missing. So
 * nothing that reaches that package may be *imported* on iOS or the web, only
 * `require`d behind this check, which is what every file next to this one does.
 *
 * The obvious alternative, Metro's `.android.tsx` platform extensions, is a trap
 * here: it resolves for a relative import but **not** through the `@/` alias this
 * codebase imports by, so the stub silently wins and the widgets quietly stop
 * updating. An explicit branch cannot fail that way.
 */
export const WIDGETS_SUPPORTED = Platform.OS === 'android';
