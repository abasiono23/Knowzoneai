import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TicketRow } from '@/components/help/help-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useTickets } from '@/lib/help/use-tickets';

/** Your requests: support tickets, bug reports, feedback, safety reports and appeals (opens screen 222). */
export default function TicketsScreen() {
  const { t } = useTranslation('help');
  const { tickets, error } = useTickets();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [now] = useState(() => Date.now());
  const list = (tickets ?? []).filter(
    (x) => filter === 'all' || (filter === 'open' ? x.status !== 'resolved' : x.status === 'resolved'),
  );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('ui.eyebrow')} title={t('tickets.title')} />
      <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <Chip key={f} label={t(`tickets.filters.${f}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {error && <Text color={Colors.danger}>{error}</Text>}
      {tickets && list.length === 0 && (
        <Card style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
          <Ionicons name="file-tray-outline" size={34} color={Colors.textMuted} />
          <Text variant="heading">{t('tickets.emptyTitle')}</Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t('tickets.emptyBody')}
          </Text>
          <Button title={t('ui.contactSupport')} onPress={() => router.push('/help/contact')} />
        </Card>
      )}
      {list.map((x) => (
        <TicketRow key={x.id} ticket={x} now={now} />
      ))}
    </Screen>
  );
}
