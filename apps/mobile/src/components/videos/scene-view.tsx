import { Image } from 'expo-image';
import { LinearGradient } from '@/components/ui/gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import type { VisualStyle } from '@/lib/videos/options';
import type { Scene } from '@/lib/videos/types';

/** Decorative background texture per visual style (stars, chalk dust, grid, notebook lines). */
function Texture({ s }: { s: VisualStyle }) {
  if (s.texture === 'none') return null;
  const lines = Array.from({ length: 14 }, (_, i) => i);
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      {s.texture === 'stars' &&
        lines
          .concat(lines)
          .map((i, k) => (
            <Circle
              key={k}
              cx={`${(k * 37) % 100}%`}
              cy={`${(k * 53) % 100}%`}
              r={k % 3 === 0 ? 1.6 : 1}
              fill="#FFFFFF"
              opacity={0.35}
            />
          ))}
      {s.texture === 'grid' &&
        lines.map((i) => (
          <Line
            key={`h${i}`}
            x1="0"
            x2="100%"
            y1={`${i * 8}%`}
            y2={`${i * 8}%`}
            stroke="#FFFFFF"
            strokeOpacity={0.08}
          />
        ))}
      {s.texture === 'grid' &&
        lines.map((i) => (
          <Line
            key={`v${i}`}
            y1="0"
            y2="100%"
            x1={`${i * 8}%`}
            x2={`${i * 8}%`}
            stroke="#FFFFFF"
            strokeOpacity={0.08}
          />
        ))}
      {s.texture === 'paper' &&
        lines.map((i) => (
          <Line
            key={i}
            x1="0"
            x2="100%"
            y1={`${8 + i * 7}%`}
            y2={`${8 + i * 7}%`}
            stroke="#7C9CFF"
            strokeOpacity={0.18}
          />
        ))}
      {s.texture === 'chalk' &&
        lines.map((i) => (
          <Circle
            key={i}
            cx={`${(i * 41) % 100}%`}
            cy={`${(i * 67) % 100}%`}
            r={18 + (i % 4) * 6}
            fill="#FFFFFF"
            opacity={0.025}
          />
        ))}
    </Svg>
  );
}

type Props = {
  scene: Scene;
  style: VisualStyle;
  /** For check scenes. */
  answer?: number | null;
  onAnswer?: (i: number) => void;
  compact?: boolean;
  /** Overrides the compact scale, e.g. for small thumbnails. */
  scale?: number;
  /** Keeps content clear of overlays such as the feed's action rail. */
  inset?: { right?: number; bottom?: number };
};

