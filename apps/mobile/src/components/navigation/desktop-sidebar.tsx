import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/brand/logo';
import { Text } from '@/components/ui';
import { WakeSwitch } from '@/components/whiteboard/wake-switch';
import { LinearGradient } from '@/components/ui/gradient';
import { Radius, Spacing } from '@/constants/theme';
import { USE_MOCKS } from '@/lib/config';
import { useSession } from '@/lib/session';
import { listConversations } from '@/lib/tutor/remote';

type IconName = keyof typeof Ionicons.glyphMap;

/** The sections, each with its own colour, as in the web preview. Labels reuse the app's own names. */
type Section = 'home' | 'tutor' | 'exams' | 'books' | 'videos' | 'play' | 'rooms' | 'studio';
const SECTIONS: { id: Section; href: string; icon: IconName; colors: readonly [string, string] }[] = [
  { id: 'home', href: '/home', icon: 'home', colors: ['#b18cff', '#6a45ff'] },
  { id: 'tutor', href: '/tutor', icon: 'sparkles', colors: ['#2fd8a8', '#0fb5a2'] },
  { id: 'exams', href: '/exams', icon: 'document-text', colors: ['#ffc247', '#e89a10'] },
  { id: 'books', href: '/books', icon: 'book', colors: ['#5cc8ff', '#1f8fe0'] },
  { id: 'videos', href: '/videos', icon: 'play-circle', colors: ['#ff7ab0', '#f0569b'] },
  { id: 'play', href: '/play', icon: 'planet', colors: ['#7be36f', '#2fa84d'] },
  { id: 'rooms', href: '/rooms', icon: 'people', colors: ['#ff9d6b', '#f0693c'] },
  { id: 'studio', href: '/studio', icon: 'color-wand', colors: ['#c04dff', '#7a55ff'] },
];

type Recent = { id: string; title: string; pinned: boolean; updatedAt: number };

/**
 * The web version's sidebar on a computer, in the style of a chat app: a new chat, the sections,
 * your recent tutor chats and your account. Replaces the bottom tab bar at computer width.
 */
export function DesktopSidebar() {
  const { t } = useTranslation();
  const { t: th } = useTranslation('home');
  const { t: te } = useTranslation('exams');
  const { t: tu } = useTranslation('tutor');
  const label: Record<Section, string> = {
    home: t('tabs.home'),
    tutor: th('home.quickActions.tutor.title'),
    exams: te('title'),
    books: t('desktop.books'),
    videos: th('home.quickActions.videos.title'),
    play: t('tabs.play'),
    rooms: th('home.quickActions.rooms.title'),
    studio: t('tabs.aiStudio'),
  };
  const { user } = useSession();
  const path = usePathname();
  const [recent, setRecent] = useState<Recent[] | null>(USE_MOCKS ? [] : null);

  // Refreshed as you move around, so a chat you just started shows up.
  useEffect(() => {
    if (USE_MOCKS) return;
    let live = true;
    const timer = setTimeout(() => {
      listConversations()
        .then((list) => live && setRecent(list))
        .catch(() => live && setRecent((r) => r ?? []));
    }, 400);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [path]);

  const chats = [...(recent ?? [])]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
    .slice(0, 15);
  const plan = user?.plan ?? 'FREE';
  const go = (href: string) => router.push(href as Href);

  return (
    <LinearGradient colors={['#2a1490', '#1a0d57']} start={{ x: 0, y: 0 }} end={{ x: 0.3, y: 1 }} style={styles.side}>
      <Pressable onPress={() => go('/home')} accessibilityRole="link" style={styles.brand}>
        <LogoMark size={34} />
        <Text variant="heading" color="#fff">
          Knowzone
        </Text>
      </Pressable>

      <Pressable onPress={() => go('/tutor')} accessibilityRole="button">
        {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
          <LinearGradient
            colors={['#7a55ff', '#c04dff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.newChat, (pressed || hovered) && { opacity: 0.88 }]}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text variant="bodyStrong" color="#fff">
              {t('desktop.newChat')}
            </Text>
          </LinearGradient>
        )}
      </Pressable>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: Spacing.md }} showsVerticalScrollIndicator={false}>
        <View accessibilityRole="menu" accessibilityLabel={t('desktop.menu')} style={{ gap: 2 }}>
          {SECTIONS.map((s) => {
            const active = path === s.href || path.startsWith(`${s.href}/`);
            return (
              <Pressable
                key={s.id}
                onPress={() => go(s.href)}
                accessibilityRole="link"
                accessibilityState={{ selected: active }}
                style={({ hovered }: { hovered?: boolean }) => [
                  styles.row,
                  active && styles.rowActive,
                  hovered && !active && styles.rowHover,
                ]}>
                <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
                  <Ionicons name={s.icon} size={16} color="#fff" />
                </LinearGradient>
                <Text variant="body" color="#fff" numberOfLines={1}>
                  {label[s.id]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: 2 }}>
          <Text variant="label" color="rgba(255,255,255,0.6)" style={styles.heading}>
            {tu('landing.recentChats')}
          </Text>
          {recent && !chats.length && (
            <Text variant="small" color="rgba(255,255,255,0.6)" style={styles.heading}>
              {t('desktop.noChats')}
            </Text>
          )}
          {chats.map((c) => {
            const active = path === `/tutor/${c.id}`;
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push({ pathname: '/tutor/[id]', params: { id: c.id } })}
                accessibilityRole="link"
                accessibilityState={{ selected: active }}
                style={({ hovered }: { hovered?: boolean }) => [
                  styles.chat,
                  active && styles.rowActive,
                  hovered && !active && styles.rowHover,
                ]}>
                {c.pinned && <Ionicons name="pin" size={13} color="rgba(255,255,255,0.7)" />}
                <Text variant="small" color="#fff" numberOfLines={1} style={{ flex: 1 }}>
                  {c.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <WakeSwitch dark />
      {plan === 'FREE' && (
        <Pressable onPress={() => go('/billing')} accessibilityRole="link">
          <LinearGradient
            colors={['rgba(255,194,71,0.3)', 'rgba(255,122,176,0.22)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgrade}>
            <Ionicons name="flash" size={18} color="#ffc247" />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" color="#fff">
                {t('desktop.upgrade')}
              </Text>
              <Text variant="small" color="rgba(255,255,255,0.75)">
                {t('desktop.upgradeBody')}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      )}
      <Pressable
        onPress={() => go('/profile')}
        accessibilityRole="link"
        style={({ hovered }: { hovered?: boolean }) => [styles.me, hovered && styles.rowHover]}>
        <LinearGradient
          colors={['#2fd8a8', '#1f8fe0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}>
          <Text variant="bodyStrong" color="#fff">
            {(user?.name?.trim()[0] ?? '?').toUpperCase()}
          </Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" color="#fff" numberOfLines={1}>
            {user?.name}
          </Text>
          <Text variant="small" color="rgba(255,255,255,0.7)">
            {t(plan === 'PRO' ? 'desktop.planPro' : plan === 'PLUS' ? 'desktop.planPlus' : 'desktop.planFree')}
          </Text>
        </View>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  side: { width: 272, height: '100%', padding: Spacing.md, gap: Spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: 4 },
  newChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  rowActive: { backgroundColor: 'rgba(255,255,255,0.16)' },
  rowHover: { backgroundColor: 'rgba(255,255,255,0.09)' },
  icon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  heading: { paddingHorizontal: 8, paddingVertical: 4 },
  chat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  me: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: 8, borderRadius: Radius.md },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
