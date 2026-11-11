import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { currentLanguage } from '@/i18n';
import { useFlipStyle } from '@/i18n/provider';
import { useCreditGate } from '@/lib/billing/credits';
import { fileSize, percentLabel } from '@/lib/studio/labels';
import { useMaterials } from '@/lib/studio/store';
import { TEXTBOOK_OPTIONS } from '@/lib/studio/types';
import { pageRange, textbookError } from '@/lib/textbooks/labels';
import { useTextbook, useTextbooks } from '@/lib/textbooks/store';
import type { Textbook, Topic } from '@/lib/textbooks/types';
import { LENGTHS } from '@/lib/videos/options';
import { DEFAULT_VIDEO_SETTINGS, useVideos } from '@/lib/videos/store';

/** The video summary's length: short, one credit. */
const SUMMARY_LENGTH = '1m';
const READING_STEPS = ['open', 'read', 'list'] as const;

/**
 * The topic the student settled on. `book`: listed, or typed and found in the book. `general`: typed
 * and not in the book, made from general knowledge instead. `pending`/`failed`: still checking the book.
 */
type Choice = {
  title: string;
  chapter?: string;
  startPage?: number;
  endPage?: number;
  from: 'book' | 'general' | 'pending' | 'failed';
};

/** One textbook: uploading, being read, failed, or ready with its topic list and the flashcards/video choice. */
export default function TextbookScreen() {
  const { t } = useTranslation('tutor');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { textbook: b, ready } = useTextbook(id);
  const { retry, remove } = useTextbooks();

  if (!ready) return null;
  if (!b) {
    return (
      <AuthScreen>
        <TutorErrorState
          kind="missing"
          title={t('textbook.notFoundTitle')}
          body={t('textbook.notFoundBody')}
          onBack={() => router.replace('/tutor/textbook')}
        />
      </AuthScreen>
    );
  }
  if (b.status === 'uploading') return <Uploading b={b} onCancel={() => remove(b.id)} />;
  if (b.status === 'reading') return <Reading b={b} />;
  if (b.status === 'failed') return <Failed b={b} onRetry={() => retry(b.id)} onDiscard={() => remove(b.id)} />;
  return <TopicPicker b={b} />;
}

function Uploading({ b, onCancel }: { b: Textbook; onCancel: () => void }) {
  const { t } = useTranslation('tutor');
  const { t: tStudy } = useTranslation('study');
  const progress = b.progress ?? 0;
  return (
    <AuthScreen
      center
      back={false}
      footer={
        <Button
          variant="ghost"
          title={t('textbook.cancelUpload')}
          onPress={() => {
            onCancel();
            router.replace('/tutor/textbook');
          }}
        />
      }>
      <View style={styles.hero}>
        <SoftGlow color={Palette.purple500} size={260} />
        <View style={styles.bigIcon}>
          <Ionicons name="cloud-upload" size={44} color={Colors.primary} />
        </View>
      </View>
      <Text variant="title" center>
        {t('textbook.uploadingTitle')}
      </Text>
      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.row}>
          <Ionicons name="document-text" size={20} color={Colors.primary} />
          <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
            {b.fileName}
          </Text>
          <Text variant="bodyStrong">{percentLabel(progress, tStudy)}</Text>
        </View>
        <ProgressBar progress={progress} height={10} colors={Gradients.ai} />
        <Text variant="small" color={Colors.textSecondary}>
          {t('textbook.uploadProgress', {
            sent: fileSize((b.size ?? 0) * progress, tStudy),
            total: fileSize(b.size, tStudy),
          })}
        </Text>
      </Card>
    </AuthScreen>
  );
}

