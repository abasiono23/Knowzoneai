import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { BOLD, GoldButton } from '@/components/lab/hud';
import { Avatar } from '@/components/world/avatar';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { QuestChest, QuestItem } from '@/lib/api';
import { PLACE_ICON, QUEST_ART, questPicture, questRoute } from '@/lib/quests/art';
import type { QuestReward } from '@/lib/quests/use-quests';
import { DEFAULT_AVATAR, getItem } from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';

const PARCHMENT = ['#FBE7B8', '#F2CF87'] as const;
const PARCHMENT_DONE = ['#FFE07A', '#FFB938'] as const;
const INK = '#4A2C10';

/** A quest's title in the learner's language. */
export function useQuestTitle() {
  const { t } = useTranslation('quests');
  return (q: Pick<QuestItem, 'id' | 'target'>) => t(`titles.${q.id}` as 'titles.mix', { count: q.target });
}

/** A parchment quest card pinned to the board: icon, title, progress, and its reward or Claim. */
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
  const icon = PLACE_ICON[quest.place];
  const ready = quest.done && !quest.claimed;
  return (
    <Animated.View entering={FadeInDown.delay(index * 70)}>
      {/* The card opens its details; Claim sits beside that, not inside it (no button in a button). */}
      <LinearGradient
        colors={ready ? PARCHMENT_DONE : PARCHMENT}
        style={[styles.card, ready && styles.cardReady, quest.claimed && { opacity: 0.7 }]}>
        <View style={styles.pin} />
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={title}
          style={({ pressed }) => [styles.cardMain, pressed && { opacity: 0.85 }]}>
          <Image
            source={icon.src}
            style={{ width: 44 * icon.aspect, height: 44 }}
            contentFit="contain"
            accessible={false}
          />
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ fontFamily: BOLD, color: INK, fontSize: 14 }}>{title}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(1, quest.progress / quest.target) * 100}%` }]} />
            </View>
            <Text style={{ color: INK, fontSize: 11, opacity: 0.8 }}>
              {t('progress', { progress: quest.progress, target: quest.target })}
            </Text>
          </View>
        </Pressable>
        {quest.claimed ? (
          <View style={styles.claimed}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={{ fontFamily: BOLD, color: '#2E7D32', fontSize: 12 }}>{t('claimed')}</Text>
          </View>
        ) : ready && onClaim ? (
          <Pressable
            onPress={onClaim}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('claimA11y', { title })}
            style={({ pressed }) => [styles.claim, pressed && { opacity: 0.85 }]}>
            <Text style={{ fontFamily: BOLD, color: '#3A2600', fontSize: 14 }}>{t('claim')}</Text>
          </Pressable>
        ) : (
          <RewardChip xp={quest.xp} coins={quest.coins} />
        )}
      </LinearGradient>
    </Animated.View>
  );
}

function RewardChip({ xp, coins }: { xp: number; coins: number }) {
  const { t } = useTranslation('quests');
  if (!xp && !coins) return null;
  return (
    <View style={styles.chip}>
      {!!xp && <Text style={{ fontFamily: BOLD, color: '#FFE8A3', fontSize: 12 }}>{t('xp', { count: xp })}</Text>}
      {!!coins && (
        <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12 }}>{t('coins', { count: coins })}</Text>
      )}
    </View>
  );
}

/** The daily chests along the bottom of the board. */
export function ChestRow({
  chests,
  onOpen,
  busy,
}: {
  chests: QuestChest[];
  onOpen: (i: number) => void;
  busy?: boolean;
}) {
  const { t } = useTranslation('quests');
  const claimedCount = chests.filter((c) => c.claimed).length;
  return (
    <View style={styles.chests}>
      <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 12, letterSpacing: 1 }}>
        {t('chests.title').toUpperCase()}
      </Text>
      <View style={styles.chestLine}>
        <View style={styles.chestTrack}>
          <View style={[styles.chestFill, { width: `${(claimedCount / chests.length) * 100}%` }]} />
        </View>
        {chests.map((c, i) => (
          <Pressable
            key={i}
            disabled={!c.ready || c.claimed || busy}
            onPress={() => onOpen(i)}
            accessibilityRole="button"
            accessibilityLabel={t('chests.a11y', {
              n: i + 1,
              state: c.claimed ? t('chests.opened') : c.ready ? t('chests.ready') : t('chests.locked'),
            })}
            style={styles.chestSpot}>
            <Wiggle on={c.ready && !c.claimed}>
              <Image
                source={(c.claimed ? QUEST_ART.chestOpen : QUEST_ART.chestClosed).src}
                style={{ width: 52, height: 48, opacity: c.ready || c.claimed ? 1 : 0.5 }}
                contentFit="contain"
                accessible={false}
              />
            </Wiggle>
            <Text
              style={{
                fontSize: 10,
                color: c.ready && !c.claimed ? Colors.reward : 'rgba(255,255,255,0.75)',
                fontFamily: BOLD,
              }}>
              {c.ready && !c.claimed ? t('chests.open') : t('chests.after', { count: c.after ?? 0 })}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** A gentle wobble for things waiting to be tapped. */
function Wiggle({ on, children }: { on: boolean; children: React.ReactNode }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.set(
      on
        ? withRepeat(
            withSequence(
              withTiming(-6, { duration: 120 }),
              withTiming(6, { duration: 120 }),
              withTiming(0, { duration: 120 }),
              withDelay(900, withTiming(0, { duration: 1 })),
            ),
            -1,
          )
        : 0,
    );
  }, [on, r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** A quest opened up: where it's played, how, progress, rewards, and Go. */
export function QuestDetail({
  quest,
  kind,
  onClose,
}: {
  quest: QuestItem | null;
  kind: 'daily' | 'weekly' | 'journey';
  onClose: () => void;
}) {
  const { t } = useTranslation('quests');
  const titleOf = useQuestTitle();
  const route = quest && questRoute(quest);
  return (
    <Modal visible={!!quest} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {quest && (
          <Animated.View entering={ZoomIn.springify()} style={styles.detail}>
            <Image source={questPicture(quest)} style={styles.detailPic} contentFit="cover" accessible={false} />
            <LinearGradient colors={['transparent', '#141A3C']} style={styles.detailFade} />
            <View style={{ padding: Spacing.lg, gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Image
                  source={PLACE_ICON[quest.place].src}
                  style={{ width: 40 * PLACE_ICON[quest.place].aspect, height: 40 }}
                  contentFit="contain"
                  accessible={false}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 19 }}>{titleOf(quest)}</Text>
                  <Text style={{ color: 'rgba(235,238,255,0.8)', fontSize: 12 }}>
                    {t(`places.${quest.place}`)} · {t(`kind.${kind}`)}
                  </Text>
                </View>
              </View>
              <Text style={{ color: 'rgba(235,238,255,0.9)' }}>{t(`how.${quest.place}`)}</Text>
              <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={[styles.fill, { width: `${Math.min(1, quest.progress / quest.target) * 100}%` }]} />
              </View>
              <Text style={{ color: '#fff', textAlign: 'center' }}>
                {t('progress', { progress: quest.progress, target: quest.target })}
              </Text>
              {(quest.xp > 0 || quest.coins > 0) && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: Spacing.md }}>
                  <Text style={{ fontFamily: BOLD, color: '#FFE8A3' }}>{t('xp', { count: quest.xp })}</Text>
                  <Text style={{ fontFamily: BOLD, color: Colors.reward }}>{t('coins', { count: quest.coins })}</Text>
                </View>
              )}
              {route && !quest.done && (
                <GoldButton
                  title={t('goTo', { place: t(`places.${quest.place}`) })}
                  icon="walk"
                  onPress={() => {
                    onClose();
                    router.push(route);
                  }}
                />
              )}
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                style={{ alignSelf: 'center', padding: Spacing.sm }}>
                <Text style={{ color: 'rgba(235,238,255,0.85)' }}>{t('back')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

/** The chest bursting open with what was won. */
export function RewardBurst({ reward, onCollect }: { reward: QuestReward | null; onCollect: () => void }) {
  const { t } = useTranslation('quests');
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.set(
      reward ? withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.6, { duration: 900 })), -1) : 0,
    );
  }, [reward, glow]);
  const halo = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.9 + glow.value * 0.25 }] }));
  return (
    <Modal visible={!!reward} transparent animationType="fade" onRequestClose={onCollect}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(6,8,24,0.92)' }]}>
        {reward && (
          <View style={{ alignItems: 'center', gap: Spacing.md, width: '100%', maxWidth: 420, padding: Spacing.lg }}>
            <Animated.Text entering={FadeInDown} style={styles.burstTitle}>
              {reward.kind === 'quest' ? t('reward.complete') : t('reward.chest')}
            </Animated.Text>
            {!!reward.title && <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>{reward.title}</Text>}
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 230 }}>
              <Animated.View style={[styles.halo, halo]} />
              <Animated.View entering={ZoomIn.springify().delay(150)}>
                <Image
                  source={QUEST_ART.chestOpen.src}
                  style={{ width: 220 * QUEST_ART.chestOpen.aspect, height: 220 }}
                  contentFit="contain"
                  accessible={false}
                />
              </Animated.View>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <Coin key={k} k={k} />
              ))}
            </View>
            <Animated.View entering={FadeIn.delay(300)} style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {reward.xp > 0 && (
                <View style={styles.prize}>
                  <Ionicons name="flash" size={26} color="#FFE8A3" />
                  <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18 }}>{t('xp', { count: reward.xp })}</Text>
                </View>
              )}
              {reward.coins > 0 && (
                <View style={styles.prize}>
                  <View style={styles.coin}>
                    <Text style={{ fontFamily: BOLD, color: '#7A4B00', fontSize: 13 }}>K</Text>
                  </View>
                  <Text style={{ fontFamily: BOLD, color: Colors.reward, fontSize: 18 }}>
                    {t('coins', { count: reward.coins })}
                  </Text>
                </View>
              )}
              {!!reward.item && <ItemPrize id={reward.item} />}
            </Animated.View>
            <View style={{ alignSelf: 'stretch' }}>
              <GoldButton title={t('reward.collect')} icon="sparkles" onPress={onCollect} />
            </View>
          </View>
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
  const preview = {
    ...base,
    ...(slot === 'hat' || slot === 'glasses' || slot === 'outfit' || slot === 'background' ? { [slot]: id } : {}),
  };
  return (
    <View style={styles.prize}>
      <Avatar config={preview} size={56} />
      <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 13, textAlign: 'center', maxWidth: 110 }}>
        {item?.name ?? id}
      </Text>
      <Text style={{ color: Colors.reward, fontSize: 10 }}>{t('reward.item')}</Text>
    </View>
  );
}

/** A coin flying up out of the chest. */
function Coin({ k }: { k: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(200 + k * 90, withTiming(1, { duration: 900 })));
  }, [v, k]);
  const dx = (k - 2.5) * 34;
  const style = useAnimatedStyle(() => ({
    opacity: v.value < 0.85 ? 1 : (1 - v.value) * 6,
    transform: [{ translateX: dx * v.value }, { translateY: -130 * Math.sin(v.value * Math.PI * 0.9) }],
  }));
  return (
    <Animated.View style={[styles.flyCoin, style]} pointerEvents="none">
      <View style={styles.coin}>
        <Text style={{ fontFamily: BOLD, color: '#7A4B00', fontSize: 12 }}>K</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(122,74,30,0.5)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
  },
  cardReady: { borderColor: '#FFF1B8', borderWidth: 2, boxShadow: '0 0 16px rgba(255,200,87,0.8)' },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pin: {
    position: 'absolute',
    top: -5,
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B8862B',
    borderWidth: 2,
    borderColor: '#E9C46A',
  },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(74,44,16,0.2)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#7C5CFF' },
  chip: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#3B2A55',
  },
  claim: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.reward,
    borderWidth: 2,
    borderColor: '#FFF1B8',
  },
  claimed: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  chests: { gap: 6, padding: Spacing.sm, borderRadius: 16, backgroundColor: 'rgba(14,18,44,0.85)' },
  chestLine: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  chestTrack: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  chestFill: { height: 6, borderRadius: 3, backgroundColor: Colors.reward },
  chestSpot: { alignItems: 'center', gap: 2, minWidth: 80 },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(6,8,24,0.75)',
  },
  detail: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#141A3C',
    borderWidth: 1,
    borderColor: 'rgba(255,200,87,0.4)',
  },
  detailPic: { width: '100%', height: 200 },
  detailFade: { position: 'absolute', left: 0, right: 0, top: 120, height: 80 },
  burstTitle: {
    fontFamily: BOLD,
    fontSize: 32,
    color: Colors.reward,
    textAlign: 'center',
    textShadowColor: '#B04CFF',
    textShadowRadius: 12,
  },
  halo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,200,87,0.35)',
    boxShadow: '0 0 60px rgba(255,200,87,0.8)',
  },
  prize: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
    backgroundColor: 'rgba(124,92,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,200,87,0.4)',
  },
  coin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFE8A3',
  },
  flyCoin: { position: 'absolute', top: 100 },
});
