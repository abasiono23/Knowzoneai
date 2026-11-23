import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { column, FONT, GameBackground, GameTopBar, PrimaryButton, StatusRow, W } from '@/components/games/ui';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { levelKey } from '@/lib/games/english';
import { DAILY_ID, MAX_LEVEL, rungOf } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import type { Level, World } from '@/lib/world/types';

import { useWorldRulesSeen, WorldHowTo, WorldRulesSheet } from './how-to';
import { WORLD_ACCENT, WorldCover } from './world-cover';
import { Coin } from './world-ui';

export type PlayLevel = Level & { world: World; tier?: number };

/** "Space · Level 4 · Intermediate", or the daily challenge's name. */
export function useLevelNames(level: PlayLevel) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const daily = level.id === DAILY_ID;
  const n = daily ? (level.tier ?? 4) : level.number;
  const ladder = tg(`levels.names.${levelKey(n)}`);
  return {
    daily,
    ladder,
    kind: t(`adv.kinds.${level.kind}.name`),
    title: daily ? t('levelPlan.daily.title') : level.world.name,
    subtitle: daily
      ? `${level.world.name} · ${ladder}`
      : `${tg('ui.levelName', { level: level.number, name: ladder })} · ${t(`adv.kinds.${level.kind}.name`)}`,
  };
}

/** The pause, rules and leave / start-again state every World game shares. */
export function usePlayState(level: PlayLevel) {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'restart' | 'quit' | null>(null);
  const [help, setHelp] = useState(false);
  const { settings } = useWorld();
  return {
    started,
    start: () => setStarted(true),
    menuOpen: paused,
    setPaused,
    confirm,
    setConfirm,
    help,
    setHelp,
    /** The clock stops while a dialog or the rules are open. */
    halted: paused || !!confirm || help,
    relaxed: !settings.timer,
    haptics: settings.haptics,
    level,
  };
}
export type PlayState = ReturnType<typeof usePlayState>;

/**
 * The frame around a World game's board: the top bar (leave, the level, how to play, pause), a row of
 * facts (progress, hearts, time), the pause menu and the leave / start-again dialogs.
 */
export function PlayFrame({
  s,
  step,
  status,
  onRestart,
  children,
  footer,
}: {
  s: PlayState;
  step: { n: number; total: number };
  status: ReactNode;
  onRestart: () => void;
  children: ReactNode;
  /** Kept above the bottom edge (the main action). */
  footer?: ReactNode;
}) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const names = useLevelNames(s.level);
  const { setHelp } = s;
  // "?" opens how to play on a computer (the other game keys are handled by each game).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') setHelp(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setHelp]);
  return (
    <GameBackground>
      <GameTopBar
        title={names.title}
        subtitle={names.subtitle}
        onLeave={() => s.setConfirm('quit')}
        onHelp={() => s.setHelp(true)}
        onPause={() => s.setPaused(true)}
      />
      <StatusRow>{status}</StatusRow>
      <View style={[column, { paddingHorizontal: 16, paddingTop: 10 }]}>
        <View style={styles.track} accessible accessibilityLabel={tg('ui.pauseSubtitle', { level: s.level.number, n: step.n, total: step.total })}>
          <View style={[styles.fill, { width: `${Math.min(1, step.total ? (step.n - 1) / step.total : 0) * 100}%` }]} />
        </View>
      </View>
      <ScrollView contentContainerStyle={[column, styles.body]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {footer && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <View style={[column, { gap: 8 }]}>{footer}</View>
        </SafeAreaView>
      )}
      <WorldRulesSheet kind={s.level.kind} visible={s.help} onClose={() => s.setHelp(false)} />
      <PauseMenu
        visible={s.menuOpen && !s.confirm}
        title={names.title}
        subtitle={tg('ui.pauseSubtitle', { level: s.level.number || s.level.tier, n: step.n, total: step.total })}
        onResume={() => s.setPaused(false)}
        onRestart={() => s.setConfirm('restart')}
        onQuit={() => s.setConfirm('quit')}
        onHelp={() => {
          s.setPaused(false);
          s.setHelp(true);
        }}
      />
      <ConfirmDialog
        visible={s.confirm === 'restart'}
        title={t('game.restartTitle')}
        body={t('game.restartBody')}
        confirmLabel={t('game.restart')}
        onConfirm={() => {
          s.setConfirm(null);
          s.setPaused(false);
          onRestart();
        }}
        onCancel={() => s.setConfirm(null)}
      />
      <ConfirmDialog
        visible={s.confirm === 'quit'}
        icon="exit-outline"
        destructive
        title={t('game.quitTitle')}
        body={t('game.quitBody')}
        confirmLabel={t('pause.quit')}
        onConfirm={() => {
          s.setConfirm(null);
          if (router.canGoBack()) router.back();
          else router.replace('/play');
        }}
        onCancel={() => s.setConfirm(null)}
      />
    </GameBackground>
  );
}

