import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Colors, Gradients, Radius } from '@/constants/theme';

import { useFloat } from '../onboarding/use-float';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  colors?: readonly [string, string, ...string[]];
  size?: number;
  badge?: keyof typeof Ionicons.glyphMap;
};

/** Glowing gradient tile that heads auth screens (mail, lock, gift…). */
export function HeroIcon({ icon, colors = Gradients.ai, size = 88, badge }: Props) {
  const float = useFloat(5, 2600);
  return (
    <Animated.View entering={ZoomIn.springify().damping(12)} style={{ alignSelf: 'flex-start' }}>
      <Animated.View style={float}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: Radius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors[0],
            shadowOpacity: 0.6,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12,
          }}>
          <Ionicons name={icon} size={size * 0.46} color={Colors.textOnAccent} />
        </LinearGradient>
      </Animated.View>
      {badge && (
        <Animated.View
          entering={ZoomIn.delay(250)}
          style={{
            position: 'absolute',
            right: -8,
            top: -8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.reward,
            borderWidth: 3,
            borderColor: Colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={badge} size={14} color={Colors.backgroundDeep} />
        </Animated.View>
      )}
    </Animated.View>
  );
}