/** A calm view while the server reads the book; the store keeps checking in even after leaving. */
function Reading({ b }: { b: Textbook }) {
  const { t } = useTranslation('tutor');
  return (
    <AuthScreen
      center
      back={false}
      footer={
        <Button variant="ghost" title={t('textbook.doSomethingElse')} onPress={() => router.replace('/tutor/textbook')} />
      }>
      <View style={styles.hero}>
        <SoftGlow color={Palette.purple500} size={280} />
        <LogoMark size={84} />
      </View>
      <Text variant="title" center>
        {t('textbook.readingTitle')}
      </Text>
      <Text color={Colors.textSecondary} center numberOfLines={2}>
        {b.title}
      </Text>
      <Card style={{ gap: Spacing.sm }}>
        {READING_STEPS.map((step, i) => {
          // The server doesn't report stages: the PDF is open once accepted; reading and listing go together.
          const complete = i === 0;
          const active = i === 1;
          return (
            <View key={step} style={styles.row}>
              {complete ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              ) : active ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ width: 22 }} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
              <Text color={complete || active ? Colors.text : Colors.textMuted}>{t(`textbook.readingSteps.${step}`)}</Text>
            </View>
          );
        })}
      </Card>
      <Animated.View entering={FadeInDown.delay(400)}>
        <Text variant="small" color={Colors.textMuted} center>
          {t('textbook.readingBody')}
        </Text>
      </Animated.View>
    </AuthScreen>
  );
}

function Failed({ b, onRetry, onDiscard }: { b: Textbook; onRetry: () => void; onDiscard: () => void }) {
  const { t } = useTranslation('tutor');
  const error = textbookError(b.error, t);
  const scanned = b.error?.code === 'scanned-book';
  return (
    <AuthScreen
      center
      back={false}
      footer={
        <>
          {b.error?.retryable && <Button title={t('actions.retry', { ns: 'common' })} icon="refresh" onPress={onRetry} />}
          {scanned && (
            <Button
              variant={b.error?.retryable ? 'secondary' : 'primary'}
              title={t('textbook.snapInstead')}
              icon="camera"
              onPress={() => router.replace('/tutor/scan')}
            />
          )}
          <Button
            variant="secondary"
            title={t('textbook.tryAnotherFile')}
            icon="folder-open"
            onPress={() => {
              onDiscard();
              router.replace('/tutor/textbook');
            }}
          />
          <Button variant="ghost" title={t('textbook.backToTextbooks')} onPress={() => router.replace('/tutor/textbook')} />
        </>
      }>
      <TutorErrorState kind="server" title={error.title} body={error.body} />
      <Card style={styles.row}>
        <Ionicons name="document-text" size={20} color={Colors.primary} />
        <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
          {b.fileName}
        </Text>
      </Card>
    </AuthScreen>
  );
}

