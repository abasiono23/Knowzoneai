import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/lab/backdrop';
import { BOLD, GoldButton, Panel } from '@/components/lab/hud';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { CyberDefenderRun, GameOutcome } from '@/lib/api';
import { TECH_SCENES } from '@/lib/games/tech';
import type { TechGame } from '@/lib/games/use-lab-run';

const KIND_ICON = { email: 'mail', sms: 'chatbubble-ellipses', password: 'key', situation: 'help-buoy' } as const;
const GOOD = new Set(['safe', 'strong']);

/**
 * Cyber Defender: judge each email, text, password or everyday situation before the clock runs out.
 * Wrong answers weaken the network shield (hearts); after each one you see why.
 */
export function CyberDefender({ g, run, paused }: { g: TechGame; run: CyberDefenderRun; paused: boolean }) {
  const { t } = useTranslation('tech');
  const [i, setI] = useState(() => Math.min(run.at, run.items.length - 1));
  const item = run.items[i]!;
  const [picked, setPicked] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [left, setLeft] = useState(run.seconds);
  const leftRef = useRef(run.seconds);

  const answer = async (choice: string | null) => {
    if (outcome || g.busy) return;
    setPicked(choice);
    const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
    if (!res) {
      setPicked(null);
      return;
    }
    g.buzz(res.outcome.correct ? 'success' : 'error');
    setOutcome(res.outcome);
  };
  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  });

  // The clock (stops while paused or answered).
  useEffect(() => {
    if (outcome || paused) return;
    const started = Date.now();
    const from = leftRef.current;
    const id = setInterval(() => {
      const remaining = Math.max(0, from - (Date.now() - started) / 1000);
      leftRef.current = remaining;
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        void answerRef.current(null);
      }
    }, 200);
    return () => clearInterval(id);
  }, [outcome, paused, i]);

  const next = () => {
    if (run.status !== 'playing' || run.hearts <= 0 || run.at >= run.items.length) {
      void g.finish();
      return;
    }
    setI(run.at);
    setPicked(null);
    setOutcome(null);
    leftRef.current = run.seconds;
    setLeft(run.seconds);
  };

  const shield = Math.max(0, run.hearts) / 3;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Backdrop source={TECH_SCENES.cyber} dim={0.45} />
      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="none">
        <Panel style={{ gap: 6 }}>
          <View style={styles.row}>
            <Ionicons name="shield-half" size={18} color="#2DD4BF" />
            <Text style={{ color: '#fff', fontFamily: BOLD, fontSize: 12 }}>{t('cyber.shield')}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${shield * 100}%`, backgroundColor: shield > 0.4 ? '#2DD4BF' : Colors.danger },
                ]}
              />
            </View>
          </View>
          <View style={styles.row}>
            <Text style={{ color: Colors.reward, fontFamily: BOLD, fontSize: 12, flex: 1 }}>
              {t('cyber.objective', { n: i + 1, total: run.items.length })}
            </Text>
            <Text
              style={{
                color: left < 6 ? '#FF8FA6' : '#fff',
                fontFamily: BOLD,
              }}>{`0:${String(Math.ceil(left)).padStart(2, '0')}`}</Text>
          </View>
        </Panel>
      </SafeAreaView>

      <View style={styles.middle} pointerEvents="box-none">
        <Animated.View key={i} entering={ZoomIn.springify()} style={styles.message}>
          <View style={styles.row}>
            <Ionicons name={KIND_ICON[item.kind]} size={18} color="#4A5590" />
            <Text style={{ fontFamily: BOLD, color: '#4A5590', fontSize: 12, letterSpacing: 1 }}>
              {t(`cyber.kinds.${item.kind}`)}
            </Text>
          </View>
          {!!item.from && <Text style={styles.meta}>{t('cyber.from', { from: item.from })}</Text>}
          {!!item.subject && <Text style={{ fontFamily: BOLD, color: '#1B1F3B', fontSize: 16 }}>{item.subject}</Text>}
          {item.kind === 'password' ? (
            <>
              <Text style={{ color: '#4A5590' }}>{t('cyber.passwordQ')}</Text>
              <Text style={styles.password}>{item.body}</Text>
            </>
          ) : (
            <Text style={{ color: '#1B1F3B', fontSize: 15, lineHeight: 21 }}>{item.body}</Text>
          )}
          {!!item.link && <Text style={styles.link}>{t('cyber.link', { link: item.link })}</Text>}
        </Animated.View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {outcome ? (
          <Animated.View entering={FadeInDown}>
            <Panel style={{ gap: Spacing.sm, borderColor: outcome.correct ? Colors.success : Colors.danger }}>
              <Text style={{ fontFamily: BOLD, fontSize: 17, color: outcome.correct ? Colors.success : '#FF8FA6' }}>
                {outcome.correct
                  ? t('cyber.right', { points: outcome.points })
                  : picked
                    ? t('cyber.wrong')
                    : t('cyber.timeUp')}{' '}
                {!outcome.correct && `→ ${t(`cyber.choices.${String(outcome.answer) as 'safe'}`)}`}
              </Text>
              {!!outcome.why && <Text style={{ color: '#fff' }}>{outcome.why}</Text>}
              <GoldButton title={t('cyber.next')} icon="arrow-forward" onPress={next} />
            </Panel>
          </Animated.View>
        ) : (
          <View style={styles.choices}>
            {item.options.map((o) => (
              <Pressable
                key={o}
                onPress={() => void answer(o)}
                disabled={!!picked}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.choice,
                  { backgroundColor: GOOD.has(o) ? '#1E9E6A' : '#D64545' },
                  pressed && { opacity: 0.85 },
                ]}>
                <Ionicons name={GOOD.has(o) ? 'checkmark-circle' : 'warning'} size={22} color="#fff" />
                <Text style={{ fontFamily: BOLD, color: '#fff', fontSize: 18 }}>
                  {t(`cyber.choices.${o as 'safe'}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: Spacing.md, right: Spacing.md, top: 56 },
  middle: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    top: 160,
    bottom: 200,
    justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: Spacing.md, right: Spacing.md, bottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  message: {
    gap: 8,
    padding: Spacing.md,
    borderRadius: 18,
    backgroundColor: '#F4F6FF',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  meta: { color: '#4A5590', fontSize: 12 },
  password: { fontFamily: 'Courier', fontSize: 24, color: '#1B1F3B', textAlign: 'center', paddingVertical: 8 },
  link: { color: '#2563EB', textDecorationLine: 'underline', fontSize: 13 },
  choices: { flexDirection: 'row', gap: Spacing.sm },
  choice: {
    flex: 1,
    height: 64,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
