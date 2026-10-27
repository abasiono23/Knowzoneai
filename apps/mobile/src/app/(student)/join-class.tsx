import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { teacherApi } from '@/lib/teacher';

/** Students join a teacher's class with the 6-character code. */
export default function JoinClassScreen() {
  const { t } = useTranslation('home');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<{ className: string; teacherName: string } | null>(null);

  const join = async () => {
    setBusy(true);
    setError(null);
    try {
      setJoined(await teacherApi.joinClass(code));
    } catch (e) {
      setError(errorText(e, t('joinClass.error')));
    } finally {
      setBusy(false);
    }
  };

  if (joined) {
    return (
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={<Button title={t('joinClass.backHome')} onPress={() => router.navigate('/home')} />}>
        <SuccessBadge icon="school" colors={['#FF9F43', '#7C5CFF']} />
        <Animated.View entering={FadeInDown.delay(250)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {t('joinClass.joinedTitle')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('joinClass.joinedBody', { className: joined.className, teacherName: joined.teacherName })}
          </Text>
        </Animated.View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      hero={<HeroIcon icon="school" colors={['#FF9F43', '#7C5CFF']} />}
      title={t('joinClass.title')}
      subtitle={t('joinClass.subtitle')}
      footer={<Button title={t('joinClass.join')} onPress={join} loading={busy} disabled={code.trim().length < 6} />}>
      <TextField
        label={t('joinClass.codeLabel')}
        icon="key-outline"
        placeholder={t('joinClass.codePlaceholder')}
        value={code}
        onChangeText={(text) => {
          setCode(
            text
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .slice(0, 6),
          );
          setError(null);
        }}
        error={error}
        autoCapitalize="characters"
        autoCorrect={false}
        style={{ letterSpacing: 4, fontSize: 20 }}
      />
    </AuthScreen>
  );
}
