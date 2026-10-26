import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';

const SOURCES: {
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** Title and body live in the `study` namespace under source.<key>. */
  key: 'upload' | 'paste' | 'topic' | 'video' | 'photo';
  badge?: boolean;
}[] = [
  {
    href: '/study/upload',
    icon: 'document-attach',
    color: Palette.coral400,
    key: 'upload',
    badge: true,
  },
  {
    href: '/study/paste',
    icon: 'clipboard',
    color: Palette.purple300,
    key: 'paste',
  },
  {
    href: '/study/topic',
    icon: 'bulb',
    color: Palette.gold400,
    key: 'topic',
  },
  {
    href: '/study/video',
    icon: 'logo-youtube',
    color: '#FF5A7A',
    key: 'video',
  },
  {
    href: '/study/upload?kind=image',
    icon: 'camera',
    color: Palette.teal400,
    key: 'photo',
  },
];

/** Screen 63: choose where the study material comes from. */
export default function SelectSourceScreen() {
  const { t } = useTranslation('study');
  const flip = useFlipStyle();
  return (
    <AuthScreen title={t('source.title')} subtitle={t('source.subtitle')}>
      {SOURCES.map((s, i) => (
        <Animated.View key={s.key} entering={FadeInDown.delay(i * 60)}>
          <Pressable
            onPress={() => router.push(s.href as Href)}
            accessibilityRole="button"
            accessibilityLabel={t('source.a11y', {
              title: t(`source.${s.key}.title`),
              body: t(`source.${s.key}.body`),
            })}
            style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <View style={[styles.icon, { backgroundColor: s.color + '22' }]}>
              <Ionicons name={s.icon} size={26} color={s.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                <Text variant="bodyStrong">{t(`source.${s.key}.title`)}</Text>
                {s.badge && (
                  <View style={styles.badge}>
                    <Text variant="label" color={Colors.backgroundDeep} style={{ fontSize: 9, lineHeight: 13 }}>
                      {t('source.upload.badge')}
                    </Text>
                  </View>
                )}
              </View>
              <Text variant="small" color={Colors.textSecondary}>
                {t(`source.${s.key}.body`)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={flip} />
          </Pressable>
        </Animated.View>
      ))}
      <Text variant="small" color={Colors.textMuted} center>
        {t('source.rights')}
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: Colors.reward, borderRadius: Radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
});