/** Renders one explainer scene in the chosen visual style. Keyed by scene so each scene animates in. */
export function SceneView({ scene, style: s, answer, onAnswer, compact, scale, inset }: Props) {
  const size = scale ?? (compact ? 0.62 : 1);
  const { t } = useTranslation('videos');
  return (
    <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill}>
      <Texture s={s} />
      <View
        style={[
          styles.inner,
          {
            padding: Spacing.lg * size,
            paddingRight: Spacing.lg * size + (inset?.right ?? 0),
            paddingBottom: Spacing.lg * size + (inset?.bottom ?? 0),
          },
        ]}
        key={scene.id}>
        {scene.image ? (
          // The scene's picture: an AI illustration or a real photo (no text, so it suits every language).
          <Animated.View entering={ZoomIn.duration(400)} style={{ alignItems: 'center', gap: 4 }}>
            <Image
              source={{ uri: scene.image }}
              style={{ width: 168 * size, height: 168 * size, borderRadius: Radius.lg * size }}
              contentFit="cover"
              transition={200}
              accessible={false}
            />
            {scene.credit && (
              // Real photos are freely licensed on condition that their author and licence are shown.
              <Text
                numberOfLines={1}
                style={{ maxWidth: 220 * size, fontSize: 9 * Math.max(size, 0.9), opacity: 0.75 }}
                color={s.text}>
                📷 {scene.credit.author} · {scene.credit.license} · Wikimedia Commons
              </Text>
            )}
          </Animated.View>
        ) : (
          <Animated.Text
            entering={ZoomIn.duration(400)}
            style={{
              fontSize: 56 * size,
              lineHeight: 66 * size,
              textAlign: 'center',
            }}>
            {scene.emoji}
          </Animated.Text>
        )}
        <Animated.View
          entering={FadeInDown.delay(120).duration(450)}
          style={{
            gap: Spacing.sm * size,
            alignItems: 'center',
            alignSelf: 'stretch',
          }}>
          {scene.kind !== 'title' && (
            <View style={[styles.tag, { backgroundColor: s.accent + '33' }]}>
              <Text variant="label" color={s.accent} style={{ fontSize: 10 * Math.max(size, 0.9) }}>
                {scene.kind === 'check'
                  ? t('sceneTags.check')
                  : scene.kind === 'example'
                    ? t('sceneTags.example')
                    : scene.kind === 'recap'
                      ? t('sceneTags.recap')
                      : scene.kind === 'formula'
                        ? t('sceneTags.formula')
                        : t('sceneTags.keyIdea')}
              </Text>
            </View>
          )}
          <Text
            center
            numberOfLines={size < 0.6 ? 3 : undefined}
            style={{
              fontFamily: s.headingFont,
              fontSize: (scene.kind === 'title' ? 30 : 24) * size,
              lineHeight: (scene.kind === 'title' ? 36 : 30) * size,
              color: s.text,
            }}>
            {scene.kind === 'check' ? (scene.check?.question ?? scene.heading) : scene.heading}
          </Text>
          {scene.body && scene.kind !== 'check' && size >= 0.5 && (
            <Text
              center
              style={[
                {
                  color: s.text,
                  opacity: 0.9,
                  fontFamily: 'Manrope_600SemiBold',
                  fontSize: 16 * size,
                  lineHeight: 24 * size,
                },
                scene.kind === 'formula' && {
                  fontFamily: 'Manrope_800ExtraBold',
                  fontSize: 20 * size,
                  color: s.accent,
                },
              ]}
              numberOfLines={compact ? 3 : 7}>
              {scene.body}
            </Text>
          )}
          {scene.bullets && (
            <View style={{ gap: 8 * size, alignSelf: 'stretch' }}>
              {scene.bullets.map((b, i) => (
                <Animated.View
                  key={i}
                  entering={FadeIn.delay(300 + i * 350)}
                  style={[styles.bullet, { borderColor: s.accent + '55' }]}>
                  <Text
                    style={{
                      color: s.accent,
                      fontFamily: 'Manrope_800ExtraBold',
                      fontSize: 14 * size,
                    }}>
                    {i + 1}
                  </Text>
                  <Text
                    style={{
                      color: s.text,
                      flex: 1,
                      fontFamily: 'Manrope_600SemiBold',
                      fontSize: 14 * size,
                      lineHeight: 20 * size,
                    }}
                    numberOfLines={compact ? 2 : 4}>
                    {b}
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}
          {scene.kind === 'check' && scene.check && (
            <View style={{ gap: 8 * size, alignSelf: 'stretch' }}>
              {scene.check.options.map((o, i) => {
                const picked = answer === i;
                const correct = answer != null && i === scene.check!.correctIndex;
                const wrong = picked && !correct;
                return (
                  <Pressable
                    key={i}
                    onPress={() => answer == null && onAnswer?.(i)}
                    accessibilityRole="button"
                    accessibilityLabel={o}
                    style={[
                      styles.option,
                      { borderColor: s.text + '44' },
                      correct && {
                        backgroundColor: '#2DD4BF55',
                        borderColor: '#2DD4BF',
                      },
                      wrong && {
                        backgroundColor: '#FF5A7A55',
                        borderColor: '#FF5A7A',
                      },
                    ]}>
                    <Text
                      style={{
                        color: s.text,
                        fontFamily: 'Manrope_700Bold',
                        fontSize: 15 * Math.max(size, 0.85),
                      }}
                      numberOfLines={3}>
                      {o}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  bullet: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  option: {
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
});
