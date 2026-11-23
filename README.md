# Time Since

Track how long it has been since — or how long there is until — the events that matter to you.
Each event gets a colored badge that counts in real time, and the list survives app restarts.

Built with [Expo](https://expo.dev) SDK 57 and [Expo Router](https://docs.expo.dev/router/introduction).

## Install (Android)

1. On your Android phone, open the [latest release](https://github.com/danishayman/Time-Since/releases/latest)
   and download the `.apk` file.
2. Open it. If Android asks, allow your browser or file manager to install unknown apps.
3. Open Time Since and add your first timer. To add a widget, long-press your home screen and
   pick **Widgets → Time Since**.

Updates are installed the same way: download the newer `.apk` and open it, and your timers stay.
Time Since collects no data. Everything stays on your phone; see [PRIVACY.md](PRIVACY.md).

An iPhone version is planned.

## Features

- A reorderable list of timers, each showing a live duration badge and a label.
- Count up from a past date or down towards a future one — the direction is derived from the
  date, and a countdown flips to a count-up on its own when the event arrives.
- Stop and resume without losing accrued time, or restart from zero — every restart is logged with
  how long that run lasted, alongside a longest-run summary.
- Per-timer display format: tick any combination of years, months, weeks, days and the clock, and
  the badge counts in exactly those units — `2w 6d`, `23y 60d`, `48:00:00`.
- Categories: file a timer under a named, coloured category — from the create form, or from the
  Category button on its detail screen — and narrow the list with the chips along the top. The
  whole feature switches off from settings without losing what was filed where.
- Android home screen widgets, in four styles — filled with the timer's own colour, two
  transparent ones for dark or light wallpapers, and one carrying a restart button that resets
  the timer without opening the app. All four are free. Each placed widget is pointed at a
  timer of its own, tapping it opens that timer, and the duration is shown in the same units
  the timer uses.
- A settings menu: theme override, categories, widgets, clock and date format, haptics, and JSON
  export/import.
- Everything persists to `AsyncStorage` and reloads on launch.

## Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

Open it in an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) or an
[iOS simulator](https://docs.expo.dev/workflow/ios-simulator/).

The home screen widgets need native code, so **Android needs a development build** rather than
Expo Go:

```bash
npx expo run:android
```

Everything else still runs in [Expo Go](https://expo.dev/go); only the widgets are missing there.
Android Gradle does not yet build under JDK 24 or newer — use the JDK 21 that ships with Android
Studio if `expo run:android` fails while configuring CMake.

### Widgets

The four providers are declared in the `react-native-android-widget` plugin block in `app.json`,
and the `name` of each must match a key in [`src/widgets/widget-variants.ts`](src/widgets/widget-variants.ts).
Everything a widget draws is computed from the same `AsyncStorage` the app writes, by the same
pure helpers the app's own badge uses, so the two can never disagree — see
[`src/widgets/`](src/widgets/) for how that is wired, and `src/widgets/platform.ts` for why the
Android-only modules are reached through a runtime check rather than imported.

## Checks

```bash
npm test
```

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

## Project layout

```
src/
  app/              File-based routes
    index.tsx         Home — the timer list
    new.tsx           Create a timer
    settings.tsx      Settings menu
    settings/         Appearance, categories, data, about
    timer/[id].tsx    Timer detail
    timer/[id]/       Edit, display format, category, restart history,
                      notifications (stub)
  components/       Duration badge, timer row, color/format/category pickers, shared form
    settings/         Flat list, row, switch row, checkbox row, inline picker row
  store/            Timers, categories and settings contexts + reducers, AsyncStorage persistence
  hooks/            Resolved color scheme, timestamp formatter
  utils/            Duration formatter and drag reordering (unit-tested), category
                    resolution, elapsed math, shared clock, backup read/write, haptics
  types/            Timer, category and settings models
  constants/        Theme tokens and the color palette
```

Three details worth knowing before you change things:

- **The clock lives in `src/utils/ticker.ts`.** It is a single app-wide one-second interval that
  only `DurationBadge` subscribes to, so a tick re-renders the badge text and nothing else. Adding
  a `useNow()` call to a row or a screen would re-render the whole list every second.
  The period is settable, and `TickerRate` in the root layout drops it to a minute whenever no
  timer counts in `time`. `useNowSnapshot()` reads the clock without subscribing, for callers that
  need a `now` but must not re-render on it.
- **Elapsed time is derived from timestamps, never accumulated.** `signedElapsedMs` computes
  `accumulatedMs + (now - runningSince)`, which is what keeps the display correct after the app has
  been backgrounded or killed.
- **A timer's format is a set of units, largest first.** `formatDuration` hands each selected unit
  the remainder left by the one above it, and renders every unit that was ticked even when it is
  still zero. `normalizeFormat` is the only way a format should be built: it drops unknown units,
  reorders, refuses to return an empty set, and maps the single-string formats older builds stored
  onto their unit equivalents.
- **A timer's category is resolved lazily, never eagerly.** `categoryOf` returns nothing for a
  `categoryId` that no longer matches a stored category, and everything downstream treats that as
  uncategorised. That is what lets a category be deleted without cascading through every timer, and
  lets a backup be imported without the categories it was exported with. The `clearCategory` action
  exists only to stop dead ids accumulating in storage — nothing depends on it running.
- **The list is only ever in the order you dragged it into.** `Timer.order` is the single source of
  truth. While a category chip is filtering the list a drag reports positions in the filtered view,
  so `globalReorderIndices` maps them back onto positions in the stored array — reordering a
  filtered view leaves everything outside the filter where it was.

## Not yet implemented

Notifications are stored as a per-timer preference but never delivered, and there is no cloud sync.
