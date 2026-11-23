import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { Avatar } from '@/components/world/avatar';
import { Coin, Meter } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { QuestChest, QuestItem, QuestPlace } from '@/lib/api';
import { questRoute } from '@/lib/quests/art';
import type { QuestReward } from '@/lib/quests/use-quests';
import { DEFAULT_AVATAR, getItem } from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';

/** A quest's title in the learner's language. */
export function useQuestTitle() {
  const { t } = useTranslation('quests');
  return (q: Pick<QuestItem, 'id' | 'target'>) => t(`titles.${q.id}` as 'titles.mix', { count: q.target });
}

/** Each place's mark: an icon on a soft square in its accent. */
const PLACE: Record<QuestPlace, { icon: keyof typeof Ionicons.glyphMap; accent: string }> = {
  english: { icon: 'text-outline', accent: '#6A45FF' },
  chemistry: { icon: 'flask-outline', accent: '#0F7A82' },
  space: { icon: 'planet-outline', accent: '#2F55C8' },
  history: { icon: 'library-outline', accent: '#9A6A12' },
  any: { icon: 'compass-outline', accent: '#16192E' },
};

export function PlaceIcon({ place, size = 40 }: { place: QuestPlace; size?: number }) {
  const p = PLACE[place] ?? PLACE.any;
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size * 0.25, backgroundColor: `${p.accent}1A`, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={p.icon} size={size * 0.52} color={p.accent} />
    </View>
  );
}

