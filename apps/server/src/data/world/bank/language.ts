// Written by scripts/world-content.ts (writer deepseek-v4.1-flash-1017, checker qwen3.8-27b, auditor glm-5.3-flash). Don't edit by hand.
import type { WorldBank } from '../types.js';

export const LANGUAGE_BANK: WorldBank = {
 "1": {
  "questions": [
   {
    "id": "language-L1-q1",
    "q": "Which sentence uses the correct punctuation?",
    "options": [
     "Where are you going.",
     "Where, are you going?",
     "Where are you going",
     "Where are you going?"
    ],
    "answer": 3,
    "why": "A direct question ends with a question mark, so 'Where are you going?' is correct.",
    "hint": "Think about what kind of sentence it is."
   },
   {
    "id": "language-L1-q2",
    "q": "What is the plural of 'child'?",
    "options": [
     "child's",
     "childs",
     "childes",
     "children"
    ],
    "answer": 3,
    "why": "'Child' has the irregular plural 'children'. 'Child's' is a possessive, not a plural.",
    "hint": "This plural does not simply add -s."
   },
   {
    "id": "language-L1-q3",
    "q": "Which word means almost the same as 'brave'?",
    "options": [
     "cowardly",
     "fearless",
     "careless",
     "silent"
    ],
    "answer": 1,
    "why": "'Fearless' is a synonym of 'brave'. 'Cowardly' is its opposite.",
    "hint": "Look for the word that means showing no fear."
   },
   {
    "id": "language-L1-q4",
    "q": "In the sentence 'The dog barked loudly', which word is the verb?",
    "options": [
     "dog",
     "barked",
     "The",
     "loudly"
    ],
    "answer": 1,
    "why": "'Barked' is the action word, so it is the verb. 'Loudly' is an adverb describing how.",
    "hint": "The verb tells what someone or something does."
   },
   {
    "id": "language-L1-q5",
    "q": "Which of these is a simile?",
    "options": [
     "The moon is a lamp.",
     "As brave as a lion.",
     "The wind whispered.",
     "The sun smiled."
    ],
    "answer": 1,
    "why": "A simile compares using 'like' or 'as'. 'As brave as a lion' does this.",
    "hint": "Look for the words 'like' or 'as'."
   },
   {
    "id": "language-L1-q6",
    "q": "Who wrote the play 'Romeo and Juliet'?",
    "options": [
     "Jane Austen",
     "Chinua Achebe",
     "William Shakespeare",
     "Charles Dickens"
    ],
    "answer": 2,
    "why": "'Romeo and Juliet' is a famous tragedy by William Shakespeare.",
    "hint": "He also wrote 'Hamlet' and 'Macbeth'."
   },
   {
    "id": "language-L1-q7",
    "q": "What do we call a short story that teaches a moral, often with animals as characters?",
    "options": [
     "A fable",
     "A novel",
     "A sonnet",
     "A biography"
    ],
    "answer": 0,
    "why": "A fable is a short tale, often with animal characters, that teaches a lesson.",
    "hint": "Aesop is famous for these."
   },
   {
    "id": "language-L1-q8",
    "q": "Which word is spelled correctly?",
    "options": [
     "friend",
     "beleive",
     "recieve",
     "freind"
    ],
    "answer": 0,
    "why": "'Friend' is correct. The others break the 'i before e' rule or swap letters.",
    "hint": "Remember: i before e, except after c."
   },
   {
    "id": "language-L1-q9",
    "q": "What is the opposite (antonym) of 'ancient'?",
    "options": [
     "modern",
     "old",
     "antique",
     "historic"
    ],
    "answer": 0,
    "why": "'Modern' means recent or new, the opposite of 'ancient' (very old).",
    "hint": "Think of something new rather than old."
   },
   {
    "id": "language-L1-q10",
    "q": "Which of these is a poem of fourteen lines?",
    "options": [
     "A haiku",
     "An epic",
     "A sonnet",
     "A limerick"
    ],
    "answer": 2,
    "why": "A sonnet has fourteen lines. A haiku has three lines and a limerick five.",
    "hint": "Shakespeare wrote many of these."
   },
   {
    "id": "language-L1-q11",
    "q": "In 'the cat sat on the mat', what is 'on'?",
    "options": [
     "A noun",
     "An adjective",
     "A preposition",
     "A verb"
    ],
    "answer": 2,
    "why": "'On' shows the relationship between the cat and the mat, so it is a preposition.",
    "hint": "It tells you where something is."
   },
   {
    "id": "language-L1-q12",
    "q": "Which sentence is in the past tense?",
    "options": [
     "She will walk to school.",
     "She is walking to school.",
     "She walks to school.",
     "She walked to school."
    ],
    "answer": 3,
    "why": "'Walked' shows the action already happened, so it is past tense.",
    "hint": "Look for the verb that shows the action is finished."
   }
  ],
  "truths": [
   {
    "id": "language-L1-t1",
    "s": "A noun is a word that names a person, place, thing or idea.",
    "answer": true,
    "why": "Nouns name people, places, things or ideas, such as 'teacher', 'city' or 'hope'."
   },
   {
    "id": "language-L1-t2",
    "s": "An adjective describes a verb.",
    "answer": false,
    "why": "An adjective describes a noun; an adverb describes a verb."
   },
   {
    "id": "language-L1-t3",
    "s": "The first letter of a sentence should be a capital letter.",
    "answer": true,
    "why": "Sentences begin with a capital letter."
   },
   {
    "id": "language-L1-t4",
    "s": "'Quickly' is an adjective.",
    "answer": false,
    "why": "'Quickly' is an adverb because it tells how an action is done."
   },
   {
    "id": "language-L1-t5",
    "s": "A synonym is a word with a similar meaning to another word.",
    "answer": true,
    "why": "Synonyms are words with similar meanings, such as 'big' and 'large'."
   },
   {
    "id": "language-L1-t6",
    "s": "A haiku is a poem with fourteen lines.",
    "answer": false,
    "why": "A haiku has three lines; a sonnet has fourteen."
   },
   {
    "id": "language-L1-t7",
    "s": "William Shakespeare was an English playwright and poet.",
    "answer": true,
    "why": "Shakespeare wrote plays and poems in England in the late sixteenth and early seventeenth centuries."
   },
   {
    "id": "language-L1-t8",
    "s": "Chinua Achebe was a famous writer from Japan.",
    "answer": false,
    "why": "Chinua Achebe was a Nigerian writer, famous for 'Things Fall Apart'."
   },
   {
    "id": "language-L1-t9",
    "s": "A full stop ends a statement or declarative sentence.",
    "answer": true,
    "why": "Statements end with a full stop."
   },
   {
    "id": "language-L1-t10",
    "s": "A metaphor compares two things using the words 'like' or 'as'.",
    "answer": false,
    "why": "A simile uses 'like' or 'as'; a metaphor says one thing is another."
   },
   {
    "id": "language-L1-t11",
    "s": "The plural of 'mouse' can be 'mice'.",
    "answer": true,
    "why": "'Mouse' has the irregular plural 'mice'."
   },
   {
    "id": "language-L1-t12",
    "s": "A verb is a naming word.",
    "answer": false,
    "why": "A verb is an action or state word; a noun is a naming word."
   },
   {
    "id": "language-L1-t13",
    "s": "'The wind whispered through the trees' uses personification.",
    "answer": true,
    "why": "Giving the wind a human action (whispering) is personification."
   },
   {
    "id": "language-L1-t14",
    "s": "A biography tells the story of the author's own life.",
    "answer": false,
    "why": "An autobiography is written by the subject; a biography is written by someone else."
   },
   {
    "id": "language-L1-t15",
    "s": "A question mark is used at the end of a direct question.",
    "answer": true,
    "why": "Direct questions end with a question mark."
   },
   {
    "id": "language-L1-t16",
    "s": "'Happy' and 'sad' are synonyms.",
    "answer": false,
    "why": "They are antonyms, words with opposite meanings."
   },
   {
    "id": "language-L1-t17",
    "s": "A limerick is a short humorous poem with five lines.",
    "answer": true,
    "why": "A limerick has five lines and a comic tone."
   },
   {
    "id": "language-L1-t18",
    "s": "An adverb can tell us how, when or where something happens.",
    "answer": true,
    "why": "Adverbs modify verbs and can show manner, time or place."
   }
  ],
  "terms": [
   {
    "id": "language-L1-w1",
    "word": "VERB",
    "clue": "An action or state word in a sentence"
   },
   {
    "id": "language-L1-w2",
    "word": "NOUN",
    "clue": "A naming word for person, place or thing"
   },
   {
    "id": "language-L1-w3",
    "word": "SIMILE",
    "clue": "Comparison using like or as"
   },
   {
    "id": "language-L1-w4",
    "word": "SONNET",
    "clue": "Poem of fourteen lines with a set rhyme"
   },
   {
    "id": "language-L1-w5",
    "word": "COMMA",
    "clue": "Punctuation mark showing a short pause"
   },
   {
    "id": "language-L1-w6",
    "word": "FABLE",
    "clue": "Short tale with animals that teaches a lesson"
   },
   {
    "id": "language-L1-w7",
    "word": "TENSE",
    "clue": "Form of a verb showing time of action"
   },
   {
    "id": "language-L1-w8",
    "word": "RHYME",
    "clue": "Words ending with the same sound in poetry"
   },
   {
    "id": "language-L1-w9",
    "word": "ADVERB",
    "clue": "Word that describes how an action is done"
   }
  ]
 },
 "2": {
  "questions": [
   {
    "id": "language-L2-q1",
    "q": "Which word is a synonym of 'happy'?",
    "options": [
     "glad",
     "angry",
     "cold",
     "tired"
    ],
    "answer": 0,
    "why": "'Glad' means pleased or happy, just like 'happy'.",
    "hint": "Think of a word you might say when you receive good news."
   },
   {
    "id": "language-L2-q2",
    "q": "Which sentence is written in the future tense?",
    "options": [
     "She is visiting her aunt now.",
     "She visits her aunt every week.",
     "She will visit her aunt tomorrow.",
     "She visited her aunt yesterday."
    ],
    "answer": 2,
    "why": "'Will visit' shows an action that has not yet happened, so it is future tense.",
    "hint": "Look for the helping word that points to a later time."
   },
   {
    "id": "language-L2-q3",
    "q": "What is the plural of 'mouse'?",
    "options": [
     "mouse",
     "mouses",
     "mices",
     "mice"
    ],
    "answer": 3,
    "why": "'Mouse' has the irregular plural 'mice', like 'goose' and 'geese'.",
    "hint": "It does not simply add -s or -es."
   },
   {
    "id": "language-L2-q4",
    "q": "In the sentence 'Amina quickly finished her homework', which word is an adverb?",
    "options": [
     "homework",
     "quickly",
     "Amina",
     "finished"
    ],
    "answer": 1,
    "why": "'Quickly' tells us how the action was done, so it is an adverb.",
    "hint": "Find the word that describes the verb."
   },
   {
    "id": "language-L2-q5",
    "q": "Which of these is a metaphor?",
    "options": [
     "The classroom was as noisy as a zoo.",
     "The classroom had pictures of a zoo.",
     "The classroom was a zoo.",
     "The classroom was near the zoo."
    ],
    "answer": 2,
    "why": "A metaphor says one thing is another without using 'like' or 'as'; here the classroom is called a zoo.",
    "hint": "Look for a comparison that does not use 'like' or 'as'."
   },
   {
    "id": "language-L2-q6",
    "q": "Who wrote the novel 'Things Fall Apart'?",
    "options": [
     "Ngũgĩ wa Thiong'o",
     "Wole Soyinka",
     "Chinua Achebe",
     "Chimamanda Ngozi Adichie"
    ],
    "answer": 2,
    "why": "The Nigerian writer Chinua Achebe published 'Things Fall Apart' in 1958.",
    "hint": "The author is a Nigerian novelist from the Igbo people."
   },
   {
    "id": "language-L2-q7",
    "q": "What do we call the person who tells the story in a novel?",
    "options": [
     "editor",
     "character",
     "director",
     "narrator"
    ],
    "answer": 3,
    "why": "The narrator is the voice that tells the story, whether first-person or third-person.",
    "hint": "It comes from a word meaning 'to tell'."
   },
   {
    "id": "language-L2-q8",
    "q": "Which punctuation mark is used to show possession, as in 'the girl's book'?",
    "options": [
     "colon",
     "comma",
     "apostrophe",
     "hyphen"
    ],
    "answer": 2,
    "why": "An apostrophe before 's' shows that something belongs to someone.",
    "hint": "It is a small mark that floats above the line."
   },
   {
    "id": "language-L2-q9",
    "q": "Which word is an antonym of 'generous'?",
    "options": [
     "rich",
     "mean",
     "helpful",
     "kind"
    ],
    "answer": 1,
    "why": "'Mean' is the opposite of 'generous' when it describes someone who does not like giving.",
    "hint": "Think of someone who dislikes sharing."
   },
   {
    "id": "language-L2-q10",
    "q": "Which of these is a play written by William Shakespeare?",
    "options": [
     "Macbeth",
     "Oliver Twist",
     "Jane Eyre",
     "Pride and Prejudice"
    ],
    "answer": 0,
    "why": "'Macbeth' is a tragedy by Shakespeare; the others are novels by Dickens, Brontë and Austen.",
    "hint": "It is a Scottish tragedy about a king."
   },
   {
    "id": "language-L2-q11",
    "q": "What is the main character of a story called?",
    "options": [
     "protagonist",
     "antagonist",
     "narrator",
     "setting"
    ],
    "answer": 0,
    "why": "The protagonist is the central character, while the antagonist opposes them.",
    "hint": "It is the opposite of the antagonist."
   },
   {
    "id": "language-L2-q12",
    "q": "Which sentence uses 'their', 'there' and 'they're' correctly?",
    "options": [
     "They're going to their house over there.",
     "They're going to there house over their.",
     "There going to they're house over their.",
     "Their going to there house over they're."
    ],
    "answer": 0,
    "why": "'They're' means 'they are', 'their' shows possession, and 'there' points to a place.",
    "hint": "Match each word to its meaning: they are, belonging to them, a place."
   },
   {
    "id": "language-L2-q13",
    "q": "Which of these is a collection of short stories or poems by one author?",
    "options": [
     "anthology",
     "biography",
     "dictionary",
     "atlas"
    ],
    "answer": 0,
    "why": "An anthology is a collection of writings, often by one author or on one theme.",
    "hint": "It comes from a Greek word meaning 'flower gathering'."
   }
  ],
  "truths": [
   {
    "id": "language-L2-t1",
    "s": "A noun is a word that names a person, place, thing or idea.",
    "answer": true,
    "why": "Nouns name people, places, things or ideas, such as 'teacher', 'Lagos' or 'freedom'."
   },
   {
    "id": "language-L2-t2",
    "s": "An adjective describes a verb.",
    "answer": false,
    "why": "An adjective describes a noun; it is an adverb that describes a verb."
   },
   {
    "id": "language-L2-t3",
    "s": "A simile uses 'like' or 'as' to compare two things.",
    "answer": true,
    "why": "Similes make comparisons using 'like' or 'as', for example 'as brave as a lion'."
   },
   {
    "id": "language-L2-t4",
    "s": "The past tense of 'go' is 'goed'.",
    "answer": false,
    "why": "'Go' is irregular; its past tense is 'went'."
   },
   {
    "id": "language-L2-t5",
    "s": "A haiku is a short Japanese poem with three lines.",
    "answer": true,
    "why": "A haiku has three lines, traditionally with 5, 7 and 5 syllables."
   },
   {
    "id": "language-L2-t6",
    "s": "A question mark is used at the end of a statement.",
    "answer": false,
    "why": "A question mark ends a question; a statement ends with a full stop."
   },
   {
    "id": "language-L2-t7",
    "s": "The word 'quickly' is an adverb.",
    "answer": true,
    "why": "'Quickly' describes how an action is done, so it is an adverb."
   },
   {
    "id": "language-L2-t8",
    "s": "A sonnet is a poem of exactly ten lines.",
    "answer": false,
    "why": "A sonnet has fourteen lines, not ten."
   },
   {
    "id": "language-L2-t9",
    "s": "'Brave' and 'courageous' are synonyms.",
    "answer": true,
    "why": "Both words describe someone who faces danger without fear."
   },
   {
    "id": "language-L2-t10",
    "s": "A biography is a story of a person's life written by that person.",
    "answer": false,
    "why": "A biography is written by someone else; a life story written by the person is an autobiography."
   },
   {
    "id": "language-L2-t11",
    "s": "A proper noun such as 'Kenya' begins with a capital letter.",
    "answer": true,
    "why": "Proper nouns name specific people, places or organisations and are capitalised."
   },
   {
    "id": "language-L2-t12",
    "s": "The word 'slowly' is a noun.",
    "answer": false,
    "why": "'Slowly' is an adverb describing how something is done."
   },
   {
    "id": "language-L2-t13",
    "s": "A fable often ends with a moral lesson.",
    "answer": true,
    "why": "Fables, such as Aesop's, usually teach a moral, often through animal characters."
   },
   {
    "id": "language-L2-t14",
    "s": "The author of 'Harry Potter' is J. R. R. Tolkien.",
    "answer": false,
    "why": "'Harry Potter' was written by J. K. Rowling; Tolkien wrote 'The Lord of the Rings'."
   },
   {
    "id": "language-L2-t15",
    "s": "'The wind whispered through the trees' contains personification.",
    "answer": true,
    "why": "Giving the wind the human action of whispering is personification."
   },
   {
    "id": "language-L2-t16",
    "s": "A syllable is a single sound unit in a word, like 'cat' in 'cat'.",
    "answer": true,
    "why": "A syllable is a unit of pronunciation containing one vowel sound."
   },
   {
    "id": "language-L2-t17",
    "s": "The plural of 'sheep' is 'sheeps'.",
    "answer": false,
    "why": "'Sheep' has the same form in singular and plural."
   },
   {
    "id": "language-L2-t18",
    "s": "An exclamation mark can show strong feeling such as surprise.",
    "answer": true,
    "why": "Exclamation marks end sentences that express strong emotion or emphasis."
   }
  ],
  "terms": [
   {
    "id": "language-L2-w1",
    "word": "VERB",
    "clue": "A word that shows an action or a state of being."
   },
   {
    "id": "language-L2-w2",
    "word": "ADVERB",
    "clue": "A word that describes how, when or where an action happens."
   },
   {
    "id": "language-L2-w3",
    "word": "SONNET",
    "clue": "A poem of fourteen lines with a fixed rhyme pattern."
   },
   {
    "id": "language-L2-w4",
    "word": "SIMILE",
    "clue": "A comparison using the words 'like' or 'as'."
   },
   {
    "id": "language-L2-w5",
    "word": "NOVEL",
    "clue": "A long fictional story told in prose."
   },
   {
    "id": "language-L2-w6",
    "word": "COMMA",
    "clue": "A punctuation mark showing a short pause in a sentence."
   },
   {
    "id": "language-L2-w7",
    "word": "RHYME",
    "clue": "The matching of sounds at the ends of words, as in poems."
   },
   {
    "id": "language-L2-w8",
    "word": "STANZA",
    "clue": "A group of lines forming a unit in a poem."
   },
   {
    "id": "language-L2-w9",
    "word": "MYTH",
    "clue": "A traditional story explaining nature or heroes, often with gods."
   }
  ]
 },
 "3": {
  "questions": [
   {
    "id": "language-L3-q1",
    "q": "Which sentence uses the semicolon correctly?",
    "options": [
     "I was tired; I went to bed.",
     "I was tired; so I went to bed.",
     "I was tired; and went to bed.",
     "I was tired; because I went to bed."
    ],
    "answer": 0,
    "why": "A semicolon can join two independent clauses: 'I was tired' and 'I went to bed' are both complete sentences.",
    "hint": "A semicolon links two complete clauses without a conjunction."
   },
   {
    "id": "language-L3-q2",
    "q": "In the sentence 'The teacher gave the students their results', what is 'students'?",
    "options": [
     "an adverb",
     "a direct object",
     "an indirect object",
     "the subject"
    ],
    "answer": 2,
    "why": "'Students' receives the results, so it is the indirect object; 'results' is the direct object.",
    "hint": "Ask 'gave the results to whom?'"
   },
   {
    "id": "language-L3-q3",
    "q": "Which word is an abstract noun?",
    "options": [
     "river",
     "kindness",
     "pencil",
     "table"
    ],
    "answer": 1,
    "why": "Kindness is a quality or idea, not a physical object, so it is abstract.",
    "hint": "Abstract nouns name feelings or qualities, not things you can touch."
   },
   {
    "id": "language-L3-q4",
    "q": "Which sentence contains a relative clause?",
    "options": [
     "Run fast!",
     "He is very tall.",
     "The book that I borrowed is overdue.",
     "She sang and danced."
    ],
    "answer": 2,
    "why": "'That I borrowed' is a relative clause describing 'the book'.",
    "hint": "Look for a clause beginning with who, which or that."
   },
   {
    "id": "language-L3-q5",
    "q": "What is the meaning of the idiom 'to let the cat out of the bag'?",
    "options": [
     "to reveal a secret",
     "to start a quarrel",
     "to be very careless",
     "to free an animal"
    ],
    "answer": 0,
    "why": "The idiom means to reveal information that was meant to be secret.",
    "hint": "It is about information, not animals."
   },
   {
    "id": "language-L3-q6",
    "q": "Which of these is an example of personification?",
    "options": [
     "The wind whispered through the trees.",
     "He is as strong as an ox.",
     "Her smile was a ray of sunshine.",
     "The leaves fell like rain."
    ],
    "answer": 0,
    "why": "Giving the wind the human action 'whispered' is personification.",
    "hint": "Which option gives a human quality to a non-human thing?"
   },
   {
    "id": "language-L3-q7",
    "q": "Who wrote the poem 'The Tyger'?",
    "options": [
     "John Keats",
     "William Blake",
     "Robert Burns",
     "William Wordsworth"
    ],
    "answer": 1,
    "why": "'The Tyger' appears in William Blake's collection 'Songs of Experience'.",
    "hint": "The same poet wrote 'The Lamb'."
   },
   {
    "id": "language-L3-q8",
    "q": "Which African writer wrote the play 'Death and the King's Horseman'?",
    "options": [
     "Ama Ata Aidoo",
     "Ngugi wa Thiong'o",
     "Wole Soyinka",
     "Chinua Achebe"
    ],
    "answer": 2,
    "why": "Wole Soyinka, the Nigerian Nobel laureate, wrote this play.",
    "hint": "The author is a Nigerian Nobel prize winner."
   },
   {
    "id": "language-L3-q9",
    "q": "What is a 'stanza' in a poem?",
    "options": [
     "the title of the poem",
     "a single line",
     "a group of lines forming a unit",
     "the rhyming word at the end"
    ],
    "answer": 2,
    "why": "A stanza is a group of lines arranged together, like a paragraph in prose.",
    "hint": "Think of it as the poem's version of a paragraph."
   },
   {
    "id": "language-L3-q10",
    "q": "Which word is a collective noun?",
    "options": [
     "flock",
     "graze",
     "sheep",
     "woolly"
    ],
    "answer": 0,
    "why": "'Flock' names a group of sheep, so it is a collective noun.",
    "hint": "It names a group, not one animal."
   },
   {
    "id": "language-L3-q11",
    "q": "Which sentence is in the passive voice?",
    "options": [
     "The meal was cooked by the chef.",
     "The chef cooked the meal.",
     "The chef is cooking.",
     "Cook the meal!"
    ],
    "answer": 0,
    "why": "In the passive, the object becomes the subject and the verb uses 'was cooked'.",
    "hint": "In the passive, the action is done to the subject."
   },
   {
    "id": "language-L3-q12",
    "q": "Which of these is a Caribbean novel?",
    "options": [
     "Wide Sargasso Sea",
     "Things Fall Apart",
     "The Kite Runner",
     "Purple Hibiscus"
    ],
    "answer": 0,
    "why": "'Wide Sargasso Sea' is by Jean Rhys, who was born in Dominica in the Caribbean.",
    "hint": "Its author grew up in Dominica."
   },
   {
    "id": "language-L3-q13",
    "q": "What does the prefix 'mis-' mean in 'misunderstand'?",
    "options": [
     "together",
     "before",
     "wrongly",
     "again"
    ],
    "answer": 2,
    "why": "The prefix 'mis-' means wrongly or badly, as in 'misjudge' and 'mistake'.",
    "hint": "Compare 'misplace' and 'misspell'."
   }
  ],
  "truths": [
   {
    "id": "language-L3-t1",
    "s": "A simile uses the words 'like' or 'as' to compare two things.",
    "answer": true,
    "why": "A simile makes a comparison using 'like' or 'as', as in 'as brave as a lion'."
   },
   {
    "id": "language-L3-t2",
    "s": "An adverb can modify a verb, an adjective or another adverb.",
    "answer": true,
    "why": "Adverbs modify verbs, adjectives and other adverbs, for example 'very quickly'."
   },
   {
    "id": "language-L3-t3",
    "s": "The word 'and' is a preposition.",
    "answer": false,
    "why": "'And' is a coordinating conjunction, not a preposition."
   },
   {
    "id": "language-L3-t4",
    "s": "A sonnet traditionally has fourteen lines.",
    "answer": true,
    "why": "The sonnet form has fourteen lines, often in iambic pentameter."
   },
   {
    "id": "language-L3-t5",
    "s": "Chinua Achebe wrote the novel 'Things Fall Apart'.",
    "answer": true,
    "why": "Achebe's 1958 novel is a landmark of African literature."
   },
   {
    "id": "language-L3-t6",
    "s": "In English, every noun that ends in -s is plural.",
    "answer": false,
    "why": "Some singular nouns end in -s, such as 'news', 'physics' and 'series'."
   },
   {
    "id": "language-L3-t7",
    "s": "A haiku is a Japanese poem of three lines with a 5-7-5 syllable pattern.",
    "answer": true,
    "why": "The traditional haiku has three lines of five, seven and five syllables."
   },
   {
    "id": "language-L3-t8",
    "s": "The past tense of the verb 'go' is 'goed'.",
    "answer": false,
    "why": "'Go' is irregular; its past tense is 'went'."
   },
   {
    "id": "language-L3-t9",
    "s": "The word 'quickly' is an adverb.",
    "answer": true,
    "why": "'Quickly' describes how an action is done, so it is an adverb."
   },
   {
    "id": "language-L3-t10",
    "s": "A pronoun replaces a noun.",
    "answer": true,
    "why": "Pronouns such as 'he', 'she' and 'it' stand in for nouns."
   },
   {
    "id": "language-L3-t11",
    "s": "The author of 'Pride and Prejudice' is Charles Dickens.",
    "answer": false,
    "why": "'Pride and Prejudice' was written by Jane Austen, not Charles Dickens."
   },
   {
    "id": "language-L3-t12",
    "s": "An antonym is a word with the opposite meaning to another word.",
    "answer": true,
    "why": "Antonyms are words of opposite meaning, such as 'hot' and 'cold'."
   },
   {
    "id": "language-L3-t13",
    "s": "The apostrophe in 'it's' shows possession.",
    "answer": false,
    "why": "In 'it's' the apostrophe stands for the missing letter in 'it is'; the possessive form is 'its' without an apostrophe."
   },
   {
    "id": "language-L3-t14",
    "s": "A metaphor says one thing is another, without using 'like' or 'as'.",
    "answer": true,
    "why": "A metaphor directly states that something is something else, as in 'the world is a stage'."
   },
   {
    "id": "language-L3-t15",
    "s": "The plural of 'ox' is 'oxes'.",
    "answer": false,
    "why": "The plural of 'ox' is 'oxen'."
   },
   {
    "id": "language-L3-t16",
    "s": "A play is written to be performed by actors on a stage.",
    "answer": true,
    "why": "Drama is intended for performance, unlike a novel written mainly to be read."
   },
   {
    "id": "language-L3-t17",
    "s": "The word 'beautiful' is a verb.",
    "answer": false,
    "why": "'Beautiful' is an adjective describing a noun, not a verb."
   },
   {
    "id": "language-L3-t18",
    "s": "Derek Walcott, a Nobel laureate, wrote poetry rooted in the Caribbean.",
    "answer": true,
    "why": "Walcott, from Saint Lucia, won the Nobel Prize in Literature in 1992."
   }
  ],
  "terms": [
   {
    "id": "language-L3-w1",
    "word": "METAPHOR",
    "clue": "A figure of speech saying one thing is another, without like or as."
   },
   {
    "id": "language-L3-w2",
    "word": "SONNET",
    "clue": "A poem of fourteen lines, often with a set rhyme scheme."
   },
   {
    "id": "language-L3-w3",
    "word": "PREFIX",
    "clue": "Letters added to the start of a word to change its meaning."
   },
   {
    "id": "language-L3-w4",
    "word": "STANZA",
    "clue": "A group of lines forming a unit in a poem."
   },
   {
    "id": "language-L3-w5",
    "word": "IDIOM",
    "clue": "An expression whose meaning cannot be worked out from its words."
   },
   {
    "id": "language-L3-w6",
    "word": "PRONOUN",
    "clue": "A word such as he, she or it that replaces a noun."
   },
   {
    "id": "language-L3-w7",
    "word": "HAIKU",
    "clue": "A short Japanese poem of three lines with a 5-7-5 pattern."
   },
   {
    "id": "language-L3-w8",
    "word": "NOVEL",
    "clue": "A long fictional prose narrative, such as Things Fall Apart."
   }
  ]
 },
 "4": {
  "questions": [
   {
    "id": "language-L4-q1",
    "q": "Which sentence uses the apostrophe correctly to show possession?",
    "options": [
     "The children's' toys were scattered.",
     "The childrens' toys were scattered.",
     "The children's toys were scattered.",
     "The childrens toys were scattered."
    ],
    "answer": 2,
    "why": "'Children' is an irregular plural not ending in -s, so the possessive adds 's: children's.",
    "hint": "Is 'children' already plural before you add the possessive?"
   },
   {
    "id": "language-L4-q2",
    "q": "In the sentence 'She has lived here since 2010', what does the present perfect tense show?",
    "options": [
     "A habit repeated every day in the past",
     "An action continuing from the past to the present",
     "An action finished in the past with no link to now",
     "An action that will happen after 2010"
    ],
    "answer": 1,
    "why": "The present perfect with 'since' shows a state or action that began in the past and continues up to now.",
    "hint": "Think about where the action starts and whether it has stopped."
   },
   {
    "id": "language-L4-q3",
    "q": "Which word is the direct object in 'The chef cooked the rice quickly'?",
    "options": [
     "chef",
     "cooked",
     "rice",
     "quickly"
    ],
    "answer": 2,
    "why": "'Rice' receives the action of cooking, so it is the direct object; 'quickly' is an adverb.",
    "hint": "Ask 'what did the chef cook?'"
   },
   {
    "id": "language-L4-q4",
    "q": "Which sentence contains a dangling modifier?",
    "options": [
     "Walking to school, I saw a rainbow.",
     "Walking to school, the rain began.",
     "I saw a rainbow while walking to school.",
     "While I walked to school, rain began."
    ],
    "answer": 1,
    "why": "In the second sentence the rain appears to be walking to school, because the modifier has no logical subject.",
    "hint": "Who or what is doing the walking in each sentence?"
   },
   {
    "id": "language-L4-q5",
    "q": "What is the meaning of the idiom 'to bite the bullet'?",
    "options": [
     "To refuse to accept advice",
     "To speak very angrily",
     "To endure something painful bravely",
     "To eat a meal very quickly"
    ],
    "answer": 2,
    "why": "'Bite the bullet' means to face a difficult or painful situation with courage.",
    "hint": "It is about courage in a hard situation, not about food or anger."
   },
   {
    "id": "language-L4-q6",
    "q": "Which of these is an example of hyperbole?",
    "options": [
     "The wind whispered through the trees.",
     "I have told you a million times.",
     "The moon was like a silver coin.",
     "The old car coughed and stopped."
    ],
    "answer": 1,
    "why": "Hyperbole is deliberate exaggeration; 'a million times' is not meant literally.",
    "hint": "Which statement is an exaggeration rather than a comparison or a giving of human qualities?"
   },
   {
    "id": "language-L4-q7",
    "q": "Who wrote the novel 'Purple Hibiscus'?",
    "options": [
     "Ngũgĩ wa Thiong'o",
     "Chinua Achebe",
     "Chimamanda Ngozi Adichie",
     "Wole Soyinka"
    ],
    "answer": 2,
    "why": "'Purple Hibiscus' (2003) is the debut novel of Nigerian writer Chimamanda Ngozi Adichie.",
    "hint": "The author is a Nigerian woman novelist born in 1977."
   },
   {
    "id": "language-L4-q8",
    "q": "Which literary term describes a hint early in a story about what will happen later?",
    "options": [
     "Foreshadowing",
     "Hyperbole",
     "Flashback",
     "Irony"
    ],
    "answer": 0,
    "why": "Foreshadowing gives an early warning or hint of later events; a flashback goes backwards instead.",
    "hint": "The word suggests casting a shadow of future events before they happen."
   },
   {
    "id": "language-L4-q9",
    "q": "What does the prefix 'anti-' mean in 'antisocial'?",
    "options": [
     "Again",
     "Before",
     "Against",
     "Between"
    ],
    "answer": 2,
    "why": "'Anti-' comes from Greek and means 'against', so 'antisocial' means against society or sociable behaviour.",
    "hint": "Think of 'antibiotic' or 'antidote'."
   },
   {
    "id": "language-L4-q10",
    "q": "Which of these is an example of a metaphor?",
    "options": [
     "She smiled brightly.",
     "She smiled as if happy.",
     "Her smile was like sunshine.",
     "Her smile was sunshine."
    ],
    "answer": 3,
    "why": "A metaphor says one thing is another without 'like' or 'as'; the second option does this directly.",
    "hint": "Look for a comparison that does not use 'like' or 'as'."
   },
   {
    "id": "language-L4-q11",
    "q": "In 'The book that I borrowed was overdue', what is 'that I borrowed'?",
    "options": [
     "A noun phrase",
     "A relative clause",
     "An adverb clause",
     "A prepositional phrase"
    ],
    "answer": 1,
    "why": "'That I borrowed' is a relative (adjective) clause modifying 'book'.",
    "hint": "Which word introduces it, and which noun does it describe?"
   },
   {
    "id": "language-L4-q12",
    "q": "Which Caribbean writer wrote 'Wide Sargasso Sea'?",
    "options": [
     "V. S. Naipaul",
     "Derek Walcott",
     "George Lamming",
     "Jean Rhys"
    ],
    "answer": 3,
    "why": "'Wide Sargasso Sea' is a 1966 novel by Dominican-born writer Jean Rhys.",
    "hint": "The author was born in Dominica and wrote a prequel to 'Jane Eyre'."
   }
  ],
  "truths": [
   {
    "id": "language-L4-t1",
    "s": "A sonnet always has exactly fourteen lines.",
    "answer": true,
    "why": "By definition, a sonnet is a fourteen-line poem, though rhyme schemes vary."
   },
   {
    "id": "language-L4-t2",
    "s": "The word 'bank' can mean both a financial institution and the side of a river.",
    "answer": true,
    "why": "'Bank' is a homonym with several distinct meanings, including these two."
   },
   {
    "id": "language-L4-t3",
    "s": "An adverb can modify an adjective, as in 'very tall'.",
    "answer": true,
    "why": "'Very' is an adverb modifying the adjective 'tall'."
   },
   {
    "id": "language-L4-t4",
    "s": "A limerick is a serious poem of mourning for the dead.",
    "answer": false,
    "why": "A limerick is a humorous five-line poem; an elegy is the poem of mourning."
   },
   {
    "id": "language-L4-t5",
    "s": "The prefix 'pre-' in 'preview' means 'before'.",
    "answer": true,
    "why": "'Pre-' comes from Latin meaning before, so a preview shows something beforehand."
   },
   {
    "id": "language-L4-t6",
    "s": "In English, a collective noun such as 'team' can take either a singular or a plural verb depending on usage.",
    "answer": true,
    "why": "British English often allows 'the team are playing', while American English usually prefers the singular."
   },
   {
    "id": "language-L4-t7",
    "s": "An oxymoron is a figure of speech that joins contradictory terms, such as 'deafening silence'.",
    "answer": true,
    "why": "An oxymoron combines words with opposite meanings for effect."
   },
   {
    "id": "language-L4-t8",
    "s": "'Their', 'there' and 'they're' are all pronounced differently.",
    "answer": false,
    "why": "They are homophones: all three are usually pronounced the same way."
   },
   {
    "id": "language-L4-t9",
    "s": "Chinua Achebe wrote the novel 'Arrow of God'.",
    "answer": true,
    "why": "'Arrow of God' (1964) is one of Achebe's novels, alongside 'Things Fall Apart'."
   },
   {
    "id": "language-L4-t10",
    "s": "The word 'alphabet' comes from the first two Greek letters, alpha and beta.",
    "answer": true,
    "why": "The Greek names alpha and beta combine to form 'alphabet'."
   },
   {
    "id": "language-L4-t11",
    "s": "A simile uses 'like' or 'as' to compare two things.",
    "answer": true,
    "why": "Similes make explicit comparisons with 'like' or 'as'; metaphors do not."
   },
   {
    "id": "language-L4-t12",
    "s": "A haiku is a Japanese poem of seventeen syllables arranged in three lines of five, seven and five.",
    "answer": true,
    "why": "The traditional haiku form has this 5-7-5 syllable pattern."
   },
   {
    "id": "language-L4-t13",
    "s": "The past participle of 'write' is 'wrote'.",
    "answer": false,
    "why": "'Wrote' is the simple past; the past participle is 'written'."
   },
   {
    "id": "language-L4-t14",
    "s": "'Quickly' is an adjective describing a noun.",
    "answer": false,
    "why": "'Quickly' is an adverb; the adjective form is 'quick'."
   },
   {
    "id": "language-L4-t15",
    "s": "William Shakespeare wrote the play 'Macbeth'.",
    "answer": true,
    "why": "'Macbeth' is one of Shakespeare's tragedies, written around 1606."
   },
   {
    "id": "language-L4-t16",
    "s": "A protagonist is always the villain of a story.",
    "answer": false,
    "why": "The protagonist is the main character; the villain is usually the antagonist."
   },
   {
    "id": "language-L4-t17",
    "s": "The word 'phone' is a clipped form of 'telephone'.",
    "answer": true,
    "why": "Clipping shortens a word; 'phone' comes from 'telephone'."
   },
   {
    "id": "language-L4-t18",
    "s": "An apostrophe is used to form the plural of a regular noun, as in 'three cat's'.",
    "answer": false,
    "why": "Apostrophes show possession or contraction, not ordinary plurals; write 'three cats'."
   }
  ],
  "terms": [
   {
    "id": "language-L4-w1",
    "word": "METAPHOR",
    "clue": "Figure of speech saying one thing is another, without like or as"
   },
   {
    "id": "language-L4-w2",
    "word": "ALLITERATION",
    "clue": "Repetition of initial consonant sounds in nearby words"
   },
   {
    "id": "language-L4-w3",
    "word": "ONOMATOPOEIA",
    "clue": "Words that imitate the sounds they describe, such as buzz"
   },
   {
    "id": "language-L4-w4",
    "word": "PROTAGONIST",
    "clue": "The main character around whom a story is built"
   },
   {
    "id": "language-L4-w5",
    "word": "CONJUNCTION",
    "clue": "Word such as and, but or because that joins clauses"
   },
   {
    "id": "language-L4-w6",
    "word": "ANTONYM",
    "clue": "A word opposite in meaning to another, like hot and cold"
   },
   {
    "id": "language-L4-w7",
    "word": "SYLLABLE",
    "clue": "A single unit of pronunciation containing one vowel sound"
   },
   {
    "id": "language-L4-w8",
    "word": "NARRATOR",
    "clue": "The voice that tells the events of a story"
   },
   {
    "id": "language-L4-w9",
    "word": "ELEGY",
    "clue": "A mournful poem written to lament someone's death"
   }
  ]
 },
 "5": {
  "questions": [
   {
    "id": "language-L5-q1",
    "q": "Which sentence uses the colon correctly?",
    "options": [
     "She packed three things: a map, a torch and a rope.",
     "She packed: a map, a torch and a rope in her bag.",
     "She packed three things, a map: a torch and a rope.",
     "She packed three things; a map, a torch and a rope:"
    ],
    "answer": 0,
    "why": "A colon may introduce a list after a complete clause, as in the first sentence.",
    "hint": "A colon should follow a clause that can stand alone."
   },
   {
    "id": "language-L5-q2",
    "q": "In 'The committee awarded the prize to the young poet', which is the indirect object?",
    "options": [
     "awarded",
     "the young poet",
     "the committee",
     "the prize"
    ],
    "answer": 1,
    "why": "The prize is the direct object; the young poet receives it, making it the indirect object.",
    "hint": "Ask 'to whom?' after the verb."
   },
   {
    "id": "language-L5-q3",
    "q": "Which writer created the character Okonkwo?",
    "options": [
     "Chinua Achebe",
     "Chimamanda Ngozi Adichie",
     "Ngugi wa Thiong'o",
     "Wole Soyinka"
    ],
    "answer": 0,
    "why": "Okonkwo is the protagonist of Achebe's novel 'Things Fall Apart'.",
    "hint": "The novel is set in Igbo society before colonial rule."
   },
   {
    "id": "language-L5-q4",
    "q": "Which of these is a Shakespearean sonnet's typical rhyme scheme?",
    "options": [
     "ABAB BCBC CDCD EE",
     "AABB CCDD EEFF GG",
     "ABBA ABBA CDE CDE",
     "ABAB CDCD EFEF GG"
    ],
    "answer": 3,
    "why": "The Shakespearean (English) sonnet ends with a couplet and uses three quatrains rhyming ABAB CDCD EFEF.",
    "hint": "It ends with a rhyming pair."
   },
   {
    "id": "language-L5-q5",
    "q": "Which sentence contains a non-defining relative clause?",
    "options": [
     "The man who lives in Accra is a teacher.",
     "My uncle, who lives in Accra, is a teacher.",
     "The book that I lost was new.",
     "The house where she grew up is gone."
    ],
    "answer": 1,
    "why": "The clause 'who lives in Accra' is set off by commas and adds extra information, so it is non-defining.",
    "hint": "Look for commas around the clause."
   },
   {
    "id": "language-L5-q6",
    "q": "In 'The committee awarded the prize to the youngest candidate', what is 'the youngest candidate'?",
    "options": [
     "object of a preposition",
     "subject complement",
     "direct object",
     "indirect object"
    ],
    "answer": 0,
    "why": "'To the youngest candidate' is a prepositional phrase, so the noun phrase is the object of the preposition 'to'. The direct object is 'the prize'.",
    "hint": "Look at the word immediately before the phrase."
   },
   {
    "id": "language-L5-q7",
    "q": "Which of these is an example of synecdoche?",
    "options": [
     "The pen is mightier than the sword.",
     "All hands on deck!",
     "The wind whispered through the trees.",
     "He was as brave as a lion."
    ],
    "answer": 1,
    "why": "Synecdoche uses a part to stand for the whole; 'hands' stands for sailors. Option A is metonymy, C is personification and D is a simile.",
    "hint": "Which option names a body part but means people?"
   },
   {
    "id": "language-L5-q8",
    "q": "Who wrote the novel 'The God of Small Things'?",
    "options": [
     "Chinua Achebe",
     "Arundhati Roy",
     "Ngugi wa Thiong'o",
     "Anita Desai"
    ],
    "answer": 1,
    "why": "Arundhati Roy's debut novel 'The God of Small Things' won the Booker Prize in 1997. The other writers are also novelists but did not write this book.",
    "hint": "The author is an Indian writer and activist."
   },
   {
    "id": "language-L5-q9",
    "q": "Which sentence contains a non-restrictive (non-defining) relative clause?",
    "options": [
     "The book that I lost was expensive.",
     "My brother, who lives in Lagos, is a doctor.",
     "The man who lives next door is a doctor.",
     "The students who passed were praised."
    ],
    "answer": 1,
    "why": "A non-restrictive clause adds extra information and is set off by commas; 'who lives in Lagos' can be removed without changing which brother is meant. The other clauses identify the noun and are restrictive.",
    "hint": "Which clause could be removed without changing the main identification?"
   },
   {
    "id": "language-L5-q10",
    "q": "Which of these is an example of an oxymoron?",
    "options": [
     "quickly running",
     "very tired",
     "deafening silence",
     "bright sun"
    ],
    "answer": 2,
    "why": "An oxymoron joins contradictory words; 'deafening silence' combines loudness with silence. The other phrases contain no contradiction.",
    "hint": "Look for two words whose meanings clash."
   }
  ],
  "truths": [
   {
    "id": "language-L5-t1",
    "s": "An oxymoron combines two contradictory terms, such as 'bitter sweet'.",
    "answer": true,
    "why": "An oxymoron places contradictory words together for effect."
   },
   {
    "id": "language-L5-t2",
    "s": "A haiku traditionally has seventeen syllables arranged in 5-7-5.",
    "answer": true,
    "why": "The Japanese haiku form uses three lines of 5, 7 and 5 syllables."
   },
   {
    "id": "language-L5-t3",
    "s": "The narrator of a story is always the author.",
    "answer": false,
    "why": "The narrator is a created voice and may differ from the author."
   },
   {
    "id": "language-L5-t4",
    "s": "An adverb can modify an adjective, as in 'extremely cold'.",
    "answer": true,
    "why": "'Extremely' modifies the adjective 'cold', showing adverbs can modify adjectives."
   },
   {
    "id": "language-L5-t5",
    "s": "A gerund is a verb form ending in '-ing' that functions as a noun.",
    "answer": true,
    "why": "In 'Swimming is fun', 'swimming' acts as a noun."
   },
   {
    "id": "language-L5-t6",
    "s": "Wole Soyinka is a Nigerian writer who won the Nobel Prize in Literature.",
    "answer": true,
    "why": "Soyinka won the Nobel Prize in Literature in 1986."
   },
   {
    "id": "language-L5-t7",
    "s": "'Fewer' is correctly used with countable nouns, as in 'fewer apples'.",
    "answer": true,
    "why": "'Fewer' applies to countable items; 'less' to uncountable quantities."
   },
   {
    "id": "language-L5-t8",
    "s": "The word 'bank' can be a homonym with two unrelated meanings, such as a river bank and a financial bank.",
    "answer": true,
    "why": "These are homonyms: same spelling and sound, different meanings."
   },
   {
    "id": "language-L5-t9",
    "s": "A limerick is a serious fourteen-line poem about death.",
    "answer": false,
    "why": "A limerick is a humorous five-line poem with a distinctive rhythm."
   },
   {
    "id": "language-L5-t10",
    "s": "The direct object receives the action of a transitive verb.",
    "answer": true,
    "why": "In 'She read the book', 'the book' receives the action of 'read'."
   },
   {
    "id": "language-L5-t11",
    "s": "Chimamanda Ngozi Adichie wrote the novel 'Half of a Yellow Sun'.",
    "answer": true,
    "why": "Adichie's novel 'Half of a Yellow Sun' is set during the Biafran War."
   },
   {
    "id": "language-L5-t12",
    "s": "In English, a gerund is a verb form ending in '-ing' that functions as a noun, as in 'Swimming is good exercise'.",
    "answer": true,
    "why": "'Swimming' is the subject of the sentence, so it acts as a noun while retaining verb-like meaning."
   },
   {
    "id": "language-L5-t13",
    "s": "The word 'allegory' refers to a story in which characters and events have a second, often moral or political, meaning.",
    "answer": true,
    "why": "An allegory conveys a deeper symbolic meaning beneath the surface narrative, as in Orwell's 'Animal Farm'."
   },
   {
    "id": "language-L5-t14",
    "s": "A sonnet traditionally has sixteen lines.",
    "answer": false,
    "why": "A sonnet traditionally has fourteen lines, not sixteen."
   },
   {
    "id": "language-L5-t15",
    "s": "In English, the prefix 'pre-' means 'before', as in 'prehistoric'.",
    "answer": true,
    "why": "'Pre-' indicates 'before', so 'prehistoric' means before recorded history."
   },
   {
    "id": "language-L5-t16",
    "s": "The novel 'Things Fall Apart' was written by Wole Soyinka.",
    "answer": false,
    "why": "'Things Fall Apart' was written by Chinua Achebe; Soyinka is a different Nigerian writer."
   },
   {
    "id": "language-L5-t17",
    "s": "An iamb is a metrical foot consisting of an unstressed syllable followed by a stressed syllable.",
    "answer": true,
    "why": "An iamb follows the pattern unstressed-stressed, as in 'behold'."
   },
   {
    "id": "language-L5-t18",
    "s": "A 'malapropism' is the deliberate use of a word with the opposite meaning for ironic effect.",
    "answer": false,
    "why": "A malapropism is the unintentional misuse of a similar-sounding word, not deliberate irony."
   }
  ],
  "terms": [
   {
    "id": "language-L5-w1",
    "word": "METAPHOR",
    "clue": "Figure of speech saying one thing is another"
   },
   {
    "id": "language-L5-w2",
    "word": "ALLITERATION",
    "clue": "Repetition of initial consonant sounds in nearby words"
   },
   {
    "id": "language-L5-w3",
    "word": "ONOMATOPOEIA",
    "clue": "Word imitating the sound of what it names"
   },
   {
    "id": "language-L5-w4",
    "word": "CLAUSE",
    "clue": "Group of words containing a subject and a verb"
   },
   {
    "id": "language-L5-w5",
    "word": "STANZA",
    "clue": "Group of lines forming a unit in a poem"
   },
   {
    "id": "language-L5-w6",
    "word": "IRONY",
    "clue": "Expression meaning the opposite of what is said"
   },
   {
    "id": "language-L5-w7",
    "word": "BALLAD",
    "clue": "Narrative poem or song telling a story"
   },
   {
    "id": "language-L5-w8",
    "word": "PROTAGONIST",
    "clue": "The chief character around whom a story revolves"
   }
  ]
 },
 "6": {
  "questions": [
   {
    "id": "language-L6-q1",
    "q": "In 'The professor whom the students admired retired early', what is the grammatical function of 'whom'?",
    "options": [
     "Appositive to 'professor'",
     "Direct object of 'retired'",
     "Subject of the relative clause",
     "Object of the relative clause's verb"
    ],
    "answer": 3,
    "why": "'Whom' is the object of 'admired' inside the relative clause; the subject of that clause is 'the students'.",
    "hint": "Ask who did the admiring and who received it."
   },
   {
    "id": "language-L6-q2",
    "q": "Which sentence contains a defining (restrictive) relative clause?",
    "options": [
     "Her essay, which was long, won no prize.",
     "The poem, which I memorised, is by Soyinka.",
     "My brother, who lives in Accra, is a teacher.",
     "The novel that won the prize was translated into Swahili."
    ],
    "answer": 3,
    "why": "'That won the prize' restricts which novel is meant; the others are set off by commas as non-defining.",
    "hint": "Defining clauses are not separated by commas."
   },
   {
    "id": "language-L6-q3",
    "q": "Which term describes the substitution of a part for the whole, as in 'all hands on deck'?",
    "options": [
     "Synecdoche",
     "Litotes",
     "Metonymy",
     "Zeugma"
    ],
    "answer": 0,
    "why": "Synecdoche uses a part ('hands') for the whole (people); metonymy substitutes an associated thing.",
    "hint": "Think of 'part for whole', not 'associated object'."
   },
   {
    "id": "language-L6-q4",
    "q": "Which writer is associated with the concept of 'negritude' alongside Léopold Sédar Senghor?",
    "options": [
     "Ngũgĩ wa Thiong'o",
     "Wole Soyinka",
     "Chinua Achebe",
     "Aimé Césaire"
    ],
    "answer": 3,
    "why": "Césaire, a Martinican poet, co-founded négritude with Senghor and Damas.",
    "hint": "He came from Martinique, not West Africa."
   },
   {
    "id": "language-L6-q5",
    "q": "Which novel is a postcolonial rewriting of 'Jane Eyre' from the perspective of the first Mrs Rochester?",
    "options": [
     "Purple Hibiscus",
     "Wide Sargasso Sea",
     "Jane Eyre",
     "The God of Small Things"
    ],
    "answer": 1,
    "why": "Jean Rhys's 'Wide Sargasso Sea' reimagines Bertha Mason's Caribbean background.",
    "hint": "The author was born in Dominica."
   },
   {
    "id": "language-L6-q6",
    "q": "Which sentence uses 'who' and 'whom' correctly?",
    "options": [
     "Who did the committee choose, and whom will announce it?",
     "Whom did the committee choose, and whom will announce it?",
     "Who did the committee choose, and who will announce it?",
     "Whom did the committee choose, and who will announce it?"
    ],
    "answer": 3,
    "why": "'Whom' is the object of 'choose'; 'who' is the subject of 'will announce'.",
    "hint": "Test each pronoun by substituting 'he' or 'him'."
   },
   {
    "id": "language-L6-q7",
    "q": "Which of these is an example of litotes?",
    "options": [
     "O kind cruelty!",
     "Kindness itself.",
     "She is as kind as a saint.",
     "She is not unkind."
    ],
    "answer": 3,
    "why": "Litotes affirms something by denying its opposite ('not unkind' = kind).",
    "hint": "It uses a double negative for understatement."
   },
   {
    "id": "language-L6-q8",
    "q": "In 'The committee awarded the youngest candidate the prize', what is 'the prize'?",
    "options": [
     "Direct object",
     "Object complement",
     "Indirect object",
     "Subject complement"
    ],
    "answer": 0,
    "why": "'The prize' is what was awarded (direct object); 'the youngest candidate' is the indirect object.",
    "hint": "Ask 'awarded what?' versus 'awarded to whom?'."
   },
   {
    "id": "language-L6-q9",
    "q": "Which statement about Shakespearean sonnets is correct?",
    "options": [
     "They have three quatrains and a closing couplet.",
     "They have an octave and a sestet.",
     "They have four tercets and a couplet.",
     "They have two quatrains and two couplets."
    ],
    "answer": 0,
    "why": "The Shakespearean (English) form is three quatrains plus a couplet, rhyming abab cdcd efef gg.",
    "hint": "Count the four-line stanzas before the final pair."
   },
   {
    "id": "language-L6-q10",
    "q": "Which word formation process creates 'brunch' from 'breakfast' and 'lunch'?",
    "options": [
     "Blending",
     "Clipping",
     "Back-formation",
     "Conversion"
    ],
    "answer": 0,
    "why": "Blending fuses parts of two words; clipping shortens one word, and back-formation removes a supposed affix.",
    "hint": "Parts of two words are fused together."
   }
  ],
  "truths": [
   {
    "id": "language-L6-t1",
    "s": "A gerund is a verb form ending in -ing that functions as a noun, as in 'Swimming is healthy'.",
    "answer": true,
    "why": "'Swimming' here is the subject, so it acts nominally."
   },
   {
    "id": "language-L6-t2",
    "s": "In English, a restrictive relative clause is normally set off by commas.",
    "answer": false,
    "why": "Restrictive clauses are not comma-separated; non-restrictive ones are."
   },
   {
    "id": "language-L6-t3",
    "s": "The word 'metaphor' comes from Greek roots meaning 'to carry over'.",
    "answer": true,
    "why": "Greek 'meta' (over) plus 'pherein' (to carry) gives the sense of transfer."
   },
   {
    "id": "language-L6-t4",
    "s": "'The wind whispered through the trees' is an example of hyperbole.",
    "answer": false,
    "why": "It is personification, giving the wind a human action."
   },
   {
    "id": "language-L6-t5",
    "s": "Chinua Achebe's 'Things Fall Apart' takes its title from a poem by W. B. Yeats.",
    "answer": true,
    "why": "The phrase comes from Yeats's 'The Second Coming'."
   },
   {
    "id": "language-L6-t6",
    "s": "Derek Walcott, the Caribbean poet and playwright, won the Nobel Prize in Literature.",
    "answer": true,
    "why": "Walcott received the Nobel Prize in Literature in 1992."
   },
   {
    "id": "language-L6-t7",
    "s": "An iamb is a metrical foot of one stressed syllable followed by one unstressed syllable.",
    "answer": false,
    "why": "An iamb is unstressed then stressed; stressed-then-unstressed is a trochee."
   },
   {
    "id": "language-L6-t8",
    "s": "The term 'oxymoron' derives from Greek words meaning 'sharp' and 'dull'.",
    "answer": true,
    "why": "Greek 'oxys' (sharp) plus 'moros' (dull) yields the contradiction in terms."
   },
   {
    "id": "language-L6-t9",
    "s": "'The God of Small Things' was written by Arundhati Roy.",
    "answer": true,
    "why": "Roy's debut novel won the Booker Prize in 1997."
   },
   {
    "id": "language-L6-t10",
    "s": "A 'portmanteau word' is formed by adding a prefix to an existing word.",
    "answer": false,
    "why": "A portmanteau blends parts of two words, as in 'smog'."
   },
   {
    "id": "language-L6-t11",
    "s": "Wole Soyinka's play 'Death and the King's Horseman' is set in Nigeria.",
    "answer": true,
    "why": "It dramatises events in colonial-era Yoruba society."
   },
   {
    "id": "language-L6-t12",
    "s": "In English, the passive voice always requires a form of the verb 'to be'.",
    "answer": false,
    "why": "Get-passives ('he got fired') are passive without 'be'."
   },
   {
    "id": "language-L6-t13",
    "s": "The word 'nice' originally meant 'foolish' or 'simple' in earlier English.",
    "answer": true,
    "why": "Its sense shifted over centuries from foolish to pleasant."
   },
   {
    "id": "language-L6-t14",
    "s": "A 'villanelle' is a nineteen-line poem with five tercets and a closing quatrain.",
    "answer": true,
    "why": "The form repeats two rhymes and two refrains across nineteen lines."
   },
   {
    "id": "language-L6-t15",
    "s": "The prefix 'anti-' in 'antisocial' means 'before'.",
    "answer": false,
    "why": "'Anti-' means 'against'; 'before' would be 'ante-'."
   },
   {
    "id": "language-L6-t16",
    "s": "'The pen is mightier than the sword' relies on metonymy, with 'pen' standing for writing.",
    "answer": true,
    "why": "The pen stands for the written word by association."
   },
   {
    "id": "language-L6-t17",
    "s": "Jean Rhys's 'Wide Sargasso Sea' is set partly in Jamaica and Dominica.",
    "answer": true,
    "why": "The novel's Caribbean setting includes both islands."
   },
   {
    "id": "language-L6-t18",
    "s": "An 'epigram' is a long narrative poem about heroic deeds.",
    "answer": false,
    "why": "An epigram is a brief, witty saying; the long heroic poem is an epic."
   }
  ],
  "terms": [
   {
    "id": "language-L6-w1",
    "word": "ANAPHORA",
    "clue": "Repetition of a word or phrase at the start of successive clauses"
   },
   {
    "id": "language-L6-w2",
    "word": "ZEUGMA",
    "clue": "Figure where one word governs two others incongruously"
   },
   {
    "id": "language-L6-w3",
    "word": "ASSONANCE",
    "clue": "Repetition of vowel sounds within nearby words"
   },
   {
    "id": "language-L6-w4",
    "word": "ENJAMBMENT",
    "clue": "Line break that runs on without punctuation into the next"
   },
   {
    "id": "language-L6-w5",
    "word": "DACTYL",
    "clue": "Metrical foot of one stressed and two unstressed syllables"
   },
   {
    "id": "language-L6-w6",
    "word": "MALAPROPISM",
    "clue": "Comic misuse of a similar-sounding word"
   },
   {
    "id": "language-L6-w7",
    "word": "APOSTROPHE",
    "clue": "Address to an absent person or abstraction as if present"
   },
   {
    "id": "language-L6-w8",
    "word": "COLLOCATION",
    "clue": "Habitual co-occurrence of words such as 'heavy rain'"
   }
  ]
 },
 "7": {
  "questions": [
   {
    "id": "language-L7-q1",
    "q": "In the sentence 'The critics considered the novel's ending ambiguous', which syntactic function does 'ambiguous' perform?",
    "options": [
     "appositive",
     "adverbial",
     "subject complement",
     "object complement"
    ],
    "answer": 3,
    "why": "'Ambiguous' describes the object 'the novel's ending' after the verb 'considered', so it is an object complement.",
    "hint": "Ask what the ending is said to be, not what the subject is."
   },
   {
    "id": "language-L7-q2",
    "q": "Which sentence contains a cataphoric reference?",
    "options": [
     "Speaking last, the chair surprised the panel.",
     "The panel was surprised when the chair spoke.",
     "She spoke, and the panel was surprised.",
     "When she finally spoke, the chair of the panel surprised everyone."
    ],
    "answer": 3,
    "why": "'She' points forward to 'the chair of the panel', which appears later, making it cataphoric.",
    "hint": "Look for a pronoun whose referent arrives afterwards."
   },
   {
    "id": "language-L7-q3",
    "q": "Which pair of words is related by conversion (zero derivation)?",
    "options": [
     "'unhappy' and 'happy'",
     "'email' used as noun and verb",
     "'sing' and 'sang'",
     "'happy' and 'happiness'"
    ],
    "answer": 1,
    "why": "Conversion changes word class without adding an affix, as when the noun 'email' becomes a verb.",
    "hint": "No affix is added in the correct pair."
   },
   {
    "id": "language-L7-q4",
    "q": "In 'The lecturer whom we consulted recommended a bibliography', what is the grammatical function of 'whom'?",
    "options": [
     "object of 'consulted'",
     "subject of 'recommended'",
     "object of 'recommended'",
     "possessive determiner"
    ],
    "answer": 0,
    "why": "'Whom' is the object of the verb 'consulted' inside the relative clause.",
    "hint": "Test by replacing it with 'we consulted him'."
   },
   {
    "id": "language-L7-q5",
    "q": "Which sentence contains a presupposition trigger rather than an entailment?",
    "options": [
     "Amina stopped writing poetry last year.",
     "Amina writes poetry every day.",
     "Amina is a poet.",
     "Amina wrote a poem yesterday."
    ],
    "answer": 0,
    "why": "'Stopped' presupposes that Amina previously wrote poetry, whereas the other sentences assert rather than presuppose.",
    "hint": "Which verb assumes the action happened before?"
   },
   {
    "id": "language-L7-q6",
    "q": "Which statement about the rhyme scheme of a Shakespearean sonnet is correct?",
    "options": [
     "Its three quatrains rhyme alternately and the couplet rhymes aa.",
     "It rhymes abbaabba then cdecde.",
     "It rhymes abab baba cdcd ee.",
     "It has no fixed rhyme scheme."
    ],
    "answer": 0,
    "why": "A Shakespearean sonnet rhymes abab cdcd efef gg, with alternating quatrains and a final couplet.",
    "hint": "Think of three separate quatrains plus a closing pair."
   },
   {
    "id": "language-L7-q7",
    "q": "In 'The professor whom the students admired retired early', what is 'whom the students admired'?",
    "options": [
     "a non-defining relative clause",
     "an appositive phrase",
     "a participial phrase",
     "a defining relative clause"
    ],
    "answer": 3,
    "why": "It restricts which professor is meant and has no commas, so it is defining (restrictive).",
    "hint": "Does the clause identify the professor or merely add information?"
   },
   {
    "id": "language-L7-q8",
    "q": "Which writer is associated with the concept of négritude alongside Léopold Sédar Senghor?",
    "options": [
     "Derek Walcott",
     "Aimé Césaire",
     "Chinua Achebe",
     "Wole Soyinka"
    ],
    "answer": 1,
    "why": "Aimé Césaire, with Senghor and Léon Damas, developed the négritude movement.",
    "hint": "The writer came from Martinique."
   },
   {
    "id": "language-L7-q9",
    "q": "Which novel is a postcolonial rewriting of 'Jane Eyre' from the perspective of the first Mrs Rochester?",
    "options": [
     "Wide Sargasso Sea",
     "Things Fall Apart",
     "Purple Hibiscus",
     "The God of Small Things"
    ],
    "answer": 0,
    "why": "Jean Rhys's 'Wide Sargasso Sea' reimagines Bertha Mason's story before and during 'Jane Eyre'.",
    "hint": "The author was born in Dominica."
   },
   {
    "id": "language-L7-q10",
    "q": "In the sentence 'Having finished the report, the manager sent it to the client', what is the grammatical function of 'Having finished the report'?",
    "options": [
     "A dangling modifier",
     "An absolute construction",
     "A gerund phrase acting as subject",
     "A participial phrase modifying 'the manager'"
    ],
    "answer": 3,
    "why": "The perfect participle phrase describes the manager, the subject of the main clause, so it modifies 'the manager'.",
    "hint": "Ask who performed the action in the phrase and whether that doer matches the main subject."
   },
   {
    "id": "language-L7-q11",
    "q": "Which word formation process produces 'laser' from 'light amplification by stimulated emission of radiation'?",
    "options": [
     "Clipping",
     "Back-formation",
     "Acronymy",
     "Blending"
    ],
    "answer": 2,
    "why": "'Laser' is formed from the initial letters of a phrase and pronounced as a word, which is an acronym.",
    "hint": "Consider whether the new word is pronounced as a single word rather than letter by letter."
   },
   {
    "id": "language-L7-q12",
    "q": "In 'The critic praised the novel that won the prize', which element is a restrictive relative clause?",
    "options": [
     "The critic praised",
     "that won the prize",
     "praised the novel",
     "the novel that won"
    ],
    "answer": 1,
    "why": "'That won the prize' is a defining (restrictive) relative clause identifying which novel is meant.",
    "hint": "A restrictive clause is essential to identify the noun it modifies."
   },
   {
    "id": "language-L7-q13",
    "q": "Which writer is most closely associated with the theory of 'negritude' developed with Léopold Sédar Senghor and Léon Damas?",
    "options": [
     "Derek Walcott",
     "Chinua Achebe",
     "Aimé Césaire",
     "Wole Soyinka"
    ],
    "answer": 2,
    "why": "Aimé Césaire, the Martinican poet, co-founded the negritude movement with Senghor and Damas.",
    "hint": "The writer came from Martinique and wrote 'Notebook of a Return to the Native Land'."
   }
  ],
  "truths": [
   {
    "id": "language-L7-t1",
    "s": "In English, a restrictive relative clause is normally not separated from its antecedent by commas.",
    "answer": true,
    "why": "Restrictive clauses identify the antecedent and are integrated without commas."
   },
   {
    "id": "language-L7-t2",
    "s": "The word 'brunch' is formed by blending 'breakfast' and 'lunch'.",
    "answer": true,
    "why": "A blend combines parts of two words, as brunch does."
   },
   {
    "id": "language-L7-t3",
    "s": "Assonance is the repetition of consonant sounds at the ends of words.",
    "answer": false,
    "why": "Assonance is the repetition of vowel sounds; repetition of final consonants is consonance."
   },
   {
    "id": "language-L7-t4",
    "s": "In phonology, a minimal pair differs in exactly two phonemes.",
    "answer": false,
    "why": "A minimal pair differs in exactly one phoneme, as 'pat' and 'bat' do."
   },
   {
    "id": "language-L7-t5",
    "s": "Chinua Achebe wrote the novel 'Things Fall Apart'.",
    "answer": true,
    "why": "Achebe's 1958 novel is a landmark of African literature."
   },
   {
    "id": "language-L7-t6",
    "s": "Derek Walcott, the Caribbean poet and playwright, won the Nobel Prize in Literature.",
    "answer": true,
    "why": "Walcott received the Nobel Prize in Literature in 1992."
   },
   {
    "id": "language-L7-t7",
    "s": "The term 'oxymoron' describes a figure that joins two contradictory terms, such as 'bitter sweet'.",
    "answer": true,
    "why": "An oxymoron yokes together apparently contradictory words."
   },
   {
    "id": "language-L7-t8",
    "s": "In English morphology, 'un-' in 'unhappy' is an inflectional affix.",
    "answer": false,
    "why": "'Un-' is derivational because it creates a new lexical item, not an inflected form."
   },
   {
    "id": "language-L7-t9",
    "s": "A synecdoche substitutes a part for the whole, as in 'all hands on deck'.",
    "answer": true,
    "why": "'Hands' stands for the whole people, which is synecdoche."
   },
   {
    "id": "language-L7-t10",
    "s": "The God of Small Things was written by Arundhati Roy.",
    "answer": true,
    "why": "Roy's debut novel won the Booker Prize in 1997."
   },
   {
    "id": "language-L7-t11",
    "s": "In English, the present perfect tense typically links a past situation to the present.",
    "answer": true,
    "why": "The present perfect expresses past events with present relevance."
   },
   {
    "id": "language-L7-t12",
    "s": "A defining relative clause can be omitted without changing the basic meaning of the main clause.",
    "answer": false,
    "why": "A defining clause identifies the antecedent, so omitting it changes the meaning."
   },
   {
    "id": "language-L7-t13",
    "s": "The word 'television' is an example of a clipped compound.",
    "answer": false,
    "why": "'Television' is a compound of Greek and Latin roots, not a clipped compound like 'sitcom'."
   },
   {
    "id": "language-L7-t14",
    "s": "Wole Soyinka wrote the play 'Death and the King's Horseman'.",
    "answer": true,
    "why": "Soyinka's play is based on a historical incident in Nigeria."
   },
   {
    "id": "language-L7-t15",
    "s": "Jean Rhys's 'Wide Sargasso Sea' is set partly in Jamaica and Dominica.",
    "answer": true,
    "why": "The novel moves between Jamaica and Dominica in the Caribbean."
   },
   {
    "id": "language-L7-t16",
    "s": "In English, 'whom' can serve as the subject of a finite verb in formal standard usage.",
    "answer": false,
    "why": "'Whom' is the objective form; the subject form is 'who'."
   },
   {
    "id": "language-L7-t17",
    "s": "In English, a restrictive relative clause is normally set off by commas, while a non-restrictive clause is not.",
    "answer": false,
    "why": "It is the reverse: non-restrictive clauses take commas, restrictive clauses do not."
   },
   {
    "id": "language-L7-t18",
    "s": "Litotes is a figure of speech in which an affirmative is expressed by negating its opposite, as in 'not bad' for 'good'.",
    "answer": true,
    "why": "This is the standard definition of litotes."
   }
  ],
  "terms": [
   {
    "id": "language-L7-w1",
    "word": "CATAPHORA",
    "clue": "Reference to something mentioned later in the text."
   },
   {
    "id": "language-L7-w2",
    "word": "LITOTES",
    "clue": "Understatement by denying the opposite, as 'not bad'."
   },
   {
    "id": "language-L7-w3",
    "word": "MORPHEME",
    "clue": "Smallest unit of meaning in a word."
   },
   {
    "id": "language-L7-w4",
    "word": "PERSONA",
    "clue": "Speaker or voice created by an author in a poem."
   },
   {
    "id": "language-L7-w5",
    "word": "HYPERBATON",
    "clue": "Deliberate inversion of normal word order for effect."
   },
   {
    "id": "language-L7-w6",
    "word": "ANAPHORA",
    "clue": "Repetition of a word or phrase at the start of successive clauses."
   },
   {
    "id": "language-L7-w7",
    "word": "SYNECDOCHE",
    "clue": "Figure naming a part for the whole, or the whole for a part."
   },
   {
    "id": "language-L7-w8",
    "word": "DIGLOSSIA",
    "clue": "Coexistence of two varieties of a language in one community."
   },
   {
    "id": "language-L7-w9",
    "word": "ENJAMBMENT",
    "clue": "Running a sentence past the end of a line of verse."
   },
   {
    "id": "language-L7-w10",
    "word": "PORTMANTEAU",
    "clue": "Blend word packing two meanings, like 'brunch' or 'smog'."
   }
  ]
 },
 "8": {
  "questions": [
   {
    "id": "language-L8-q1",
    "q": "Which sentence contains a subject complement rather than a direct object?",
    "options": [
     "She wrote a celebrated novel.",
     "She became a celebrated novelist.",
     "She read the novel quickly.",
     "She gave the novel to him.",
     "She praised the novel warmly."
    ],
    "answer": 1,
    "why": "'Became' is a linking verb, so 'a celebrated novelist' is a subject complement describing the subject, not an object.",
    "hint": "Look for a verb that links rather than acts."
   },
   {
    "id": "language-L8-q2",
    "q": "In 'The reviewer claimed that the author had plagiarised the opening chapter', what is the function of the clause introduced by 'that'?",
    "options": [
     "It is a comparative clause.",
     "It is a complement clause acting as the object of 'claimed'.",
     "It is a relative clause modifying 'reviewer'.",
     "It is an adverbial clause of reason.",
     "It is a non-finite purpose clause."
    ],
    "answer": 1,
    "why": "'That the author had plagiarised...' is a declarative complement clause selected by the verb 'claimed'.",
    "hint": "Ask what the reviewer claimed."
   },
   {
    "id": "language-L8-q3",
    "q": "Which of these is an example of metonymy rather than synecdoche?",
    "options": [
     "He is a new face in the team.",
     "She has a good head on her shoulders.",
     "All hands were on deck.",
     "The Crown rejected the petition.",
     "They counted fifty head of cattle."
    ],
    "answer": 3,
    "why": "'The Crown' stands for the monarchy by association, which is metonymy; the other options substitute part for whole.",
    "hint": "One substitutes an associated entity, not a part."
   },
   {
    "id": "language-L8-q4",
    "q": "Which statement about free indirect discourse is correct?",
    "options": [
     "It is the use of an omniscient narrator who never enters characters' minds.",
     "It is a form of unreliable first-person narration.",
     "It is a dramatic technique found only in stage plays.",
     "It reports speech only in direct quotation.",
     "It blends a character's voice with third-person narration without quotation marks."
    ],
    "answer": 4,
    "why": "Free indirect discourse merges third-person narrative with a character's idiom and viewpoint, without tags or quotes.",
    "hint": "Think of Austen or Flaubert sliding into a character's idiom."
   },
   {
    "id": "language-L8-q5",
    "q": "Which writer's work is most associated with the concept of 'abrogation' in postcolonial theory?",
    "options": [
     "Wole Soyinka",
     "Derek Walcott",
     "Ngũgĩ wa Thiong'o",
     "Chinua Achebe",
     "Ama Ata Aidoo"
    ],
    "answer": 2,
    "why": "Ngũgĩ's decision to abandon English for Gikuyu is the standard example of abrogation, the rejection of the coloniser's language.",
    "hint": "Consider the author who stopped writing in English."
   },
   {
    "id": "language-L8-q6",
    "q": "In 'It was the ending that surprised the critics', which construction is being used?",
    "options": [
     "A cleft sentence",
     "A passive sentence",
     "A comparative sentence",
     "An existential sentence",
     "A conditional sentence"
    ],
    "answer": 0,
    "why": "'It was the ending that...' is an it-cleft, foregrounding 'the ending' as focus.",
    "hint": "The sentence splits into two clauses to highlight one element."
   },
   {
    "id": "language-L8-q7",
    "q": "Which description of a Shakespearean sonnet's structure is accurate?",
    "options": [
     "Three quatrains and a closing couplet",
     "An octave and a sestet",
     "Two quatrains and two couplets",
     "Four tercets and a couplet",
     "A single sixteen-line stanza"
    ],
    "answer": 0,
    "why": "The English or Shakespearean sonnet consists of three quatrains followed by a rhyming couplet.",
    "hint": "Count the four-line units before the final pair."
   },
   {
    "id": "language-L8-q8",
    "q": "Which sentence contains a presupposition trigger?",
    "options": [
     "She will write poetry after the war.",
     "She may write poetry after the war.",
     "She wrote poetry after the war.",
     "She stopped writing poetry after the war.",
     "She enjoys writing poetry."
    ],
    "answer": 3,
    "why": "'Stopped' presupposes that she had been writing poetry; the other sentences entail nothing of the kind.",
    "hint": "Which verb assumes a prior state?"
   },
   {
    "id": "language-L8-q9",
    "q": "Which term describes the phenomenon whereby a word's meaning narrows over time, as when 'meat' came to mean only animal flesh?",
    "options": [
     "Semantic amelioration",
     "Semantic broadening",
     "Semantic bleaching",
     "Semantic pejoration",
     "Semantic narrowing"
    ],
    "answer": 4,
    "why": "Restriction of a word's sense to a narrower category is semantic narrowing (specialisation).",
    "hint": "The range of meaning shrank."
   },
   {
    "id": "language-L8-q10",
    "q": "Which of these lines best exemplifies litotes?",
    "options": [
     "She is not unattractive.",
     "She is as bright as the sun.",
     "She wept a river of tears.",
     "She has a heart of stone.",
     "She is the sun in my sky."
    ],
    "answer": 0,
    "why": "Litotes affirms something by negating its opposite, as in 'not unattractive'.",
    "hint": "Two negatives make a mild positive."
   },
   {
    "id": "language-L8-q11",
    "q": "Which writer is associated with the 'theatre of the absurd' and wrote 'Waiting for Godot'?",
    "options": [
     "Samuel Beckett",
     "Harold Pinter",
     "Eugène Ionesco",
     "Arthur Miller",
     "Tom Stoppard"
    ],
    "answer": 0,
    "why": "'Waiting for Godot' (1953) is Beckett's defining absurdist play.",
    "hint": "An Irish writer who also wrote in French."
   },
   {
    "id": "language-L8-q12",
    "q": "In 'The lecturer had the students revise their drafts', which type of construction is 'had the students revise'?",
    "options": [
     "A causative construction with a bare infinitive",
     "A passive construction",
     "A relative clause",
     "A participle clause",
     "A subjunctive complement"
    ],
    "answer": 0,
    "why": "'Have + object + bare infinitive' is a causative construction meaning 'caused them to revise'.",
    "hint": "Someone is making someone else do something."
   },
   {
    "id": "language-L8-q13",
    "q": "In the sentence 'The committee considered the proposal unacceptable', what is the grammatical function of 'unacceptable'?",
    "options": [
     "Object complement",
     "Subject complement",
     "Postmodifier of 'proposal'",
     "Adverbial adjunct",
     "Direct object"
    ],
    "answer": 0,
    "why": "'Unacceptable' predicates something of the object 'the proposal', making it an object complement; a subject complement would describe the subject.",
    "hint": "Ask what the adjective describes: the subject or the object."
   },
   {
    "id": "language-L8-q14",
    "q": "Which writer developed the theory of négritude together with Léopold Sédar Senghor?",
    "options": [
     "Derek Walcott",
     "Aimé Césaire",
     "Wole Soyinka",
     "Chinua Achebe",
     "Ngũgĩ wa Thiong'o"
    ],
    "answer": 1,
    "why": "Aimé Césaire, the Martinican poet, co-founded the négritude movement with Senghor and Léon-Gontran Damas.",
    "hint": "The co-founder came from Martinique."
   },
   {
    "id": "language-L8-q15",
    "q": "Which novel rewrites 'Jane Eyre' from the viewpoint of the first Mrs Rochester?",
    "options": [
     "Wide Sargasso Sea",
     "The God of Small Things",
     "Purple Hibiscus",
     "Things Fall Apart",
     "Midnight's Children"
    ],
    "answer": 0,
    "why": "Jean Rhys's 'Wide Sargasso Sea' is a postcolonial prequel centred on Antoinette, the first Mrs Rochester.",
    "hint": "The author was born in Dominica."
   },
   {
    "id": "language-L8-q16",
    "q": "In 'The lecturer whom we consulted recommended a bibliography', what is the grammatical function of 'whom'?",
    "options": [
     "Indirect object",
     "Subject of 'consulted'",
     "Object of the preposition 'to'",
     "Relative determiner",
     "Direct object of 'consulted'"
    ],
    "answer": 4,
    "why": "'Whom' is the object of the verb 'consulted' in the relative clause, so the objective form is required.",
    "hint": "Check whether the relative pronoun acts as subject or object inside its clause."
   }
  ],
  "truths": [
   {
    "id": "language-L8-t1",
    "s": "In English, 'whom' can function as the object of a preposition in formal usage, as in 'to whom it may concern'.",
    "answer": true,
    "why": "'Whom' is the objective form used after prepositions in formal registers."
   },
   {
    "id": "language-L8-t2",
    "s": "A gerund is a verb form that functions syntactically as a noun, as in 'Swimming is healthy'.",
    "answer": true,
    "why": "'Swimming' heads the subject noun phrase, so it is a gerund."
   },
   {
    "id": "language-L8-t3",
    "s": "The word 'nice' has undergone pejoration, moving from 'foolish' to 'pleasant'.",
    "answer": false,
    "why": "That change is amelioration, a shift to a more favourable sense, not pejoration."
   },
   {
    "id": "language-L8-t4",
    "s": "In a Shakespearean sonnet, the volta typically falls between the octave and the sestet.",
    "answer": false,
    "why": "That placement belongs to the Petrarchan sonnet; in the Shakespearean form the turn often comes at the final couplet."
   },
   {
    "id": "language-L8-t5",
    "s": "Chinua Achebe's 'Things Fall Apart' takes its title from a poem by W. B. Yeats.",
    "answer": true,
    "why": "The title comes from 'The Second Coming' by Yeats."
   },
   {
    "id": "language-L8-t6",
    "s": "Derek Walcott, the Nobel laureate from Saint Lucia, wrote the epic poem 'Omeros'.",
    "answer": true,
    "why": "'Omeros' (1990) is Walcott's Caribbean reworking of Homeric epic."
   },
   {
    "id": "language-L8-t7",
    "s": "In English morphology, 'unhappiness' contains two inflectional affixes.",
    "answer": false,
    "why": "'Un-' and '-ness' are derivational; English has very few inflectional affixes, chiefly -s, -ed, -ing, -er, -est."
   },
   {
    "id": "language-L8-t8",
    "s": "A restrictive relative clause can be omitted without changing the basic meaning of the main clause.",
    "answer": false,
    "why": "Omitting a restrictive clause changes the reference; it is the non-restrictive clause that is parenthetical."
   },
   {
    "id": "language-L8-t9",
    "s": "The term 'deixis' covers expressions such as 'here', 'now' and 'you' whose reference depends on context.",
    "answer": true,
    "why": "Deictic expressions are anchored to the speaker, time and place of utterance."
   },
   {
    "id": "language-L8-t10",
    "s": "In 'The book was written by Orwell', 'by Orwell' is the subject of the sentence.",
    "answer": false,
    "why": "'By Orwell' is the agent phrase; the grammatical subject is 'The book'."
   },
   {
    "id": "language-L8-t11",
    "s": "Roman Jakobson's model of communication includes a 'phatic' function, concerned with maintaining contact between participants.",
    "answer": true,
    "why": "Jakobson's six functions include the phatic function, as in small talk."
   },
   {
    "id": "language-L8-t12",
    "s": "The literary term 'bildungsroman' denotes a novel of education or formative growth.",
    "answer": true,
    "why": "A bildungsroman traces a protagonist's psychological and moral development."
   },
   {
    "id": "language-L8-t13",
    "s": "In English, 'who' is always used for human referents and 'which' for non-human ones, with no exceptions in standard usage.",
    "answer": false,
    "why": "'Which' can refer to humans in some constructions, and 'whose' applies to both; the rule is not absolute."
   },
   {
    "id": "language-L8-t14",
    "s": "The word 'laser' is an acronym, formed from the initial letters of 'light amplification by stimulated emission of radiation'.",
    "answer": true,
    "why": "'Laser' is a classic acronym pronounced as a word."
   },
   {
    "id": "language-L8-t15",
    "s": "Assonance is the repetition of consonant sounds, especially at the beginnings of words.",
    "answer": false,
    "why": "That describes alliteration; assonance is the repetition of vowel sounds."
   },
   {
    "id": "language-L8-t16",
    "s": "The Nigerian writer Wole Soyinka was the first African to win the Nobel Prize in Literature.",
    "answer": true,
    "why": "Soyinka won the Nobel Prize in Literature in 1986."
   },
   {
    "id": "language-L8-t17",
    "s": "In English, the present perfect cannot normally co-occur with a definite past-time adverbial such as 'yesterday'.",
    "answer": true,
    "why": "The present perfect resists definite past-time adverbs, which require the simple past."
   },
   {
    "id": "language-L8-t18",
    "s": "'Conversion' (zero derivation) is the process by which a word changes category without any affix, as in 'to google'.",
    "answer": true,
    "why": "Conversion changes word class with no overt marker, as noun 'google' becoming a verb."
   },
   {
    "id": "language-L8-t19",
    "s": "In a Shakespearean sonnet, the quatrains typically rhyme abab cdcd efef, and the closing couplet rhymes gg.",
    "answer": true,
    "why": "This is the standard rhyme scheme of the English or Shakespearean sonnet form."
   }
  ],
  "terms": [
   {
    "id": "language-L8-w1",
    "word": "ONOMATOPOEIA",
    "clue": "Words imitating natural sounds, like buzz or hiss."
   },
   {
    "id": "language-L8-w2",
    "word": "SYNECDOCHE",
    "clue": "Substituting a part for the whole, as in 'all hands'."
   },
   {
    "id": "language-L8-w3",
    "word": "BILDUNGSROMAN",
    "clue": "Novel tracing a protagonist's growth and education."
   },
   {
    "id": "language-L8-w4",
    "word": "PRESUPPOSITION",
    "clue": "Background assumption taken for granted by an utterance."
   },
   {
    "id": "language-L8-w5",
    "word": "ENJAMBMENT",
    "clue": "A line of verse running on without a pause into the next."
   },
   {
    "id": "language-L8-w6",
    "word": "MORPHEME",
    "clue": "Smallest meaningful unit of grammar, such as a prefix."
   },
   {
    "id": "language-L8-w7",
    "word": "DIEGESIS",
    "clue": "The narrated world of a story as distinct from its telling."
   },
   {
    "id": "language-L8-w8",
    "word": "SINOFICATION",
    "clue": "Adoption of Chinese linguistic or cultural features in literature."
   },
   {
    "id": "language-L8-w9",
    "word": "METONYMY",
    "clue": "Figure naming something by a closely associated thing, as crown for monarchy."
   }
  ]
 },
 "9": {
  "questions": [
   {
    "id": "language-L9-q1",
    "q": "In Chomskyan syntax, which term describes the level of representation that feeds semantic interpretation?",
    "options": [
     "Deep Structure",
     "Surface Structure",
     "Phonetic Form",
     "Logical Form",
     "Government"
    ],
    "answer": 3,
    "why": "Logical Form (LF) is the interface level between syntax and semantics in Government and Binding theory; Phonetic Form interfaces with phonology.",
    "hint": "It is the semantic interface, not the phonological one."
   },
   {
    "id": "language-L9-q2",
    "q": "In 'The lecturer had the students revise their drafts', what type of construction is 'had'?",
    "options": [
     "Passive",
     "Modal",
     "Ergative",
     "Copular",
     "Causative"
    ],
    "answer": 4,
    "why": "'Have' here means 'cause someone to do something', which is a causative construction. It is not a modal or passive auxiliary.",
    "hint": "The lecturer causes the students to act."
   },
   {
    "id": "language-L9-q3",
    "q": "In the sentence 'The committee considered the proposal unacceptable', what is the grammatical function of 'unacceptable'?",
    "options": [
     "Direct object",
     "Adverbial",
     "Subject complement",
     "Object complement",
     "Pre-modifier"
    ],
    "answer": 3,
    "why": "'Unacceptable' is an object complement predicated of the direct object 'the proposal' after the verb 'consider'.",
    "hint": "It describes the object, not the subject."
   },
   {
    "id": "language-L9-q4",
    "q": "Which term describes the phenomenon whereby a word's meaning narrows over time?",
    "options": [
     "Pejoration",
     "Generalisation",
     "Tabooisation",
     "Amelioration",
     "Specialisation"
    ],
    "answer": 4,
    "why": "Specialisation (narrowing) is when a word's sense becomes more restricted, as 'meat' once meant food in general.",
    "hint": "The opposite of broadening."
   },
   {
    "id": "language-L9-q5",
    "q": "In 'The reviewer claimed that the author had plagiarised the opening chapter', what is the grammatical function of 'that the author had plagiarised the opening chapter'?",
    "options": [
     "Direct object clause",
     "Relative clause",
     "Subject clause",
     "Adverbial clause",
     "Appositive"
    ],
    "answer": 0,
    "why": "The that-clause is the direct object of 'claimed', a complement clause functioning as object.",
    "hint": "It answers 'claimed what?'"
   },
   {
    "id": "language-L9-q6",
    "q": "Which writer's theory most centrally employs the term 'abrogation' in postcolonial criticism?",
    "options": [
     "Ama Ata Aidoo",
     "Derek Walcott",
     "Wole Soyinka",
     "Chinua Achebe",
     "Ngũgĩ wa Thiong'o"
    ],
    "answer": 4,
    "why": "Ngũgĩ, with 'decolonising the mind', argues for abrogating the coloniser's language and then appropriating it, a pairing central to postcolonial theory.",
    "hint": "The same writer advocated writing in Gikuyu rather than English."
   },
   {
    "id": "language-L9-q7",
    "q": "Which sentence contains a factive presupposition trigger?",
    "options": [
     "The deadline might have passed.",
     "The committee may let the deadline pass.",
     "If the deadline passes, the committee will meet.",
     "The committee asked whether the deadline had passed.",
     "The committee regretted that the deadline had passed."
    ],
    "answer": 4,
    "why": "Factive verbs such as 'regret' presuppose the truth of their complement clause, unlike 'ask whether' or conditionals.",
    "hint": "Which verb commits the speaker to the truth of the embedded proposition?"
   },
   {
    "id": "language-L9-q8",
    "q": "What does the term 'narrowing' (specialisation) describe in semantic change?",
    "options": [
     "A word shifts to a new referent by metaphor.",
     "A word's sense becomes broader.",
     "A word rises in social prestige.",
     "A word acquires a pejorative sense.",
     "A word's sense becomes more restricted than before."
    ],
    "answer": 4,
    "why": "Narrowing is restriction of sense, as when 'meat' once meant food in general and now denotes animal flesh.",
    "hint": "Contrast it with broadening or amelioration."
   },
   {
    "id": "language-L9-q9",
    "q": "In 'The critics considered the novel's ending ambiguous', what is the syntactic function of 'ambiguous'?",
    "options": [
     "modifier of 'ending'",
     "subject complement",
     "object complement",
     "direct object",
     "adjunct"
    ],
    "answer": 2,
    "why": "'Ambiguous' is a predicative complement predicated of the object 'the novel's ending', an object complement.",
    "hint": "It describes the object, not the subject."
   },
   {
    "id": "language-L9-q10",
    "q": "Which statement about the Great Vowel Shift is correct?",
    "options": [
     "It shortened all long vowels in the sixteenth century.",
     "It raised and diphthongised long vowels in English between roughly 1400 and 1700.",
     "It affected only consonants in Middle English.",
     "It occurred before the Norman Conquest.",
     "It applied only to unstressed syllables."
    ],
    "answer": 1,
    "why": "The shift systematically raised long vowels, turning /iː/ and /uː/ into diphthongs, reshaping English vowel phonology.",
    "hint": "Think of the vowel in 'bite' compared with earlier 'beet'-like values."
   },
   {
    "id": "language-L9-q11",
    "q": "In Systemic Functional Linguistics, which metafunction is realised by the transitivity system of participant roles and processes?",
    "options": [
     "Interpersonal",
     "Ideational",
     "Textual",
     "Logical",
     "Semantic"
    ],
    "answer": 1,
    "why": "Halliday's ideational metafunction construes experience through processes, participants and circumstances; the interpersonal is realised by mood and modality, the textual by theme and information structure.",
    "hint": "It is the function concerned with representing experience, not with enacting social relations."
   },
   {
    "id": "language-L9-q12",
    "q": "Which term describes the process by which a creole develops from a pidgin, typically involving expansion of vocabulary and grammar?",
    "options": [
     "Pidginisation",
     "Creolisation",
     "Koineisation",
     "Relexification",
     "Decreolisation"
    ],
    "answer": 1,
    "why": "Creolisation is the nativisation and expansion of a pidgin into a full language; decreolisation is the later convergence towards the superstrate.",
    "hint": "The term names the birth of the creole itself, not its later drift."
   },
   {
    "id": "language-L9-q13",
    "q": "In Gricean pragmatics, which maxim is flouted when a speaker says 'Some of the students passed' to implicate that not all did?",
    "options": [
     "Maxim of Quantity",
     "Maxim of Quality",
     "Maxim of Relation",
     "Maxim of Politeness",
     "Maxim of Manner"
    ],
    "answer": 0,
    "why": "The scale implicature arises because 'some' is informationally weaker than 'all'; the speaker flouts Quantity by giving less information than required, generating the implicature.",
    "hint": "It concerns how much information is supplied."
   },
   {
    "id": "language-L9-q14",
    "q": "Which writer's novel 'Devil on the Cross' was written while the author was detained in a Kenyan maximum-security prison?",
    "options": [
     "Tsitsi Dangarembga",
     "Chinua Achebe",
     "Ngũgĩ wa Thiong'o",
     "Wole Soyinka",
     "Ayi Kwei Armah"
    ],
    "answer": 2,
    "why": "Ngũgĩ wrote 'Devil on the Cross' (Caitaani mũtharaba-Inĩ) on toilet paper in Kamiti prison, first in Gĩkũyũ, before his exile.",
    "hint": "The author later renounced writing in English."
   },
   {
    "id": "language-L9-q15",
    "q": "Which term describes the phenomenon whereby a word's meaning broadens over time, as when 'bird' once meant a small nestling but now denotes any avian?",
    "options": [
     "Pejoration",
     "Metonymic shift",
     "Semantic broadening",
     "Semantic narrowing",
     "Amelioration"
    ],
    "answer": 2,
    "why": "Semantic broadening (generalisation) is the extension of a word's sense from a narrower to a wider category; 'bird' is the textbook example.",
    "hint": "Think of a word's meaning getting wider, not narrower."
   }
  ],
  "truths": [
   {
    "id": "language-L9-t1",
    "s": "In postcolonial theory, 'appropriation' refers to the colonised writer's reshaping of the coloniser's language for local purposes.",
    "answer": true,
    "why": "Appropriation is the taking over and adapting of the imperial language, a companion to abrogation."
   },
   {
    "id": "language-L9-t2",
    "s": "In transformational grammar, 'movement' operations can leave a trace at the extraction site.",
    "answer": true,
    "why": "Movement in generative syntax is analysed as leaving a trace or copy coindexed with the moved element."
   },
   {
    "id": "language-L9-t3",
    "s": "Négritude was a movement associated with Léopold Sédar Senghor and Aimé Césaire.",
    "answer": true,
    "why": "Senghor, Césaire and Damas founded the négritude movement in Paris in the 1930s."
   },
   {
    "id": "language-L9-t4",
    "s": "In systemic functional linguistics, the 'theme' is the element that serves as the point of departure of the message.",
    "answer": true,
    "why": "Halliday defines theme as the starting point of the clause as message, typically before the rheme."
   },
   {
    "id": "language-L9-t5",
    "s": "Free indirect discourse typically retains third-person pronouns and past tense while voicing a character's thoughts.",
    "answer": true,
    "why": "It blends the narrator's third-person, past-tense frame with the character's idiom."
   },
   {
    "id": "language-L9-t6",
    "s": "Affricates are consonants produced with a complete closure followed by a gradual release.",
    "answer": true,
    "why": "Affricates such as /tʃ/ combine a stop closure with a fricative release."
   },
   {
    "id": "language-L9-t7",
    "s": "A presupposition survives negation of the sentence that triggers it.",
    "answer": true,
    "why": "Presuppositions are conventionally constant under negation, unlike entailments."
   },
   {
    "id": "language-L9-t8",
    "s": "A 'presupposition' survives negation of the sentence that carries it.",
    "answer": true,
    "why": "Presuppositions are typically constant under negation, unlike entailments."
   },
   {
    "id": "language-L9-t9",
    "s": "The 'negritude' movement was founded solely by Aimé Césaire without Senghor or Damas.",
    "answer": false,
    "why": "Negritude is associated with Césaire, Senghor and Damas together, not Césaire alone."
   },
   {
    "id": "language-L9-t10",
    "s": "Roman Jakobson's poetic function of language is concerned with the orientation of the message towards the message itself, as in 'I like Ike'.",
    "answer": true,
    "why": "Jakobson defined the poetic function as the set towards the message, exemplified by the paronomasia of 'I like Ike'."
   },
   {
    "id": "language-L9-t11",
    "s": "In English phonology, a minimal pair differs in exactly one phoneme in the same position.",
    "answer": true,
    "why": "By definition a minimal pair, such as 'pat' and 'bat', contrasts in one phoneme only."
   },
   {
    "id": "language-L9-t12",
    "s": "Metonymy substitutes a part for the whole.",
    "answer": false,
    "why": "That is synecdoche; metonymy substitutes an associated entity (e.g. container for contents)."
   },
   {
    "id": "language-L9-t13",
    "s": "The Shakespearean sonnet ends with a quatrain rhyming efef.",
    "answer": false,
    "why": "It ends with a couplet rhyming gg, after three quatrains."
   },
   {
    "id": "language-L9-t14",
    "s": "Semantic narrowing is the process by which a word's meaning becomes broader over time.",
    "answer": false,
    "why": "Narrowing restricts meaning; broadening widens it."
   },
   {
    "id": "language-L9-t15",
    "s": "Litotes expresses an affirmative by negating its opposite, as in 'not bad'.",
    "answer": true,
    "why": "Litotes is understatement through negation of the contrary, e.g. 'not unkind'."
   },
   {
    "id": "language-L9-t16",
    "s": "The term 'deixis' covers person, place and time reference anchored to the speaker's context.",
    "answer": true,
    "why": "Person, spatial and temporal deixis are the standard three categories anchored to the utterance context."
   },
   {
    "id": "language-L9-t17",
    "s": "'Conversion' (zero derivation) requires the addition of an overt derivational affix.",
    "answer": false,
    "why": "Conversion is derivation without affixation, as in 'to email' from the noun 'email'."
   },
   {
    "id": "language-L9-t18",
    "s": "In English, the word 'bank' (of a river) and 'bank' (financial institution) are examples of polysemy rather than homonymy.",
    "answer": false,
    "why": "These are standard examples of homonymy: unrelated meanings that happen to share a form, not senses derived from one another."
   },
   {
    "id": "language-L9-t19",
    "s": "The Great Vowel Shift affected English consonants rather than vowels.",
    "answer": false,
    "why": "The Great Vowel Shift was a major change in the pronunciation of long vowels, not consonants."
   },
   {
    "id": "language-L9-t20",
    "s": "A 'dactyl' is a metrical foot of one stressed syllable followed by two unstressed syllables.",
    "answer": true,
    "why": "A dactyl is /xx, as in the opening of 'Half a league, half a league'."
   },
   {
    "id": "language-L9-t21",
    "s": "A restrictive relative clause is normally set off by commas.",
    "answer": false,
    "why": "Restrictive clauses are not set off by commas; non-restrictive clauses are."
   },
   {
    "id": "language-L9-t22",
    "s": "In English, 'brunch' is an example of a blend.",
    "answer": true,
    "why": "A blend fuses parts of two words, as breakfast and lunch yield brunch."
   },
   {
    "id": "language-L9-t23",
    "s": "An iamb is a metrical foot of one stressed syllable followed by one unstressed syllable.",
    "answer": false,
    "why": "An iamb is unstressed then stressed (/); stressed then unstressed is a trochee."
   },
   {
    "id": "language-L9-t24",
    "s": "In English, 'whom' is obligatory as the object of a preposition in formal registers.",
    "answer": false,
    "why": "Even in formal prose, pied-piping with 'who' occurs, and 'whom' is not obligatory in all prepositional-object contexts."
   }
  ],
  "terms": [
   {
    "id": "language-L9-w1",
    "word": "SYNECDOCHE",
    "clue": "Figure substituting a part for a whole, as in 'all hands'."
   },
   {
    "id": "language-L9-w2",
    "word": "CATAPHORA",
    "clue": "Forward reference in which a pronoun precedes its referent."
   },
   {
    "id": "language-L9-w3",
    "word": "ASSONANCE",
    "clue": "Repetition of vowel sounds within nearby words."
   },
   {
    "id": "language-L9-w4",
    "word": "ENJAMBMENT",
    "clue": "Run-on of a line of verse into the next without pause."
   },
   {
    "id": "language-L9-w5",
    "word": "DIGLOSSIA",
    "clue": "Stable coexistence of two varieties of one language in a community."
   },
   {
    "id": "language-L9-w6",
    "word": "EPISTEME",
    "clue": "Foucauldian term for the underlying knowledge structure of an era."
   },
   {
    "id": "language-L9-w7",
    "word": "HYPOTAXIS",
    "clue": "Subordination of clauses within a complex sentence."
   },
   {
    "id": "language-L9-w8",
    "word": "ANAPHORA",
    "clue": "Backward reference, or repetition of a word at clause openings."
   },
   {
    "id": "language-L9-w9",
    "word": "APOSTROPHE",
    "clue": "Rhetorical address to an absent person or abstraction, as in 'O Death'."
   }
  ]
 },
 "10": {
  "questions": [
   {
    "id": "language-L10-q1",
    "q": "Which writer's theory most centrally employs the term 'abrogation' in postcolonial criticism?",
    "options": [
     "Homi Bhabha",
     "Edward Said",
     "Bill Ashcroft",
     "Ngũgĩ wa Thiong'o",
     "Chinua Achebe"
    ],
    "answer": 2,
    "why": "Ashcroft, Griffiths and Tiffin, in 'The Empire Writes Back', theorise 'abrogation' and 'appropriation' as postcolonial textual strategies.",
    "hint": "It is associated with a trio of Australian critics."
   },
   {
    "id": "language-L10-q2",
    "q": "In Optimality Theory, which constraint type is violated in order to satisfy a higher-ranked markedness constraint?",
    "options": [
     "Depravity",
     "Alignment",
     "Correspondence",
     "Maximality",
     "Faithfulness"
    ],
    "answer": 4,
    "why": "Faithfulness constraints (e.g. MAX, DEP, IDENT) are dominated by higher-ranked markedness constraints, which is why outputs may differ from inputs.",
    "hint": "It concerns the relation between input and output."
   },
   {
    "id": "language-L10-q3",
    "q": "Which writer developed the idea of 'abrogation' and 'appropriation' as strategies of postcolonial writing?",
    "options": [
     "Chinua Achebe",
     "Gayatri Spivak",
     "Homi K. Bhabha",
     "Ngũgĩ wa Thiong'o",
     "Bill Ashcroft"
    ],
    "answer": 4,
    "why": "Ashcroft, Griffiths and Tiffin's 'The Empire Writes Back' sets out abrogation and appropriation as postcolonial textual strategies.",
    "hint": "It is associated with a trio of Australian critics."
   },
   {
    "id": "language-L10-q4",
    "q": "In Chomskyan syntax, which level of representation feeds semantic interpretation?",
    "options": [
     "Logical form",
     "Phonological form",
     "Spell-out",
     "Surface structure",
     "Deep structure"
    ],
    "answer": 0,
    "why": "In the Principles and Parameters model, Logical Form (LF) is the interface level interpreted semantically.",
    "hint": "It is abbreviated LF."
   },
   {
    "id": "language-L10-q5",
    "q": "Which term in Halliday's Systemic Functional Linguistics names the clause-level system concerned with exchanging information versus goods-and-services?",
    "options": [
     "Modality",
     "Theme",
     "Mood",
     "Transitivity",
     "Cohesion"
    ],
    "answer": 2,
    "why": "The Mood system realises the interpersonal metafunction, covering declarative, interrogative and imperative choices for exchanging information or goods-and-services.",
    "hint": "It is one of the three metafunctions, not the textual one."
   },
   {
    "id": "language-L10-q6",
    "q": "Which term in systemic functional linguistics names the metafunction realised by the transitivity system?",
    "options": [
     "Experiential",
     "Logical",
     "Textual",
     "Ideational",
     "Interpersonal"
    ],
    "answer": 3,
    "why": "Halliday's ideational metafunction is realised by the transitivity system (participants, processes, circumstances); the experiential is a subcomponent, not the metafunction name.",
    "hint": "It contrasts with interpersonal and textual."
   },
   {
    "id": "language-L10-q7",
    "q": "Which statement about the Middle English 'Great Vowel Shift' is correct?",
    "options": [
     "It occurred before the Norman Conquest of 1066.",
     "It raised long vowels and diphthongised the highest ones.",
     "It affected only short vowels in closed syllables.",
     "It changed consonants as well as vowels.",
     "It lowered all long vowels systematically."
    ],
    "answer": 1,
    "why": "The Great Vowel Shift (roughly 1400–1700) raised long vowels, with /iː/ and /uː/ becoming diphthongs.",
    "hint": "Consider what happened to the highest long vowels."
   },
   {
    "id": "language-L10-q8",
    "q": "Which of these is metonymy rather than synecdoche?",
    "options": [
     "'We need more boots on the ground' for soldiers.",
     "'He is a good head' for a clever person.",
     "'A fleet of fifty sails' for fifty ships.",
     "'All hands on deck' for all sailors.",
     "'The Crown rejected the bill' for the monarchy."
    ],
    "answer": 4,
    "why": "Metonymy substitutes an associated entity (the Crown for the monarchy); the others substitute part for whole or whole for part (synecdoche).",
    "hint": "One involves an institution standing for what it represents."
   },
   {
    "id": "language-L10-q9",
    "q": "In the sentence 'It is the ending that the critics found ambiguous', which analysis is correct?",
    "options": [
     "It is a restrictive relative clause",
     "It is an extraposed subject clause",
     "It is a cleft with a focused subject",
     "The critics is the focused constituent",
     "It is a pseudo-cleft"
    ],
    "answer": 2,
    "why": "This is an it-cleft: 'It is X that ...' focuses the constituent X, here 'the ending'. The clause after that is not a relative clause modifying the ending in the ordinary sense.",
    "hint": "Ask which constituent is placed after 'is' and before 'that'."
   },
   {
    "id": "language-L10-q10",
    "q": "Which best characterises free indirect discourse?",
    "options": [
     "A narrator reporting another's words with third-person and past tense but retaining that character's deictic and evaluative perspective",
     "Direct speech marked by quotation marks",
     "A character's speech in the first person within quotation marks",
     "A stage direction in a play",
     "An authorial aside addressed to the reader"
    ],
    "answer": 0,
    "why": "Free indirect discourse blends third-person past-tense narration with the character's own deixis, evaluative language and idiom, without quotation marks or a reporting clause.",
    "hint": "It is neither direct nor indirect speech but a blend of the two."
   },
   {
    "id": "language-L10-q11",
    "q": "In Gricean pragmatics, a speaker who says 'Some of the students passed' is standardly taken to implicate that not all passed. Which explanation is correct?",
    "options": [
     "It follows by entailment from 'some'",
     "It is a conventional implicature triggered by 'some'",
     "It is a presupposition of the sentence",
     "It arises because the speaker could have said 'all' and is assumed to be giving the most informative sufficient answer",
     "It is an entailment of the plural 'students'"
    ],
    "answer": 3,
    "why": "The 'not all' inference is a scalar implicature: the maxim of quantity makes the weaker 'some' suggest that the stronger 'all' would have been false or uninformative in context. It is cancellable, unlike entailment.",
    "hint": "Ask whether the inference can be cancelled by adding 'indeed all'."
   },
   {
    "id": "language-L10-q12",
    "q": "In Gricean pragmatics, which maxim is flouted by a speaker who says 'Some of the students passed' when all passed?",
    "options": [
     "Maxim of Quality",
     "Maxim of Politeness",
     "Maxim of Quantity",
     "Maxim of Manner",
     "Maxim of Relation"
    ],
    "answer": 2,
    "why": "Saying 'some' implicates 'not all'; it flouts the maxim of quantity by giving less information than required, generating a scalar implicature.",
    "hint": "It concerns how much information is given."
   },
   {
    "id": "language-L10-q13",
    "q": "In 'The lecturer had the students revise their drafts', what type of construction is 'had the students revise'?",
    "options": [
     "Periphrastic",
     "Passive",
     "Resultative",
     "Inchoative",
     "Causative"
    ],
    "answer": 4,
    "why": "'Have' plus object plus bare infinitive is a causative construction: the lecturer caused the students to revise.",
    "hint": "The lecturer is causing the action, not doing it."
   },
   {
    "id": "language-L10-q14",
    "q": "In the sentence 'The committee considered the proposal unacceptable', what is the grammatical function of 'unacceptable'?",
    "options": [
     "Object complement",
     "Appositive",
     "Direct object",
     "Subject complement",
     "Adverbial"
    ],
    "answer": 0,
    "why": "'Unacceptable' predicates a property of the object 'the proposal', making it an object complement.",
    "hint": "It describes the object, not the subject."
   },
   {
    "id": "language-L10-q15",
    "q": "Which statement about the development from pidgin to creole is correct?",
    "options": [
     "It is called decreolisation",
     "It involves loss of morphology only",
     "It requires no native speakers",
     "It involves expansion of lexicon and grammar",
     "It is called pidginisation"
    ],
    "answer": 3,
    "why": "Creolisation expands a pidgin's lexicon and grammar as it becomes a native language; decreolisation is the reverse drift toward the superstrate.",
    "hint": "The process adds structure, not removes it."
   },
   {
    "id": "language-L10-q16",
    "q": "In Gricean pragmatics, which maxim is flouted by the reply 'Some of the students passed' when the speaker knows all passed?",
    "options": [
     "Politeness",
     "Manner",
     "Quantity",
     "Quality",
     "Relation"
    ],
    "answer": 2,
    "why": "Saying 'some' implicates 'not all'; if the speaker knows all passed, the maxim of Quantity is flouted to generate a conversational implicature.",
    "hint": "It concerns how much information is given."
   }
  ],
  "truths": [
   {
    "id": "language-L10-t1",
    "s": "The word 'laser' is formed by back-formation from 'laser light'.",
    "answer": false,
    "why": "'Laser' is an acronym from 'light amplification by stimulated emission of radiation', not a back-formation."
   },
   {
    "id": "language-L10-t2",
    "s": "Litotes is a figure in which an affirmative is expressed by negating its opposite, as in 'not bad'.",
    "answer": true,
    "why": "Litotes uses understatement via negation of the contrary, e.g. 'not unkind'."
   },
   {
    "id": "language-L10-t3",
    "s": "In English, 'brunch' is an example of clipping.",
    "answer": false,
    "why": "'Brunch' is a blend (portmanteau) of 'breakfast' and 'lunch', not a clipping."
   },
   {
    "id": "language-L10-t4",
    "s": "A cataphoric reference points forward to something mentioned later in the text.",
    "answer": true,
    "why": "Cataphora anticipates a later expression, as in 'When she arrived, Mary smiled'."
   },
   {
    "id": "language-L10-t5",
    "s": "The term 'négritude' was coined by Wole Soyinka.",
    "answer": false,
    "why": "Négritude was developed by Aimé Césaire, Léopold Sédar Senghor and Léon Damas; Soyinka later critiqued it."
   },
   {
    "id": "language-L10-t6",
    "s": "Synecdoche substitutes an associated entity for another, as in 'the Crown' for the monarchy.",
    "answer": false,
    "why": "That describes metonymy; synecdoche substitutes a part for the whole or vice versa."
   },
   {
    "id": "language-L10-t7",
    "s": "The Great Vowel Shift primarily affected short vowels in closed syllables.",
    "answer": false,
    "why": "It affected long vowels, raising and diphthongising them."
   },
   {
    "id": "language-L10-t8",
    "s": "In Gricean terms, flouting the maxim of quality involves saying something false or unsupported.",
    "answer": true,
    "why": "Quality concerns truthfulness; flouting it can generate irony or metaphor."
   },
   {
    "id": "language-L10-t9",
    "s": "The word 'nice' has undergone pejoration, moving from 'foolish' to 'pleasant'.",
    "answer": false,
    "why": "'Nice' underwent amelioration, from 'foolish/simple' to 'pleasant'."
   },
   {
    "id": "language-L10-t10",
    "s": "Free indirect discourse typically uses first-person narration with quotation marks.",
    "answer": false,
    "why": "It uses third-person narration without quotation marks, blending narrator and character."
   },
   {
    "id": "language-L10-t11",
    "s": "In English, 'un-' in 'unhappy' is a derivational prefix.",
    "answer": true,
    "why": "It creates a new lexeme and is derivational, unlike inflectional suffixes."
   },
   {
    "id": "language-L10-t12",
    "s": "The term 'abrogation' in postcolonial theory refers to the rejection of the coloniser's language and its standards.",
    "answer": true,
    "why": "Ashcroft et al. define abrogation as refusing the imperial language's authority."
   },
   {
    "id": "language-L10-t13",
    "s": "In 'The committee awarded the youngest candidate the prize', 'the prize' is the indirect object.",
    "answer": false,
    "why": "'The prize' is the direct object; 'the youngest candidate' is the indirect object."
   },
   {
    "id": "language-L10-t14",
    "s": "The term 'négritude' was coined in the 1930s by Aimé Césaire, Léopold Sédar Senghor and Léon-Gontran Damas.",
    "answer": true,
    "why": "The négritude movement was developed by these francophone Caribbean and African writers."
   },
   {
    "id": "language-L10-t15",
    "s": "'Laser' is an example of an acronym formed from initial letters.",
    "answer": true,
    "why": "LASER comes from 'light amplification by stimulated emission of radiation'."
   },
   {
    "id": "language-L10-t16",
    "s": "In Chomskyan syntax, LF (Logical Form) is the level of representation that feeds semantic interpretation.",
    "answer": true,
    "why": "LF is the syntactic level that interfaces with semantic interpretation."
   },
   {
    "id": "language-L10-t17",
    "s": "The Great Vowel Shift affected English long vowels but left short vowels unchanged.",
    "answer": true,
    "why": "The shift systematically raised long vowels and diphthongised the highest ones."
   },
   {
    "id": "language-L10-t18",
    "s": "In Gricean pragmatics, 'Some of the students passed' conversationally implicates that not all passed.",
    "answer": true,
    "why": "The scalar implicature arises from the maxim of Quantity."
   },
   {
    "id": "language-L10-t19",
    "s": "Free indirect discourse is a first-person narrative technique.",
    "answer": false,
    "why": "It is a third-person technique blending narrator and character's voice."
   },
   {
    "id": "language-L10-t20",
    "s": "The word 'brunch' is formed by blending 'breakfast' and 'lunch'.",
    "answer": true,
    "why": "Blending combines parts of two words into a new one."
   },
   {
    "id": "language-L10-t21",
    "s": "Synecdoche substitutes an associated entity for another, as when 'the Crown' stands for the monarchy.",
    "answer": false,
    "why": "That is metonymy; synecdoche substitutes part for whole or whole for part."
   },
   {
    "id": "language-L10-t22",
    "s": "In Halliday's Systemic Functional Linguistics, the transitivity system realises the ideational metafunction.",
    "answer": true,
    "why": "Transitivity encodes experiential meaning, part of the ideational metafunction."
   },
   {
    "id": "language-L10-t23",
    "s": "A cleft sentence and a pseudo-cleft sentence have the same syntactic structure.",
    "answer": false,
    "why": "They differ: an it-cleft is 'It is X that ...', whereas a pseudo-cleft is 'What ... is X' (or 'X is what ...')."
   }
  ],
  "terms": [
   {
    "id": "language-L10-w1",
    "word": "METONYMY",
    "clue": "Figure substituting an associated entity for another"
   },
   {
    "id": "language-L10-w2",
    "word": "CATAPHORA",
    "clue": "Reference pointing forward to a later expression"
   },
   {
    "id": "language-L10-w3",
    "word": "CREOLISATION",
    "clue": "Process expanding a pidgin into a native language"
   },
   {
    "id": "language-L10-w4",
    "word": "PRESUPPOSITION",
    "clue": "Background assumption that survives negation"
   },
   {
    "id": "language-L10-w5",
    "word": "IDEATIONAL",
    "clue": "Halliday's metafunction realised by transitivity"
   },
   {
    "id": "language-L10-w6",
    "word": "BACKFORMATION",
    "clue": "Word formation by removing a supposed affix"
   },
   {
    "id": "language-L10-w7",
    "word": "SYNECDOCHE",
    "clue": "Figure using a part for the whole"
   },
   {
    "id": "language-L10-w8",
    "word": "AMELIORATION",
    "clue": "Semantic change in which a word improves in meaning"
   },
   {
    "id": "language-L10-w9",
    "word": "ACRONYM",
    "clue": "Word formed from initial letters, such as laser or radar."
   },
   {
    "id": "language-L10-w10",
    "word": "TRANSITIVITY",
    "clue": "Hallidayan clause system encoding processes, participants and circumstances."
   },
   {
    "id": "language-L10-w11",
    "word": "NEGRITUDE",
    "clue": "Francophone literary movement affirming Black cultural identity."
   }
  ]
 }
};
