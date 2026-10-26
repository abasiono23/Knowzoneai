import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';

/** Section title + horizontally scrolling row of cards. */
export function Rail({ title, onSeeAll, children }: { title: string; onSeeAll?: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: Spacing.sm }}>
      <SectionHeader title={title} action={onSeeAll ? t('actions.seeAll') : undefined} onAction={onSeeAll} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
        style={{ marginRight: -Spacing.md }}>
        {children}
      </ScrollView>
    </View>
  );
}
