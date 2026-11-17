import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { RelatedLink } from '@/lib/tutor/types';

/** Only links into the app's own screens are opened, whatever a stored answer holds. */
const OPENS = /^\/(books\/summary|exams\/paper)\/[a-z0-9/-]+$/;

/** "From your Knowzone notes": the summaries and practice papers on what the tutor just answered. */
export function RelatedLinks({ items }: { items?: RelatedLink[] }) {
  const { t } = useTranslation('tutor');
  const links = (items ?? []).filter((r) => OPENS.test(r.link)).slice(0, 3);
  if (!links.length) return null;
  return (
    <View style={{ gap: 6 }}>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {t('related.title')}
      </Text>
      <View style={styles.chips}>
        {links.map((r) => (
          <Pressable
            key={r.link}
            onPress={() => router.push(r.link as Href)}
            accessibilityRole="link"
            accessibilityLabel={t('related.openLabel', { title: r.title })}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}>
            <Ionicons name={r.kind === 'question' ? 'reader' : 'document-text'} size={13} color={Colors.primary} />
            <Text variant="small" numberOfLines={1} style={styles.label}>
              {r.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    paddingVertical: 5,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    backgroundColor: Colors.primarySoft,
  },
  label: { fontSize: 12, flexShrink: 1 },
});
