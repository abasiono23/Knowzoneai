/**
 * "Did you know?" reels (the dashboard's Flashcards feed): each reel is one fun fact explained in 5
 * cards, like a short video. Made by scripts/fun-facts.ts into data/facts/: facts.json (the checked
 * facts), reels.json (the cards, in all 10 languages), img/<reel>-<n>.webp (a picture per card) and
 * audio/<reel>-<n>.mp3 (English narration per card).
 */
export const FACT_SUBJECTS = [
  'biology',
  'human body',
  'animals',
  'chemistry',
  'physics',
  'space',
  'mathematics',
  'geography',
  'history',
  'technology',
  'economics and money',
  'languages and words',
] as const;
export type FactSubject = (typeof FACT_SUBJECTS)[number];

export type Fact = {
  id: string;
  subject: FactSubject;
  /** What the picture shows. */
  picture: string;
  /** The fact and its explanation (English; facts that become reels are translated as cards). */
  text: Partial<Record<string, { fact: string; detail: string }>>;
};

export type ReelCard = {
  /** The card's words, by language (en, pcm, yo, ig, ha, fr, ar, sw, pt, es). */
  text: Partial<Record<string, string>>;
  /** What the card's picture shows (used to make it). */
  picture: string;
  /** Length of the English narration, in seconds. */
  seconds?: number;
};
export type Reel = { id: string; subject: FactSubject; fact: string; cards: ReelCard[] };
