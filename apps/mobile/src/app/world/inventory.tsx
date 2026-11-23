import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FONT, SecondaryButton, W } from '@/components/games/ui';
import { Avatar } from '@/components/world/avatar';
import { WORLD_ACCENT, WorldCover } from '@/components/world/world-cover';
import { Wallet, worldStyles } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { DEFAULT_AVATAR, getItem, RARITY_COLOR } from '@/lib/world/avatar';
import { WORLDS } from '@/lib/world/content';
import { useWorld } from '@/lib/world/store';

/** Everything you own: your items, boosts, and the collectibles each world's stars unlock. */
export default function InventoryScreen() {
  const { t } = useTranslation('world');
  const { avatar, owned, freezes, worldStars, collected, isWorldUnlocked } = useWorld();
  const a = avatar ?? DEFAULT_AVATAR;
  const items = owned.map(getItem).filter((i) => !!i);
  const totalCollectibles = WORLDS.reduce((n, w) => n + w.collectibles.length, 0);
  const found = WORLDS.reduce((n, w) => n + collected(w).length, 0);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('inventory.title')} right={<Wallet compact />} />
      <View style={[styles.card, styles.me]}>
        <Avatar config={a} size={76} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.name}>{a.name || t('inventory.explorer')}</Text>
          <Text style={worldStyles.small}>
            {t('inventory.summary', { count: items.filter((i) => i.slot !== 'boost').length, found, total: totalCollectibles })}
          </Text>
          <SecondaryButton title={t('inventory.customise')} icon="person-circle-outline" onPress={() => router.push('/world/avatar/customize')} style={{ minHeight: 44 }} />
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={worldStyles.heading}>{t('inventory.wardrobe')}</Text>
        {items.filter((i) => i.slot !== 'boost').length ? (
          <View style={styles.grid}>
            {items
              .filter((i) => i.slot !== 'boost')
              .map((i) => (
                <View key={i.id} style={styles.item} accessible accessibilityLabel={`${i.name}, ${t(`shop.rarity.${i.rarity}`)}`}>
                  <Avatar
                    config={{
                      ...a,
                      ...(i.slot === 'hat' ? { hat: i.id } : i.slot === 'glasses' ? { glasses: i.id } : i.slot === 'outfit' ? { outfit: i.id } : { background: i.id }),
                    }}
                    size={60}
                  />
                  <Text style={styles.itemName} numberOfLines={1}>
                    {i.name}
                  </Text>
                  <View style={[styles.rarity, { backgroundColor: RARITY_COLOR[i.rarity] }]} />
                </View>
              ))}
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center', gap: 8 }]}>
            <Ionicons name="shirt-outline" size={24} color={W.muted} />
            <Text style={[worldStyles.small, { textAlign: 'center' }]}>{t('inventory.empty')}</Text>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={worldStyles.heading}>{t('inventory.boosts')}</Text>
        <View style={[styles.card, { flexDirection: 'row', gap: 12, alignItems: 'center' }]}>
          <View style={styles.boostIcon}>
            <Ionicons name="snow-outline" size={22} color="#2F55C8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={worldStyles.strong}>{t('inventory.freezes', { count: freezes })}</Text>
            <Text style={worldStyles.small}>{t('inventory.freezeBody')}</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={worldStyles.heading}>{t('inventory.collectibles')}</Text>
        <View style={styles.list}>
          {WORLDS.map((w, k) => {
            const have = collected(w);
            const stars = worldStars(w.id);
            const open = isWorldUnlocked(w);
            return (
              <View key={w.id} style={[{ padding: 14, gap: 10 }, k > 0 && worldStyles.rowLine]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <WorldCover world={w.id} size={32} locked={!open} />
                  <Text style={[worldStyles.strong, { flex: 1 }]}>{w.name}</Text>
                  <Text style={worldStyles.meta}>{t('achievements.progress', { value: have.length, target: w.collectibles.length })}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {w.collectibles.map((c) => {
                    const got = have.includes(c.id);
                    return (
                      <View
                        key={c.id}
                        style={[styles.collectible, got && { borderColor: WORLD_ACCENT[w.id] }]}
                        accessible
                        accessibilityLabel={got ? c.name : t('inventory.lockedA11y', { count: c.atStars, world: w.name })}>
                        <Ionicons name={got ? 'ribbon' : 'lock-closed-outline'} size={18} color={got ? WORLD_ACCENT[w.id] : W.muted} />
                        <Text style={[styles.itemName, !got && { color: W.muted }, { textAlign: 'center' }]} numberOfLines={2}>
                          {got ? c.name : !open ? t('inventory.worldLocked') : t('inventory.starsToGo', { count: c.atStars - stars })}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  me: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { fontFamily: FONT, fontSize: 19, color: W.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    width: 96,
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    overflow: 'hidden',
  },
  itemName: { fontFamily: Fonts.semibold, fontSize: 12, color: W.ink },
  rarity: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  boostIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E3EEFB', alignItems: 'center', justifyContent: 'center' },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  collectible: { flex: 1, alignItems: 'center', gap: 4, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: W.line, backgroundColor: W.page, minHeight: 72 },
});
