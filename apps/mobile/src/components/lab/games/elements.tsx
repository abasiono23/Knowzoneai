import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { ElementCard, ElementQuestRun, GameOutcome } from '@/lib/api';
import { CABINET_ROWS, CABINET_X } from '@/lib/games/lab';
import type { LabGame } from '@/lib/games/use-lab-run';

import { BOLD, GoldButton, ItemPicture, Panel } from '../hud';
import type { CoverMap } from '../station';

/**
 * Element Quest at the element cabinet: look at each sample, collect the ones the mission asks for,
 * then hand them in. The server checks the whole set.
 */
export function ElementCabinet({
  g,
  run,
  map,
  collected,
  onCollected,
}: {
  g: LabGame;
  run: ElementQuestRun;
  map: CoverMap;
  collected: string[];
  onCollected: (symbols: string[]) => void;
}) {
  const { t } = useTranslation('lab');
  const [i, setI] = useState(() => Math.min(run.at, run.missions.length - 1));
  const m = run.missions[i]!;
  const [looking, setLooking] = useState<ElementCard | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [done, setDone] = useState(false);
  const jarH = 0.095 * map.dh;

  const submit = async () => {
    const res = await g.answer({ step: i, symbols: collected });
    if (!res) return;
    setOutcome(res.outcome);
    setDone(res.done);
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };

  return (
    <>
      {m.cabinet.map((el, k) => {
        const x = CABINET_X[k % 3]!;
        const y = CABINET_ROWS[Math.floor(k / 3)]!;
        const have = collected.includes(el.symbol);
        return (
          <Pressable
            key={el.symbol}
            onPress={() => !outcome && setLooking(el)}
            accessibilityRole="button"
            accessibilityLabel={el.name}
            style={[
              styles.jar,
              { left: map.x(x) - 36, top: map.y(y) - jarH, width: 72, height: jarH, opacity: have ? 0.2 : 1 },
              looking?.symbol === el.symbol && styles.on,
            ]}>
            <ItemPicture art="jar" height={jarH} label={el.symbol} />
          </Pressable>
        );
      })}

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.danger }}>
              <Text style={{ fontFamily: BOLD, fontSize: 18, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
                {outcome.correct
                  ? t('elements.right')
                  : t('elements.wrong', { answer: (outcome.answer as string[] | undefined)?.join(', ') ?? '' })}
              </Text>
              <GoldButton
                title={done ? t('result.see') : t('elements.next')}
                icon="arrow-forward"
                onPress={() => {
                  if (done) void g.finish();
                  else {
                    setOutcome(null);
                    onCollected([]);
                    setI(i + 1);
                  }
                }}
              />
            </Panel>
          </Animated.View>
        ) : looking ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <View style={styles.symbol}>
                  <Text style={{ fontFamily: BOLD, fontSize: 30, color: '#fff' }}>{looking.symbol}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: BOLD, fontSize: 20, color: '#fff' }}>{looking.name}</Text>
                  {m.show
                    .filter((f) => f !== 'fact' && looking[f] !== undefined)
                    .map((f) => (
                      <Text key={f} style={{ fontSize: 13, color: 'rgba(235,238,255,0.9)' }}>
                        {t(`elements.fields.${f}`)}:{' '}
                        <Text style={{ fontFamily: BOLD, color: Colors.reward }}>
                          {f === 'category' || f === 'state'
                            ? t(`elements.${f}.${looking[f]}` as 'elements.state.gas')
                            : String(looking[f])}
                        </Text>
                      </Text>
                    ))}
                </View>
              </View>
              {looking.fact !== undefined && (
                <Text style={{ fontSize: 13, color: '#fff' }}>{String(looking.fact)}</Text>
              )}
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Pressable onPress={() => setLooking(null)} accessibilityRole="button" style={styles.cancel}>
                  <Text style={{ color: '#fff' }}>{t('pickup.leave')}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  {collected.includes(looking.symbol) ? (
                    <GoldButton
                      title={t('elements.putBack')}
                      onPress={() => {
                        onCollected(collected.filter((s) => s !== looking.symbol));
                        setLooking(null);
                      }}
                    />
                  ) : (
                    <GoldButton
                      title={t('elements.collect')}
                      icon="hand-left"
                      disabled={collected.length >= 5}
                      onPress={() => {
                        g.buzz('tap');
                        onCollected([...collected, looking.symbol]);
                        setLooking(null);
                      }}
                    />
                  )}
                </View>
              </View>
            </Panel>
          </Animated.View>
        ) : (
          <GoldButton
            title={t('elements.submit', { count: collected.length })}
            icon="checkmark-done"
            disabled={!collected.length || g.busy}
            onPress={() => void submit()}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  jar: { position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' },
  on: { borderRadius: 10, borderWidth: 2, borderColor: Colors.reward },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: 96 },
  symbol: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#3A2DA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    height: 54,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
