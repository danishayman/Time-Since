/**
 * App entry point.
 *
 * `package.json` used to point `main` straight at `expo-router/entry`. Home
 * screen widgets need two more things registered on the same JavaScript runtime
 * the app boots: the headless task Android calls when a widget is added,
 * updated, resized, tapped or removed, and the activity shown when a widget is
 * configured. Both must exist before any of those events can arrive, which is
 * what this file is for.
 *
 * Importing `expo-router/entry` first keeps the app itself booting exactly as it
 * did — that import is what renders the root component. `./src/widgets/register`
 * resolves to a no-op everywhere except Android.
 */
import 'expo-router/entry';

import './src/widgets/register';
