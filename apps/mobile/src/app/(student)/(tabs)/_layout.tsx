import { router, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabBar, type TabMeta } from '@/components/navigation/tab-bar';

export default function TabLayout() {
  const { t } = useTranslation();
  const TABS: TabMeta = {
    home: { label: t('tabs.home'), icon: 'home-outline', iconActive: 'home' },
    explore: { label: t('tabs.explore'), icon: 'compass-outline', iconActive: 'compass' },
    play: { label: t('tabs.play'), icon: 'planet-outline', iconActive: 'planet' },
    profile: { label: t('tabs.profile'), icon: 'person-circle-outline', iconActive: 'person-circle' },
  };
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <TabBar
          {...props}
          tabs={TABS}
          center={{ icon: 'add', label: t('tabs.create'), onPress: () => router.push('/create') }}
        />
      )}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      {/* AI Studio has no tab of its own; it opens from the Create menu. */}
      <Tabs.Screen name="studio" />
      <Tabs.Screen name="play" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
