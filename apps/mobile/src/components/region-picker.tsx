import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextField } from '@/components/auth/text-field';
import { Flag } from '@/components/flag';
import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { OTHER_REGION, REGION_GROUPS, regionName, regionSummary } from '@/lib/region';

/** Compares names without accents or case, so "nigeria" finds "Nàìjíríà". */
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

/**
 * The study-region list (sign-up, onboarding and Settings): a search box, the countries in groups,
 * and "Other country". Each row says what that country gets: its exam practice, or honestly none.
 * The chosen country is also shown first, so a choice made for you (from the device) is in view.
 */
export function RegionList({ value, onSelect }: { value: string | null; onSelect: (code: string) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const q = fold(query.trim());
  const matches = (code: string) => !q || fold(regionName(code)).includes(q) || code.toLowerCase() === q;

  const row = (code: string, key = code) => {
    const on = code === value;
    const name = regionName(code);
    const summary = regionSummary(code);
    return (
      <Pressable
        key={key}
        onPress={() => onSelect(code)}
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        accessibilityLabel={`${name}. ${summary}`}
        style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && { opacity: 0.85 }]}>
        <Flag code={code} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{name}</Text>
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {summary}
          </Text>
        </View>
        <Ionicons
          name={on ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={on ? Colors.primary : Colors.textMuted}
        />
      </Pressable>
    );
  };

  const groups = REGION_GROUPS.map((g) => ({
    ...g,
    codes: g.codes.filter((c) => matches(c) && (q !== '' || c !== value)),
  })).filter((g) => g.codes.length);

  return (
    <View style={{ gap: Spacing.sm }} accessibilityRole="radiogroup">
      <TextField
        label={t('regions.search')}
        placeholder={t('regions.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      {/* The chosen country first, while nothing is being searched for. */}
      {q === '' && value && value !== OTHER_REGION && row(value, 'chosen')}
      {groups.map((g) => (
        <View key={g.id} style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.textMuted}>
            {t(`regions.groups.${g.id}`).toUpperCase()}
          </Text>
          {g.codes.map((c) => row(c))}
        </View>
      ))}
      {q !== '' && groups.length === 0 && (
        <Text variant="small" color={Colors.textSecondary}>
          {t('regions.noMatch')}
        </Text>
      )}
      {/* Always there, whatever was typed: nobody should be stuck without their country. */}
      {row(OTHER_REGION)}
    </View>
  );
}

/**
 * The "Country" field of the sign-up form: looks like the text fields beside it, and opens the
 * country list in a sheet. It is a button, not a text input, so no keyboard comes up for it.
 */
export function CountryField({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (code: string) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
        {t('regions.country')}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={value ? `${t('regions.country')}: ${regionName(value)}` : t('regions.choose')}
        style={({ pressed }) => [
          styles.field,
          !!error && { borderColor: Colors.danger },
          pressed && { opacity: 0.85 },
        ]}>
        {value && <Flag code={value} size={18} />}
        <Text style={{ flex: 1, fontSize: 16 }} color={value ? Colors.text : Colors.textMuted} numberOfLines={1}>
          {value ? regionName(value) : t('regions.choose')}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
      </Pressable>
      <Text variant="small" color={error ? Colors.danger : Colors.textMuted}>
        {error ?? t('regions.why')}
      </Text>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel={t('actions.close')} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={styles.sheetHead}>
            <Text variant="heading" style={{ flex: 1 }}>
              {t('regions.choose')}
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel={t('actions.close')}
              hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <RegionList
              value={value}
              onSelect={(code) => {
                onChange(code);
                setOpen(false);
              }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  rowOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    marginTop: 'auto',
    maxHeight: '86%',
    backgroundColor: Colors.backgroundDeep,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
