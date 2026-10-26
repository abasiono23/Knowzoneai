import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, Gradients, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { useTutor } from '@/lib/tutor/store';

/** Photo tips, by key under `tutor:scan.tips`. */
const TIPS = ['onePerPhoto', 'flat', 'inFrame'] as const;

/** Screen 53: ask a question by taking or choosing a photo. */
export default function ScanScreen() {
  const { t } = useTranslation('tutor');
  const { c } = useLocalSearchParams<{ c?: string }>();
  const { createConversation, send, remaining } = useTutor();
  const [photo, setPhoto] = useState<{ uri: string; name: string } | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (camera: boolean) => {
    setError(null);
    try {
      if (camera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError(t('scan.cameraOff'));
          return;
        }
      }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, allowsEditing: true };
      const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled) return;
      const a = res.assets[0];
      setPhoto({ uri: a.uri, name: a.fileName ?? 'question.jpg' });
    } catch {
      setError(t('scan.openFailed'));
    }
  };

  const ask = async () => {
    if (!photo) return;
    if (remaining <= 0) return router.replace('/tutor/limit');
    setBusy(true);
    const id =
      c ??
      createConversation({
        mode: 'steps',
        level: 'beginner',
        context: { kind: 'image', label: t('scan.contextLabel') },
      });
    router.replace(`/tutor/${id}`);
    await send(id, note.trim(), { kind: 'image', uri: photo.uri, name: photo.name });
  };

  return (
    <AuthScreen
      hero={<HeroIcon icon="camera" colors={Gradients.mastery} />}
      title={t('scan.title')}
      subtitle={t('scan.subtitle')}
      footer={
        photo ? (
          <>
            <Button title={t('shared.askTheTutor')} icon="sparkles" onPress={ask} loading={busy} />
            <Button variant="ghost" title={t('scan.retake')} onPress={() => setPhoto(null)} />
          </>
        ) : (
          <>
            {Platform.OS !== 'web' && <Button title={t('scan.takePhoto')} icon="camera" onPress={() => pick(true)} />}
            <Button
              variant={Platform.OS === 'web' ? 'primary' : 'secondary'}
              title={t('scan.gallery')}
              icon="images"
              onPress={() => pick(false)}
            />
          </>
        )
      }>
      {photo ? (
        <Animated.View entering={FadeIn} style={{ gap: Spacing.sm }}>
          <View style={styles.preview}>
            <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="contain" />
            <View style={styles.corners} pointerEvents="none">
              {[styles.tl, styles.tr, styles.bl, styles.br].map((s, i) => (
                <View key={i} style={[styles.corner, s]} />
              ))}
            </View>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('scan.notePlaceholder')}
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            accessibilityLabel={t('scan.noteLabel')}
          />
        </Animated.View>
      ) : (
        <>
          <Pressable
            onPress={() => pick(Platform.OS !== 'web')}
            accessibilityRole="button"
            accessibilityLabel={t('scan.addPhoto')}
            style={styles.drop}>
            <Ionicons name="scan" size={56} color={Colors.success} />
            <Text variant="bodyStrong">{t('scan.frame')}</Text>
            <Text variant="small" color={Colors.textSecondary} center>
              {t('scan.frameHint')}
            </Text>
          </Pressable>
          <Card style={{ gap: Spacing.xs }}>
            {TIPS.map((tip) => (
              <View key={tip} style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text variant="small">{t(`scan.tips.${tip}`)}</Text>
              </View>
            ))}
          </Card>
        </>
      )}
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
    </AuthScreen>
  );
}

const C = 26;
const styles = StyleSheet.create({
  drop: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.success + '88',
    backgroundColor: Colors.successSoft,
  },
  preview: { height: 300, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.backgroundDeep },
  corners: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: Spacing.md },
  corner: { position: 'absolute', width: C, height: C, borderColor: Colors.success },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  input: {
    ...NoWebOutline,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    padding: Spacing.md,
  },
});
