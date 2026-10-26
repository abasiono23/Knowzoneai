import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, StyleSheet, View } from 'react-native';

import { AnswerActions } from '@/components/tutor/answer-actions';
import { AnswerBlocks } from '@/components/tutor/answer-blocks';
import { AnswerDiagram } from '@/components/tutor/diagram';
import { TutorErrorState } from '@/components/tutor/error-state';
import { FollowUps } from '@/components/tutor/follow-ups';
import { Card, IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { subjectLabel } from '@/lib/tutor/format';
import { blockText } from '@/lib/tutor/types';
import { useAnswer, useTutor } from '@/lib/tutor/store';

/** Screen 51: the full answer with key terms, mistakes to avoid, sources and follow-ups. */
export default function AnswerDetailScreen() {
  const { t } = useTranslation('tutor');
  const { c, m } = useLocalSearchParams<{ c: string; m: string }>();
  const { conv, msg, answer, question } = useAnswer(c, m);
  const { send } = useTutor();
  const [copied, setCopied] = useState(false);

  if (!conv || !answer) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState kind="missing" title={t('answer.notFound')} onBack={() => router.back()} />
      </Screen>
    );
  }

  const plain = [answer.summary, ...answer.body.map(blockText)].join('\n\n');

  const followUp = async (q: string) => {
    const r = await send(conv.id, q);
    if (r === 'limit') router.push('/tutor/limit');
    else router.back();
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={subjectLabel(answer.subject).toUpperCase()}
        right={
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <IconButton
              icon={copied ? 'checkmark' : 'copy-outline'}
              label={t('answer.copy')}
              onPress={async () => {
                await Clipboard.setStringAsync(plain);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            />
            <IconButton
              icon="share-social-outline"
              label={t('answer.share')}
              onPress={() => Share.share({ message: t('answer.shareMessage', { answer: plain }) })}
            />
          </View>
        }
      />

      {question && (
        <View style={styles.question}>
          <Text variant="label" color={Colors.textMuted}>
            {t('answer.yourQuestion')}
          </Text>
          <Text variant="heading">{question.text || t('answer.fromPhoto')}</Text>
        </View>
      )}

      <Card raised style={{ gap: Spacing.xs, borderColor: Colors.primary }}>
        <Text variant="label" color={Colors.primary}>
          {t('answer.inShort')}
        </Text>
        <Text variant="bodyStrong">{answer.summary}</Text>
        {answer.finalAnswer && (
          <View style={styles.final}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text variant="bodyStrong" style={{ flex: 1 }}>
              {answer.finalAnswer}
            </Text>
          </View>
        )}
      </Card>

      <AnswerActions conversationId={conv.id} messageId={m} answer={answer} exclude={['answer']} />

      <AnswerBlocks blocks={answer.body} />

      <AnswerDiagram conversationId={conv.id} messageId={m} image={msg?.image} />

      {answer.keyTerms.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('shared.keyTerms')}</Text>
          <Card style={{ padding: 0 }}>
            {answer.keyTerms.map((k, i) => (
              <View key={k.term} style={[styles.term, i > 0 && styles.divider]}>
                <Text variant="bodyStrong" color={Colors.success}>
                  {k.term}
                </Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {k.meaning}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      {answer.commonMistakes.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('shared.mistakesToAvoid')}</Text>
          {answer.commonMistakes.map((x) => (
            <View key={x} style={styles.mistake}>
              <Ionicons name="close-circle" size={18} color={Colors.danger} />
              <Text variant="small" style={{ flex: 1 }}>
                {x}
              </Text>
            </View>
          ))}
        </View>
      )}

      {answer.sources.length > 0 && (
        <Card style={styles.sources}>
          <Ionicons name="document-attach" size={16} color={Colors.textSecondary} />
          <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
            {answer.sources.join(' · ')}
          </Text>
        </Card>
      )}

      <FollowUps items={answer.followUps} onPick={followUp} />

      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('answer.disclaimer')}{' '}
        <Text variant="small" color={Colors.primary} style={{ fontSize: 12 }} onPress={() => router.push('/legal/ai')}>
          {t('actions.learnMore', { ns: 'common' })}
        </Text>
      </Text>
      <Text
        variant="small"
        color={Colors.textSecondary}
        center
        style={{ fontSize: 13 }}
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: '/help/report',
            params: {
              type: 'tutor-answer',
              id: `${conv.id}:${m}`,
              title: question?.text.slice(0, 80) || t('answer.reportTitle'),
            },
          })
        }>
        <Ionicons name="flag-outline" size={13} /> {t('answer.report')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  question: { gap: 4 },
  final: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.successSoft,
  },
  term: { padding: Spacing.md, gap: 2 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  mistake: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  sources: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
});
