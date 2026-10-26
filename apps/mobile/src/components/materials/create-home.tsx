import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { AskCard } from '@/components/tutor/messages';
import { Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useMaterials } from '@/lib/studio/store';
import { outputLabel } from '@/lib/studio/labels';
import { OUTPUTS } from '@/lib/studio/types';

import { MaterialCard } from './material-card';

/** Screen 62: create learning material: what you get, where to start, and recent materials. */
export function CreateHome({ withTabBar = true, back = false }: { withTabBar?: boolean; back?: boolean }) {
  const { t } = useTranslation('study');
  const { materials } = useMaterials();
  const recent = materials.slice(0, 3);

  return (
    <Screen withTabBar={withTabBar}>
      {back ? (
        <ScreenHeader eyebrow={t('createHome.eyebrow')} />
      ) : (
        <Text variant="label" color={Colors.primary}>
          {t('createHome.eyebrow')}
        </Text>
      )}
      <View style={styles.hero}>
        <SoftGlow color={Palette.purple500} size={260} />
        <LogoMark size={68} />
        <Text variant="display" center>
          {t('createHome.title')}
        </Text>
        <Text color={Colors.textSecondary} center>
          {t('createHome.body')}
        </Text>
      </View>

      <AskCard
        title={t('createHome.createTitle')}
        subtitle={t('createHome.createSubtitle')}
        onPress={() => router.push('/study/source')}
      />
      <AskCard
        title={t('createHome.videoTitle')}
        subtitle={t('createHome.videoSubtitle')}
        onPress={() => router.push('/videos/create')}
      />

      <View style={styles.outputs}>
        {OUTPUTS.map((o, i) => (
          <Animated.View key={o.id} entering={FadeInDown.delay(i * 40)} style={styles.output}>
            <Ionicons name={o.icon as keyof typeof Ionicons.glyphMap} size={16} color={Colors.primary} />
            <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
              {outputLabel(o.id, t)}
            </Text>
          </Animated.View>
        ))}
      </View>

      <View style={{ gap: Spacing.xs }}>
        <SectionHeader
          title={t('createHome.recent')}
          action={materials.length ? t('actions.seeAll', { ns: 'common' }) : undefined}
          onAction={() => router.push('/study/library')}
        />
        {recent.length ? (
          recent.map((m) => <MaterialCard key={m.id} m={m} />)
        ) : (
          <Pressable onPress={() => router.push('/study/source')} accessibilityRole="button" style={styles.empty}>
            <Ionicons name="layers-outline" size={26} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textSecondary} center>
              {t('createHome.empty')}
            </Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  outputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  output: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
  },
});
