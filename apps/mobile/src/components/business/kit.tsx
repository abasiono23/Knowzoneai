import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { FONT, W } from '@/components/games/ui';
import { Board, QuizCard } from '@/components/history/quiz';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { AnalystStep, Grade } from '@/lib/api';
import { money } from '@/lib/games/business';
import type { BusinessGame } from '@/lib/games/use-lab-run';

/**
 * Building blocks shared by the Business District games, in the word games' look and a finance app's
 * manner: a light page with a fixed action bar, key-figure tiles, ledgers with tabular numbers, clean
 * charts (lines, bars, a split bar), choice lists, number steppers, and the analyst's desk questions.
 * Colour only carries meaning (green up, red down) and always comes with a sign, an icon or words.
 */
export const INK = W.ink;
export const PAPER = W.surface;
export const GREEN = W.correct;
export const RED = W.wrong;
/** Series colours for charts: ink, then a calm blue and an amber. */
export const SERIES = [W.ink, '#2F6FD0', '#B26A00', '#8A8FA8'];

/** The game's page. `scene` is no longer drawn (kept so older callers still fit). */
export function GameScreen({ children, action }: { scene?: number; children: ReactNode; action: ReactNode }) {
  return <Board footer={action}>{children}</Board>;
}

/** A heading in small capitals. */
export function Eyebrow({ children, color = W.muted }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{typeof children === 'string' ? children.toUpperCase() : children}</Text>;
}

