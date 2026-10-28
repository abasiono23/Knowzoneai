import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DraftBanner } from '@/components/help/help-ui';
import { Button, Card, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { LEGAL_DOCS, legalDoc, legalTitle, type LegalDocId } from '@/lib/legal/documents';
import { useSession } from '@/lib/session';

const RELATED: Record<LegalDocId, LegalDocId[]> = {
  terms: ['privacy', 'guidelines', 'ai'],
  privacy: ['terms', 'ai'],
  guidelines: ['terms', 'ai'],
  ai: ['guidelines', 'privacy'],
};

/** Screens 226–229: community guidelines, terms of service, privacy policy, AI limitations. */
export default function LegalDocScreen() {
  const { doc: raw } = useLocalSearchParams<{ doc: string }>();
  const { user } = useSession();
  const { t } = useTranslation('help');
  const doc = legalDoc(t, (raw as LegalDocId) in LEGAL_DOCS ? (raw as LegalDocId) : 'terms');
  const scroll = useRef<ScrollViewInstance>(null);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [showToc, setShowToc] = useState(false);
  const inApp = !!user?.onboardingComplete;

  return (
    <LinearGradient colors={Gradients.screen} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
          showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <ScreenHeader eyebrow={doc.eyebrow} title={doc.title} />
            <Text variant="small" color={Colors.textMuted}>
              {t('legal.lastUpdated', {
                date: formatDate(doc.updated, { day: 'numeric', month: 'long', year: 'numeric' }),
              })}
            </Text>
            <DraftBanner />

            <Card style={{ gap: Spacing.sm, borderColor: Colors.primary + '55' }}>
              <Text variant="label" color={Colors.primary}>
                {doc.id === 'guidelines' ? t('legal.shortVersion') : t('legal.plainWords')}
              </Text>
              {doc.summary.map((s) => (
                <View key={s.text} style={styles.summary}>
                  <View style={styles.summaryIcon}>
                    <Ionicons name={s.icon} size={16} color={Colors.primary} />
                  </View>
                  <Text variant="small" style={{ flex: 1 }}>
                    {s.text}
                  </Text>
                </View>
              ))}
            </Card>

            <Pressable
              onPress={() => setShowToc(!showToc)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showToc }}
              style={styles.tocHead}>
              <Ionicons name="list" size={18} color={Colors.textSecondary} />
              <Text variant="bodyStrong" style={{ flex: 1, fontSize: 14 }}>
                {t('legal.contents')}
              </Text>
              <Ionicons name={showToc ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
            </Pressable>
            {showToc && (
              <Card style={{ gap: 2, paddingVertical: Spacing.xs }}>
                {doc.sections.map((s) => (
                  <Text
                    key={s.id}
                    variant="small"
                    color={Colors.primary}
                    style={{ paddingVertical: 6 }}
                    onPress={() => scroll.current?.scrollTo({ y: (offsets[s.id] ?? 0) - 8, animated: true })}>
                    {s.title}
                  </Text>
                ))}
              </Card>
            )}

            {doc.sections.map((s) => (
              <View
                key={s.id}
                style={{ gap: Spacing.xs }}
                onLayout={(e) => {
                  const y = e.nativeEvent.layout.y;
                  setOffsets((o) => (o[s.id] === y ? o : { ...o, [s.id]: y }));
                }}>
                <Text variant="heading">{s.title}</Text>
                {s.body.map((p) => (
                  <Text key={p} variant="body" color={Colors.textSecondary} style={{ fontSize: 15, lineHeight: 23 }}>
                    {p}
                  </Text>
                ))}
                {s.bullets.map((b) => (
                  <View key={b} style={styles.bullet}>
                    <View style={styles.dot} />
                    <Text variant="body" color={Colors.textSecondary} style={{ flex: 1, fontSize: 15, lineHeight: 23 }}>
                      {b}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            {doc.id === 'guidelines' && inApp && user?.restriction?.kind !== 'suspended' && (
              <Button
                title={t('legal.reportSomething')}
                icon="flag"
                variant="secondary"
                onPress={() => router.push('/help/report')}
              />
            )}
            {doc.id === 'ai' && inApp && user?.restriction?.kind !== 'suspended' && (
              <Button
                title={t('legal.reportWrongAnswer')}
                icon="flag"
                variant="secondary"
                onPress={() => router.push('/help/report')}
              />
            )}

            <View style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('legal.related')}
              </Text>
              {RELATED[doc.id].map((id) => (
                <Pressable
                  key={id}
                  onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: id } })}
                  accessibilityRole="button">
                  <Card style={styles.related}>
                    <Ionicons name={LEGAL_DOCS[id].icon} size={18} color={Colors.textSecondary} />
                    <Text variant="bodyStrong" style={{ flex: 1, fontSize: 14 }}>
                      {legalTitle(t, id)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </Card>
                </Pressable>
              ))}
              {doc.id === 'terms' && (
                <Pressable onPress={() => router.push('/legal/copyright')} accessibilityRole="button">
                  <Card style={styles.related}>
                    <Ionicons name="copy" size={18} color={Colors.textSecondary} />
                    <Text variant="bodyStrong" style={{ flex: 1, fontSize: 14 }}>
                      {t('legal.copyrightLink')}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </Card>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tocHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  bullet: { flexDirection: 'row', gap: Spacing.sm, paddingLeft: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 9 },
  related: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
