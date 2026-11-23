import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FONT,
  GameBackground,
  GameTopBar,
  HeartsStat,
  PrimaryButton,
  SecondaryButton,
  StatusRow,
  W,
} from '@/components/games/ui';
import { ConfirmDialog, PauseMenu } from '@/components/world/overlays';
import { Wallet } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useFlipStyle } from '@/i18n/provider';
import type { GameLevel, GameSummary } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { levelKey, useRelaxed } from '@/lib/games/english';
import { suggestedLevel } from '@/lib/games/use-catalogue';

import { AskKora } from './ask';
import { depthOf, frameOf, ladderOf, WORLD_NS, type SubjectGameId, type SubjectWorld } from './contract';
import { SubjectCover, SUBJECT_ACCENT } from './covers';
import { ASK_COST } from './hud';
import { SubjectResult } from './result';

type Catalogue<G extends string> = { games: { id: G; levels: GameLevel[] }[] };
type AnyRun = { id: string; game: string; status: string; hearts?: number };
/** What every world's useLabRun() gives the frame. */
type Runner<R extends AnyRun> = {
  run: R | null;
  summary: GameSummary | null;
  error: string | null;
  setError: (e: string | null) => void;
  busy: boolean;
  start: (game: never, level: number) => Promise<boolean>;
  ask: (question: string) => Promise<string | null>;
  quit: () => Promise<void>;
  close: () => void;
};

const href = (world: SubjectWorld, game?: string, level?: number): Href =>
  (game ? `/world/${world}?game=${game}${level ? `&level=${level}` : ''}` : `/world/${world}`) as Href;
const back = (fallback: Href) => (router.canGoBack() ? router.back() : router.replace(fallback));

/** Levels, stars and unlocks for one world; refreshed whenever the screen shows. */
function useWorldCatalogue<G extends string>(world: SubjectWorld, load: () => Promise<Catalogue<G>>) {
  const { t } = useTranslation(WORLD_NS[world]);
  const [data, setData] = useState<Catalogue<G> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const reload = useCallback(() => {
    if (USE_MOCKS) {
      setError(t('offline'));
      return;
    }
    loadRef
      .current()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(errorText(e, t('offline'))));
  }, [t]);
  useFocusEffect(reload);
  const { max, open } = ladderOf(world);
  /** All MAX_LEVEL levels of a game: the server's where it has them, the same unlock rule where it doesn't. */
  const levelsOf = (game: G): GameLevel[] => {
    const known = data?.games.find((x) => x.id === game)?.levels ?? [];
    const out: GameLevel[] = [];
    for (let level = 1; level <= max; level++) {
      const l = known.find((x) => x.level === level);
      const before = out[level - 2];
      out.push(
        l ?? {
          level,
          unlocked: level <= open || (before?.bestStars ?? 0) > 0,
          bestStars: 0,
          bestScore: 0,
          plays: 0,
        },
      );
    }
    return out;
  };
  return { data, error, reload, levelsOf, max, open };
}

/** Whether this device has shown a game's rules before. Storage may fail: then they show again. */
const SEEN = 'knowzone.subjectgames.rulesSeen';
function useRulesSeen(game: string) {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(SEEN)
      .then((raw) => live && setSeen(((raw ? JSON.parse(raw) : []) as string[]).includes(game)))
      .catch(() => live && setSeen(false));
    return () => {
      live = false;
    };
  }, [game]);
  const markSeen = () => {
    setSeen(true);
    AsyncStorage.getItem(SEEN)
      .then((raw) => {
        const list = new Set((raw ? JSON.parse(raw) : []) as string[]);
        list.add(game);
        return AsyncStorage.setItem(SEEN, JSON.stringify([...list]));
      })
      .catch(() => {});
  };
  return { seen, markSeen };
}

/**
 * A world's games (the chemistry lab, the Business District, the Museum of Time, the Space Academy, the
 * Tech Hub), in three views on one route:
 *   /world/<world>                         the hub: games, progress, the level ladder, the timer
 *   /world/<world>?game=<id>               a game: how to play and its ten levels
 *   /world/<world>?game=<id>&level=<n>     playing, then the results
 * `render` mounts the game component for a run (see contract.ts).
 */