/** A white card. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(180)} style={[styles.card, style]}>
      {children}
    </Animated.View>
  );
}

/** The top of a turn: what it is, then key figures as tiles (big tabular numbers, small labels). */
export function Header({
  title,
  subtitle,
  stats,
}: {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string; color?: string; tone?: 'good' | 'bad' }[];
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!stats?.length && (
        <View style={styles.tiles}>
          {stats.map((s) => {
            const tone = s.tone ?? (s.color === RED || s.color === '#FF8FA6' || s.color === '#FFB4C2' ? 'bad' : s.color && s.color !== '#fff' ? 'good' : undefined);
            return (
              <View key={s.label} style={styles.tile} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
                <Text style={styles.tileLabel} numberOfLines={2}>
                  {s.label}
                </Text>
                <Text style={[styles.tileValue, tone === 'good' && { color: GREEN }, tone === 'bad' && { color: RED }]} numberOfLines={1} adjustsFontSizeToFit>
                  {s.value}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

/** − value + with an optional second, bigger step. Buttons are 44 pt. */
export function Stepper({
  label,
  hint,
  value,
  onChange,
  step,
  big,
  min = 0,
  max = Infinity,
  format = String,
  warn,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  big?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
  warn?: boolean;
}) {
  const { t } = useTranslation('business');
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  const button = (icon: 'remove' | 'add' | 'play-back' | 'play-forward', d: number, a11y: string) => {
    const off = d < 0 ? value <= min : value >= max;
    return (
      <Pressable
        onPress={() => set(value + d)}
        disabled={off}
        accessibilityRole="button"
        accessibilityLabel={`${a11y} (${d > 0 ? '+' : '−'}${format(Math.abs(d))}): ${label}`}
        hitSlop={2}
        style={({ pressed }) => [styles.stepBtn, off && { opacity: 0.3 }, pressed && { backgroundColor: W.keyPressed }]}>
        <Ionicons name={icon} size={icon.startsWith('play') ? 13 : 18} color={INK} />
      </Pressable>
    );
  };
  return (
    <View style={styles.stepRow}>
      <View style={{ flex: 1, gap: 2, minWidth: 120 }}>
        <Text style={styles.stepLabel}>{label}</Text>
        {!!hint && (
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-start' }}>
            {warn && <Ionicons name="alert-circle" size={14} color={RED} style={{ marginTop: 2 }} />}
            <Text style={[kit.small, warn && { color: RED }]}>{hint}</Text>
          </View>
        )}
      </View>
      <View style={styles.stepControls}>
        {big !== undefined && button('play-back', -big, t('ui.less'))}
        {button('remove', -step, t('ui.less'))}
        <Text style={styles.stepValue} accessibilityLiveRegion="polite">
          {format(value)}
        </Text>
        {button('add', step, t('ui.more'))}
        {big !== undefined && button('play-forward', big, t('ui.more'))}
      </View>
    </View>
  );
}

/** A list of options to pick one from (radio rows). */
export function Options({
  options,
  picked,
  onPick,
  disabled,
  marks,
}: {
  options: { id: string; label: string; note?: string }[];
  picked: string | null;
  onPick: (id: string) => void;
  disabled?: boolean;
  /** After answering: which options were right or wrong. */
  marks?: Record<string, 'right' | 'wrong'>;
}) {
  return (
    <View style={{ gap: 8 }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = picked === o.id;
        const mark = marks?.[o.id];
        return (
          <Pressable
            key={o.id}
            onPress={() => onPick(o.id)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, disabled }}
            style={({ pressed }) => [
              styles.option,
              on && styles.optionOn,
              mark === 'right' && { borderColor: GREEN, backgroundColor: W.correctSoft },
              mark === 'wrong' && { borderColor: RED, backgroundColor: W.wrongSoft },
              pressed && { backgroundColor: W.key },
            ]}>
            <Ionicons
              name={mark === 'right' ? 'checkmark-circle' : mark === 'wrong' ? 'close-circle' : on ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={mark === 'right' ? GREEN : mark === 'wrong' ? RED : on ? INK : W.lineStrong}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.optionText}>{o.label}</Text>
              {!!o.note && <Text style={kit.small}>{o.note}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A ledger: label on the left, amount on the right in tabular figures; totals ruled off in bold. */
export function Statement({ rows }: { rows: { label: string; value: string; total?: boolean; color?: string; hidden?: boolean }[] }) {
  return (
    <View style={styles.ledger}>
      {rows
        .filter((r) => !r.hidden)
        .map((r, k) => (
          <View key={`${r.label}${k}`} style={[styles.line, r.total && styles.total]} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
            <Text style={[styles.lineLabel, r.total && { fontFamily: Fonts.bold }]}>{r.label}</Text>
            <Text style={[styles.lineValue, { color: r.color === '#fff' ? INK : (r.color ?? (r.value.startsWith('−') ? W.inkSoft : INK)) }, r.total && { fontFamily: FONT }]}>
              {r.value}
            </Text>
          </View>
        ))}
    </View>
  );
}

/** How good a decision was: an icon and a word, never colour alone. */
export function GradeBadge({ grade }: { grade: Grade }) {
  const { t } = useTranslation('business');
  const look =
    grade === 'best'
      ? { bg: W.correctSoft, ink: GREEN, icon: 'trophy-outline' as const, text: t('ui.best') }
      : grade === 'ok'
        ? { bg: W.rareSoft, ink: W.rare, icon: 'thumbs-up-outline' as const, text: t('ui.fair') }
        : { bg: W.wrongSoft, ink: RED, icon: 'alert-circle-outline' as const, text: t('ui.poor') };
  return (
    <View style={[styles.badge, { backgroundColor: look.bg }]}>
      <Ionicons name={look.icon} size={14} color={look.ink} />
      <Text style={{ color: look.ink, fontFamily: Fonts.bold, fontSize: 13 }}>{look.text}</Text>
    </View>
  );
}

/** The business idea behind a turn. */
export function Lesson({ text }: { text: string }) {
  const { t } = useTranslation('business');
  return (
    <View style={styles.lesson}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name="school-outline" size={16} color={W.inkSoft} />
        <Eyebrow>{t('ui.lesson')}</Eyebrow>
      </View>
      <Text style={kit.body}>{text}</Text>
    </View>
  );
}

/** A bar of parts (e.g. needs, wants, savings), with a legend so colour isn't the only cue. */
export function SplitBar({ parts }: { parts: { share: number; color: string; label?: string }[] }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.share), 0) || 1;
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.split}>
        {parts.map((p, i) => (
          <View key={i} style={{ flex: Math.max(0, p.share), backgroundColor: p.color, borderRightWidth: i < parts.length - 1 && p.share > 0 ? 2 : 0, borderRightColor: W.surface }} />
        ))}
      </View>
      {parts.some((p) => p.label) && (
        <View style={styles.legend}>
          {parts.map((p, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: p.color }]} />
              <Text style={kit.small}>{`${p.label} ${Math.round((Math.max(0, p.share) / total) * 100)}%`}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Progress towards a target. */
export function Meter({ value, max, color = GREEN }: { value: number; max: number; color?: string }) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View style={styles.meter} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(share * 100) }}>
      <View style={{ width: `${share * 100}%`, height: '100%', backgroundColor: color === '#7C5CFF' ? INK : color, borderRadius: 3 }} />
    </View>
  );
}

/** The fixed button at the bottom, with an optional warning above it. */
export function Action({
  title,
  onPress,
  disabled,
  icon = 'arrow-forward',
  note,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  note?: string | null;
}) {
  return (
    <View style={{ gap: 8 }}>
      {!!note && (
        <View style={styles.note} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <Ionicons name="alert-circle" size={16} color={RED} />
          <Text style={{ flex: 1, color: RED, fontFamily: Fonts.semibold, fontSize: 13 }}>{note}</Text>
        </View>
      )}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !!disabled }}
        style={({ pressed }) => [styles.primary, disabled && { backgroundColor: '#B9B7C8' }, pressed && { backgroundColor: '#2A2E4A' }]}>
        <Text style={styles.primaryText}>{title}</Text>
        <Ionicons name={icon} size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

/** Short money for axes: $1.2k, $3.4m. */
export function shortMoney(n: number) {
  const a = Math.abs(n);
  const s = a >= 1e6 ? `${Math.round(a / 1e5) / 10}m` : a >= 1e4 ? `${Math.round(a / 1e3)}k` : a >= 1e3 ? `${Math.round(a / 100) / 10}k` : `${Math.round(a)}`;
  return `${n < 0 ? '−' : ''}$${s}`;
}
const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v)!;
};

/**
 * A line chart with a light grid: up to three series over the same labels, an optional dashed target
 * line, and the last value labelled. Screen readers get `summary`.
 */
export function LineChart({
  title,
  labels,
  series,
  target,
  format = shortMoney,
  summary,
  height = 150,
}: {
  title: string;
  labels: string[];
  series: { name: string; values: (number | null)[]; color?: string; dashed?: boolean }[];
  target?: { value: number; label: string };
  format?: (n: number) => string;
  summary: string;
  height?: number;
}) {
  const { t } = useTranslation('business');
  const all = [...series.flatMap((s) => s.values.filter((v): v is number => v !== null)), ...(target ? [target.value] : [])];
  const lo = Math.min(0, ...all);
  const hi = niceMax(Math.max(...all, 1) - Math.min(0, lo)) + Math.min(0, lo);
  const W0 = 320;
  const pad = { l: 44, r: 12, t: 10, b: 22 };
  const w = W0 - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const n = Math.max(2, labels.length);
  const x = (i: number) => pad.l + (w * i) / (n - 1);
  const y = (v: number) => pad.t + h - ((v - lo) / (hi - lo || 1)) * h;
  const ticks = [0, 0.5, 1].map((f) => lo + (hi - lo) * f);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={(t as unknown as (k: string, o?: Record<string, unknown>) => string)('charts.chartA11y', { title, summary })} style={{ gap: 6 }}>
      <Eyebrow>{title}</Eyebrow>
      <Svg width="100%" height={height} viewBox={`0 0 ${W0} ${height}`}>
        {ticks.map((v) => (
          <G key={v}>
            <Line x1={pad.l} x2={W0 - pad.r} y1={y(v)} y2={y(v)} stroke={W.line} strokeWidth={1} />
            <SvgText x={pad.l - 6} y={y(v) + 4} fontSize={10} fill={W.muted} textAnchor="end" fontFamily={Fonts.semibold}>
              {format(v)}
            </SvgText>
          </G>
        ))}
        {lo < 0 && <Line x1={pad.l} x2={W0 - pad.r} y1={y(0)} y2={y(0)} stroke={W.lineStrong} strokeWidth={1} />}
        {target && (
          <G>
            <Line x1={pad.l} x2={W0 - pad.r} y1={y(target.value)} y2={y(target.value)} stroke={GREEN} strokeWidth={1.5} strokeDasharray="5 4" />
            <SvgText x={W0 - pad.r} y={y(target.value) - 4} fontSize={10} fill={GREEN} textAnchor="end" fontFamily={Fonts.bold}>
              {target.label}
            </SvgText>
          </G>
        )}
        {labels.map((l, i) =>
          labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0 ? (
            <SvgText key={i} x={x(i)} y={height - 6} fontSize={10} fill={W.muted} textAnchor="middle" fontFamily={Fonts.semibold}>
              {l}
            </SvgText>
          ) : null,
        )}
        {series.map((s, k) => {
          const pts = s.values.map((v, i) => (v === null ? null : [x(i), y(v)] as const)).filter((p): p is readonly [number, number] => !!p);
          if (!pts.length) return null;
          const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
          const color = s.color ?? SERIES[k]!;
          const last = pts.at(-1)!;
          return (
            <G key={s.name}>
              <Path d={d} stroke={color} strokeWidth={2.2} fill="none" strokeDasharray={s.dashed ? '4 3' : undefined} strokeLinejoin="round" />
              {pts.map(([px, py], i) => (
                <Circle key={i} cx={px} cy={py} r={i === pts.length - 1 ? 3.5 : 2.2} fill={i === pts.length - 1 ? color : W.surface} stroke={color} strokeWidth={1.5} />
              ))}
              {k === 0 && (
                <SvgText x={Math.min(last[0], W0 - pad.r - 2)} y={last[1] - 8} fontSize={11} fill={color} textAnchor="end" fontFamily={Fonts.bold}>
                  {format(s.values.filter((v): v is number => v !== null).at(-1)!)}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
      {series.length > 1 && (
        <View style={styles.legend}>
          {series.map((s, k) => (
            <View key={s.name} style={styles.legendItem}>
              <View style={[styles.swatchLine, { backgroundColor: s.color ?? SERIES[k] }, s.dashed && { opacity: 0.6 }]} />
              <Text style={kit.small}>{s.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Horizontal bars with values written at the end (positive right, negative left of a zero line). */
export function BarList({
  title,
  rows,
  format = shortMoney,
  summary,
}: {
  title: string;
  rows: { label: string; value: number; strong?: boolean }[];
  format?: (n: number) => string;
  summary?: string;
}) {
  const { t } = useTranslation('business');
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  const neg = rows.some((r) => r.value < 0);
  return (
    <View accessible accessibilityLabel={(t as unknown as (k: string, o?: Record<string, unknown>) => string)('charts.chartA11y', { title, summary: summary ?? rows.map((r) => `${r.label} ${format(r.value)}`).join(', ') })} style={{ gap: 8 }}>
      <Eyebrow>{title}</Eyebrow>
      {rows.map((r) => {
        const share = Math.abs(r.value) / max;
        return (
          <View key={r.label} style={styles.barRow}>
            <Text style={[styles.barLabel, r.strong && { fontFamily: Fonts.bold, color: INK }]} numberOfLines={1}>
              {r.label}
            </Text>
            <View style={[styles.barTrack, neg && { flexDirection: 'row' }]}>
              {neg && <View style={{ flex: 1, alignItems: 'flex-end' }}>{r.value < 0 && <View style={[styles.bar, { width: `${share * 100}%`, backgroundColor: RED }]} />}</View>}
              {neg && <View style={styles.zero} />}
              <View style={{ flex: 1 }}>{r.value >= 0 && <View style={[styles.bar, { width: `${share * 100}%`, backgroundColor: r.strong ? INK : SERIES[1] }]} />}</View>
            </View>
            <Text style={[styles.barValue, r.value < 0 && { color: RED }]}>{format(r.value)}</Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * A demand chart: customers at each price (a straight line through the research points), your price
 * marked, and optionally where profit is best. Prices along the bottom, customers up the side.
 */
export function DemandChart({
  title,
  points,
  price,
  maxPrice,
  summary,
}: {
  title: string;
  points: { price: number; customers: number }[];
  price?: number;
  maxPrice: number;
  summary: string;
}) {
  const { t } = useTranslation('business');
  const W0 = 320;
  const H0 = 150;
  const pad = { l: 40, r: 14, t: 10, b: 24 };
  const top = niceMax(Math.max(...points.map((p) => p.customers), 1));
  const x = (p: number) => pad.l + ((W0 - pad.l - pad.r) * p) / maxPrice;
  const y = (c: number) => pad.t + (H0 - pad.t - pad.b) * (1 - c / top);
  const sorted = [...points].sort((a, b) => a.price - b.price);
  // The straight line through the research, carried to both axes.
  const [a, b] = [sorted[0]!, sorted.at(-1)!];
  const slope = b.price !== a.price ? (b.customers - a.customers) / (b.price - a.price) : 0;
  const at = (p: number) => Math.max(0, a.customers + slope * (p - a.price));
  const end = slope < 0 ? Math.min(maxPrice, a.price - a.customers / slope) : maxPrice;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={(t as unknown as (k: string, o?: Record<string, unknown>) => string)('charts.chartA11y', { title, summary })} style={{ gap: 6 }}>
      <Eyebrow>{title}</Eyebrow>
      <Svg width="100%" height={H0} viewBox={`0 0 ${W0} ${H0}`}>
        {[0, 0.5, 1].map((f) => (
          <G key={f}>
            <Line x1={pad.l} x2={W0 - pad.r} y1={y(top * f)} y2={y(top * f)} stroke={W.line} />
            <SvgText x={pad.l - 6} y={y(top * f) + 4} fontSize={10} fill={W.muted} textAnchor="end">
              {Math.round(top * f)}
            </SvgText>
          </G>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <SvgText key={f} x={x(maxPrice * f)} y={H0 - 6} fontSize={10} fill={W.muted} textAnchor="middle">
            {money(Math.round(maxPrice * f * 4) / 4)}
          </SvgText>
        ))}
        <Line x1={x(0)} y1={y(at(0))} x2={x(end)} y2={y(at(end))} stroke={SERIES[1]} strokeWidth={2} strokeDasharray="5 3" />
        {sorted.map((p) => (
          <Circle key={p.price} cx={x(p.price)} cy={y(p.customers)} r={4} fill={SERIES[1]} />
        ))}
        {price !== undefined && price > 0 && (
          <G>
            <Line x1={x(price)} x2={x(price)} y1={pad.t} y2={H0 - pad.b} stroke={INK} strokeWidth={1.5} />
            <Rect x={x(price) - 3} y={y(at(price)) - 3} width={6} height={6} fill={INK} />
            <SvgText x={x(price) + 4} y={pad.t + 10} fontSize={10} fill={INK} fontFamily={Fonts.bold}>
              {`${(t as unknown as (k: string) => string)('charts.yourPrice')} ${money(price)}`}
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
}

// ─── The analyst's desk ───────────────────────────────────────────────────────

/**
 * The analyst's desk after the simulation turns: one question at a time, with the numbers filled in
 * from the server, a clock from Intermediate (unless the timer is off), and the method afterwards.
 * Returns null when the run has no desk or hasn't reached it.
 */
export function AnalystDesk({ g, run, paused }: { g: BusinessGame; run: { at: number; status: string; hearts?: number; analyst?: AnalystStep[]; turns?: number }; paused?: boolean }) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  const desk = run.analyst ?? [];
  const turns = run.turns ?? 0;
  // The question on screen stays put after it's answered (so its result shows), until Next.
  const [k, setK] = useState(() => Math.max(0, Math.min(desk.length - 1, run.at - turns)));
  const current = desk[k];
  if (!current) return null;
  const last = k + 1 >= desk.length || run.status !== 'playing' || (run.hearts ?? 1) <= 0;
  return (
    <Board>
      <View style={{ gap: 4 }}>
        <Eyebrow>{tx('analyst.eyebrow')}</Eyebrow>
        <Text style={styles.title}>{tx(`analyst.kinds.${current.kind}.name`)}</Text>
        <Text style={kit.small}>{tx('analyst.intro')}</Text>
      </View>
      <DeskQuestion
        key={current.id}
        q={current}
        eyebrow={tx('analyst.step', { n: k + 1, total: desk.length })}
        paused={paused}
        nextLabel={last ? t('ui.finish') : tx('analyst.next')}
        onAnswer={async (choice) => {
          const res = await g.answer(choice === null ? { step: turns + k, timeout: true } : { step: turns + k, choice });
          if (!res) return null;
          g.buzz(res.outcome.correct ? 'success' : 'error');
          return res.outcome;
        }}
        onNext={() => (last ? void g.finish() : setK(k + 1))}
      />
    </Board>
  );
}

/** One desk question (also used inside Profit Quest's own sequence). */
export function DeskQuestion({
  q,
  eyebrow,
  paused,
  nextLabel,
  onAnswer,
  onNext,
}: {
  q: Omit<AnalystStep, 'id'>;
  eyebrow: string;
  paused?: boolean;
  nextLabel: string;
  onAnswer: Parameters<typeof QuizCard>[0]['onAnswer'];
  onNext: () => void;
}) {
  const { t } = useTranslation('business');
  const tx = t as unknown as (k: string, o?: Record<string, unknown>) => string;
  return (
    <QuizCard
      eyebrow={eyebrow}
      q={tx(`analyst.kinds.${q.kind}.q`, q.vars)}
      options={q.options}
      seconds={q.seconds}
      paused={paused}
      ltr
      done={q.result ? { correct: q.result.correct, answer: q.result.answer, choice: q.result.choice } : undefined}
      onAnswer={onAnswer}
      onNext={onNext}
      nextLabel={nextLabel}
      explain={() => (
        <View style={styles.lesson}>
          <Eyebrow>{tx('analyst.method')}</Eyebrow>
          <Text style={[kit.body, Platform.OS !== 'web' && { writingDirection: 'ltr' }]}>{tx(`analyst.kinds.${q.kind}.how`)}</Text>
        </View>
      )}
    />
  );
}

/** Whether a business run has reached its analyst's desk. */
export const atDesk = (run: { at: number; turns?: number; analyst?: AnalystStep[] }) =>
  !!run.analyst?.length && run.turns !== undefined && run.at >= run.turns;

export const kit = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { color: INK, fontSize: 15, lineHeight: 22, fontFamily: Fonts.regular },
  small: { color: W.inkSoft, fontSize: 13, lineHeight: 18, fontFamily: Fonts.regular },
  title: { fontFamily: FONT, color: INK, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
});

const styles = StyleSheet.create({
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  card: { gap: 12, padding: 16, borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  title: { fontFamily: FONT, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, color: INK },
  subtitle: { fontFamily: Fonts.semibold, fontSize: 14, color: W.muted },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    flexGrow: 1,
    flexBasis: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
    gap: 2,
  },
  tileLabel: { fontFamily: Fonts.semibold, fontSize: 12, color: W.muted },
  tileValue: { fontFamily: FONT, fontSize: 20, color: INK, fontVariant: ['tabular-nums'], letterSpacing: -0.3 },
  stepRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: W.line },
  stepLabel: { fontFamily: Fonts.bold, color: INK, fontSize: 15 },
  stepControls: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: W.key,
  },
  stepValue: { minWidth: 72, textAlign: 'center', fontFamily: FONT, color: INK, fontSize: 16, fontVariant: ['tabular-nums'] },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: W.line,
    backgroundColor: W.surface,
  },
  optionOn: { borderColor: INK },
  optionText: { color: INK, fontSize: 15, lineHeight: 21, fontFamily: Fonts.semibold },
  ledger: { gap: 0 },
  line: { flexDirection: 'row', alignItems: 'baseline', gap: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: W.line, borderStyle: 'dotted' },
  total: { borderBottomWidth: 0, borderTopWidth: 1.5, borderTopColor: INK, borderStyle: 'solid', marginTop: 2 },
  lineLabel: { flex: 1, color: W.inkSoft, fontSize: 14, fontFamily: Fonts.regular },
  lineValue: { fontSize: 15, fontFamily: Fonts.bold, fontVariant: ['tabular-nums'], textAlign: 'right' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lesson: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: W.given },
  split: { flexDirection: 'row', height: 14, borderRadius: 4, overflow: 'hidden', backgroundColor: W.line },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  swatchLine: { width: 14, height: 3, borderRadius: 2 },
  meter: { height: 6, borderRadius: 3, backgroundColor: W.line, overflow: 'hidden' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, backgroundColor: W.wrongSoft },
  primary: {
    minHeight: 52,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff', textAlign: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 96, fontFamily: Fonts.semibold, fontSize: 12, color: W.inkSoft },
  barTrack: { flex: 1, height: 12, justifyContent: 'center' },
  bar: { height: 12, borderRadius: 3, minWidth: 2 },
  zero: { width: 1, height: 16, backgroundColor: W.lineStrong },
  barValue: { width: 64, textAlign: 'right', fontFamily: Fonts.bold, fontSize: 13, color: INK, fontVariant: ['tabular-nums'] },
});
