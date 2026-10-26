import { View, type ViewProps } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = ViewProps & { raised?: boolean };

export function Card({ raised, style, ...rest }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: raised ? Colors.surfaceRaised : Colors.surface,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: Spacing.md,
        },
        style,
      ]}
      {...rest}
    />
  );
}
