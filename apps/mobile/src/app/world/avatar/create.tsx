import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { Avatar } from '@/components/world/avatar';
import { GameBack } from '@/components/world/world-ui';
import { Text } from '@/components/ui';
import { Fonts, NoWebOutline } from '@/constants/theme';
import { useSession } from '@/lib/session';
import {
  backdropOf,
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
        <Text style={styles.heading} accessibilityRole="header">
          {editing ? t('create.editTitle') : t('create.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.preview}>
        <Animated.View key={`${a.hair}${a.skin}${a.eyes}${a.mouth}`} entering={ZoomIn.duration(250)}>
          <Avatar config={a} size={128} />
        </Animated.View>
        <TextInput
          value={a.name}
          onChangeText={(name) => set({ name: name.slice(0, 16) })}
          placeholder={t('create.namePlaceholder')}
          placeholderTextColor={W.muted}
          style={styles.name}
          accessibilityLabel={t('create.namePlaceholder')}
          maxLength={16}
        />
        <Text style={styles.hint}>{t('create.nameHint')}</Text>
      </View>
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
          {TABS.map((id) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === id }}
              style={[styles.tab, tab === id && styles.tabOn]}>
              <Text style={[styles.tabText, tab === id && { color: '#fff' }]}>{t(`create.tabs.${id}`)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.panel}>
        {tab === 'skin' && (
          <Swatches label={t('create.skinTone')} colors={SKINS} value={a.skin} onPick={(skin) => set({ skin })} />
        )}
        {tab === 'hair' && (
          <>
            <Text style={styles.label}>{t('create.style')}</Text>
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
                  <Text style={styles.optionText}>
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
            <Text style={styles.label}>{t('create.eyes')}</Text>
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
                  <Text style={styles.optionText}>
                    {e.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>{t('create.expression')}</Text>
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
                  <Text style={styles.optionText}>
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
            <Text style={styles.hint}>{t('create.outfitHint')}</Text>
          </>
        )}
        {tab === 'backdrop' && (
          <Swatches
            label={t('create.tabs.backdrop')}
            colors={['violet', 'teal', 'sunset'].map((k) => backdropOf(k))}
            value={backdropOf(a.background)}
            onPick={(c) => set({ background: ['violet', 'teal', 'sunset'].find((k) => backdropOf(k) === c) ?? 'violet' })}
          />
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
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
    <View style={{ gap: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.swatches}>
        {colors.map((c) => (
          <Pressable
            key={c}
            onPress={() => onPick(c)}
            accessibilityRole="button"
            accessibilityState={{ selected: value === c }}
            accessibilityLabel={t('create.swatchA11y', { label, color: c })}
            style={[styles.swatchRing, value === c && { borderColor: W.ink }]}>
            <View style={[styles.swatch, { backgroundColor: c }]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: W.page },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  heading: { fontFamily: FONT, fontSize: 17, color: W.ink },
  preview: { alignItems: 'center', gap: 6, paddingVertical: 10 },
  name: {
    ...NoWebOutline,
    minWidth: 220,
    textAlign: 'center',
    color: W.ink,
    fontFamily: Fonts.extrabold,
    fontSize: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
  },
  hint: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.muted, textAlign: 'center' },
  tabsWrap: { borderBottomWidth: 1, borderBottomColor: W.line },
  tabs: { gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  tab: { paddingHorizontal: 14, minHeight: 36, justifyContent: 'center', borderRadius: 999, backgroundColor: W.key },
  tabOn: { backgroundColor: W.ink },
  tabText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  panel: { padding: 16, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  label: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
    width: 84,
    borderRadius: 12,
    backgroundColor: W.surface,
    borderWidth: 1.5,
    borderColor: W.line,
  },
  optionOn: { borderColor: W.ink },
  optionText: { fontFamily: Fonts.semibold, fontSize: 12, color: W.ink },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchRing: { padding: 3, borderRadius: 26, borderWidth: 2, borderColor: 'transparent' },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: W.line,
    backgroundColor: W.surface,
    width: '100%',
    alignSelf: 'center',
  },
});
