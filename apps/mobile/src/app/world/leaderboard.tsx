import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { FONT, W } from '@/components/games/ui';
import { BoardRow } from '@/components/world/board-row';
import { PlayerMenu } from '@/components/world/player-menu';
import { worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { errorText } from '@/i18n/errors';
import { useFlipStyle } from '@/i18n/provider';
import { api, type BoardPlayer, type LeagueBoard, type SchoolBoard } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { DEFAULT_AVATAR } from '@/lib/world/avatar';
import { LEAGUES } from '@/lib/world/social';
import type { AvatarConfig } from '@/lib/world/types';

/** Someone whose privacy hides their avatar: a plain explorer. */
const HIDDEN_AVATAR: AvatarConfig = {
  ...DEFAULT_AVATAR,
  skin: '#8A8FB0',
  hairColor: '#4A4F6B',
  outfit: '#3A4170',
  background: 'galaxy',
};

/** "2d 5h" / "5h 12m" until the week ends. */
function useLeft() {
  const { t } = useTranslation('quests');
  return (ms: number) => {
    const mins = Math.max(0, Math.floor(ms / 60_000));
    const d = Math.floor(mins / 1440);
    return d ? t('dh', { d, h: Math.floor((mins % 1440) / 60) }) : t('hm', { h: Math.floor(mins / 60), m: mins % 60 });
  };
}

/**
 * Screen 151: this week's league (a group of up to 30 learners in your tier, ranked by XP earned this
 * week; the top move up, the bottom move down) and your school's board. Kept on the server.
 */
export default function LeaderboardScreen() {
  const { t } = useTranslation('world');
  const flip = useFlipStyle();
  const left = useLeft();
  const [tab, setTab] = useState<'league' | 'school'>('league');
  const [league, setLeague] = useState<LeagueBoard | null>(null);
  const [school, setSchool] = useState<SchoolBoard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (USE_MOCKS) return;
    Promise.all([api.getLeague(), api.getSchoolBoard()])
      .then(([l, s]) => {
        setLeague(l);
        setSchool(s);
        setError(null);
      })
      .catch((e) => setError(errorText(e)));
  }, []);
  useFocusEffect(load);

  const tier = LEAGUES.find((x) => x.id === (league?.tier ?? 'bronze')) ?? LEAGUES[0]!;
  const rows = tab === 'league' ? (league?.rows ?? []) : (school?.rows ?? []);
  const mine = rows.find((r) => r.me);
  const nameOf = (r: BoardPlayer) =>
    r.me ? t('friends.me', { name: r.name ?? t('friends.you') }) : (r.name ?? t('leaderboard.learner'));

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('leaderboard.title')} />
      <View style={styles.league}>
        <View style={[styles.trophy, { borderColor: tier.color }]}>
          <Ionicons name="trophy-outline" size={26} color={tier.color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.eyebrow}>
            {t('leaderboard.thisWeekEyebrow')}
            {league ? ` · ${t('leaderboard.endsIn', { time: left(league.endsIn) })}` : ''}
          </Text>
          <Text style={styles.title} accessibilityRole="header">
            {t('leaderboard.league', { league: tier.name })}
          </Text>
          <Text style={worldStyles.small}>
            {USE_MOCKS
              ? t('leaderboard.offline')
              : league?.restricted
                ? t('leaderboard.restricted')
                : league && !league.joined
                  ? t('leaderboard.notJoined')
                  : mine
                    ? t('leaderboard.status', {
                        count: league?.promote ?? 5,
                        status: t('leaderboard.myRank', { rank: mine.rank, xp: formatNumber(mine.xp ?? 0) }),
                      })
                    : ''}
          </Text>
        </View>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['league', 'school'] as const).map((id) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            style={[styles.tab, tab === id && styles.tabOn]}>
            <Text style={[styles.tabText, tab === id && { color: '#fff' }]}>{t(`leaderboard.tabs.${id}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/world/friends')}
        accessibilityRole="button"
        accessibilityLabel={t('leaderboard.friends')}>
        <View style={[styles.card, styles.friends]}>
          <Ionicons name="people-outline" size={20} color={W.ink} />
          <Text style={[worldStyles.strong, { flex: 1 }]}>{t('leaderboard.friends')}</Text>
          <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
        </View>
      </Pressable>

      {!!error && (
        <Text style={[worldStyles.small, { color: W.wrong }]}>{error}</Text>
      )}
      {!league && !error && !USE_MOCKS ? (
        <ActivityIndicator color={W.ink} style={{ marginTop: 24 }} />
      ) : tab === 'school' && school && !school.school ? (
        <View style={styles.card}>
          <Text style={worldStyles.small}>{t('leaderboard.noSchool')}</Text>
        </View>
      ) : (
        <>
          {tab === 'school' && school?.school && (
            <Text style={styles.eyebrow}>{t('leaderboard.schoolTitle', { school: school.school }).toUpperCase()}</Text>
          )}
          {rows.length === 0 ? (
            league?.joined || tab === 'school' ? (
              <View style={styles.card}>
                <Text style={worldStyles.small}>{t('leaderboard.empty')}</Text>
              </View>
            ) : null
          ) : (
            <View style={styles.list}>
              {rows.map((r, k) => {
                const promote = tab === 'league' && league ? league.promote : 0;
                const demote = tab === 'league' && league ? league.demote : 0;
                return (
                  <View key={r.id} style={k > 0 && worldStyles.rowLine}>
                    {demote > 0 && k === rows.length - demote && rows.length > promote + demote && (
                      <Zone label={t('leaderboard.demotionZone')} color={W.wrong} icon="arrow-down" />
                    )}
                    <BoardRow
                      rank={r.rank ?? k + 1}
                      name={nameOf(r)}
                      avatar={(r.avatar as AvatarConfig | null) ?? HIDDEN_AVATAR}
                      value={t('leaderboard.xp', { xp: formatNumber(r.xp ?? 0) })}
                      me={r.me}
                      menu={r.me ? undefined : <PlayerMenu id={r.id} name={nameOf(r)} />}
                    />
                    {promote > 0 && k === promote - 1 && k < rows.length - 1 && (
                      <Zone label={t('leaderboard.promotionZone')} color={W.correct} icon="arrow-up" />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      <View style={[styles.card, styles.privacy]}>
        <Ionicons name="shield-checkmark-outline" size={20} color={W.correct} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={worldStyles.small}>{t('leaderboard.privacy')}</Text>
          <Pressable onPress={() => router.push('/world/settings')} accessibilityRole="link" style={{ minHeight: 32, justifyContent: 'center' }}>
            <Text style={[worldStyles.small, { color: W.focus, fontFamily: Fonts.bold }]}>{t('leaderboard.privacyLink')}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function Zone({ label, color, icon }: { label: string; color: string; icon: 'arrow-up' | 'arrow-down' }) {
  return (
    <View style={styles.zone}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.zoneText, { color }]}>{label.toUpperCase()}</Text>
      <View style={[styles.zoneLine, { backgroundColor: color + '55' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  league: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  trophy: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  title: { fontFamily: FONT, fontSize: 22, letterSpacing: -0.3, color: W.ink },
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: W.key },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40, borderRadius: 999 },
  tabOn: { backgroundColor: W.ink },
  tabText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  card: { padding: 14, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  friends: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52 },
  zone: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: W.page },
  zoneText: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 0.8 },
  zoneLine: { flex: 1, height: 1 },
  privacy: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
