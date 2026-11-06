import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { SearchBook, SearchVideo } from '@/lib/search-all';
import { skillMinutes, skillThumb } from '@/lib/skills';
import { lessonHref } from '@/lib/watch';

const hrefFor = (v: SearchVideo): string => {
  if (v.kind === 'shelf') return `/books/video/${v.library}/${v.topic}/${v.youtubeId}`;
  if (v.kind === 'skill') return `/skills/${v.skill}/${v.youtubeId}`;
  return lessonHref(v);
};

/** A video found by search: its thumbnail, title and where it sits in the app. */
export function VideoResult({ video }: { video: SearchVideo }) {
  const { t } = useTranslation('books');
  return (
    <Pressable
      onPress={() => router.push(hrefFor(video) as Href)}
      accessibilityRole="button"
      accessibilityLabel={video.title}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <View>
        <Image
          source={{ uri: skillThumb(video.youtubeId) }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
        <View style={styles.minutes}>
          <Text color="#fff" style={{ fontSize: 11 }}>
            {t('shelf.videoMinutes', { n: skillMinutes(video.seconds) })}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 14, lineHeight: 19 }}>
          {video.title}
        </Text>
        <Text variant="small" color={Colors.textSecondary} numberOfLines={2} style={{ fontSize: 12 }}>
          {[video.subject, video.where].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

/** A book found by search: free ones open to read, the others open the shelf they're on. */
export function BookResult({ book }: { book: SearchBook }) {
  const { t } = useTranslation('books');
  const open = () =>
    book.readUrl
      ? router.push({
          pathname: '/books/read/[id]',
          params: { id: book.id, title: book.title, readUrl: book.readUrl ?? '' },
        } as unknown as Href)
      : router.push(book.shelf as Href);
  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={book.title}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      {book.cover ? (
        <Image source={{ uri: book.cover }} style={styles.cover} contentFit="contain" accessible={false} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <Ionicons name="book" size={22} color={Colors.primary} />
        </View>
      )}
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 14, lineHeight: 19 }}>
          {book.title}
        </Text>
        {book.authors.length > 0 && (
          <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12 }}>
            {book.authors.join(', ')}
          </Text>
        )}
        <Text style={{ fontSize: 12, fontFamily: Fonts.bold }} color={book.readUrl ? Colors.success : Colors.reward}>
          {t(book.readUrl ? 'shelf.read' : 'shelf.buySoon')}
        </Text>
      </View>
    </Pressable>
  );
}

/** A plain result: summaries, courses, reels and Future skills. */
export function TextResult({
  icon,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.text, pressed && { opacity: 0.8 }]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={2} style={{ fontSize: 14, lineHeight: 19 }}>
          {title}
        </Text>
        {body ? (
          <Text variant="small" color={Colors.textSecondary} numberOfLines={2} style={{ fontSize: 12 }}>
            {body}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  thumb: { width: 120, height: 68, borderRadius: Radius.md, backgroundColor: Colors.surfaceRaised },
  minutes: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  cover: { width: 56, height: 80, borderRadius: 6, backgroundColor: Colors.surfaceRaised },
  noCover: { alignItems: 'center', justifyContent: 'center' },
  text: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
});
