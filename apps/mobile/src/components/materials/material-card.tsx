import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { materialSubject, stageLabel } from '@/lib/studio/labels';
import { dueCards } from '@/lib/studio/store';
import { STAGES, type Material, type SourceType } from '@/lib/studio/types';
import { timeAgoMs } from '@/lib/tutor/format';

/** Icon and colour per source type. Display names: sourceLabel(type, t) from '@/lib/studio/labels'. */
export const SOURCE_META: Record<SourceType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pdf: { icon: 'document-text', color: '#FF7A93' },
  doc: { icon: 'document', color: '#4CC9FF' },
  text: { icon: 'clipboard', color: '#9B82FF' },
  topic: { icon: 'bulb', color: '#FFC857' },
  video: { icon: 'logo-youtube', color: '#FF5A7A' },
  image: { icon: 'image', color: '#2DD4BF' },
};

export function openMaterial(m: Material) {
  if (m.status === 'ready') router.push(`/study/${m.id}`);
  else router.push(`/study/status/${m.id}`);
}

/** Row used in My materials and on Home. */
export function MaterialCard({ m, onMore }: { m: Material; onMore?: () => void }) {
  const { t } = useTranslation('study');
  const s = SOURCE_META[m.source.type];
  const best = m.attempts.length ? Math.max(...m.attempts.map((a) => a.score / a.total)) : 0;
  const cards = m.status === 'ready' ? dueCards(m) : null;
  const status =
    m.status === 'ready'
      ? [
          t('card.cards', { count: m.content?.flashcards.length ?? 0 }),
          t('card.questions', { count: m.content?.quiz.length ?? 0 }),
          ...(cards?.due.length ? [t('card.due', { count: cards.due.length })] : []),
        ].join(' · ')
      : m.status === 'failed'
        ? t('card.failed')
        : m.status === 'uploading'
          ? t('card.uploading', { percent: Math.round(m.progress * 100) })
          : t('card.stage', { stage: STAGES[m.stage] ? stageLabel(STAGES[m.stage].id, t) : t('card.processing') });

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => openMaterial(m)}
        accessibilityRole="button"
        accessibilityLabel={m.title}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
        <View style={[styles.icon, { backgroundColor: s.color + '22' }]}>
          <Ionicons name={s.icon} size={22} color={s.color} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: onMore ? Spacing.lg : 0 }}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
              {m.title}
            </Text>
            {m.saved && <Ionicons name="bookmark" size={14} color={Colors.reward} />}
            {m.offline && <Ionicons name="cloud-download" size={14} color={Colors.success} />}
          </View>
          <Text
            variant="small"
            color={m.status === 'failed' ? Colors.danger : Colors.textSecondary}
            numberOfLines={1}
            style={{ fontSize: 12 }}>
            {status}
          </Text>
          {m.status === 'ready' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <View style={{ flex: 1 }}>
                <ProgressBar progress={best} height={4} />
              </View>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {t('card.meta', { subject: materialSubject(m.subject), time: timeAgoMs(m.updatedAt) })}
              </Text>
            </View>
          ) : m.status !== 'failed' ? (
            <ProgressBar progress={m.status === 'uploading' ? m.progress : (m.stage + 1) / STAGES.length} height={4} />
          ) : null}
        </View>
      </Pressable>
      {onMore && (
        <Pressable
          onPress={onMore}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('card.options', { title: m.title })}
          style={styles.more}>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { width: 46, height: 46, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  more: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, padding: 6 },
});
