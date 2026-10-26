import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';

/** Daily tutor allowance; tapping it opens the usage-limit screen (60). */
export function UsageMeter({ remaining, limit }: { remaining: number; limit: number }) {
  const { t } = useTranslation('tutor');
  const low = remaining <= 3;
  return (
    <Pressable
      onPress={() => router.push('/tutor/limit')}
      accessibilityRole="button"
      accessibilityLabel={t('usage.leftLabel', { remaining, limit })}>
      <Card style={{ gap: Spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
          <Ionicons name="flash" size={16} color={low ? Colors.reward : Colors.primary} />
          <Text variant="small" style={{ flex: 1 }}>
            <Trans
              t={t}
              i18nKey="usage.left"
              values={{ remaining, limit }}
              components={{ strong: <Text variant="bodyStrong" /> }}
            />
          </Text>
          <Text variant="small" color={Colors.primary}>
            {low ? t('usage.getMore') : t('usage.details')}
          </Text>
        </View>
        <ProgressBar progress={remaining / limit} height={6} colors={low ? Gradients.reward : Gradients.ai} />
      </Card>
    </Pressable>
  );
}
