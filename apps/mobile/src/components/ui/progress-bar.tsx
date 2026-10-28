import { LinearGradient } from '@/components/ui/gradient';
import { View } from 'react-native';

import { Colors, Gradients, Radius } from '@/constants/theme';

type Props = {
  progress: number;
  colors?: readonly [string, string, ...string[]];
  height?: number;
};

export function ProgressBar({ progress, colors = Gradients.mastery, height = 10 }: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{
        height,
        borderRadius: Radius.pill,
        backgroundColor: Colors.surfaceRaised,
        overflow: 'hidden',
      }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${pct}%`, height: '100%', borderRadius: Radius.pill }}
      />
    </View>
  );
}
