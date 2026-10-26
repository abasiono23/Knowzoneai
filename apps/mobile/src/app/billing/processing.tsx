import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Screen, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { money } from '@/lib/billing/plans';
import { useSession } from '@/lib/session';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Screen 205: payment processing. Sends the order and routes to success, failed or pending. */
/** Where Flutterwave's payment page sends the learner back: this app's pending screen. */
const returnUrl = () =>
  Platform.OS === 'web'
    ? `${window.location.origin}/billing/pending?id={id}`
    : Linking.createURL('/billing/pending', { queryParams: { id: '{id}' } }).replace('%7Bid%7D', '{id}');

export default function PaymentProcessingScreen() {
  const { t } = useTranslation('billing');
  const c = useCheckout();
  const { setUser } = useSession();
  const [step, setStep] = useState(0);
  const started = useRef(false);
  const spin = useSharedValue(0);

  const steps =
    c.method?.type === 'card'
      ? [t('processing.steps.cardOpen'), t('processing.steps.bank'), t('processing.steps.activating')]
      : c.method?.type === 'store'
        ? [t('processing.steps.storeOpen'), t('processing.steps.storeConfirm'), t('processing.steps.activating')]
        : [t('processing.steps.creating'), t('processing.steps.almost')];

  useEffect(() => {
    spin.set(withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1));
  }, [spin]);

  useEffect(() => {
    // Effects can run twice in development; never send the payment twice.
    if (started.current || !c.method) return;
    started.current = true;
    const method = c.method;
    (async () => {
      try {
        const request = api.checkout({
          plan: c.plan,
          period: c.period,
          currency: c.currency,
          method,
          promo: c.promo?.code,
          outcome: c.outcome,
          // Payments on Flutterwave's page come back here.
          redirectUrl: returnUrl(),
        });
        await wait(900);
        setStep(1);
        const [{ payment, user }] = await Promise.all([request, wait(1100)]);
        setUser(user);
        // Real payments continue on Flutterwave's secure page (cards always; transfer and USSD when their
        // details couldn't be made in the app). Card details never touch Knowzone.
        if (payment.status === 'pending' && payment.checkoutUrl && !payment.transfer && !payment.ussd) {
          if (Platform.OS === 'web') {
            window.location.assign(payment.checkoutUrl);
            return;
          }
          await WebBrowser.openAuthSessionAsync(payment.checkoutUrl, returnUrl().replace('{id}', payment.id));
          router.replace({ pathname: '/billing/pending', params: { id: payment.id } });
          return;
        }
        if (payment.status === 'paid') {
          setStep(2);
          await wait(600);
          router.replace({ pathname: '/billing/success', params: { id: payment.id } });
        } else if (payment.status === 'pending') {
          router.replace({ pathname: '/billing/pending', params: { id: payment.id } });
        } else {
          router.replace({ pathname: '/billing/failed', params: { id: payment.id } });
        }
      } catch (e) {
        router.replace({
          pathname: '/billing/failed',
          params: { message: errorText(e, t('processing.unreachable')) },
        });
      }
    })();
  }, [c.currency, c.method, c.outcome, c.period, c.plan, c.promo?.code, setUser, t]);

  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get() * 360}deg` }] }));

  if (!c.method)
    return (
      <Screen withTabBar={false}>
        <Text variant="body" center>
          {t('processing.chooseFirst')}
        </Text>
      </Screen>
    );

  return (
    <Screen withTabBar={false} scroll={false}>
      <View style={styles.center}>
        <View style={styles.spinner}>
          <Animated.View style={[StyleSheet.absoluteFill, ring]}>
            <LinearGradient colors={Gradients.aiGlow} style={styles.ring} />
          </Animated.View>
          <View style={styles.inner}>
            <Ionicons name="lock-closed" size={32} color={Colors.text} />
          </View>
        </View>
        <Text variant="title" center>
          {t('processing.title', { amount: money(c.total, c.currency) })}
        </Text>
        <Text variant="body" color={Colors.textSecondary} center>
          {t('processing.body')}
        </Text>
        <View style={{ gap: Spacing.sm, alignSelf: 'stretch', paddingHorizontal: Spacing.lg }}>
          {steps.map((s, i) => (
            <View key={s} style={styles.step}>
              <Ionicons
                name={i < step ? 'checkmark-circle' : i === step ? 'ellipse' : 'ellipse-outline'}
                size={18}
                color={i < step ? Colors.success : i === step ? Colors.primary : Colors.textMuted}
              />
              <Text variant="small" color={i <= step ? Colors.text : Colors.textMuted}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  spinner: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  ring: { flex: 1, borderRadius: 60 },
  inner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
