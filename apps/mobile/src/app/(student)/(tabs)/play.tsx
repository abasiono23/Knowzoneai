import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GameCover } from '@/components/games/cover';
import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { PlaceIcon, useQuestTitle } from '@/components/quests/quest-ui';
import { Avatar } from '@/components/world/avatar';
import { WORLD_ACCENT, WorldCover } from '@/components/world/world-cover';
import { Meter, STAR, Wallet, worldStyles } from '@/components/world/world-ui';
import { Screen, Text } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { useQuests } from '@/lib/quests/use-quests';
import { useSession } from '@/lib/session';
import { WORLDS } from '@/lib/world/content';
import { WORLD_STARS } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import type { World } from '@/lib/world/types';

/** The other subject games, each with a drawn mark and its accent (the games' own pages carry the art). */
const SUBJECT_GAMES: { ns: 'lab' | 'space' | 'history' | 'tech' | 'business'; href: string; icon: keyof typeof Ionicons.glyphMap; accent: string }[] = [
  { ns: 'lab', href: '/world/chemistry', icon: 'flask-outline', accent: '#0F7A82' },
  { ns: 'space', href: '/world/space', icon: 'planet-outline', accent: '#2F55C8' },
  { ns: 'history', href: '/world/history', icon: 'library-outline', accent: '#9A6A12' },
  { ns: 'tech', href: '/world/tech', icon: 'hardware-chip-outline', accent: '#6A45FF' },
  { ns: 'business', href: '/world/business', icon: 'briefcase-outline', accent: '#0E8A5F' },
];

