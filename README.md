# Time Since

Track how long it has been since — or how long there is until — the events that matter to you.
Each event gets a colored badge that counts in real time, and the list survives app restarts.

Built with [Expo](https://expo.dev) SDK 57 and [Expo Router](https://docs.expo.dev/router/introduction).

## Features

- A reorderable list of timers, each showing a live duration badge and a label.
- Count up from a past date or down towards a future one — the direction is derived from the
  date, and a countdown flips to a count-up on its own when the event arrives.
- Stop and resume without losing accrued time, or restart from zero — every restart is logged with
  how long that run lasted, alongside a longest-run summary.
- Per-timer display format: tick any combination of years, months, weeks, days and the clock, and
  the badge counts in exactly those units — `2w 6d`, `23y 60d`, `48:00:00`.
- Categories: file a timer under a named, coloured category — from the create form, or from the
  Category button on its detail screen — and narrow the list with the chips along the top.
- A settings menu: theme override, categories, seconds on or off, clock and date format, defaults
  for new timers, haptics, and JSON export/import.
- Everything persists to `AsyncStorage` and reloads on launch.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

Open it in [Expo Go](https://expo.dev/go), an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/),
or an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/). Every dependency is
supported in Expo Go, so no development build is required.

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
    settings/         Appearance, categories, timer defaults, display format, data, about
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
  The period is settable — turning off "Show seconds" drops it to a minute — and `useNowSnapshot()`
  reads the clock without subscribing, for callers that need a `now` but must not re-render on it.
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