/** The AI's topic list with a search field and a plain "type a topic" field, then the flashcards/video choice. */
function TopicPicker({ b }: { b: Textbook }) {
  const { t } = useTranslation('tutor');
  const flip = useFlipStyle();
  const { find } = useTextbooks();
  const [query, setQuery] = useState('');
  const [typed, setTyped] = useState('');
  const [choice, setChoice] = useState<Choice | null>(null);

  const q = query.trim().toLowerCase();
  const shown = q
    ? b.topics.filter((x) => x.title.toLowerCase().includes(q) || x.chapter?.toLowerCase().includes(q))
    : b.topics;
  // Chapters in book order, each with its topics.
  const chapters: { chapter: string | undefined; topics: Topic[] }[] = [];
  for (const topic of shown) {
    const last = chapters[chapters.length - 1];
    if (last && last.chapter === topic.chapter) last.topics.push(topic);
    else chapters.push({ chapter: topic.chapter, topics: [topic] });
  }

  const pickListed = (x: Topic) =>
    setChoice({ title: x.title, chapter: x.chapter, startPage: x.startPage, endPage: x.endPage, from: 'book' });

  const lookUp = (title: string) => {
    setChoice({ title, from: 'pending' });
    find(b.id, title)
      .then((found) =>
        setChoice((c) => {
          // The student may have changed their mind while we looked.
          if (c?.title !== title) return c;
          if (!found) return { title, from: 'general' };
          const listed = found.listed ? b.topics.find((x) => x.title === found.title) : undefined;
          return {
            title: listed?.title ?? title,
            chapter: listed?.chapter,
            startPage: found.startPage,
            endPage: found.endPage,
            from: 'book',
          };
        }),
      )
      .catch(() => setChoice((c) => (c?.title === title ? { title, from: 'failed' } : c)));
  };

  const useTyped = () => {
    const title = typed.trim();
    if (title.length < 2) return;
    // Typed exactly like a listed topic: no need to search the book.
    const listed = b.topics.find((x) => x.title.toLowerCase() === title.toLowerCase());
    if (listed) pickListed(listed);
    else lookUp(title);
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('textbook.pickerEyebrow')}
        title={b.title}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/tutor/textbook'))}
      />
      {choice ? (
        <ChoicePanel
          b={b}
          choice={choice}
          onChange={() => setChoice(null)}
          onRetryFind={() => lookUp(choice.title)}
          onGeneral={() => setChoice({ ...choice, from: 'general' })}
        />
      ) : (
        <>
          <View style={{ gap: 4 }}>
            <Text variant="display">{t('textbook.pickerTitle')}</Text>
            <Text color={Colors.textSecondary}>{b.topics.length ? t('textbook.pickerBody') : t('textbook.noTopics')}</Text>
          </View>

          {b.topics.length > 0 && (
            <TextField
              label={t('textbook.search')}
              placeholder={t('textbook.searchPlaceholder')}
              value={query}
              onChangeText={setQuery}
            />
          )}

          {chapters.map((c, ci) => (
            <View key={`${c.chapter ?? ''}-${ci}`} style={{ gap: Spacing.xs }}>
              {c.chapter && (
                <Text variant="label" color={Colors.textMuted}>
                  {c.chapter.toLocaleUpperCase()}
                </Text>
              )}
              {c.topics.map((x) => (
                <Pressable
                  key={x.id}
                  onPress={() => pickListed(x)}
                  accessibilityRole="button"
                  accessibilityLabel={`${x.title}. ${pageRange(x.startPage, x.endPage, t)}`}
                  style={({ pressed }) => [styles.topic, pressed && { opacity: 0.8 }]}>
                  <View style={styles.topicIcon}>
                    <Ionicons name="bookmark" size={16} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{x.title}</Text>
                    <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                      {pageRange(x.startPage, x.endPage, t)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={flip} />
                </Pressable>
              ))}
            </View>
          ))}
          {q !== '' && shown.length === 0 && (
            <Text variant="small" color={Colors.textMuted}>
              {t('textbook.noMatch', { query: query.trim() })}
            </Text>
          )}

          <Card style={{ gap: Spacing.sm }}>
            <TextField
              label={t('textbook.typeTopic')}
              placeholder={t('textbook.typePlaceholder')}
              value={typed}
              onChangeText={setTyped}
            />
            <Button
              variant="secondary"
              title={t('textbook.useTopic')}
              icon="search"
              onPress={useTyped}
              disabled={typed.trim().length < 2}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}

/** The chosen topic and the two ways to study it: flashcards (a study pack) or a video summary. */
function ChoicePanel({
  b,
  choice,
  onChange,
  onRetryFind,
  onGeneral,
}: {
  b: Textbook;
  choice: Choice;
  onChange: () => void;
  onRetryFind: () => void;
  onGeneral: () => void;
}) {
  const { t } = useTranslation('tutor');
  const { create } = useMaterials();
  const { generateVideo } = useVideos();
  const canSpend = useCreditGate();
  const fromBook = choice.from === 'book';
  const settled = fromBook || choice.from === 'general';
  const videoCredits = LENGTHS.find((l) => l.id === SUMMARY_LENGTH)?.credits ?? 1;

  const makeFlashcards = () => {
    if (!canSpend(1, 'study pack')) return;
    const id = create({
      type: fromBook ? 'textbook' : 'topic',
      label: choice.title,
      topic: choice.title,
      title: choice.title,
      ...(fromBook && { textbookId: b.id }),
      options: TEXTBOOK_OPTIONS,
    });
    router.push({ pathname: '/study/status/[id]', params: { id, next: 'flashcards' } });
  };

  const makeVideo = () => {
    if (!canSpend(videoCredits, 'video')) return;
    const id = generateVideo({
      title: choice.title,
      source: fromBook
        ? { kind: 'textbook', textbookId: b.id, topic: choice.title, label: b.title }
        : { kind: 'topic', topic: choice.title },
      // The summary is short and spoken in the app's language, captions on.
      settings: { ...DEFAULT_VIDEO_SETTINGS, length: SUMMARY_LENGTH, captions: true, language: currentLanguage() },
    });
    router.push(`/videos/generate/${id}`);
  };

  return (
    <Animated.View entering={FadeIn} style={{ gap: Spacing.md }}>
      <Card style={{ gap: Spacing.xs }}>
        <Text variant="label" color={Colors.primary}>
          {t('textbook.chosenEyebrow')}
        </Text>
        <Text variant="title">{choice.title}</Text>
        {choice.chapter && (
          <Text variant="small" color={Colors.textSecondary}>
            {t('textbook.chapter', { chapter: choice.chapter })}
          </Text>
        )}
        {choice.from === 'pending' && (
          <View style={styles.row}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text variant="small" color={Colors.textSecondary}>
              {t('textbook.searching')}
            </Text>
          </View>
        )}
        {fromBook && choice.startPage !== undefined && choice.endPage !== undefined && (
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text variant="small" color={Colors.success}>
              {choice.startPage === choice.endPage
                ? t('textbook.foundOne', { page: choice.startPage })
                : t('textbook.found', { start: choice.startPage, end: choice.endPage })}
            </Text>
          </View>
        )}
        {choice.from === 'general' && (
          <View style={styles.row}>
            <Ionicons name="information-circle" size={18} color={Colors.reward} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {t('textbook.notFound')} {t('textbook.notFoundOffer')}
            </Text>
          </View>
        )}
        {choice.from === 'failed' && (
          <View style={{ gap: Spacing.xs }}>
            <View style={styles.row}>
              <Ionicons name="cloud-offline" size={18} color={Colors.danger} />
              <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                {t('textbook.findFailed')}
              </Text>
            </View>
            <View style={styles.row}>
              <Button
                variant="secondary"
                title={t('actions.retry', { ns: 'common' })}
                icon="refresh"
                style={{ flex: 1 }}
                onPress={onRetryFind}
              />
              <Button variant="secondary" title={t('textbook.fromGeneral')} style={{ flex: 1 }} onPress={onGeneral} />
            </View>
          </View>
        )}
      </Card>

      {settled && (
        <Animated.View entering={FadeInDown} style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('textbook.whatNext')}</Text>
          <BigChoice
            icon="albums"
            color="#FF9F43"
            title={t('textbook.flashcardsTitle')}
            body={t('textbook.flashcardsBody')}
            tag={fromBook ? t('textbook.fromBook') : t('textbook.fromGeneral')}
            onPress={makeFlashcards}
          />
          <BigChoice
            icon="film"
            color={Palette.sky400}
            title={t('textbook.videoTitle')}
            body={t('textbook.videoBody')}
            tag={fromBook ? t('textbook.fromBook') : t('textbook.fromGeneral')}
            onPress={makeVideo}
          />
        </Animated.View>
      )}
      <Button variant="ghost" title={t('textbook.changeTopic')} icon="arrow-undo" onPress={onChange} />
    </Animated.View>
  );
}

function BigChoice({
  icon,
  color,
  title,
  body,
  tag,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
  tag: string;
  onPress: () => void;
}) {
  const flip = useFlipStyle();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      style={({ pressed }) => [styles.choice, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <View style={[styles.choiceIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={30} color={color} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="heading">{title}</Text>
        <Text variant="small" color={Colors.textSecondary}>
          {body}
        </Text>
        <View style={[styles.tag, { backgroundColor: color + '22' }]}>
          <Text variant="label" style={{ fontSize: 10 }} color={Colors.textSecondary}>
            {tag}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={flip} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', justifyContent: 'center', height: 150 },
  bigIcon: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  topic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    minHeight: 110,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  choiceIcon: { width: 64, height: 64, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, marginTop: 2 },
});
