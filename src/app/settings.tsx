import { useRouter, type Href } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsRow, type IoniconName } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/store/categories-context';
import { useSettings } from '@/store/settings-context';
import { tapFeedback } from '@/utils/haptics';

type Destination = {
  href: Href;
  icon: IoniconName;
  label: string;
};

const DESTINATIONS: Destination[] = [
  { href: '/settings/appearance', icon: 'color-palette-outline', label: 'Appearance' },
  { href: '/settings/categories', icon: 'pricetags-outline', label: 'Categories' },
  { href: '/settings/timers', icon: 'hourglass-outline', label: 'Timer defaults' },
  { href: '/settings/data', icon: 'archive-outline', label: 'Data' },
  { href: '/settings/about', icon: 'information-circle-outline', label: 'About' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings } = useSettings();
  const { categories } = useCategories();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsList>
          {DESTINATIONS.map(({ href, icon, label }) => (
            <SettingsRow
              key={label}
              icon={icon}
              label={label}
              value={
                label === 'Categories' && categories.length > 0
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
      </ScrollView>
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
