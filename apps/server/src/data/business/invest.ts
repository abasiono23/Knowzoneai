/**
 * Market Simulator: made-up companies (no real ones), news that moves them, and investing questions.
 * Practice money only. Words live in the app (by id); `note` is English for Kora.
 */
export type Sector = 'energy' | 'food' | 'tech' | 'bank' | 'health' | 'retail';
/** `vol`: how far the price can swing on its own in a quarter (riskier companies swing more). */
export type Stock = { id: string; sector: Sector; vol: number; drift: number };
export const STOCKS: Stock[] = [
  { id: 'sunpower', sector: 'energy', vol: 0.09, drift: 0.015 },
  { id: 'greenleaf', sector: 'food', vol: 0.04, drift: 0.012 },
  { id: 'roboworks', sector: 'tech', vol: 0.14, drift: 0.025 },
  { id: 'citybank', sector: 'bank', vol: 0.06, drift: 0.013 },
  { id: 'vitahealth', sector: 'health', vol: 0.05, drift: 0.014 },
  { id: 'shopstream', sector: 'retail', vol: 0.08, drift: 0.012 },
];

/**
 * News at the start of a quarter. `effect`: how each sector really moves. Hype news (level 4+) looks
 * exciting but is already in the price, so it barely helps, or the price falls when the hype fades.
 */
export type News = { id: string; level: number; effect: Partial<Record<Sector | 'all', number>>; note: string };
export const NEWS: News[] = [
  { id: 'heatwave', level: 1, effect: { energy: 0.08, food: -0.02 }, note: 'A heatwave boosts demand for electricity.' },
  { id: 'robotOrder', level: 1, effect: { tech: 0.12 }, note: 'RoboWorks wins a huge order for factory robots.' },
  { id: 'harvest', level: 1, effect: { food: 0.06 }, note: 'A record harvest lowers costs for food companies.' },
  { id: 'recall', level: 1, effect: { tech: -0.14 }, note: 'RoboWorks recalls thousands of faulty robots.' },
  { id: 'shopping', level: 1, effect: { retail: 0.08 }, note: 'Holiday shopping breaks records.' },
  { id: 'medicine', level: 2, effect: { health: 0.1 }, note: "VitaHealth's new medicine is approved." },
  { id: 'rateRise', level: 2, effect: { bank: 0.05, tech: -0.06, retail: -0.03 }, note: 'The central bank raises interest rates.' },
  { id: 'oilDrop', level: 2, effect: { energy: -0.08, retail: 0.03 }, note: 'Energy prices fall sharply.' },
  { id: 'recession', level: 3, effect: { all: -0.07, food: 0.04, health: 0.03 }, note: 'Fears of a recession: shoppers cut back.' },
  { id: 'boom', level: 3, effect: { all: 0.05, retail: 0.03, tech: 0.03 }, note: 'The economy grows faster than expected.' },
  { id: 'bankScandal', level: 3, effect: { bank: -0.12 }, note: 'City Bank is fined for hiding losses.' },
  { id: 'hype', level: 4, effect: { tech: -0.09 }, note: 'Everyone online says RoboWorks will "go to the moon" (the hype is already in the price).' },
  { id: 'rumour', level: 4, effect: { retail: -0.02 }, note: 'An anonymous post claims ShopStream will be bought out (an unconfirmed rumour).' },
  { id: 'quietQuarter', level: 4, effect: {}, note: 'A quiet quarter with no big news.' },
  { id: 'crash', level: 5, effect: { all: -0.12 }, note: 'A sudden market crash: prices fall everywhere.' },
  { id: 'rebound', level: 5, effect: { all: 0.09 }, note: 'Markets bounce back after the crash.' },
];

/** Investing questions: the right option's index and the level they first come up on. */
export type Quiz = { id: string; level: number; options: number; answer: number };
export const QUIZ: Quiz[] = [
  { id: 'share', level: 1, options: 4, answer: 1 },
  { id: 'diversify', level: 1, options: 4, answer: 2 },
  { id: 'riskReturn', level: 1, options: 4, answer: 0 },
  { id: 'index', level: 1, options: 4, answer: 3 },
  { id: 'bond', level: 2, options: 4, answer: 1 },
  { id: 'dividend', level: 2, options: 4, answer: 0 },
  { id: 'compound', level: 2, options: 4, answer: 2 },
  { id: 'emergencyFirst', level: 2, options: 4, answer: 3 },
  { id: 'pastPerformance', level: 3, options: 4, answer: 1 },
  { id: 'inflation', level: 3, options: 4, answer: 0 },
  { id: 'longTerm', level: 3, options: 4, answer: 2 },
  { id: 'fees', level: 3, options: 4, answer: 3 },
  { id: 'hype', level: 4, options: 4, answer: 1 },
  { id: 'bearMarket', level: 4, options: 4, answer: 0 },
  { id: 'pricedIn', level: 4, options: 4, answer: 2 },
  { id: 'rates', level: 5, options: 4, answer: 3 },
  { id: 'panicSell', level: 5, options: 4, answer: 1 },
  { id: 'rebalance', level: 5, options: 4, answer: 0 },
];
