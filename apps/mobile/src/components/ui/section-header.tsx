import { Pressable, View } from 'react-native';

import { Colors } from '@/constants/theme';

import { Text } from './text';

type Props = { title: string; action?: string; onAction?: () => void };

export function SectionHeader({ title, action, onAction }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="heading">{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button">
          <Text variant="small" color={Colors.primary}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
