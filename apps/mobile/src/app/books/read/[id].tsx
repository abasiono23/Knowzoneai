import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookView } from '@/components/books/book-view';
import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { rememberPage, savedBook, savedUri } from '@/lib/reader';

/**
 * Reading a free book inside Knowzone: the saved copy when there is one (works offline), otherwise
 * the book's online reader. Saved PDFs open on the page the reader was last on.
 */
export default function ReadBook() {
  const { t } = useTranslation('books');
  const flip = useFlipStyle();
  const { id, title, readUrl } = useLocalSearchParams<{ id: string; title: string; readUrl?: string }>();
  const [source, setSource] = useState<{ uri: string; local: boolean } | null>(null);

  useEffect(() => {
    let live = true;
    void savedBook(id).then(async (s) => {
      if (!live) return;
      if (s) setSource({ uri: await savedUri(s), local: true });
      else if (readUrl) setSource({ uri: readUrl, local: false });
    });
    return () => {
      live = false;
    };
  }, [id, readUrl]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView edges={['top']} style={styles.top}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          hitSlop={10}
          style={styles.round}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} style={flip} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {title}
          </Text>
          {source && (
            <Text variant="small" color={source.local ? Colors.success : Colors.textSecondary} style={{ fontSize: 12 }}>
              {source.local ? t('shelf.readingSaved') : t('shelf.readingOnline')}
            </Text>
          )}
        </View>
      </SafeAreaView>
      {source ? (
        <BookView uri={source.uri} local={source.local} onPage={(page) => void rememberPage(id, page)} />
      ) : (
        <View style={styles.center}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('shelf.opening')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
