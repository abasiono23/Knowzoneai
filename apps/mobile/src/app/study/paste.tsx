import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { OptionsPanel } from '@/components/materials/options-panel';
import { Button, ProgressBar, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { suggestTitle } from '@/lib/studio/generator';
import { useCreditGate } from '@/lib/billing/credits';
import { useMaterials } from '@/lib/studio/store';
import { DEFAULT_OPTIONS } from '@/lib/studio/types';

const MIN_WORDS = 60;
const MAX_WORDS = 15_000;

/** Screen 65: paste text. */
export default function PasteTextScreen() {
  const { t } = useTranslation('study');
  const { create } = useMaterials();
  const canSpend = useCreditGate();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ok = words >= MIN_WORDS && words <= MAX_WORDS;

  const start = () => {
    if (!canSpend(1, 'study pack')) return;
    const id = create({ type: 'text', label: 'Pasted text', text, title: title || suggestTitle({ text }), options });
    router.replace(`/study/status/${id}`);
  };

  return (
    <AuthScreen
      title={t('paste.title')}
      subtitle={t('paste.subtitle')}
      footer={<Button title={t('shared.createPack')} icon="sparkles" onPress={start} disabled={!ok} />}>
      <TextField
        label={t('paste.titleLabel')}
        icon="text-outline"
        placeholder={text ? suggestTitle({ text }) : t('paste.titlePlaceholder')}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t('paste.textPlaceholder')}
        placeholderTextColor={Colors.textMuted}
        style={styles.area}
        textAlignVertical="top"
        accessibilityLabel={t('paste.textA11y')}
      />
      <View style={{ gap: 6 }}>
        <ProgressBar progress={Math.min(1, words / MIN_WORDS)} height={4} />
        <Text
          variant="small"
          color={words > MAX_WORDS ? Colors.danger : words >= MIN_WORDS ? Colors.success : Colors.textMuted}>
          {words > MAX_WORDS
            ? t('paste.overLimit', { words: formatNumber(words), limit: formatNumber(MAX_WORDS) })
            : words >= MIN_WORDS
              ? t('paste.ready', {
                  words: formatNumber(words),
                  minutes: formatNumber(Math.max(1, Math.round(words / 200))),
                })
              : t('paste.tooFew', { words: formatNumber(words), min: formatNumber(MIN_WORDS) })}
        </Text>
      </View>
      <OptionsPanel value={options} onChange={setOptions} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  area: {
    ...NoWebOutline,
    minHeight: 240,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    padding: Spacing.md,
  },
});
