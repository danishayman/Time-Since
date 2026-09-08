# Time Since

Track how long it has been since — or how long there is until — the events that matter to you.
Each event gets a colored badge that counts in real time, and the list survives app restarts.

Built with [Expo](https://expo.dev) SDK 57 and [Expo Router](https://docs.expo.dev/router/introduction).

## Features

- A reorderable list of timers, each showing a live duration badge and a label.
- Count up from a past date or down towards a future one — the direction is derived from the
  date, and a countdown flips to a count-up on its own when the event arrives.
- Stop and resume without losing accrued time, or restart from zero.
- Per-timer display format: automatic, `{days}d {HH}:{MM}:{SS}`, or `{years}y {days}d`.
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
    settings.tsx      Settings (stub)
    timer/[id].tsx    Timer detail
    timer/[id]/       Edit, restart history (stub), notifications (stub)
  components/       Duration badge, timer row, color picker, shared form
  store/            Timers context + reducer, AsyncStorage persistence
  utils/            Duration formatter (unit-tested), elapsed math, shared clock
  types/            Timer model
  constants/        Theme tokens and the color palette
```

Two details worth knowing before you change things:

- **The clock lives in `src/utils/ticker.ts`.** It is a single app-wide one-second interval that
  only `DurationBadge` subscribes to, so a tick re-renders the badge text and nothing else. Adding
  a `useNow()` call to a row or a screen would re-render the whole list every second.
- **Elapsed time is derived from timestamps, never accumulated.** `signedElapsedMs` computes
  `accumulatedMs + (now - runningSince)`, which is what keeps the display correct after the app has
  been backgrounded or killed.

## Not yet implemented

Notifications are stored as a preference but never delivered, restart history is an empty screen,
and there is no cloud sync.
