import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { ClassCard } from '@/components/teacher/class-card';
import { Button, Screen, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { teacherApi, type ClassSummary } from '@/lib/teacher';

export default function ClassesScreen() {
  const { t } = useTranslation('teacher');
  const [classes, setClasses] = useState<ClassSummary[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      teacherApi
        .classes()
        .then((r) => setClasses(r.classes))
        .catch(() => setClasses([]));
    }, []),
  );

  return (
    <Screen>
      <View style={{ gap: Spacing.xxs }}>
        <Text variant="label" color={Colors.primary}>
          {t('classes.eyebrow')}
        </Text>
        <Text variant="display">{t('classes.title')}</Text>
      </View>
      <Button title={t('classes.create')} icon="add" variant="secondary" onPress={() => router.push('/class/new')} />
      {!classes ? (
        <ActivityIndicator color={Colors.primary} />
      ) : classes.length === 0 ? (
        <Text color={Colors.textSecondary} center>
          {t('classes.empty')}
        </Text>
      ) : (
        classes.map((c) => <ClassCard key={c.id} c={c} />)
      )}
    </Screen>
  );
}
