import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Celebration } from '@/components/onboarding/celebration';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

export default function VerifiedScreen() {
  const { t } = useTranslation('auth');
  const { user } = useSession();

  return (
    <View style={{ flex: 1 }}>
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <Button
            title={t('actions.continue', { ns: 'common' })}
            icon="arrow-forward"
            onPress={() => router.replace('/referral')}
          />
        }>
        <SuccessBadge icon="checkmark" />
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {t('verified.title')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {user?.name ? t('verified.bodyNamed', { name: user.name }) : t('verified.body')}
          </Text>
        </Animated.View>
      </AuthScreen>
      <Celebration />
    </View>
  );
}
