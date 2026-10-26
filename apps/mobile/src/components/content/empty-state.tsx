import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon, title, body, action }: Props) {
  return (
    <View
      style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: Radius.lg,
          backgroundColor: Colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Ionicons name={icon} size={32} color={Colors.primary} />
      </View>
      <Text variant="heading" center>
        {title}
      </Text>
      <Text color={Colors.textSecondary} center>
        {body}
      </Text>
      {action && (
        <Button variant="secondary" title={action.label} onPress={action.onPress} style={{ marginTop: Spacing.xs }} />
      )}
    </View>
  );
}
