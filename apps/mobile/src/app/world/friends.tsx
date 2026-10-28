import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/auth/text-field';
import { BoardRow } from '@/components/world/board-row';
import { PlayerMenu } from '@/components/world/player-menu';
import { Button, Card, IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { errorText } from '@/i18n/errors';
import { api, type BoardPlayer, type FriendsView } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { restrictedFrom } from '@/lib/safety/store';
import { useSession } from '@/lib/session';
import { DEFAULT_AVATAR } from '@/lib/world/avatar';
import { WORLDS } from '@/lib/world/content';
import { levelsOf } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';
import type { AvatarConfig } from '@/lib/world/types';

/**
 * Screen 152: your friends (added with a Knowzone code, kept on the server), their XP this week,
 * friend requests, and practice quiz battles.
 */
export default function FriendsScreen() {
  const { t } = useTranslation('world');
  const { user } = useSession();
  const { isWorldUnlocked, isLevelUnlocked } = useWorld();
  const noBattles = restrictedFrom(user?.restriction?.limits, 'battles');
  const [view, setView] = useState<FriendsView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const load = useCallback(() => {
    if (USE_MOCKS) return;
    api
      .getFriends()
      .then((v) => {
        setView(v);
        setError(null);
      })
      .catch((e) => setError(errorText(e)));
  }, []);
  useFocusEffect(load);

  const act = async (fn: () => Promise<FriendsView>) => {
    setBusy(true);
    try {
      setView(await fn());
      setError(null);
      return true;
    } catch (e) {
      setError(errorText(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const nameOf = (r: BoardPlayer) => r.name ?? t('leaderboard.learner');
  const avatarOf = (r: BoardPlayer) => (r.avatar as AvatarConfig | null) ?? DEFAULT_AVATAR;

  /** A practice battle on level 5 of a world you've unlocked, against your friend's name. */
  const challenge = (r: BoardPlayer) => {
    const open = WORLDS.filter((w) => isWorldUnlocked(w) && isLevelUnlocked(levelsOf(w.id)[4]!));
    const world = open.length ? open[[...r.id].reduce((n, c) => n + c.charCodeAt(0), 0) % open.length]! : WORLDS[0]!;
    router.push({
      pathname: '/world/battle/[levelId]',
      params: { levelId: levelsOf(world.id)[4]!.id, rival: nameOf(r) },
    });
  };

  if (USE_MOCKS)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('friends.eyebrow')} title={t('friends.title')} />
        <Card>
          <Text variant="small">{t('friends.offline')}</Text>
        </Card>
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('friends.eyebrow')} title={t('friends.title')} />
      {noBattles && (
        <Card style={styles.row}>
          <Ionicons name="alert-circle" size={22} color={Colors.reward} />
          <Text variant="small" style={{ flex: 1 }} onPress={() => router.push('/account-status')}>
            {t('friends.paused')}
          </Text>
        </Card>
      )}

      {/* Your code, to share with people you know. */}
      <Card style={{ gap: Spacing.xs }}>
        <Text variant="label" color={Colors.textMuted}>
          {t('friends.codeTitle')}
        </Text>
        <View style={styles.row}>
          <Text variant="title" style={{ flex: 1, letterSpacing: 2 }}>
            {view?.code ?? '…'}
          </Text>
          <Button
            title={copied ? t('friends.copied') : t('friends.copy')}
            icon={copied ? 'checkmark' : 'copy'}
            variant="secondary"
            disabled={!view}
            onPress={() => {
              if (!view) return;
              Clipboard.setStringAsync(view.code).catch(() => {});
              setCopied(true);
            }}
          />
        </View>
        <Text variant="small" color={Colors.textSecondary}>
          {t('friends.codeHint')}
        </Text>
      </Card>

      {/* Add someone by their code. */}
      <Card style={{ gap: Spacing.sm }}>
        <TextField
          label={t('friends.addTitle')}
          icon="person-add"
          placeholder={t('friends.addPlaceholder')}
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={(v) => {
            setCode(v);
            setSent(false);
          }}
          error={error}
          hint={sent ? t('friends.sent') : undefined}
        />
        <Button
          title={t('friends.add')}
          icon="person-add"
          disabled={busy || code.trim().length < 3}
          onPress={async () => {
            if (await act(() => api.addFriend(code.trim()))) {
              setCode('');
              setSent(true);
            }
          }}
        />
      </Card>

      {!view && !error && <ActivityIndicator color={Colors.primary} />}

      {!!view?.incoming.length && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="bodyStrong">{t('friends.requests')}</Text>
          {view.incoming.map((r) => (
            <View key={r.requestId} style={styles.request}>
              <Text style={{ flex: 1 }}>{nameOf(r)}</Text>
              <Pressable
                onPress={() => void act(() => api.removeFriend(r.requestId))}
                disabled={busy}
                accessibilityRole="button"
                style={styles.decline}>
                <Text variant="small">{t('friends.decline')}</Text>
              </Pressable>
              <Pressable
                onPress={() => void act(() => api.acceptFriend(r.requestId))}
                disabled={busy}
                accessibilityRole="button"
                style={styles.accept}>
                <Text variant="small" color={Colors.onBright} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {t('friends.accept')}
                </Text>
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      {view && (
        <Text variant="small" color={Colors.textSecondary}>
          {t('friends.intro')}
        </Text>
      )}
      {view && view.friends.length === 0 && (
        <Card>
          <Text variant="small" color={Colors.textSecondary}>
            {t('friends.none')}
          </Text>
        </Card>
      )}
      {!!view?.friends.length && (
        <Card style={{ padding: Spacing.xs, gap: 2 }}>
          {view.friends.map((r, k) => (
            <BoardRow
              key={r.id}
              rank={k + 1}
              name={nameOf(r)}
              sub={t('friends.streak', { count: r.streak })}
              avatar={avatarOf(r)}
              value={t('leaderboard.xp', { xp: formatNumber(r.xp ?? 0) })}
              menu={
                <View style={styles.rowActions}>
                  {!noBattles && (
                    <IconButton
                      icon="flash"
                      label={t('friends.battle', { name: nameOf(r) })}
                      onPress={() => challenge(r)}
                    />
                  )}
                  <PlayerMenu
                    id={r.id}
                    name={nameOf(r)}
                    remove={{
                      label: t('friends.remove', { name: nameOf(r) }),
                      onPress: () => void act(() => api.removeFriend(r.id)),
                    }}
                  />
                </View>
              }
            />
          ))}
        </Card>
      )}

      {!!view?.outgoing.length && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('friends.waiting')}
          </Text>
          {view.outgoing.map((r) => (
            <View key={r.requestId} style={styles.request}>
              <Text style={{ flex: 1 }}>{nameOf(r)}</Text>
              <Pressable
                onPress={() => void act(() => api.removeFriend(r.requestId))}
                disabled={busy}
                accessibilityRole="button"
                style={styles.decline}>
                <Text variant="small">{t('friends.cancel')}</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      <Button
        title={t('friends.invite')}
        icon="paper-plane"
        variant="secondary"
        onPress={() => router.push('/referrals/invite')}
      />
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('friends.practiceNote')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: Spacing.xs },
  request: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  accept: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill ?? 999,
    backgroundColor: Colors.success,
  },
  decline: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
});
