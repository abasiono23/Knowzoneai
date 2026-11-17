import type { Exam } from '../data/exams.js';

/**
 * Spelling from the other side of the Atlantic: British forms in a paper for an American exam (SAT,
 * ACT, AP), American ones in a paper for a British-spelling one (GCSE, A-level, KCSE, Matric). A
 * question with one is dropped and written again.
 */
export const usSpelling = (exam: Exam) => exam === 'sat' || exam === 'act' || exam === 'ap';
export const ukSpelling = (exam: Exam) => exam === 'gcse' || exam === 'alevel' || exam === 'kcse' || exam === 'nsc';
const BRITISH =
  /\b(?:\w*(?:colour|favour|honour|labour|neighbour|behaviour|flavour|harbour|rumour|vapour)\w*|centres?|centred|metres?|\w+metres?|litres?|\w+litres?|theatres?|fibres?|programmes?|grey|defence|offence|licence|maths|whilst|learnt|aluminium|sulphur\w*|travell(?:ed|ing|er)|modell(?:ed|ing)|labell(?:ed|ing)|cancell(?:ed|ing)|fuell(?:ed|ing)|catalogue[sd]?|practis(?:e|ed|ing)|\w+isations?|(?:organ|real|recogn|summar|emphas|categor|special|minim|maxim|critic|apolog|character|general|util|colon|civil|modern|standard|optim|memor|neutral|polar|stabil|symbol|hypothes|synthes|visual|prior|final|normal|equal|local|crystall|oxid|ion|steril|fertil|vapor|magnet|pressur)is(?:e|ed|es|ing)|analys(?:e|ed|es|ing)|paralys(?:e|ed|es|ing)|catalys(?:e|ed|es|ing))\b/i;
const AMERICAN =
  /\b(?:\w*(?:color(?!ation|ado|imet)|favor|honor(?!ar|if)|labor(?!at|io)|neighbor|behavior|flavor|harbor|rumor)\w*|centers?|centered|(?:kilo|centi|milli|nano|micro)meters?|\d+(?:\.\d+)?[ -]meters?|meters? (?:long|wide|high|tall|deep|per|above|below|away|apart)|square meters?|cubic meters?|\w*liters?|theaters?|fibers?|gray|defense|offense|math|aluminum|travel(?:ed|ing|er)|model(?:ed|ing)|label(?:ed|ing)|cancel(?:ed|ing)|fuel(?:ed|ing)|catalog[sd]?|\w{3,}izations?|(?!(?:size|sized|sizes|sizing|prize|prized|prizes|seize|seized|seizes|seizing|capsize|capsized|resize|resized|maize|downsize|downsized|oversized?|citizen|citizens|horizon|horizons)\b)\w{3,}iz(?:e|ed|es|ing)|analyz(?:e|ed|es|ing)|paralyz(?:e|ed|es|ing)|catalyz(?:e|ed|es|ing))\b/i;
/** The wrong spelling convention for this exam, if the text has one. */
export function wrongSpelling(exam: Exam, text: string) {
  const found = usSpelling(exam) ? BRITISH.exec(text) : ukSpelling(exam) ? AMERICAN.exec(text) : null;
  return found?.[0] ?? null;
}

/**
 * An explanation that points at an option by its letter or position ("Option B is wrong", "(C)").
 * Options are shuffled after they're written, so those letters would point at the wrong ones.
 * Not for JAMB, WAEC and NECO papers: there letters in brackets are rhyme schemes and hex digits.
 */
const LETTER =
  /\b(?:[Oo]ptions?|[Cc]hoices?|[Aa]nswers?)\s+\(?[A-D]\)?(?![A-Za-z’'])|(?<![\w)])\([A-D](?:\s*(?:,|and|or|\/)\s*[A-D])*\)(?!\w)|\b[A-D] (?:is|are|was) (?:in)?correct\b|\b(?:[Ff]irst|[Ss]econd|[Tt]hird|[Ff]ourth|[Ll]ast) (?:(?:wrong|incorrect|remaining|other|listed) )*(?:options?|choices?|distractors?|answers?)\b|\b(?:[Ff]irst|[Ss]econd|[Tt]hird|[Ff]ourth) (?:wrong|incorrect)\b/;
export const citesLetter = (exam: Exam, explanation: string) => (usSpelling(exam) || ukSpelling(exam)) && LETTER.test(explanation);
