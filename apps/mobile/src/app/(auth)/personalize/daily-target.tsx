import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { DAILY_TARGETS } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function DailyTargetScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const minutes = profile.dailyMinutes;
  const weeklyHours = formatNumber((minutes * 6 + Math.round(minutes / 2)) / 60, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <StepScreen step="daily-target" title={t('dailyTarget.title')} subtitle={t('dailyTarget.subtitle')}>
      <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Animated.View key={minutes} entering={FadeIn.duration(250)} style={{ alignItems: 'center' }}>
          <Text style={styles.big}>{formatNumber(minutes)}</Text>
          <Text variant="label" color="rgba(255,255,255,0.85)">
            {t('dailyTarget.minutesADay', { count: minutes })}
          </Text>
        </Animated.View>
        <View style={styles.stats}>
          <Stat value={t('dailyTarget.hours', { hours: weeklyHours })} label={t('dailyTarget.perWeek')} />
          <Stat
            value={t('dailyTarget.lessons', { count: Math.max(1, Math.round(minutes / 5)) })}
            label={t('dailyTarget.lessonsADay')}
          />
          <Stat value={t('dailyTarget.xp', { count: minutes * 4 })} label={t('dailyTarget.xpADay')} />
        </View>
      </LinearGradient>

      {DAILY_TARGETS.map((o) => (
        <OptionCard
          key={o.minutes}
          label={t('dailyTarget.option', { label: o.label, minutes: o.minutes })}
          description={o.description}
          emoji={o.emoji}
          badge={o.minutes === 15 ? t('dailyTarget.popular') : undefined}
          selected={minutes === o.minutes}
          onPress={() => update({ dailyMinutes: o.minutes })}
        />
      ))}
    </StepScreen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text variant="heading">{value}</Text>
      <Text variant="small" color="rgba(255,255,255,0.8)" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.xs },
  big: { fontFamily: 'Manrope_800ExtraBold', fontSize: 64, lineHeight: 70, color: Colors.textOnAccent },
  stats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
});