/** The ten-step difficulty scale with this level marked. */
export function LadderScale({ level, accent = W.ink }: { level: number; accent?: string }) {
  const { t } = useTranslation('games');
  return (
    <View style={styles.scale} accessible accessibilityLabel={t('ui.levelName', { level, name: t(`levels.names.${levelKey(level)}`) })}>
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <View
          key={i}
          style={[styles.step, { height: 8 + i * 2.4 }, i < level && { backgroundColor: i === level - 1 ? accent : W.inkSoft, opacity: i === level - 1 ? 1 : 0.35 }]}
        />
      ))}
    </View>
  );
}

/**
 * A level's start page: where it sits on the ladder, what kind of game it is and its rules (in full the
 * first time on this device), the timer switch, the reward, and Start.
 */
export function LevelIntro({ s, count, extra }: { s: PlayState; count: number; extra?: ReactNode }) {
  const { t } = useTranslation('world');
  const { t: tg } = useTranslation('games');
  const { settings, updateSettings } = useWorld();
  const flip = useFlipStyle();
  const level = s.level;
  const names = useLevelNames(level);
  const rung = rungOf(level.number ? level : { number: level.tier ?? 4 });
  const { seen, markSeen } = useWorldRulesSeen(level.kind);
  const [showRules, setShowRules] = useState<boolean | null>(null);
  const rulesOpen = showRules ?? seen === false;
  const accent = WORLD_ACCENT[level.worldId];
  const timedKind = level.kind !== 'puzzle';
  const n = names.daily ? (level.tier ?? 4) : level.number;

  const facts: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [];
  if (level.kind === 'sprint') {
    facts.push({ icon: 'time-outline', text: t('adv.facts.round', { count: settings.timer ? rung.seconds : rung.seconds * 2 }) });
  } else if (level.kind === 'puzzle') {
    facts.push({ icon: 'text-outline', text: t('adv.facts.words', { count }) });
    facts.push({ icon: 'eye-outline', text: t('adv.facts.reveals', { count: rung.reveals ?? 0 }) });
  } else {
    facts.push({ icon: 'help-circle-outline', text: t('adv.facts.questions', { count }) });
    if (level.kind !== 'battle') facts.push({ icon: 'heart-outline', text: t('adv.facts.hearts', { count: rung.hearts || 3 }) });
    facts.push({ icon: settings.timer ? 'time-outline' : 'infinite', text: settings.timer ? t('adv.facts.seconds', { count: rung.seconds }) : tg('ui.relaxed') });
    if (!names.daily && level.kind !== 'battle')
      facts.push({ icon: 'bulb-outline', text: rung.hints === 2 ? t('adv.facts.hintsTwo') : rung.hints === 1 ? t('adv.facts.hintsOne') : t('adv.facts.hintsNone') });
    if (level.kind === 'battle' && rung.rival) facts.push({ icon: 'person-outline', text: t('adv.facts.rival', { percent: Math.round(rung.rival.right * 100) }) });
  }

  const begin = () => {
    if (seen === false) markSeen();
    s.start();
  };

  return (
    <GameBackground>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={[column, styles.introTop]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/play'))}
            accessibilityRole="button"
            accessibilityLabel={t('actions.back', { ns: 'common' })}
            hitSlop={6}
            style={styles.round}>
            <Ionicons name="chevron-back" size={20} color={W.ink} style={flip} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={[column, styles.intro]} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.introHead}>
            <WorldCover world={level.worldId} size={64} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.eyebrow}>
                {(names.daily ? t('play.dailyEyebrow') : `${level.world.name} · ${t('adv.levelOf', { n: level.number, total: MAX_LEVEL })}`).toUpperCase()}
              </Text>
              <Text style={styles.title} accessibilityRole="header">
                {names.daily ? t('levelPlan.daily.title') : names.ladder}
              </Text>
              <Text style={styles.kind}>{names.daily ? `${names.ladder} · ${level.world.name}` : names.kind}</Text>
            </View>
          </Animated.View>

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <Text style={[styles.bodyText, { flex: 1 }]}>{names.daily ? t('adv.dailyBlurb') : t(`adv.depth.${n}` as 'adv.depth.1')}</Text>
              <LadderScale level={n} accent={accent} />
            </View>
            <View style={styles.facts}>
              {facts.map((f) => (
                <View key={f.text} style={styles.fact}>
                  <Ionicons name={f.icon} size={16} color={W.ink} />
                  <Text style={styles.factText}>{f.text}</Text>
                </View>
              ))}
            </View>
            {extra}
          </View>

          {timedKind && (
            <View style={styles.timer}>
              <Ionicons name={settings.timer ? 'time-outline' : 'infinite'} size={20} color={W.ink} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timerTitle}>{tg('levels.timer')}</Text>
                <Text style={styles.small}>
                  {level.kind === 'sprint'
                    ? settings.timer
                      ? t('adv.sprintTimerOn')
                      : t('adv.sprintTimerOff')
                    : settings.timer
                      ? tg('levels.timerOn')
                      : tg('levels.timerOff')}
                </Text>
              </View>
              <Switch
                value={settings.timer}
                onValueChange={(on) => updateSettings({ timer: on })}
                trackColor={{ true: W.ink, false: W.lineStrong }}
                thumbColor="#fff"
                accessibilityLabel={tg('levels.timer')}
              />
            </View>
          )}

          <View style={styles.card}>
            <Pressable
              onPress={() => setShowRules(!rulesOpen)}
              accessibilityRole="button"
              accessibilityState={{ expanded: rulesOpen }}
              style={styles.rulesHead}>
              <Text style={styles.heading}>{t('adv.howToPlay')}</Text>
              <Ionicons name={rulesOpen ? 'chevron-up' : 'chevron-down'} size={18} color={W.ink} />
            </Pressable>
            {rulesOpen && <WorldHowTo kind={level.kind} />}
          </View>

          <View style={styles.reward} accessible accessibilityLabel={t('levels.reward', { xp: level.xp, count: level.coins })}>
            <Ionicons name="flash" size={15} color={W.focus} />
            <Text style={styles.small}>{t('adv.upToXp', { count: level.xp })}</Text>
            <View style={{ width: 8 }} />
            <Coin size={15} />
            <Text style={styles.small}>{t('adv.upToCoins', { count: level.coins })}</Text>
          </View>
        </ScrollView>
        <View style={[column, styles.introFoot]}>
          <PrimaryButton title={tg('ui.start')} icon="arrow-forward" onPress={begin} />
        </View>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: W.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: W.ink },
  body: { padding: 16, gap: 16, paddingBottom: 32 },
  footer: { backgroundColor: W.surface, borderTopWidth: 1, borderTopColor: W.line, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  scale: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  step: { width: 6, borderRadius: 2, backgroundColor: W.line },
  introTop: { paddingHorizontal: 16, paddingTop: 8 },
  intro: { padding: 16, gap: 16, paddingBottom: 24 },
  introHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  title: { fontFamily: FONT, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: W.ink },
  kind: { fontFamily: Fonts.semibold, fontSize: 15, color: W.inkSoft },
  card: { gap: 14, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  bodyText: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft },
  heading: { fontFamily: FONT, fontSize: 17, color: W.ink },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: W.page,
    borderWidth: 1,
    borderColor: W.line,
  },
  factText: { fontFamily: Fonts.semibold, fontSize: 13, color: W.ink },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  timerTitle: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.inkSoft },
  rulesHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 },
  reward: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  introFoot: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