export function WorldScreen<G extends SubjectGameId, R extends AnyRun>({
  world,
  games,
  g,
  load,
  render,
}: {
  world: SubjectWorld;
  games: G[];
  g: Runner<R>;
  load: () => Promise<Catalogue<G>>;
  render: (run: R, ctx: { hold: boolean }) => ReactNode;
}) {
  const params = useLocalSearchParams<{ game?: string; level?: string }>();
  const cat = useWorldCatalogue(world, load);
  const game = games.includes(params.game as G) ? (params.game as G) : null;
  const n = Number(params.level);
  const level = game && Number.isInteger(n) && n >= 1 ? Math.min(n, cat.max) : null;
  const { reload } = cat;
  useEffect(() => {
    // Back from a game: fresh stars and unlocks.
    if (!level) reload();
  }, [level, reload]);

  if (game && level)
    return <PlayScreen key={`${game}:${level}`} world={world} game={game} level={level} max={cat.max} g={g} render={render} />;
  if (game) return <GamePage world={world} game={game} levels={cat.levelsOf(game)} error={cat.error} open={cat.open} />;
  return <Hub world={world} games={games} levelsOf={cat.levelsOf} error={cat.error} max={cat.max} open={cat.open} />;
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

function Hub<G extends SubjectGameId>({
  world,
  games,
  levelsOf,
  error,
  max,
  open,
}: {
  world: SubjectWorld;
  games: G[];
  levelsOf: (game: G) => GameLevel[];
  error: string | null;
  max: number;
  open: number;
}) {
  const ns = WORLD_NS[world];
  const { t } = useTranslation('games');
  const tn = useTranslation(ns).t;
  const tw = useTranslation('world').t;
  const flip = useFlipStyle();
  const all = games.map((game) => levelsOf(game));
  const stars = all.reduce((s, ls) => s + ls.reduce((m, l) => m + l.bestStars, 0), 0);
  const won = all.reduce((s, ls) => s + ls.filter((l) => l.bestStars > 0).length, 0);
  // The highest level with a star in any of this world's games (0: none yet).
  const highest = all.reduce((h, ls) => Math.max(h, ...ls.filter((l) => l.bestStars > 0).map((l) => l.level)), 0);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={tw('eyebrow')}
        title={tn('title')}
        right={<Wallet compact />}
        onBack={() => back('/world' as Href)}
      />
      <Text style={styles.intro}>{tw(`subjectHub.intro.${world}`, { max })}</Text>

      {error && <Notice text={error} />}

      <View style={styles.facts}>
        <Fact value={`${stars}/${games.length * max * 3}`} label={tw('subjectHub.stars')} icon="star" />
        <View style={styles.factLine} />
        <Fact value={`${won}/${games.length * max}`} label={tw('subjectHub.levelsWon')} icon="checkmark-circle-outline" />
        <View style={styles.factLine} />
        <Fact
          value={highest ? String(highest) : '–'}
          label={highest ? `${tw('subjectHub.highestLevel')} · ${t(`levels.names.${levelKey(highest)}`)}` : tw('subjectHub.highestLevel')}
          icon="trending-up"
        />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.section}>{tw('subjectHub.games')}</Text>
        <View style={styles.list}>
          {games.map((game, k) => {
            const levels = all[k]!;
            const s = levels.reduce((m, l) => m + l.bestStars, 0);
            const level = suggestedLevel(levels);
            const name = tn(`games.${game}.name` as never);
            const where = t('ui.levelName', { level, name: t(`levels.names.${levelKey(level)}`) });
            const line = tagline(tn, game);
            return (
              <Animated.View key={game} entering={FadeIn.delay(k * 40).duration(200)}>
                <Pressable
                  onPress={() => router.push(href(world, game))}
                  accessibilityRole="button"
                  accessibilityLabel={`${name}. ${line}. ${where}. ${t('hub.stars', { count: s, max: max * 3 })}`}
                  style={({ pressed }) => [styles.row, k > 0 && styles.rowLine, pressed && { backgroundColor: W.page }]}>
                  <SubjectCover game={game} size={60} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.tagline} numberOfLines={2}>
                      {line}
                    </Text>
                    <View style={styles.meta}>
                      <Text style={styles.metaText}>{where}</Text>
                      <View style={styles.dot} />
                      <Ionicons name="star" size={12} color="#E2A100" />
                      <Text style={styles.metaText}>{`${s}/${max * 3}`}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <Ladder max={max} open={open} />
      <TimerSwitch />
    </Screen>
  );
}

/** One line about a game: its tagline if it has one, else the start of how it's played. */
function tagline(tn: (k: never) => string, game: string) {
  const short = tn(`games.${game}.tagline` as never);
  return short && short !== `games.${game}.tagline` ? short : tn(`games.${game}.how` as never);
}

function Fact({ value, label, icon }: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Ionicons name={icon} size={16} color={icon === 'star' ? '#E2A100' : W.ink} />
        <Text style={styles.factValue}>{value}</Text>
      </View>
      <Text style={styles.factLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <View style={styles.notice} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={20} color={W.muted} />
      <Text style={{ flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: W.inkSoft }}>{text}</Text>
    </View>
  );
}

/** The ten levels as rising steps, from lower secondary to postgraduate. */
function Ladder({ max, open }: { max: number; open: number }) {
  const { t } = useTranslation('games');
  const tw = useTranslation('world').t;
  const steps = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <View style={styles.ladder}>
      <Text style={styles.eyebrow}>{t('levels.ladder').toUpperCase()}</Text>
      <View
        style={styles.scale}
        accessible
        accessibilityLabel={steps
          .map((l) => `${l} ${t(`levels.names.${levelKey(l)}`)}, ${tw(`subjectHub.depth.${depthOf(l)}`)}`)
          .join('. ')}>
        {steps.map((l) => (
          <View key={l} style={[styles.step, { height: 14 + (l - 1) * 4 }, l <= open && { backgroundColor: W.ink }]} />
        ))}
      </View>
      <View style={styles.scaleEnds}>
        <Text style={[styles.metaText, { flex: 1 }]}>{`${t('levels.names.starter')} · ${tw('subjectHub.depth.lowerSecondary')}`}</Text>
        <Text style={[styles.metaText, { flex: 1, textAlign: 'right' }]}>
          {`${t(`levels.names.${levelKey(max)}`)} · ${tw(`subjectHub.depth.${depthOf(max)}`)}`}
        </Text>
      </View>
      <Text style={styles.note}>{t('levels.openNote', { open })}</Text>
    </View>
  );
}

/** The world setting "Question timer": off means relaxed play, with no clocks. */
function TimerSwitch() {
  const { t } = useTranslation('games');
  const { relaxed, setRelaxed } = useRelaxed();
  return (
    <View style={styles.timer}>
      <Ionicons name={relaxed ? 'infinite' : 'time-outline'} size={20} color={W.ink} />
      <View style={{ flex: 1 }}>
        <Text style={styles.timerTitle}>{t('levels.timer')}</Text>
        <Text style={styles.small}>{relaxed ? t('levels.timerOff') : t('levels.timerOn')}</Text>
      </View>
      <Switch
        value={!relaxed}
        onValueChange={(on) => setRelaxed(!on)}
        trackColor={{ true: W.ink, false: W.lineStrong }}
        thumbColor="#fff"
        accessibilityLabel={t('levels.timer')}
        accessibilityHint={relaxed ? t('levels.timerOff') : t('levels.timerOn')}
      />
    </View>
  );
}

// ─── A game's page ────────────────────────────────────────────────────────────

function GamePage({
  world,
  game,
  levels,
  error,
  open,
}: {
  world: SubjectWorld;
  game: SubjectGameId;
  levels: GameLevel[];
  error: string | null;
  open: number;
}) {
  const ns = WORLD_NS[world];
  const { t } = useTranslation('games');
  const tn = useTranslation(ns).t;
  const next = suggestedLevel(levels);
  const nextName = t(`levels.names.${levelKey(next)}`);
  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={tn('title').toUpperCase()} right={<Wallet compact />} onBack={() => back(href(world))} />
      <View style={styles.hero}>
        <SubjectCover game={game} size={76} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title} accessibilityRole="header">
            {tn(`games.${game}.name` as never)}
          </Text>
          <Text style={styles.tagline}>{tagline(tn, game)}</Text>
        </View>
      </View>

      {error ? (
        <Notice text={error} />
      ) : (
        <View style={{ gap: 12 }}>
          <PrimaryButton
            title={`${levels.find((l) => l.level === next)?.bestStars ? t('levels.replay', { level: next }) : t('levels.play', { level: next })} · ${nextName}`}
            icon="arrow-forward"
            onPress={() => router.push(href(world, game, next))}
          />
          <TimerSwitch />
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Text style={styles.section}>{t('levels.title')}</Text>
        <Text style={styles.small}>{t('levels.openNote', { open })}</Text>
        <View style={styles.list}>
          {levels.map((l, k) => (
            <LevelRow key={l.level} world={world} game={game} l={l} first={k === 0} disabled={!!error} />
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.section}>{t('levels.howToPlay')}</Text>
        <View style={styles.card}>
          <HowToPlay world={world} game={game} />
        </View>
      </View>
    </Screen>
  );
}

function LevelRow({
  world,
  game,
  l,
  first,
  disabled,
}: {
  world: SubjectWorld;
  game: SubjectGameId;
  l: GameLevel;
  first: boolean;
  disabled: boolean;
}) {
  const { t } = useTranslation('games');
  const tw = useTranslation('world').t;
  const name = t(`levels.names.${levelKey(l.level)}`);
  const depth = tw(`subjectHub.depth.${depthOf(l.level)}`);
  const accent = SUBJECT_ACCENT[game];
  const status = l.unlocked
    ? `${t('levels.starsA11y', { count: l.bestStars })}${l.bestScore ? `. ${t('levels.best', { score: l.bestScore })}` : ''}`
    : t('levels.locked', { level: l.level - 1 });
  return (
    <Pressable
      disabled={!l.unlocked || disabled}
      onPress={() => router.push(href(world, game, l.level))}
      accessibilityRole="button"
      accessibilityLabel={`${t('levels.level', { level: l.level })}: ${name}. ${depth}. ${status}`}
      accessibilityState={{ disabled: !l.unlocked || disabled }}
      style={({ pressed }) => [styles.level, !first && styles.rowLine, pressed && { backgroundColor: W.page }]}>
      <View
        style={[
          styles.badge,
          l.bestStars > 0 && { backgroundColor: accent, borderColor: accent },
          !l.unlocked && { borderColor: W.line },
        ]}>
        <Text style={[styles.badgeText, l.bestStars > 0 && { color: '#fff' }, !l.unlocked && { color: W.muted }]}>{l.level}</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={[styles.levelName, !l.unlocked && { color: W.muted }]}>{name}</Text>
        <Text style={styles.small}>{l.unlocked ? depth : t('levels.locked', { level: l.level - 1 })}</Text>
      </View>
      {l.unlocked ? (
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[0, 1, 2].map((i) => (
              <Ionicons key={i} name={i < l.bestStars ? 'star' : 'star-outline'} size={15} color={i < l.bestStars ? '#E2A100' : W.lineStrong} />
            ))}
          </View>
          {l.bestScore > 0 && <Text style={styles.metaText}>{t('levels.best', { score: l.bestScore })}</Text>}
        </View>
      ) : (
        <Ionicons name="lock-closed-outline" size={18} color={W.muted} />
      )}
    </Pressable>
  );
}

/** The rules (games.<id>.rules.r1…r5 and .example, or `how`), and the game's drawn example if it has one. */
export function HowToPlay({ world, game }: { world: SubjectWorld; game: SubjectGameId }) {
  const ns = WORLD_NS[world];
  const tn = useTranslation(ns).t;
  const { t } = useTranslation('games');
  const raw = tn(`games.${game}.rules` as never, { returnObjects: true } as never) as unknown;
  const rules =
    raw && typeof raw === 'object'
      ? Array.isArray(raw)
        ? (raw as string[])
        : (['r1', 'r2', 'r3', 'r4', 'r5'] as const).flatMap((k) => {
            const v = (raw as Record<string, unknown>)[k];
            return typeof v === 'string' ? [v] : [];
          })
      : [];
  const example = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>).example : undefined;
  const list = rules.length ? rules : [tn(`games.${game}.how` as never)];
  const HowTo = frameOf(game).HowTo;
  return (
    <View style={{ gap: 14 }}>
      {list.map((r, i) => (
        <View key={i} style={styles.rule}>
          <View style={styles.ruleNumber}>
            <Text style={{ fontFamily: FONT, fontSize: 13, color: W.ink }}>{i + 1}</Text>
          </View>
          <Text style={styles.ruleText}>{r}</Text>
        </View>
      ))}
      {(HowTo || typeof example === 'string') && (
        <View style={styles.example}>
          <Text style={styles.eyebrow}>{t('ui.example').toUpperCase()}</Text>
          {HowTo && <HowTo />}
          {typeof example === 'string' && <Text style={styles.exampleNote}>{example}</Text>}
        </View>
      )}
    </View>
  );
}

function RulesSheet({
  world,
  game,
  visible,
  first,
  onClose,
}: {
  world: SubjectWorld;
  game: SubjectGameId;
  visible: boolean;
  first?: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('games');
  const tn = useTranslation(WORLD_NS[world]).t;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.sheet} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ gap: 18, padding: 22 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <SubjectCover game={game} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>{t('levels.howToPlay').toUpperCase()}</Text>
                <Text style={styles.sheetTitle} accessibilityRole="header">
                  {tn(`games.${game}.name` as never)}
                </Text>
              </View>
            </View>
            <HowToPlay world={world} game={game} />
            <PrimaryButton title={first ? t('ui.start') : t('ui.gotIt')} icon={first ? 'arrow-forward' : undefined} onPress={onClose} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Playing ──────────────────────────────────────────────────────────────────

function PlayScreen<R extends AnyRun>({
  world,
  game,
  level,
  max,
  g,
  render,
}: {
  world: SubjectWorld;
  game: SubjectGameId;
  level: number;
  max: number;
  g: Runner<R>;
  render: (run: R, ctx: { hold: boolean }) => ReactNode;
}) {
  const ns = WORLD_NS[world];
  const { t } = useTranslation('games');
  const tn = useTranslation(ns).t;
  const tw = useTranslation('world').t;
  const { seen, markSeen } = useRulesSeen(game);
  const [help, setHelp] = useState(false);
  const [paused, setPaused] = useState(false);
  const [confirm, setConfirm] = useState<'quit' | 'restart' | null>(null);
  const [asking, setAsking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { start, quit } = g;
  const quitRef = useRef(quit);
  useEffect(() => {
    quitRef.current = quit;
  });

  // The rules come first on the first game of each kind; the run starts once they're closed.
  useEffect(() => {
    if (seen !== true) return;
    void start(game as never, level);
  }, [seen, game, level, attempt, start]);
  // Leaving this screen (back, another level) ends an unfinished run without rewards.
  useEffect(() => () => void quitRef.current(), []);

  const name = tn(`games.${game}.name` as never);
  const subtitle = t('ui.levelName', { level, name: t(`levels.names.${levelKey(level)}`) });
  const firstRules = seen === false;
  const hold = paused || asking || !!confirm || help || firstRules;
  const run = g.run && g.run.game === game ? g.run : null;
  const leave = () => back(href(world, game));
  const restart = () => {
    setConfirm(null);
    setPaused(false);
    void quit().then(() => setAttempt((a) => a + 1));
  };

  if (g.summary && run)
    return (
      <SubjectResult
        world={world}
        game={game}
        level={level}
        max={max}
        summary={g.summary}
        run={run}
        onNext={() => router.setParams({ level: String(level + 1) })}
        onReplay={() => {
          g.close();
          setAttempt((a) => a + 1);
        }}
        onBack={leave}
      />
    );

  const playing = run?.status === 'playing' ? run : null;
  const hearts = frameOf(game).hearts !== false && typeof playing?.hearts === 'number';

  return (
    <GameBackground>
      <GameTopBar
        title={name}
        subtitle={subtitle}
        onLeave={() => (playing ? setConfirm('quit') : leave())}
        onHelp={() => setHelp(true)}
        onPause={() => setPaused(true)}
      />
      {playing ? (
        <>
          <StatusRow>
            {hearts ? <HeartsStat left={playing.hearts!} /> : <View />}
            <Pressable
              onPress={() => setAsking(true)}
              accessibilityRole="button"
              accessibilityLabel={tw('subjectHub.askA11y', { cost: ASK_COST })}
              hitSlop={6}
              style={({ pressed }) => [styles.ask, pressed && { backgroundColor: W.key }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={W.ink} />
              <Text style={styles.askText}>{tw('subjectHub.ask')}</Text>
              <Text style={styles.askCost}>{ASK_COST}</Text>
            </Pressable>
          </StatusRow>
          <View style={styles.stage}>{render(playing, { hold })}</View>
        </>
      ) : g.error && !g.busy ? (
        <SafeAreaView edges={['bottom']} style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={W.muted} />
          <Text style={styles.errorText}>{g.error}</Text>
          <View style={{ width: '100%', maxWidth: 360, gap: 10 }}>
            <PrimaryButton
              title={t('ui.retry')}
              icon="refresh"
              onPress={() => {
                g.setError(null);
                setAttempt((a) => a + 1);
              }}
            />
            <SecondaryButton title={tw('subjectHub.backToLevels')} onPress={leave} />
          </View>
        </SafeAreaView>
      ) : (
        <View style={styles.center} accessibilityLiveRegion="polite">
          <ActivityIndicator color={W.ink} />
          <Text style={{ fontFamily: Fonts.semibold, color: W.inkSoft, marginTop: 12 }}>{t('ui.loading')}</Text>
        </View>
      )}

      {!!g.error && playing && (
        <Pressable onPress={() => g.setError(null)} style={styles.toast} accessibilityRole="alert">
          <Ionicons name="cloud-offline-outline" size={18} color="#fff" />
          <Text style={{ flex: 1, color: '#fff', fontFamily: Fonts.semibold }}>{g.error}</Text>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
      )}

      <RulesSheet
        world={world}
        game={game}
        visible={firstRules || help}
        first={firstRules}
        onClose={() => {
          if (firstRules) markSeen();
          setHelp(false);
        }}
      />
      <AskKora visible={asking} onClose={() => setAsking(false)} onAsk={g.ask} />
      <PauseMenu
        visible={paused && !confirm}
        title={name}
        subtitle={subtitle}
        onResume={() => setPaused(false)}
        onRestart={() => setConfirm('restart')}
        onQuit={() => setConfirm('quit')}
        onHelp={() => {
          setPaused(false);
          setHelp(true);
        }}
      />
      <ConfirmDialog
        visible={confirm === 'restart'}
        title={t('ui.restartTitle')}
        body={t('ui.restartBody')}
        confirmLabel={t('ui.restart')}
        onConfirm={restart}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'quit'}
        icon="exit-outline"
        destructive
        title={t('ui.quitTitle')}
        body={t('ui.quitBody')}
        confirmLabel={t('ui.quit')}
        onConfirm={() => {
          setConfirm(null);
          setPaused(false);
          leave();
        }}
        onCancel={() => setConfirm(null)}
      />
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: W.inkSoft, marginTop: -8 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  facts: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  fact: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  factLine: { width: 1, backgroundColor: W.line },
  factValue: { fontFamily: FONT, fontSize: 20, color: W.ink, fontVariant: ['tabular-nums'] },
  factLabel: { fontFamily: Fonts.semibold, fontSize: 12, color: W.muted, textAlign: 'center' },
  section: { fontFamily: FONT, fontSize: 18, letterSpacing: -0.2, color: W.ink },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14, minHeight: 88 },
  rowLine: { borderTopWidth: 1, borderTopColor: W.line },
  name: { fontFamily: FONT, fontSize: 17, letterSpacing: -0.2, color: W.ink },
  tagline: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2 },
  metaText: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: W.lineStrong, marginHorizontal: 2 },
  ladder: { gap: 10, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  scale: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  step: { flex: 1, borderRadius: 3, backgroundColor: W.lineStrong },
  scaleEnds: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  note: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
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
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { fontFamily: FONT, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: W.ink },
  card: { padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  level: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 64 },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: FONT, fontSize: 14, color: W.ink },
  levelName: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  rule: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ruleText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
  example: { gap: 12, padding: 16, borderRadius: 14, backgroundColor: W.page, borderWidth: 1, borderColor: W.line },
  exampleNote: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft, textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(14,16,32,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, maxHeight: '92%', borderRadius: 20, backgroundColor: W.surface },
  sheetTitle: { fontFamily: FONT, fontSize: 22, color: W.ink, letterSpacing: -0.3 },
  stage: { flex: 1, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { fontFamily: Fonts.semibold, fontSize: 16, color: W.ink, textAlign: 'center', maxWidth: 420 },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  askText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  askCost: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: '#5C3700',
    backgroundColor: W.rareSoft,
    paddingHorizontal: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 110,
    maxWidth: 520,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: W.ink,
  },
});
