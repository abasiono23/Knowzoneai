/**
 * The History words added with the ten-level ladder, in every language, added to the "history"
 * namespace at start-up (so components use the usual t()). English is history-text.en.ts; the others are
 * generated from it by apps/server/scripts/business-history-content.ts --stages text (placeholders
 * checked in code). Do not edit the translations here by hand: edit the English and run the stage.
 */
import i18n from 'i18next';

import en from './history-text.en';

export const HISTORY_TEXT = { en, ...{
 "pcm": {
  "games": {
   "time-machine": {
    "tagline": "Travel go real moments for history and arrange events in order.",
    "rules": {
     "r1": "Each stop na real moment for history, from ancient Egypt go reach the fall of Berlin Wall. Read di museum label first.",
     "r2": "Answer two challenges for each stop: one question, or arrange events in order with the earliest on top.",
     "r3": "Higher levels bring more stops, events wey close together for time, questions about historians and sources, and a shorter clock (unless timer off).",
     "example": "Ghana independence (1957) come before dem found Organisation of African Unity (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Dig real artefacts and name the civilisation wey make dem.",
    "rules": {
     "r1": "Open di squares of di trench to find di artefacts. Each find come with clue from real archaeology.",
     "r2": "Name the civilisation wey leave them behind, then answer one question about am.",
     "r3": "From Upper-intermediate the clues go subtle, and wrong answers come from same part of the world; at the top you see only two finds.",
     "example": "Terracotta heads with triangular eyes and iron-smelting slag, from central Nigeria: the Nok culture."
    }
   },
   "africa-explorer": {
    "tagline": "Find all of Africa countries on the map and learn their history.",
    "rules": {
     "r1": "Tap the map where you think the country dey, then check. You no wan tap? Use “Choose from markers” instead.",
     "r2": "Then visit im landmark, read two facts and answer one question about am.",
     "r3": "Higher levels hide the region hint, need closer tap and bring smaller countries.",
     "example": "Nigeria dey West Africa, on Gulf of Guinea, where Niger and Benue rivers meet."
    }
   }
  },
  "quiz": {
   "timeUp": "Time don finish",
   "stop": "Stop {{n}} of {{total}}",
   "challenge": "Challenge {{n}} of 2",
   "next": "Next",
   "nextStop": "Next stop",
   "finish": "See results"
  },
  "order": {
   "keys": "On computer: number keys choose line, ↑ and ↓ move am, Enter check.",
   "youHad": "You put this at number {{n}}",
   "bc": "{{year}} BC",
   "ad": "AD {{year}}"
  },
  "timeline": {
   "label": "MUSEUM LABEL",
   "a11y": "Timeline of this journey: {{list}}",
   "now": "You dey here"
  },
  "excavation": {
   "trench": "TRENCH {{n}} OF {{total}}",
   "uncover": "Open di squares to find di artefacts.",
   "square": "Square {{n}}: dig here",
   "empty": "Square {{n}}: only soil",
   "foundA11y": "Square {{n}}: {{name}} found",
   "found": "{{done}} of {{total}} finds",
   "digAll": "Uncover all",
   "identify": "Name the civilisation",
   "who": "Which civilisation leave these behind?",
   "finds": "FINDS",
   "about": "ABOUT DEM"
  },
  "atlas": {
   "find": "Find {{name}}",
   "hint": "Hint: {{region}}",
   "tap": "Tap the map where you think e dey, then check.",
   "markers": "Choose from markers",
   "useMap": "Tap the map instead",
   "markerHint": "Which marker na {{name}}?",
   "marker": "Marker {{letter}}",
   "check": "Check am",
   "found": "You find am",
   "missed": "No be so: {{name}} dey green.",
   "landmark": "LANDMARK",
   "facts": "YOU KNOW SAY?",
   "passport": "Passport: {{done}} of {{total}} stamps",
   "mapA11y": "Map of Africa. Tap to put pin.",
   "pinA11y": "Your pin"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "yo": {
  "games": {
   "time-machine": {
    "tagline": "Rin ìrìn àjò lọ sí àwọn àkókò gidi nínú ìtàn kí o sì tò àwọn ìṣẹ̀lẹ̀ lẹ́sẹẹsẹ.",
    "rules": {
     "r1": "Ìdúró kọ̀ọ̀kan jẹ́ àkókò gidi nínú ìtàn, láti Íjíbítì àtijọ́ dé ìṣubú ògiri Berlin. Kọ́kọ́ ka àpèlé ilé-ìkọ́ni náà.",
     "r2": "Dáhùn ìpèníjà méjì ní ibùdó kọ̀ọ̀kan: ìbéèrè kan, tàbí títò àwọn ìṣẹ̀lẹ̀ lẹ́sẹẹsẹ pẹ̀lú èyí tí ó ṣáájú ní orí.",
     "r3": "Àwọn ìpele tí ó ga jù ń mú ibùdó púpọ̀ sí i, àwọn ìṣẹ̀lẹ̀ tí ó sún mọ́ ara wọn ní àkókò, àwọn ìbéèrè nípa àwọn òpìtàn àti orísun, àti aago kúkúrú (àyàfi tí aago bá kúrò).",
     "example": "Òmìnira Ghana (1957) wá ṣáájú ìdásílẹ̀ Organisation of African Unity (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Walẹ̀ àwọn ohun-àtijọ́ gidi kí o sì dárúkọ ọ̀làjú tí ó ṣe wọ́n.",
    "rules": {
     "r1": "Ṣí àwọn onígun mẹ́rin ilẹ̀-ìwàlẹ̀ kí o lè rí àwọn ohun-àtijọ́. Ìwárí kọ̀ọ̀kan wá pẹ̀lú àmì láti ìmọ̀-àtijọ́ gidi.",
     "r2": "Dárúkọ ọ̀làjú tí ó fi wọ́n sílẹ̀, kí o sì dáhùn ìbéèrè nípa rẹ̀.",
     "r3": "Láti Àárín-gíga àwọn àmì wá ń tẹ̀ síwájú, àwọn ìdáhùn tí kò tọ́ wá láti apá kan náà lágbàáyé; ní òkè, àwọn ìwárí méjì péré ni o máa ń rí.",
     "example": "Àwọn orí terracotta pẹ̀lú ojú onígun mẹ́ta àti slag irin, láti àárín Nàìjíríà: àṣà Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Wá gbogbo àwọn orílẹ̀-èdè Áfíríkà lórí máàpù kí o sì kọ́ ìtàn wọn.",
    "rules": {
     "r1": "Tẹ máàpù níbi tí o rò pé orílẹ̀-èdè náà wà, kí o sì yẹ̀wò. Ṣé o kò fẹ́ tẹ? Lo “Yan láti àwọn àmì” dípò.",
     "r2": "Lẹ́yìn náà lọ sí àmì-ilẹ̀ rẹ̀, ka òtítọ́ méjì kí o sì dáhùn ìbéèrè nípa rẹ̀.",
     "r3": "Àwọn ìpele tí ó ga jù ń fi àmì ẹkùn pamọ́, wọ́n nílò títẹ̀ tí ó sún mọ́, wọ́n sì mú àwọn orílẹ̀-èdè kékeré wá.",
     "example": "Nàìjíríà wà ní Ìwọ̀ Oòrùn Áfíríkà, ní etí Òkun Gíníà, níbi tí àwọn odò Niger àti Benue ti ń pàdé."
    }
   }
  },
  "quiz": {
   "timeUp": "Àkókò ti tán",
   "stop": "Ibùdó {{n}} nínú {{total}}",
   "challenge": "Ìpèníjà {{n}} nínú 2",
   "next": "Tókàn",
   "nextStop": "Ibùdó tókàn",
   "finish": "Wo àwọn èsì"
  },
  "order": {
   "keys": "Lórí kọ̀mpútà: àwọn kọ́kọ́rọ́ nọ́mbà ń yan ìlà kan, ↑ àti ↓ ń gbé e, Enter ń yẹ̀wò.",
   "youHad": "O fi èyí sí nọ́mbà {{n}}",
   "bc": "{{year}} BC",
   "ad": "AD {{year}}"
  },
  "timeline": {
   "label": "ÀMÌ ILÉ-ÌKÓ",
   "a11y": "Àkókò ìrìn àjò yìí: {{list}}",
   "now": "O wà níbí"
  },
  "excavation": {
   "trench": "ILẸ̀-ÌWÀLẸ̀ {{n}} NÍNÚ {{total}}",
   "uncover": "Ṣí àwọn onígun mẹ́rin kí o lè rí àwọn ohun-àtijọ́.",
   "square": "Onígun mẹ́rin {{n}}: walẹ̀ níbí",
   "empty": "Onígun mẹ́rin {{n}}: ilẹ̀ nìkan",
   "foundA11y": "Onígun mẹ́rin {{n}}: a rí {{name}}",
   "found": "{{done}} nínú {{total}} ìwárí",
   "digAll": "Ṣí gbogbo rẹ̀",
   "identify": "Dárúkọ ọ̀làjú náà",
   "who": "Ọ̀làjú wo ni ó fi ìwọ̀nyí sílẹ̀?",
   "finds": "ÀWỌN ÌWÁRÍ",
   "about": "NÍPA WỌN"
  },
  "atlas": {
   "find": "Wá {{name}}",
   "hint": "Àmì: {{region}}",
   "tap": "Tẹ máàpù níbi tí o rò pé ó wà, kí o sì yẹ̀wò.",
   "markers": "Yan láti àwọn àmì",
   "useMap": "Tẹ máàpù dípò",
   "markerHint": "Àmì wo ni {{name}}?",
   "marker": "Àmì {{letter}}",
   "check": "Ṣàyẹ̀wò",
   "found": "Mo rí i",
   "missed": "Kò tọ́ pátápátá: {{name}} wà ní àwọ̀ ewé.",
   "landmark": "ÀMÌ ILẸ̀",
   "facts": "ṢÉ O MỌ̀?",
   "passport": "Pásípọ̀ọ̀tì: {{done}} nínú {{total}} àmì-ìwé",
   "mapA11y": "Àwòrán ilẹ̀ Áfíríkà. Tẹ̀ láti gbé pin sí.",
   "pinA11y": "Pinnu rẹ"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "ig": {
  "games": {
   "time-machine": {
    "tagline": "Gaa n'oge ndị mere eme n'ezie ma hazie ihe omume n'usoro.",
    "rules": {
     "r1": "Ebe nkwụsị ọ bụla bụ oge mere eme n'ezie, site n'Ijipt oge ochie ruo ọdịda Mgbidi Berlin. Gụọ akara ụlọ ngosi ihe mgbe ochie buru ụzọ.",
     "r2": "Zaa ihe ịma aka abụọ n'ebe nkwụsị ọ bụla: ajụjụ, ma ọ bụ hazie ihe omume n'usoro na nke mbụ n'elu.",
     "r3": "Ọkwa ndị dị elu na-eweta ebe nkwụsị ndị ọzọ, ihe omume ndị dị nso n'oge, ajụjụ gbasara ndị ọkọ akụkọ ihe mere eme na isi mmalite, na elekere dị mkpụmkpụ (ọ bụrụ na agbanyụọ elekere).",
     "example": "Nnwere onwe Ghana (1957) na-abịa tupu e guzobe Òtù Na-ahụ Maka Ịdị n'Otu Africa (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Gwuo ihe ndị mere eme n'ezie ma kpọọ mmepeanya nke mere ha.",
    "rules": {
     "r1": "Kpughee square ndị dị n'olulu ahụ iji chọta ihe ndị ahụ. Nchọta ọ bụla na-abịa na ntụ aka site na nkà mmụta ihe ochie n'ezie.",
     "r2": "Kpọọ mmepeanya nke hapụrụ ha, wee zaa ajụjụ gbasara ya.",
     "r3": "Site elu-intermediate, ihe ngosi na-adịwanye nro na azịza ọjọọ na-esi n'otu akụkụ ụwa; n'elu ị na-ahụ naanị ihe abụọ achọtara.",
     "example": "Isi terracotta nwere anya triangular na slag ígwè a gbazere, site n'etiti Naịjịrịa: omenala Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Chọta mba niile dị n'Africa na map ma mụta akụkọ ihe mere eme ha.",
    "rules": {
     "r1": "Pịa map ebe i chere na mba ahụ dị, wee lelee. Ọ dịghị amasị gị ịpịa? Jiri “Họrọ site na akara” kama.",
     "r2": "Mgbe ahụ gaa leta ihe ncheta ya, gụọ eziokwu abụọ ma zaa ajụjụ gbasara ya.",
     "r3": "Ọkwa ndị dị elu na-ezobe ntụ aka mpaghara, chọọ ịpịa nso nso ma weta mba ndị nta.",
     "example": "Nigeria dị n'Ebe Ọdịda Anyanwụ Africa, na Gulf of Guinea, ebe osimiri Niger na Benue na-ezukọ."
    }
   }
  },
  "quiz": {
   "timeUp": "Oge agwụla",
   "stop": "Nkwụsị {{n}} nke {{total}}",
   "challenge": "Ihe ịma aka {{n}} nke 2",
   "next": "Ọzọ",
   "nextStop": "Ebe nkwụsị ọzọ",
   "finish": "Lee nsonaazụ"
  },
  "order": {
   "keys": "Na kọmputa: igodo ọnụọgụ na-ahọrọ ahịrị, ↑ na ↓ na-ebugharị ya, Enter na-enyocha.",
   "youHad": "I tinyere nke a na nọmba {{n}}",
   "bc": "{{year}} BC",
   "ad": "AD {{year}}"
  },
  "timeline": {
   "label": "AKWỤKWỌ ỤLỌ NGOSI",
   "a11y": "Usoro oge nke njem a: {{list}}",
   "now": "Ị nọ ebe a"
  },
  "excavation": {
   "trench": "OLULU {{n}} NKE {{total}}",
   "uncover": "Kpughee square ndị ahụ iji chọta ihe ndị ahụ.",
   "square": "Square {{n}}: gwuo ebe a",
   "empty": "Square {{n}}: naanị ala",
   "foundA11y": "Square {{n}}: achọtara {{name}}",
   "found": "{{done}} nke {{total}} nchọta",
   "digAll": "Kpughee niile",
   "identify": "Kpọọ mmepeanya",
   "who": "Kedu mmepeanya hapụrụ ndị a?",
   "finds": "NCHỌTA",
   "about": "GBASARA HA"
  },
  "atlas": {
   "find": "Chọta {{name}}",
   "hint": "Ntụ aka: {{region}}",
   "tap": "Pịa map ebe i chere na ọ dị, wee lelee.",
   "markers": "Họrọ site na akara",
   "useMap": "Pịa map kama",
   "markerHint": "Kedu akara bụ {{name}}?",
   "marker": "Akara {{letter}}",
   "check": "Lelee",
   "found": "Ahụrụ m ya",
   "missed": "Ọ bụghị kpọmkwem: {{name}} ka akara na green.",
   "landmark": "IHE NLEMBA",
   "facts": "Ị MATAARA?",
   "passport": "Paspọt: {{done}} n'ime {{total}} stampụ",
   "mapA11y": "Map nke Africa. Pịa iji tinye pin.",
   "pinA11y": "Pin gị"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "ha": {
  "games": {
   "time-machine": {
    "tagline": "Yi tafiya zuwa ainihin lokuta a tarihi kuma ka jera abubuwan da suka faru.",
    "rules": {
     "r1": "Kowane tasha ainihin lokaci ne a tarihi, daga tsohuwar Masar har zuwa faduwar katangar Berlin. Ka fara karanta alamar gidan kayan tarihi.",
     "r2": "Ka amsa kalubale biyu a kowace tasha: tambaya, ko jera abubuwan da suka faru tare da na farko a sama.",
     "r3": "Matakai mafi girma suna kawo karin tashoshi, abubuwan da suka fi kusanci a lokaci, tambayoyi game da masana tarihi da majiyoyi, da karamin agogo (sai dai idan an kashe lokacin).",
     "example": "'Yancin Ghana (1957) ya zo kafin kafuwar Kungiyar Hadin Kan Afirka (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Tono ainihin kayan tarihi kuma ka ambaci wayewar da ta yi su.",
    "rules": {
     "r1": "Ka buɗe murabba'in ramin don samun kayan tarihin. Kowane abin da aka samu yana zuwa da alama daga ainihin ilimin kayan tarihi.",
     "r2": "Ka ambaci wayewar da ta bar su, sannan ka amsa tambaya game da ita.",
     "r3": "Daga matakin tsaka-tsaki zuwa sama, alamu suna ƙara ɓoyewa kuma amsoshin da ba daidai ba suna fitowa daga wannan yanki ɗaya; a matakin sama za ka ga abubuwan da aka gano biyu kawai.",
     "example": "Kawunan terracotta masu idanu uku-uku da tarkacen narkar da ƙarfe, daga tsakiyar Najeriya: al'adar Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Nemo dukkan ƙasashen Afirka a taswira kuma ka koyi tarihinsu.",
    "rules": {
     "r1": "Ka taɓa taswirar inda kake tsammanin ƙasar take, sannan ka duba. Ba ka son taɓawa? Yi amfani da “Zaɓi daga alamomi” maimakon.",
     "r2": "Sannan ka ziyarci babban abin tarihinta, ka karanta bayanai biyu kuma ka amsa tambaya game da ita.",
     "r3": "Matakai mafi girma suna ɓoye alamar yankin, suna buƙatar taɓawa mafi kusa kuma suna kawo ƙananan ƙasashe.",
     "example": "Najeriya tana Yammacin Afirka, a Tekun Guinea, inda kogin Niger da Benue suka haɗu."
    }
   }
  },
  "quiz": {
   "timeUp": "Lokaci ya ƙare",
   "stop": "Tasha ta {{n}} cikin {{total}}",
   "challenge": "Kalubale na {{n}} cikin 2",
   "next": "Na gaba",
   "nextStop": "Tasha ta gaba",
   "finish": "Duba sakamako"
  },
  "order": {
   "keys": "A kwamfuta: maɓallan lamba suna zaɓar layi, ↑ da ↓ suna motsa shi, Enter yana dubawa.",
   "youHad": "Ka sanya wannan a lamba {{n}}",
   "bc": "{{year}} BC",
   "ad": "AD {{year}}"
  },
  "timeline": {
   "label": "ALAMAR GIDAN KAYAN TARIHI",
   "a11y": "Jadawalin wannan tafiya: {{list}}",
   "now": "Kana nan"
  },
  "excavation": {
   "trench": "RAMI NA {{n}} CIKIN {{total}}",
   "uncover": "Buɗe murabba'in don samun kayan tarihin.",
   "square": "Murabba'i na {{n}}: tono a nan",
   "empty": "Murabba'i na {{n}}: ƙasa kawai",
   "foundA11y": "Murabba'i na {{n}}: an sami {{name}}",
   "found": "{{done}} cikin {{total}} abubuwan da aka samu",
   "digAll": "Buɗe duka",
   "identify": "Ambaci wayewar",
   "who": "Wace wayewa ce ta bar waɗannan?",
   "finds": "ABUBUWAN DA AKA SAMU",
   "about": "GAME DA SU"
  },
  "atlas": {
   "find": "Nemo {{name}}",
   "hint": "Alama: {{region}}",
   "tap": "Taɓa taswirar inda kake tsammanin take, sannan ka duba.",
   "markers": "Zaɓi daga alamomi",
   "useMap": "Taɓa taswirar maimakon",
   "markerHint": "Wane alama ne {{name}}?",
   "marker": "Alama {{letter}}",
   "check": "Duba",
   "found": "An same shi",
   "missed": "Ba daidai ba: an yi wa {{name}} alama da kore.",
   "landmark": "ALAMA",
   "facts": "KA SAN?",
   "passport": "Fasfo: {{done}} daga {{total}} tambari",
   "mapA11y": "Taswirar Afirka. Taɓa don sanya fil.",
   "pinA11y": "Finka"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "fr": {
  "games": {
   "time-machine": {
    "tagline": "Voyagez vers de vrais moments de l’histoire et remettez les événements dans l’ordre.",
    "rules": {
     "r1": "Chaque étape est un vrai moment de l’histoire, de l’Égypte antique à la chute du mur de Berlin. Lisez d’abord le cartel du musée.",
     "r2": "Répondez à deux défis à chaque étape : une question, ou remettre des événements dans l’ordre du plus ancien en haut.",
     "r3": "Les niveaux supérieurs ajoutent des étapes, rapprochent les événements dans le temps, posent des questions sur les historiens et les sources, et raccourcissent le chrono (sauf si le minuteur est désactivé).",
     "example": "L’indépendance du Ghana (1957) précède la fondation de l’Organisation de l’unité africaine (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Dégagez de vrais artefacts et nommez la civilisation qui les a produits.",
    "rules": {
     "r1": "Découvrez les cases de la fouille pour trouver les artefacts. Chaque découverte s’accompagne d’un indice tiré de l’archéologie réelle.",
     "r2": "Nommez la civilisation qui les a laissés, puis répondez à une question à son sujet.",
     "r3": "À partir du niveau intermédiaire supérieur, les indices deviennent plus subtils et les mauvaises réponses viennent de la même région du monde ; au niveau le plus haut, vous ne voyez que deux découvertes.",
     "example": "Des têtes en terre cuite aux yeux triangulaires et des scories de fonte du fer, du centre du Nigeria : la culture Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Trouvez tous les pays d’Afrique sur la carte et découvrez leur histoire.",
    "rules": {
     "r1": "Touchez la carte là où vous pensez que se trouve le pays, puis vérifiez. Vous préférez ne pas toucher ? Utilisez « Choisir parmi les repères ».",
     "r2": "Visitez ensuite son site emblématique, lisez deux faits et répondez à une question à son sujet.",
     "r3": "Les niveaux supérieurs masquent l’indice de région, exigent un toucher plus précis et proposent des pays plus petits.",
     "example": "Le Nigeria est en Afrique de l’Ouest, sur le golfe de Guinée, au confluent du Niger et de la Bénoué."
    }
   }
  },
  "quiz": {
   "timeUp": "Temps écoulé",
   "stop": "Étape {{n}} sur {{total}}",
   "challenge": "Défi {{n}} sur 2",
   "next": "Suivant",
   "nextStop": "Étape suivante",
   "finish": "Voir les résultats"
  },
  "order": {
   "keys": "Sur ordinateur : les touches numériques choisissent une ligne, ↑ et ↓ la déplacent, Entrée vérifie.",
   "youHad": "Vous l’avez placé au numéro {{n}}",
   "bc": "{{year}} av. J.-C.",
   "ad": "{{year}} apr. J.-C."
  },
  "timeline": {
   "label": "CARTEL DU MUSÉE",
   "a11y": "Chronologie de ce parcours : {{list}}",
   "now": "Vous êtes ici"
  },
  "excavation": {
   "trench": "FOUILLE {{n}} SUR {{total}}",
   "uncover": "Découvrez les cases pour trouver les artefacts.",
   "square": "Case {{n}} : creuser ici",
   "empty": "Case {{n}} : seulement de la terre",
   "foundA11y": "Case {{n}} : {{name}} trouvé",
   "found": "{{done}} découvertes sur {{total}}",
   "digAll": "Tout découvrir",
   "identify": "Nommez la civilisation",
   "who": "Quelle civilisation a laissé ces objets ?",
   "finds": "DÉCOUVERTES",
   "about": "À LEUR SUJET"
  },
  "atlas": {
   "find": "Trouvez {{name}}",
   "hint": "Indice : {{region}}",
   "tap": "Touchez la carte là où vous pensez qu’il est, puis vérifiez.",
   "markers": "Choisir parmi les repères",
   "useMap": "Touchez plutôt la carte",
   "markerHint": "Quel repère est {{name}} ?",
   "marker": "Repère {{letter}}",
   "check": "Vérifier",
   "found": "Trouvé",
   "missed": "Pas tout à fait : {{name}} est marqué en vert.",
   "landmark": "POINT DE REPÈRE",
   "facts": "LE SAVIEZ-VOUS ?",
   "passport": "Passeport : {{done}} tampons sur {{total}}",
   "mapA11y": "Carte de l'Afrique. Touchez pour placer une épingle.",
   "pinA11y": "Votre épingle"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "ar": {
  "games": {
   "time-machine": {
    "tagline": "سافر إلى لحظات حقيقية في التاريخ ورتّب الأحداث.",
    "rules": {
     "r1": "كل محطة لحظة حقيقية في التاريخ، من مصر القديمة إلى سقوط جدار برلين. اقرأ بطاقة المتحف أولاً.",
     "r2": "أجب عن تحديين في كل محطة: سؤال، أو ترتيب الأحداث مع الأقدم في الأعلى.",
     "r3": "تأتي المستويات الأعلى بمحطات أكثر، وأحداث أقرب زمنياً، وأسئلة عن المؤرخين والمصادر، ومؤقت أقصر (ما لم يكن المؤقت مغلقاً).",
     "example": "استقلال غانا (1957) يأتي قبل تأسيس منظمة الوحدة الأفريقية (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "انقّب عن قطع أثرية حقيقية وسمِّ الحضارة التي صنعتها.",
    "rules": {
     "r1": "اكشف مربعات الحفرة لتجد القطع الأثرية. كل اكتشاف يأتي مع دليل من علم الآثار الحقيقي.",
     "r2": "سمِّ الحضارة التي تركتها، ثم أجب عن سؤال عنها.",
     "r3": "من المستوى فوق المتوسط تصبح الأدلة أدق والإجابات الخاطئة من المنطقة نفسها؛ وفي الأعلى ترى اكتشافين فقط.",
     "example": "رؤوس من الطين المشوي بعيون مثلثة وخبث صهر الحديد، من وسط نيجيريا: ثقافة نوك."
    }
   },
   "africa-explorer": {
    "tagline": "اعثر على جميع دول أفريقيا على الخريطة وتعلّم تاريخها.",
    "rules": {
     "r1": "اضغط على الخريطة حيث تظن أن الدولة موجودة، ثم تحقق. تفضّل عدم الضغط؟ استخدم «اختر من العلامات» بدلاً من ذلك.",
     "r2": "ثم زُر معلمها، واقرأ حقيقتين، وأجب عن سؤال عنها.",
     "r3": "تخفي المستويات الأعلى تلميح المنطقة، وتتطلب ضغطة أدق، وتأتي بدول أصغر.",
     "example": "نيجيريا في غرب أفريقيا، على خليج غينيا، حيث يلتقي نهرا النيجر وبنوي."
    }
   }
  },
  "quiz": {
   "timeUp": "انتهى الوقت",
   "stop": "المحطة {{n}} من {{total}}",
   "challenge": "التحدي {{n}} من 2",
   "next": "التالي",
   "nextStop": "المحطة التالية",
   "finish": "عرض النتائج"
  },
  "order": {
   "keys": "على الحاسوب: مفاتيح الأرقام تختار سطراً، و↑ و↓ تحرّكه، وEnter يتحقق.",
   "youHad": "وضعت هذا في الرقم {{n}}",
   "bc": "{{year}} ق.م",
   "ad": "{{year}} م"
  },
  "timeline": {
   "label": "بطاقة المتحف",
   "a11y": "الخط الزمني لهذه الرحلة: {{list}}",
   "now": "أنت هنا"
  },
  "excavation": {
   "trench": "الحفرة {{n}} من {{total}}",
   "uncover": "اكشف المربعات لتجد القطع الأثرية.",
   "square": "المربع {{n}}: احفر هنا",
   "empty": "المربع {{n}}: تراب فقط",
   "foundA11y": "المربع {{n}}: عُثر على {{name}}",
   "found": "{{done}} من {{total}} اكتشافات",
   "digAll": "اكشف الكل",
   "identify": "سمِّ الحضارة",
   "who": "أي حضارة تركت هذه؟",
   "finds": "الاكتشافات",
   "about": "عنها"
  },
  "atlas": {
   "find": "اعثر على {{name}}",
   "hint": "تلميح: {{region}}",
   "tap": "اضغط على الخريطة حيث تظن أنها موجودة، ثم تحقق.",
   "markers": "اختر من العلامات",
   "useMap": "اضغط على الخريطة بدلاً من ذلك",
   "markerHint": "أي علامة هي {{name}}؟",
   "marker": "علامة {{letter}}",
   "check": "تحقق",
   "found": "وجدته",
   "missed": "ليس تمامًا: {{name}} مُعلَّم بالأخضر.",
   "landmark": "معلم بارز",
   "facts": "هل تعلم؟",
   "passport": "جواز السفر: {{done}} من {{total}} أختام",
   "mapA11y": "خريطة أفريقيا. اضغط لوضع دبوس.",
   "pinA11y": "دبوسك"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "sw": {
  "games": {
   "time-machine": {
    "tagline": "Safiri hadi matukio halisi ya historia na panga matukio kwa mpangilio.",
    "rules": {
     "r1": "Kila kituo ni tukio halisi la kihistoria, kuanzia Misri ya kale hadi kuanguka kwa Ukuta wa Berlin. Soma lebo ya makumbusho kwanza.",
     "r2": "Jibu changamoto mbili katika kila kituo: swali, au kupanga matukio kwa mpangilio huku la mapema likiwa juu.",
     "r3": "Viwango vya juu huleta vituo zaidi, matukio yaliyo karibu zaidi kwa wakati, maswali kuhusu wanahistoria na vyanzo, na saa fupi (isipokuwa kipima muda kimezimwa).",
     "example": "Uhuru wa Ghana (1957) huja kabla ya kuanzishwa kwa Umoja wa Nchi Huru za Afrika (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Chimbua mabaki halisi na taja ustaarabu uliovitengeneza.",
    "rules": {
     "r1": "Fichua miraba ya mtaro ili kupata mabaki ya kale. Kila ugunduzi huja na kidokezo kutoka akiolojia halisi.",
     "r2": "Taja ustaarabu ulioviacha, kisha jibu swali kuhusu huo.",
     "r3": "Kuanzia ngazi ya kati-juu vidokezo hufichika zaidi na majibu yasiyo sahihi hutoka sehemu hiyo hiyo ya dunia; kwenye ngazi ya juu unaona mabaki mawili tu.",
     "example": "Vichwa vya terakota vyenye macho ya pembe tatu na takataka za kuyeyusha chuma, kutoka katikati mwa Nigeria: utamaduni wa Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Pata nchi zote za Afrika kwenye ramani na jifunze historia yao.",
    "rules": {
     "r1": "Gusa ramani unapodhani nchi iko, kisha angalia. Hupendi kugusa? Tumia “Chagua kutoka alama” badala yake.",
     "r2": "Kisha tembelea alama yake maarufu, soma ukweli mbili na jibu swali kuhusu hiyo.",
     "r3": "Viwango vya juu huficha kidokezo cha eneo, huhitaji kugusa kwa karibu zaidi na huleta nchi ndogo zaidi.",
     "example": "Nigeria iko Afrika Magharibi, kwenye Ghuba ya Guinea, ambapo mito Niger na Benue hukutana."
    }
   }
  },
  "quiz": {
   "timeUp": "Muda umeisha",
   "stop": "Kituo {{n}} kati ya {{total}}",
   "challenge": "Changamoto {{n}} kati ya 2",
   "next": "Ifuatayo",
   "nextStop": "Kituo kinachofuata",
   "finish": "Ona matokeo"
  },
  "order": {
   "keys": "Kwenye kompyuta: funguo za nambari huchagua mstari, ↑ na ↓ huusogeza, Enter hukagua.",
   "youHad": "Uliiweka hii nambari {{n}}",
   "bc": "{{year}} KK",
   "ad": "BK {{year}}"
  },
  "timeline": {
   "label": "LEBO YA MAKUMBUSHO",
   "a11y": "Mstari wa wakati wa safari hii: {{list}}",
   "now": "Uko hapa"
  },
  "excavation": {
   "trench": "MTARO {{n}} KATI YA {{total}}",
   "uncover": "Fichua miraba ili kupata mabaki.",
   "square": "Mraba {{n}}: chimba hapa",
   "empty": "Mraba {{n}}: udongo tu",
   "foundA11y": "Mraba {{n}}: {{name}} imepatikana",
   "found": "{{done}} kati ya {{total}} ugunduzi",
   "digAll": "Fichua yote",
   "identify": "Taja ustaarabu",
   "who": "Ni ustaarabu upi ulioviacha hivi?",
   "finds": "MABAKI",
   "about": "KUHUSU WAO"
  },
  "atlas": {
   "find": "Pata {{name}}",
   "hint": "Kidokezo: {{region}}",
   "tap": "Gusa ramani unapodhani iko, kisha angalia.",
   "markers": "Chagua kutoka alama",
   "useMap": "Gusa ramani badala yake",
   "markerHint": "Ni alama ipi ni {{name}}?",
   "marker": "Alama {{letter}}",
   "check": "Angalia",
   "found": "Umeipata",
   "missed": "Sio sawa: {{name}} imewekwa alama ya kijani.",
   "landmark": "ALAMA YA ARDHI",
   "facts": "JE, UNAJUA?",
   "passport": "Pasipoti: {{done}} kati ya {{total}} mihuri",
   "mapA11y": "Ramani ya Afrika. Gusa kuweka pini.",
   "pinA11y": "Pini yako"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "pt": {
  "games": {
   "time-machine": {
    "tagline": "Viaja a momentos reais da história e ordena os acontecimentos.",
    "rules": {
     "r1": "Cada paragem é um momento real da história, do antigo Egito à queda do Muro de Berlim. Lê primeiro a legenda do museu.",
     "r2": "Responde a dois desafios em cada paragem: uma pergunta, ou ordenar acontecimentos com o mais antigo no topo.",
     "r3": "Os níveis mais altos trazem mais paragens, acontecimentos mais próximos no tempo, perguntas sobre historiadores e fontes, e um relógio mais curto (a menos que o temporizador esteja desligado).",
     "example": "A independência do Gana (1957) vem antes da fundação da Organização da Unidade Africana (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Escava artefactos reais e nomeia a civilização que os fez.",
    "rules": {
     "r1": "Revela os quadrados da trincheira para encontrar os artefactos. Cada descoberta vem com uma pista da arqueologia real.",
     "r2": "Nomeia a civilização que os deixou, depois responde a uma pergunta sobre ela.",
     "r3": "A partir do nível intermédio-alto as pistas tornam-se mais subtis e as respostas erradas vêm da mesma parte do mundo; no topo vês apenas duas descobertas.",
     "example": "Cabeças de terracota com olhos triangulares e escória de fundição de ferro, do centro da Nigéria: a cultura Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Encontra todos os países de África no mapa e aprende a sua história.",
    "rules": {
     "r1": "Toca no mapa onde achas que está o país, depois verifica. Preferes não tocar? Usa «Escolher entre marcadores».",
     "r2": "Depois visita o seu marco, lê dois factos e responde a uma pergunta sobre ele.",
     "r3": "Os níveis mais altos escondem a pista da região, exigem um toque mais preciso e trazem países mais pequenos.",
     "example": "A Nigéria está na África Ocidental, no Golfo da Guiné, onde os rios Níger e Benue se encontram."
    }
   }
  },
  "quiz": {
   "timeUp": "Tempo esgotado",
   "stop": "Paragem {{n}} de {{total}}",
   "challenge": "Desafio {{n}} de 2",
   "next": "Seguinte",
   "nextStop": "Próxima paragem",
   "finish": "Ver resultados"
  },
  "order": {
   "keys": "No computador: as teclas numéricas escolhem uma linha, ↑ e ↓ movem-na, Enter verifica.",
   "youHad": "Colocaste isto no número {{n}}",
   "bc": "{{year}} a.C.",
   "ad": "{{year}} d.C."
  },
  "timeline": {
   "label": "LEGENDA DO MUSEU",
   "a11y": "Linha do tempo desta viagem: {{list}}",
   "now": "Estás aqui"
  },
  "excavation": {
   "trench": "TRINCHEIRA {{n}} DE {{total}}",
   "uncover": "Revela os quadrados para encontrar os artefactos.",
   "square": "Quadrado {{n}}: escavar aqui",
   "empty": "Quadrado {{n}}: apenas terra",
   "foundA11y": "Quadrado {{n}}: {{name}} encontrado",
   "found": "{{done}} de {{total}} descobertas",
   "digAll": "Revelar tudo",
   "identify": "Nomeia a civilização",
   "who": "Que civilização deixou isto?",
   "finds": "DESCOBERTAS",
   "about": "SOBRE ELES"
  },
  "atlas": {
   "find": "Encontra {{name}}",
   "hint": "Pista: {{region}}",
   "tap": "Toca no mapa onde achas que está, depois verifica.",
   "markers": "Escolher entre marcadores",
   "useMap": "Toque no mapa em vez disso",
   "markerHint": "Qual marcador é {{name}}?",
   "marker": "Marcador {{letter}}",
   "check": "Verificar",
   "found": "Encontrado",
   "missed": "Quase: {{name}} está marcado a verde.",
   "landmark": "MARCO",
   "facts": "SABIAS QUE?",
   "passport": "Passaporte: {{done}} de {{total}} carimbos",
   "mapA11y": "Mapa de África. Toca para colocar um alfinete.",
   "pinA11y": "O teu alfinete"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 },
 "es": {
  "games": {
   "time-machine": {
    "tagline": "Viaja a momentos reales de la historia y ordena los acontecimientos.",
    "rules": {
     "r1": "Cada parada es un momento real de la historia, del antiguo Egipto a la caída del Muro de Berlín. Lee primero la cartela del museo.",
     "r2": "Responde a dos retos en cada parada: una pregunta o poner acontecimientos en orden, con el más antiguo arriba.",
     "r3": "Los niveles superiores traen más paradas, acontecimientos más próximos en el tiempo, preguntas sobre historiadores y fuentes, y un reloj más corto (salvo que el temporizador esté desactivado).",
     "example": "La independencia de Ghana (1957) es anterior a la fundación de la Organización para la Unidad Africana (1963)."
    }
   },
   "lost-civilization": {
    "tagline": "Excava artefactos reales y nombra la civilización que los creó.",
    "rules": {
     "r1": "Descubre las casillas de la trinchera para encontrar los artefactos. Cada hallazgo incluye una pista de arqueología real.",
     "r2": "Nombra la civilización que los dejó y responde a una pregunta sobre ella.",
     "r3": "Desde Intermedio alto las pistas son más sutiles y las respuestas incorrectas vienen de la misma parte del mundo; en el nivel superior solo ves dos hallazgos.",
     "example": "Cabezas de terracota con ojos triangulares y escoria de fundición de hierro, del centro de Nigeria: la cultura Nok."
    }
   },
   "africa-explorer": {
    "tagline": "Encuentra todos los países de África en el mapa y aprende su historia.",
    "rules": {
     "r1": "Toca el mapa donde creas que está el país y comprueba. ¿Prefieres no tocar? Usa «Elegir entre marcadores».",
     "r2": "Luego visita su lugar emblemático, lee dos datos y responde a una pregunta sobre él.",
     "r3": "Los niveles superiores ocultan la pista de la región, exigen un toque más preciso y traen países más pequeños.",
     "example": "Nigeria está en África Occidental, en el golfo de Guinea, donde se unen los ríos Níger y Benue."
    }
   }
  },
  "quiz": {
   "timeUp": "Se acabó el tiempo",
   "stop": "Parada {{n}} de {{total}}",
   "challenge": "Reto {{n}} de 2",
   "next": "Siguiente",
   "nextStop": "Siguiente parada",
   "finish": "Ver resultados"
  },
  "order": {
   "keys": "En un ordenador: las teclas numéricas eligen una línea, ↑ y ↓ la mueven, Intro comprueba.",
   "youHad": "La pusiste en el número {{n}}",
   "bc": "{{year}} a. C.",
   "ad": "{{year}} d. C."
  },
  "timeline": {
   "label": "CARTELA DEL MUSEO",
   "a11y": "Cronología de este recorrido: {{list}}",
   "now": "Estás aquí"
  },
  "excavation": {
   "trench": "TRINCHERA {{n}} DE {{total}}",
   "uncover": "Descubre las casillas para encontrar los artefactos.",
   "square": "Casilla {{n}}: excava aquí",
   "empty": "Casilla {{n}}: solo tierra",
   "foundA11y": "Casilla {{n}}: {{name}} encontrado",
   "found": "{{done}} de {{total}} hallazgos",
   "digAll": "Descubrir todo",
   "identify": "Nombra la civilización",
   "who": "¿Qué civilización dejó esto?",
   "finds": "HALLAZGOS",
   "about": "SOBRE ELLOS"
  },
  "atlas": {
   "find": "Encuentra {{name}}",
   "hint": "Pista: {{region}}",
   "tap": "Toca el mapa donde creas que está y comprueba.",
   "markers": "Elegir entre marcadores",
   "useMap": "Toca el mapa en su lugar",
   "markerHint": "¿Qué marcador es {{name}}?",
   "marker": "Marcador {{letter}}",
   "check": "Comprobar",
   "found": "Encontrado",
   "missed": "Casi: {{name}} está marcado en verde.",
   "landmark": "PUNTO DE REFERENCIA",
   "facts": "¿SABÍAS QUE?",
   "passport": "Pasaporte: {{done}} de {{total}} sellos",
   "mapA11y": "Mapa de África. Toca para colocar un marcador.",
   "pinA11y": "Tu marcador"
  },
  "review": {
   "era": "{{title}} ({{when}})"
  }
 }
} } as const;

let added = false;
/** Adds the words to i18next once (deep-merged into the namespace, so nothing else is replaced). */
export function addHistoryText() {
  if (added) return;
  added = true;
  for (const [lang, words] of Object.entries(HISTORY_TEXT)) i18n.addResourceBundle(lang, 'history', words, true, false);
}
addHistoryText();
