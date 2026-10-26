import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/world/avatar';
import { GameBack } from '@/components/world/world-ui';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';
import {
  BACKGROUNDS,
  DEFAULT_AVATAR,
  EYES,
  HAIR_COLORS,
  HAIRS,
  MOUTHS,
  OUTFIT_COLORS,
  SKINS,
} from '@/lib/world/avatar';
import { useWorld } from '@/lib/world/store';
import type { AvatarConfig } from '@/lib/world/types';

const TABS = ['skin', 'hair', 'face', 'outfit', 'backdrop'] as const;
type Tab = (typeof TABS)[number];

/** Screen 134: create your avatar. Every base look is free. */
export default function AvatarCreateScreen() {
  const { t } = useTranslation('world');
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { user } = useSession();
  const { avatar, saveAvatar } = useWorld();
  const [a, setA] = useState<AvatarConfig>(() => avatar ?? { ...DEFAULT_AVATAR, name: user?.name.split(' ')[0] ?? '' });
  const [tab, setTab] = useState<Tab>('skin');
  const set = (patch: Partial<AvatarConfig>) => setA((x) => ({ ...x, ...patch }));
  const editing = edit === '1' && !!avatar;

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.top}>
        {editing ? <GameBack /> : <View style={{ width: 40 }} />}
        <Text variant="label" color={Colors.reward}>
          {editing ? t('create.editTitle') : t('create.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.preview}>
        <Animated.View key={`${a.hair}${a.skin}${a.eyes}${a.mouth}`} entering={ZoomIn.duration(250)}>
          <Avatar config={a} size={168} ring={Colors.reward} />
        </Animated.View>
        <TextInput
          value={a.name}
          onChangeText={(name) => set({ name: name.slice(0, 16) })}
          placeholder={t('create.namePlaceholder')}
          placeholderTextColor={Colors.textMuted}
          style={styles.name}
          accessibilityLabel={t('create.namePlaceholder')}
          maxLength={16}
        />
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
          {t('create.nameHint')}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((id) => (
          <ChoiceChip key={id} label={t(`create.tabs.${id}`)} selected={tab === id} onPress={() => setTab(id)} />
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.panel}>
        {tab === 'skin' && (
          <Swatches label={t('create.skinTone')} colors={SKINS} value={a.skin} onPick={(skin) => set({ skin })} />
        )}
        {tab === 'hair' && (
          <>
            <Text variant="bodyStrong">{t('create.style')}</Text>
            <View style={styles.grid}>
              {HAIRS.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => set({ hair: h.id })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: a.hair === h.id }}
                  accessibilityLabel={t('create.hairA11y', { label: h.label })}
                  style={[styles.option, a.hair === h.id && styles.optionOn]}>
                  <Avatar config={{ ...a, hair: h.id, hat: undefined }} size={64} />
                  <Text variant="small" style={{ fontSize: 12 }}>
                    {h.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Swatches
              label={t('create.colour')}
              colors={HAIR_COLORS}
              value={a.hairColor}
              onPick={(hairColor) => set({ hairColor })}
            />
          </>
        )}
        {tab === 'face' && (
          <>
            <Text variant="bodyStrong">{t('create.eyes')}</Text>
            <View style={styles.grid}>
              {EYES.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => set({ eyes: e.id })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: a.eyes === e.id }}
                  accessibilityLabel={t('create.eyesA11y', { label: e.label })}
                  style={[styles.option, a.eyes === e.id && styles.optionOn]}>
                  <Avatar config={{ ...a, eyes: e.id }} size={64} />
                  <Text variant="small" style={{ fontSize: 12 }}>
                    {e.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text variant="bodyStrong">{t('create.expression')}</Text>
            <View style={styles.grid}>
              {MOUTHS.map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => set({ mouth: m.id })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: a.mouth === m.id }}
                  accessibilityLabel={t('create.expressionA11y', { label: m.label })}
                  style={[styles.option, a.mouth === m.id && styles.optionOn]}>
                  <Avatar config={{ ...a, mouth: m.id }} size={64} />
                  <Text variant="small" style={{ fontSize: 12 }}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {tab === 'outfit' && (
          <>
            <Swatches label={t('create.topColour')} colors={OUTFIT_COLORS} value={a.outfit} onPick={(outfit) => set({ outfit })} />
            <Text variant="small" color={Colors.textMuted}>
              {t('create.outfitHint')}
            </Text>
          </>
        )}
        {tab === 'backdrop' && (
          <Swatches
            label={t('create.tabs.backdrop')}
            colors={['violet', 'teal', 'sunset'].map((k) => BACKGROUNDS[k][1])}
            value={BACKGROUNDS[a.background]?.[1] ?? ''}
            onPick={(c) =>
              set({ background: ['violet', 'teal', 'sunset'].find((k) => BACKGROUNDS[k][1] === c) ?? 'violet' })
            }
          />
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={editing ? t('create.save') : t('create.done')}
          icon="checkmark"
          disabled={!a.name.trim()}
          onPress={() => {
            saveAvatar({ ...a, name: a.name.trim() });
            if (editing) router.back();
            else router.replace('/play');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function Swatches({
  label,
  colors,
  value,
  onPick,
}: {
  label: string;
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  const { t } = useTranslation('world');
  return (
    <View style={{ gap: Spacing.sm }}>
      <Text variant="bodyStrong">{label}</Text>
      <View style={styles.swatches}>
        {colors.map((c) => (
          <Pressable
            key={c}
            onPress={() => onPick(c)}
            accessibilityRole="button"
            accessibilityState={{ selected: value === c }}
            accessibilityLabel={t('create.swatchA11y', { label, color: c })}
            style={[styles.swatchRing, value === c && { borderColor: Colors.reward }]}>
            <View style={[styles.swatch, { backgroundColor: c }]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.backgroundDeep },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  preview: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  name: {
    ...NoWebOutline,
    minWidth: 200,
    textAlign: 'center',
    color: Colors.text,
    fontFamily: Fonts.extrabold,
    fontSize: 22,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabs: { gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  panel: { padding: Spacing.md, gap: Spacing.md, maxWidth: 720, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  option: {
    alignItems: 'center',
    gap: 4,
    padding: Spacing.xs,
    width: 84,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionOn: { borderColor: Colors.reward },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  swatchRing: { padding: 3, borderRadius: 26, borderWidth: 3, borderColor: 'transparent' },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
