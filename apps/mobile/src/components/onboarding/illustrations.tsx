import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';

import { useFloat, usePulse } from './use-float';

const STAGE = 300;

function Stage({ children }: { children: ReactNode }) {
  return <View style={styles.stage}>{children}</View>;
}

function Glow({ color, size = 300 }: { color: string; size?: number }) {
  return <SoftGlow color={color} size={size} opacity={0.6} />;
}

function FloatingChip({
  icon,
  label,
  color,
  style,
  delay = 0,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  style: ViewStyle;
  delay?: number;
}) {
  const float = useFloat(6, 2200 + delay, delay);
  return (
    <Animated.View style={[styles.chip, style, float]}>
      <View style={[styles.chipIcon, { backgroundColor: color + '33' }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Text variant="label" style={{ letterSpacing: 0.2 }}>
        {label}
      </Text>
    </Animated.View>
  );
}

function Bar({
  width,
  color = Colors.surfaceRaised,
  height = 8,
}: {
  width: number | `${number}%`;
  color?: string;
  height?: number;
}) {
  return <View style={{ width, height, borderRadius: height / 2, backgroundColor: color }} />;
}

/** Slide 1: Meet Knowzone AI. The logo surrounded by subjects. */
export function MeetIllustration() {
  const { t } = useTranslation('auth');
  const float = useFloat(10, 3000);
  return (
    <Stage>
      <Glow color={Palette.purple500} size={320} />
      <Animated.View style={float}>
        <LogoMark size={150} />
      </Animated.View>
      <FloatingChip
        icon="leaf"
        label={t('onboarding.art.biology')}
        color={Palette.teal400}
        style={{ top: 18, left: 0 }}
      />
      <FloatingChip
        icon="flask"
        label={t('onboarding.art.chemistry')}
        color={Palette.coral400}
        style={{ top: 40, right: 0 }}
        delay={400}
      />
      <FloatingChip
        icon="calculator"
        label={t('onboarding.art.maths')}
        color={Palette.gold400}
        style={{ bottom: 40, left: 10 }}
        delay={800}
      />
      <FloatingChip
        icon="globe"
        label={t('onboarding.art.history')}
        color={Palette.sky400}
        style={{ bottom: 14, right: 12 }}
        delay={1200}
      />
    </Stage>
  );
}

/** Slide 2: short explainer videos. */
export function VideoIllustration() {
  const { t } = useTranslation('auth');
  const float = useFloat(8, 2800);
  return (
    <Stage>
      <Glow color={Palette.teal500} />
      <Animated.View style={[styles.phone, float]}>
        <LinearGradient
          colors={['#3B2DBF', '#7C5CFF', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.video}>
          <View style={styles.tag}>
            <Text variant="label">{t('onboarding.art.videoTag', { minutes: 5 })}</Text>
          </View>
          <View style={styles.play}>
            <Ionicons name="play" size={30} color={Palette.purple600} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.sideActions}>
            <Ionicons name="heart" size={20} color="#fff" />
            <Ionicons name="bookmark" size={18} color="#fff" />
            <Ionicons name="share-social" size={18} color="#fff" />
          </View>
          <View style={styles.caption}>
            <Text variant="small" style={{ fontSize: 12, lineHeight: 16 }}>
              {t('onboarding.art.videoCaption')}
            </Text>
          </View>
        </LinearGradient>
        <View style={{ padding: Spacing.sm, gap: 6 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: Colors.surfaceRaised }}>
            <View style={{ width: '62%', height: 4, borderRadius: 2, backgroundColor: Palette.teal400 }} />
          </View>
          <Text variant="label" color={Colors.textSecondary}>
            {t('onboarding.art.videoTitle')}
          </Text>
        </View>
      </Animated.View>
      <FloatingChip
        icon="checkmark-circle"
        label={t('onboarding.art.quickCheck', { score: 3, total: 3 })}
        color={Palette.teal400}
        style={{ top: 120, left: -6 }}
        delay={500}
      />
      <FloatingChip
        icon="text"
        label={t('onboarding.art.captions')}
        color={Palette.sky400}
        style={{ top: 26, right: -4 }}
        delay={900}
      />
    </Stage>
  );
}

/** Slide 3: AI tutor and summaries. */
export function TutorIllustration() {
  const { t } = useTranslation('auth');
  const floatA = useFloat(6, 2600);
  const floatB = useFloat(7, 3000, 600);
  return (
    <Stage>
      <Glow color={Palette.purple500} />
      <Animated.View style={[styles.summaryCard, floatA]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="document-text" size={16} color={Palette.purple400} />
          <Text variant="label" color={Palette.purple300}>
            {t('onboarding.art.summaryLabel')}
          </Text>
        </View>
        <Text variant="bodyStrong" style={{ fontSize: 14, lineHeight: 20 }}>
          {t('onboarding.art.summaryTitle')}
        </Text>
        {['92%', '78%', '85%'].map((w, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.teal400 }} />
            <Bar width={w as `${number}%`} height={7} />
          </View>
        ))}
      </Animated.View>
      <Animated.View style={[styles.chatWrap, floatB]}>
        <View style={styles.userBubble}>
          <Text variant="small" style={{ fontSize: 13 }}>
            {t('onboarding.art.userAsk')}
          </Text>
        </View>
        <View style={styles.aiBubble}>
          <LinearGradient colors={Gradients.ai} style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </LinearGradient>
          <Text variant="small" style={{ fontSize: 13, flex: 1 }}>
            {t('onboarding.art.aiReply')}
          </Text>
        </View>
      </Animated.View>
    </Stage>
  );
}

/** Slide 4: learn, play and earn rewards. */
export function RewardsIllustration() {
  const { t } = useTranslation('auth');
  const pulse = usePulse(0.96, 1.04, 1600);
  return (
    <Stage>
      <Glow color={Palette.gold400} size={320} />
      <Animated.View style={pulse}>
        <LinearGradient colors={Gradients.reward} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelRing}>
          <View style={styles.levelInner}>
            <Text variant="label" color={Palette.gold300}>
              {t('onboarding.art.level')}
            </Text>
            <Text style={styles.levelNumber}>{formatNumber(5)}</Text>
            <Ionicons name="star" size={18} color={Palette.gold400} />
          </View>
        </LinearGradient>
      </Animated.View>
      <FloatingChip
        icon="flash"
        label={t('onboarding.art.xpGain', { count: 50 })}
        color={Palette.gold400}
        style={{ top: 16, left: 6 }}
      />
      <FloatingChip
        icon="flame"
        label={t('onboarding.art.streak', { count: 7 })}
        color={Palette.coral400}
        style={{ top: 34, right: -2 }}
        delay={400}
      />
      <FloatingChip
        icon="ellipse"
        label={t('units.coins', { ns: 'common', count: 120 })}
        color={Palette.gold400}
        style={{ bottom: 44, left: -4 }}
        delay={800}
      />
      <FloatingChip
        icon="planet"
        label={t('onboarding.art.worldUnlocked')}
        color={Palette.purple400}
        style={{ bottom: 10, right: 4 }}
        delay={1200}
      />
    </Stage>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: STAGE,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingLeft: 7,
    paddingRight: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    shadowColor: '#5B45C9',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  chipIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  phone: {
    width: 180,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    shadowColor: '#5B45C9',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  video: { height: 220, padding: Spacing.sm, justifyContent: 'space-between' },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  play: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideActions: { position: 'absolute', right: 10, top: 70, gap: 14, alignItems: 'center' },
  caption: { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 8 },
  summaryCard: {
    position: 'absolute',
    top: 14,
    left: 0,
    width: 220,
    gap: 8,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  chatWrap: { position: 'absolute', bottom: 16, right: 0, width: 240, gap: 8 },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  aiAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  levelRing: { width: 170, height: 170, borderRadius: 85, padding: 8 },
  levelInner: {
    flex: 1,
    borderRadius: 80,
    backgroundColor: Colors.backgroundDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: { fontFamily: 'Manrope_800ExtraBold', fontSize: 56, lineHeight: 62, color: Colors.text },
});
