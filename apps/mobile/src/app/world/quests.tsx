import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { W } from '@/components/games/ui';
import { JourneyMap } from '@/components/quests/journey';
import { ChestRow, QuestCard, QuestDetail, RewardBurst, useQuestTitle } from '@/components/quests/quest-ui';
import { Wallet, worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { QuestItem } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { useQuests } from '@/lib/quests/use-quests';
import { useSession } from '@/lib/session';

type Tab = 'daily' | 'weekly' | 'journey';

/** Time left as "6h 12m" (or "3d 4h" for longer). */
function useLeft() {
  const { t } = useTranslation('quests');
  return (ms: number) => {
    const mins = Math.max(0, Math.floor(ms / 60_000));
    const d = Math.floor(mins / 1440);
    return d ? t('dh', { d, h: Math.floor((mins % 1440) / 60) }) : t('hm', { h: Math.floor(mins / 60), m: mins % 60 });
  };
}

/**
 * World Quests: daily and weekly quests across Knowzone World's games, the day's chests, and the weekly
 * journey. Progress comes from games played; rewards are paid by the server.
 */
export default function QuestsScreen() {
  const { t } = useTranslation('quests');
  const { user } = useSession();
  const q = useQuests();
  const left = useLeft();
  const titleOf = useQuestTitle();
  const [tab, setTab] = useState<Tab>('daily');
  const [open, setOpen] = useState<{ quest: QuestItem; kind: Tab } | null>(null);
  const b = q.boards;
  const list = b ? (tab === 'weekly' ? b.weekly.quests : b.daily.quests) : [];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow="KNOWZONE WORLD" title={t('title')} right={<Wallet compact />} />
      <View style={styles.meta}>
        <View style={styles.pill}>
          <Ionicons name="flame-outline" size={16} color={W.ink} />
          <Text style={styles.pillText}>{t('streak', { count: user?.streak ?? 0 })}</Text>
        </View>
        {!!b && (
          <Text style={worldStyles.meta}>
            {tab === 'daily' ? t('newIn', { time: left(b.daily.resetsIn) }) : t('endsIn', { time: left(b.weekly.resetsIn) })}
          </Text>
        )}
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['daily', 'weekly', 'journey'] as Tab[]).map((id) => (
          <Pressable
            key={id}
            onPress={() => setTab(id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            style={[styles.tab, tab === id && styles.tabOn]}>
            <Text style={[styles.tabText, tab === id && { color: '#fff' }]}>{t(`tabs.${id}`)}</Text>
          </Pressable>
        ))}
      </View>

      {USE_MOCKS || (!b && q.error) ? (
        <View style={styles.notice}>
          <Ionicons name="cloud-offline-outline" size={20} color={W.muted} />
          <Text style={[worldStyles.body, { flex: 1 }]}>{USE_MOCKS ? t('offline') : (q.error ?? '')}</Text>
        </View>
      ) : !b ? null : tab === 'journey' ? (
        <View style={{ gap: 10 }}>
          <Text style={worldStyles.heading}>{t('journey.title')}</Text>
          <JourneyMap journey={b.journey} busy={q.busy} onOpenChest={() => void q.openChest('journey')} />
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {list.map((quest, i) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                index={i}
                busy={q.busy}
                onOpen={() => setOpen({ quest, kind: tab })}
                onClaim={() => void q.claim(tab === 'weekly' ? 'weekly' : 'daily', quest.id, titleOf(quest))}
              />
            ))}
          </View>
          {tab === 'daily' && <ChestRow chests={b.daily.chests} busy={q.busy} onOpen={(i) => void q.openChest('daily', i)} />}
        </>
      )}
      {!!q.error && !!b && (
        <Pressable onPress={() => q.setError(null)} style={styles.toast} accessibilityRole="alert">
          <Ionicons name="alert-circle-outline" size={18} color="#fff" />
          <Text style={{ flex: 1, color: '#fff', fontFamily: Fonts.semibold }}>{q.error}</Text>
        </Pressable>
      )}
      <QuestDetail quest={open?.quest ?? null} kind={open?.kind ?? 'daily'} onClose={() => setOpen(null)} />
      <RewardBurst reward={q.reward} onCollect={q.dismiss} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: -8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    minHeight: 32,
    borderRadius: 999,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  pillText: { fontFamily: Fonts.bold, fontSize: 13, color: W.ink },
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: W.key },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40, borderRadius: 999 },
  tabOn: { backgroundColor: W.ink },
  tabText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: W.wrong },
});
