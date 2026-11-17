import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { LessonPlayer } from '@/components/kora/lesson-player';
import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { loadKoraLesson, type KoraLesson } from '@/lib/kora/lessons';

/** One Lesson with Kora. The lesson's files come from the web app's address, so it needs a connection. */
export default function KoraLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('videos');
  const [lesson, setLesson] = useState<KoraLesson | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    loadKoraLesson(id)
      .then((l) => live && setLesson(l))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [id, attempt]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/kora'));
  if (lesson) return <LessonPlayer key={lesson.id} lesson={lesson} onClose={close} onMore={() => router.replace('/kora')} />;
  return (
    <View style={styles.center}>
      {failed ? (
        <>
          <Text color="#fff" center>
            {t('kora.loadFailed')}
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <Pressable
              onPress={() => {
                setFailed(false);
                setAttempt((n) => n + 1);
              }}
              accessibilityRole="button"
              style={styles.pill}>
              <Text color="#fff">{t('watch.retry')}</Text>
            </Pressable>
            <Pressable onPress={close} accessibilityRole="button" style={styles.pill}>
              <Text color="#fff">{t('actions.goBack', { ns: 'common' })}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <ActivityIndicator color="#fff" size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#160A4D', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  pill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.16)' },
});
