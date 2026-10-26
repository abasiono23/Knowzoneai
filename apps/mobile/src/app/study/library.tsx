import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { MaterialCard } from '@/components/materials/material-card';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { ActionSheet, Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { folderLabel } from '@/lib/studio/labels';
import { useMaterials } from '@/lib/studio/store';
import type { Material } from '@/lib/studio/types';

// Labels live in the `study` namespace under library.sorts / library.filters.
const SORTS = ['recent', 'az', 'due'] as const;
type Sort = (typeof SORTS)[number];
const FILTERS = ['all', 'saved', 'offline', 'failed'] as const;
type Filter = (typeof FILTERS)[number];

/** Screen 85: every generated material, searchable, with folders, filters and sorting. */
export default function MyMaterialsScreen() {
  const { t } = useTranslation('study');
  const { materials, folders, retry, update } = useMaterials();
  const [q, setQ] = useState('');
  const [folder, setFolder] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [menu, setMenu] = useState<Material | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const due = (m: Material) =>
      (m.content?.flashcards ?? []).filter((c) => (m.cards[c.id]?.dueAt ?? 0) <= Date.now()).length;
    return materials
      .filter((m) => !folder || m.folder === folder)
      .filter(
        (m) =>
          filter === 'all' ||
          (filter === 'saved' && m.saved) ||
          (filter === 'offline' && m.offline) ||
          (filter === 'failed' && m.status === 'failed'),
      )
      .filter((m) => !needle || `${m.title} ${m.subject} ${m.tags.join(' ')}`.toLowerCase().includes(needle))
      .sort((a, b) =>
        sort === 'az' ? a.title.localeCompare(b.title) : sort === 'due' ? due(b) - due(a) : b.updatedAt - a.updatedAt,
      );
  }, [materials, q, folder, filter, sort]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('library.eyebrow', {
          count: materials.length,
          saved: materials.filter((m) => m.saved).length,
        })}
        title={t('library.title')}
        right={
          <Pressable
            onPress={() => router.push('/study/source')}
            accessibilityRole="button"
            accessibilityLabel={t('library.create')}
            style={styles.add}>
            <Ionicons name="add" size={22} color={Colors.textOnAccent} />
          </Pressable>
        }
      />

      {materials.length === 0 ? (
        <EmptyState
          icon="layers"
          title={t('library.emptyTitle')}
          body={t('library.emptyBody')}
          action={{ label: t('library.emptyAction'), onPress: () => router.push('/study/source') }}
        />
      ) : (
        <>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={t('library.searchPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              accessibilityLabel={t('library.searchA11y')}
            />
            <Pressable
              onPress={() => setSortOpen(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('library.sortA11y', { sort: t(`library.sorts.${sort}`) })}
              style={styles.sort}>
              <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
              <Text variant="small" color={Colors.primary}>
                {t(`library.sorts.${sort}`)}
              </Text>
            </Pressable>
          </View>

          {folders.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
              <ChoiceChip
                label={t('library.allFolders')}
                emoji="🗂️"
                selected={!folder}
                onPress={() => setFolder(null)}
              />
              {folders.map((f) => (
                <ChoiceChip
                  key={f}
                  label={t('library.folderChip', {
                    folder: folderLabel(f),
                    count: materials.filter((m) => m.folder === f).length,
                  })}
                  emoji="📁"
                  selected={folder === f}
                  onPress={() => setFolder(folder === f ? null : f)}
                />
              ))}
            </ScrollView>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
            {FILTERS.map((f) => (
              <ChoiceChip
                key={f}
                label={t(`library.filters.${f}`)}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </ScrollView>

          {list.length === 0 ? (
            <Text color={Colors.textSecondary} center>
              {t('library.noMatch')}
            </Text>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              {list.map((m) => (
                <MaterialCard key={m.id} m={m} onMore={() => setMenu(m)} />
              ))}
            </View>
          )}
          <Button
            variant="secondary"
            icon="add"
            title={t('library.create')}
            onPress={() => router.push('/study/source')}
          />
        </>
      )}

      <ActionSheet
        visible={!!menu}
        title={menu?.title}
        onClose={() => setMenu(null)}
        options={
          menu
            ? [
                ...(menu.status === 'failed'
                  ? [{ label: t('library.retry'), icon: 'refresh' as const, onPress: () => retry(menu.id) }]
                  : []),
                ...(menu.status === 'ready'
                  ? [
                      {
                        label: t('shared.renameOrganise'),
                        icon: 'create-outline' as const,
                        onPress: () => router.push(`/study/${menu.id}/edit`),
                      },
                      menu.saved
                        ? {
                            label: t('shared.removeFromLibrary'),
                            icon: 'bookmark' as const,
                            onPress: () => update(menu.id, { saved: false }),
                          }
                        : {
                            label: t('shared.saveToLibrary'),
                            icon: 'bookmark-outline' as const,
                            onPress: () => router.push(`/study/${menu.id}/save`),
                          },
                      {
                        label: t('shared.exportShare'),
                        icon: 'share-outline' as const,
                        onPress: () => router.push(`/study/${menu.id}/export`),
                      },
                    ]
                  : []),
                {
                  label: t('actions.delete', { ns: 'common' }),
                  icon: 'trash-outline' as const,
                  destructive: true,
                  onPress: () => router.push(`/study/${menu.id}/delete`),
                },
              ]
            : []
        }
      />
      <ActionSheet
        visible={sortOpen}
        title={t('library.sortBy')}
        onClose={() => setSortOpen(false)}
        options={SORTS.map((s) => ({
          label: t(`library.sorts.${s}`),
          icon: sort === s ? 'checkmark-circle' : 'ellipse-outline',
          onPress: () => setSort(s),
        }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { ...NoWebOutline, flex: 1, color: Colors.text, fontFamily: Fonts.regular, fontSize: 16, paddingVertical: 8 },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
