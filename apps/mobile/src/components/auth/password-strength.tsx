import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Palette } from '@/constants/theme';
import { passwordStrength } from '@/lib/onboarding-flow';

const COLORS = [Colors.danger, Colors.danger, Palette.gold500, Colors.success, Colors.success];

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslation('auth');
  if (!password) return null;
  const { score, level } = passwordStrength(password);
  const label = t(`shared.strength.${level}`);
  return (
    <View style={{ gap: 6 }} accessibilityLabel={t('shared.passwordStrength', { level: label })}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= score ? COLORS[score] : Colors.surfaceRaised,
            }}
          />
        ))}
      </View>
      <Text variant="small" color={COLORS[score]}>
        {label}
      </Text>
    </View>
  );
}
