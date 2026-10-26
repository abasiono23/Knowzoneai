/**
 * Sentences for Sentence Master: one grammar point per level. Each sentence has a "trap" word, the
 * mistake learners often make (for example "visits" in a past-tense sentence), mixed in with the
 * right words. `also` lists other correct word orders; `text` is the sentence with its punctuation
 * when that isn't just the words plus the final mark.
 */
export type GrammarTopic = 'presentSimple' | 'pastTense' | 'questions' | 'prepositions' | 'passiveConditionals';

export type Sentence = { words: string[]; trap: string; end: '.' | '?'; also?: string[][]; text?: string };

const s = (sentence: string, trap: string, extra: Partial<Sentence> = {}): Sentence => {
  const end = sentence.endsWith('?') ? '?' : '.';
  const words = sentence.replace(/[.?]$/, '').replace(/,/g, '').split(' ');
  return { words, trap, end, ...(sentence.includes(',') && { text: sentence }), ...extra };
};

export const SENTENCES: Record<number, { topic: GrammarTopic; sentences: Sentence[] }> = {
  1: {
    topic: 'presentSimple',
    sentences: [
      s('The sun rises in the east.', 'rise'),
      s('My brother plays football every Saturday.', 'play'),
      s('We eat rice for lunch.', 'eats'),
      s('She reads a book every night.', 'read'),
      s('Birds build nests in trees.', 'builds'),
      s('I walk to school every morning.', 'walks'),
      s('Our teacher is very kind.', 'are'),
      s('The children are in the classroom.', 'is'),
      s('Lagos is a very busy city.', 'are'),
      s('He drinks water after running.', 'drink'),
    ],
  },
  2: {
    topic: 'pastTense',
    sentences: [
      s('Yesterday she visited her grandmother in Lagos.', 'visits'),
      s('We played football after school.', 'play'),
      s('The rain stopped before noon.', 'stops'),
      s('He wrote a letter to his uncle.', 'writes'),
      s('They went to the market on Monday.', 'goes'),
      s('I saw a big snake in the garden.', 'see'),
      s('My father bought a new car.', 'buys'),
      s('The baby slept all night.', 'sleeps'),
      s('Ada won the spelling competition.', 'wins'),
      s('The students came to school early.', 'comes'),
    ],
  },
  3: {
    topic: 'questions',
    sentences: [
      s('Where do you live?', 'does'),
      s('What time does the bus leave?', 'do'),
      s('Did you finish your homework?', 'finished'),
      s('Why is the sky blue?', 'are'),
      s('How many books do you have?', 'much'),
      s('Who won the match yesterday?', 'win'),
      s('Can you help me with this?', 'helps'),
      s('When did they arrive in Abuja?', 'arrived'),
      s('Which team do you support?', 'does'),
      s('Is your sister at home?', 'Are'),
    ],
  },
  4: {
    topic: 'prepositions',
    sentences: [
      s('I have lived in Kano for five years.', 'since'),
      s('She has already finished her work.', 'have'),
      s('The book is on the table.', 'at'),
      s('We have known each other since 2019.', 'for'),
      s('He is good at mathematics.', 'in'),
      s('They have never seen snow.', 'saw'),
      s("The meeting starts at nine o'clock.", 'on'),
      s('She was born on a Sunday.', 'in'),
      s('My school is next to the church.', 'besides'),
      s('Have you ever visited Calabar?', 'Did'),
    ],
  },
  5: {
    topic: 'passiveConditionals',
    sentences: [
      s('Things Fall Apart was written by Chinua Achebe.', 'wrote'),
      s('English is spoken in many countries.', 'speaks'),
      s('If it rains, we will stay inside.', 'would'),
      s('If I were you, I would study harder.', 'will'),
      s('The bridge was built in 1965.', 'build'),
      s('She said that she was tired.', 'is'),
      s('He asked me where I lived.', 'do'),
      s('The results will be announced tomorrow.', 'announce'),
      s('The thief was caught by the police.', 'catched'),
      s('If you heat ice, it melts.', 'melt'),
    ],
  },
};