/** The Play tab: your profile, today's challenge and quests, the games, and the Knowzone World ladder. */
export default function PlayScreen() {
  const { user } = useSession();
  const { t } = useTranslation('home');
  const { t: tw } = useTranslation('world');
  const w = useWorld();
  const quests = useQuests();
  const tq = useTranslation('quests').t;
  const questTitle = useQuestTitle();
  const flip = useFlipStyle();

  if (!w.ready) return <Screen>{null}</Screen>;

  if (!w.onboarded) {
    return (
      <Screen>
        <View style={styles.invite}>
          <View style={styles.inviteCovers} accessible={false}>
            {WORLDS.map((world, k) => (
              <Animated.View key={world.id} entering={FadeIn.delay(k * 50).duration(220)}>
                <WorldCover world={world.id} size={56} />
              </Animated.View>
            ))}
          </View>
          <Text style={styles.eyebrow}>KNOWZONE WORLD</Text>
          <Text style={[worldStyles.title, { textAlign: 'center' }]} accessibilityRole="header">
            {t('play.invite.title')}
          </Text>
          <Text style={[worldStyles.body, { textAlign: 'center', maxWidth: 460 }]}>{tw('adv.inviteBody')}</Text>
          <View style={{ alignSelf: 'stretch', maxWidth: 420, width: '100%', marginTop: 8 }}>
            <PrimaryButton title={t('play.invite.enter')} icon="arrow-forward" onPress={() => router.push('/world/welcome')} />
          </View>
        </View>
        <WordGamesCard />
      </Screen>
    );
  }

  const daily = quests.boards?.daily.quests ?? [];
  const nextQuest = daily.find((q) => !q.claimed);
  const questDone = daily.filter((q) => q.claimed).length;
  const name = w.avatar?.name || user?.name.split(' ')[0] || t('play.explorer');

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/world/avatar/customize')}
          accessibilityRole="button"
          accessibilityLabel={t('play.customiseAvatar')}>
          {w.avatar ? <Avatar config={w.avatar} size={52} /> : <View style={styles.noAvatar} />}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>KNOWZONE WORLD</Text>
          <Text style={styles.name} numberOfLines={1} accessibilityRole="header">
            {name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={13} color={STAR} />
            <Text style={worldStyles.meta}>{t('play.stars', { count: w.totalStars })}</Text>
          </View>
        </View>
        <Wallet compact />
      </View>

      <View style={styles.shortcuts}>
        <Shortcut icon="calendar-outline" label={t('play.shortcuts.daily')} badge={w.dailyDone ? '✓' : undefined} onPress={() => router.push('/world/daily')} />
        <Shortcut icon="flag-outline" label={t('play.shortcuts.quests')} badge={daily.length ? `${questDone}/${daily.length}` : undefined} onPress={() => router.push('/world/quests')} />
        <Shortcut icon="podium-outline" label={t('play.shortcuts.leagues')} onPress={() => router.push('/world/leaderboard')} />
        <Shortcut icon="medal-outline" label={t('play.shortcuts.badges')} badge={`${Object.keys(w.achieved).length}`} onPress={() => router.push('/world/achievements')} />
      </View>

      {(!w.dailyDone || nextQuest) && (
        <View style={styles.panel}>
          {!w.dailyDone && (
            <Pressable
              onPress={() => router.push('/world/daily')}
              accessibilityRole="button"
              accessibilityLabel={`${t('play.todaysDaily')}. ${w.dailyStreak ? tw('adv.dailyStreak', { count: w.dailyStreak }) : tw('adv.dailyNoStreak')}`}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: W.page }]}>
              <View style={[styles.mark, { backgroundColor: W.rareSoft }]}>
                <Ionicons name="calendar" size={20} color={W.rare} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={worldStyles.strong}>{t('play.todaysDaily')}</Text>
                <Text style={worldStyles.small}>{w.dailyStreak ? tw('adv.dailyStreak', { count: w.dailyStreak }) : tw('adv.dailyNoStreak')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
            </Pressable>
          )}
          {nextQuest && (
            <Pressable
              onPress={() => router.push('/world/quests')}
              accessibilityRole="button"
              accessibilityLabel={`${tq('playCard.title')}: ${questTitle(nextQuest)}. ${nextQuest.progress}/${nextQuest.target}`}
              style={({ pressed }) => [styles.row, !w.dailyDone && styles.rowLine, pressed && { backgroundColor: W.page }]}>
              <PlaceIcon place={nextQuest.place} size={40} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={worldStyles.meta}>
                  {tq('playCard.title')} · {tq('playCard.claimed', { done: questDone, total: daily.length })}
                </Text>
                <Text style={worldStyles.strong}>{questTitle(nextQuest)}</Text>
                <Meter value={nextQuest.progress / nextQuest.target} color={W.correct} />
              </View>
              <Text style={worldStyles.meta}>
                {nextQuest.progress}/{nextQuest.target}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Text style={styles.section}>{tw('adv.tabGames')}</Text>
        <View style={styles.panel}>
          <WordGamesRow />
          {SUBJECT_GAMES.map((g) => (
            <SubjectRow key={g.ns} game={g} first={false} />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <View style={styles.sectionRow}>
          <Text style={styles.section}>{tw('adv.adventure')}</Text>
          <Pressable onPress={() => router.push('/world/select')} accessibilityRole="button" hitSlop={10} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={styles.link}>{tw('adv.allWorlds')}</Text>
          </Pressable>
        </View>
        <Text style={worldStyles.small}>{tw('adv.adventureNote')}</Text>
        <View style={styles.panel}>
          {WORLDS.map((world, k) => (
            <WorldStop key={world.id} world={world} index={k} last={k === WORLDS.length - 1} />
          ))}
        </View>
      </View>

      <View style={styles.footerLinks}>
        <FooterLink icon="person-circle-outline" label={t('play.footer.avatarShop')} href="/world/avatar/customize" />
        <FooterLink icon="briefcase-outline" label={t('play.footer.inventory')} href="/world/inventory" />
        <FooterLink icon="people-outline" label={t('play.footer.friends')} href="/world/friends" />
        <FooterLink icon="settings-outline" label={t('play.footer.settings')} href="/world/settings" />
      </View>
    </Screen>
  );
}

/** One stop on the adventure's route: the world's cover on a line, its stars, or what it needs to open. */
function WorldStop({ world, index, last }: { world: World; index: number; last: boolean }) {
  const { isWorldUnlocked, worldStars, totalStars, seenWorlds } = useWorld();
  const { t } = useTranslation('world');
  const flip = useFlipStyle();
  const open = isWorldUnlocked(world);
  const stars = worldStars(world.id);
  const isNew = open && !seenWorlds.includes(world.id);
  const need = Math.max(0, world.unlockStars - totalStars);
  return (
    <Pressable
      onPress={() => router.push(String(open && !isNew ? `/world/${world.id}/levels` : `/world/unlock/${world.id}`) as Href)}
      accessibilityRole="button"
      accessibilityLabel={open ? t('adv.worldA11y', { name: world.name, stars, max: WORLD_STARS }) : t('adv.worldLockedA11y', { name: world.name, count: need })}
      style={({ pressed }) => [styles.stop, pressed && { backgroundColor: W.page }]}>
      <View style={styles.rail}>
        <View style={[styles.railLine, index === 0 && { top: '50%' }, last && { bottom: '50%' }]} />
        <WorldCover world={world.id} size={52} locked={!open} />
      </View>
      <View style={{ flex: 1, gap: 4, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[worldStyles.strong, { fontSize: 16 }, !open && { color: W.muted }]}>{world.name}</Text>
          {isNew && (
            <View style={styles.newTag}>
              <Text style={styles.newText}>{t('status.new', { ns: 'common' })}</Text>
            </View>
          )}
        </View>
        {open ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={12} color={STAR} />
              <Text style={worldStyles.meta}>{`${stars}/${WORLD_STARS}`}</Text>
            </View>
            <Meter value={stars / WORLD_STARS} color={WORLD_ACCENT[world.id]} height={3} />
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="lock-closed-outline" size={12} color={W.muted} />
            <Text style={worldStyles.meta}>{t('adv.needMore', { count: need })}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
    </Pressable>
  );
}

function SubjectRow({ game, first }: { game: (typeof SUBJECT_GAMES)[number]; first: boolean }) {
  const { t } = useTranslation(game.ns as 'lab');
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={() => router.push(game.href as Href)}
      accessibilityRole="button"
      accessibilityLabel={`${t('entryTitle')}. ${t('entryBody')}`}
      style={({ pressed }) => [styles.row, !first && styles.rowLine, pressed && { backgroundColor: W.page }]}>
      <View style={[styles.mark, { backgroundColor: `${game.accent}1A` }]}>
        <Ionicons name={game.icon} size={22} color={game.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={worldStyles.strong}>{t('entryTitle')}</Text>
        <Text style={worldStyles.small} numberOfLines={2}>
          {t('entryBody')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
    </Pressable>
  );
}

/** The word games, as a row like the subject games: the first row of the games list. */
function WordGamesRow() {
  const { t } = useTranslation('games');
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={() => router.push('/world/english' as Href)}
      accessibilityRole="button"
      accessibilityLabel={`${t('hub.entryTitle')}. ${t('hub.entryBody')}`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: W.page }]}>
      <View style={styles.mark}>
        <GameCover game="hidden-letters" size={40} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={worldStyles.strong}>{t('hub.entryTitle')}</Text>
        <Text style={worldStyles.small} numberOfLines={2}>
          {t('hub.entryBody')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
    </Pressable>
  );
}

/** For players who haven't entered Knowzone World yet: the word games on their own. */
function WordGamesCard() {
  return (
    <View style={styles.panel}>
      <WordGamesRow />
    </View>
  );
}

function Shortcut({ icon, label, badge, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; badge?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge}` : label}
      style={({ pressed }) => [styles.shortcut, pressed && { backgroundColor: W.page }]}>
      <Ionicons name={icon} size={22} color={W.ink} />
      <Text style={styles.shortcutText} numberOfLines={1}>
        {label}
      </Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

function FooterLink({ icon, label, href }: { icon: keyof typeof Ionicons.glyphMap; label: string; href: Href }) {
  return (
    <Pressable onPress={() => router.push(href)} accessibilityRole="button" accessibilityLabel={label} style={styles.footerLink}>
      <Ionicons name={icon} size={20} color={W.inkSoft} />
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  invite: { alignItems: 'center', gap: 12, paddingTop: 32, paddingBottom: 16 },
  inviteCovers: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 320, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  name: { fontFamily: FONT, fontSize: 22, letterSpacing: -0.3, color: W.ink },
  noAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: W.given },
  shortcuts: { flexDirection: 'row', gap: 8 },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  shortcutText: { fontFamily: Fonts.semibold, fontSize: 12, color: W.ink },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.given,
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: 10, color: W.ink },
  panel: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 64 },
  rowLine: { borderTopWidth: 1, borderTopColor: W.line },
  mark: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: { fontFamily: FONT, fontSize: 18, letterSpacing: -0.2, color: W.ink },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontFamily: Fonts.bold, fontSize: 14, color: W.focus },
  stop: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 14, minHeight: 80 },
  rail: { width: 84, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  railLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: W.line },
  newTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: W.focusSoft },
  newText: { fontFamily: Fonts.bold, fontSize: 11, color: W.focus },
  footerLinks: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: W.line },
  footerLink: { alignItems: 'center', gap: 4, padding: 4, minWidth: 64, minHeight: 44 },
});
