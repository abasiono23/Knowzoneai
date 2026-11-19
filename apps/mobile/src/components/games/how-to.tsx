import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { EnglishGameId } from '@/lib/api';

import { GameCover } from './cover';
import { FONT, LetterTile, ltrRow, PrimaryButton, W } from './ui';

/**
 * How to play a word game: three short rules and a worked example. Shown on the game's page, before the
 * first game of each kind (once per device), and from the "?" button while playing.
 */
export function HowToPlay({ game }: { game: EnglishGameId }) {
  const { t } = useTranslation('games');
  return (
    <View style={{ gap: 14 }}>
      {(['r1', 'r2', 'r3'] as const).map((r, i) => (
        <View key={r} style={styles.rule}>
          <View style={styles.ruleNumber}>
            <Text style={{ fontFamily: FONT, fontSize: 13, color: W.ink }}>{i + 1}</Text>
          </View>
          <Text style={styles.ruleText}>{t(`english.${game}.rules.${r}`)}</Text>
        </View>
      ))}
      <View style={styles.example}>
        <Text style={styles.eyebrow}>{t('ui.example').toUpperCase()}</Text>
        <Example game={game} />
        <Text style={styles.exampleNote}>{t(`english.${game}.rules.example`)}</Text>
      </View>
    </View>
  );
}

/** The worked examples. The puzzles are in English, as in the games. */
function Example({ game }: { game: EnglishGameId }) {
  const row = { ...ltrRow(), gap: 6, flexWrap: 'wrap' as const, justifyContent: 'center' as const };
  switch (game) {
    case 'hidden-letters':
      return (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Text style={styles.exampleClue}>“Frozen water”</Text>
          <View style={row}>
            <LetterTile letter="I" state="given" size={40} />
            <LetterTile letter="C" state="correct" size={40} />
            <LetterTile letter="E" state="given" size={40} />
          </View>
        </View>
      );
    case 'word-clash':
      return (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <View style={row}>
            {['P', 'L', 'A', 'T', 'E', 'S'].map((ch) => (
              <LetterTile key={ch} letter={ch} points={POINTS[ch]} size={40} />
            ))}
            <LetterTile letter="R" points={1} state="used" size={40} />
          </View>
          <Text style={styles.exampleClue}>PLATES = 8 + 10</Text>
        </View>
      );
    case 'word-hunter': {
      const grid = ['SUNX', 'OAKE', 'PMIL', 'TREW'];
      return (
        <View style={{ gap: 4, alignItems: 'center' }}>
          {grid.map((line, r) => (
            <View key={r} style={[ltrRow(), { gap: 4 }]}>
              {line.split('').map((ch, c) => (
                <LetterTile key={c} letter={ch} size={34} state={r === 0 && c < 3 ? 'correct' : 'given'} />
              ))}
            </View>
          ))}
        </View>
      );
    }
    case 'spellcaster':
      return (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Text style={styles.exampleClue}>“A very large area of salt water”</Text>
          <View style={row}>
            {['O', 'C', 'E', 'A', 'N'].map((ch) => (
              <LetterTile key={ch} letter={ch} state="filled" size={38} />
            ))}
          </View>
          <View style={row}>
            {['N', 'A', 'S', 'O', 'E', 'C'].map((ch) => (
              <LetterTile key={ch} letter={ch} state={ch === 'S' ? 'given' : 'used'} size={32} />
            ))}
          </View>
        </View>
      );
    case 'sentence-master':
      return (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Text style={styles.exampleClue}>She reads books every night.</Text>
          <View style={row}>
            {['She', 'reads', 'read', 'books'].map((w) => (
              <View key={w} style={[styles.chip, w === 'read' && { borderStyle: 'dashed', opacity: 0.6 }]}>
                <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: W.ink, textDecorationLine: w === 'read' ? 'line-through' : 'none' }}>
                  {w}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
  }
}
const POINTS: Record<string, number> = { P: 3, L: 1, A: 1, T: 1, E: 1, S: 1 };

const SEEN = 'knowzone.wordgames.rulesSeen';

/** Whether this device has shown a game's rules before; `markSeen` remembers it. Storage may fail: then it shows again. */
export function useRulesSeen(game: EnglishGameId) {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(SEEN)
      .then((raw) => live && setSeen(((raw ? JSON.parse(raw) : []) as string[]).includes(game)))
      .catch(() => live && setSeen(false));
    return () => {
      live = false;
    };
  }, [game]);
  const markSeen = () => {
    setSeen(true);
    AsyncStorage.getItem(SEEN)
      .then((raw) => {
        const list = new Set((raw ? JSON.parse(raw) : []) as string[]);
        list.add(game);
        return AsyncStorage.setItem(SEEN, JSON.stringify([...list]));
      })
      .catch(() => {});
  };
  return { seen, markSeen };
}

/** The rules over the game (first play, or the "?" button). The game waits while it's open. */
export function RulesSheet({
  game,
  visible,
  first,
  onClose,
}: {
  game: EnglishGameId;
  visible: boolean;
  /** Before the first game: the button says "Start". */
  first?: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('games');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View entering={FadeIn.duration(180)} style={styles.sheet} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ gap: 18, padding: 22 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <GameCover game={game} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>{t('levels.howToPlay').toUpperCase()}</Text>
                <Text style={styles.title} accessibilityRole="header">
                  {t(`english.${game}.name`)}
                </Text>
              </View>
            </View>
            <HowToPlay game={game} />
            {Platform.OS === 'web' && <Text style={styles.keyboard}>{t('ui.keyboardHint')}</Text>}
            <PrimaryButton title={first ? t('ui.start') : t('ui.gotIt')} icon={first ? 'arrow-forward' : undefined} onPress={onClose} />
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
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: W.ink, backgroundColor: W.surface },
  backdrop: { flex: 1, backgroundColor: 'rgba(14,16,32,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, maxHeight: '92%', borderRadius: 20, backgroundColor: W.surface },
  title: { fontFamily: FONT, fontSize: 22, color: W.ink, letterSpacing: -0.3 },
  keyboard: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.muted },
});
