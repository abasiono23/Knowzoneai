import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { SearchField, TicketRow } from '@/components/help/help-ui';
import { SettingsLink, SettingsSection } from '@/components/settings/rows';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { FAQ_ENTRIES, HELP_CATEGORIES, localizeFaqs } from '@/lib/help/articles';
import { useTickets } from '@/lib/help/use-tickets';
import { useSession } from '@/lib/session';

type Icon = keyof typeof Ionicons.glyphMap;

/** Screen 219: help centre. Search, topics, popular questions, your requests and ways to reach us. */
export default function HelpCentreScreen() {
  const { user } = useSession();
  const { t } = useTranslation('help');
  const { tickets } = useTickets();
  const [q, setQ] = useState('');
  const [now] = useState(() => Date.now());
  const role = user?.role ?? 'learner';
  const suspended = user?.restriction?.kind === 'suspended';
  const categories = HELP_CATEGORIES.filter((c) => !c.audience || c.audience === role);
  const popular = localizeFaqs(
    t,
    FAQ_ENTRIES.filter((f) => f.popular && categories.some((c) => c.id === f.category)).slice(0, 5),
  );
  const active = (tickets ?? []).filter((t) => t.status !== 'resolved');
  const go = (href: Href) => () => router.push(href);

  const actions: { key: 'contact' | 'bug' | 'feedback' | 'report'; icon: Icon; href: Href; color: string }[] = [
    { key: 'contact', icon: 'chatbubbles', href: '/help/contact', color: Colors.primary },
    { key: 'bug', icon: 'bug', href: '/help/bug', color: Colors.info },
    { key: 'feedback', icon: 'bulb', href: '/help/feedback', color: Colors.reward },
    { key: 'report', icon: 'flag', href: '/help/report', color: Colors.danger },
  ];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('centre.eyebrow')} title={t('centre.title')} />
      <LinearGradient colors={Gradients.aiGlow} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text variant="title">
          {user?.name ? t('centre.greeting', { name: user.name.split(' ')[0] }) : t('centre.greetingAnonymous')}
        </Text>
        <SearchField
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => q.trim() && router.push({ pathname: '/help/faq', params: { q: q.trim() } })}
        />
      </LinearGradient>

      {active.length > 0 && (
        <View style={{ gap: Spacing.xs }}>
          <View style={styles.between}>
            <Text variant="heading">{t('centre.openRequests')}</Text>
            <Text variant="small" color={Colors.primary} onPress={go('/help/tickets')}>
              {t('actions.seeAll', { ns: 'common' })}
            </Text>
          </View>
          {active.slice(0, 2).map((t) => (
            <TicketRow key={t.id} ticket={t} now={now} />
          ))}
        </View>
      )}

      <View style={styles.grid}>
        {actions
          .filter((a) => !suspended || a.href === '/help/contact')
          .map((a) => (
            <Pressable
              key={a.key}
              onPress={go(a.href)}
              accessibilityRole="button"
              accessibilityLabel={t(`centre.actions.${a.key}.title`)}
              style={styles.tile}>
              {({ pressed }) => (
                <Card style={[styles.tileCard, pressed && { opacity: 0.85 }]}>
                  <View style={[styles.tileIcon, { backgroundColor: a.color + '22' }]}>
                    <Ionicons name={a.icon} size={20} color={a.color} />
                  </View>
                  <Text variant="bodyStrong" style={{ fontSize: 15 }}>
                    {t(`centre.actions.${a.key}.title`)}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {t(`centre.actions.${a.key}.body`)}
                  </Text>
                </Card>
              )}
            </Pressable>
          ))}
      </View>

      <Text variant="heading">{t('centre.browse')}</Text>
      <View style={styles.topics}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/help/faq', params: { category: c.id } })}
            accessibilityRole="button"
            accessibilityLabel={t(`faq.categories.${c.id}`)}
            style={({ pressed }) => [styles.topic, pressed && { opacity: 0.8 }]}>
            <Ionicons name={c.icon} size={18} color={c.color} />
            <Text variant="small" style={{ flex: 1 }} numberOfLines={2}>
              {t(`faq.categories.${c.id}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: Spacing.xs }}>
        <View style={styles.between}>
          <Text variant="heading">{t('centre.popular')}</Text>
          <Text variant="small" color={Colors.primary} onPress={go('/help/faq')}>
            {t('centre.allFaqs')}
          </Text>
        </View>
        <Card style={{ padding: 0 }}>
          {popular.map((f, i) => (
            <Pressable
              key={f.id}
              onPress={() => router.push({ pathname: '/help/faq', params: { open: f.id } })}
              accessibilityRole="button"
              style={[styles.faq, i < popular.length - 1 && styles.divider]}>
              <Ionicons name="help-circle-outline" size={18} color={Colors.primary} />
              <Text variant="small" style={{ flex: 1 }}>
                {f.q}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          ))}
        </Card>
      </View>

      <SettingsSection title={t('centre.safetyLegal')}>
        <SettingsLink
          icon="people-outline"
          label={t('centre.links.guidelines')}
          onPress={go('/legal/guidelines')}
          color={Colors.success}
        />
        {!suspended && (
          <SettingsLink
            icon="ban-outline"
            label={t('centre.links.blocked')}
            onPress={go('/help/blocked')}
            color={Colors.success}
          />
        )}
        <SettingsLink
          icon="sparkles-outline"
          label={t('centre.links.ai')}
          onPress={go('/legal/ai')}
          color={Colors.success}
        />
        <SettingsLink
          icon="document-text-outline"
          label={t('centre.links.terms')}
          onPress={go('/legal/terms')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="lock-closed-outline"
          label={t('centre.links.privacy')}
          onPress={go('/legal/privacy')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="copy-outline"
          label={t('centre.links.copyright')}
          onPress={go('/legal/copyright')}
          color={Colors.textSecondary}
          last
        />
      </SettingsSection>
      {!!tickets?.length && (
        <Text variant="small" color={Colors.primary} center onPress={go('/help/tickets')}>
          {t('centre.viewAll', { count: tickets.length })}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: { width: '48%', flexGrow: 1 },
  tileCard: { gap: 6, minHeight: 116 },
  tileIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  topic: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    minHeight: 56,
  },
  faq: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
});
