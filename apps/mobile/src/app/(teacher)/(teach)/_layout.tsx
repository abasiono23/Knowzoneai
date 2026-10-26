import { router, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TabBar, type TabMeta } from '@/components/navigation/tab-bar';

export default function TeachTabs() {
  const { t } = useTranslation();
  const TABS: TabMeta = {
    dashboard: { label: t('tabs.dashboard'), icon: 'grid-outline', iconActive: 'grid' },
    classes: { label: t('tabs.classes'), icon: 'people-outline', iconActive: 'people' },
    materials: { label: t('tabs.aiStudio'), icon: 'sparkles-outline', iconActive: 'sparkles' },
    account: { label: t('tabs.account'), icon: 'person-circle-outline', iconActive: 'person-circle' },
  };
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <TabBar
          {...props}
          tabs={TABS}
          center={{ icon: 'add', label: t('tabs.newAssignment'), onPress: () => router.push('/assignment/new') }}
        />
      )}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="classes" />
      <Tabs.Screen name="materials" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
