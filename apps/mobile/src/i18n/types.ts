/** Plural forms some languages need beyond English's one/other (Arabic uses all of them). */
type ExtraPlural = `${string}_${'zero' | 'two' | 'few' | 'many'}`;

/**
 * Same shape as the English strings, every key optional: anything missing falls back to English.
 * Languages may add the extra plural forms they need (e.g. `days_few` in Arabic).
 */
export type Translation<T> = {
  [K in keyof T]?: T[K] extends string ? string : T[K] extends readonly string[] ? readonly string[] : Translation<T[K]>;
} & { [key: ExtraPlural]: string };
