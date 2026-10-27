import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/brand/backdrop';
import { Text } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

import { StepProgress } from './step-progress';

type Props = {
  title?: string;
  subtitle?: ReactNode;
  hero?: ReactNode;
  children?: ReactNode;
  /** Pinned to the bottom (primary actions). */
  footer?: ReactNode;
  back?: boolean;
  /** e.g. { current: 2, total: 4 } for the sign-up journey. */
  step?: { current: number; total: number };
  backdrop?: 'default' | 'hero' | 'reward';
  center?: boolean;
};

export function AuthScreen({ title, subtitle, hero, children, footer, back = true, step, backdrop, center }: Props) {
  const { t } = useTranslation('auth');
  return (
    <View style={styles.fill}>
      <Backdrop variant={backdrop} />
      <SafeAreaView style={styles.fill}>
        <View style={styles.fill}>
          {(back || step) && (
            <View style={styles.topBar}>
              {back && router.canGoBack() ? (
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={t('actions.goBack', { ns: 'common' })}
                  style={styles.back}>
                  <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </Pressable>
              ) : (
                <View style={{ width: 40 }} />
              )}
              {step && (
                <View style={{ flex: 1 }}>
                  <StepProgress current={step.current} total={step.total} />
                </View>
              )}
              <View style={{ width: 40 }} />
            </View>
          )}

          <ScrollView
            contentContainerStyle={[styles.content, center && styles.centered]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {hero}
            {(title || subtitle) && (
              <View style={{ gap: Spacing.xs }}>
                {title && (
                  <Text variant="display" center={center}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text variant="body" color={Colors.textSecondary} center={center}>
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
            {children && (
              <View style={{ gap: Spacing.md }}>
                {children}
              </View>
            )}
          </ScrollView>

          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  centered: { justifyContent: 'center' },
  footer: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
