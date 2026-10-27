/**
 * Market Master and Profit Quest: what's sold and the days and weeks a market can have. Words live
 * in the app (by id); `note` is English for Kora.
 */

/** Market Master stall products. Demand on a normal day: about `a − b × price` customers. */
export type StallProduct = { id: 'lemonade' | 'fruit' | 'icePops' | 'sandwiches'; cost: number; a: number; b: number; max: number };
export const STALL_PRODUCTS: StallProduct[] = [
  { id: 'lemonade', cost: 0.5, a: 120, b: 30, max: 4 },
  { id: 'fruit', cost: 1.2, a: 100, b: 16, max: 6 },
  { id: 'icePops', cost: 0.3, a: 150, b: 60, max: 2.5 },
  { id: 'sandwiches', cost: 1.5, a: 90, b: 12, max: 7.5 },
];

/**
 * A market day. `shift` scales how many customers come; `sens` how much they care about price;
 * `costAt` what stock costs; `rival` is the rival stall's price as a share of the best price (they
 * take customers when you're dearer). Each has the economics idea it teaches.
 */
export type MarketDay = { id: string; level: number; shift: number; sens?: number; costAt?: number; rival?: number; idea: string; note: string };
export const MARKET_DAYS: MarketDay[] = [
  { id: 'sunny', level: 1, shift: 1, idea: 'demand', note: 'A normal sunny day.' },
  { id: 'hot', level: 1, shift: 1.5, idea: 'shiftRight', note: 'A heatwave: many more customers want cold drinks and snacks.' },
  { id: 'cloudy', level: 1, shift: 0.75, idea: 'shiftLeft', note: 'A grey, cool day: fewer customers.' },
  { id: 'rainy', level: 2, shift: 0.5, idea: 'shiftLeft', note: 'Rain all day: half the usual customers.' },
  { id: 'festival', level: 2, shift: 1.8, idea: 'peak', note: 'A festival in town: crowds of customers.' },
  { id: 'rival', level: 3, shift: 1, rival: 0.9, idea: 'competition', note: 'A rival stall opens across the street, a little cheaper than the best price.' },
  { id: 'rivalSale', level: 3, shift: 1.1, rival: 0.7, idea: 'substitutes', note: 'The rival stall runs a big price cut.' },
  { id: 'shortage', level: 4, shift: 1, costAt: 1.6, idea: 'supplyShock', note: 'A poor harvest: your supplies cost 60% more.' },
  { id: 'tourists', level: 4, shift: 1.3, sens: 0.65, idea: 'inelastic', note: 'A tour bus arrives: tourists care less about price.' },
  { id: 'payday', level: 4, shift: 1.25, sens: 0.85, idea: 'income', note: 'Payday at the factory next door: people have more to spend.' },
  { id: 'cold', level: 5, shift: 0.6, sens: 1.3, idea: 'elastic', note: 'A cold snap: fewer customers, and they are picky about price.' },
  { id: 'bulk', level: 5, shift: 1, costAt: 0.75, idea: 'supplyGlut', note: 'A big harvest: your supplies are 25% cheaper.' },
];

/** Profit Quest factory products: price range, the cost of making one, weekly fixed costs, and demand `a − b × price`. */
export type FactoryProduct = { id: 'backpacks' | 'bikes' | 'phoneCases' | 'shoes'; unit: number; fixed: number; a: number; b: number; step: number };
export const FACTORY_PRODUCTS: FactoryProduct[] = [
  { id: 'backpacks', unit: 14, fixed: 1500, a: 520, b: 12, step: 1 },
  { id: 'bikes', unit: 110, fixed: 6000, a: 300, b: 1, step: 5 },
  { id: 'phoneCases', unit: 4, fixed: 900, a: 700, b: 35, step: 0.5 },
  { id: 'shoes', unit: 22, fixed: 2400, a: 420, b: 6, step: 1 },
];
