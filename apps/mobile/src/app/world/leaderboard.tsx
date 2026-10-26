import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BoardRow } from '@/components/world/board-row';
import { PlayerMenu } from '@/components/world/player-menu';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
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
      <LinearGradient
        colors={[tier.color, '#2A2F5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.league}>
        <Text style={{ fontSize: 40 }}>🏆</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" color="rgba(255,255,255,0.85)">
            {t('leaderboard.thisWeekEyebrow')}
            {league ? ` · ${t('leaderboard.endsIn', { time: left(league.endsIn) })}` : ''}
          </Text>
          <Text variant="title" color="#fff">
            {t('leaderboard.league', { league: tier.name })}
          </Text>
          <Text variant="small" color="rgba(255,255,255,0.9)">
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
      </LinearGradient>

      <View style={styles.filters}>
        <ChoiceChip label={t('leaderboard.tabs.league')} selected={tab === 'league'} onPress={() => setTab('league')} />
        <ChoiceChip label={t('leaderboard.tabs.school')} selected={tab === 'school'} onPress={() => setTab('school')} />
      </View>

      <Pressable
        onPress={() => router.push('/world/friends')}
        accessibilityRole="button"
        accessibilityLabel={t('leaderboard.friends')}>
        <Card style={styles.friends}>
          <Ionicons name="people" size={20} color={Colors.info} />
          <Text variant="bodyStrong" style={{ flex: 1 }}>
            {t('leaderboard.friends')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={flip} />
        </Card>
      </Pressable>

      {!!error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      {!league && !error && !USE_MOCKS ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : tab === 'school' && school && !school.school ? (
        <Card>
          <Text variant="small">{t('leaderboard.noSchool')}</Text>
        </Card>
      ) : (
        <>
          {tab === 'school' && school?.school && (
            <Text variant="label" color={Colors.textMuted}>
              {t('leaderboard.schoolTitle', { school: school.school })}
            </Text>
          )}
          {rows.length === 0 ? (
            league?.joined || tab === 'school' ? (
              <Card>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('leaderboard.empty')}
                </Text>
              </Card>
            ) : null
          ) : (
            <Card style={{ padding: Spacing.xs, gap: 2 }}>
              {rows.map((r, k) => {
                const promote = tab === 'league' && league ? league.promote : 0;
                const demote = tab === 'league' && league ? league.demote : 0;
                return (
                  <View key={r.id}>
                    {demote > 0 && k === rows.length - demote && rows.length > promote + demote && (
                      <Zone label={t('leaderboard.demotionZone')} color={Colors.danger} icon="arrow-down" />
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
                      <Zone label={t('leaderboard.promotionZone')} color={Colors.success} icon="arrow-up" />
                    )}
                  </View>
                );
              })}
            </Card>
          )}
        </>
      )}

      <Card style={styles.privacy}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
        <View style={{ flex: 1 }}>
          <Text variant="small">{t('leaderboard.privacy')}</Text>
          <Pressable onPress={() => router.push('/world/settings')} accessibilityRole="link">
            <Text variant="small" color={Colors.primary}>
              {t('leaderboard.privacyLink')}
            </Text>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}

function Zone({ label, color, icon }: { label: string; color: string; icon: 'arrow-up' | 'arrow-down' }) {
  return (
    <View style={styles.zone}>
      <Ionicons name={icon} size={12} color={color} />
      <Text variant="label" color={color} style={{ fontSize: 10 }}>
        {label}
      </Text>
      <View style={[styles.zoneLine, { backgroundColor: color + '66' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  league: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  friends: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  zone: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  zoneLine: { flex: 1, height: 1 },
  privacy: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
});
