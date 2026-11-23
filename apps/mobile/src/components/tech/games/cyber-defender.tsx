import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { W } from '@/components/games/ui';
import { defineGameFrame } from '@/components/lab/contract';
import { Card, CodeBlock, Eyebrow, LTR, ltr, MONO, QuizStep, Sheet, StepBar, useAdvance } from '@/components/space/kit';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { CyberDefenderRun } from '@/lib/api';
import type { TechGame } from '@/lib/games/use-lab-run';

type Item = CyberDefenderRun['items'][number];
const ICON: Record<Item['kind'], keyof typeof Ionicons.glyphMap> = {
  email: 'mail-outline',
  sms: 'chatbubble-outline',
  password: 'key-outline',
  situation: 'person-outline',
  attack: 'warning-outline',
  fix: 'shield-checkmark-outline',
};

/**
 * Cyber Defender: read each case as a security analyst would. Messages are shown as a mail client
 * shows them (sender address and link in monospace, so look-alike domains can be spotted); later
 * levels bring attack reports, log lines and code to name the attack or choose the best defence.
 */
export function CyberDefender({ g, run, paused }: { g: TechGame; run: CyberDefenderRun; paused: boolean }) {
  const { t } = useTranslation('tech');
  const total = run.items.length;
  const { i, next, over } = useAdvance(run, total, g.finish);
  const c = run.items[i]!;
  const verdict = ['email', 'sms', 'password', 'situation'].includes(c.kind);
  const label = (o: string) => (verdict ? t(`play.cyber.verdicts.${o}`, { defaultValue: o }) : o);
  return (
    <Sheet>
      <StepBar label={t('play.cyber.step', { n: i + 1, total })} n={i + 1} total={total} />
      <Case item={c} />
      <QuizStep
        key={c.id}
        stepKey={c.id}
        q={c.question ?? t(`play.cyber.ask.${c.kind}`)}
        options={c.options.map(label)}
        seconds={run.seconds}
        paused={paused}
        onAnswer={async (choice) => {
          const raw = choice === null ? null : c.options[c.options.map(label).indexOf(choice)]!;
          const res = await g.answer(raw === null ? { step: i, timeout: true } : { step: i, choice: raw });
          if (!res) return null;
          g.buzz(res.outcome.correct ? 'success' : 'error');
          return { ...res.outcome, answer: label(String(res.outcome.answer ?? '')) };
        }}
        after={(o) =>
          o.why ? (
            <Card>
              <Eyebrow text={t('play.cyber.why')} />
              <Text style={styles.body}>{String(o.why)}</Text>
            </Card>
          ) : null
        }
        nextLabel={over ? t('play.finish') : undefined}
        onNext={next}
      />
    </Sheet>
  );
}

function Case({ item: c }: { item: Item }) {
  const { t } = useTranslation('tech');
  if (c.kind === 'password')
    return (
      <Card>
        <Eyebrow text={t('play.cyber.kinds.password')} />
        <View style={styles.password}>
          <Ionicons name="key-outline" size={18} color={W.inkSoft} />
          <Text style={[styles.mono, { fontSize: 18 }, LTR]} {...ltr} selectable>
            {c.body}
          </Text>
        </View>
        <Text style={styles.small}>{t('play.cyber.length', { count: [...c.body].length })}</Text>
      </Card>
    );
  const message = c.kind === 'email' || c.kind === 'sms';
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={ICON[c.kind]} size={18} color={W.inkSoft} />
        <Eyebrow text={t(`play.cyber.kinds.${c.kind}`)} />
      </View>
      {message && (
        <View style={styles.headers}>
          {!!c.from && <Header label={t('play.cyber.from')} value={c.from} />}
          {!!c.subject && <Header label={t('play.cyber.subject')} value={c.subject} plain />}
        </View>
      )}
      <Text style={styles.body}>{c.body}</Text>
      {!!c.link && (
        <View style={styles.link}>
          <Ionicons name="link-outline" size={16} color={W.focus} />
          <Text style={[styles.mono, { color: W.focus, flex: 1 }, LTR]} {...ltr} selectable>
            {c.link}
          </Text>
        </View>
      )}
      {!!c.code && <CodeBlock text={c.code} label={t('play.cyber.code')} />}
    </Card>
  );
}

function Header({ label, value, plain }: { label: string; value: string; plain?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Text style={[styles.small, { width: 64 }]}>{label}</Text>
      <Text style={[plain ? styles.subject : styles.mono, { flex: 1 }, !plain && LTR]} {...ltr} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headers: { gap: 6, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: W.line },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: W.ink },
  subject: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  mono: { fontFamily: MONO, fontSize: 14, color: W.ink },
  small: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: W.focusSoft,
  },
  password: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F1F0F6',
    borderWidth: 1,
    borderColor: W.line,
  },
});

defineGameFrame('cyber-defender', {
  review: (run) =>
    ((run as CyberDefenderRun).items ?? []).flatMap((c) =>
      c.result
        ? [
            {
              key: String(c.id),
              correct: c.result.correct,
              main: (c.subject ?? c.question ?? c.body).slice(0, 90),
              detail: `${c.result.answer} · ${c.result.why}`,
            },
          ]
        : [],
    ),
});
