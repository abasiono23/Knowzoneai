import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { OptionCard } from '@/components/personalize/option-card';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useTutor } from '@/lib/tutor/store';

/** What to do with the page. Label, description and prompt are `tutor:upload.intents.<id>.*`. */
const INTENTS = [
  { id: 'solve', icon: 'footsteps' },
  { id: 'explain', icon: 'bulb' },
  { id: 'summarise', icon: 'document-text' },
  { id: 'practice', icon: 'help-circle' },
] as const;

/** Screen 54: upload a question sheet or textbook page (PDF or image) and choose what to do with it. */
export default function UploadScreen() {
  const { t } = useTranslation('tutor');
  const { c } = useLocalSearchParams<{ c?: string }>();
  const { createConversation, send, remaining } = useTutor();
  const [file, setFile] = useState<{ uri: string; name: string; kind: 'pdf' | 'image'; pages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [intent, setIntent] = useState<(typeof INTENTS)[number]['id']>('solve');
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    const kind = a.mimeType === 'application/pdf' || a.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
    // Page count comes from the server once the PDF is processed; estimate from size until then.
    const pages = kind === 'pdf' ? Math.max(1, Math.min(24, Math.round((a.size ?? 200_000) / 90_000))) : 1;
    setFile({ uri: a.uri, name: a.name, kind, pages });
    setPage(1);
  };

  const ask = async () => {
    if (!file) return;
    if (remaining <= 0) return router.replace('/tutor/limit');
    setBusy(true);
    const id =
      c ??
      createConversation({
        mode: intent === 'solve' ? 'steps' : intent === 'practice' ? 'exam' : 'explain',
        level: 'beginner',
        context: {
          kind: 'upload',
          label: file.kind === 'pdf' ? t('upload.contextPage', { name: file.name, page }) : file.name,
        },
      });
    router.replace(`/tutor/${id}`);
    await send(id, t(`upload.intents.${intent}.prompt`), {
      kind: file.kind,
      uri: file.uri,
      name: file.name,
      page: file.kind === 'pdf' ? page : undefined,
    });
  };

  return (
    <AuthScreen
      hero={<HeroIcon icon="document-attach" colors={Gradients.reward} />}
      title={t('upload.title')}
      subtitle={t('upload.subtitle')}
      footer={
        file ? (
          <Button title={t('shared.askTheTutor')} icon="sparkles" onPress={ask} loading={busy} />
        ) : (
          <Button title={t('upload.chooseFile')} icon="folder-open" onPress={pick} />
        )
      }>
      {!file ? (
        <Pressable
          onPress={pick}
          accessibilityRole="button"
          accessibilityLabel={t('upload.chooseFile')}
          style={styles.drop}>
          <Ionicons name="cloud-upload" size={48} color={Colors.reward} />
          <Text variant="bodyStrong">{t('upload.tapToChoose')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('upload.hint')}
          </Text>
        </Pressable>
      ) : (
        <Animated.View entering={FadeIn} style={{ gap: Spacing.md }}>
          <Card style={styles.file}>
            <View style={styles.fileIcon}>
              <Ionicons name={file.kind === 'pdf' ? 'document-text' : 'image'} size={24} color={Colors.reward} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {file.kind === 'pdf' ? t('upload.pdfPages', { count: file.pages }) : t('upload.image')}
              </Text>
            </View>
            <Pressable onPress={pick} hitSlop={8} accessibilityRole="button">
              <Text variant="small" color={Colors.primary}>
                {t('upload.change')}
              </Text>
            </Pressable>
          </Card>

          {file.kind === 'pdf' && file.pages > 1 && (
            <View style={{ gap: Spacing.xs }}>
              <Text variant="heading">{t('upload.whichPage')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
                {Array.from({ length: file.pages }, (_, i) => i + 1).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPage(p)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: page === p }}
                    accessibilityLabel={t('upload.page', { page: p })}
                    style={[styles.page, page === p && styles.pageOn]}>
                    <Ionicons name="document" size={18} color={page === p ? Colors.primary : Colors.textMuted} />
                    <Text variant="label">{p}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Text variant="heading">{t('upload.whatToDo')}</Text>
          {INTENTS.map((i) => (
            <OptionCard
              key={i.id}
              label={t(`upload.intents.${i.id}.label`)}
              description={t(`upload.intents.${i.id}.description`)}
              icon={i.icon}
              selected={intent === i.id}
              onPress={() => setIntent(i.id)}
            />
          ))}
        </Animated.View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  drop: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xxl,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.reward + '88',
    backgroundColor: Colors.rewardSoft,
  },
  file: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.rewardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    width: 52,
    height: 64,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pageOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
