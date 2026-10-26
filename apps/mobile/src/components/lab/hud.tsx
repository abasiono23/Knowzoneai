import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { KORA_IMAGE } from '@/lib/games/english';
import { ITEMS, sub, type ItemArt } from '@/lib/games/lab';
import { useSession } from '@/lib/session';

export const PANEL = 'rgba(14,18,44,0.82)';
export const BOLD = 'Manrope_800ExtraBold';
export const ASK_COST = 10;

/** Round button (pause / back) on the top left of every lab screen. */
export function RoundButton({
  icon,
  onPress,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.round, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

export function Coins() {
  const { user } = useSession();
  return (
    <View style={styles.pill} accessibilityLabel={`${user?.coins ?? 0}`}>
      <View style={styles.coin}>
        <Text style={{ fontFamily: BOLD, fontSize: 11, color: '#7A4B00' }}>K</Text>
      </View>
      <Text style={{ fontFamily: BOLD, fontSize: 15, color: Colors.reward }}>{user?.coins ?? 0}</Text>
    </View>
  );
}

export function Hearts({ left }: { left: number }) {
  const { t } = useTranslation('games');
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={t('ui.heartsLeft', { count: left })}>
      {[0, 1, 2].map((i) => (
        <Ionicons key={i} name="heart" size={18} color={i < left ? '#FF5A9A' : 'rgba(255,255,255,0.22)'} />
      ))}
    </View>
  );
}

/** A dark, see-through panel. */
export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

/** The current task, with a checklist (ticks for what's done). */
export function Objective({
  title,
  items,
  compact,
}: {
  title: string;
  items?: { label: string; done: boolean }[];
  compact?: boolean;
}) {
  if (compact)
    return (
      <View style={[styles.panel, { gap: 4, paddingVertical: 6 }]}>
        <Text numberOfLines={1} style={{ fontFamily: BOLD, fontSize: 12, color: '#fff' }}>
          {sub(title)}
        </Text>
        {!!items?.length && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {items.map((it) => (
              <View key={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons
                  name={it.done ? 'checkbox' : 'square-outline'}
                  size={12}
                  color={it.done ? Colors.success : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, color: it.done ? Colors.success : 'rgba(235,238,255,0.9)', maxWidth: 150 }}>
                  {sub(it.label)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  return (
    <Animated.View entering={FadeInDown} style={[styles.panel, { gap: 4 }]}>
      <Text style={{ fontFamily: BOLD, fontSize: 14, color: '#fff' }}>{sub(title)}</Text>
      {items?.map((it) => (
        <View key={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons
            name={it.done ? 'checkbox' : 'square-outline'}
            size={16}
            color={it.done ? Colors.success : 'rgba(255,255,255,0.6)'}
          />
          <Text style={{ fontSize: 13, color: it.done ? Colors.success : 'rgba(235,238,255,0.9)' }}>
            {sub(it.label)}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

/** A picture of a piece of equipment or a bottle, with an optional label on it. */
export function ItemPicture({
  art,
  height,
  label,
  tint,
}: {
  art: ItemArt;
  height: number;
  label?: string;
  tint?: string;
}) {
  const a = ITEMS[art];
  const w = height * a.aspect;
  return (
    <View style={{ width: w, height, alignItems: 'center' }}>
      <Image source={a.src} style={{ width: w, height }} contentFit="contain" accessible={false} />
      {!!tint && (
        <View
          pointerEvents="none"
          style={[
            styles.tint,
            { backgroundColor: tint, height: height * 0.32, width: w * 0.62, bottom: height * 0.06 },
          ]}
        />
      )}
      {!!label && (
        <View pointerEvents="none" style={[styles.label, { top: height * 0.5, width: Math.max(w * 0.9, 44) }]}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: BOLD,
              fontSize: Math.max(9, height * 0.11),
              lineHeight: Math.max(11, height * 0.13),
              color: '#1D2340',
              textAlign: 'center',
            }}>
            {sub(label)}
          </Text>
        </View>
      )}
    </View>
  );
}

export type InventoryItem = { key: string; art: ItemArt; label?: string };

/** Five slots along the bottom: what the student is carrying. */
export function Inventory({
  items,
  onTap,
  selected,
}: {
  items: InventoryItem[];
  onTap?: (key: string) => void;
  selected?: string | null;
}) {
  const { t } = useTranslation('lab');
  return (
    <View style={styles.inventory} accessibilityLabel={t('inventory.label', { count: items.length })}>
      {Array.from({ length: 5 }, (_, k) => {
        const it = items[k];
        return (
          <Pressable
            key={k}
            disabled={!it || !onTap}
            onPress={() => it && onTap?.(it.key)}
            accessibilityRole="button"
            accessibilityLabel={it?.label ?? t('inventory.empty')}
            style={[
              styles.slot,
              selected &&
                it?.key === selected && { borderColor: Colors.reward, backgroundColor: 'rgba(255,200,87,0.18)' },
            ]}>
            {it && (
              <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
                <ItemPicture art={it.art} height={36} />
                {!!it.label && (
                  <Text numberOfLines={1} style={{ fontSize: 9, color: '#fff', maxWidth: 56 }}>
                    {sub(it.label)}
                  </Text>
                )}
              </Animated.View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** The big round action button (Pick up, Open, Mix…). */
export function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  gold,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  gold?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.action,
        gold && { backgroundColor: Colors.reward },
        disabled && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.95 }] },
      ]}>
      <Ionicons name={icon} size={30} color={gold ? '#3A2600' : '#fff'} />
      <Text
        numberOfLines={2}
        style={{ fontFamily: BOLD, fontSize: 12, color: gold ? '#3A2600' : '#fff', textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** "Ask AI · 10" with Kora and a coin. */
export function AskButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('lab');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('ask.button', { cost: ASK_COST })}
      style={({ pressed }) => [styles.ask, pressed && { opacity: 0.85 }]}>
      <Image source={KORA_IMAGE} style={{ width: 28, height: 28 }} contentFit="contain" accessible={false} />
      <Text style={{ fontFamily: BOLD, fontSize: 14, color: '#fff' }}>{t('ask.short')}</Text>
      <Text style={{ fontFamily: BOLD, fontSize: 14, color: Colors.reward }}>· {ASK_COST}</Text>
    </Pressable>
  );
}

/** A small Kora bubble with a tip. */
export function KoraTip({ text }: { text: string }) {
  return (
    <Animated.View key={text} entering={FadeIn} style={styles.tip} pointerEvents="none">
      <Image source={KORA_IMAGE} style={{ width: 34, height: 34 }} contentFit="contain" accessible={false} />
      <Text style={{ flex: 1, fontSize: 13, color: '#fff' }}>{sub(text)}</Text>
    </Animated.View>
  );
}

/** A pill-shaped choice (answers, suspects). */
export function Choice({
  label,
  onPress,
  state = 'idle',
  disabled,
}: {
  label: string;
  onPress: () => void;
  state?: 'idle' | 'selected' | 'right' | 'wrong';
  disabled?: boolean;
}) {
  const border =
    state === 'right'
      ? Colors.success
      : state === 'wrong'
        ? Colors.danger
        : state === 'selected'
          ? Colors.reward
          : 'rgba(255,200,87,0.45)';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: state === 'selected' }}
      style={({ pressed }) => [
        styles.choice,
        { borderColor: border },
        state === 'right' && { backgroundColor: 'rgba(45,212,191,0.2)' },
        state === 'wrong' && { backgroundColor: 'rgba(255,90,122,0.2)' },
        pressed && { opacity: 0.85 },
      ]}>
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#fff', textAlign: 'center' }}>
        {sub(label)}
      </Text>
    </Pressable>
  );
}

/** A full-width primary button in gold (Submit, Mix, Identify…). */
export function GoldButton({
  title,
  onPress,
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.gold,
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}>
      {icon && <Ionicons name={icon} size={20} color="#3A2600" />}
      <Text style={{ fontFamily: BOLD, fontSize: 17, color: '#3A2600' }}>{title}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PANEL,
  },
  coin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.reward,
    borderWidth: 2,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    padding: Spacing.sm,
    borderRadius: 18,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(160,140,255,0.25)',
  },
  tint: { position: 'absolute', borderRadius: 6, opacity: 0.55 },
  label: { position: 'absolute', alignItems: 'center', paddingHorizontal: 2 },
  inventory: { flexDirection: 'row', gap: 6, padding: 6, borderRadius: 18, backgroundColor: PANEL },
  slot: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#4B36D6',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#7C5CFF',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  ask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(160,140,255,0.4)',
  },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 16, backgroundColor: PANEL },
  choice: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(14,18,44,0.65)',
    flexGrow: 1,
    flexBasis: '45%',
  },
  gold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 999,
    backgroundColor: Colors.reward,
  },
});
