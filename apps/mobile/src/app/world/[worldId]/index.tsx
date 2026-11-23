import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

/** A world's page is its level ladder (/world/<id>/levels); this older address leads there. */
export default function WorldDetailScreen() {
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  return <Redirect href={`/world/${worldId}/levels` as Href} />;
}
