import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from '@/components/ui/gradient';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Avatar } from '@/components/world/avatar';
import { Wallet } from '@/components/world/world-ui';
import { Button, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { Colors, Gradients, MaxContentWidth, Radius, Spacing, TabBarHeight, WorldGradients } from '@/constants/theme';
import { COVERS } from '@/lib/games/english';
import { SCENES, STUDENT } from '@/lib/games/lab';
import { EXPLORER, MUSEUM_SCENES } from '@/lib/games/history';
import { PLACE_ICON } from '@/lib/quests/art';
import { CODER, TECH_SCENES } from '@/lib/games/tech';
import { BUSINESS_SCENES, ENTREPRENEUR } from '@/lib/games/business';
import { useQuests } from '@/lib/quests/use-quests';
import { useQuestTitle } from '@/components/quests/quest-ui';
import { ASTRONAUT, SPACE_SCENES } from '@/lib/games/space';
import { useSession } from '@/lib/session';
import { WORLDS } from '@/lib/world/content';
import { useWorld } from '@/lib/world/store';
import type { World } from '@/lib/world/types';

const ROW = 150;
const LAB_HALL = SCENES.hall;
const LAB_STUDENT = STUDENT.back.src;
const SPACE_HALL = SPACE_SCENES.academy;
const SPACE_STUDENT = ASTRONAUT.back.src;
const MUSEUM_HALL = MUSEUM_SCENES.museum;
const MUSEUM_STUDENT = EXPLORER.front.src;
const TECH_HALL = TECH_SCENES.hub;
const TECH_STUDENT = CODER.front.src;
const BUSINESS_HALL = BUSINESS_SCENES.hub;
const BUSINESS_STUDENT = ENTREPRENEUR.front.src;
/** Made with OpenAI (apps/server/scripts/world-art.ts, play-hero-tall): a student scientist and a student gamer. */
const PLAY_HERO = require('@/assets/images/world/play-hero.webp');

/** Screen 131: the Knowzone World map (the Play tab). */
export default function WorldMapScreen() {
  const { user } = useSession();
  const { t } = useTranslation('home');
  const w = useWorld();
  const quests = useQuests();
  const tq = useTranslation('quests').t;
  const questTitle = useQuestTitle();
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width, MaxContentWidth) - Spacing.md * 2;

  if (!w.ready) return <Screen>{null}</Screen>;

  if (!w.onboarded) {
    // Full screen until the learner enters: the picture fills the top, the invitation sits above the tab bar.
    return (
      <LinearGradient
        colors={['#3B2DBF', '#B04CFF', '#FF7A93']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}>
        <SafeAreaView edges={['top']} style={styles.invite}>
          <Animated.View entering={ZoomIn.springify()} style={styles.inviteArt}>
            <Image source={PLAY_HERO} style={StyleSheet.absoluteFill} contentFit="contain" accessible={false} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(250)} style={styles.inviteText}>
            <Text variant="label" color="rgba(255,255,255,0.85)">
              KNOWZONE WORLD
            </Text>
            <Text variant="display" color="#fff" center>
              {t('play.invite.title')}
            </Text>
            <Text color="rgba(255,255,255,0.9)" center>
              {t('play.invite.body')}
            </Text>
          </Animated.View>
          <View style={{ alignSelf: 'stretch' }}>
            <Button title={t('play.invite.enter')} icon="planet" onPress={() => router.push('/world/welcome')} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Today's World Quests (kept on the server).
  const daily = quests.boards?.daily.quests ?? [];
  const nextQuest = daily.find((q) => !q.claimed);
  const questDone = daily.filter((q) => q.claimed).length;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/world/avatar/customize')}
          accessibilityRole="button"
          accessibilityLabel={t('play.customiseAvatar')}>
          {w.avatar ? <Avatar config={w.avatar} size={56} ring={Colors.reward} /> : <View style={styles.noAvatar} />}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="label" color={Colors.reward}>
            KNOWZONE WORLD
          </Text>
          <Text variant="heading" numberOfLines={1}>
            {w.avatar?.name || user?.name.split(' ')[0] || t('play.explorer')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={13} color={Colors.reward} />
            <Text variant="small" color={Colors.textSecondary}>
              {t('play.stars', { count: w.totalStars })}
            </Text>
          </View>
        </View>
        <Wallet />
      </View>

      <View style={styles.shortcuts}>
        <Shortcut
          icon="calendar"
          label={t('play.shortcuts.daily')}
          color={Colors.reward}
          badge={w.dailyDone ? '✓' : '!'}
          onPress={() => router.push('/world/daily')}
        />
        <Shortcut
          icon="flag"
          label={t('play.shortcuts.quests')}
          color={Colors.success}
          badge={daily.length ? `${questDone}/${daily.length}` : undefined}
          onPress={() => router.push('/world/quests')}
        />
        <Shortcut
          icon="podium"
          label={t('play.shortcuts.leagues')}
          color={Colors.info}
          onPress={() => router.push('/world/leaderboard')}
        />
        <Shortcut
          icon="medal"
          label={t('play.shortcuts.badges')}
          color={Colors.danger}
          badge={`${Object.keys(w.achieved).length}`}
          onPress={() => router.push('/world/achievements')}
        />
      </View>

      {!w.dailyDone && (
        <Pressable
          onPress={() => router.push('/world/daily')}
          accessibilityRole="button"
          accessibilityLabel={t('play.dailyChallenge')}>
          <LinearGradient colors={Gradients.reward} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.daily}>
            <Text style={{ fontSize: 30 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" color={Colors.onBright}>
                {t('play.todaysDaily')}
              </Text>
              <Text variant="small" color="rgba(11,16,38,0.75)">
                {w.dailyStreak ? t('play.dailyMetaStreak', { count: w.dailyStreak }) : t('play.dailyMetaNoStreak')}
              </Text>
            </View>
            <Ionicons name="play-circle" size={34} color={Colors.onBright} />
          </LinearGradient>
        </Pressable>
      )}
      {nextQuest && (
        <Pressable
          onPress={() => router.push('/world/quests')}
          accessibilityRole="button"
          accessibilityLabel={`${tq('playCard.title')}: ${questTitle(nextQuest)}`}>
          <Card style={{ gap: Spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Image
                source={PLACE_ICON[nextQuest.place].src}
                style={{ width: 30 * PLACE_ICON[nextQuest.place].aspect, height: 30 }}
                contentFit="contain"
                accessible={false}
              />
              <View style={{ flex: 1 }}>
                <Text variant="label" color={Colors.textMuted}>
                  {tq('playCard.title')} · {tq('playCard.claimed', { done: questDone, total: daily.length })}
                </Text>
                <Text variant="bodyStrong">{questTitle(nextQuest)}</Text>
              </View>
              <Text variant="small" color={Colors.textMuted}>
                {nextQuest.progress}/{nextQuest.target}
              </Text>
            </View>
            <ProgressBar progress={nextQuest.progress / nextQuest.target} height={6} />
          </Card>
        </Pressable>
      )}

      <WordGamesCard />
      <LabCard ns="lab" href="/world/chemistry" scene={LAB_HALL} student={LAB_STUDENT} />
      <LabCard ns="space" href="/world/space" scene={SPACE_HALL} student={SPACE_STUDENT} wide />
      <LabCard ns="history" href="/world/history" scene={MUSEUM_HALL} student={MUSEUM_STUDENT} />
      <LabCard ns="tech" href="/world/tech" scene={TECH_HALL} student={TECH_STUDENT} />
      <LabCard ns="business" href="/world/business" scene={BUSINESS_HALL} student={BUSINESS_STUDENT} />

      <View style={styles.mapHead}>
        <Text variant="heading">{t('play.worldMap')}</Text>
        <Pressable onPress={() => router.push('/world/select')} accessibilityRole="button" hitSlop={8}>
          <Text variant="small" color={Colors.primary}>
            {t('play.allWorlds')}
          </Text>
        </Pressable>
      </View>

      <View style={{ height: WORLDS.length * ROW + 20 }}>
        <Svg width={mapWidth} height={WORLDS.length * ROW} style={StyleSheet.absoluteFill}>
          <Path
            d={WORLDS.map((_, k) => {
              const x = k % 2 ? mapWidth * 0.72 : mapWidth * 0.28;
              const y = k * ROW + 60;
              if (k === 0) return `M${x} ${y}`;
              const px = (k - 1) % 2 ? mapWidth * 0.72 : mapWidth * 0.28;
              return `C${px} ${y - ROW / 2} ${x} ${y - ROW / 2} ${x} ${y}`;
            }).join(' ')}
            stroke={Colors.borderStrong}
            strokeWidth={4}
            strokeDasharray="2 12"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        {WORLDS.map((world, k) => (
          <Island key={world.id} world={world} index={k} left={k % 2 ? mapWidth * 0.72 : mapWidth * 0.28} />
        ))}
      </View>

      <View style={styles.footerLinks}>
        <FooterLink icon="shirt-outline" label={t('play.footer.avatarShop')} href="/world/avatar/customize" />
        <FooterLink icon="briefcase-outline" label={t('play.footer.inventory')} href="/world/inventory" />
        <FooterLink icon="people-outline" label={t('play.footer.friends')} href="/world/friends" />
        <FooterLink icon="settings-outline" label={t('play.footer.settings')} href="/world/settings" />
      </View>
    </Screen>
  );
}

/** Entry to a walkable science place (the chemistry lab, the Space Academy), on the Play tab. */
function LabCard({
  ns,
  href,
  scene,
  student,
  wide,
}: {
  ns: 'lab' | 'space' | 'history' | 'tech' | 'business';
  href: string;
  scene: number;
  student: number;
  /** The space-suited student is wider than the one in a lab coat. */
  wide?: boolean;
}) {
  const { t } = useTranslation(ns);
  return (
    <Pressable
      onPress={() => router.push(href as Href)}
      accessibilityRole="button"
      accessibilityLabel={`${t('entryTitle')}. ${t('entryBody')}`}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={styles.labCard}>
        <Image
          source={scene}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
          accessible={false}
        />
        <LinearGradient colors={['transparent', 'rgba(8,10,30,0.92)']} style={StyleSheet.absoluteFill} />
        <Image
          source={student}
          style={[styles.labStudent, wide && { width: 96 }]}
          contentFit="contain"
          accessible={false}
        />
        <View style={styles.labText}>
          <Text variant="label" color={Colors.reward}>
            {t('entryEyebrow')}
          </Text>
          <Text variant="bodyStrong" color="#fff">
            {t('entryTitle')}
          </Text>
          <Text variant="small" color="rgba(255,255,255,0.85)">
            {t('entryBody')}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#fff"
          style={{ position: 'absolute', right: Spacing.md, bottom: Spacing.md }}
        />
      </View>
    </Pressable>
  );
}

function WordGamesCard() {
  const { t } = useTranslation('games');
  return (
    <Pressable
      onPress={() => router.push('/world/english' as Href)}
      accessibilityRole="button"
      accessibilityLabel={`${t('hub.entryTitle')}. ${t('hub.entryBody')}`}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
      <LinearGradient
        colors={['#1663C7', '#7C5CFF', '#B04CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wordGames}>
        <View style={styles.wordCovers}>
          {(['hidden-letters', 'word-clash', 'spellcaster'] as const).map((g, k) => (
            <Image
              key={g}
              source={COVERS[g]}
              style={[styles.wordCover, { marginLeft: k ? -18 : 0 }]}
              contentFit="contain"
              accessible={false}
            />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" color="#fff">
            {t('hub.entryTitle')}
          </Text>
          <Text variant="small" color="rgba(255,255,255,0.85)">
            {t('hub.entryBody')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

function Island({ world, index, left }: { world: World; index: number; left: number }) {
  const { isWorldUnlocked, worldStars, totalStars, seenWorlds } = useWorld();
  const { t } = useTranslation('home');
  const open = isWorldUnlocked(world);
  const stars = worldStars(world.id);
  const isNew = open && !seenWorlds.includes(world.id);
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)}
      style={[styles.island, { top: index * ROW, left: left - 70 }]}>
      <Pressable
        onPress={() =>
          router.push(
            (isNew ? `/world/unlock/${world.id}` : open ? `/world/${world.id}` : `/world/unlock/${world.id}`) as Href,
          )
        }
        accessibilityRole="button"
        accessibilityLabel={
          open
            ? t('play.islandOpen', { name: world.name, stars })
            : t('play.islandLocked', { name: world.name, count: world.unlockStars })
        }
        style={({ pressed }) => ({ alignItems: 'center', transform: [{ scale: pressed ? 0.95 : 1 }] })}>
        <LinearGradient
          colors={open ? WorldGradients[world.id] : ['#2A3060', '#1A2150']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.disc, stars === 18 && { borderColor: Colors.reward }]}>
          <Text style={{ fontSize: 46, lineHeight: 54, opacity: open ? 1 : 0.35 }}>{world.emoji}</Text>
          {!open && (
            <View style={styles.lock}>
              <Ionicons name="lock-closed" size={12} color={Colors.text} />
              <Text variant="label" style={{ fontSize: 10 }}>
                {world.unlockStars}★
              </Text>
            </View>
          )}
          {isNew && (
            <View style={[styles.lock, { backgroundColor: Colors.danger }]}>
              <Text variant="label" style={{ fontSize: 10 }}>
                {t('status.new', { ns: 'common' })}
              </Text>
            </View>
          )}
        </LinearGradient>
        <Text variant="bodyStrong" style={{ marginTop: 6 }} color={open ? Colors.text : Colors.textMuted}>
          {world.name}
        </Text>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {open ? `${stars}/18 ★` : t('play.moreStars', { count: Math.max(0, world.unlockStars - totalStars) })}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function Shortcut({
  icon,
  label,
  color,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.shortcut, pressed && { opacity: 0.8 }]}>
      <View style={[styles.shortIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text variant="small" style={{ fontSize: 12, fontFamily: 'Manrope_600SemiBold' }}>
        {label}
      </Text>
      {badge && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={{ fontSize: 9, color: Colors.onBright, fontFamily: 'Manrope_800ExtraBold' }}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

function FooterLink({ icon, label, href }: { icon: keyof typeof Ionicons.glyphMap; label: string; href: Href }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.footerLink}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  invite: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: TabBarHeight + Spacing.lg,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  inviteArt: { flex: 1, alignSelf: 'stretch', minHeight: 220 },
  inviteText: { gap: Spacing.sm, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  labCard: { height: 170, borderRadius: Radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  labStudent: { position: 'absolute', left: Spacing.md, bottom: -6, width: 60, height: 150 },
  labText: { paddingLeft: 88, paddingRight: 44, paddingBottom: Spacing.md, gap: 2 },
  wordGames: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    paddingRight: Spacing.md,
    borderRadius: Radius.xl,
  },
  wordCovers: { flexDirection: 'row' },
  wordCover: { width: 46, height: 46 },
  noAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceRaised },
  shortcuts: { flexDirection: 'row', gap: Spacing.xs },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shortIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  daily: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
  mapHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  island: { position: 'absolute', width: 140 },
  disc: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  lock: {
    position: 'absolute',
    bottom: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerLink: { alignItems: 'center', gap: 4, padding: 4 },
});
