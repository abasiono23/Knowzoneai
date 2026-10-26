import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  kind?: 'network' | 'server' | 'missing';
  title?: string;
  body?: string;
  onRetry?: () => void;
  onBack?: () => void;
};

const ICON = { network: 'cloud-offline', server: 'construct', missing: 'chatbubbles' } as const;

/** Screen 61 (full-page): when the tutor can't be reached or a chat can't be loaded. */
export function TutorErrorState({ kind = 'server', title, body, onRetry, onBack }: Props) {
  const { t } = useTranslation('tutor');
  return (
    <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: Radius.lg,
          backgroundColor: Colors.dangerSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={ICON[kind]} size={40} color={Colors.danger} />
      </View>
      <Text variant="title" center>
        {title ?? t(`errorState.${kind}Title`)}
      </Text>
      <Text color={Colors.textSecondary} center>
        {body ?? t(`errorState.${kind}Body`)}
      </Text>
      <View style={{ alignSelf: 'stretch', gap: Spacing.xs, marginTop: Spacing.sm }}>
        {onRetry && <Button title={t('actions.retry', { ns: 'common' })} icon="refresh" onPress={onRetry} />}
        {onBack && <Button variant="ghost" title={t('actions.goBack', { ns: 'common' })} onPress={onBack} />}
      </View>
    </View>
  );
}
