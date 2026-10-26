import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ConfirmDialog } from '@/components/world/overlays';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { useWorld } from '@/lib/world/store';
import type { GameSettings } from '@/lib/world/types';

/** Titles, labels and hints come from world:settings.<group> and world:settings.rows.<key>. */
const GROUPS: { id: 'gameplay' | 'privacy'; rows: { key: keyof GameSettings; icon: keyof typeof Ionicons.glyphMap }[] }[] = [
  {
    id: 'gameplay',
    rows: [
      { key: 'timer', icon: 'timer-outline' },
      { key: 'haptics', icon: 'phone-portrait-outline' },
      { key: 'reduceMotion', icon: 'pause-circle-outline' },
    ],
  },
  {
    id: 'privacy',
    rows: [
      { key: 'leaderboard', icon: 'podium-outline' },
      { key: 'anonymous', icon: 'eye-off-outline' },
    ],
  },
];

/** Screen 154: game settings. */
export default function GameSettingsScreen() {
  const { t } = useTranslation('world');
  const { settings, updateSettings, reset } = useWorld();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('settings.title')} />
      {GROUPS.map((g) => (
        <View key={g.id} style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t(`settings.groups.${g.id}`)}
          </Text>
          <Card style={{ gap: Spacing.md }}>
            {g.rows.map((r) => (
              <View key={r.key} style={styles.row}>
                <Ionicons name={r.icon} size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t(`settings.rows.${r.key}.label`)}</Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {t(`settings.rows.${r.key}.hint`)}
                  </Text>
                </View>
                <Switch
                  value={settings[r.key]}
                  onValueChange={(v) => updateSettings({ [r.key]: v })}
                  disabled={r.key === 'anonymous' && !settings.leaderboard}
                  trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
                  thumbColor="#fff"
                  accessibilityLabel={t(`settings.rows.${r.key}.label`)}
                />
              </View>
            ))}
          </Card>
        </View>
      ))}

      <View style={{ gap: Spacing.xs }}>
        <Text variant="label" color={Colors.textMuted}>
          {t('settings.more')}
        </Text>
        <Card style={{ gap: Spacing.md }}>
          <LinkRow
            icon="help-circle-outline"
            label={t('settings.replayTutorial')}
            onPress={() => router.push('/world/tutorial')}
          />
          <LinkRow icon="book-outline" label={t('settings.howItWorks')} onPress={() => router.push('/world/intro')} />
          <LinkRow
            icon="color-wand-outline"
            label={t('settings.editAvatar')}
            onPress={() => router.push({ pathname: '/world/avatar/create', params: { edit: '1' } })}
          />
        </Card>
      </View>

      <Card style={styles.fair}>
        <Ionicons name="shield-checkmark" size={22} color={Colors.success} />
        <Text variant="small" style={{ flex: 1 }}>
          {t('settings.fairPlay')}
        </Text>
      </Card>

      <Pressable onPress={() => setConfirm(true)} accessibilityRole="button" style={styles.reset}>
        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        <Text variant="bodyStrong" color={Colors.danger}>
          {t('settings.reset')}
        </Text>
      </Pressable>
      {done && (
        <Text variant="small" color={Colors.success} center>
          {t('settings.resetDone')}
        </Text>
      )}
      <ConfirmDialog
        visible={confirm}
        icon="trash-outline"
        destructive
        title={t('settings.resetTitle')}
        body={t('settings.resetBody')}
        confirmLabel={t('settings.resetConfirm')}
        cancelLabel={t('actions.cancel', { ns: 'common' })}
        onConfirm={() => {
          reset();
          setConfirm(false);
          setDone(true);
        }}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const flip = useFlipStyle();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.row}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text variant="bodyStrong" style={{ flex: 1 }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={flip} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fair: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', borderColor: Colors.success + '55' },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: Spacing.md },
});
