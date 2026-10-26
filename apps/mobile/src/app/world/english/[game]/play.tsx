import { Redirect, useLocalSearchParams } from 'expo-router';

import { HiddenLetters } from '@/components/games/hidden-letters';
import { SentenceMaster } from '@/components/games/sentence-master';
import { Spellcaster } from '@/components/games/spellcaster';
import { WordClash } from '@/components/games/word-clash';
import { WordHunter } from '@/components/games/word-hunter';
import { MAX_LEVEL } from '@/lib/games/english';

/** Plays one level of a word game. The level is checked again on the server (locked levels refuse). */
export default function PlayWordGame() {
  const { game, level: raw } = useLocalSearchParams<{ game: string; level?: string }>();
  const level = Math.min(MAX_LEVEL, Math.max(1, Number(raw) || 1));
  // Keyed by level, so "Next level" starts a fresh game.
  switch (game) {
    case 'hidden-letters':
      return <HiddenLetters key={level} level={level} />;
    case 'word-clash':
      return <WordClash key={level} level={level} />;
    case 'word-hunter':
      return <WordHunter key={level} level={level} />;
    case 'spellcaster':
      return <Spellcaster key={level} level={level} />;
    case 'sentence-master':
      return <SentenceMaster key={level} level={level} />;
    default:
      return <Redirect href="/world/english" />;
  }
}
