import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { TextField } from '@/components/auth/text-field';
import { Button, Card, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { fileSize } from '@/lib/studio/labels';
import { textbookError } from '@/lib/textbooks/labels';
import { useTextbooks, type PickedPdf } from '@/lib/textbooks/store';
import { MAX_TEXTBOOK_BYTES, type Textbook } from '@/lib/textbooks/types';

const titleOf = (name: string) =>
  name
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Textbooks home: upload a PDF, and the books already uploaded (pick another topic without uploading again). */
export default function TextbooksHome() {
  const { t } = useTranslation('tutor');
  const { t: tStudy } = useTranslation('study');
  const flip = useFlipStyle();
  const { textbooks, ready, upload, remove } = useTextbooks();
  const [file, setFile] = useState<PickedPdf | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Textbook | null>(null);

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
    if (res.canceled) return;
    const a = res.assets[0];
    if (!(a.mimeType === 'application/pdf' || /\.pdf$/i.test(a.name))) {
      setError(t('textbook.notPdf'));
      return;
    }
    const size = a.size ?? 0;
    if (size > MAX_TEXTBOOK_BYTES) {
      setError(t('textbook.tooBig', { name: a.name, size: fileSize(size, tStudy) }));
      return;
    }
    setError(null);
    setFile({ uri: a.uri, name: a.name, size, mimeType: a.mimeType });
    setTitle(titleOf(a.name));
  };

  const start = () => {
    if (!file) return;
    const id = upload(file, title);
    setFile(null);
    setTitle('');
    router.push(`/tutor/textbook/${id}`);
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('textbook.eyebrow')} title={t('textbook.title')} />
      <Text color={Colors.textSecondary}>{t('textbook.subtitle')}</Text>

      {file ? (
        <Animated.View entering={FadeIn} style={{ gap: Spacing.sm }}>
          <Card style={styles.fileRow}>
            <View style={styles.fileIcon}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {fileSize(file.size, tStudy)}
              </Text>
            </View>
          </Card>
          <TextField
            label={t('textbook.titleLabel')}
            placeholder={t('textbook.titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
          />
          <Button title={t('textbook.start')} icon="sparkles" onPress={start} />
          <Button variant="ghost" title={t('textbook.chooseAnother')} onPress={pick} />
        </Animated.View>
      ) : (
        <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel={t('textbook.upload')} style={styles.drop}>
          <Ionicons name="book" size={44} color={Colors.primary} />
          <Text variant="bodyStrong" center>
            {t('textbook.upload')}
          </Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t('textbook.uploadHint')}
          </Text>
        </Pressable>
      )}
      {error && (
        <Card style={styles.error}>
          <Ionicons name="alert-circle" size={18} color={Colors.danger} />
          <Text variant="small" style={{ flex: 1 }}>
            {error}
          </Text>
        </Card>
      )}

      <View style={{ gap: Spacing.xs }}>
        <SectionHeader title={t('textbook.earlier')} />
        {ready && textbooks.length === 0 ? (
          <Text variant="small" color={Colors.textMuted}>
            {t('textbook.empty')}
          </Text>
        ) : (
          <Text variant="small" color={Colors.textMuted}>
            {t('textbook.earlierHint')}
          </Text>
        )}
        {textbooks.map((b) => (
          <View key={b.id} style={{ gap: Spacing.xs }}>
            <View style={styles.bookWrap}>
              <Pressable
                onPress={() => router.push(`/tutor/textbook/${b.id}`)}
                accessibilityRole="button"
                accessibilityLabel={t('textbook.open', { title: b.title })}
                style={({ pressed }) => [styles.book, pressed && { opacity: 0.8 }]}>
                <View style={[styles.bookIcon, b.status === 'failed' && { backgroundColor: Colors.dangerSoft }]}>
                  <Ionicons
                    name={b.status === 'failed' ? 'alert-circle' : b.status === 'ready' ? 'book' : 'hourglass'}
                    size={22}
                    color={b.status === 'failed' ? Colors.danger : Colors.primary}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text
                    variant="small"
                    color={b.status === 'failed' ? Colors.danger : Colors.textSecondary}
                    numberOfLines={1}
                    style={{ fontSize: 12 }}>
                    {b.status === 'ready'
                      ? t('textbook.meta', {
                          pages: t('textbook.pages', { count: b.pageCount }),
                          topics: t('textbook.topics', { count: b.topics.length }),
                        })
                      : b.status === 'failed'
                        ? textbookError(b.error, t).title
                        : b.status === 'uploading'
                          ? t('textbook.statusUploading', { percent: Math.round((b.progress ?? 0) * 100) })
                          : t('textbook.statusReading')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={flip} />
              </Pressable>
              <Pressable
                onPress={() => setConfirm(confirm?.id === b.id ? null : b)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('textbook.delete')}
                style={styles.trash}>
                <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
              </Pressable>
            </View>
            {confirm?.id === b.id && (
              <Animated.View entering={FadeIn}>
                <Card style={{ gap: Spacing.xs, borderColor: Colors.danger + '66' }}>
                  <Text variant="bodyStrong">{t('textbook.deleteTitle', { title: b.title })}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t('textbook.deleteBody')}
                  </Text>
                  <View style={styles.confirmRow}>
                    <Button
                      variant="danger"
                      title={t('textbook.deleteConfirm')}
                      icon="trash"
                      style={{ flex: 1 }}
                      onPress={() => {
                        remove(b.id);
                        setConfirm(null);
                      }}
                    />
                    <Button variant="secondary" title={t('textbook.keep')} style={{ flex: 1 }} onPress={() => setConfirm(null)} />
                  </View>
                </Card>
              </Animated.View>
            )}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  drop: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.primarySoft,
  },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-start',
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerSoft,
  },
  bookWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  book: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trash: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xxs },
});
