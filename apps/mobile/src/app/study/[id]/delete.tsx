import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useMaterial, useMaterials } from '@/lib/studio/store';

/** Screen 87: confirm deleting a material, spelling out what will be lost. Works for failed packs too. */
export default function DeleteMaterialScreen() {
  const { t } = useTranslation('study');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { material: m } = useMaterial(id);
  const { remove } = useMaterials();

  if (!m) {
    return (
      <AuthScreen>
        <TutorErrorState
          kind="missing"
          title={t('delete.alreadyDeleted')}
          onBack={() => router.replace('/study/library')}
        />
      </AuthScreen>
    );
  }

  const reviewed = Object.values(m.cards).reduce((n, c) => n + c.reviews, 0);
  const losses = [
    m.content &&
      (reviewed
        ? t('delete.lossCardsReviews', { count: m.content.flashcards.length, reviews: reviewed })
        : t('delete.lossCards', { count: m.content.flashcards.length })),
    m.attempts.length && t('delete.lossResults', { count: m.attempts.length }),
    m.content && t('delete.lossNotes'),
    m.offline && t('delete.lossOffline'),
  ].filter(Boolean) as string[];

  return (
    <AuthScreen
      hero={<HeroIcon icon="trash" colors={['#FF5A7A', '#B8326A']} />}
      title={t('delete.title')}
      subtitle={t('delete.subtitle', { title: m.title })}
      footer={
        <>
          <Button
            title={t('delete.deletePermanently')}
            icon="trash"
            variant="danger"
            onPress={() => {
              remove(m.id);
              router.dismissTo('/study/library');
            }}
          />
          <Button variant="secondary" title={t('delete.keep')} onPress={() => router.back()} />
        </>
      }>
      {losses.length > 0 && (
        <Card style={{ gap: Spacing.xs, borderColor: Colors.danger + '66' }}>
          <Text variant="label" color={Colors.danger}>
            {t('delete.youllLose')}
          </Text>
          {losses.map((l) => (
            <View key={l} style={styles.row}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text variant="small" style={{ flex: 1 }}>
                {l}
              </Text>
            </View>
          ))}
        </Card>
      )}
      <View style={styles.row}>
        <Ionicons name="information-circle" size={16} color={Colors.textMuted} />
        <Text variant="small" color={Colors.textMuted} style={{ flex: 1 }}>
          {t('delete.info')}
        </Text>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
