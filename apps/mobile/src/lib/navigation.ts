import { router, type Href } from 'expo-router';

/** Go back if there's somewhere to go; otherwise land somewhere sensible (deep links, reloads). */
export function goBack(fallback: Href = '/settings') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
