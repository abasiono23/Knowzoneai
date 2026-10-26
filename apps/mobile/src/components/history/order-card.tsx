import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, LinearTransition } from 'react-native-reanimated';

import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { GameOutcome } from '@/lib/api';

/**
 * "Put these in order": move events up and down, earliest at the top, then check (on the server).
 * Afterwards the right order is shown, with your mistakes marked.
 */
export function OrderCard({
  label,
  q,
  items,
  onAnswer,
  onNext,
  nextLabel,
}: {
  label?: string;
  q: string;
  items: string[];
  onAnswer: (order: string[]) => Promise<GameOutcome | null>;
  onNext: () => void;
  nextLabel: string;
}) {
  const { t } = useTranslation('history');
  const [order, setOrder] = useState(items);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [sending, setSending] = useState(false);
  const right = Array.isArray(outcome?.answer) ? (outcome.answer as string[]) : null;
  const shown = right ?? order;

  const move = (k: number, by: -1 | 1) => {
    const j = k + by;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[k], next[j]] = [next[j]!, next[k]!];
    setOrder(next);
  };
  const check = async () => {
    setSending(true);
    const o = await onAnswer(order);
    setSending(false);
    if (o) setOutcome(o);
  };

  return (
    <Animated.View entering={FadeInUp.springify()}>
      <Panel style={{ gap: Spacing.sm, borderColor: 'rgba(124,92,255,0.6)' }}>
        {!!label && <Text style={styles.label}>{label}</Text>}
        <Text style={{ fontFamily: BOLD, fontSize: 17, color: '#fff' }}>{q}</Text>
        <Text style={styles.edge}>▲ {t('time.order.earliest')}</Text>
        {shown.map((item, k) => {
          const mine = order.indexOf(item);
          const tone = right ? (mine === k ? Colors.success : Colors.danger) : 'rgba(255,200,87,0.45)';
          return (
            <Animated.View key={item} layout={LinearTransition} style={[styles.row, { borderColor: tone }]}>
              <Text style={styles.num}>{k + 1}</Text>
              <Text style={{ flex: 1, color: '#fff', fontSize: 14 }}>{item}</Text>
              {!right && (
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Pressable
                    disabled={k === 0}
                    onPress={() => move(k, -1)}
                    accessibilityRole="button"
                    accessibilityLabel={t('time.order.up', { item })}
                    hitSlop={6}
                    style={[styles.arrow, k === 0 && { opacity: 0.3 }]}>
                    <Ionicons name="chevron-up" size={18} color="#fff" />
                  </Pressable>
                  <Pressable
                    disabled={k === order.length - 1}
                    onPress={() => move(k, 1)}
                    accessibilityRole="button"
                    accessibilityLabel={t('time.order.down', { item })}
                    hitSlop={6}
                    style={[styles.arrow, k === order.length - 1 && { opacity: 0.3 }]}>
                    <Ionicons name="chevron-down" size={18} color="#fff" />
                  </Pressable>
                </View>
              )}
            </Animated.View>
          );
        })}
        <Text style={styles.edge}>▼ {t('time.order.latest')}</Text>
        {outcome ? (
          <Animated.View entering={FadeInDown} style={{ gap: Spacing.sm }}>
            <Text style={{ fontFamily: BOLD, fontSize: 16, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
              {outcome.correct ? t('time.order.right', { points: outcome.points }) : t('time.order.wrong')}
            </Text>
            <GoldButton title={nextLabel} icon="arrow-forward" onPress={onNext} />
          </Animated.View>
        ) : (
          <GoldButton title={t('time.order.check')} icon="checkmark" disabled={sending} onPress={() => void check()} />
        )}
      </Panel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: BOLD, fontSize: 12, color: Colors.reward, letterSpacing: 1 },
  edge: { fontSize: 10, fontFamily: BOLD, color: 'rgba(235,238,255,0.6)', letterSpacing: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  num: { fontFamily: BOLD, color: Colors.reward, width: 16 },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.4)',
  },
});
