import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/world/avatar';
import { Wallet } from '@/components/world/world-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { DEFAULT_AVATAR, getItem, RARITY_COLOR } from '@/lib/world/avatar';
import { WORLDS } from '@/lib/world/content';
import { useWorld } from '@/lib/world/store';

/** Screen 136: everything you own: wardrobe, boosts and collectibles. */
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
      <Card style={styles.me}>
        <Avatar config={a} size={84} ring={Colors.reward} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="heading">{a.name || t('inventory.explorer')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('inventory.summary', {
              count: items.filter((i) => i.slot !== 'boost').length,
              found,
              total: totalCollectibles,
            })}
          </Text>
          <Button
            variant="secondary"
            title={t('inventory.customise')}
            icon="shirt"
            onPress={() => router.push('/world/avatar/customize')}
          />
        </View>
      </Card>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('inventory.wardrobe')}</Text>
        {items.length ? (
          <View style={styles.grid}>
            {items.map((i) => (
              <View key={i.id} style={styles.item}>
                <Avatar
                  config={{
                    ...a,
                    ...(i.slot === 'hat'
                      ? { hat: i.id }
                      : i.slot === 'glasses'
                        ? { glasses: i.id }
                        : i.slot === 'outfit'
                          ? { outfit: i.id }
                          : { background: i.id }),
                  }}
                  size={60}
                />
                <Text variant="small" numberOfLines={1} style={{ fontSize: 11 }}>
                  {i.name}
                </Text>
                <View style={[styles.dot, { backgroundColor: RARITY_COLOR[i.rarity] }]} />
              </View>
            ))}
          </View>
        ) : (
          <Card style={styles.empty}>
            <Ionicons name="shirt-outline" size={26} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textSecondary} center>
              {t('inventory.empty')}
            </Text>
          </Card>
        )}
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('inventory.boosts')}</Text>
        <Card style={styles.boost}>
          <View style={styles.boostIcon}>
            <Ionicons name="snow" size={22} color={Colors.info} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('inventory.freezes', { count: freezes })}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('inventory.freezeBody')}
            </Text>
          </View>
        </Card>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('inventory.collectibles')}</Text>
        {WORLDS.map((w) => {
          const have = collected(w);
          const stars = worldStars(w.id);
          return (
            <Card key={w.id} style={{ gap: Spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="bodyStrong">
                  {t('inventory.worldTitle', { emoji: w.emoji, world: w.name })}
                </Text>
                <Text variant="small" color={Colors.textMuted}>
                  {t('achievements.progress', { value: have.length, target: w.collectibles.length })}
                </Text>
              </View>
              <View style={styles.row}>
                {w.collectibles.map((c) => {
                  const got = have.includes(c.id);
                  return (
                    <View
                      key={c.id}
                      style={[styles.collectible, got && styles.got]}
                      accessible
                      accessibilityLabel={got ? c.name : t('inventory.lockedA11y', { count: c.atStars, world: w.name })}>
                      <Text style={{ fontSize: 28, opacity: got ? 1 : 0.15 }}>{got ? c.emoji : '❔'}</Text>
                      <Text
                        variant="small"
                        numberOfLines={2}
                        center
                        style={{ fontSize: 11 }}
                        color={got ? Colors.text : Colors.textMuted}>
                        {got
                          ? c.name
                          : !isWorldUnlocked(w)
                            ? t('inventory.worldLocked')
                            : t('inventory.starsToGo', { count: c.atStars - stars })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  me: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  item: {
    width: 84,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: { width: 20, height: 3, borderRadius: 2 },
  empty: { alignItems: 'center', gap: Spacing.xs },
  boost: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  boostIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.info + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: Spacing.xs },
  collectible: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  got: { borderColor: Colors.reward + '88', backgroundColor: Colors.rewardSoft },
});