/** A quest in the list: where, what, progress, and its reward or Claim. */
export function QuestCard({
  quest,
  index,
  onOpen,
  onClaim,
  busy,
}: {
  quest: QuestItem;
  index: number;
  onOpen: () => void;
  onClaim?: () => void;
  busy?: boolean;
}) {
  const { t } = useTranslation('quests');
  const title = useQuestTitle()(quest);
  const ready = quest.done && !quest.claimed;
  return (
    <Animated.View entering={FadeIn.delay(index * 40).duration(200)} style={[styles.row, index > 0 && styles.rowLine]}>
      {/* The row opens its details; Claim sits beside that, not inside it (no button in a button). */}
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${t('progress', { progress: quest.progress, target: quest.target })}`}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}>
        <PlaceIcon place={quest.place} />
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={[styles.title, quest.claimed && { color: W.muted }]}>{title}</Text>
          <Meter value={quest.progress / quest.target} color={quest.done ? W.correct : W.ink} />
          <Text style={styles.meta}>{t('progress', { progress: quest.progress, target: quest.target })}</Text>
        </View>
      </Pressable>
      {quest.claimed ? (
        <View style={styles.claimed}>
          <Ionicons name="checkmark-circle" size={18} color={W.correct} />
          <Text style={[styles.meta, { color: W.correct, fontFamily: Fonts.bold }]}>{t('claimed')}</Text>
        </View>
      ) : ready && onClaim ? (
        <Pressable
          onPress={onClaim}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={t('claimA11y', { title })}
          style={({ pressed }) => [styles.claim, pressed && { backgroundColor: '#2A2E4A' }]}>
          <Text style={{ fontFamily: Fonts.bold, color: '#fff', fontSize: 14 }}>{t('claim')}</Text>
        </Pressable>
      ) : (
        <RewardChip xp={quest.xp} coins={quest.coins} />
      )}
    </Animated.View>
  );
}

function RewardChip({ xp, coins }: { xp: number; coins: number }) {
  const { t } = useTranslation('quests');
  if (!xp && !coins) return null;
  return (
    <View style={{ alignItems: 'flex-end', gap: 2 }}>
      {!!xp && (
        <View style={styles.reward}>
          <Ionicons name="flash" size={12} color={W.focus} />
          <Text style={styles.rewardText}>{t('xp', { count: xp })}</Text>
        </View>
      )}
      {!!coins && (
        <View style={styles.reward}>
          <Coin size={12} />
          <Text style={styles.rewardText}>{t('coins', { count: coins })}</Text>
        </View>
      )}
    </View>
  );
}

/** The day's chests: three milestones that open as quests are claimed. */
export function ChestRow({ chests, onOpen, busy }: { chests: QuestChest[]; onOpen: (i: number) => void; busy?: boolean }) {
  const { t } = useTranslation('quests');
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.eyebrow}>{t('chests.title').toUpperCase()}</Text>
      <View style={styles.chests}>
        {chests.map((c, i) => {
          const ready = c.ready && !c.claimed;
          return (
            <Pressable
              key={i}
              disabled={!ready || busy}
              onPress={() => onOpen(i)}
              accessibilityRole="button"
              accessibilityState={{ disabled: !ready }}
              accessibilityLabel={t('chests.a11y', {
                n: i + 1,
                state: c.claimed ? t('chests.opened') : c.ready ? t('chests.ready') : t('chests.locked'),
              })}
              style={({ pressed }) => [styles.chest, ready && { borderColor: W.ink, borderWidth: 1.5 }, pressed && { backgroundColor: W.page }]}>
              <Ionicons
                name={c.claimed ? 'checkmark-circle' : ready ? 'gift' : 'gift-outline'}
                size={24}
                color={c.claimed ? W.correct : ready ? W.ink : W.muted}
              />
              <Text style={[styles.meta, ready && { color: W.ink, fontFamily: Fonts.bold }]}>
                {c.claimed ? t('chests.opened') : ready ? t('chests.open') : t('chests.after', { count: c.after ?? 0 })}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** A quest opened up: where it's played, how, progress, rewards, and Go. */
export function QuestDetail({ quest, kind, onClose }: { quest: QuestItem | null; kind: 'daily' | 'weekly' | 'journey'; onClose: () => void }) {
  const { t } = useTranslation('quests');
  const titleOf = useQuestTitle();
  const route = quest && questRoute(quest);
  return (
    <Modal visible={!!quest} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {quest && (
          <Animated.View entering={ZoomIn.duration(180)} style={styles.dialog} accessibilityViewIsModal>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <PlaceIcon place={quest.place} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>{`${t(`places.${quest.place}`)} · ${t(`kind.${kind}`)}`.toUpperCase()}</Text>
                <Text style={styles.dialogTitle} accessibilityRole="header">
                  {titleOf(quest)}
                </Text>
              </View>
            </View>
            <Text style={styles.body}>{t(`how.${quest.place}`)}</Text>
            <Meter value={quest.progress / quest.target} color={quest.done ? W.correct : W.ink} height={6} />
            <Text style={[styles.meta, { textAlign: 'center' }]}>{t('progress', { progress: quest.progress, target: quest.target })}</Text>
            {(quest.xp > 0 || quest.coins > 0) && (
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <RewardChip xp={quest.xp} coins={quest.coins} />
              </View>
            )}
            {route && !quest.done && (
              <PrimaryButton
                title={t('goTo', { place: t(`places.${quest.place}`) })}
                icon="arrow-forward"
                onPress={() => {
                  onClose();
                  router.push(route);
                }}
              />
            )}
            <Pressable onPress={onClose} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>{t('back')}</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

/** What a claimed quest or an opened chest gave. */
export function RewardBurst({ reward, onCollect }: { reward: QuestReward | null; onCollect: () => void }) {
  const { t } = useTranslation('quests');
  return (
    <Modal visible={!!reward} transparent animationType="fade" onRequestClose={onCollect}>
      <View style={styles.backdrop}>
        {reward && (
          <Animated.View entering={ZoomIn.duration(200)} style={[styles.dialog, { alignItems: 'center' }]} accessibilityViewIsModal accessibilityLiveRegion="polite">
            <View style={styles.giftMark}>
              <Ionicons name={reward.kind === 'quest' ? 'checkmark' : 'gift'} size={28} color="#fff" />
            </View>
            <Text style={[styles.dialogTitle, { textAlign: 'center' }]} accessibilityRole="header">
              {reward.kind === 'quest' ? t('reward.complete') : t('reward.chest')}
            </Text>
            {!!reward.title && <Text style={[styles.body, { textAlign: 'center' }]}>{reward.title}</Text>}
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {reward.xp > 0 && (
                <View style={styles.prize}>
                  <Ionicons name="flash" size={22} color={W.focus} />
                  <Text style={styles.prizeText}>{t('xp', { count: reward.xp })}</Text>
                </View>
              )}
              {reward.coins > 0 && (
                <View style={styles.prize}>
                  <Coin size={22} />
                  <Text style={styles.prizeText}>{t('coins', { count: reward.coins })}</Text>
                </View>
              )}
              {!!reward.item && <ItemPrize id={reward.item} />}
            </View>
            <View style={{ alignSelf: 'stretch' }}>
              <PrimaryButton title={t('reward.collect')} onPress={onCollect} />
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

/** An avatar item won from a chest, shown on the learner's own avatar. */
function ItemPrize({ id }: { id: string }) {
  const { t } = useTranslation('quests');
  const { avatar } = useWorld();
  const item = getItem(id);
  const base = avatar ?? DEFAULT_AVATAR;
  const slot = item?.slot;
  const preview = { ...base, ...(slot === 'hat' || slot === 'glasses' || slot === 'outfit' || slot === 'background' ? { [slot]: id } : {}) };
  return (
    <View style={styles.prize}>
      <Avatar config={preview} size={56} />
      <Text style={[styles.prizeText, { fontSize: 13, textAlign: 'center', maxWidth: 120 }]}>{item?.name ?? id}</Text>
      <Text style={styles.meta}>{t('reward.item')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14 },
  rowLine: { borderTopWidth: 1, borderTopColor: W.line },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  title: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  meta: { fontFamily: Fonts.semibold, fontSize: 12, color: W.muted },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardText: { fontFamily: Fonts.bold, fontSize: 12, color: W.ink },
  claim: { paddingHorizontal: 16, minHeight: 40, justifyContent: 'center', borderRadius: 999, backgroundColor: W.ink },
  claimed: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  chests: { flexDirection: 'row', gap: 8 },
  chest: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    minHeight: 80,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(14,16,32,0.5)' },
  dialog: { width: '100%', maxWidth: 440, gap: 14, padding: 22, borderRadius: 20, backgroundColor: W.surface },
  dialogTitle: { fontFamily: FONT, fontSize: 21, letterSpacing: -0.3, color: W.ink },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  linkText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft, textDecorationLine: 'underline' },
  giftMark: { width: 56, height: 56, borderRadius: 28, backgroundColor: W.ink, alignItems: 'center', justifyContent: 'center' },
  prize: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: W.page,
    borderWidth: 1,
    borderColor: W.line,
  },
  prizeText: { fontFamily: FONT, fontSize: 17, color: W.ink },
});
