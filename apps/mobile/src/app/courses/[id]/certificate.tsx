import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from '@/components/ui/gradient';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { LogoMark } from '@/components/brand/logo';
import { CourseRoute } from '@/components/courses/course-route';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Palette, Spacing } from '@/constants/theme';
import { currentLanguage, formatDate } from '@/i18n';
import { useIsRtl } from '@/i18n/provider';
import { getInstructor } from '@/lib/courses/instructors';
import { useCourses } from '@/lib/courses/store';
import {
  allLessons,
  courseMinutes,
  formatDuration,
  PASS_MARK,
  type Certificate,
  type Course,
} from '@/lib/courses/types';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dateOf = (t: number) => formatDate(t, { day: 'numeric', month: 'long', year: 'numeric' });
const verifyUrl = (c: Certificate) => `https://knowzone.ai/verify/${c.id}`;

/** Screen 125: the certificate, with PDF download, share and a verification link. */
export default function CertificateScreen() {
  return <CourseRoute>{(c) => <Cert course={c} />}</CourseRoute>;
}

function Cert({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const rtl = useIsRtl();
  const { certificates, progressOf } = useCourses();
  const cert = certificates[course.id];
  const instructor = getInstructor(course.instructorId);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1800);
  };

  if (!cert) {
    const p = progressOf(course);
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('certificate.eyebrow')} title={course.title} />
        <Card style={styles.locked}>
          <Ionicons name="lock-closed" size={36} color={Colors.textMuted} />
          <Text variant="heading" center>
            {t('certificate.lockedTitle')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('certificate.lockedBody', { done: p.done, total: p.total, pass: Math.round(PASS_MARK * 100) })}
          </Text>
          <Button
            title={t('certificate.continue')}
            icon="play"
            onPress={() => router.replace(`/courses/${course.id}`)}
          />
        </Card>
      </Screen>
    );
  }

  const lessonCount = t('counts.lessons', { count: allLessons(course).length });
  const summary = t('certificate.summary', {
    lessons: lessonCount,
    duration: formatDuration(courseMinutes(course)),
    pct: Math.round(cert.score * 100),
  });

  const download = async () => {
    const html = `<html lang="${currentLanguage()}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
      @page{size:A4 landscape;margin:0}body{margin:0;font-family:Georgia,serif;background:#fff}
      .c{margin:28px;border:10px solid #6A45FF;outline:2px solid #FFC857;outline-offset:-22px;padding:56px 72px;text-align:center;height:calc(100vh - 230px)}
      .brand{font-family:Arial,sans-serif;font-weight:800;letter-spacing:4px;color:#6A45FF;font-size:14px}
      h1{font-size:40px;margin:28px 0 6px;color:#0B1026}.sub{font-family:Arial,sans-serif;color:#666;letter-spacing:2px;font-size:12px}
      .name{font-size:46px;color:#6A45FF;margin:26px 0 10px;font-style:italic}.course{font-size:24px;color:#0B1026;margin:8px 0 24px}
      .row{display:flex;justify-content:space-between;margin-top:48px;font-family:Arial,sans-serif;font-size:12px;color:#444}
      .sig{border-top:1px solid #999;padding-top:6px;min-width:200px}</style></head><body><div class="c">
      <div class="brand">KNOWZONE AI</div><h1>${esc(t('certificate.title'))}</h1><div class="sub">${esc(t('certificate.certifies'))}</div>
      <div class="name">${esc(cert.name)}</div><div class="sub">${esc(t('certificate.completed'))}</div><div class="course">${esc(course.title)}</div>
      <div class="sub">${esc(summary.toUpperCase())}</div>
      <div class="row"><div class="sig">${esc(instructor?.name ?? 'Knowzone AI')}<br/>${esc(t('certificate.courseInstructor'))}</div>
      <div class="sig">${esc(dateOf(cert.issuedAt))}<br/>${esc(t('certificate.dateIssued'))}</div><div class="sig">${esc(cert.id)}<br/>${esc(verifyUrl(cert))}</div></div>
      </div></body></html>`;
    try {
      if (Platform.OS === 'web') await Print.printAsync({ html });
      else {
        const { uri } = await Print.printToFileAsync({ html, width: 842, height: 595 });
        if (await Sharing.isAvailableAsync())
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: t('certificate.dialogTitle', { title: course.title }),
            UTI: 'com.adobe.pdf',
          });
      }
    } catch {
      flash(t('certificate.pdfFailed'));
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('certificate.eyebrow')} />
      <Animated.View entering={ZoomIn.duration(450)}>
        <LinearGradient
          colors={['#FFC857', '#7C5CFF', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frame}>
          <View style={styles.paper}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
              <Circle cx="100%" cy="0%" r="90" fill="#7C5CFF" fillOpacity={0.08} />
              <Circle cx="0%" cy="100%" r="110" fill="#2DD4BF" fillOpacity={0.07} />
            </Svg>
            <View style={styles.brand}>
              <LogoMark size={30} />
              <Text variant="label" color={Colors.primary} style={{ letterSpacing: 3 }}>
                KNOWZONE AI
              </Text>
            </View>
            <Text style={styles.title}>{t('certificate.title')}</Text>
            <Text variant="label" color={Colors.textMuted} center>
              {t('certificate.certifies')}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {cert.name}
            </Text>
            <Text variant="label" color={Colors.textMuted} center>
              {t('certificate.completed')}
            </Text>
            <Text variant="heading" center>
              {course.title}
            </Text>
            <Text variant="small" color={Colors.textSecondary} center style={{ fontSize: 12 }}>
              {summary}
            </Text>
            <View style={styles.seal}>
              <Svg width={64} height={64} viewBox="0 0 64 64">
                <Circle cx="32" cy="32" r="28" fill="#FFC857" />
                <Circle cx="32" cy="32" r="22" fill="none" stroke="#9C6B1E" strokeWidth="1.5" strokeDasharray="3 3" />
                <Path
                  d="M22 33l7 7 13-15"
                  stroke="#5A3A00"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.sigs}>
              <View style={styles.sig}>
                <Text style={styles.signature}>
                  {instructor?.name.replace(/^(Dr\.|Mr\.|Mrs\.) /, '') ?? 'Knowzone'}
                </Text>
                <View style={styles.line} />
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                  {t('certificate.instructor', { name: instructor?.name ?? 'Knowzone AI' })}
                </Text>
              </View>
              <View style={styles.sig}>
                <Text variant="small" style={{ fontSize: 13 }}>
                  {dateOf(cert.issuedAt)}
                </Text>
                <View style={styles.line} />
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                  {t('certificate.dateIssued')}
                </Text>
              </View>
            </View>
            <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 10 }}>
              {t('certificate.idLine', { id: cert.id })}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Button title={t('certificate.download')} icon="download" onPress={download} />
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Button
          variant="secondary"
          title={t('actions.share', { ns: 'common' })}
          icon="share-social"
          style={{ flex: 1 }}
          onPress={() =>
            Share.share({
              message: t('certificate.shareMessage', { title: course.title, url: verifyUrl(cert) }),
            }).catch(() => {})
          }
        />
        <Button
          variant="secondary"
          title={t('certificate.copyLink')}
          icon="link"
          style={{ flex: 1 }}
          onPress={async () => {
            await Clipboard.setStringAsync(verifyUrl(cert));
            flash(t('certificate.linkCopied'));
          }}
        />
      </View>
      {toast && (
        <Animated.View entering={FadeIn} style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text variant="small">{toast}</Text>
        </Animated.View>
      )}
      <Button
        variant="ghost"
        title={t('certificate.backToCourse')}
        onPress={() => router.replace(`/courses/${course.id}`)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  locked: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl },
  frame: { borderRadius: 22, padding: 3 },
  paper: {
    borderRadius: 20,
    backgroundColor: '#0E1433',
    padding: Spacing.lg,
    gap: Spacing.xs,
    alignItems: 'center',
    overflow: 'hidden',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, lineHeight: 30, color: Colors.text, textAlign: 'center' },
  name: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 32,
    lineHeight: 40,
    color: '#FFC857',
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
  seal: { marginVertical: Spacing.xs },
  sigs: { flexDirection: 'row', gap: Spacing.md, alignSelf: 'stretch', marginTop: Spacing.xs },
  sig: { flex: 1, alignItems: 'center', gap: 2 },
  signature: { fontFamily: 'Manrope_600SemiBold', fontStyle: 'italic', fontSize: 16, color: Palette.purple300 },
  line: { height: 1, alignSelf: 'stretch', backgroundColor: Colors.borderStrong },
  toast: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    backgroundColor: Colors.surfaceRaised,
  },
});
