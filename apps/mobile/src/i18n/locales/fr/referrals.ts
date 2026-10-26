import type { Translation } from '../../types';
import type en from '../en/referrals';

const referrals: Translation<typeof en> = {
  eyebrow: 'PARRAINAGE',
  inviteEyebrow: 'INVITER DES AMIS',
  errors: {
    load: 'Impossible de charger tes parrainages',
  },
  status: {
    pending: 'En attente',
    confirmed: 'Récompensé',
    rejected: 'Non éligible',
  },
  templates: {
    buddy: {
      label: 'Partenaire de révision',
      text: 'Je révise avec Knowzone AI : il transforme des notes en résumés, cartes mémoire et quiz en une minute. Inscris-toi avec mon code {{code}} et on reçoit tous les deux {{credits}} crédits IA gratuits : {{link}}',
    },
    exams: {
      label: 'Préparation aux examens',
      text: 'Réviser le WAEC/JAMB, c’est tellement plus simple avec Knowzone AI : quiz d’entraînement, tuteur IA et courtes leçons vidéo. Utilise mon code {{code}} pour {{credits}} crédits IA bonus : {{link}}',
    },
    game: {
      label: 'Knowzone World',
      text: 'Viens m’affronter dans Knowzone World ! 🪐 Duels de quiz, boss et énigmes, tout ça sur nos matières de l’école. Inscris-toi avec mon code {{code}} (+{{credits}} crédits IA chacun) : {{link}}',
    },
  },
  emailSubject: 'Révise avec moi sur Knowzone AI',
  milestones: {
    firstFriend: { title: 'Premier ami', reward: 'Badge Premier ami' },
    studyCircle: { title: 'Cercle de révision', reward: 'Badge Cercle de révision' },
    classCaptain: { title: 'Chef de classe', reward: 'Badge Chef de classe' },
    ambassador: { title: 'Ambassadeur Knowzone', reward: 'Badge Ambassadeur' },
  },
  invalid: {
    notFound: {
      title: 'On n’a pas trouvé ce code',
      body: 'Vérifie l’orthographe avec ton ami. Les codes font 6 à 8 lettres et chiffres, comme ADA2026.',
    },
    expired: {
      title: 'Cette invitation a expiré',
      body: 'Ce code faisait partie d’une campagne terminée. Demande plutôt à ton ami son code personnel : ceux-là n’expirent jamais.',
    },
    ownCode: {
      title: 'C’est ton propre code',
      body: 'Tu ne peux pas t’inviter toi-même, mais tu peux le partager avec tes amis depuis l’écran Inviter des amis.',
    },
    alreadyReferred: {
      title: 'Tu as déjà utilisé une invitation',
      body: 'Chaque nouveau compte peut utiliser un seul code d’invitation. Ton premier code est toujours actif.',
    },
    notNew: {
      title: 'Les invitations sont pour les nouveaux élèves',
      body: 'Les codes d’invitation ne fonctionnent qu’à la création d’un nouveau compte. Tu peux quand même inviter des amis avec ton propre code.',
    },
    capReached: {
      title: 'Ton ami a atteint la limite de ce mois-ci',
      body: 'Chaque élève peut gagner des récompenses pour 10 amis invités maximum par mois. Tu peux quand même t’inscrire ; le bonus ne s’appliquera simplement pas.',
    },
  },
  steps: {
    joined: 'Inscrit avec ton code',
    verified: 'A vérifié son e-mail',
    qualified: 'A terminé une première leçon, un quiz ou un niveau',
    reward: '+{{credits}} crédits IA chacun',
    waiting: 'En attente',
    paid: 'Versé',
  },
  dashboard: {
    title: 'Parrainage',
    headline: 'Offre {{credits}}, reçois {{credits}}',
    body: 'Quand un ami s’inscrit avec ton code et termine sa première leçon, son premier quiz ou son premier niveau, vous recevez tous les deux {{credits}} crédits IA.',
    codeA11y: 'Ton code {{code}}. Ouvrir le code et le lien',
    yourCode: 'TON CODE',
    copyCode: 'Copier le code',
    copy: 'COPIER',
    copied: 'COPIÉ',
    invite: 'Inviter des amis',
    shareCode: 'Partager mon code',
    pendingA11y: 'Ta récompense d’invitation en attente',
    pendingTitle: 'Ton bonus de bienvenue est en attente',
    pendingBody: 'Termine ta première leçon, ton premier quiz ou ton premier niveau pour débloquer +{{credits}} crédits grâce à l’invitation de {{name}}.',
    stats: {
      invited: 'invités',
      pending: 'en attente',
      rewarded: 'récompensés',
      credits: 'crédits',
    },
    thisMonth: 'Ce mois-ci',
    monthCount: '{{count}} récompenses sur {{cap}}',
    monthCap: 'Tu peux gagner des récompenses pour {{cap}} amis invités maximum par mois.',
    friends: 'Tes amis',
    seeProgress: 'Voir la progression',
    noFriends: 'Personne ne s’est encore inscrit avec ton code. Partage-le avec un camarade de classe pour commencer.',
    friendA11y: '{{name}}, {{status}}',
    joined: 'Inscrit le {{date}}',
    links: {
      history: 'Historique des récompenses',
      eligibility: 'Éligibilité',
      terms: 'Conditions',
    },
  },
  code: {
    title: 'Ton code',
    brand: 'KNOWZONE AI · INVITATION',
    codeA11y: 'Code {{code}}',
    credits: '{{credits}} crédits IA gratuits pour toi et ton ami',
    copyLinkA11y: 'Copier le lien {{link}}',
    codeCopied: 'Code copié',
    linkCopied: 'Lien copié',
    copyCode: 'Copier le code',
    copyLink: 'Copier le lien',
    moreWays: 'Autres façons d’inviter',
    howTitle: 'Comment ton ami l’utilise',
    how: {
      open: 'Il ouvre ton lien, ou télécharge Knowzone et appuie sur « Tu as un code d’invitation ? »',
      enter: 'Il saisit ton code en créant son compte.',
      finish: 'Il termine sa première leçon, son premier quiz ou son premier niveau de Knowzone World.',
      reward: 'Vous recevez tous les deux {{credits}} crédits IA, automatiquement.',
    },
    neverExpires: 'Ton code personnel n’expire jamais.',
  },
  invite: {
    title: 'Inviter des amis',
    intro: 'Choisis un message, puis la façon de l’envoyer. Ton code et ton lien sont ajoutés automatiquement.',
    preview: 'APERÇU DU MESSAGE',
    channels: {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'E-mail',
      copy: 'Copier le message',
      more: 'Autres applis',
    },
    sendWith: 'Envoyer avec {{channel}}',
    copied: 'Message copié. Colle-le où tu veux',
    cantOpen: 'Impossible d’ouvrir {{channel}} sur cet appareil',
    sent_one: 'Tu as envoyé {{count}} invitation depuis ce téléphone. Tes amis apparaissent sur ton tableau de bord dès qu’ils s’inscrivent.',
    sent_many:
      'Tu as envoyé {{count}} invitations depuis ce téléphone. Tes amis apparaissent sur ton tableau de bord dès qu’ils s’inscrivent.',
    sent_other:
      'Tu as envoyé {{count}} invitations depuis ce téléphone. Tes amis apparaissent sur ton tableau de bord dès qu’ils s’inscrivent.',
    noneSent: 'Tu n’as encore envoyé aucune invitation. Tes amis apparaissent sur ton tableau de bord dès qu’ils s’inscrivent.',
    privacy: 'N’invite que des personnes que tu connais. Knowzone ne lit jamais tes contacts et n’envoie jamais de messages à tes amis à ta place.',
  },
  progress: {
    title: 'Progression',
    milestones: 'Paliers',
    rewarded_one: '{{count}} ami récompensé',
    rewarded_many: '{{count}} amis récompensés',
    rewarded_other: '{{count}} amis récompensés',
    next_one: 'Encore {{count}} pour <b>{{title}}</b> · {{reward}}',
    next_many: 'Encore {{count}} pour <b>{{title}}</b> · {{reward}}',
    next_other: 'Encore {{count}} pour <b>{{title}}</b> · {{reward}}',
    allDone: 'Tous les paliers sont débloqués. Tu es un ambassadeur Knowzone !',
    all: 'Tous',
    filter: '{{label}} ({{count}})',
    empty: 'Aucun ami ici pour l’instant',
    emptyBody: 'Les amis qui s’inscrivent avec ton code apparaissent ici, avec chaque étape jusqu’à la récompense.',
    invite: 'Inviter des amis',
    remind: 'Rappelle à {{name}} de terminer une première leçon dans les 30 jours suivant son inscription.',
  },
  eligibility: {
    title: 'Éligibilité',
    fullTitle: 'Éligibilité et en attente',
    yourInvite: 'TON INVITATION',
    invitedBy: 'Invité par {{name}}',
    oneStep:
      'Plus qu’une étape : termine n’importe quelle leçon, quiz ou niveau de Knowzone World et {{name}} et toi recevrez chacun {{credits}} crédits IA.',
    verifyFirst: 'Vérifie d’abord ton e-mail, puis termine n’importe quelle leçon, quiz ou niveau.',
    play: 'Jouer',
    courses: 'Cours',
    done: 'C’est fait ! Ton bonus de bienvenue a été ajouté à tes crédits IA.',
    howQualify: 'Comment tes amis deviennent éligibles',
    rules: {
      new: 'Tes amis doivent être nouveaux sur Knowzone et utiliser ton code à l’inscription',
      verified: 'E-mail vérifié (ou connexion avec Google / Apple)',
      activity: 'Une première leçon, un quiz ou un niveau dans les 30 jours',
      cap: 'Jusqu’à {{cap}} amis récompensés par mois ({{count}} pour l’instant)',
    },
    capped: 'Tu as atteint la limite de ce mois-ci. De nouveaux amis peuvent encore s’inscrire ; les récompenses reprennent le mois prochain.',
    pending: 'Récompenses en attente ({{count}})',
    nothingPending: 'Rien en attente. Quand un ami s’inscrit, tu verras ici ce qu’il lui reste à faire.',
    daysLeft_one: 'Encore {{count}} jour pour être éligible',
    daysLeft_many: 'Encore {{count}} jours pour être éligible',
    daysLeft_other: 'Encore {{count}} jours pour être éligible',
    readTerms: 'Lire les conditions complètes',
  },
  history: {
    title: 'Historique des récompenses',
    creditsNow: 'Crédits IA actuels',
    fromInvites: 'grâce aux invitations',
    welcome: 'Crédits de bienvenue',
    inviter: '{{name}} s’est inscrit avec ton code',
    inviterUnknown: 'Un ami s’est inscrit avec ton code',
    invitee: 'Bonus d’invitation de {{name}}',
    inviteeUnknown: 'Bonus d’invitation d’un ami',
    plan: 'Crédits mensuels du forfait',
    used: 'Utilisé : {{name}}',
    usedAi: 'Utilisé pour la génération IA',
    plusA11y_one: '{{label}}, plus {{count}} crédit',
    plusA11y_many: '{{label}}, plus {{count}} crédits',
    plusA11y_other: '{{label}}, plus {{count}} crédits',
    minusA11y_one: '{{label}}, moins {{count}} crédit',
    minusA11y_many: '{{label}}, moins {{count}} crédits',
    minusA11y_other: '{{label}}, moins {{count}} crédits',
    note: 'Les crédits IA servent à générer des packs de révision, des vidéos et des réponses du tuteur. Ils sont distincts des pièces et ne peuvent pas être échangés contre de l’argent.',
  },
  terms: {
    title: 'Conditions du parrainage',
    intro: 'En bref : invite de vrais amis, aide-les à commencer à apprendre, et vous recevez tous les deux un bonus.',
    heading: '{{number}}. {{title}}',
    sections: {
      reward: {
        title: 'La récompense',
        points: {
          credits: 'Quand un ami s’inscrit avec ton code et devient éligible, vous recevez chacun {{credits}} crédits IA.',
          automatic: 'Les crédits sont ajoutés automatiquement. Tu n’as rien à réclamer.',
          noCash: 'Les crédits IA n’ont aucune valeur monétaire et ne peuvent pas être transférés, vendus ni échangés contre des pièces ou de l’argent.',
        },
      },
      qualifies: {
        title: 'Qui est éligible',
        points: {
          new: 'Ton ami doit créer un tout nouveau compte Knowzone et saisir ton code pendant l’inscription.',
          verify: 'Il doit vérifier son e-mail (ou se connecter avec Google ou Apple).',
          activity:
            'Il doit terminer une vraie activité d’apprentissage (une leçon de cours, un quiz ou un niveau de Knowzone World) dans les 30 jours suivant son inscription.',
          oneCode: 'Chaque nouveau compte peut utiliser un seul code d’invitation.',
        },
      },
      limits: {
        title: 'Limites',
        points: {
          monthly:
            'Tu peux gagner des récompenses pour 10 amis maximum par mois civil. Au-delà, tes amis peuvent quand même s’inscrire ; le bonus ne s’appliquera simplement pas.',
          campaign: 'Les codes de campagne (par exemple sur une affiche ou lors d’un événement) peuvent expirer. Les codes personnels, non.',
        },
      },
      fairUse: {
        title: 'Utilisation loyale',
        points: {
          self: 'Tu ne peux pas te parrainer toi-même, utiliser plusieurs comptes ni créer des comptes pour d’autres personnes.',
          device: 'Les parrainages venant du même appareil, ou qui semblent automatisés, sont marqués « non éligible ».',
          reverse:
            'Knowzone peut annuler les récompenses obtenues en enfreignant ces règles, et peut modifier ce programme en te prévenant dans l’appli.',
        },
      },
      privacy: {
        title: 'Confidentialité',
        points: {
          names:
            'Ton ami voit ton prénom et ton initiale. Tu vois les siens, ainsi que l’étape où il en est parmi celles ci-dessus.',
          contacts: 'Knowzone ne lit jamais tes contacts et n’envoie jamais de messages en ton nom.',
        },
      },
    },
    updated: 'Dernière mise à jour : 1er octobre 2026. Ces conditions s’ajoutent aux Conditions d’utilisation de Knowzone.',
    fullTerms: 'Conditions d’utilisation complètes',
  },
};

export default referrals;
