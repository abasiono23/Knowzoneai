import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResultHero } from '@/components/billing/billing-ui';
import { ProcessingView } from '@/components/billing/processing-view';
import { Button, Screen } from '@/components/ui';
import { Gradients } from '@/constants/theme';
import { api } from '@/lib/api';
import { useCheckout } from '@/lib/billing/checkout';
import {
  STORE_NAME,
  StoreError,
  buyPlan,
  finishPurchase,
  ownedPurchases,
  type StorePurchase as Purchase,
} from '@/lib/billing/store';
import { goBack } from '@/lib/navigation';
import { useSession } from '@/lib/session';

type Phase =
  | { kind: 'working'; step: number }
  /** The store is waiting for the money; the server unlocks the plan when Google says it arrived. */
  | { kind: 'pending' }
  /** Paid in the store, but the server couldn't be reached to confirm it. Trying again never charges twice. */
  | { kind: 'unconfirmed' }
  | { kind: 'error'; message: string };

/**
 * Buying a plan through the phone's app store (Google Play on Android), in place of the Flutterwave
 * processing screen: opens the store's payment sheet, sends the purchase to the server, and shows
 * success only once the server has confirmed it with the store.
 */
export function StorePurchase() {
  const { t } = useTranslation('billing');
  const c = useCheckout();
  const { user, setUser } = useSession();
  const [phase, setPhase] = useState<Phase>({ kind: 'working', step: 0 });
  const started = useRef(false);
  const bought = useRef<Purchase | null>(null);
  const store = STORE_NAME;
  const userId = user?.id;
  const { plan, period } = c;

  /** Asks the server to check the purchase with the store and unlock the plan. */
  const confirm = async (purchase: Purchase) => {
    bought.current = purchase;
    setPhase({ kind: 'working', step: 1 });
    try {
      const r = await api.verifyGooglePurchase({
        purchaseToken: purchase.purchaseToken,
        productId: purchase.productId,
        packageName: purchase.packageName,
      });
      setUser(r.user);
      if (r.status === 'pending') return setPhase({ kind: 'pending' });
      if (r.status !== 'active') return setPhase({ kind: 'error', message: t('store.errors.inactive', { store }) });
      // The server normally tells the store the purchase was delivered; if it couldn't, the app does.
      if (!r.acknowledged) await finishPurchase(purchase);
      setPhase({ kind: 'working', step: 2 });
      if (r.payment) router.replace({ pathname: '/billing/success', params: { id: r.payment.id } });
      else router.replace('/billing/manage');
    } catch (e) {
      const reason = (e as { reason?: string } | null)?.reason ?? '';
      if (reason === 'store-other-account')
        setPhase({ kind: 'error', message: t('store.errors.otherAccount', { store }) });
      else if (reason.startsWith('store-')) setPhase({ kind: 'error', message: t('store.errors.failed', { store }) });
      // Offline, or the server can't reach the store right now: the purchase is safe, so offer to try again.
      else setPhase({ kind: 'unconfirmed' });
    }
  };

  const buy = async () => {
    if (!userId) return;
    setPhase({ kind: 'working', step: 0 });
    try {
      const r = await buyPlan({ plan, period, userId });
      if (r.kind === 'cancelled') return goBack('/billing/checkout');
      if (r.kind === 'pending') return setPhase({ kind: 'pending' });
      // The store account already has this plan (bought on another phone, or before reinstalling): restore it.
      const purchase = r.kind === 'owned' ? (await ownedPurchases())[0] : r.purchase;
      if (!purchase) throw new StoreError('failed');
      await confirm(purchase);
    } catch (e) {
      setPhase({ kind: 'error', message: t(`store.errors.${e instanceof StoreError ? e.code : 'failed'}`, { store }) });
    }
  };

  const begin = useRef(buy);
  useEffect(() => {
    begin.current = buy;
  });
  useEffect(() => {
    // Effects can run twice in development; never open the payment sheet twice.
    if (started.current || !userId) return;
    started.current = true;
    begin.current();
  }, [userId]);

  if (phase.kind === 'working')
    return (
      <ProcessingView
        title={t('processing.title', { amount: c.priceText(plan, period) })}
        body={t('processing.body')}
        steps={[t('processing.steps.storeOpen'), t('processing.steps.storeConfirm'), t('processing.steps.activating')]}
        step={phase.step}
      />
    );

  if (phase.kind === 'pending')
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="time"
          colors={Gradients.reward}
          title={t('store.pendingTitle', { store })}
          body={t('store.pendingBody', { store })}
        />
        <Button title={t('actions.done', { ns: 'common' })} onPress={() => router.dismissTo('/billing/manage')} />
      </Screen>
    );

  if (phase.kind === 'unconfirmed')
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="cloud-offline"
          colors={Gradients.ai}
          title={t('store.unconfirmedTitle')}
          body={t('store.unconfirmedBody', { store })}
        />
        <Button
          title={t('actions.retry', { ns: 'common' })}
          icon="refresh"
          onPress={() => (bought.current ? confirm(bought.current) : buy())}
        />
        <Button
          variant="ghost"
          title={t('actions.contactSupport')}
          onPress={() => router.push({ pathname: '/billing/support', params: { topic: 'not-activated' } })}
        />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ResultHero icon="close" colors={Gradients.streak} title={t('failed.title')} body={phase.message} />
      <Button title={t('actions.retry', { ns: 'common' })} icon="refresh" onPress={buy} />
      <Button
        variant="secondary"
        title={t('actions.goBack', { ns: 'common' })}
        onPress={() => goBack('/billing/checkout')}
      />
      <Button variant="ghost" title={t('actions.contactSupport')} onPress={() => router.push('/billing/support')} />
    </Screen>
  );
}
