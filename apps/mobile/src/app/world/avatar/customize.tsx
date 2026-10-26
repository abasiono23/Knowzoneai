import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/world/avatar';
import { GameBack, Wallet } from '@/components/world/world-ui';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
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

/** Screen 135: avatar customisation and the cosmetics shop. Try anything on before buying. */
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
    setMsg({
      ok: true,
      text: item.slot === 'boost' ? t('shop.added', { name: item.name }) : t('shop.equipped', { name: item.name }),
    });
    setTrying(null);
  };

  const sel = trying;
  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.top}>
        <GameBack />
        <Text variant="heading">{t('shop.title')}</Text>
        <Wallet compact />
      </View>
      <View style={styles.stage}>
        <Animated.View key={sel?.id ?? 'base'} entering={ZoomIn.duration(220)}>
          <Avatar config={preview} size={150} ring={sel ? RARITY_COLOR[sel.rarity] : Colors.reward} />
        </Animated.View>
        {sel ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 2 }}>
            <Text variant="label" color={RARITY_COLOR[sel.rarity]}>
              {t('shop.tryingOn', { rarity: t(`shop.rarity.${sel.rarity}`) })}
            </Text>
            <Text variant="heading">{sel.name}</Text>
          </Animated.View>
        ) : (
          <Button
            variant="ghost"
            icon="color-wand-outline"
            title={t('shop.editFace')}
            onPress={() => router.push({ pathname: '/world/avatar/create', params: { edit: '1' } })}
          />
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {SLOTS.map((id) => (
          <ChoiceChip
            key={id}
            label={t(`shop.slots.${id}`)}
            selected={slot === id}
            onPress={() => {
              setSlot(id);
              setTrying(null);
              setMsg(null);
            }}
          />
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.grid}>
        {slot !== 'boost' && (
          <Pressable
            onPress={() => {
              equip(null, slot);
              setTrying(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('shop.removeItem')}
            style={styles.item}>
            <View style={styles.none}>
              <Ionicons name="ban" size={30} color={Colors.textMuted} />
            </View>
            <Text variant="small" style={{ fontSize: 12 }}>
              {slot === 'outfit' ? t('shop.plainTop') : slot === 'background' ? t('shop.default') : t('shop.none')}
            </Text>
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
              style={[
                styles.item,
                trying?.id === i.id && { borderColor: RARITY_COLOR[i.rarity] },
                on && styles.itemOn,
              ]}>
              {i.slot === 'boost' ? (
                <View style={[styles.none, { backgroundColor: Colors.info + '22' }]}>
                  <Ionicons name="snow" size={34} color={Colors.info} />
                </View>
              ) : (
                <Avatar config={wear(base, i)} size={72} />
              )}
              <Text variant="small" numberOfLines={1} style={{ fontSize: 12, fontFamily: 'Manrope_600SemiBold' }}>
                {i.name}
              </Text>
              {on ? (
                <Text variant="label" color={Colors.success} style={{ fontSize: 10 }}>
                  {t('shop.equippedBadge')}
                </Text>
              ) : has ? (
                <Text variant="label" color={Colors.textSecondary} style={{ fontSize: 10 }}>
                  {t('shop.ownedBadge')}
                </Text>
              ) : i.earnedBy ? (
                <View style={styles.price}>
                  <Ionicons name="trophy" size={11} color={Colors.reward} />
                  <Text variant="label" color={Colors.reward} style={{ fontSize: 10 }}>
                    {t('shop.earnBadge')}
                  </Text>
                </View>
              ) : (
                <View style={styles.price}>
                  <View style={styles.coin} />
                  <Text
                    variant="label"
                    color={coins >= i.price ? Colors.text : Colors.textMuted}
                    style={{ fontSize: 11 }}>
                    {i.price}
                  </Text>
                </View>
              )}
              <View style={[styles.rarity, { backgroundColor: RARITY_COLOR[i.rarity] }]} />
            </Pressable>
          );
        })}
        {slot === 'boost' && (
          <Text variant="small" color={Colors.textMuted} style={{ width: '100%' }}>
            {t('shop.freezeInfo', { count: freezes })}
          </Text>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {msg && (
          <Text variant="small" color={msg.ok ? Colors.success : Colors.danger} center>
            {msg.text}
          </Text>
        )}
        {sel ? (
          isOwned(sel) ? (
            <Button
              title={equippedIn(base, sel) ? t('shop.equippedA11y') : t('shop.wear')}
              icon="checkmark"
              disabled={equippedIn(base, sel)}
              onPress={() => (equip(sel, sel.slot), setTrying(null))}
            />
          ) : sel.earnedBy ? (
            <Button variant="secondary" title={t('shop.earnIt', { how: sel.earnedBy })} icon="trophy" disabled />
          ) : (
            <Button
              title={
                coins >= sel.price
                  ? t('shop.buyFor', { count: sel.price })
                  : t('shop.needMore', { count: sel.price - coins })
              }
              icon="bag-handle"
              loading={busy}
              disabled={coins < sel.price}
              onPress={() => purchase(sel)}
            />
          )
        ) : (
          <Text variant="small" color={Colors.textMuted} center>
            {t('shop.tapToTry')}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.backgroundDeep },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  stage: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, minHeight: 230 },
  tabs: { gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.md,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  item: {
    width: '30%',
    flexGrow: 1,
    maxWidth: 160,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  itemOn: { borderColor: Colors.success },
  none: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coin: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.reward },
  rarity: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  footer: {
    padding: Spacing.md,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
