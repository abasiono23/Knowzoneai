import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing, NoWebOutline } from '@/constants/theme';

type Props = {
  value: string;
  onChangeText: (q: string) => void;
  onSubmit: (q: string) => void;
};

export function SearchBar({ value, onChangeText, onSubmit }: Props) {
  const { t } = useTranslation('home');
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t('actions.goBack', { ns: 'common' })}
        style={styles.back}>
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
      </Pressable>
      <View style={styles.box}>
        <Ionicons name="search" size={20} color={Colors.primary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={() => value.trim() && onSubmit(value.trim())}
          placeholder={t('search.placeholder')}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={t('actions.search', { ns: 'common' })}
          style={styles.input}
        />
        {!!value && (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('search.clear')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  back: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceRaised,
  },
  input: {
    flex: 1,
    color: Colors.text,
    ...NoWebOutline,
    fontFamily: Fonts.regular,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
});
