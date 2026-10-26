import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { OptionsPanel } from '@/components/materials/options-panel';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { suggestTitle } from '@/lib/studio/generator';
import { fileSize } from '@/lib/studio/labels';
import { useCreditGate } from '@/lib/billing/credits';
import { useMaterials } from '@/lib/studio/store';
import { DEFAULT_OPTIONS, MAX_UPLOAD_BYTES, type SourceType } from '@/lib/studio/types';

type Picked = { uri: string; name: string; size: number; type: SourceType; mimeType?: string };

/** Screen 64: upload a PDF, Word document or photo of notes. */
export default function UploadSourceScreen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const photo = kind === 'image';
  const { t } = useTranslation('study');
  const { create } = useMaterials();
  const canSpend = useCreditGate();
  const [file, setFile] = useState<Picked | null>(null);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [error, setError] = useState<string | null>(null);

  const accept = (p: Picked) => {
    if (p.size > MAX_UPLOAD_BYTES) {
      setError(t('upload.tooBig', { name: p.name, size: fileSize(p.size, t) }));
      return;
    }
    setError(null);
    setFile(p);
    setTitle(suggestTitle({ fileName: p.name }));
  };

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    accept({
      uri: a.uri,
      name: a.name,
      size: a.size ?? 0,
      mimeType: a.mimeType,
      type: /\.pdf$/i.test(a.name) || a.mimeType === 'application/pdf' ? 'pdf' : 'doc',
    });
  };

  const pickPhoto = async (camera: boolean) => {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled) return;
    const a = res.assets[0];
    accept({
      uri: a.uri,
      name: a.fileName ?? 'notes.jpg',
      size: a.fileSize ?? 400_000,
      mimeType: a.mimeType,
      type: 'image',
    });
  };

  const start = () => {
    if (!file) return;
    if (!canSpend(1, 'study pack')) return;
    const id = create({
      type: file.type,
      label: file.name,
      fileName: file.name,
      size: file.size,
      uri: file.uri,
      mimeType: file.mimeType,
      title,
      options,
    });
    router.replace(`/study/status/${id}`);
  };

  return (
    <AuthScreen
      hero={
        <HeroIcon
          icon={photo ? 'camera' : 'document-attach'}
          colors={photo ? Gradients.mastery : ['#FF5A7A', '#FF9F43']}
        />
      }
      title={photo ? t('upload.titlePhoto') : t('upload.titleDoc')}
      subtitle={photo ? t('upload.subtitlePhoto') : t('upload.subtitleDoc')}
      footer={
        file ? (
          <Button title={t('shared.createPack')} icon="sparkles" onPress={start} disabled={!title.trim()} />
        ) : photo ? (
          <>
            {Platform.OS !== 'web' && (
              <Button title={t('upload.takePhoto')} icon="camera" onPress={() => pickPhoto(true)} />
            )}
            <Button
              variant={Platform.OS === 'web' ? 'primary' : 'secondary'}
              title={t('upload.gallery')}
              icon="images"
              onPress={() => pickPhoto(false)}
            />
          </>
        ) : (
          <Button title={t('upload.chooseFile')} icon="folder-open" onPress={pickDoc} />
        )
      }>
      {file ? (
        <Animated.View entering={FadeIn} style={{ gap: Spacing.md }}>
          <Card style={styles.file}>
            <View style={styles.fileIcon}>
              <Ionicons
                name={file.type === 'image' ? 'image' : file.type === 'pdf' ? 'document-text' : 'document'}
                size={24}
                color={Colors.danger}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('upload.readyToUpload', { size: fileSize(file.size, t) })}
              </Text>
            </View>
            <Pressable
              onPress={() => setFile(null)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('upload.removeFile')}>
              <Ionicons name="close-circle" size={22} color={Colors.textMuted} />
            </Pressable>
          </Card>
          <TextField label={t('shared.titleLabel')} icon="text-outline" value={title} onChangeText={setTitle} />
          <OptionsPanel value={options} onChange={setOptions} />
        </Animated.View>
      ) : (
        <Pressable
          onPress={photo ? () => pickPhoto(Platform.OS !== 'web') : pickDoc}
          accessibilityRole="button"
          accessibilityLabel={t('upload.chooseFile')}
          style={styles.drop}>
          <Ionicons name={photo ? 'scan' : 'cloud-upload'} size={48} color={Colors.danger} />
          <Text variant="bodyStrong">{photo ? t('upload.addPhoto') : t('upload.tapToChoose')}</Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {photo ? t('upload.photoHint') : 'PDF · DOC · DOCX · TXT'}
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
    borderColor: Colors.danger + '77',
    backgroundColor: Colors.dangerSoft,
  },
  file: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.dangerSoft,
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
});
