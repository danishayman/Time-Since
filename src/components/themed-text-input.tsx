import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The app's one text field: a single-line value (a timer's label, a category's
 * name) in a box that grows to show all of it.
 *
 * Outlined in `fieldBorder`, which clears 3:1 so the field reads as a field on
 * its own, with the caret and selection in the tint.
 *
 * It is a multiline input only so that it can grow: at large text sizes even
 * the placeholder wraps, and a fixed one-line box cut the second line off. The
 * return key still finishes the entry rather than starting a new line, and a
 * pasted line break becomes a space, so the value stays one line of text.
 */
export function ThemedTextInput({ style, onChangeText, ...rest }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      multiline
      scrollEnabled={false}
      submitBehavior="blurAndSubmit"
      textAlignVertical="center"
      placeholderTextColor={theme.textSecondary}
      selectionColor={theme.tint}
      cursorColor={theme.tint}
      onChangeText={
        onChangeText ? (text) => onChangeText(text.replace(/\s*\n+\s*/g, ' ')) : undefined
      }
      style={[styles.input, { color: theme.text, borderColor: theme.fieldBorder }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    // Set on both sides explicitly: a multiline field on iOS otherwise brings
    // its own top inset and the text sits low in the box.
    paddingTop: Spacing.two + 4,
    paddingBottom: Spacing.two + 4,
    fontSize: Type.body.fontSize,
  },
});
