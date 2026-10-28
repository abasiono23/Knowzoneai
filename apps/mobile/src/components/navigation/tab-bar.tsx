import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from '@/components/ui/gradient';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Fonts, Gradients, Radius, Spacing } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;
export type TabMeta = Record<string, { label: string; icon: IconName; iconActive: IconName }>;

type Props = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
  /** Tabs to show, keyed by route name. Routes not listed stay hidden (still navigable). */
  tabs: TabMeta;
  /** The raised gradient action in the middle of the bar. */
  center: { icon: IconName; label: string; onPress: () => void };
};

/** Floating Knowzone tab bar shared by the student and teacher apps. */
export function TabBar({ state, navigateToTab, tabs, center }: Props) {
  const insets = useSafeAreaInsets();
  const visible = state.routes.map((route, i) => ({ route, i })).filter(({ route }) => tabs[route.name]);
  const middle = Math.floor(visible.length / 2);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      <View style={styles.bar}>
        {visible.map(({ route, i }, n) => {
          const meta = tabs[route.name];
          const focused = state.index === i;
          return (
            <Fragment key={route.key}>
              {n === middle && <CenterButton {...center} />}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  navigateToTab(route.key);
                }}
                accessibilityRole="tab"
                accessibilityLabel={meta.label}
                accessibilityState={{ selected: focused }}
                style={styles.tab}>
                <Ionicons
                  name={focused ? meta.iconActive : meta.icon}
                  size={24}
                  color={focused ? Colors.primary : Colors.textMuted}
                />
                <Text
                  variant="label"
                  color={focused ? Colors.primary : Colors.textMuted}
                  style={{ fontFamily: Fonts.semibold, letterSpacing: 0.2 }}>
                  {meta.label}
                </Text>
                {focused && <View style={styles.dot} />}
              </Pressable>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

function CenterButton({ icon, label, onPress }: Props['center']) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.centerSlot}>
      <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.centerButton}>
        <Ionicons name={icon} size={28} color={Colors.textOnAccent} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.md },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xs,
    shadowColor: '#5B45C9',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2 },
  centerSlot: { flex: 1, alignItems: 'center' },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
});
