/**
 * Sentence helpers written without regex lookbehind ("(?<=…)"). iPhones before iOS 16.4 can't parse a
 * lookbehind at all, and one in the code stops the whole web app from loading there, so use these.
 */

/** Text up to and including the first sentence's full stop, question or exclamation mark. */
export function firstSentence(text: string) {
  const end = /[.!?]\s/.exec(text);
  return end ? text.slice(0, end.index + 1) : text;
}

/**
 * Splits text into sentences at a full stop, question or exclamation mark followed by a space and a
 * capital letter or digit (so "e.g. this" and "3.5 m" stay whole). Each sentence keeps its mark.
 */
export function splitSentences(text: string) {
  return text.replace(/([.!?])\s+(?=[A-Z0-9])/g, '$1\u0000').split('\u0000');
}
