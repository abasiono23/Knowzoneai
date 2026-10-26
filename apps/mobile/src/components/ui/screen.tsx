import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gradients, MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';

type Props = { children: ReactNode; scroll?: boolean; withTabBar?: boolean };

export function Screen({ children, scroll = true, withTabBar = true }: Props) {
  const inner = <View style={styles.inner}>{children}</View>;
  return (
    <LinearGradient colors={Gradients.screen} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={{
              paddingBottom: (withTabBar ? TabBarHeight : 0) + Spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
});
