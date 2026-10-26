import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { Glassware, LabReagent } from '@/lib/api';
import { bottleArt, GLASSWARE_SPOTS, SHELF_ROWS, SHELF_X, sub } from '@/lib/games/lab';

import { BOLD, GoldButton, ItemPicture, Panel } from './hud';
import type { CoverMap } from './station';

/** The reagent shelves: labelled bottles on the shelves; tap one to look, then pick it up. */
export function ShelvesStation({
  map,
  shelf,
  carrying,
  full,
  onPick,
}: {
  map: CoverMap;
  shelf: LabReagent[];
  /** Reagent ids already picked up (shown as gaps on the shelf). */
  carrying: string[];
  full: boolean;
  onPick: (r: LabReagent) => void;
}) {
  const { t } = useTranslation('lab');
  const [chosen, setChosen] = useState<LabReagent | null>(null);
  const perRow = Math.ceil(shelf.length / SHELF_ROWS.length);
  const height = 0.11 * map.dh;
  return (
    <>
      {shelf.map((r, k) => {
        const row = Math.floor(k / perRow);
        const col = k % perRow;
        const x = SHELF_X[0] + ((col + 0.5) * (SHELF_X[1] - SHELF_X[0])) / perRow;
        const art = bottleArt(r);
        const taken = carrying.includes(r.id);
        return (
          <Pressable
            key={r.id}
            disabled={taken}
            onPress={() => setChosen(r)}
            accessibilityRole="button"
            accessibilityLabel={r.name}
            style={[
              styles.abs,
              {
                left: map.x(x) - 40,
                top: map.y(SHELF_ROWS[row]!) - height,
                width: 80,
                height,
                opacity: taken ? 0.15 : 1,
              },
              chosen?.id === r.id && styles.chosen,
            ]}>
            <View style={{ alignItems: 'center' }}>
              <ItemPicture
                art={art}
                height={height}
                label={r.formula.length <= 9 ? r.formula : undefined}
                tint={r.bottle === 'clear' ? r.colour : undefined}
              />
            </View>
          </Pressable>
        );
      })}
      {chosen && (
        <SafeAreaView edges={['bottom']} style={styles.sheet} pointerEvents="box-none">
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm }}>
              <Text style={{ fontFamily: BOLD, fontSize: 18, color: '#fff' }}>{chosen.name}</Text>
              <Text style={{ color: Colors.reward, fontFamily: BOLD }}>{sub(chosen.formula)}</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Pressable onPress={() => setChosen(null)} accessibilityRole="button" style={styles.cancel}>
                  <Text style={{ color: '#fff' }}>{t('pickup.leave')}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <GoldButton
                    title={full ? t('pickup.full') : t('pickup.pick')}
                    icon="hand-left"
                    disabled={full}
                    onPress={() => {
                      onPick(chosen);
                      setChosen(null);
                    }}
                  />
                </View>
              </View>
            </Panel>
          </Animated.View>
        </SafeAreaView>
      )}
    </>
  );
}

/** The glassware bench: a beaker, a conical flask and a test tube to pick up. */
export function GlasswareStation({
  map,
  carrying,
  full,
  onPick,
}: {
  map: CoverMap;
  carrying: Glassware[];
  full: boolean;
  onPick: (g: Glassware) => void;
}) {
  const { t } = useTranslation('lab');
  const [chosen, setChosen] = useState<Glassware | null>(null);
  const heights: Record<Glassware, number> = { beaker: 0.13, flask: 0.16, tube: 0.16 };
  return (
    <>
      {(Object.keys(GLASSWARE_SPOTS) as Glassware[]).map((g) => {
        const [x, y] = GLASSWARE_SPOTS[g];
        const h = heights[g] * map.dh;
        const taken = carrying.includes(g);
        return (
          <Pressable
            key={g}
            disabled={taken}
            onPress={() => setChosen(g)}
            accessibilityRole="button"
            accessibilityLabel={t(`glassware.${g}`)}
            style={[
              styles.abs,
              {
                left: map.x(x) - 50,
                top: map.y(y) - h,
                width: 100,
                height: h,
                alignItems: 'center',
                opacity: taken ? 0.15 : 1,
              },
              chosen === g && styles.chosen,
            ]}>
            <ItemPicture art={g} height={h} />
            <Animated.View entering={FadeIn} style={styles.tag}>
              <Text style={{ fontSize: 11, color: '#fff' }}>{t(`glassware.${g}`)}</Text>
            </Animated.View>
          </Pressable>
        );
      })}
      {chosen && (
        <SafeAreaView edges={['bottom']} style={styles.sheet} pointerEvents="box-none">
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm }}>
              <Text style={{ fontFamily: BOLD, fontSize: 18, color: '#fff' }}>{t(`glassware.${chosen}`)}</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Pressable onPress={() => setChosen(null)} accessibilityRole="button" style={styles.cancel}>
                  <Text style={{ color: '#fff' }}>{t('pickup.leave')}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <GoldButton
                    title={full ? t('pickup.full') : t('pickup.pick')}
                    icon="hand-left"
                    disabled={full}
                    onPress={() => {
                      onPick(chosen);
                      setChosen(null);
                    }}
                  />
                </View>
              </View>
            </Panel>
          </Animated.View>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' },
  chosen: { borderRadius: 12, borderWidth: 2, borderColor: Colors.reward, backgroundColor: 'rgba(255,200,87,0.12)' },
  sheet: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: 96 },
  cancel: {
    height: 54,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tag: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(14,18,44,0.8)',
  },
});
