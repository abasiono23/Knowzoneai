import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { W } from '@/components/games/ui';
import { ConfirmDialog } from '@/components/world/overlays';
import { worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
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
        <View key={g.id} style={{ gap: 8 }}>
          <Text style={styles.eyebrow}>{t(`settings.groups.${g.id}`).toUpperCase()}</Text>
          <View style={styles.list}>
            {g.rows.map((r, k) => (
              <View key={r.key} style={[worldStyles.row, k > 0 && worldStyles.rowLine]}>
                <Ionicons name={r.icon} size={20} color={W.ink} />
                <View style={{ flex: 1 }}>
                  <Text style={worldStyles.strong}>{t(`settings.rows.${r.key}.label`)}</Text>
                  <Text style={worldStyles.small}>{t(`settings.rows.${r.key}.hint`)}</Text>
                </View>
                <Switch
                  value={settings[r.key]}
                  onValueChange={(v) => updateSettings({ [r.key]: v })}
                  disabled={r.key === 'anonymous' && !settings.leaderboard}
                  trackColor={{ true: W.ink, false: W.lineStrong }}
                  thumbColor="#fff"
                  accessibilityLabel={t(`settings.rows.${r.key}.label`)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={{ gap: 8 }}>
        <Text style={styles.eyebrow}>{t('settings.more').toUpperCase()}</Text>
        <View style={styles.list}>
          <LinkRow icon="help-circle-outline" label={t('settings.replayTutorial')} onPress={() => router.push('/world/tutorial')} />
          <LinkRow line icon="book-outline" label={t('settings.howItWorks')} onPress={() => router.push('/world/intro')} />
          <LinkRow
            line
            icon="person-circle-outline"
            label={t('settings.editAvatar')}
            onPress={() => router.push({ pathname: '/world/avatar/create', params: { edit: '1' } })}
          />
        </View>
      </View>

      <View style={[styles.list, styles.fair]}>
        <Ionicons name="shield-checkmark-outline" size={22} color={W.correct} />
        <Text style={[worldStyles.small, { flex: 1 }]}>{t('settings.fairPlay')}</Text>
      </View>

      <Pressable onPress={() => setConfirm(true)} accessibilityRole="button" style={styles.reset}>
        <Ionicons name="trash-outline" size={18} color={W.wrong} />
        <Text style={[worldStyles.strong, { color: W.wrong }]}>{t('settings.reset')}</Text>
      </Pressable>
      {done && (
        <View style={styles.done} accessibilityLiveRegion="polite">
          <Ionicons name="checkmark-circle" size={16} color={W.correct} />
          <Text style={[worldStyles.small, { color: W.correct }]}>{t('settings.resetDone')}</Text>
        </View>
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

function LinkRow({ icon, label, onPress, line }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; line?: boolean }) {
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [worldStyles.row, line && worldStyles.rowLine, pressed && { backgroundColor: W.page }]}>
      <Ionicons name={icon} size={20} color={W.ink} />
      <Text style={[worldStyles.strong, { flex: 1 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  fair: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14 },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16, minHeight: 48 },
  done: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
