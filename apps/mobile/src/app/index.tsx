import { Redirect } from 'expo-router';

import { useSession } from '@/lib/session';

/** Root URL: send students into the app, everyone else to the welcome screen. */
export default function Index() {
  const { user, loading } = useSession();
  if (loading) return null;
  if (!user?.onboardingComplete) return <Redirect href="/welcome" />;
  if (user.restriction?.kind === 'suspended') return <Redirect href="/account-status" />;
  return <Redirect href={user.role === 'teacher' ? '/dashboard' : '/home'} />;
}
