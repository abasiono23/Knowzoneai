import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LANGUAGES, type LanguageId } from '@/i18n';
import { useLanguage } from '@/i18n/provider';

/** One row per language: native name, English name, beta badge and a tick on the current one. */
export function LanguageList({ value, onSelect }: { value: LanguageId; onSelect: (lang: LanguageId) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {LANGUAGES.map((l) => {
        const on = l.id === value;
        return (
          <Pressable
            key={l.id}
            onPress={() => onSelect(l.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={l.native === l.english ? l.native : `${l.native}, ${l.english}`}
            style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && { opacity: 0.85 }]}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{l.native}</Text>
              {l.native !== l.english && (
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {l.english}
                </Text>
              )}
            </View>
            {l.beta && (
              <View style={styles.badge}>
                <Text variant="label" color={Colors.textSecondary} style={{ fontSize: 10 }}>
                  {t('status.beta')}
                </Text>
              </View>
            )}
            <Ionicons
              name={on ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={on ? Colors.primary : Colors.textMuted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Globe button that opens the language list; used before sign-in (welcome, sign-in screens). */
export function LanguageButton() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = LANGUAGES.find((l) => l.id === language);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('language.choose')}
        hitSlop={8}
        style={styles.button}>
        <Ionicons name="globe-outline" size={16} color={Colors.text} />
        <Text variant="small" style={{ fontSize: 13 }}>
          {current?.native}
        </Text>
        <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel={t('actions.close')} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Text variant="heading" center>
            {t('language.choose')}
          </Text>
          <Text variant="small" color={Colors.textSecondary} center>
            {t('language.hint')}
          </Text>
          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            <LanguageList
              value={language}
              onSelect={(l) => {
                setOpen(false);
                changeLanguage(l);
              }}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.xs },
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
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: Colors.surfaceRaised },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.backgroundDeep,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
});
