import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { useEffect } from 'react';

import { forgetReturnTo, returnTo } from '@/lib/return-to';
import { useSession } from '@/lib/session';

/**
 * Root URL: send students into the app, everyone else to the welcome screen. Signing in and finishing
 * set-up both end here, so a visitor who came from a link (a paper on the public study pages) goes on to
 * that page rather than Home.
 */
export default function Index() {
  const { user, loading } = useSession();
  const inApp = !loading && !!user?.onboardingComplete && user.restriction?.kind !== 'suspended';
  // Read while drawing (React may draw twice), forgotten once the student is on their way.
  const back = inApp ? returnTo() : null;
  useEffect(() => {
    if (back) forgetReturnTo();
  }, [back]);
  if (loading) return null;
  if (!user?.onboardingComplete) return <Redirect href="/welcome" />;
  if (user.restriction?.kind === 'suspended') return <Redirect href="/account-status" />;
  if (back) return <Redirect href={back as Href} />;
  return <Redirect href={user.role === 'teacher' ? '/dashboard' : '/home'} />;
}
