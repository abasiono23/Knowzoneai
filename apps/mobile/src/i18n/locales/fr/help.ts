import type { Translation } from '../../types';
import type en from '../en/help';

const help: Translation<typeof en> = {
  ui: {
    searchPlaceholder: 'Rechercher dans l’aide',
    searchLabel: 'Rechercher dans l’aide',
    clearSearch: 'Effacer la recherche',
    draftBanner:
      'Brouillon à faire relire par un conseiller juridique avant le lancement public. Le texte peut changer.',
    danger:
      'Si quelqu’un est en danger immédiat, appelle le <strong>112</strong> ou préviens tout de suite un adulte de confiance.',
    includeDevice: 'Inclure les infos de l’appareil',
    eyebrow: 'CENTRE D’AIDE',
    safetyEyebrow: 'SÉCURITÉ',
    readGuidelines: 'Lire les Règles de la communauté',
    contactSupport: 'Contacter le support',
    reportContent: 'Signaler un contenu',
  },
  tickets: {
    kind: {
      support: 'Support',
      bug: 'Signalement de bug',
      feedback: 'Avis',
      report: 'Signalement de sécurité',
      copyright: 'Droits d’auteur',
      appeal: 'Contestation',
    },
    status: {
      open: 'Ouverte',
      waiting: 'En attente de ta réponse',
      resolved: 'Résolue',
    },
    rowLabel: '{{subject}}, {{status}}',
    lastFromSupport: 'Knowzone : {{text}}',
    lastFromMe: 'Toi : {{text}}',
    loadError: 'Impossible de charger tes demandes',
    title: 'Tes demandes',
    filters: { all: 'Toutes', open: 'Ouvertes', resolved: 'Résolues' },
    emptyTitle: 'Rien ici',
    emptyBody:
      'Les messages, signalements de bug et signalements que tu envoies apparaissent ici pour que tu puisses les suivre.',
  },
  centre: {
    eyebrow: 'SUPPORT',
    title: 'Centre d’aide',
    greeting: 'Salut {{name}}, comment pouvons-nous t’aider ?',
    greetingAnonymous: 'Salut, comment pouvons-nous t’aider ?',
    openRequests: 'Tes demandes ouvertes',
    actions: {
      contact: { title: 'Contacter le support', body: 'Réponse sous 1 jour ouvré' },
      bug: { title: 'Signaler un bug', body: 'Quelque chose ne marche pas ?' },
      feedback: { title: 'Donner ton avis', body: 'Idées et suggestions' },
      report: { title: 'Signaler un contenu', body: 'Dangereux ou inapproprié' },
    },
    browse: 'Parcourir par thème',
    popular: 'Questions fréquentes',
    allFaqs: 'Toutes les FAQ',
    safetyLegal: 'Sécurité et mentions légales',
    links: {
      guidelines: 'Règles de la communauté',
      blocked: 'Joueurs et contenus bloqués',
      ai: 'Limites et fiabilité de l’IA',
      terms: 'Conditions d’utilisation',
      privacy: 'Politique de confidentialité',
      copyright: 'Droits d’auteur et signalement de contenu',
    },
    viewAll: 'Voir toutes tes demandes ({{count}})',
  },
  faq: {
    title: 'FAQ',
    all: 'Tout',
    results_one: '{{count}} résultat',
    results_other: '{{count}} résultats',
    results_many: '{{count}} résultats',
    helpfulQuestion: 'Est-ce que ça a répondu à ta question ?',
    gladItHelped: 'Content que ça t’ait aidé !',
    askTeam: 'Désolé. Demande à notre équipe →',
    noResultsTitle: 'Aucune réponse pour « {{query}} »',
    noResultsBody: 'Essaie d’autres mots, ou demande directement à notre équipe.',
    stillNeedHelp: 'Besoin d’aide encore ?',
    categories: {
      start: 'Premiers pas',
      ai: 'Tuteur IA et outils de révision',
      videos: 'Vidéos',
      courses: 'Cours et certificats',
      world: 'Knowzone World et récompenses',
      account: 'Compte et confidentialité',
      payments: 'Forfaits et paiements',
      safety: 'Sécurité et signalements',
      teachers: 'Pour les enseignants',
    },
    items: {
      'what-is': {
        q: 'Qu’est-ce que Knowzone AI ?',
        a: 'Knowzone transforme tes notes, tes PDF et tes sujets en résumés, cartes mémoire, quiz et courtes vidéos explicatives, avec un tuteur IA pour tes questions et Knowzone World pour apprendre en jouant.',
      },
      'first-pack': {
        q: 'Comment créer mon premier pack de révision ?',
        a: 'Appuie sur Créer (l’onglet +), puis colle tes notes, importe un fichier, choisis un sujet ou une vidéo. Knowzone prépare un résumé, des cartes mémoire et un quiz. Un pack de révision utilise 1 crédit IA, et seulement s’il est créé avec succès.',
      },
      streaks: {
        q: 'Comment fonctionnent les séries ?',
        a: 'Apprends quelque chose dans la journée (une leçon, un quiz, un niveau ou une séance de révision) et ta série augmente d’un jour. Si tu rates un jour, elle repart à zéro, sauf si tu as un gel de série.',
      },
      credits: {
        q: 'C’est quoi, les crédits IA ?',
        a: 'Les crédits servent aux tâches IA plus importantes : un pack de révision coûte 1 crédit et une vidéo explicative de 1 à 5, selon sa durée. Les nouveaux comptes reçoivent {{welcome}}. Chaque invitation rapporte {{referral}}, et Plus ajoute {{plusMonthly}} par mois. Les crédits ne sont utilisés que si la génération réussit.',
      },
      'tutor-limit': {
        q: 'Combien de questions puis-je poser au tuteur ?',
        a: 'Les comptes gratuits ont droit à {{tutorFree}} questions au tuteur par jour, Plus à {{tutorPlus}} et Pro à {{tutorPro}}. Le compteur se remet à zéro à minuit. Les questions au tuteur n’utilisent pas de crédits IA.',
      },
      'ai-wrong': {
        q: 'L’IA s’est trompée. Que faire ?',
        a: 'L’IA peut faire des erreurs, surtout pour les calculs, l’actualité récente et les détails très précis du programme. Vérifie les infos importantes dans ton manuel ou auprès de ton prof, et utilise « Signaler un problème » sur la réponse ou la vidéo pour qu’on puisse corriger.',
      },
      'ai-data': {
        q: 'Mes fichiers importés servent-ils à entraîner l’IA ?',
        a: 'Non, sauf si tu actives « Aider à améliorer Knowzone AI » dans Paramètres → Confidentialité. C’est désactivé par défaut. Tes fichiers servent à créer ton matériel de révision.',
      },
      'video-length': {
        q: 'Pourquoi je ne peux pas choisir une vidéo de 3 ou 5 minutes ?',
        a: 'Les vidéos explicatives plus longues font partie de Knowzone Plus et Pro. Les comptes gratuits peuvent créer des vidéos de 30 secondes et de 1 minute.',
      },
      'video-failed': {
        q: 'Ma vidéo n’a pas fini de se générer',
        a: 'Ouvre-la depuis Mes vidéos et appuie sur Réessayer. Aucun crédit n’est débité pour une vidéo qui échoue.',
      },
      certificate: {
        q: 'Comment obtenir un certificat ?',
        a: 'Termine toutes les leçons d’un cours. Ton certificat apparaît dans Profil → Mes certificats, où tu peux le télécharger ou le partager.',
      },
      'course-progress': {
        q: 'Ma progression dans les cours est-elle enregistrée ?',
        a: 'Oui. Reprends là où tu t’étais arrêté depuis Accueil ou Profil → Mes cours.',
      },
      coins: {
        q: 'Que puis-je faire avec les pièces ?',
        a: 'Dépense tes pièces dans la boutique Récompenses pour des objets d’avatar, des cadres de profil, des titres et des gels de série. Les pièces ne peuvent pas être échangées contre de l’argent ou des crédits IA.',
      },
      'leaderboard-privacy': {
        q: 'Puis-je me cacher des classements ?',
        a: 'Oui. Dans Knowzone World → Paramètres, désactive les classements ou affiche-toi comme explorateur anonyme.',
      },
      password: {
        q: 'J’ai oublié mon mot de passe',
        a: 'Sur l’écran de connexion, appuie sur « Mot de passe oublié ? » et nous t’enverrons par e-mail un code à 6 chiffres pour en créer un nouveau.',
      },
      export: {
        q: 'Comment télécharger mes données ?',
        a: 'Paramètres → Télécharger mes données te donne tout ce que nous avons sur toi sous forme de fichier, ou un lien par e-mail.',
      },
      delete: {
        q: 'Comment supprimer mon compte ?',
        a: 'Paramètres → Supprimer le compte. Tu as 14 jours pour changer d’avis : te reconnecter annule la suppression. Ensuite, ton compte et tes données sont supprimés définitivement.',
      },
      refund: {
        q: 'Puis-je être remboursé ?',
        a: 'Ton premier paiement pour un forfait est remboursé en totalité si tu le demandes dans les 7 jours. Va dans Paramètres → Remboursements et aide au paiement. Les renouvellements sont examinés au cas par cas.',
      },
      cancel: {
        q: 'Comment annuler mon abonnement ?',
        a: 'Paramètres → Abonnement → Annuler l’abonnement. Tu gardes ton forfait jusqu’à la fin de la période payée. Les forfaits App Store et Google Play s’annulent dans le store.',
      },
      transfer: {
        q: 'J’ai payé par virement bancaire mais mon forfait n’est pas actif',
        a: 'Les virements peuvent prendre quelques minutes. Ouvre Abonnement, appuie sur le paiement en attente et choisis « J’ai envoyé l’argent ». Si rien n’apparaît toujours, contacte l’aide au paiement avec ta référence.',
      },
      report: {
        q: 'Comment signaler quelque chose ?',
        a: 'Utilise « Signaler » sur une vidéo, une réponse du tuteur ou un joueur, ou va dans Aide → Signaler un contenu inapproprié. Un modérateur examine les signalements sous 24 heures, et la personne ne sait pas qui l’a signalée.',
      },
      block: {
        q: 'Comment bloquer quelqu’un ?',
        a: 'Dans un classement ou une liste d’amis, appuie sur ⋯ à côté du joueur et choisis Bloquer. Vous ne vous verrez plus dans les classements ni dans les duels. Gère les joueurs bloqués dans Paramètres → Joueurs et contenus bloqués.',
      },
      danger: {
        q: 'Quelqu’un est en danger',
        a: 'Si quelqu’un est en danger immédiat, appelle le 112 (numéro d’urgence au Nigeria) ou préviens tout de suite un adulte de confiance. Ensuite, signale-le-nous pour que nous puissions agir sur le compte.',
      },
      'class-code': {
        q: 'Comment les élèves rejoignent-ils ma classe ?',
        a: 'Partage le code de ta classe à 6 caractères. Les élèves le saisissent dans Knowzone et apparaissent tout de suite dans ta classe.',
      },
      'class-reports': {
        q: 'Quand les rapports de classe apparaissent-ils ?',
        a: 'Dès que les élèves commencent les exercices que tu as donnés. Chaque devoir affiche les scores et les sujets que les élèves trouvent les plus difficiles.',
      },
    },
  },
  contact: {
    title: 'Contacter le support',
    intro: 'Notre équipe lit chaque message et répond en général sous 1 jour ouvré, ici dans l’app.',
    topicQuestion: 'De quoi s’agit-il ?',
    topics: {
      account: 'Compte et connexion',
      learning: 'Leçons et cours',
      ai: 'Tuteur IA et outils de révision',
      payments: 'Forfaits et paiements',
      technical: 'L’app ne marche pas',
      safety: 'Problème de sécurité',
      other: 'Autre chose',
    },
    paymentsTip:
      'Pour les remboursements, les doubles débits et les forfaits manquants, passe par l’Aide au paiement : c’est plus rapide.',
    safetyTip:
      'Tu veux signaler une personne ou un contenu ? Utilise Signaler un contenu pour qu’un modérateur le voie en premier.',
    subject: 'Objet',
    subjectPlaceholder: 'Quelques mots sur le problème',
    suggestions: 'CECI PEUT T’AIDER',
    suggestion: '{{question}} →',
    message: 'Message',
    messagePlaceholder: 'Ce qui s’est passé, ce à quoi tu t’attendais, et ce que tu as déjà essayé',
    sendError: 'Impossible d’envoyer ton message. Réessaie.',
    send: 'Envoyer le message',
    footer:
      'Les réponses apparaissent dans Aide → Tes demandes. Ne partage jamais ton mot de passe : l’équipe Knowzone ne te le demandera jamais.',
  },
  feedback: {
    title: 'Donner ton avis',
    moods: {
      '1': 'Très mécontent',
      '2': 'Mécontent',
      '3': 'Correct',
      '4': 'Content',
      '5': 'J’adore',
    },
    areas: {
      tutor: 'Tuteur IA',
      packs: 'Packs de révision',
      videos: 'Vidéos',
      courses: 'Cours',
      world: 'Knowzone World',
      rewards: 'Récompenses',
      design: 'Design',
      new: 'Quelque chose de nouveau',
    },
    sendError: 'Impossible d’envoyer ton avis',
    thanksTitle: 'Merci !',
    thanksBody:
      'Chaque suggestion est lue par les personnes qui créent Knowzone. Tes idées orientent nos prochains projets.',
    seeRequests: 'Voir tes demandes',
    feelQuestion: 'Que penses-tu de Knowzone ?',
    aboutQuestion: 'De quoi s’agit-il ? (facultatif)',
    label: 'Ton avis',
    placeholderUnhappy: 'Qu’est-ce qui t’a frustré ? On aimerait le corriger.',
    placeholderHappy: 'Qu’est-ce que tu adores, et qu’est-ce qui rendrait Knowzone encore meilleur ?',
    send: 'Envoyer mon avis',
    bugFooter: 'Quelque chose ne marche pas ? <link>Signale plutôt un bug</link> pour que nos ingénieurs le voient.',
  },
  bug: {
    title: 'Signaler un bug',
    intro: 'Dis-nous ce qui ne va pas. Plus tu donnes de détails, plus vite on pourra corriger.',
    whatLabel: 'Qu’est-ce qui ne va pas ?',
    whatPlaceholder: 'ex. Le quiz se bloque à la question 3',
    whereQuestion: 'Où dans l’app ?',
    areas: {
      signIn: 'Connexion',
      home: 'Accueil',
      tutor: 'Tuteur IA',
      packs: 'Packs de révision',
      videos: 'Vidéos',
      courses: 'Cours',
      world: 'Knowzone World',
      payments: 'Paiements',
      other: 'Autre',
    },
    stepsLabel: 'Étapes pour reproduire le problème',
    stepsPlaceholder: '1. Ouvre un pack de révision\n2. Lance le quiz\n3. Réponds à la question 2…',
    expectedLabel: 'À quoi t’attendais-tu ? (facultatif)',
    expectedPlaceholder: 'ex. La question suivante devrait s’afficher',
    frequencyQuestion: 'À quelle fréquence ?',
    frequency: {
      always: 'À chaque fois',
      sometimes: 'Parfois',
      once: 'Une seule fois',
    },
    screenshotAdded: 'Capture d’écran ajoutée',
    addScreenshot: 'Ajouter une capture d’écran',
    addScreenshotOptional: 'Ajouter une capture d’écran (facultatif)',
    photosError: 'Impossible d’ouvrir tes photos. Tu peux quand même envoyer le signalement sans capture d’écran.',
    sendError: 'Impossible d’envoyer le signalement',
    send: 'Envoyer le signalement de bug',
  },
  report: {
    reasons: {
      bullying: 'Harcèlement ou intimidation',
      name: 'Nom ou avatar inapproprié',
      cheating: 'Triche dans les duels ou les classements',
      impersonation: 'Se fait passer pour quelqu’un d’autre',
      'underage-risk': 'Demande des infos personnelles ou un rendez-vous',
      inappropriate: 'Sexuel, violent ou inadapté aux élèves',
      harmful: 'Nuisible ou dangereux',
      hate: 'Haineux ou discriminatoire',
      incorrect: 'Information fausse ou trompeuse',
      spam: 'Spam ou arnaque',
      copyright: 'Copie le travail de quelqu’un',
      other: 'Autre chose',
    },
    types: {
      player: 'Un joueur',
      video: 'Une vidéo',
      'tutor-answer': 'Une réponse du tuteur',
      course: 'Un cours ou une leçon',
      other: 'Autre chose',
    },
    titleFor: {
      player: 'Signaler le joueur',
      video: 'Signaler la vidéo',
      'tutor-answer': 'Signaler la réponse',
      course: 'Signaler le cours',
      lesson: 'Signaler la leçon',
      'study-pack': 'Signaler le pack de révision',
      other: 'Signaler le contenu',
    },
    hideToggle: {
      video: 'Me masquer cette vidéo',
      'tutor-answer': 'Me masquer cette réponse',
      course: 'Me masquer ce cours',
      lesson: 'Me masquer cette leçon',
      'study-pack': 'Me masquer ce pack de révision',
      other: 'Me masquer ce contenu',
    },
    hiddenNow: {
      video: 'Cette vidéo est maintenant masquée pour toi',
      'tutor-answer': 'Cette réponse est maintenant masquée pour toi',
      course: 'Ce cours est maintenant masqué pour toi',
      lesson: 'Cette leçon est maintenant masquée pour toi',
      'study-pack': 'Ce pack de révision est maintenant masqué pour toi',
      other: 'Ce contenu est maintenant masqué pour toi',
    },
    sendError: 'Impossible d’envoyer ton signalement. Réessaie.',
    thanksTitle: 'Merci pour ton signalement',
    thanksBodyPlayer: 'Un modérateur l’examinera sous 24 heures. On ne lui dira pas qui a fait le signalement.',
    thanksBodyContent:
      'Un modérateur l’examinera sous 24 heures. On ne dira pas au créateur qui a fait le signalement.',
    reference: 'RÉFÉRENCE {{id}}',
    nextTitle: 'Et maintenant ?',
    next: {
      review: 'Un modérateur formé le vérifie selon nos Règles de la communauté',
      action: 'S’il enfreint les règles, nous le supprimons ou nous restreignons le compte',
      follow: 'Tu peux suivre le signalement dans Aide → Tes demandes',
      blocked: '{{name}} est bloqué. Tu peux le débloquer à tout moment dans Paramètres',
    },
    viewReport: 'Voir le signalement',
    whatQuestion: 'Que signales-tu ?',
    playerName: 'Nom du joueur',
    whichOne: 'Lequel ?',
    playerPlaceholder: 'Nom tel qu’il apparaît dans le classement',
    itemPlaceholder: 'Titre, ou endroit où tu l’as vu',
    wrongQuestion: 'Quel est le problème ?',
    copyrightLink: 'C’est ton œuvre ? Envoie plutôt une notification de droits d’auteur →',
    detailsLabel: 'Dis-nous en plus (facultatif)',
    detailsPlaceholder: 'Que s’est-il passé ? Quand ? Tout ce qui peut aider un modérateur à comprendre.',
    alsoBlock: 'Bloquer aussi {{name}}',
    alsoBlockHint: 'Vous ne vous verrez plus dans les classements ni dans les duels',
    hideHint: 'Il n’apparaîtra plus dans tes fils pendant notre examen',
    alsoBlockLabel: 'Bloquer aussi',
    hideLabel: 'Me le masquer',
    send: 'Envoyer le signalement',
  },
  blocked: {
    title: 'Bloqués et masqués',
    types: {
      video: 'Vidéo',
      course: 'Cours',
      lesson: 'Leçon',
      'study-pack': 'Pack de révision',
      'tutor-answer': 'Réponse du tuteur',
      player: 'Joueur',
      other: 'Contenu',
    },
    blockedOn: 'Bloqué le {{date}}',
    hiddenOn: '{{type}} · masqué le {{date}}',
    playersTab: 'Joueurs ({{count}})',
    contentTab: 'Contenus ({{count}})',
    playersIntro:
      'Les joueurs bloqués ne te voient pas, et tu ne les vois pas, dans les classements, les listes d’amis ou les duels de quiz. Ils ne sont pas prévenus.',
    contentIntro: 'Les vidéos et autres contenus que tu as masqués ou signalés n’apparaissent plus dans tes fils.',
    noPlayers: 'Aucun joueur bloqué',
    noContent: 'Rien de masqué',
    noPlayersHint: 'Appuie sur ⋯ à côté d’un joueur dans un classement pour le bloquer ou le signaler.',
    noContentHint: 'Utilise Signaler sur une vidéo ou une réponse pour la masquer.',
    unblock: 'Débloquer',
    show: 'Afficher',
    unblockTitle: 'Débloquer {{name}} ?',
    showTitle: 'Afficher à nouveau ?',
    unblockBody: 'Vous vous verrez à nouveau dans les classements et les duels. Cette personne ne sera pas prévenue.',
    showBody: 'Il pourra réapparaître dans tes fils. Ton signalement reste chez nos modérateurs.',
    showAgain: 'Afficher à nouveau',
  },
  ticket: {
    acks: {
      support:
        'Merci de nous avoir contactés. Un membre de l’équipe Knowzone te répondra ici, généralement sous 1 jour ouvré.',
      bug: 'Merci pour ton signalement. Nos ingénieurs examinent chaque bug. Nous mettrons à jour cette demande si nous avons besoin de précisions ou une fois le problème corrigé.',
      feedback:
        'Merci ! L’équipe produit lit chaque suggestion. Nous ne répondons pas à chacune, mais elles orientent ce que nous construisons.',
      report:
        'Merci d’aider à garder Knowzone sûr. Un modérateur examine les signalements sous 24 heures. La personne signalée ne sait pas qui l’a signalée.',
      copyright: 'Nous avons bien reçu ta notification et l’examinerons sous 3 jours ouvrés.',
      appeal:
        'Nous avons bien reçu ton recours. Un autre modérateur que celui qui a pris la décision l’examinera sous 3 jours ouvrés.',
    },
    eyebrow: 'DEMANDE',
    notFound: 'Nous n’avons pas trouvé cette demande.',
    eyebrowWithId: '{{kind}} · {{id}}',
    sendError: 'Envoi impossible. Réessaie.',
    updateError: 'Impossible de mettre à jour cette demande',
    created: 'Envoyé ! Garde ta référence <strong>{{id}}</strong>. Les réponses apparaîtront ici.',
    opened: 'Ouverte le {{date}}',
    support: 'SUPPORT KNOWZONE',
    detailsSent: 'DÉTAILS ENVOYÉS',
    meta: {
      app: 'App',
      platform: 'Appareil',
      screen: 'Écran',
      area: 'Où',
      frequency: 'Fréquence',
      type: 'Type d’élément',
      title: 'Élément',
      reason: 'Motif',
      rating: 'Note',
      reference: 'Référence',
      screenshot: 'Capture d’écran',
    },
    screenshotAttached: 'Capture d’écran jointe',
    replyToReopen: 'Réponds pour rouvrir cette demande',
    addDetails: 'Ajouter des détails',
    reply: 'Répondre',
    sendReply: 'Envoyer la réponse',
    solved: 'Mon problème est résolu',
  },
  legal: {
    lastUpdated: 'Dernière mise à jour : {{date}}',
    shortVersion: 'EN BREF',
    plainWords: 'EN TERMES SIMPLES',
    contents: 'Sommaire',
    reportSomething: 'Signaler quelque chose',
    reportWrongAnswer: 'Signaler une mauvaise réponse',
    related: 'VOIR AUSSI',
    copyrightLink: 'Droits d’auteur et signalement de contenu',
    docs: {
      terms: {
        title: 'Conditions d’utilisation',
        eyebrow: 'MENTIONS LÉGALES',
        summary: [
          'Tu dois avoir 13 ans ou plus, ou avoir l’autorisation d’un parent ou tuteur légal.',
          'Tes notes et fichiers importés restent à toi. Tu nous autorises à les traiter pour créer ton matériel de révision.',
          'L’IA peut se tromper. Vérifie les infos importantes avant de t’y fier.',
          'Les forfaits payants se renouvellent jusqu’à leur annulation ; les premiers paiements sont remboursables sous 7 jours.',
          'Sois gentil et honnête. Nous pouvons limiter ou suspendre les comptes qui enfreignent les règles.',
        ],
        sections: {
          who: {
            title: '1. Qui nous sommes et ces conditions',
            body: [
              'Knowzone AI (« Knowzone », « nous ») propose une app d’apprentissage alimentée par l’IA pour les élèves, les étudiants et les enseignants. Ces conditions sont un accord entre toi et Knowzone. En créant un compte ou en utilisant l’app, tu les acceptes.',
              'Si tu as moins de 18 ans, lis ces conditions avec un parent ou tuteur légal.',
            ],
          },
          account: {
            title: '2. Ton compte',
            body: ['Pour utiliser Knowzone, tu dois :'],
            bullets: [
              'Avoir au moins 13 ans, ou l’autorisation d’un parent ou tuteur légal',
              'Donner des informations exactes et garder ton mot de passe secret',
              'Utiliser un seul compte personnel. Un compte ne peut pas être partagé, vendu ni transféré',
              'Nous prévenir tout de suite si tu penses que quelqu’un d’autre utilise ton compte',
            ],
          },
          content: {
            title: '3. Ton contenu',
            body: [
              'Tu es propriétaire des notes, fichiers, questions et autres contenus que tu ajoutes (« ton contenu »). Tu nous autorises à stocker et traiter ton contenu uniquement pour faire fonctionner Knowzone pour toi : par exemple, pour créer des résumés, des cartes mémoire, des quiz et des vidéos.',
              'N’importe que des contenus que tu as le droit d’utiliser. N’importe pas les informations personnelles d’autres personnes sans leur autorisation.',
            ],
          },
          ai: {
            title: '4. Fonctions d’IA',
            body: [
              'Knowzone utilise l’intelligence artificielle pour générer des explications, des résumés, des quiz et des vidéos. Les résultats de l’IA peuvent être incomplets ou faux. C’est une aide pour réviser, pas un remplacement de tes enseignants, de tes manuels ou des consignes officielles des examens. Voir « Limites et fiabilité de l’IA » pour en savoir plus.',
              'Les comptes gratuits ont des limites quotidiennes (par exemple {{tutorFree}} questions au tuteur par jour). Les tâches IA plus importantes utilisent des crédits IA, qui n’ont aucune valeur monétaire.',
            ],
          },
          rules: {
            title: '5. Utiliser Knowzone de façon responsable',
            body: ['Tu t’engages à ne pas :'],
            bullets: [
              'Enfreindre les Règles de la communauté ou la loi',
              'Utiliser Knowzone pour tricher à des examens ou évaluations où ce n’est pas autorisé',
              'Harceler ou menacer d’autres utilisateurs, ni partager avec eux des contenus nuisibles',
              'Essayer de contourner les limites, aspirer les données du service ou perturber son fonctionnement',
              'Importer des contenus qui violent les droits d’auteur de quelqu’un d’autre',
            ],
          },
          paid: {
            title: '6. Forfaits, paiements et remboursements',
            body: [
              'Les forfaits payants sont facturés à l’avance. Les forfaits payés par carte ou via un store d’applications se renouvellent automatiquement jusqu’à ce que tu les annules ; les paiements par virement bancaire et USSD couvrent une seule période et ne se renouvellent pas. Tu peux annuler à tout moment et garder l’accès jusqu’à la fin de la période payée.',
              'Ton premier paiement pour un forfait est remboursé en totalité si tu le demandes dans les 7 jours. Les autres demandes de remboursement sont examinées au cas par cas et selon ce qu’exige la loi. Les achats sur l’App Store et Google Play suivent aussi les règles de remboursement du store.',
              'Nous te préviendrons à l’avance avant de changer le prix d’un forfait auquel tu es abonné.',
            ],
          },
          rewards: {
            title: '7. XP, pièces et récompenses',
            body: [
              'Les XP, pièces, séries, badges et autres récompenses font partie de l’expérience d’apprentissage. Ils n’ont aucune valeur monétaire et ne peuvent pas être vendus, transférés ni échangés contre de l’argent.',
            ],
          },
          moderation: {
            title: '8. Modération, restriction et suspension',
            body: [
              'Nous pouvons supprimer des contenus, restreindre des fonctions ou suspendre un compte qui enfreint ces conditions ou les Règles de la communauté, ou pour protéger les utilisateurs. Nous t’expliquerons pourquoi et comment contester. Les infractions graves ou répétées peuvent entraîner la fermeture du compte.',
            ],
          },
          ending: {
            title: '9. Fermer ton compte',
            body: [
              'Tu peux supprimer ton compte à tout moment dans Paramètres. La suppression prend effet après un délai de grâce de 14 jours, pendant lequel te reconnecter l’annule.',
            ],
          },
          liability: {
            title: '10. Notre responsabilité envers toi',
            body: [
              'Nous faisons tout pour que Knowzone reste disponible, exact et sûr, mais nous ne pouvons pas promettre qu’il sera toujours sans erreur ni interruption. Rien dans ces conditions ne limite les droits que tu as en vertu du droit nigérian de la protection des consommateurs.',
            ],
          },
          changes: {
            title: '11. Modifications et contact',
            body: [
              'Nous pouvons mettre à jour ces conditions. Si les changements sont importants, nous te préviendrons dans l’app avant qu’ils s’appliquent. Des questions ? Contacte-nous via Aide → Contacter le support dans l’app.',
              'Ces conditions sont régies par les lois de la République fédérale du Nigeria.',
            ],
          },
        },
      },
      privacy: {
        title: 'Politique de confidentialité',
        eyebrow: 'MENTIONS LÉGALES',
        summary: [
          'Nous ne vendons jamais tes données et il n’y a pas de pub dans les leçons.',
          'Nous utilisons tes données pour faire fonctionner Knowzone et personnaliser ton apprentissage.',
          'Ton contenu ne sert pas à entraîner l’IA, sauf si tu l’actives.',
          'Tu peux télécharger ou supprimer tes données à tout moment dans Paramètres.',
        ],
        sections: {
          scope: {
            title: '1. À propos de cette politique',
            body: [
              'Cette politique explique quelles données personnelles Knowzone collecte, pourquoi, et quels sont tes droits en vertu du Nigeria Data Protection Act 2023 (NDPA) et des autres lois qui s’appliquent à toi.',
            ],
          },
          collect: {
            title: '2. Ce que nous collectons',
            body: ['Nous collectons :'],
            bullets: [
              'Infos du compte : nom, e-mail, mot de passe (stocké de façon sécurisée, jamais en clair), méthode de connexion',
              'Profil et préférences d’apprentissage : classe, matières, objectifs, dates d’examen, langue',
              'Ton contenu : notes, fichiers, questions et le matériel de révision créé à partir d’eux',
              'Activité d’apprentissage : leçons, quiz, scores, XP, séries et temps passé',
              'Paiements : forfait, montant et statut. Les données de carte sont gérées par Flutterwave ou le store d’applications ; nous ne voyons jamais les numéros de carte complets',
              'Infos sur l’appareil et la session : type d’appareil, version de l’app et lieu de connexion approximatif, pour protéger ton compte',
              'Messages que tu nous envoies : demandes de support, signalements de bug, avis et signalements',
            ],
          },
          use: {
            title: '3. Comment nous les utilisons',
            body: ['Nous utilisons tes données pour :'],
            bullets: [
              'Fournir Knowzone et générer ton matériel de révision',
              'Personnaliser les recommandations, les révisions et les rappels',
              'Protéger les comptes et la communauté, y compris par la modération',
              'Traiter les paiements et fournir des reçus',
              'Répondre aux demandes de support et corriger les problèmes',
              'Améliorer le produit grâce à des statistiques qui ne t’identifient pas',
            ],
          },
          ai: {
            title: '4. Traitement par l’IA',
            body: [
              'Pour générer le matériel de révision et les réponses du tuteur, le texte concerné est envoyé à notre fournisseur d’IA (OpenAI) pour être traité. Il n’est pas utilisé pour entraîner ses modèles.',
              'Ton contenu ne sert à améliorer les fonctions d’IA propres à Knowzone que si tu actives « Aider à améliorer Knowzone AI » dans Paramètres → Confidentialité. C’est désactivé par défaut, et tu peux le désactiver à tout moment.',
            ],
          },
          share: {
            title: '5. Avec qui nous les partageons',
            body: [
              'Nous partageons des données uniquement avec les prestataires qui nous aident à faire fonctionner Knowzone (hébergement, traitement par l’IA, paiements, e-mail) dans le cadre de contrats qui les protègent, avec ton enseignant si tu rejoins sa classe (ta progression sur ses devoirs), et lorsque la loi l’exige. Nous ne vendons jamais de données personnelles.',
              'Certaines leçons contiennent des vidéos YouTube, lues dans le lecteur de YouTube. Knowzone utilise les services d’API YouTube pour trouver ces vidéos. En les regardant, tu acceptes les Conditions d’utilisation de YouTube (youtube.com/t/terms), et les Règles de confidentialité de Google (policies.google.com/privacy) s’appliquent aux données que YouTube collecte.',
            ],
          },
          children: {
            title: '6. Enfants et jeunes',
            body: [
              'Beaucoup de nos utilisateurs sont élèves ou étudiants. Les utilisateurs de moins de 13 ans ont besoin de l’autorisation d’un parent ou tuteur légal. Les classements n’affichent que les prénoms et les initiales, et tu peux t’y cacher. Les parents peuvent nous contacter pour consulter ou supprimer les données de leur enfant.',
            ],
          },
          keep: {
            title: '7. Combien de temps nous les gardons',
            body: [
              'Nous gardons tes données tant que ton compte est ouvert. Quand tu supprimes ton compte, nous supprimons tes données personnelles après le délai de grâce de 14 jours, sauf les données que la loi nous oblige à conserver (comme les justificatifs de paiement).',
            ],
          },
          rights: {
            title: '8. Tes droits',
            body: ['Tu peux :'],
            bullets: [
              'Accéder à tes données et les télécharger (Paramètres → Télécharger mes données)',
              'Corriger tes informations (Paramètres → Modifier le profil)',
              'Supprimer ton compte (Paramètres → Supprimer le compte)',
              'T’opposer à un traitement facultatif ou retirer ton consentement, par exemple pour l’amélioration de l’IA ou le marketing',
              'Porter plainte auprès de la Nigeria Data Protection Commission (NDPC)',
            ],
          },
          security: {
            title: '9. Sécurité',
            body: [
              'Nous protégeons tes données grâce au chiffrement pendant leur transfert, au stockage sécurisé des mots de passe et au contrôle des accès. Tu peux voir tes appareils et les déconnecter dans Paramètres → Appareils.',
            ],
          },
          contact: {
            title: '10. Contact',
            body: [
              'Pour toute question ou demande liée à la confidentialité, utilise Aide → Contacter le support dans l’app et choisis « Compte et confidentialité ».',
            ],
          },
        },
      },
      guidelines: {
        title: 'Règles de la communauté',
        eyebrow: 'SÉCURITÉ',
        summary: [
          'Sois gentil. Ici, tout le monde apprend.',
          'Sois honnête. Gagne tes XP, ne triche pas.',
          'Garde tes infos personnelles privées.',
          'Tu vois un problème ? Signale-le.',
        ],
        sections: {
          kind: {
            title: 'Sois gentil et respectueux',
            body: [
              'Pas de harcèlement, d’intimidation, de menaces, de haine ni de moqueries sur la façon dont quelqu’un apprend, son apparence ou ses origines.',
            ],
          },
          safe: {
            title: 'Reste prudent et adapté à ton âge',
            body: ['Ne partage pas et ne crée pas :'],
            bullets: [
              'De contenu sexuel, violent ou choquant',
              'De contenu qui encourage l’automutilation, la drogue ou les défis dangereux',
              'D’arnaques, de spam ou de liens vers des sites dangereux',
            ],
          },
          private: {
            title: 'Protège ta vie privée',
            body: [
              'Ne partage pas ton numéro de téléphone, ton adresse, ton emploi du temps scolaire ou tes mots de passe, ni ceux de quelqu’un d’autre. L’équipe Knowzone ne te demandera jamais ton mot de passe.',
            ],
          },
          honest: {
            title: 'Joue fair-play',
            body: [
              'Ne triche pas dans les duels ou les classements, n’utilise pas plusieurs comptes et n’utilise pas Knowzone pour tricher aux examens. Utilise l’IA pour comprendre, pas pour copier.',
            ],
          },
          names: {
            title: 'Noms et avatars',
            body: ['Choisis des noms et des avatars sympas, qui ne se font pas passer pour quelqu’un d’autre.'],
          },
          enforce: {
            title: 'Ce qui se passe si les règles ne sont pas respectées',
            body: [
              'Selon la gravité, nous pouvons supprimer du contenu, donner un avertissement, restreindre des fonctions comme les classements et les duels, ou suspendre le compte. Tu peux contester toute décision depuis l’écran Statut du compte.',
            ],
          },
          report: {
            title: 'Signalements',
            body: [
              'Signale des joueurs et des contenus avec « Signaler » ou depuis l’Aide. Les signalements sont confidentiels. Si quelqu’un est en danger immédiat, appelle d’abord le 112 ou préviens un adulte de confiance.',
            ],
          },
        },
      },
      ai: {
        title: 'Limites et fiabilité de l’IA',
        eyebrow: 'COMMENT L’IA FONCTIONNE ICI',
        summary: [
          'L’IA peut se tromper avec beaucoup d’assurance. Vérifie les infos importantes.',
          'Utilise-la en complément de tes enseignants, de tes manuels et du programme officiel.',
          'Tu as repéré une erreur ? Signale-la pour qu’on la corrige.',
        ],
        sections: {
          what: {
            title: 'Ce que fait notre IA',
            body: [
              'Knowzone utilise de grands modèles de langage (actuellement d’OpenAI) pour expliquer des sujets, répondre à des questions et transformer ton contenu en résumés, cartes mémoire, quiz et scripts de vidéos.',
            ],
          },
          limits: {
            title: 'Là où elle peut se tromper',
            body: ['Les résultats de l’IA peuvent :'],
            bullets: [
              'Contenir des erreurs factuelles, surtout dans les calculs, les dates et les chiffres',
              'Omettre des détails de ton programme ou de ton organisme d’examen (WAEC, NECO, JAMB)',
              'Mal lire l’écriture manuscrite, les photos floues ou les schémas complexes',
              'Ignorer des événements très récents ou des changements de programme',
              'Sembler sûrs d’eux même quand ils sont faux',
            ],
          },
          use: {
            title: 'Comment bien l’utiliser',
            bullets: [
              'Vérifie les faits, formules et réponses clés dans ton manuel ou auprès de ton prof',
              'Demande au tuteur de détailler son raisonnement étape par étape',
              'Utilise les quiz pour tester ta compréhension, pas comme des réponses officielles d’examen',
              'Ne compte pas sur Knowzone pour des conseils médicaux, juridiques ou de sécurité',
            ],
          },
          exams: {
            title: 'Examens et honnêteté',
            body: [
              'Knowzone sert à apprendre. L’utiliser pendant un examen ou un contrôle où ce n’est pas autorisé enfreint nos conditions et le règlement de ton école.',
            ],
          },
          safety: {
            title: 'Filtres de sécurité',
            body: [
              'Nous utilisons des filtres pour que les réponses restent adaptées à ton âge et au sujet, mais aucun filtre n’est parfait. Si tu vois quelque chose d’inapproprié, signale-le tout de suite.',
            ],
          },
          improve: {
            title: 'Tes données et l’IA',
            body: [
              'Tes fichiers importés servent à créer ton matériel de révision. Ils ne servent à améliorer l’IA de Knowzone que si tu l’actives dans Paramètres → Confidentialité.',
            ],
          },
        },
      },
    },
  },
  copyright: {
    eyebrow: 'MENTIONS LÉGALES',
    title: 'Droits d’auteur',
    steps: [
      'Envoie une notification avec les détails ci-dessous',
      'Nous l’examinons sous 3 jours ouvrés et retirons les contenus qui violent les droits',
      'Si un utilisateur l’a partagé, il est prévenu et peut envoyer une contre-notification s’il pense que nous nous trompons',
      'Les comptes qui enfreignent les droits à plusieurs reprises sont suspendus',
    ],
    sendError: 'Impossible d’envoyer ta notification. Réessaie.',
    receivedTitle: 'Notification reçue',
    receivedBody: 'Référence {{reference}}. Nous l’examinerons sous 3 jours ouvrés et répondrons à {{email}}.',
    intro:
      'Nous respectons le travail des créateurs. Les élèves ne doivent importer que des contenus qu’ils ont le droit d’utiliser. Si tu possèdes un contenu qui apparaît sur Knowzone sans autorisation, dis-le-nous ici.',
    howItWorks: 'Comment ça marche',
    privateNote:
      'Les notes et fichiers que les élèves importent pour leurs propres révisions sont privés et ne sont pas publiés pour les autres.',
    sendTitle: 'Envoyer une notification',
    name: 'Ton nom complet',
    email: 'E-mail',
    organisation: 'Organisation (facultatif)',
    organisationPlaceholder: 'Éditeur, école, entreprise',
    work: 'Ton œuvre',
    workPlaceholder: 'Décris l’œuvre originale, ex. titre du livre, édition et pages, ou un lien vers elle',
    location: 'Où elle apparaît sur Knowzone',
    locationPlaceholder: 'Titre de la vidéo ou du cours, un lien, ou l’endroit où tu l’as vue',
    statementLabel: 'Déclaration de bonne foi',
    statement:
      'Je crois de bonne foi que cette utilisation n’est autorisée ni par le titulaire des droits ni par la loi, et que les informations de cette notification sont exactes. Je suis le titulaire des droits ou je suis autorisé à agir en son nom.',
    send: 'Envoyer la notification',
    footer:
      'Un contenu faux ou nuisible qui ne concerne pas les droits d’auteur ? Utilise plutôt Signaler un contenu dans le Centre d’aide.',
  },
  accountStatus: {
    eyebrow: 'COMPTE',
    title: 'Statut du compte',
    appealError: 'Impossible d’envoyer ta contestation',
    goodTitle: 'Ton compte est en règle',
    goodBody:
      'Aucun avertissement, aucune restriction ni suspension. Merci de contribuer à faire de Knowzone un super endroit pour apprendre.',
    backToLearning: 'Retour à l’apprentissage',
    suspendedTitle: 'Ton compte est suspendu',
    limitedTitle: 'Certaines fonctions sont limitées',
    suspendedUntil: 'Suspendu jusqu’au {{date}}. Tout revient automatiquement ensuite.',
    limitedUntil: 'Limité jusqu’au {{date}}. Tout revient automatiquement ensuite.',
    suspendedReview: 'Jusqu’à l’examen par notre équipe. Tu peux contester ci-dessous.',
    limitedReview: 'Jusqu’à l’examen par notre équipe. Tu peux continuer à apprendre normalement.',
    why: 'POURQUOI',
    decision: 'Décision prise le {{date}} en application de nos Règles de la communauté.',
    cantWhileLimited: 'PENDANT LA LIMITATION, TU NE PEUX PAS',
    limits: {
      leaderboards: 'Apparaître dans les classements',
      battles: 'Lancer des duels de quiz avec tes amis',
      invites: 'Envoyer des invitations et des liens de parrainage',
      sharing: 'Partager des vidéos et des packs de révision',
    },
    stillWorks: 'Les leçons, le tuteur IA, les packs de révision et ta progression fonctionnent normalement',
    canStillDo: 'CE QUE TU PEUX ENCORE FAIRE',
    canDo: [
      'Contester la décision',
      'Contacter le support',
      'Télécharger tes données',
      'Ta progression, tes XP et tes certificats sont conservés en sécurité',
    ],
    appealPending: 'Contestation en cours d’examen',
    appealRejected: 'Contestation rejetée',
    appealPendingBody: 'Envoyée le {{date}}. Un autre modérateur l’examine sous 3 jours ouvrés.',
    appealRejectedBody: 'La décision initiale est maintenue. Contacte le support si quelque chose a changé.',
    viewAppeal: 'Voir la contestation {{id}}',
    appealTitle: 'Contester cette décision',
    appealIntro:
      'Explique pourquoi tu penses que c’est une erreur, ou ce qui a changé. Un autre modérateur l’examinera.',
    appealLabel: 'Ta contestation',
    sendAppeal: 'Envoyer la contestation',
    continue: 'Continuer vers Knowzone',
    helpCentre: 'Centre d’aide',
    downloadData: 'Télécharger mes données',
    logOut: 'Se déconnecter',
  },
};

export default help;
