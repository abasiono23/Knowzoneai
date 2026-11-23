import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Feedback, PrimaryButton, W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Card, CodeBlock, Eyebrow, LTR, ltr, MONO, QuizStep, Sheet, StepBar, useAdvance } from '@/components/space/kit';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { BinaryBreakerRun, GameOutcome, VaultType } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import type { TechGame } from '@/lib/games/use-lab-run';

/** Kinds answered by setting bits (the others are answered by choosing). */
const SET: VaultType[] = ['set', 'add', 'hex', 'and', 'or', 'xor', 'shl', 'shr', 'neg', 'sub', 'gray'];
const str = (b: number[]) => b.join('');
const value = (b: number[]) => b.reduce((n, d) => n * 2 + d, 0);
/** Groups of four bits, like engineers write them: 1011 0010. */
const nibbles = (b: number[]) => str(b).replace(/(.{4})(?=.)/g, '$1 ');

type Vault = BinaryBreakerRun['vaults'][number];

/** The operands of a vault, written out in monospace (left to right in every language). */
function operands(v: Vault): string | null {
  switch (v.type) {
    case 'add':
      return `  ${nibbles(v.a!)}\n+ ${nibbles(v.b!)}`;
    case 'and':
    case 'or':
    case 'xor':
      return `    ${nibbles(v.a!)}\n${v.type.toUpperCase().padEnd(3)} ${nibbles(v.b!)}`;
    case 'shl':
      return `${nibbles(v.a!)} << ${v.n}`;
    case 'shr':
      return `${nibbles(v.a!)} >> ${v.n}`;
    case 'hex':
      return `0x${v.hex}`;
    case 'neg':
      return `−${v.n}`;
    case 'sub':
      return `${v.x} − ${v.y}`;
    case 'gray':
      return `n = ${v.n}`;
    case 'hosts':
      return `/${v.prefix}`;
    case 'network':
      return v.address ?? '';
    case 'hamming':
      return `a = ${nibbles(v.a!)}\nb = ${nibbles(v.b!)}`;
    case 'read':
    case 'ascii':
    case 'signed':
    case 'float':
      return nibbles(v.shown!);
    default:
      return v.target !== undefined ? String(v.target) : null;
  }
}

/**
 * Binary Breaker: open each vault by working in binary. Early levels set switches to a number or read
 * one; later ones add, mask, shift, use two's complement, subnet an IPv4 address, count a Hamming
 * distance, write Gray code, and decode IEEE 754 half precision. Every answer is checked on the server.
 */
export function BinaryBreaker({ g, run }: { g: TechGame; run: BinaryBreakerRun }) {
  const { t } = useTranslation('tech');
  const total = run.vaults.length;
  const { i, next, over } = useAdvance(run, total, g.finish);
  const v = run.vaults[i]!;
  const settable = SET.includes(v.type);
  const prompt = t(`play.binary.types.${v.type}`, { bits: v.bits, n: v.n, x: v.x, y: v.y });
  const code = operands(v);
  return (
    <Sheet>
      <StepBar label={t('play.binary.step', { n: i + 1, total })} n={i + 1} total={total} />
      {settable ? (
        <Card>
          <Text style={styles.prompt}>{prompt}</Text>
          {!!code && <CodeBlock text={code} />}
          <BitInput key={v.id} v={v} level={run.level ?? 1} g={g} step={i} onNext={next} over={over} />
        </Card>
      ) : (
        <QuizStep
          stepKey={v.id}
          q={prompt}
          options={v.options ?? []}
          mono
          before={code ? <CodeBlock text={code} /> : undefined}
          onAnswer={async (choice) => {
            const res = await g.answer(choice === null ? { step: i, timeout: true } : { step: i, choice });
            if (!res) return null;
            g.buzz(res.outcome.correct ? 'success' : 'error');
            return res.outcome;
          }}
          nextLabel={over ? t('play.finish') : undefined}
          onNext={next}
        />
      )}
    </Sheet>
  );
}

