/// <reference types="jest" />

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  bindWidget,
  loadWidgetBindings,
  saveWidgetBindings,
  unbindWidget,
} from '@/store/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  // A `jest.mock` factory is hoisted above the imports, so it cannot close over
  // one — `require` is the only way to reach the package's own mock from here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const KEY = 'timesince.widgets.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('widget bindings', () => {
  it('reads back an empty map before any widget has been placed', async () => {
    await expect(loadWidgetBindings()).resolves.toEqual({});
  });

  it('remembers which timer a widget instance was pointed at', async () => {
    await bindWidget(7, 'timer-a');
    await expect(loadWidgetBindings()).resolves.toEqual({ '7': { timerId: 'timer-a' } });
  });

  it('keys by widget id, so two widgets can show different timers', async () => {
    await bindWidget(7, 'timer-a');
    await bindWidget(8, 'timer-b');
    await expect(loadWidgetBindings()).resolves.toEqual({
      '7': { timerId: 'timer-a' },
      '8': { timerId: 'timer-b' },
    });
  });

  it('repoints one widget without disturbing the others', async () => {
    await bindWidget(7, 'timer-a');
    await bindWidget(8, 'timer-b');
    await bindWidget(7, 'timer-c');
    await expect(loadWidgetBindings()).resolves.toEqual({
      '7': { timerId: 'timer-c' },
      '8': { timerId: 'timer-b' },
    });
  });

  it('forgets a removed widget and leaves the rest in place', async () => {
    await bindWidget(7, 'timer-a');
    await bindWidget(8, 'timer-b');
    await unbindWidget(7);
    await expect(loadWidgetBindings()).resolves.toEqual({ '8': { timerId: 'timer-b' } });
  });

  it('does not rewrite storage when there was nothing to forget', async () => {
    await bindWidget(7, 'timer-a');
    (AsyncStorage.setItem as jest.Mock).mockClear();
    await unbindWidget(99);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('treats an unreadable payload as no bindings rather than throwing', async () => {
    await AsyncStorage.setItem(KEY, 'not json');
    await expect(loadWidgetBindings()).resolves.toEqual({});
  });

  it('treats a payload of the wrong shape as no bindings', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(['7']));
    await expect(loadWidgetBindings()).resolves.toEqual({});
  });

  it('round-trips a map written directly', async () => {
    await saveWidgetBindings({ '1': { timerId: 'x' } });
    await expect(loadWidgetBindings()).resolves.toEqual({ '1': { timerId: 'x' } });
  });
});
