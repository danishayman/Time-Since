import { useRouter, type Href } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SettingsList } from '@/components/settings/settings-list';
import type { AppIconName } from '@/components/app-icon';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { tapFeedback } from '@/utils/haptics';

type Destination = {
  href: Href;
  icon: AppIconName;
  label: string;
};

const DESTINATIONS: Destination[] = [
  { href: '/settings/appearance', icon: 'appearance', label: 'Appearance' },
  { href: '/settings/categories', icon: 'category', label: 'Categories' },
  // Android only: iOS has no equivalent target, so the row would lead to a
  // screen that can only apologise.
  ...(Platform.OS === 'android'
    ? ([{ href: '/settings/widgets', icon: 'widgets', label: 'Widgets' }] as Destination[])
    : []),
  { href: '/settings/data', icon: 'data', label: 'Data' },
  { href: '/settings/about', icon: 'info', label: 'About' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { categories } = useCategories();

  return (
    <ThemedView style={styles.container}>
      <ScreenScrollView contentContainerStyle={styles.content}>
        <SettingsList>
          {DESTINATIONS.map(({ href, icon, label }) => (
            <SettingsRow
              key={label}
              icon={icon}
              label={label}
              navigates
              value={
                label === 'Categories' && settings.categoriesEnabled && categories.length > 0
                  ? `${categories.length}`
                  : undefined
              }
              onPress={() => {
                tapFeedback(settings.haptics);
                router.push(href);
              }}
            />
          ))}
        </SettingsList>

        <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
          Time Since keeps everything on this device.
        </ThemedText>
      </ScreenScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  tagline: {
    marginTop: 'auto',
    textAlign: 'center',
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
