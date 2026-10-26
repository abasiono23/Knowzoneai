import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { folderLabel } from '@/lib/studio/labels';
import { useMaterials } from '@/lib/studio/store';

/** Screen 84: save a material to the study library, in a folder, optionally offline. */
export default function SaveToLibraryScreen() {
  const { t } = useTranslation('study');
  const { update, folders } = useMaterials();
  const [folder, setFolder] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState('');
  const [offline, setOffline] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <ReadyMaterial>
      {(m) => {
        const options = [...new Set([m.subject, ...folders, 'Exam revision'])];
        const chosen = newFolder.trim() || folder || m.folder || m.subject;
        const isOffline = offline ?? m.offline;

        if (saved) {
          return (
            <AuthScreen
              center
              back={false}
              backdrop="reward"
              footer={
                <>
                  <Button
                    title={t('save.openLibrary')}
                    icon="library"
                    onPress={() => router.replace('/study/library')}
                  />
                  <Button variant="ghost" title={t('shared.backToPack')} onPress={() => router.back()} />
                </>
              }>
              <SuccessBadge icon="bookmark" colors={Gradients.reward} />
              <Animated.View entering={FadeInDown.delay(200)} style={{ gap: Spacing.xs }}>
                <Text variant="display" center>
                  {t('save.savedTo', { folder: folderLabel(chosen) })}
                </Text>
                <Text color={Colors.textSecondary} center>
                  {isOffline ? t('save.offlineBody') : t('save.onlineBody')}
                </Text>
              </Animated.View>
            </AuthScreen>
          );
        }

        return (
          <AuthScreen
            title={m.saved ? t('save.titleFolder') : t('shared.saveToStudyLibrary')}
            subtitle={m.title}
            footer={
              <Button
                title={m.saved ? t('save.update') : t('shared.saveToLibrary')}
                icon="bookmark"
                onPress={() => {
                  update(m.id, { saved: true, folder: chosen, offline: isOffline });
                  setSaved(true);
                }}
              />
            }>
            <Text variant="heading">{t('shared.folder')}</Text>
            <ChipWrap>
              {options.map((f) => (
                <ChoiceChip
                  key={f}
                  label={folderLabel(f)}
                  selected={!newFolder.trim() && chosen === f}
                  onPress={() => {
                    setNewFolder('');
                    setFolder(f);
                  }}
                />
              ))}
            </ChipWrap>
            <TextField
              label={t('save.newFolder')}
              icon="folder-open-outline"
              placeholder={t('save.newFolderPlaceholder')}
              value={newFolder}
              onChangeText={setNewFolder}
            />
            <Card>
              <ToggleRow
                icon="cloud-download"
                label={t('save.offline')}
                description={t('save.offlineHint')}
                value={isOffline}
                onChange={setOffline}
              />
            </Card>
            {m.saved && (
              <Button
                variant="ghost"
                title={t('shared.removeFromLibrary')}
                onPress={() => {
                  update(m.id, { saved: false });
                  router.back();
                }}
              />
            )}
          </AuthScreen>
        );
      }}
    </ReadyMaterial>
  );
}
