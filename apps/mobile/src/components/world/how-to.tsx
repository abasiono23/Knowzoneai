import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FONT, LetterTile, ltrRow, PrimaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { LevelKind } from '@/lib/world/types';

/**
 * How to play each kind of World level: three short rules and a worked example. Shown in full on a
 * level's start page the first time (remembered on this device) and from the "?" button while playing.
 */
export function WorldHowTo({ kind }: { kind: LevelKind }) {
  const { t } = useTranslation('world');
  return (
    <View style={{ gap: 14 }}>
      {(['r1', 'r2', 'r3'] as const).map((r, i) => (
        <View key={r} style={styles.rule}>
          <View style={styles.ruleNumber}>
            <Text style={{ fontFamily: FONT, fontSize: 13, color: W.ink }}>{i + 1}</Text>
          </View>
          <Text style={styles.ruleText}>{t(`adv.rules.${kind}.${r}`)}</Text>
        </View>
      ))}
      <View style={styles.example}>
        <Text style={styles.eyebrow}>{t('adv.example').toUpperCase()}</Text>
        <Example kind={kind} />
        <Text style={styles.exampleNote}>{t(`adv.rules.${kind}.example`)}</Text>
      </View>
    </View>
  );
}

/** The worked examples (the questions themselves are in English, as in the game). */
function Example({ kind }: { kind: LevelKind }) {
  const { t } = useTranslation('world');
  switch (kind) {
    case 'sprint':
      return (
        <View style={{ gap: 10 }}>
          <Text style={styles.exampleClue}>“Light travels faster than sound.”</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[styles.choice, { borderColor: W.correct, backgroundColor: W.correctSoft }]}>
              <Ionicons name="checkmark" size={16} color={W.correct} />
              <Text style={[styles.choiceText, { color: W.correct }]}>{t('sprint.true')}</Text>
            </View>
            <View style={[styles.choice, { opacity: 0.5 }]}>
              <Ionicons name="close" size={16} color={W.ink} />
              <Text style={styles.choiceText}>{t('sprint.false')}</Text>
            </View>
          </View>
        </View>
      );
    case 'puzzle':
      return (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Text style={styles.exampleClue}>“The force that keeps planets in orbit”</Text>
          <View style={[ltrRow(), { gap: 5, flexWrap: 'wrap', justifyContent: 'center' }]}>
            {'GRAVITY'.split('').map((ch, k) => (
              <LetterTile key={k} letter={k < 3 ? ch : null} state={k < 3 ? 'filled' : k === 3 ? 'active' : 'empty'} size={34} />
            ))}
          </View>
        </View>
      );
    case 'battle':
      return (
        <View style={{ gap: 8 }}>
          <View style={styles.score}>
            <Text style={styles.scoreText}>{t('battle.you')}</Text>
            <Text style={[styles.scoreText, { fontFamily: FONT }]}>3 – 2</Text>
            <Text style={styles.scoreText}>{t('adv.rival')}</Text>
          </View>
          <Text style={styles.exampleClue}>“What is 15% of 80?” → 12</Text>
        </View>
      );
    default:
      return (
        <View style={{ gap: 8 }}>
          <Text style={styles.exampleClue}>“What gas do plants take in for photosynthesis?”</Text>
          {['Oxygen', 'Carbon dioxide', 'Nitrogen'].map((o, k) => (
            <View
              key={o}
              style={[styles.choice, { justifyContent: 'flex-start' }, k === 1 && { borderColor: W.correct, backgroundColor: W.correctSoft }]}>
              <Ionicons name={k === 1 ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={k === 1 ? W.correct : W.muted} />
              <Text style={styles.choiceText}>{o}</Text>
            </View>
          ))}
        </View>
      );
  }
}

const SEEN = 'knowzone.world.rulesSeen';

/** Whether this device has shown a kind's rules before; `markSeen` remembers it. */
export function useWorldRulesSeen(kind: LevelKind) {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(SEEN)
      .then((raw) => live && setSeen(((raw ? JSON.parse(raw) : []) as string[]).includes(kind)))
      .catch(() => live && setSeen(false));
    return () => {
      live = false;
    };
  }, [kind]);
  const markSeen = () => {
    setSeen(true);
    AsyncStorage.getItem(SEEN)
      .then((raw) => {
        const list = new Set((raw ? JSON.parse(raw) : []) as string[]);
        list.add(kind);
        return AsyncStorage.setItem(SEEN, JSON.stringify([...list]));
      })
      .catch(() => {});
  };
  return { seen, markSeen };
}

/** The rules over the game (the "?" button). The game waits while it's open. */
export function WorldRulesSheet({ kind, visible, onClose }: { kind: LevelKind; visible: boolean; onClose: () => void }) {
  const { t } = useTranslation('world');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.sheet} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ gap: 18, padding: 22 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 2 }}>
              <Text style={styles.eyebrow}>{t('adv.howToPlay').toUpperCase()}</Text>
              <Text style={styles.title} accessibilityRole="header">
                {t(`adv.kinds.${kind}.name`)}
              </Text>
            </View>
            <WorldHowTo kind={kind} />
            {Platform.OS === 'web' && <Text style={styles.keyboard}>{t(`adv.keys.${kind}`)}</Text>}
            <PrimaryButton title={t('adv.gotIt')} onPress={onClose} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rule: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ruleText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
  example: { gap: 12, padding: 16, borderRadius: 14, backgroundColor: W.page, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  exampleClue: { fontFamily: Fonts.semibold, fontSize: 15, color: W.ink, textAlign: 'center' },
  exampleNote: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft, textAlign: 'center' },
  choice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: W.lineStrong,
    backgroundColor: W.surface,
  },
  choiceText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  score: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  scoreText: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  backdrop: { flex: 1, backgroundColor: 'rgba(14,16,32,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, maxHeight: '92%', borderRadius: 20, backgroundColor: W.surface },
  title: { fontFamily: FONT, fontSize: 22, color: W.ink, letterSpacing: -0.3 },
  keyboard: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.muted },
});
