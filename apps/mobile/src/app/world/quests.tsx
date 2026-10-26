import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BOLD, Coins, KoraTip, PANEL, RoundButton } from '@/components/lab/hud';
import { JourneyMap } from '@/components/quests/journey';
import { ChestRow, QuestCard, QuestDetail, RewardBurst, useQuestTitle } from '@/components/quests/quest-ui';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { QuestItem } from '@/lib/api';
import { USE_MOCKS } from '@/lib/config';
import { QUEST_ART } from '@/lib/quests/art';
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
 * World Quests: the quest board (daily and weekly quests across Knowzone World's places, daily
 * chests) and the weekly journey map. Progress comes from games played; rewards are paid by the server.
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
  const resets = b ? (tab === 'daily' ? b.daily.resetsIn : b.weekly.resetsIn) : 0;

  return (
    <View style={styles.root}>
      <Image source={QUEST_ART.board} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,10,30,0.35)' }]} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.bar}>
          <RoundButton icon="arrow-back" label={t('back')} onPress={() => router.back()} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>{t('title')}</Text>
          </View>
          <Coins />
        </View>
        <View style={styles.meta}>
          <View style={styles.streak}>
            <Ionicons name="flame" size={16} color="#FF8A3D" />
            <Text style={{ fontFamily: BOLD, color: '#fff' }}>{t('streak', { count: user?.streak ?? 0 })}</Text>
          </View>
          {!!b && (
            <Text style={{ color: 'rgba(235,238,255,0.9)', fontSize: 12 }}>
              {tab === 'daily' ? t('newIn', { time: left(resets) }) : t('endsIn', { time: left(b.weekly.resetsIn) })}
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
              <Text style={{ fontFamily: BOLD, color: tab === id ? '#3A2600' : '#fff' }}>{t(`tabs.${id}`)}</Text>
            </Pressable>
          ))}
        </View>

        {USE_MOCKS || (!b && q.error) ? (
          <View style={{ padding: Spacing.md }}>
            <KoraTip text={USE_MOCKS ? t('offline') : (q.error ?? '')} />
          </View>
        ) : !b ? null : tab === 'journey' ? (
          <View style={{ flex: 1, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
            <Text style={[styles.title, { fontSize: 18, marginBottom: 6 }]}>{t('journey.title')}</Text>
            <JourneyMap journey={b.journey} busy={q.busy} onOpenChest={() => void q.openChest('journey')} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            <View style={styles.board}>
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
            {tab === 'daily' && (
              <ChestRow chests={b.daily.chests} busy={q.busy} onOpen={(i) => void q.openChest('daily', i)} />
            )}
          </ScrollView>
        )}
        {!!q.error && !!b && (
          <Pressable onPress={() => q.setError(null)} style={styles.toast} accessibilityRole="alert">
            <Ionicons name="alert-circle" size={18} color="#fff" />
            <Text style={{ flex: 1, color: '#fff' }}>{q.error}</Text>
          </Pressable>
        )}
      </SafeAreaView>
      <QuestDetail quest={open?.quest ?? null} kind={open?.kind ?? 'daily'} onClose={() => setOpen(null)} />
      <RewardBurst reward={q.reward} onCollect={q.dismiss} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0F2A' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  title: { fontFamily: BOLD, fontSize: 30, color: '#FBE7B8', textShadowColor: '#000', textShadowRadius: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, marginTop: 4 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: PANEL,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: 4,
    borderRadius: 999,
    backgroundColor: PANEL,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  tabOn: { backgroundColor: Colors.reward },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.md },
  board: {
    gap: 14,
    padding: 14,
    paddingTop: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(92,54,24,0.82)',
    borderWidth: 4,
    borderColor: '#5A3415',
  },
  toast: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 14,
    backgroundColor: 'rgba(255,90,122,0.92)',
  },
});
