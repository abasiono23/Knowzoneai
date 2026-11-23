import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { Glassware, LabReagent } from '@/lib/api';

import type { CoverMap } from '../station';
import { BottleChip, Board, GlassFigure } from './kit';

/**
 * Mixture Lab's reagent shelf and glassware rack, in the games' light look: labelled bottles (formula,
 * name, colour swatch) and glassware drawn like a textbook. Same props as the old picture-based stations.
 */
export function ShelvesStation({
  shelf,
  carrying,
  full,
  onPick,
}: {
  map?: CoverMap;
  shelf: LabReagent[];
  carrying: string[];
  full: boolean;
  onPick: (r: LabReagent) => void;
}) {
  const { t } = useTranslation('lab');
  return (
    <Board>
      {full && <Text style={styles.note}>{t('pickup.full')}</Text>}
      <View style={styles.grid}>
        {shelf.map((r) => {
          const taken = carrying.includes(r.id);
          return (
            <View key={r.id} style={[styles.item, taken && { opacity: 0.45 }]}>
              <BottleChip formula={r.formula} name={r.name} colour={r.colour} selected={taken} onPress={taken || full ? undefined : () => onPick(r)} />
            </View>
          );
        })}
      </View>
    </Board>
  );
}

export function GlasswareStation({
  carrying,
  full,
  onPick,
}: {
  map?: CoverMap;
  carrying: Glassware[];
  full: boolean;
  onPick: (g: Glassware) => void;
}) {
  const { t } = useTranslation('lab');
  return (
    <Board>
      {full && <Text style={styles.note}>{t('pickup.full')}</Text>}
      <View style={styles.rack}>
        {(['beaker', 'flask', 'tube'] as const).map((g) => {
          const taken = carrying.includes(g);
          return (
            <Pressable
              key={g}
              disabled={taken || full}
              onPress={() => onPick(g)}
              accessibilityRole="button"
              accessibilityState={{ disabled: taken || full, selected: taken }}
              accessibilityLabel={`${t('pickup.pick')}: ${t(`glassware.${g}`)}`}
              style={({ pressed }) => [styles.glass, taken && { borderColor: W.focus, backgroundColor: W.focusSoft }, pressed && { backgroundColor: W.key }]}>
              <GlassFigure kind={g} height={120} />
              <Text style={styles.glassName}>{t(`glassware.${g}`)}</Text>
            </Pressable>
          );
        })}
      </View>
    </Board>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { flexBasis: 220, flexGrow: 1 },
  rack: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  glass: { width: 140, minHeight: 170, alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: 10, borderRadius: 14, borderWidth: 1.5, borderColor: W.line, backgroundColor: W.surface },
  glassName: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  note: { fontFamily: Fonts.semibold, fontSize: 14, color: W.wrong },
});
