// `experiments.reactCompiler` is on for this app, and the compiler rewrites every
// capitalised function returning JSX to call its `useMemoCache` hook. Nothing in
// this file is ever rendered by React: `react-native-android-widget` invokes these
// functions directly to build a layout tree it hands to the native side, so a
// compiled one throws "Invalid Hook Call" the moment a widget is placed on the home
// screen. The directive has to sit at the top of the file, above the imports —
// per-function it is ignored. Nothing here holds state to memoise anyway.
'use no memo';

import { FlexWidget, SvgWidget, TextWidget, type ColorProp } from 'react-native-android-widget';

import { contrastingTextColor } from '@/constants/palette';
import type { Timer } from '@/types/timer';
import { formatForWidget } from '@/widgets/format-for-widget';
import { hourglassSvg, restartSvg } from '@/widgets/widget-icons';

/**
 * The four entries the launcher's widget picker offers. Every one of them is
 * free; there is no locked tier.
 *
 * `standard` and `restart` paint themselves in the timer's own palette colour,
 * which is what makes a row recognisable at a glance on the home screen the same
 * way it is inside the app. The two transparent styles drop the fill entirely so
 * the wallpaper shows through, and come in a pair because the right ink for a
 * wallpaper is the user's call, not the system theme's: someone running a light
 * system theme over a dark photo still wants white text.
 */
export type WidgetVariant = 'standard' | 'transparent-light' | 'transparent-dark' | 'restart';

/** Click action the Restart widget's button emits, handled by the widget task. */
export const RESTART_CLICK_ACTION = 'RESTART';

const TRANSPARENT: ColorProp = 'rgba(0, 0, 0, 0)';
const LIGHT_INK = '#FFFFFF';
const DARK_INK = '#11181C';

/** `Timer.color` and `contrastingTextColor` are both plain hex from `PALETTE`. */
function hex(value: string): ColorProp {
  return value as ColorProp;
}

type Palette = {
  /** Fill behind the whole widget, or transparent for the see-through styles. */
  background: ColorProp;
  /** Icons and the label, which sit directly on `background`. */
  ink: ColorProp;
  /** Fill behind the duration. Equal to `background` when there is no pill. */
  pill: ColorProp;
  /** Text on `pill`. */
  pillInk: ColorProp;
};

function paletteFor(variant: WidgetVariant, color: string): Palette {
  switch (variant) {
    case 'transparent-light':
      // For dark wallpapers: white glyphs, and the duration on a white chip so
      // it stays legible over a busy photo.
      return { background: TRANSPARENT, ink: LIGHT_INK, pill: LIGHT_INK, pillInk: DARK_INK };
    case 'transparent-dark':
      return { background: TRANSPARENT, ink: DARK_INK, pill: DARK_INK, pillInk: LIGHT_INK };
    default: {
      const ink = hex(contrastingTextColor(color));
      return { background: hex(color), ink, pill: hex(color), pillInk: ink };
    }
  }
}

type Props = {
  timer: Timer;
  /** Wall clock at render time. The widget cannot tick, so this is a snapshot. */
  now: number;
  variant: WidgetVariant;
};

export function TimerWidget({ timer, now, variant }: Props) {
  const { background, ink, pill, pillInk } = paletteFor(variant, timer.color);
  const transparent = variant === 'transparent-light' || variant === 'transparent-dark';

  return (
    <FlexWidget
      // Tapping anywhere but the restart button opens the timer's own screen.
      // `timesince` is already the app's scheme and `timer/[id]` already a
      // route, so this needs no new linking setup.
      clickAction="OPEN_URI"
      clickActionData={{ uri: `timesince://timer/${timer.id}` }}
      accessibilityLabel={`${timer.label}, ${formatForWidget(timer, now)}`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: background,
        borderRadius: 24,
        paddingHorizontal: transparent ? 4 : 14,
        paddingVertical: 6,
      }}>
      <SvgWidget svg={hourglassSvg(ink)} style={{ width: 26, height: 26, marginRight: 12 }} />

      <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        {transparent ? (
          // The chip has to wrap its text rather than fill the row, so it is a
          // flex parent of its own; `alignItems` on the column would stretch it.
          <FlexWidget
            style={{
              flexDirection: 'row',
              backgroundColor: pill,
              borderRadius: 13,
              paddingHorizontal: 9,
              paddingVertical: 2,
            }}>
            <TextWidget
              text={formatForWidget(timer, now)}
              maxLines={1}
              truncate="END"
              style={{ fontSize: 16, fontWeight: 'bold', color: pillInk }}
            />
          </FlexWidget>
        ) : (
          <TextWidget
            text={formatForWidget(timer, now)}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 17, fontWeight: 'bold', color: pillInk }}
          />
        )}

        <TextWidget
          text={timer.label}
          maxLines={1}
          truncate="END"
          style={{
            fontSize: 13,
            color: ink,
            marginTop: 2,
            marginLeft: transparent ? 9 : 0,
          }}
        />
      </FlexWidget>

      {variant === 'restart' && (
        <FlexWidget
          clickAction={RESTART_CLICK_ACTION}
          clickActionData={{ timerId: timer.id }}
          accessibilityLabel={`Restart ${timer.label}`}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}>
          <SvgWidget svg={restartSvg(ink)} style={{ width: 26, height: 26 }} />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}

/**
 * A widget element drawn at this instant.
 *
 * The clock read lives here rather than at the call sites because a widget draw
 * genuinely is a snapshot of a moment — the widget cannot tick afterwards — and
 * because the callers are React components, where reading the wall clock while
 * rendering is exactly the kind of impurity the compiler rules forbid.
 */
export function drawTimerWidget(timer: Timer, variant: WidgetVariant) {
  return <TimerWidget timer={timer} now={Date.now()} variant={variant} />;
}

/**
 * What a widget shows before it has been pointed at a timer, and after the timer
 * it was pointed at has been deleted. Rendering nothing would leave a blank
 * rectangle on the home screen with no way back into the picker, so this stays
 * tappable and says what to do.
 */
export function UnboundWidget({ variant }: { variant: WidgetVariant }) {
  const { background, ink } = paletteFor(variant, '#BDE3FA');

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="No timer chosen. Open Time Since."
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: background,
        borderRadius: 24,
        paddingHorizontal: 14,
        paddingVertical: 6,
      }}>
      <SvgWidget svg={hourglassSvg(ink)} style={{ width: 26, height: 26, marginRight: 12 }} />
      <TextWidget
        text="Hold to choose a timer"
        maxLines={2}
        truncate="END"
        style={{ fontSize: 14, color: ink }}
      />
    </FlexWidget>
  );
}
