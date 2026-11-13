import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { ProcessingView } from '@/components/billing/processing-view';
import { StorePurchase } from '@/components/billing/store-purchase';
import { Screen, Text } from '@/components/ui';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import { money } from '@/lib/billing/plans';
import { STORE_PURCHASES, STORE_UI } from '@/lib/billing/store';
import { useSession } from '@/lib/session';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Where Flutterwave's payment page sends the learner back: this app's pending screen. */
const returnUrl = () =>
  Platform.OS === 'web'
    ? `${window.location.origin}/billing/pending?id={id}`
    : Linking.createURL('/billing/pending', { queryParams: { id: '{id}' } }).replace('%7Bid%7D', '{id}');

/**
 * Screen 205: payment processing. On Android the plan is bought through Google Play; everywhere else
 * the order goes to the server (Flutterwave) and the screen routes to success, failed or pending.
 */
export default function PaymentProcessingScreen() {
  // Fixed for the life of the app, so each platform always renders the same component.
  return STORE_UI && STORE_PURCHASES ? <StorePurchase /> : <ServerPayment />;
}

function ServerPayment() {
  const { t } = useTranslation('billing');
  const c = useCheckout();
  const { setUser } = useSession();
  const [step, setStep] = useState(0);
  const started = useRef(false);

  const steps =
    c.method?.type === 'card'
      ? [t('processing.steps.cardOpen'), t('processing.steps.bank'), t('processing.steps.activating')]
      : c.method?.type === 'store'
        ? [t('processing.steps.storeOpen'), t('processing.steps.storeConfirm'), t('processing.steps.activating')]
        : [t('processing.steps.creating'), t('processing.steps.almost')];

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

  if (!c.method)
    return (
      <Screen withTabBar={false}>
        <Text variant="body" center>
          {t('processing.chooseFirst')}
        </Text>
      </Screen>
    );

  return (
    <ProcessingView
      title={t('processing.title', { amount: money(c.total, c.currency) })}
      body={t('processing.body')}
      steps={steps}
      step={step}
    />
  );
}
