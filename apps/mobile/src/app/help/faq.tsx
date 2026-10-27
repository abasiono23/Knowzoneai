import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SearchField } from '@/components/help/help-ui';
import { Button, Card, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { HELP_CATEGORIES, localizeFaqs, searchFaqs, type HelpCategoryId } from '@/lib/help/articles';
import { useSession } from '@/lib/session';

/** Screen 220: frequently asked questions, searchable and grouped by topic. */
export default function FaqScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: HelpCategoryId; open?: string }>();
  const { user } = useSession();
  const { t } = useTranslation('help');
  // Articles in the current language, so search matches what's on screen.
  const faqs = localizeFaqs(t);
  const role = user?.role ?? 'learner';
  const categories = HELP_CATEGORIES.filter((c) => !c.audience || c.audience === role);
  const openFaq = params.open ? faqs.find((f) => f.id === params.open) : undefined;
  const [q, setQ] = useState(params.q ?? '');
  const [category, setCategory] = useState<HelpCategoryId | null>(params.category ?? openFaq?.category ?? null);
  const [open, setOpen] = useState<string | null>(params.open ?? null);
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});

  const visible = faqs.filter((f) => categories.some((c) => c.id === f.category));
  const list = q.trim() ? searchFaqs(q, visible) : visible.filter((f) => !category || f.category === category);
  const groups = q.trim()
    ? [{ id: 'results', title: t('faq.results', { count: list.length }), items: list }]
    : categories
        .filter((c) => !category || c.id === category)
        .map((c) => ({ id: c.id, title: t(`faq.categories.${c.id}`), items: list.filter((f) => f.category === c.id) }))
        .filter((g) => g.items.length);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('ui.eyebrow')} title={t('faq.title')} />
      <SearchField value={q} onChangeText={setQ} />
      {!q.trim() && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={t('faq.all')} selected={!category} onPress={() => setCategory(null)} />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={t(`faq.categories.${c.id}`)}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </ScrollView>
      )}

      {groups.map((g) => (
        <View key={g.id} style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {g.title.toUpperCase()}
          </Text>
          {g.items.map((f) => {
            const isOpen = open === f.id;
            return (
              <Card key={f.id} style={[{ padding: 0 }, isOpen && { borderColor: Colors.primary + '66' }]}>
                <Pressable
                  onPress={() => setOpen(isOpen ? null : f.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  accessibilityLabel={f.q}
                  style={styles.q}>
                  <Text variant="bodyStrong" style={{ flex: 1, fontSize: 15 }}>
                    {f.q}
                  </Text>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
                </Pressable>
                {isOpen && (
                  <View style={styles.a}>
                    <Text variant="small" color={Colors.textSecondary} style={{ lineHeight: 21 }}>
                      {f.a}
                    </Text>
                    {helpful[f.id] === undefined ? (
                      <View style={styles.helpful}>
                        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12, flex: 1 }}>
                          {t('faq.helpfulQuestion')}
                        </Text>
                        <Chip
                          label={t('actions.yes', { ns: 'common' })}
                          onPress={() => setHelpful({ ...helpful, [f.id]: true })}
                        />
                        <Chip
                          label={t('actions.no', { ns: 'common' })}
                          onPress={() => setHelpful({ ...helpful, [f.id]: false })}
                        />
                      </View>
                    ) : helpful[f.id] ? (
                      <Text variant="small" color={Colors.success} style={{ fontSize: 12 }}>
                        {t('faq.gladItHelped')}
                      </Text>
                    ) : (
                      <Text
                        variant="small"
                        color={Colors.primary}
                        style={{ fontSize: 13 }}
                        onPress={() => router.push({ pathname: '/help/contact', params: { subject: f.q } })}>
                        {t('faq.askTeam')}
                      </Text>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      ))}

      {groups.length === 0 && (
        <Card style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
          <Ionicons name="search" size={32} color={Colors.textMuted} />
          <Text variant="heading">{t('faq.noResultsTitle', { query: q })}</Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t('faq.noResultsBody')}
          </Text>
        </Card>
      )}

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="bodyStrong">{t('faq.stillNeedHelp')}</Text>
        <Button title={t('ui.contactSupport')} icon="chatbubbles" onPress={() => router.push('/help/contact')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: Spacing.xs, paddingRight: Spacing.md },
  q: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, minHeight: 52 },
  a: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  helpful: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
