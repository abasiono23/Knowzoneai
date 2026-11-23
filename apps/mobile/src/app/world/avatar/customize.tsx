import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { Avatar } from '@/components/world/avatar';
import { Coin, GameBack, Wallet } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useSession } from '@/lib/session';
import { DEFAULT_AVATAR, RARITY_COLOR, SHOP } from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';
import type { AvatarConfig, ShopItem } from '@/lib/world/types';

/** Tab labels come from world:shop.slots.<id>. */
const SLOTS: ShopItem['slot'][] = ['hat', 'glasses', 'outfit', 'background', 'boost'];

const wear = (a: AvatarConfig, item: ShopItem): AvatarConfig =>
  item.slot === 'hat'
    ? { ...a, hat: item.id }
    : item.slot === 'glasses'
      ? { ...a, glasses: item.id }
      : item.slot === 'outfit'
        ? { ...a, outfit: item.id }
        : item.slot === 'background'
          ? { ...a, background: item.id }
          : a;

const equippedIn = (a: AvatarConfig, item: ShopItem) =>
  (item.slot === 'hat' && a.hat === item.id) ||
  (item.slot === 'glasses' && a.glasses === item.id) ||
  (item.slot === 'outfit' && a.outfit === item.id) ||
  (item.slot === 'background' && a.background === item.id);

/**
 * Your profile picture and its items: try anything on before buying; items won from achievements and
 * quests show how to earn them. Cosmetics only: coins never buy answers, stars or progress.
 */
