import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { GameQuestion } from '@/lib/world/types';
import { useWorld } from '@/lib/world/store';

import { Kora } from './world-ui';

/** Screen 144: pause menu, over the paused game. */
export function PauseMenu({
  visible,
  title,
  subtitle,
  onResume,
  onRestart,
  onQuit,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  const { settings, updateSettings } = useWorld();
  const { t } = useTranslation('world');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(220)} style={styles.card}>
          <View style={styles.pauseIcon}>
            <Ionicons name="pause" size={28} color={Colors.primary} />
          </View>
          <Text variant="title" center>
            {t('pause.title')}
          </Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t('pause.subtitle', { title, subtitle })}
          </Text>
          <Button title={t('pause.resume')} icon="play" onPress={onResume} />
          <Button variant="secondary" title={t('pause.restart')} icon="refresh" onPress={onRestart} />
          <View style={styles.toggles}>
            <ToggleLine
              label={t('pause.timer')}
              hint={t('pause.timerHint')}
              value={settings.timer}
              onChange={(timer) => updateSettings({ timer })}
            />
            <ToggleLine label={t('pause.haptics')} value={settings.haptics} onChange={(haptics) => updateSettings({ haptics })} />
          </View>
          <View style={styles.row}>
            <Pressable
              onPress={() => {
                onResume();
                router.push('/world/tutorial');
              }}
              accessibilityRole="button"
              style={styles.link}>
              <Ionicons name="help-circle-outline" size={16} color={Colors.textSecondary} />
              <Text variant="small" color={Colors.textSecondary}>
                {t('pause.howToPlay')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onResume();
                router.push('/world/settings');
              }}
              accessibilityRole="button"
              style={styles.link}>
              <Ionicons name="settings-outline" size={16} color={Colors.textSecondary} />
              <Text variant="small" color={Colors.textSecondary}>
                {t('pause.settings')}
              </Text>
            </Pressable>
          </View>
          <Button variant="ghost" title={t('pause.quit')} icon="exit-outline" onPress={onQuit} />
        </Animated.View>
      </View>
    </Modal>
  );
}

function ToggleLine({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <View style={{ flex: 1 }}>
        <Text variant="small">{label}</Text>
        {hint && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
            {hint}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

/** Screen 145 (and quit): a confirm dialog. */
export function ConfirmDialog({
  visible,
  icon = 'refresh',
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('world');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(200)} style={styles.card}>
          <View
            style={[
              styles.pauseIcon,
              destructive && { backgroundColor: Colors.dangerSoft, borderColor: Colors.danger },
            ]}>
            <Ionicons name={icon} size={26} color={destructive ? Colors.danger : Colors.reward} />
          </View>
          <Text variant="heading" center>
            {title}
          </Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {body}
          </Text>
          <Button variant={destructive ? 'danger' : 'primary'} title={confirmLabel} onPress={onConfirm} />
          <Button variant="secondary" title={cancelLabel ?? t('confirm.keepPlaying')} onPress={onCancel} />
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Screen 143: the AI helper. A nudge costs a quarter of the question's points, removing two
 * wrong answers costs half. Hints never cost stars: it's about learning, not punishment.
 */
export function HintSheet({
  visible,
  question,
  used,
  onNudge,
  onFiftyFifty,
  onClose,
}: {
  visible: boolean;
  question: GameQuestion | null;
  used: { nudge: boolean; fifty: boolean };
  onNudge: () => void;
  onFiftyFifty: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('world');
  if (!question) return null;
  const canFifty = question.options.length >= 3 && !used.fifty;
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(150)} style={styles.sheetBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('hint.close')} />
        <Animated.View entering={SlideInDown.duration(260)} style={styles.sheet}>
          <View style={styles.handle} />
          <Kora mood={used.nudge ? 'happy' : 'thinking'}>
            {used.nudge ? (
              <Text variant="small">{question.hint}</Text>
            ) : (
              <Text variant="small">{t('hint.intro')}</Text>
            )}
          </Kora>
          <Pressable
            onPress={onNudge}
            disabled={used.nudge}
            accessibilityRole="button"
            accessibilityLabel={t('hint.nudge')}
            style={[styles.option, used.nudge && { opacity: 0.5 }]}>
            <View style={[styles.optIcon, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="bulb" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('hint.nudge')}</Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {used.nudge ? t('hint.shownAbove') : t('hint.nudgeBody')}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={onFiftyFifty}
            disabled={!canFifty}
            accessibilityRole="button"
            accessibilityLabel={t('hint.fifty')}
            style={[styles.option, !canFifty && { opacity: 0.5 }]}>
            <View style={[styles.optIcon, { backgroundColor: Colors.rewardSoft }]}>
              <Ionicons name="cut" size={20} color={Colors.reward} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('hint.fifty')}</Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {used.fifty
                  ? t('actions.done', { ns: 'common' })
                  : question.options.length < 3
                    ? t('hint.notAvailable')
                    : t('hint.fiftyBody')}
              </Text>
            </View>
          </Pressable>
          <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
            {t('hint.free')}
          </Text>
          <Button variant="secondary" title={t('hint.back')} onPress={onClose} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,8,26,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  pauseIcon: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggles: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(5,8,26,0.7)', justifyContent: 'flex-end' },
  sheet: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
