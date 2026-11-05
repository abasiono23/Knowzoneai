import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SummariesTab } from '@/components/books/summaries-tab';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { booksApi, levelName, SUBJECT_LOOK, subjectName, type ShelfBook } from '@/lib/books';
import { megabytes, removeBook, saveBook, savedBook } from '@/lib/reader';

type Tab = 'textbooks' | 'summaries' | 'videos';

/**
 * A subject's shelf: full textbooks first (free ones you can read now, then the prescribed ones you'll
 * be able to buy), with summaries and videos to follow.
 */
export default function SubjectBooks() {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const params = useLocalSearchParams<{
    id: string;
    catalogue?: string;
    level?: string;
    class?: string;
    /** A university, polytechnic or college course (with the student's stage) instead of a school subject. */
    stage?: string;
  }>();
  const { id, stage } = params;
  // `class`: links from before countries (Nigeria only).
  const catalogue = params.catalogue ?? 'ng';
  const level = params.level ?? params.class ?? '';
  const [name, setName] = useState<string>();
  const [books, setBooks] = useState<ShelfBook[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('textbooks');

  const load = useCallback(() => {
    (stage ? booksApi.course(id, stage) : booksApi.subject(catalogue, id, level))
      .then((r) => {
        if ('name' in r) setName(r.name);
        setBooks(r.books);
      })
      .catch((e) => setError(errorText(e, t('shelf.loadFailed'))));
  }, [catalogue, id, level, stage, t]);
  useEffect(load, [load]);

  const free = books?.filter((b) => b.free) ?? [];
  const paid = books?.filter((b) => !b.free) ?? [];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={(stage ? t('shelf.courseBooks') : levelName(level, tx)).toUpperCase()}
        title={stage ? tx(`courses.${id}`) : subjectName(id, tx, name)}
      />

      <View style={styles.tabs}>
        {(['textbooks', 'summaries', 'videos'] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setTab(k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === k }}
            style={[styles.tab, tab === k && styles.tabOn]}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 14 }} color={tab === k ? '#fff' : Colors.textSecondary}>
              {t(`shelf.${k}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'summaries' && !stage ? (
        <SummariesTab catalogue={catalogue} subject={id} level={level} />
      ) : tab !== 'textbooks' ? (
        <Card style={styles.soon}>
          <Ionicons name={tab === 'summaries' ? 'document-text' : 'play-circle'} size={36} color={Colors.primary} />
          <Text variant="heading" center>
            {t('shelf.soon')}
          </Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t(tab === 'summaries' ? 'shelf.soonSummaries' : 'shelf.soonVideos')}
          </Text>
        </Card>
      ) : error ? (
        <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Text variant="small" color={Colors.textSecondary} center>
            {error}
          </Text>
          <Button
            title={t('shelf.retry')}
            variant="secondary"
            onPress={() => {
              setError(null);
              load();
            }}
          />
        </View>
      ) : !books ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : !books.length ? (
        <Card style={styles.soon}>
          <Ionicons name="search" size={32} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textSecondary} center>
            {t('shelf.empty')}
          </Text>
        </Card>
      ) : (
        <>
          {free.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.success}>
                {t('shelf.freeSection')}
              </Text>
              {free.map((b, i) => (
                <BookRow key={b.id} book={b} i={i} subject={id} />
              ))}
            </View>
          )}
          {paid.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.primary}>
                {t('shelf.paidSection')}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('shelf.paidNote')}
              </Text>
              {paid.map((b, i) => (
                <BookRow key={b.id} book={b} i={i + free.length} subject={id} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function BookRow({ book, i, subject }: { book: ShelfBook; i: number; subject: string }) {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const look = SUBJECT_LOOK[subject] ?? { icon: 'book' as const, colors: [Colors.primary, '#B04CFF'] as const };
  const [coverFailed, setCoverFailed] = useState(false);
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(350)}>
      <Card style={styles.book}>
        {book.cover && !coverFailed ? (
          <Image
            source={{ uri: book.cover }}
            style={styles.cover}
            contentFit="contain"
            onError={() => setCoverFailed(true)}
            accessible={false}
          />
        ) : (
          // No cover picture: a made-up cover with the subject's colours and the title.
          <LinearGradient
            colors={look.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cover, styles.madeCover]}>
            <Ionicons name={look.icon} size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.madeTitle} color="#fff" numberOfLines={4}>
              {book.title}
            </Text>
          </LinearGradient>
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="bodyStrong" numberOfLines={3}>
            {book.title}
          </Text>
          {book.authors.length > 0 && (
            <Text variant="small" color={Colors.textSecondary} numberOfLines={2}>
              {book.authors.join(', ')}
            </Text>
          )}
          <Text variant="small" color={Colors.textMuted} numberOfLines={1}>
            {[book.publisher, book.edition, book.year].filter(Boolean).join(' · ')}
          </Text>
          <View style={styles.chips}>
            {book.levels.map((c) => (
              <View key={c} style={styles.chip}>
                <Text style={{ fontSize: 11, fontFamily: Fonts.bold }} color={Colors.primary}>
                  {levelName(c, tx)}
                </Text>
              </View>
            ))}
          </View>
          {book.free ? (
            <>
              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/books/read/[id]',
                      params: { id: book.id, title: book.title, readUrl: book.readUrl ?? '' },
                    } as unknown as Href)
                  }
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.read, pressed && { opacity: 0.85 }]}>
                  <Ionicons name="book" size={15} color="#fff" />
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 14 }} color="#fff">
                    {t('shelf.read')}
                  </Text>
                </Pressable>
                {book.downloadUrl && book.downloadType && Platform.OS !== 'web' && <SaveButton book={book} />}
              </View>
              {(book.provider || book.license) && (
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                  {[book.provider, book.license].filter(Boolean).join(' · ')}
                </Text>
              )}
            </>
          ) : (
            <View style={styles.soonPill}>
              <Ionicons name="time" size={13} color={Colors.reward} />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 12 }} color={Colors.reward}>
                {t('shelf.buySoon')}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}

/**
 * Saves a free book in the app for offline reading (with progress, and a way to cancel), or shows
 * that it's saved (tap to remove it and free the space).
 */
function SaveButton({ book }: { book: ShelfBook }) {
  const { t } = useTranslation('books');
  const [state, setState] = useState<'checking' | 'none' | 'saving' | 'saved'>('checking');
  const [share, setShare] = useState(0);
  const [failed, setFailed] = useState(false);
  const cancel = useRef<(() => void) | null>(null);

  useEffect(() => {
    void savedBook(book.id).then((s) => setState(s ? 'saved' : 'none'));
    return () => cancel.current?.();
  }, [book.id]);

  const start = () => {
    setFailed(false);
    setShare(0);
    setState('saving');
    const job = saveBook(book, setShare);
    cancel.current = job.cancel;
    job.promise
      .then(() => setState('saved'))
      .catch(() => {
        setState('none');
        setFailed(true);
      })
      .finally(() => (cancel.current = null));
  };

  if (state === 'checking') return null;
  if (state === 'saving')
    return (
      <Pressable
        onPress={() => {
          cancel.current?.();
          setState('none');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('shelf.cancelSave')}
        style={styles.save}>
        <View style={styles.saveBar}>
          <View style={[styles.saveFill, { width: `${Math.round(share * 100)}%` }]} />
        </View>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 12 }} color={Colors.primary}>
          {Math.round(share * 100)}%
        </Text>
        <Ionicons name="close" size={14} color={Colors.textMuted} />
      </Pressable>
    );
  if (state === 'saved')
    return (
      <Pressable
        onPress={() => void removeBook(book.id).then(() => setState('none'))}
        accessibilityRole="button"
        accessibilityLabel={t('shelf.removeSaved')}
        style={[styles.save, { borderColor: Colors.success }]}>
        <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
        <Text style={{ fontFamily: Fonts.bold, fontSize: 13 }} color={Colors.success}>
          {t('shelf.saved')}
        </Text>
      </Pressable>
    );
  return (
    <Pressable onPress={start} accessibilityRole="button" style={styles.save}>
      <Ionicons name={failed ? 'refresh' : 'download'} size={15} color={Colors.primary} />
      <Text style={{ fontFamily: Fonts.bold, fontSize: 13 }} color={Colors.primary}>
        {failed
          ? t('shelf.saveAgain')
          : book.downloadBytes
            ? t('shelf.saveSize', { size: megabytes(book.downloadBytes) })
            : t('shelf.save')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 4 },
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  saveBar: { width: 60, height: 6, borderRadius: 3, backgroundColor: Colors.primarySoft, overflow: 'hidden' },
  saveFill: { height: 6, backgroundColor: Colors.primary },
  tabs: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: Radius.pill, backgroundColor: Colors.surfaceRaised },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.pill },
  tabOn: { backgroundColor: Colors.primary },
  soon: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  book: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  cover: { width: 76, height: 108, borderRadius: 8, backgroundColor: Colors.surfaceRaised },
  madeCover: { padding: 8, gap: 6, justifyContent: 'flex-start' },
  madeTitle: { fontFamily: Fonts.bold, fontSize: 10, lineHeight: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: Colors.primarySoft },
  read: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },
  soonPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.rewardSoft,
  },
});
