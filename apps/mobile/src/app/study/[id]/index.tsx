import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AiDiagram } from '@/components/content/ai-diagram';
import { SOURCE_META } from '@/components/materials/material-card';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { ActionSheet, Button, Card, IconButton, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { depthLabel, difficultyLabel, fromSourceLabel, materialSubject, outputLabel } from '@/lib/studio/labels';
import { dueCards, useMaterials } from '@/lib/studio/store';

/** Screen 71: the AI summary, and the hub for everything generated from this material. */
export default function MaterialHub() {
  const { t } = useTranslation('study');
  const [menu, setMenu] = useState(false);
  const { canDraw, drawDiagram } = useMaterials();
  return (
    <ReadyMaterial>
      {(m) => {
        const c = m.content;
        const cards = dueCards(m);
        const best = m.attempts.length ? Math.max(...m.attempts.map((a) => a.score / a.total)) : null;
        const src = SOURCE_META[m.source.type];
        const tiles: {
          href: string;
          icon: keyof typeof Ionicons.glyphMap;
          color: string;
          title: string;
          meta: string;
        }[] = [
          {
            href: `/study/${m.id}/notes`,
            icon: 'document-text',
            color: Palette.purple300,
            title: outputLabel('notes', t),
            meta: t('hub.notesMeta', { count: c.notes.length, minutes: c.readingMinutes }),
          },
          {
            href: `/study/${m.id}/concepts`,
            icon: 'book',
            color: Palette.teal400,
            title: outputLabel('concepts', t),
            meta: t('hub.terms', { count: c.concepts.length }),
          },
          {
            href: `/study/${m.id}/points`,
            icon: 'star',
            color: Palette.gold400,
            title: outputLabel('points', t),
            meta: t('hub.points', { count: c.keyPoints.length }),
          },
          {
            href: `/study/${m.id}/flashcards`,
            icon: 'albums',
            color: '#FF9F43',
            title: outputLabel('flashcards', t),
            meta: t('hub.cardsMeta', { count: cards.total, due: cards.due.length }),
          },
          {
            href: `/study/${m.id}/quiz-setup`,
            icon: 'help-circle',
            color: Palette.coral400,
            title: outputLabel('quiz', t),
            meta:
              best === null
                ? t('card.questions', { count: c.quiz.length })
                : t('hub.best', { percent: Math.round(best * 100) }),
          },
          {
            href: `/study/${m.id}/mindmap`,
            icon: 'git-network',
            color: Palette.sky400,
            title: outputLabel('mindmap', t),
            meta: t('hub.branches', { count: c.mindMap.branches.length }),
          },
        ];

        return (
          <Screen withTabBar={false}>
            <ScreenHeader
              eyebrow={materialSubject(m.subject).toLocaleUpperCase()}
              right={
                <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                  <IconButton
                    icon={m.saved ? 'bookmark' : 'bookmark-outline'}
                    label={m.saved ? t('hub.savedA11y') : t('shared.saveToStudyLibrary')}
                    onPress={() => router.push(`/study/${m.id}/save`)}
                  />
                  <IconButton icon="ellipsis-horizontal" label={t('hub.more')} onPress={() => setMenu(true)} />
                </View>
              }
            />
            <View style={{ gap: 4 }}>
              <Text variant="display">{m.title}</Text>
              <View style={styles.meta}>
                <Ionicons name={src.icon} size={14} color={src.color} />
                <Text variant="small" color={Colors.textSecondary}>
                  {t('hub.sourceMeta', {
                    source: fromSourceLabel(m.source.type, t),
                    depth: depthLabel(m.options.depth, t),
                    difficulty: difficultyLabel(m.options.difficulty, t),
                  })}
                </Text>
              </View>
            </View>

            <Animated.View entering={FadeInDown.duration(400)}>
              <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}>
                <View style={styles.meta}>
                  <Ionicons name="sparkles" size={14} color={Colors.textOnAccent} />
                  <Text variant="label" color="rgba(255,255,255,0.85)">
                    {t('hub.aiSummary')}
                  </Text>
                </View>
                <Text variant="heading" style={{ lineHeight: 26 }}>
                  {c.summary.tldr}
                </Text>
                {c.summary.overview.map((p, i) => (
                  <Text key={i} color="rgba(255,255,255,0.9)">
                    {p}
                  </Text>
                ))}
              </LinearGradient>
            </Animated.View>

            <Card style={{ gap: 6 }}>
              <View style={styles.rowBetween}>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('hub.mastery')}
                </Text>
                <Text variant="small">
                  {best !== null
                    ? t('hub.masteredBest', {
                        mastered: cards.mastered,
                        count: cards.total,
                        percent: Math.round(best * 100),
                      })
                    : t('hub.mastered', { mastered: cards.mastered, count: cards.total })}
                </Text>
              </View>
              <ProgressBar progress={cards.total ? cards.mastered / cards.total : 0} height={8} />
            </Card>

            <View style={styles.grid}>
              {tiles.map((tile, i) => (
                <Animated.View key={tile.href} entering={FadeInDown.delay(80 + i * 50)} style={styles.tileWrap}>
                  <Pressable
                    onPress={() => router.push(tile.href as Href)}
                    accessibilityRole="button"
                    accessibilityLabel={t('hub.tileA11y', { title: tile.title, meta: tile.meta })}
                    style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
                    <View style={[styles.tileIcon, { backgroundColor: tile.color + '22' }]}>
                      <Ionicons name={tile.icon} size={22} color={tile.color} />
                    </View>
                    <Text variant="bodyStrong">{tile.title}</Text>
                    <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
                      {tile.meta}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            <AiDiagram image={m.image} canDraw={canDraw} onDraw={() => drawDiagram(m.id)} />

            {cards.due.length > 0 ? (
              <Button
                title={t('hub.studyDue', { count: cards.due.length })}
                icon="albums"
                onPress={() => router.push(`/study/${m.id}/study`)}
              />
            ) : (
              <Button
                title={t('hub.takeQuiz')}
                icon="help-circle"
                onPress={() => router.push(`/study/${m.id}/quiz-setup`)}
              />
            )}
            <Button
              variant="secondary"
              title={t('shared.exportShare')}
              icon="share-outline"
              onPress={() => router.push(`/study/${m.id}/export`)}
            />

            <ActionSheet
              visible={menu}
              title={m.title}
              onClose={() => setMenu(false)}
              options={[
                {
                  label: t('shared.renameOrganise'),
                  icon: 'create-outline',
                  onPress: () => router.push(`/study/${m.id}/edit`),
                },
                {
                  label: m.saved ? t('hub.changeFolder') : t('shared.saveToStudyLibrary'),
                  icon: 'bookmark-outline',
                  onPress: () => router.push(`/study/${m.id}/save`),
                },
                {
                  label: t('shared.exportShare'),
                  icon: 'share-outline',
                  onPress: () => router.push(`/study/${m.id}/export`),
                },
                {
                  label: t('hub.deleteMaterial'),
                  icon: 'trash-outline',
                  destructive: true,
                  onPress: () => router.push(`/study/${m.id}/delete`),
                },
              ]}
            />
          </Screen>
        );
      }}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summary: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tileWrap: { width: '47%', flexGrow: 1 },
  tile: {
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
