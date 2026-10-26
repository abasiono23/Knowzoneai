import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { GeneratedRoute } from '@/components/videos/generated-route';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { useCreditGate } from '@/lib/billing/credits';
import { useSession } from '@/lib/session';
import { LENGTHS, lengthLabel, STYLES, styleName, voiceName, VOICES } from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';
import type { GeneratedVideo, Scene, VideoSettings } from '@/lib/videos/types';

/**
 * Screen 106: regenerate or adjust. Style, captions and script edits apply instantly;
 * changing length or voice regenerates (narration has to be re-recorded).
 */
export default function AdjustScreen() {
  return <GeneratedRoute allowUnfinished>{(v) => <Adjust v={v} />}</GeneratedRoute>;
}

function Adjust({ v }: { v: GeneratedVideo }) {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { regenerate, updateScenes } = useVideos();
  const canSpend = useCreditGate();
  const { user } = useSession();
  const { t } = useTranslation('videos');
  const [tab, setTab] = useState<'settings' | 'script'>('settings');
  const [s, setS] = useState<VideoSettings>(v.settings);
  const [scenes, setScenes] = useState<Scene[]>(v.scenes);
  const needsRegen =
    s.length !== v.settings.length || s.voiceId !== v.settings.voiceId || v.status !== 'ready' || mode === 'regenerate';
  const scriptChanged = scenes.some((x, i) => x.caption !== v.scenes[i]?.caption || x.heading !== v.scenes[i]?.heading);
  const changed = needsRegen || scriptChanged || JSON.stringify(s) !== JSON.stringify(v.settings);

  const apply = () => {
    if (needsRegen) {
      if (!canSpend(1, 'video')) return;
      regenerate(v.id, s);
      router.replace(`/videos/generate/${v.id}`);
      return;
    }
    // Style, captions and script edits don't need the narration re-recorded.
    updateScenes(v.id, scenes, s);
    router.replace(`/videos/mine/${v.id}/preview`);
  };

  return (
    <AuthScreen
      title={mode === 'regenerate' ? t('adjust.regenerateTitle') : t('adjust.adjustTitle')}
      subtitle={v.title}
      footer={
        <>
          <Text variant="small" color={Colors.textMuted} center>
            {needsRegen ? t('adjust.regenNote') : t('adjust.instantNote')}
          </Text>
          <Button
            title={needsRegen ? t('adjust.regenerate') : t('adjust.apply')}
            icon={needsRegen ? 'refresh' : 'checkmark'}
            disabled={!changed}
            onPress={apply}
          />
        </>
      }>
      {v.status === 'ready' && (
        <View style={styles.tabs}>
          {(['settings', 'script'] as const).map((id) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === id }}
              accessibilityLabel={t(`adjust.${id}`)}
              style={[styles.tab, tab === id && styles.tabOn]}>
              <Text variant="small" color={tab === id ? Colors.text : Colors.textSecondary}>
                {t(`adjust.${id}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {tab === 'settings' ? (
        <>
          <Text variant="heading">{t('adjust.length')}</Text>
          <ChipWrap>
            {LENGTHS.map((l) => (
              <ChoiceChip
                key={l.id}
                label={lengthLabel(l.id, t)}
                selected={s.length === l.id}
                onPress={() =>
                  user?.plan === 'FREE' && (l.id === '3m' || l.id === '5m')
                    ? router.push({ pathname: '/billing/upgrade', params: { reason: 'video-length' } })
                    : setS({ ...s, length: l.id })
                }
              />
            ))}
          </ChipWrap>
          <Text variant="heading">{t('adjust.voice')}</Text>
          <ChipWrap>
            {[...VOICES.map((x) => x.id as string), 'none']
              .map((id) => ({ id, name: voiceName(id, t) }))
              .map((x) => (
                <ChoiceChip
                  key={x.id}
                  label={x.name}
                  selected={s.voiceId === x.id}
                  onPress={() =>
                    setS({
                      ...s,
                      voiceId: x.id,
                      captions: x.id === 'none' ? true : s.captions,
                    })
                  }
                />
              ))}
          </ChipWrap>
          <Text variant="heading">{t('adjust.style')}</Text>
          <ChipWrap>
            {STYLES.map((x) => (
              <ChoiceChip
                key={x.id}
                label={styleName(x.id, t)}
                selected={s.styleId === x.id}
                onPress={() => setS({ ...s, styleId: x.id })}
              />
            ))}
          </ChipWrap>
          <Card>
            <ToggleRow
              icon="chatbox-ellipses"
              label={t('adjust.captions')}
              value={s.captions}
              disabled={s.voiceId === 'none'}
              onChange={(captions) => setS({ ...s, captions })}
            />
          </Card>
        </>
      ) : (
        <>
          <Text variant="small" color={Colors.textSecondary}>
            {t('adjust.scriptHint')}
          </Text>
          {scenes.map((sc, i) => (
            <Card key={sc.id} style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.textMuted}>
                {t('adjust.scene', { number: i + 1, kind: t(`sceneKinds.${sc.kind}`) })}
              </Text>
              <TextInput
                value={sc.heading}
                onChangeText={(heading) => setScenes((all) => all.map((x, j) => (j === i ? { ...x, heading } : x)))}
                style={[styles.input, { fontFamily: Fonts.bold }]}
                accessibilityLabel={t('adjust.sceneHeading', { number: i + 1 })}
              />
              <TextInput
                value={sc.caption}
                onChangeText={(caption) => setScenes((all) => all.map((x, j) => (j === i ? { ...x, caption } : x)))}
                multiline
                style={[styles.input, { minHeight: 64 }]}
                accessibilityLabel={t('adjust.sceneNarration', { number: i + 1 })}
              />
            </Card>
          ))}
        </>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  tabOn: { backgroundColor: Colors.primary },
  input: {
    ...NoWebOutline,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    textAlignVertical: 'top',
  },
});
