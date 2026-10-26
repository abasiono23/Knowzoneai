import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { SOURCE_META } from '@/components/materials/material-card';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { fileSize, materialError, percentLabel, sourceLabel, stageLabel } from '@/lib/studio/labels';
import { useMaterial, useMaterials } from '@/lib/studio/store';
import { STAGES } from '@/lib/studio/types';

/** Screens 68 (upload progress), 69 (processing status) and 70 (failed / retry) for one material. */
export default function StatusScreen() {
  const { t } = useTranslation('study');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { material: m, ready } = useMaterial(id);
  const { retry, cancel } = useMaterials();

  // Hand over to the study pack the moment it's ready.
  useEffect(() => {
    if (m?.status === 'ready') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const timer = setTimeout(() => router.replace(`/study/${m.id}`), 700);
      return () => clearTimeout(timer);
    }
  }, [m?.status, m?.id]);

  if (!ready) return null;
  if (!m) {
    return (
      <AuthScreen>
        <TutorErrorState
          kind="missing"
          title={t('status.cancelledTitle')}
          body={t('status.cancelledBody')}
          onBack={() => router.replace('/study/source')}
        />
      </AuthScreen>
    );
  }

  const src = SOURCE_META[m.source.type];

  // 70: failed
  if (m.status === 'failed') {
    return (
      <AuthScreen
        center
        back={false}
        footer={
          <>
            {m.error?.retryable && (
              <Button title={t('actions.retry', { ns: 'common' })} icon="refresh" onPress={() => retry(m.id)} />
            )}
            <Button
              variant="secondary"
              title={t('status.useDifferent')}
              onPress={() => {
                cancel(m.id);
                router.replace('/study/source');
              }}
            />
            <Button variant="ghost" title={t('status.backToStudio')} onPress={() => router.replace('/study/create')} />
          </>
        }>
        <TutorErrorState kind="server" title={materialError(m.error, t).title} body={materialError(m.error, t).message} />
        <Card style={styles.fileRow}>
          <Ionicons name={src.icon} size={20} color={src.color} />
          <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
            {m.title}
          </Text>
          <Text variant="small" color={Colors.textMuted}>
            {sourceLabel(m.source.type, t)}
          </Text>
        </Card>
      </AuthScreen>
    );
  }

  // 68: uploading
  if (m.status === 'uploading') {
    const sent = (m.source.size ?? 0) * m.progress;
    return (
      <AuthScreen
        center
        back={false}
        footer={
          <Button
            variant="ghost"
            title={t('status.cancelUpload')}
            onPress={() => {
              cancel(m.id);
              router.back();
            }}
          />
        }>
        <View style={styles.hero}>
          <SoftGlow color={src.color} size={260} />
          <View style={[styles.bigIcon, { backgroundColor: src.color + '33' }]}>
            <Ionicons name="cloud-upload" size={44} color={src.color} />
          </View>
        </View>
        <Text variant="title" center>
          {t('status.uploadingTitle')}
        </Text>
        <Card style={{ gap: Spacing.sm }}>
          <View style={styles.fileRow}>
            <Ionicons name={src.icon} size={20} color={src.color} />
            <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
              {m.source.fileName}
            </Text>
            <Text variant="bodyStrong">{percentLabel(m.progress, t)}</Text>
          </View>
          <ProgressBar progress={m.progress} height={10} colors={Gradients.ai} />
          <Text variant="small" color={Colors.textSecondary}>
            {t('status.uploadProgress', { sent: fileSize(sent, t), total: fileSize(m.source.size, t) })}
          </Text>
        </Card>
      </AuthScreen>
    );
  }

  // 69: processing (or just finished)
  const done = m.status === 'ready';
  return (
    <AuthScreen
      center
      back={false}
      footer={
        !done ? (
          <Button variant="ghost" title={t('status.notifyMe')} onPress={() => router.replace('/study/library')} />
        ) : undefined
      }>
      <View style={styles.hero}>
        <SoftGlow color={Palette.purple500} size={280} />
        <LogoMark size={84} />
      </View>
      <Text variant="title" center>
        {done ? t('status.readyTitle') : t('status.buildingTitle')}
      </Text>
      <Text color={Colors.textSecondary} center numberOfLines={2}>
        {m.title}
      </Text>
      <Card style={{ gap: Spacing.sm }}>
        {STAGES.map((s, i) => {
          const complete = done || i < m.stage;
          const active = !done && i === m.stage;
          return (
            <View key={s.id} style={styles.stage}>
              {complete ? (
                <Animated.View entering={FadeIn}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                </Animated.View>
              ) : active ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ width: 22 }} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
              <Text color={complete || active ? Colors.text : Colors.textMuted}>{stageLabel(s.id, t)}</Text>
            </View>
          );
        })}
      </Card>
      {!done && (
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text variant="small" color={Colors.textMuted} center>
            {t('status.usually')}
          </Text>
        </Animated.View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', justifyContent: 'center', height: 150 },
  bigIcon: { width: 96, height: 96, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stage: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
