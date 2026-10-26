import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { getCourse } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';

/** Screen 182: my certificates. */
export default function MyCertificatesScreen() {
  const { certificates, enrolled, progressOf } = useCourses();
  const { t } = useTranslation('settings');
  const earned = Object.entries(certificates)
    .map(([id, cert]) => ({ course: getCourse(id), cert }))
    .filter((x) => !!x.course)
    .sort((a, b) => b.cert.issuedAt - a.cert.issuedAt);
  const close = Object.keys(enrolled)
    .map(getCourse)
    .filter((c) => !!c && !certificates[c.id])
    .map((c) => ({ c: c!, p: progressOf(c!) }))
    .filter((x) => x.p.pct >= 0.25)
    .sort((a, b) => b.p.pct - a.p.pct);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('me.eyebrow')} title={t('certificates.title')} />
      {earned.length === 0 ? (
        <EmptyState
          icon="ribbon-outline"
          title={t('certificates.emptyTitle')}
          body={t('certificates.emptyBody')}
          action={{ label: t('myCourses.browse'), onPress: () => router.push('/courses') }}
        />
      ) : (
        earned.map(({ course, cert }) => (
          <Pressable
            key={cert.id}
            onPress={() => router.push(`/courses/${course!.id}/certificate` as Href)}
            accessibilityRole="button"
            accessibilityLabel={t('certificates.a11y', { title: course!.title })}>
            <LinearGradient
              colors={['#FFC857', '#7C5CFF', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.frame}>
              <View style={styles.cert}>
                <Text style={{ fontSize: 34 }}>{course!.emoji}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="label" color={Colors.reward}>
                    {t('certificates.label')}
                  </Text>
                  <Text variant="bodyStrong" numberOfLines={2}>
                    {course!.title}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {t('certificates.meta', {
                      date: formatDate(cert.issuedAt, { day: 'numeric', month: 'long', year: 'numeric' }),
                      id: cert.id,
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </View>
            </LinearGradient>
          </Pressable>
        ))
      )}
      {close.length > 0 && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('certificates.almost')}</Text>
          {close.map(({ c, p }) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/courses/${c.id}` as Href)}
              accessibilityRole="button"
              style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>
                  {c.emoji} {c.title}
                </Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('certificates.lessonsLeft', { count: p.total - p.done })}
                </Text>
              </View>
              <ProgressBar progress={p.pct} height={6} colors={Gradients.ai} />
            </Pressable>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: Radius.lg, padding: 2 },
  cert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg - 2,
    backgroundColor: '#0E1433',
  },
});
