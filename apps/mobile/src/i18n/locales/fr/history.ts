/** Knowzone World Museum of Time (French): walking around the museum, its stations and the History & Geography games. */
import type { Translation } from '../../types';
import type en from '../en/history';

const history: Translation<typeof en> = {
  title: 'Musée du Temps',
  entryEyebrow: 'HISTOIRE & GÉOGRAPHIE · NOUVEAU',
  entryTitle: 'Musée du Temps',
  entryBody: 'Voyage dans l’histoire, déterre des cités perdues et explore l’Afrique',
  leave: 'Quitter le musée',
  offline: 'Le Musée du Temps a besoin d’une connexion Internet, car chaque réponse est vérifiée sur notre serveur.',
  result: {
    back: 'Retour au musée',
  },
  hall: {
    walkTo: 'Aller vers : {{station}}',
    you: 'Toi, l’explorateur',
    open: 'Entrer : {{station}}',
    goHere: 'Aller ici',
    stars: '{{count}} étoiles sur {{max}}',
    tip: 'Marche vers une exposition pour lancer un jeu. Touche un nom pour y aller.',
  },
  stations: {
    timemachine: 'Machine à voyager dans le temps',
    dig: 'Civilisations perdues',
    maptable: 'Carte de l’Afrique',
  },
  games: {
    'time-machine': {
      name: 'Machine à remonter l’histoire',
      how: 'Voyage vers de vrais moments de l’histoire, des pyramides à l’indépendance du Nigeria. Explore chaque époque et relève ses défis.',
    },
    'lost-civilization': {
      name: 'Civilisation perdue',
      how: 'Déterre des objets sur des sites anciens, lis les indices et nomme la civilisation qui les a créés pour débloquer sa cité.',
    },
    'africa-explorer': {
      name: 'Explorateur d’Afrique',
      how: 'Trouve des pays sur la carte de l’Afrique, visite leurs monuments célèbres et récolte un tampon de passeport pour chacun.',
    },
  },
  time: {
    objective: 'Époque {{n}} sur {{total}} : {{title}}',
    travelling: 'Voyage vers {{when}}…',
    spot: 'Marche vers un point lumineux pour trouver un défi.',
    challenge: 'DÉFI {{n}} SUR {{total}}',
    nextEra: 'Époque suivante',
    order: {
      earliest: 'LE PLUS ANCIEN',
      latest: 'LE PLUS RÉCENT',
      up: 'Placer « {{item}} » plus tôt',
      down: 'Placer « {{item}} » plus tard',
      check: 'Vérifier l’ordre',
      right: 'Chronologie parfaite ! +{{points}}',
      wrong: 'Pas tout à fait. Voici le bon ordre.',
    },
  },
  dig: {
    objective: 'Fouille {{n}} sur {{total}}',
    spot: 'Zone de fouille {{n}}',
    dig: 'Creuser',
    tap: 'Touche pour creuser avec soin',
    digA11y: 'Creuser ici',
    found: 'OBJET TROUVÉ',
    finds: '{{done}} objets sur {{total}}',
    collect: 'Récupérer',
    solve: 'Résoudre le mystère',
    unlocked: 'Cité débloquée !',
    cities: '{{count}} cités débloquées sur {{total}}',
    next: 'Fouille suivante',
  },
  africa: {
    objective: 'Étape {{n}} sur {{total}}',
    find: 'Trouve {{name}} sur la carte',
    hint: 'Indice : {{region}}',
    tap: 'Touche l’endroit où tu penses qu’il se trouve, puis vérifie.',
    check: 'Vérifier',
    found: 'Trouvé ! +{{points}}',
    missed: 'Pas tout à fait. {{name}} se trouve ici.',
    visit: 'Visiter : {{landmark}}',
    passport: 'PASSEPORT',
    stamp: '{{name}} tamponné',
    facts: 'LE SAVAIS-TU ?',
    question: 'QUESTION',
    next: 'Pays suivant',
    mapA11y: 'Carte de l’Afrique. Touche pour placer une épingle.',
  },
};

export default history;
