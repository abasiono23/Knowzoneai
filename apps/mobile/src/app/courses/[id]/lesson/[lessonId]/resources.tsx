import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { LessonRoute } from '@/components/courses/course-route';
import { ActionSheet, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { currentLanguage } from '@/i18n';
import { useFlipStyle, useIsRtl } from '@/i18n/provider';
import { resourcesFor, type LessonRef } from '@/lib/courses/catalog';
import { useSession } from '@/lib/session';
import type { Resource } from '@/lib/courses/types';

const ICON: Record<Resource['kind'], { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pdf: { icon: 'document-text', color: '#FF7A93' },
  worksheet: { icon: 'create', color: '#FFC857' },
  'past-paper': { icon: 'school', color: '#9B82FF' },
  link: { icon: 'sparkles', color: '#2DD4BF' },
  audio: { icon: 'headset', color: '#4CC9FF' },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Screen 118: downloadable extras for a lesson. */
export default function LessonResourcesScreen() {
  return <LessonRoute>{(ref) => <Resources lessonRef={ref} />}</LessonRoute>;
}

function Resources({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const flip = useFlipStyle();
  const rtl = useIsRtl();
  const { course, lesson } = lessonRef;
  const { user } = useSession();
  const [open, setOpen] = useState<Resource | null>(null);
  const [menu, setMenu] = useState<Resource | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1800);
  };
  const list = resourcesFor(course, lesson).filter((r) => r.kind !== 'link' || user?.role !== 'teacher');

  const pdf = async (r: Resource) => {
    const html = `<html lang="${currentLanguage()}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:40px;color:#111}h1{color:#6A45FF;font-size:22px}p.meta{color:#666;font-size:12px}pre{white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.6}</style></head><body><h1>${esc(r.title)}</h1><p class="meta">${esc(course.title)} · Knowzone AI</p><pre>${esc(r.body ?? '')}</pre></body></html>`;
    try {
      if (Platform.OS === 'web') await Print.printAsync({ html });
      else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync())
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: r.title, UTI: 'com.adobe.pdf' });
      }
    } catch {
      flash(t('certificate.pdfFailed'));
    }
  };

  const tap = (r: Resource) => {
    if (r.kind === 'link') return router.push('/tutor');
    setOpen(open?.id === r.id ? null : r);
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('resources.eyebrow')} title={lesson.title} />
      <Text variant="small" color={Colors.textSecondary}>
        {t('resources.intro')}
      </Text>
      {list.map((r) => {
        const m = ICON[r.kind];
        const expanded = open?.id === r.id;
        return (
          <Card key={r.id} style={{ padding: 0, overflow: 'hidden' }}>
            <View style={styles.row}>
              <Pressable
                onPress={() => tap(r)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={t('overview.toolA11y', { label: r.title, meta: r.meta })}
                style={styles.main}>
                <View style={[styles.icon, { backgroundColor: m.color + '22' }]}>
                  <Ionicons name={m.icon} size={20} color={m.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {r.meta}
                  </Text>
                </View>
              </Pressable>
              {r.kind === 'link' ? (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                  style={[{ marginRight: Spacing.md }, flip]}
                />
              ) : (
                <Pressable
                  onPress={() => setMenu(r)}
                  accessibilityRole="button"
                  accessibilityLabel={t('resources.options', { title: r.title })}
                  hitSlop={8}
                  style={styles.more}>
                  <Ionicons name="download-outline" size={20} color={Colors.primary} />
                </Pressable>
              )}
            </View>
            {expanded && r.body && (
              <Animated.View entering={FadeIn} style={styles.preview}>
                <Text variant="small" style={{ lineHeight: 21 }}>
                  {r.body}
                </Text>
              </Animated.View>
            )}
          </Card>
        );
      })}
      {toast && (
        <Animated.View entering={FadeIn} style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text variant="small">{toast}</Text>
        </Animated.View>
      )}
      <ActionSheet
        visible={!!menu}
        title={menu?.title}
        onClose={() => setMenu(null)}
        options={
          menu
            ? [
                { label: t('resources.savePdf'), icon: 'document', onPress: () => pdf(menu) },
                {
                  label: t('actions.share', { ns: 'common' }),
                  icon: 'share-outline',
                  onPress: () =>
                    Share.share({
                      title: menu.title,
                      message: t('resources.shareMessage', {
                        title: menu.title,
                        body: menu.body ?? '',
                        course: course.title,
                      }),
                    }).catch(() => {}),
                },
                {
                  label: t('resources.copyText'),
                  icon: 'copy-outline',
                  onPress: async () => {
                    await Clipboard.setStringAsync(menu.body ?? menu.title);
                    flash(t('resources.copied'));
                  },
                },
              ]
            : []
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  more: { padding: Spacing.md },
  preview: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  toast: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
  },
});
