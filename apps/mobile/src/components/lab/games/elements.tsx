import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Feedback, FONT, PrimaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { ElementCategory, ElementCell, ElementQuestRun, GameOutcome } from '@/lib/api';
import { useKeys } from '@/lib/games/english';
import type { LabGame } from '@/lib/games/use-lab-run';

import { defineGameFrame } from '../contract';
import type { CoverMap } from '../station';
import { Board, Card, Chem, StepHeader } from './kit';

/** Family colours, used as a hint on the lower levels only (always with the key below the table). */
export const FAMILY: Record<ElementCategory, string> = {
  alkali: '#F6D9D2',
  'alkaline-earth': '#F8E7C8',
  transition: '#DCE6F5',
  'post-transition': '#DDEFE6',
  metalloid: '#E7E2F3',
  nonmetal: '#F4F1C9',
  halogen: '#D5EEF0',
  noble: '#EADCF0',
  lanthanide: '#EFE7DA',
  actinide: '#EDE0E0',
};

type Cell = { el: ElementCell; col: number; row: number };

/**
 * Where each element sits. Up to calcium the short table (Groups 1, 2, 13–18: eight columns, so it fits a
 * phone); beyond that the full 18 columns, with the f-block rows left out (a "57–71" cell in Group 3).
 */
function layout(table: ElementCell[], upTo: number): { cells: Cell[]; cols: number; rows: number; fBlocks: { col: number; row: number; label: string }[] } {
  const short = upTo <= 20;
  const colOf = (g: number) => (short ? (g <= 2 ? g - 1 : g - 11) : g - 1);
  const cells = table
    .filter((e) => e.number <= upTo && e.group > 0)
    .map((el) => ({ el, col: colOf(el.group), row: el.period - 1 }));
  const rows = Math.max(...cells.map((c) => c.row)) + 1;
  const fBlocks = short ? [] : [6, 7].filter((p) => p <= rows).map((p) => ({ col: 2, row: p - 1, label: p === 6 ? '57–71' : '89–103' }));
  return { cells, cols: short ? 8 : 18, rows, fBlocks };
}

/**
 * Element Quest on a real periodic table: read the mission, tap the elements that fit (tapping also shows
 * what this level lets you look up about them), then check. The server checks the whole set.
 */
