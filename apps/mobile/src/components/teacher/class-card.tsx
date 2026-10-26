import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { subjectLabel } from '@/lib/personalization';
import type { ClassSummary } from '@/lib/teacher';

export function ClassCard({ c, compact }: { c: ClassSummary; compact?: boolean }) {
  const { t } = useTranslation('teacher');
  return (
    <Pressable
      onPress={() => router.push(`/class/${c.id}`)}
      accessibilityRole="button"
      accessibilityLabel={t('classCard.a11y', { name: c.name, count: c.studentCount })}
      style={({ pressed }) => [styles.card, compact && styles.compact, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <LinearGradient
        colors={[c.color, c.color + '99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.band}>
        <Text variant="label" color="rgba(255,255,255,0.9)">
          {subjectLabel(c.subject).toUpperCase()}
        </Text>
        <Text variant="heading" numberOfLines={1}>
          {c.name}
        </Text>
      </LinearGradient>
      <View style={styles.body}>
        <View style={styles.row}>
          <Meta icon="people" text={t('classCard.students', { count: c.studentCount })} />
          <Meta icon="document-text" text={t('classCard.active', { count: c.activeAssignments })} />
        </View>
        {c.studentCount > 0 ? (
          <View style={{ gap: 4 }}>
            <View style={styles.row}>
              <Text variant="small" color={Colors.textSecondary}>
                {t('classCard.mastery')}
              </Text>
              <Text variant="small">{formatNumber(c.avgMastery, { style: 'percent', maximumFractionDigits: 0 })}</Text>
            </View>
            <ProgressBar progress={c.avgMastery} height={6} />
          </View>
        ) : (
          <Text variant="small" color={Colors.reward}>
            {t('classCard.shareCode', { code: c.joinCode })}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={14} color={Colors.textMuted} />
      <Text variant="small" color={Colors.textSecondary}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compact: { width: 240 },
  band: { padding: Spacing.md, gap: 2 },
  body: { padding: Spacing.md, gap: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
