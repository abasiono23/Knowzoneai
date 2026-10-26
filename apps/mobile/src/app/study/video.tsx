import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { TextField } from '@/components/auth/text-field';
import { OptionsPanel } from '@/components/materials/options-panel';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { checkVideoUrl } from '@/lib/studio/generator';
import { useCreditGate } from '@/lib/billing/credits';
import { useMaterials } from '@/lib/studio/store';
import { DEFAULT_OPTIONS } from '@/lib/studio/types';

/** Screen 67: add a supported video link (YouTube for now). */
export default function VideoLinkScreen() {
  const { t } = useTranslation('study');
  const { create } = useMaterials();
  const canSpend = useCreditGate();
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const check = url.trim() ? checkVideoUrl(url) : null;

  const start = () => {
    if (!check?.ok) return;
    if (!canSpend(1, 'study pack')) return;
    const id = create({
      type: 'video',
      label: topic.trim() || 'YouTube video',
      topic: topic.trim() || undefined,
      url: url.trim(),
      title: topic.trim() || undefined,
      options,
    });
    router.replace(`/study/status/${id}`);
  };

  return (
    <AuthScreen
      hero={<HeroIcon icon="logo-youtube" colors={['#FF5A7A', '#B04CFF']} />}
      title={t('video.title')}
      subtitle={t('video.subtitle')}
      footer={
        <Button
          title={t('shared.createPack')}
          icon="sparkles"
          onPress={start}
          disabled={!check?.ok || topic.trim().length < 3}
        />
      }>
      <TextField
        label={t('video.linkLabel')}
        icon="link-outline"
        placeholder="https://www.youtube.com/watch?v=…"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
        error={check && !check.ok ? t(`errors.${check.reason}`) : null}
      />
      {check?.ok && (
        <Animated.View entering={FadeIn}>
          <Card style={styles.preview}>
            <View style={styles.thumb}>
              <Ionicons name="play" size={26} color={Colors.textOnAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('video.found')}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('video.foundMeta', { id: check.id })}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
          </Card>
        </Animated.View>
      )}
      <TextField
        label={t('video.aboutLabel')}
        icon="bulb-outline"
        placeholder={t('video.aboutPlaceholder')}
        value={topic}
        onChangeText={setTopic}
        hint={t('video.aboutHint')}
      />
      <Card style={styles.rules}>
        <Ionicons name="information-circle" size={18} color={Colors.info} />
        <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
          {t('video.rules')}
        </Text>
      </Card>
      <OptionsPanel value={options} onChange={setOptions} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  thumb: {
    width: 64,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: '#FF0033',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rules: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
