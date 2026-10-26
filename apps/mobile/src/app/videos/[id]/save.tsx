import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { VideoRoute } from '@/components/videos/video-route';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { collectionName } from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';

/** Screen 95: save a video to a collection, optionally for offline viewing. */
export default function SaveVideoScreen() {
  const { collections, saved, offline, save, unsave } = useVideos();
  const [collection, setCollection] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [down, setDown] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const { t } = useTranslation('videos');

  return (
    <VideoRoute>
      {(v) => {
        const chosen = newName.trim() || collection || saved[v.id] || collections[0];
        const isOffline = down ?? offline.includes(v.id);
        if (done) {
          return (
            <AuthScreen
              center
              back={false}
              backdrop="reward"
              footer={<Button title={t('actions.done', { ns: 'common' })} onPress={() => router.back()} />}>
              <SuccessBadge icon="bookmark" colors={Gradients.reward} />
              <Animated.View entering={FadeInDown.delay(200)} style={{ gap: Spacing.xs }}>
                <Text variant="display" center>
                  {t('save.savedTo', { collection: collectionName(chosen, t) })}
                </Text>
                <Text color={Colors.textSecondary} center>
                  {isOffline ? t('save.downloaded') : t('save.findIt')}
                </Text>
              </Animated.View>
            </AuthScreen>
          );
        }
        return (
          <AuthScreen
            title={saved[v.id] ? t('save.titleSaved') : t('save.titleNew')}
            subtitle={v.title}
            footer={
              <>
                <Button
                  title={saved[v.id] ? t('save.update') : t('save.save')}
                  icon="bookmark"
                  onPress={() => {
                    save(v.id, chosen, isOffline);
                    setDone(true);
                  }}
                />
                {saved[v.id] && (
                  <Button
                    variant="ghost"
                    title={t('save.remove')}
                    onPress={() => {
                      unsave(v.id);
                      router.back();
                    }}
                  />
                )}
              </>
            }>
            <Text variant="heading">{t('save.collection')}</Text>
            <ChipWrap>
              {collections.map((c) => (
                <ChoiceChip
                  key={c}
                  label={collectionName(c, t)}
                  selected={!newName.trim() && chosen === c}
                  onPress={() => {
                    setNewName('');
                    setCollection(c);
                  }}
                />
              ))}
            </ChipWrap>
            <TextField
              label={t('save.newCollection')}
              icon="add-circle-outline"
              placeholder={t('save.newCollectionPlaceholder')}
              value={newName}
              onChangeText={setNewName}
            />
            <Card>
              <ToggleRow
                icon="cloud-download"
                label={t('save.offline')}
                description={t('save.offlineHint')}
                value={isOffline}
                onChange={setDown}
              />
            </Card>
          </AuthScreen>
        );
      }}
    </VideoRoute>
  );
}
