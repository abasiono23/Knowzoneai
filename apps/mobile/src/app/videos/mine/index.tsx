import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { VideoThumb } from '@/components/videos/video-thumb';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { collectionName, stageLabel, subjectLabel } from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';
import type { GeneratedVideo } from '@/lib/videos/types';

const FILTERS = ['all', 'ready', 'generating', 'failed', 'saved'] as const;
type Filter = (typeof FILTERS)[number];

/** Screen 107: the student's generated videos, plus saved videos from the feed. */
export default function MyVideosScreen() {
  const { generated, saved, catalog } = useVideos();
  const [filter, setFilter] = useState<Filter>('all');
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  const savedVideos = catalog.filter((v) => saved[v.id]);

  const list: GeneratedVideo[] =
    filter === 'all' || filter === 'saved' ? generated : generated.filter((g) => g.status === filter);
  const open = (g: GeneratedVideo) =>
    router.push(g.status === 'ready' ? `/videos/mine/${g.id}` : `/videos/generate/${g.id}`);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('mine.eyebrow', { generated: generated.length, saved: Object.keys(saved).length })}
        title={t('mine.title')}
        right={
          <Pressable
            onPress={() => router.push('/videos/create')}
            accessibilityRole="button"
            accessibilityLabel={t('mine.generate')}
            style={styles.add}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        {FILTERS.map((f) => (
          <ChoiceChip key={f} label={t(`mine.filters.${f}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {filter === 'saved' ? (
        savedVideos.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title={t('mine.noSavedTitle')}
            body={t('mine.noSavedBody')}
            action={{
              label: t('mine.browse'),
              onPress: () => router.push('/videos'),
            }}
          />
        ) : (
          <View style={styles.grid}>
            {savedVideos.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => router.push(`/videos/${v.id}`)}
                accessibilityRole="button"
                accessibilityLabel={v.title}
                style={styles.cell}>
                <VideoThumb video={v} height={220} />
                <Text variant="small" numberOfLines={2} style={{ fontFamily: 'Manrope_600SemiBold' }}>
                  {v.title}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                  {collectionName(saved[v.id], t)}
                </Text>
              </Pressable>
            ))}
          </View>
        )
      ) : list.length === 0 ? (
        <EmptyState
          icon="film"
          title={filter === 'all' ? t('mine.emptyTitle') : t(`mine.nothing.${filter}`)}
          body={t('mine.emptyBody')}
          action={{
            label: t('mine.generateShort'),
            onPress: () => router.push('/videos/create'),
          }}
        />
      ) : (
        <View style={styles.grid}>
          {list.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => open(g)}
              accessibilityRole="button"
              accessibilityLabel={g.title}
              style={styles.cell}>
              {g.status === 'ready' ? (
                <VideoThumb video={g} height={220} />
              ) : (
                <View style={[styles.placeholder, g.status === 'failed' && { borderColor: Colors.danger }]}>
                  <Ionicons
                    name={g.status === 'failed' ? 'alert-circle' : 'hourglass'}
                    size={30}
                    color={g.status === 'failed' ? Colors.danger : Colors.primary}
                  />
                  <Text
                    variant="small"
                    center
                    color={g.status === 'failed' ? Colors.danger : Colors.textSecondary}
                    style={{ fontSize: 12 }}>
                    {g.status === 'failed' ? t('mine.failed') : t('mine.stage', { stage: stageLabel(g.stage, t) })}
                  </Text>
                </View>
              )}
              <Text variant="small" numberOfLines={2} style={{ fontFamily: 'Manrope_600SemiBold' }}>
                {g.title}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {subjectLabel(g.subject, t, tHome)}
                {g.revision > 1 ? ` · ${t('mine.version', { revision: g.revision })}` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: { width: '47%', flexGrow: 1, gap: 4 },
  placeholder: {
    height: 220,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
});
