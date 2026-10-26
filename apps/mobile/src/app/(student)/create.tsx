import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';

type CreateAction = {
  id: 'pdf' | 'snap' | 'paste' | 'tutor';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: string;
};

type QuickAction = {
  id: 'quiz' | 'cards' | 'joinClass' | 'video';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: string;
};

const CREATE: CreateAction[] = [
  { id: 'pdf', icon: 'document-attach', color: Palette.purple400, href: '/study/upload' },
  { id: 'snap', icon: 'camera', color: Palette.teal400, href: '/study/upload?kind=image' },
  { id: 'paste', icon: 'clipboard', color: Palette.sky400, href: '/study/paste' },
  { id: 'tutor', icon: 'chatbubbles', color: Palette.gold400, href: '/tutor' },
];

const QUICK: QuickAction[] = [
  { id: 'quiz', icon: 'help-circle', color: Palette.coral400, href: '/lesson/l9' },
  { id: 'cards', icon: 'albums', color: Palette.gold400, href: '/saved' },
  { id: 'joinClass', icon: 'school', color: '#FF9F43', href: '/join-class' },
  { id: 'video', icon: 'videocam', color: Palette.sky400, href: '/videos/create' },
];

/** Screen 46: the Create menu opened from the centre tab button. */
export default function CreateMenu() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('home');
  const go = (href: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.back();
    setTimeout(() => router.push(href as Href), 10);
  };

  return (
    <View style={styles.fill}>
      <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
        <Pressable
          style={styles.backdrop}
          onPress={() => router.back()}
          accessibilityLabel={t('actions.closeMenu', { ns: 'common' })}
        />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.springify().damping(18)}
        style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.handle} />
        <View style={styles.titleRow}>
          <Text variant="title">{t('tabs.create', { ns: 'common' })}</Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('actions.close', { ns: 'common' })}
            style={styles.close}>
            <Ionicons name="close" size={20} color={Colors.text} />
          </Pressable>
        </View>

        <Text variant="label" color={Colors.primary}>
          {t('create.studyPack')}
        </Text>
        <View style={styles.grid}>
          {CREATE.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => go(a.href)}
              accessibilityRole="button"
              accessibilityLabel={t('create.actionLabel', {
                label: t(`create.actions.${a.id}.label`),
                hint: t(`create.actions.${a.id}.hint`),
              })}
              style={({ pressed }) => [styles.big, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
              <View style={[styles.bigIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon} size={24} color={a.color} />
              </View>
              <Text variant="bodyStrong">{t(`create.actions.${a.id}.label`)}</Text>
              <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
                {t(`create.actions.${a.id}.hint`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text variant="label" color={Colors.textMuted}>
          {t('create.quickActions')}
        </Text>
        <View style={styles.quickRow}>
          {QUICK.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => go(a.href)}
              accessibilityRole="button"
              accessibilityLabel={t(`create.quick.${a.id}`)}
              style={styles.quick}>
              <View style={[styles.quickIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text variant="small" center style={{ fontSize: 12 }}>
                {t(`create.quick.${a.id}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(4, 6, 20, 0.7)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.borderStrong,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  big: {
    width: '47%',
    flexGrow: 1,
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bigIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quick: { alignItems: 'center', gap: 6, width: '24%' },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