export function ElementCabinet({
  g,
  run,
  collected,
  onCollected,
}: {
  g: LabGame;
  run: ElementQuestRun;
  map?: CoverMap;
  /** The selection, when the frame keeps it (it shows it as chips too). */
  collected?: string[];
  onCollected?: (symbols: string[]) => void;
}) {
  const { t } = useTranslation('lab');
  const { width } = useWindowDimensions();
  const [i, setI] = useState(() => Math.min(run.at, run.missions.length - 1));
  const m = run.missions[i]!;
  const [own, setOwn] = useState<string[]>([]);
  const picked = collected ?? own;
  const setPicked = (list: string[]) => (onCollected ? onCollected(list) : setOwn(list));
  const [looking, setLooking] = useState<ElementCell | null>(null);
  const [cursor, setCursor] = useState(0);
  const [outcome, setOutcome] = useState<{ o: GameOutcome; done: boolean } | null>(null);
  const answer = (outcome?.o.answer as string[] | undefined) ?? [];

  const { cells, cols, rows, fBlocks } = layout(run.table, m.upTo);
  const gap = 3;
  const fit = Math.floor((Math.min(width - (width >= 1024 ? 280 : 0), m.upTo > 20 ? 1000 : 520) - 32 - gap * (cols - 1)) / cols);
  const size = Math.max(44, Math.min(64, fit));
  const tableWidth = cols * size + (cols - 1) * gap;
  const ordered = [...cells].sort((a, b) => a.row - b.row || a.col - b.col);

  const tap = (el: ElementCell) => {
    if (outcome) return setLooking(el);
    g.buzz('tap');
    setLooking(el);
    if (m.single) setPicked(picked[0] === el.symbol ? [] : [el.symbol]);
    else setPicked(picked.includes(el.symbol) ? picked.filter((s) => s !== el.symbol) : [...picked, el.symbol]);
  };
  const submit = async () => {
    if (!picked.length || outcome || g.busy) return;
    const res = await g.answer({ step: i, symbols: picked });
    if (!res) return;
    setOutcome({ o: res.outcome, done: res.done });
    g.buzz(res.outcome.correct ? 'success' : 'error');
  };
  const next = () => {
    if (!outcome) return;
    if (outcome.done) return void g.finish();
    setOutcome(null);
    setPicked([]);
    setLooking(null);
    setI(i + 1);
  };

  // Keyboard on the web: arrows move round the table, Space selects, Enter checks / continues.
  useKeys((key) => {
    if (key === 'Enter') return outcome ? next() : void submit();
    const here = ordered[cursor] ?? ordered[0]!;
    const move = (dc: number, dr: number) => {
      const target =
        dr === 0
          ? ordered.filter((c) => c.row === here.row && Math.sign(c.col - here.col) === dc).sort((a, b) => dc * (a.col - b.col))[0]
          : ordered.filter((c) => Math.sign(c.row - here.row) === dr).sort((a, b) => Math.abs(a.row - here.row) - Math.abs(b.row - here.row) || Math.abs(a.col - here.col) - Math.abs(b.col - here.col))[0];
      if (target) setCursor(ordered.indexOf(target));
    };
    if (key === 'ArrowRight') move(1, 0);
    if (key === 'ArrowLeft') move(-1, 0);
    if (key === 'ArrowDown') move(0, 1);
    if (key === 'ArrowUp') move(0, -1);
    if (key === ' ') tap(here.el);
  });

  const stateOf = (sym: string) => {
    if (!outcome) return picked.includes(sym) ? 'picked' : 'idle';
    const right = answer.includes(sym);
    const chose = picked.includes(sym);
    return right && chose ? 'correct' : chose ? 'wrong' : right ? 'missed' : 'idle';
  };

  const families = m.colours ? [...new Set(cells.map((c) => c.el.category))] : [];

  return (
    <Board
      wide={!!m && m.upTo > 20}
      footer={
        outcome ? (
          <>
            <Feedback
              tone={outcome.o.correct ? 'good' : 'bad'}
              title={outcome.o.correct ? t('chem.right') : t('chem.wrong')}
              detail={outcome.o.correct ? null : t('chem.answerWas', { answer: answer.join(', ') })}
            />
            <PrimaryButton title={outcome.done ? t('result.see') : t('chem.next')} icon="arrow-forward" onPress={next} />
          </>
        ) : (
          <PrimaryButton
            title={picked.length ? t('chem.checkCount', { count: picked.length }) : m.single ? t('chem.pickOne') : t('chem.pickSome')}
            icon="checkmark"
            disabled={!picked.length}
            busy={g.busy}
            onPress={() => void submit()}
          />
        )
      }>
      <StepHeader eyebrow={t('chem.step.element', { n: i + 1, total: run.missions.length })} title={onCollected ? null : m.text} chem />
      <Text style={styles.how}>{m.single ? t('chem.single') : t('chem.multi')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 6 }} style={{ marginHorizontal: -16 }}>
        <View
          style={{ width: tableWidth, height: rows * size + (rows - 1) * gap, marginHorizontal: 16 }}
          accessibilityLabel={t('chem.table')}>
          {cells.map(({ el, col, row }, k) => {
            const s = stateOf(el.symbol);
            const focused = ordered[cursor]?.el.symbol === el.symbol;
            const bg =
              s === 'picked' ? W.focusSoft : s === 'correct' ? W.correctSoft : s === 'wrong' ? W.wrongSoft : m.colours ? FAMILY[el.category] : W.surface;
            const border = s === 'picked' ? W.focus : s === 'correct' || s === 'missed' ? W.correct : s === 'wrong' ? W.wrong : W.line;
            const name = el.name ?? el.symbol;
            return (
              <Pressable
                key={el.symbol}
                onPress={() => {
                  setCursor(ordered.findIndex((c) => c.el.symbol === el.symbol));
                  tap(el);
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: s === 'picked' || s === 'correct' || s === 'wrong' }}
                accessibilityLabel={`${t('chem.cellA11y', { name, symbol: el.symbol, number: el.number })}${s === 'correct' ? `, ${t('chem.right')}` : s === 'wrong' ? `, ${t('chem.wrong')}` : s === 'missed' ? `, ${t('chem.missed')}` : ''}`}
                style={[
                  styles.cell,
                  {
                    left: col * (size + gap),
                    top: row * (size + gap),
                    width: size,
                    height: size,
                    backgroundColor: bg,
                    borderColor: border,
                    borderWidth: s === 'idle' ? 1 : 2,
                    borderStyle: s === 'missed' ? 'dashed' : 'solid',
                  },
                  focused && styles.focus,
                ]}
                testID={k === 0 ? 'first-cell' : undefined}>
                <Text style={[styles.z, { fontSize: size > 50 ? 10 : 9 }]} allowFontScaling={false}>
                  {el.number}
                </Text>
                <Text style={[styles.sym, { fontSize: size > 50 ? 19 : 16 }]} allowFontScaling={false}>
                  {el.symbol}
                </Text>
                {(s === 'correct' || s === 'wrong' || s === 'missed') && (
                  <View style={[styles.mark, { backgroundColor: s === 'wrong' ? W.wrong : W.correct }]}>
                    <Ionicons name={s === 'wrong' ? 'close' : 'checkmark'} size={10} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
          {fBlocks.map((f) => (
            <View
              key={f.label}
              style={[styles.cell, styles.fCell, { left: f.col * (size + gap), top: f.row * (size + gap), width: size, height: size }]}
              accessible
              accessibilityLabel={t('chem.fLabel')}>
              <Text style={[styles.z, { fontSize: 9 }]} allowFontScaling={false}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {families.length > 0 && (
        <View style={styles.legend} accessibilityLabel={t('chem.legend')}>
          {families.map((c) => (
            <View key={c} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: FAMILY[c] }]} />
              <Text style={styles.legendText}>{t(`elements.category.${c}` as 'elements.category.noble')}</Text>
            </View>
          ))}
        </View>
      )}

      {looking ? (
        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={styles.bigCell}>
            <Text style={styles.z}>{looking.number}</Text>
            <Text style={{ fontFamily: FONT, fontSize: 26, color: W.ink }}>{looking.symbol}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            {!!looking.name && <Text style={{ fontFamily: FONT, fontSize: 17, color: W.ink }}>{looking.name}</Text>}
            {(['category', 'state', 'shells', 'config', 'mass', 'en', 'ie1'] as const)
              .filter((f) => looking[f] !== undefined && (f !== 'category' || m.colours || !!looking.name))
              .map((f) => (
                <Text key={f} style={styles.fact}>
                  {t(`chem.fields.${f}`)}:{' '}
                  {f === 'category' ? (
                    <Text style={styles.factValue}>{t(`elements.category.${looking.category}` as 'elements.category.noble')}</Text>
                  ) : f === 'state' ? (
                    <Text style={styles.factValue}>{t(`elements.state.${looking.state!}` as 'elements.state.gas')}</Text>
                  ) : (
                    <Chem style={styles.factValue}>{String(looking[f])}</Chem>
                  )}
                </Text>
              ))}
            {!!looking.fact && <Text style={[styles.fact, { marginTop: 4 }]}>{looking.fact}</Text>}
          </View>
        </Card>
      ) : (
        <Text style={styles.how}>{t('chem.tapTip')}</Text>
      )}

      {outcome && !!outcome.o.why && (
        <Card>
          <Text style={styles.eyebrow}>{t('chem.why').toUpperCase()}</Text>
          <Chem style={styles.fact}>{outcome.o.why}</Chem>
        </Card>
      )}
    </Board>
  );
}

/** The worked example in the how-to-play sheet: three halogens picked on a strip of the table. */
function HowTo() {
  const strip: [string, number, 'correct' | 'idle'][] = [
    ['O', 8, 'idle'],
    ['F', 9, 'correct'],
    ['S', 16, 'idle'],
    ['Cl', 17, 'correct'],
    ['Ar', 18, 'idle'],
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
      {strip.map(([s, z, st]) => (
        <View key={s} style={[styles.cell, { position: 'relative', width: 46, height: 46 }, st === 'correct' && { backgroundColor: W.focusSoft, borderColor: W.focus, borderWidth: 2 }]}>
          <Text style={[styles.z, { fontSize: 9 }]}>{z}</Text>
          <Text style={[styles.sym, { fontSize: 16 }]}>{s}</Text>
        </View>
      ))}
    </View>
  );
}

defineGameFrame('element-quest', {
  HowTo,
  review: (run) =>
    (run as ElementQuestRun).missions.map((m) => ({
      key: String(m.id),
      correct: !!m.result?.correct,
      main: m.text,
      detail: m.result ? m.result.answer.join(', ') : undefined,
    })),
});

const styles = StyleSheet.create({
  how: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  cell: { position: 'absolute', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderColor: W.line, borderWidth: 1, backgroundColor: W.surface },
  fCell: { backgroundColor: W.given, borderStyle: 'dashed' },
  focus: { borderColor: W.ink, borderWidth: 2.5 },
  z: { position: 'absolute', top: 3, left: 4, fontFamily: Fonts.semibold, color: W.muted },
  sym: { fontFamily: FONT, color: W.ink, marginTop: 6 },
  mark: { position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1, borderColor: W.lineStrong },
  legendText: { fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft },
  bigCell: { width: 64, height: 64, borderRadius: 10, borderWidth: 1.5, borderColor: W.ink, alignItems: 'center', justifyContent: 'center' },
  fact: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  factValue: { fontFamily: Fonts.bold, color: W.ink },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
});
