import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SettingsChoice, SettingsSection, SettingsToggle } from '@/components/settings/rows';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { TEXT_SCALES, useAppearance } from '@/lib/appearance';
import { useSession } from '@/lib/session';
import { useWorld } from '@/lib/world/store';

/** Screen 193: appearance. */
export default function AppearanceScreen() {
  const { appearance, update } = useAppearance();
  const { user } = useSession();
  const world = useWorld();
  const { t } = useTranslation('settings');
  const student = user?.role !== 'teacher';

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('appearance.title')} />
      <SettingsSection title={t('appearance.theme')}>
        <SettingsChoice label={t('appearance.light')} selected onPress={() => {}} />
        <SettingsChoice
          label={t('appearance.dark')}
          hint={t('appearance.darkHint')}
          selected={false}
          disabled
          badge={t('soon')}
          onPress={() => {}}
        />
        <SettingsChoice
          label={t('appearance.system')}
          selected={false}
          disabled
          badge={t('soon')}
          onPress={() => {}}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('appearance.textSize')}>
        {TEXT_SCALES.map((s, k) => (
          <SettingsChoice
            key={s.value}
            label={t(`appearance.textSizes.${s.key}`)}
            selected={appearance.textScale === s.value}
            onPress={() => update({ textScale: s.value })}
            last={k === TEXT_SCALES.length - 1}
          />
        ))}
      </SettingsSection>
      <Card style={styles.preview}>
        <Text variant="label" color={Colors.textMuted}>
          {t('appearance.preview')}
        </Text>
        <Text variant="heading">{t('appearance.previewTitle')}</Text>
        <Text color={Colors.textSecondary}>{t('appearance.previewBody')}</Text>
      </Card>

      <SettingsSection title={t('appearance.motion')}>
        <SettingsToggle
          icon="pause-circle-outline"
          label={t('appearance.reduceMotion')}
          hint={t('appearance.reduceMotionHint')}
          value={appearance.reduceMotion}
          onChange={(reduceMotion) => {
            update({ reduceMotion });
            if (student) world.updateSettings({ reduceMotion });
          }}
          last={!student}
        />
        {student && (
          <SettingsToggle
            icon="phone-portrait-outline"
            label={t('appearance.haptics')}
            hint={t('appearance.hapticsHint')}
            value={world.settings.haptics}
            onChange={(haptics) => world.updateSettings({ haptics })}
            last
          />
        )}
      </SettingsSection>
      <View style={{ height: Spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { gap: Spacing.xs },
});