export default function AvatarCustomizeScreen() {
  const { t } = useTranslation('world');
  const { user } = useSession();
  const { avatar, owned, freezes, buy, equip } = useWorld();
  const base = avatar ?? DEFAULT_AVATAR;
  const [slot, setSlot] = useState<ShopItem['slot']>('hat');
  const [trying, setTrying] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const preview = trying ? wear(base, trying) : base;
  const items = SHOP.filter((i) => i.slot === slot);
  const isOwned = (i: ShopItem) => owned.includes(i.id);
  const coins = user?.coins ?? 0;

  const purchase = async (item: ShopItem) => {
    setBusy(true);
    const err = await buy(item);
    setBusy(false);
    if (err) return setMsg({ ok: false, text: err });
    if (item.slot !== 'boost') equip(item, item.slot);
    setMsg({ ok: true, text: item.slot === 'boost' ? t('shop.added', { name: item.name }) : t('shop.equipped', { name: item.name }) });
    setTrying(null);
  };

  const sel = trying;
  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.top}>
        <GameBack />
        <Text style={styles.heading} accessibilityRole="header">
          {t('shop.title')}
        </Text>
        <Wallet compact />
      </View>
      <View style={styles.stage}>
        <Animated.View key={sel?.id ?? 'base'} entering={FadeIn.duration(180)}>
          <Avatar config={preview} size={132} ring={sel ? RARITY_COLOR[sel.rarity] : undefined} />
        </Animated.View>
        {sel ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 2 }}>
            <Text style={[styles.eyebrow, { color: RARITY_COLOR[sel.rarity] }]}>
              {t('shop.tryingOn', { rarity: t(`shop.rarity.${sel.rarity}`) }).toUpperCase()}
            </Text>
            <Text style={styles.heading}>{sel.name}</Text>
          </Animated.View>
        ) : (
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={styles.heading}>{base.name || t('friends.you')}</Text>
            <Pressable
              onPress={() => router.push({ pathname: '/world/avatar/create', params: { edit: '1' } })}
              accessibilityRole="button"
              style={styles.editLink}>
              <Ionicons name="create-outline" size={16} color={W.focus} />
              <Text style={styles.editText}>{t('shop.editFace')}</Text>
            </Pressable>
          </View>
        )}
      </View>
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
          {SLOTS.map((id) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: slot === id }}
              style={[styles.tab, slot === id && styles.tabOn]}
              onPress={() => {
                setSlot(id);
                setTrying(null);
                setMsg(null);
              }}>
              <Text style={[styles.tabText, slot === id && { color: '#fff' }]}>{t(`shop.slots.${id}`)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {slot !== 'boost' && (
          <Pressable
            onPress={() => {
              equip(null, slot);
              setTrying(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('shop.removeItem')}
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: W.page }]}>
            <View style={styles.none}>
              <Ionicons name="remove-circle-outline" size={28} color={W.muted} />
            </View>
            <Text style={styles.itemName}>{slot === 'outfit' ? t('shop.plainTop') : slot === 'background' ? t('shop.default') : t('shop.none')}</Text>
          </Pressable>
        )}
        {items.map((i) => {
          const has = isOwned(i);
          const on = equippedIn(base, i);
          return (
            <Pressable
              key={i.id}
              onPress={() => {
                setMsg(null);
                setTrying(i.slot === 'boost' ? i : trying?.id === i.id ? null : i);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: trying?.id === i.id }}
              accessibilityLabel={t('shop.itemA11y', {
                name: i.name,
                status: on
                  ? t('shop.equippedA11y')
                  : has
                    ? t('shop.ownedA11y')
                    : i.earnedBy
                      ? t('shop.earnA11y', { how: i.earnedBy })
                      : t('units.coins', { ns: 'common', count: i.price }),
              })}
              style={({ pressed }) => [
                styles.item,
                trying?.id === i.id && { borderColor: W.ink },
                on && styles.itemOn,
                pressed && { backgroundColor: W.page },
              ]}>
              {i.slot === 'boost' ? (
                <View style={[styles.none, { backgroundColor: '#E3EEFB' }]}>
                  <Ionicons name="snow-outline" size={32} color="#2F55C8" />
                </View>
              ) : (
                <Avatar config={wear(base, i)} size={72} />
              )}
              <Text numberOfLines={1} style={styles.itemName}>
                {i.name}
              </Text>
              {on ? (
                <View style={styles.price}>
                  <Ionicons name="checkmark-circle" size={13} color={W.correct} />
                  <Text style={[styles.badge, { color: W.correct }]}>{t('shop.equippedBadge')}</Text>
                </View>
              ) : has ? (
                <Text style={styles.badge}>{t('shop.ownedBadge')}</Text>
              ) : i.earnedBy ? (
                <View style={styles.price}>
                  <Ionicons name="trophy-outline" size={12} color={W.rare} />
                  <Text style={[styles.badge, { color: W.rare }]}>{t('shop.earnBadge')}</Text>
                </View>
              ) : (
                <View style={styles.price}>
                  <Coin size={13} />
                  <Text style={[styles.badge, { color: coins >= i.price ? W.ink : W.muted }]}>{i.price}</Text>
                </View>
              )}
              <View style={[styles.rarity, { backgroundColor: RARITY_COLOR[i.rarity] }]} />
            </Pressable>
          );
        })}
        {slot === 'boost' && <Text style={[styles.note, { width: '100%' }]}>{t('shop.freezeInfo', { count: freezes })}</Text>}
      </ScrollView>
      <View style={styles.footer}>
        {msg && (
          <View style={styles.msg} accessibilityLiveRegion="polite">
            <Ionicons name={msg.ok ? 'checkmark-circle' : 'alert-circle'} size={16} color={msg.ok ? W.correct : W.wrong} />
            <Text style={[styles.note, { color: msg.ok ? W.correct : W.wrong }]}>{msg.text}</Text>
          </View>
        )}
        {sel ? (
          isOwned(sel) ? (
            <PrimaryButton
              title={equippedIn(base, sel) ? t('shop.equippedA11y') : t('shop.wear')}
              icon="checkmark"
              disabled={equippedIn(base, sel)}
              onPress={() => {
                equip(sel, sel.slot);
                setTrying(null);
              }}
            />
          ) : sel.earnedBy ? (
            <SecondaryButton title={t('shop.earnIt', { how: sel.earnedBy })} icon="trophy-outline" disabled onPress={() => {}} />
          ) : (
            <PrimaryButton
              title={coins >= sel.price ? t('shop.buyFor', { count: sel.price }) : t('shop.needMore', { count: sel.price - coins })}
              icon="bag-handle-outline"
              busy={busy}
              disabled={coins < sel.price}
              onPress={() => void purchase(sel)}
            />
          )
        ) : (
          <Text style={[styles.note, { textAlign: 'center' }]}>{t('shop.tapToTry')}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: W.page },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  heading: { fontFamily: FONT, fontSize: 18, color: W.ink, letterSpacing: -0.2 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  stage: { alignItems: 'center', gap: 8, paddingVertical: 10, minHeight: 200 },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 12 },
  editText: { fontFamily: Fonts.bold, fontSize: 14, color: W.focus },
  tabsWrap: { borderBottomWidth: 1, borderBottomColor: W.line },
  tabs: { gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  tab: { paddingHorizontal: 14, minHeight: 36, justifyContent: 'center', borderRadius: 999, backgroundColor: W.key },
  tabOn: { backgroundColor: W.ink },
  tabText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, maxWidth: 720, width: '100%', alignSelf: 'center' },
  item: {
    width: '30%',
    flexGrow: 1,
    maxWidth: 160,
    alignItems: 'center',
    gap: 4,
    padding: 10,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1.5,
    borderColor: W.line,
    overflow: 'hidden',
  },
  itemOn: { borderColor: W.correct },
  itemName: { fontFamily: Fonts.semibold, fontSize: 12, color: W.ink },
  badge: { fontFamily: Fonts.bold, fontSize: 11, color: W.inkSoft },
  none: { width: 72, height: 72, borderRadius: 36, backgroundColor: W.given, alignItems: 'center', justifyContent: 'center' },
  price: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rarity: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  note: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.inkSoft },
  msg: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footer: { padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: W.line, backgroundColor: W.surface, width: '100%', alignSelf: 'center' },
});
