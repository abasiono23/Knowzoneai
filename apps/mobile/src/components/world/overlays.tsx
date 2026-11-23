import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

import { FONT, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { Button, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { GameQuestion } from '@/lib/world/types';
import { useWorld } from '@/lib/world/store';

import { Kora } from './world-ui';

/**
 * The pause menu over a paused game, in the word games' look: resume, start again, the timer and haptics
 * switches, how to play and settings, and leave.
 */
export function PauseMenu({
  visible,
  title,
  subtitle,
  onResume,
  onRestart,
  onQuit,
  onHelp,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  /** The game's own how-to-play; without it, the link opens the World tutorial. */
  onHelp?: () => void;
}) {
  const { settings, updateSettings } = useWorld();
  const { t } = useTranslation('world');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.duration(180)} style={styles.card} accessibilityViewIsModal>
          <View style={{ gap: 4 }}>
            <Text style={styles.eyebrow} numberOfLines={2}>
              {t('pause.subtitle', { title, subtitle }).toUpperCase()}
            </Text>
            <Text style={styles.title} accessibilityRole="header">
              {t('pause.title')}
            </Text>
          </View>
          <PrimaryButton title={t('pause.resume')} icon="play" onPress={onResume} />
          <SecondaryButton title={t('pause.restart')} icon="refresh" onPress={onRestart} />
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
                if (onHelp) return onHelp();
                onResume();
                router.push('/world/tutorial');
              }}
              accessibilityRole="button"
              hitSlop={6}
              style={styles.link}>
              <Ionicons name="help-circle-outline" size={18} color={W.inkSoft} />
              <Text style={styles.linkText}>{t('pause.howToPlay')}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onResume();
                router.push('/world/settings');
              }}
              accessibilityRole="button"
              hitSlop={6}
              style={styles.link}>
              <Ionicons name="settings-outline" size={18} color={W.inkSoft} />
              <Text style={styles.linkText}>{t('pause.settings')}</Text>
            </Pressable>
          </View>
          <Pressable onPress={onQuit} accessibilityRole="button" hitSlop={6} style={[styles.link, styles.quit]}>
            <Ionicons name="exit-outline" size={18} color={W.wrong} />
            <Text style={[styles.linkText, { color: W.wrong }]}>{t('pause.quit')}</Text>
          </Pressable>
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
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint && <Text style={styles.toggleHint}>{hint}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: W.ink, false: W.lineStrong }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

/** A confirm dialog (leave, start again, delete...), in the word games' look. */
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
        <Animated.View entering={ZoomIn.duration(180)} style={styles.card} accessibilityViewIsModal>
          <View style={[styles.icon, destructive && { backgroundColor: W.wrongSoft }]}>
            <Ionicons name={icon} size={24} color={destructive ? W.wrong : W.ink} />
          </View>
          <Text style={[styles.title, styles.dialogTitle]} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
          <PrimaryButton title={confirmLabel} onPress={onConfirm} style={destructive ? { backgroundColor: W.wrong } : undefined} />
          <SecondaryButton title={cancelLabel ?? t('confirm.keepPlaying')} onPress={onCancel} />
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
  backdrop: { flex: 1, backgroundColor: 'rgba(14,16,32,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 400, gap: 12, padding: 22, borderRadius: 20, backgroundColor: W.surface },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  title: { fontFamily: FONT, fontSize: 26, lineHeight: 32, letterSpacing: -0.5, color: W.ink },
  dialogTitle: { textAlign: 'center', fontSize: 22, lineHeight: 28 },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft, textAlign: 'center', marginBottom: 4 },
  icon: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: W.given,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggles: { gap: 4, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: W.line },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  toggleLabel: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  toggleHint: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.muted },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 6 },
  linkText: { fontFamily: Fonts.bold, fontSize: 14, color: W.inkSoft },
  quit: { alignSelf: 'center' },
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
