import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { ConfirmDialog } from '@/components/world/overlays';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import type { ReportableType } from '@/lib/api';
import { useSafety } from '@/lib/safety/store';

type Pending =
  { kind: 'player'; id: string; name: string } | { kind: 'content'; type: ReportableType; id: string; name: string };

/** Screen 231: blocked players and hidden content, with unblock / unhide. */
export default function BlockedScreen() {
  const { t } = useTranslation('help');
  const { safety, unblock, unhide } = useSafety();
  const [tab, setTab] = useState<'players' | 'content'>('players');
  const [pending, setPending] = useState<Pending | null>(null);
  const fmt = (at: number) => formatDate(at, { day: 'numeric', month: 'short', year: 'numeric' });

  const confirm = async () => {
    if (!pending) return;
    if (pending.kind === 'player') await unblock(pending.id);
    else await unhide(pending.type, pending.id);
    setPending(null);
  };

  const list =
    tab === 'players'
      ? safety.blockedUsers.map((b) => ({
          key: b.id,
          title: b.name,
          sub: t('blocked.blockedOn', { date: fmt(b.at) }),
          pending: { kind: 'player' as const, id: b.id, name: b.name },
        }))
      : safety.hidden.map((h) => ({
          key: `${h.type}:${h.id}`,
          title: h.title,
          sub: t('blocked.hiddenOn', { type: t(`blocked.types.${h.type}`), date: fmt(h.at) }),
          pending: { kind: 'content' as const, type: h.type, id: h.id, name: h.title },
        }));

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('ui.safetyEyebrow')} title={t('blocked.title')} />
      <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
        <Chip
          label={t('blocked.playersTab', { count: safety.blockedUsers.length })}
          selected={tab === 'players'}
          onPress={() => setTab('players')}
        />
        <Chip
          label={t('blocked.contentTab', { count: safety.hidden.length })}
          selected={tab === 'content'}
          onPress={() => setTab('content')}
        />
      </View>
      <Text variant="small" color={Colors.textSecondary}>
        {tab === 'players' ? t('blocked.playersIntro') : t('blocked.contentIntro')}
      </Text>

      {list.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
          <Ionicons name={tab === 'players' ? 'people-outline' : 'eye-outline'} size={34} color={Colors.textMuted} />
          <Text variant="heading">{tab === 'players' ? t('blocked.noPlayers') : t('blocked.noContent')}</Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {tab === 'players' ? t('blocked.noPlayersHint') : t('blocked.noContentHint')}
          </Text>
        </Card>
      ) : (
        list.map((row) => (
          <Card key={row.key} style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name={tab === 'players' ? 'person' : 'eye-off'} size={18} color={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {row.title}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {row.sub}
              </Text>
            </View>
            <Button
              variant="secondary"
              title={tab === 'players' ? t('blocked.unblock') : t('blocked.show')}
              style={{ minWidth: 96 }}
              onPress={() => setPending(row.pending)}
            />
          </Card>
        ))
      )}

      <ConfirmDialog
        visible={!!pending}
        icon={pending?.kind === 'player' ? 'person-add' : 'eye'}
        title={pending?.kind === 'player' ? t('blocked.unblockTitle', { name: pending.name }) : t('blocked.showTitle')}
        body={pending?.kind === 'player' ? t('blocked.unblockBody') : t('blocked.showBody')}
        confirmLabel={pending?.kind === 'player' ? t('blocked.unblock') : t('blocked.showAgain')}
        cancelLabel={t('actions.cancel', { ns: 'common' })}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