function BitInput({
  v,
  level,
  g,
  step,
  onNext,
  over,
}: {
  v: Vault;
  level: number;
  g: TechGame;
  step: number;
  onNext: () => void;
  over: boolean;
}) {
  const { t } = useTranslation('tech');
  const tg = useTranslation('games').t;
  const [bits, setBits] = useState<number[]>(() => Array(v.bits).fill(0));
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const flip = (k: number) => !outcome && setBits(bits.map((b, n) => (n === k ? 1 - b : b)));
  const send = async () => {
    if (outcome || g.busy) return;
    const res = await g.answer({ step, bits });
    if (!res) return;
    g.buzz(res.outcome.correct ? 'success' : 'error');
    setOutcome(res.outcome);
  };
  useKeys((key) => {
    if (key === 'Enter') return void (outcome ? onNext() : send());
    const k = Number(key);
    if (k >= 1 && k <= v.bits) flip(k - 1);
  });
  const answerBits = outcome ? Number(outcome.answer).toString(2).padStart(v.bits, '0') : null;
  // Rows of eight switches at most.
  const rows = Array.from({ length: Math.ceil(v.bits / 8) }, (_, r) =>
    bits.slice(r * 8, r * 8 + 8).map((b, c) => [b, r * 8 + c] as const),
  );
  return (
    <View style={{ gap: 12 }}>
      <Eyebrow text={t('play.binary.switches')} />
      {rows.map((row, r) => (
        <View key={r} style={[styles.bits, LTR]} {...ltr}>
          {row.map(([b, k]) => {
            const place = v.bits - 1 - k;
            return (
              <View key={k} style={{ alignItems: 'center', gap: 4, flex: 1, maxWidth: 52 }}>
                <Text style={styles.place}>{place < 11 ? 2 ** place : `2^${place}`}</Text>
                <Pressable
                  onPress={() => flip(k)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: b === 1 }}
                  accessibilityLabel={t('play.binary.bitA11y', { place: 2 ** place, value: b })}
                  style={[styles.bit, b === 1 && styles.bitOn]}>
                  <Text style={[styles.bitText, b === 1 && { color: '#fff' }]}>{b}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
      {/* The running total helps on the easier levels only. */}
      {level <= 4 && <Text style={styles.total}>{t('play.binary.total', { value: value(bits) })}</Text>}
      {outcome ? (
        <View style={{ gap: 10 }}>
          <Feedback
            tone={outcome.correct ? 'good' : 'bad'}
            title={
              outcome.correct ? `${tg('ui.correct')} · ${tg('ui.points', { count: outcome.points })}` : tg('ui.wrong')
            }
            detail={
              outcome.correct
                ? null
                : t('play.binary.answer', { bits: answerBits!.replace(/(.{4})(?=.)/g, '$1 '), value: outcome.answer })
            }
          />
          <PrimaryButton title={over ? t('play.finish') : tg('ui.next')} icon="arrow-forward" onPress={onNext} />
        </View>
      ) : (
        <PrimaryButton
          title={t('play.binary.open')}
          icon="lock-open-outline"
          busy={g.busy}
          onPress={() => void send()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 24, color: W.ink },
  bits: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  place: { fontFamily: MONO, fontSize: 11, color: W.muted },
  bit: {
    width: '100%',
    minWidth: 34,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.surface,
  },
  bitOn: { backgroundColor: W.ink },
  bitText: { fontFamily: MONO, fontSize: 20, color: W.ink },
  total: { fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft, textAlign: 'center' },
});

/** The worked example: 13 = 8 + 4 + 1, so the switches under 8, 4 and 1 are on. */
function HowTo() {
  const bits = [1, 1, 0, 1];
  return (
    <View style={{ gap: 8, alignItems: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.bits, LTR, { alignSelf: 'stretch' }]} {...ltr}>
        {bits.map((b, k) => (
          <View key={k} style={{ alignItems: 'center', gap: 4, flex: 1, maxWidth: 52 }}>
            <Text style={styles.place}>{2 ** (3 - k)}</Text>
            <View style={[styles.bit, b === 1 && styles.bitOn]}>
              <Text style={[styles.bitText, b === 1 && { color: '#fff' }]}>{b}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.total, { fontFamily: MONO, color: W.ink }, LTR]} {...ltr}>
        8 + 4 + 0 + 1 = 13
      </Text>
    </View>
  );
}

defineGameFrame('binary-breaker', {
  HowTo,
  review: (run) =>
    ((run as BinaryBreakerRun).vaults ?? []).flatMap((v) =>
      v.result
        ? [
            {
              key: String(v.id),
              correct: v.result.correct,
              main: `${v.type} · ${operands(v) ?? ''}`.replace(/\n/g, ' ; '),
              detail: v.result.answer,
            },
          ]
        : [],
    ),
});
