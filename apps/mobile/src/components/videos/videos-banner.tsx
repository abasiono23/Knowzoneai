import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';

/** Entry point to the short-video feed (88) and the video generator (98). */
export function VideosBanner() {
  const { t } = useTranslation('videos');
  return (
    <LinearGradient
      colors={['#2A1B6B', '#6A45FF', '#FF7A93']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="label" color="rgba(255,255,255,0.8)">
          {t('banner.eyebrow')}
        </Text>
        <Text variant="heading" color="#fff">
          {t('banner.title')}
        </Text>
        <Text variant="small" color="rgba(255,255,255,0.85)">
          {t('banner.body')}
        </Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => router.push('/videos')}
            accessibilityRole="button"
            accessibilityLabel={t('banner.watchLabel')}
            style={[styles.btn, styles.btnSolid]}>
            <Ionicons name="play" size={14} color="#2A1B6B" />
            <Text variant="small" color="#2A1B6B" style={styles.btnText}>
              {t('banner.watch')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/videos/create')}
            accessibilityRole="button"
            accessibilityLabel={t('banner.makeLabel')}
            style={styles.btn}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text variant="small" color="#fff" style={styles.btnText}>
              {t('banner.make')}
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.phone}>
        <Ionicons name="play-circle" size={34} color="#fff" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  btnSolid: { backgroundColor: '#fff', borderColor: '#fff' },
  btnText: { fontFamily: 'Manrope_700Bold' },
  phone: {
    width: 64,
    height: 104,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }],
  },
});
